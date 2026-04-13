import { Response, Router } from 'express';
import Database from 'better-sqlite3';
import { ManualWorkflow, ApprovalAction } from '../services/ManualWorkflow.js';
import { logger } from '../utils/logger.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

/**
 * Manual workflow routes: generate, approve, get approval panel
 */
export function createWorkflowRoutes(db: Database.Database): Router {
  const router = Router();
  const workflow = new ManualWorkflow(db);

  /**
   * POST /api/content/generate
   * Initiate manual mode content generation
   *
   * Request Body:
   * {
   *   "profile_id": "prof_123",
   *   "mode": "manual",
   *   "schedule": {
   *     "publish_dates": ["2026-04-14", "2026-04-15"],
   *     "content_types": ["feed", "carousel"],
   *     "posting_times": ["10:00", "18:00"]
   *   }
   * }
   *
   * Response: HTTP 201
   * {
   *   "content_id": "content_123",
   *   "status": "schedule_pending",
   *   "approval_panel": { ... }
   * }
   */
  router.post(
    '/generate',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { profile_id, mode = 'manual', schedule } = req.body;

        // Validation
        if (!profile_id) {
          res.status(400).json({ error: 'profile_id is required' });
          return;
        }

        if (mode !== 'manual') {
          res.status(400).json({ error: 'Only manual mode is supported in this endpoint' });
          return;
        }

        if (!schedule || typeof schedule !== 'object') {
          res.status(400).json({ error: 'schedule object is required' });
          return;
        }

        // Create content row
        const contentId = `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const now = new Date().toISOString();

        const contentStmt = db.prepare(`
          INSERT INTO content (
            id, profile_id, type, status, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?)
        `);

        contentStmt.run(contentId, profile_id, 'multi', 'draft', now, now);

        // Initialize workflow
        const workflowState = await workflow.initializeWorkflow(
          contentId,
          profile_id,
          schedule
        );

        const approvalPanel = workflow.getApprovalPanel(contentId);

        res.status(201).json({
          content_id: contentId,
          status: workflowState.currentStep,
          approval_panel: approvalPanel,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Error in /generate: ${msg}`);
        res.status(500).json({ error: 'Failed to generate content' });
      }
    }
  );

  /**
   * POST /api/content/{contentId}/approve
   * Submit approval decision (approve/reject/edit)
   *
   * Request Body:
   * {
   *   "decision": "approve" | "reject" | "edit",
   *   "reason": "optional rejection reason",
   *   "custom_edits": { ... custom fields user edited ... }
   * }
   *
   * Response: HTTP 200
   * {
   *   "status": "content_pending",
   *   "approval_panel": { ... }
   * }
   */
  router.post(
    '/:contentId/approve',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { contentId } = req.params;
        const { decision, reason, custom_edits } = req.body;

        // Validation
        if (!contentId) {
          res.status(400).json({ error: 'contentId is required' });
          return;
        }

        if (!decision || !['approve', 'reject', 'edit'].includes(decision)) {
          res.status(400).json({
            error: 'decision must be: approve, reject, or edit',
          });
          return;
        }

        // Submit approval
        const approval: ApprovalAction = {
          contentId,
          decision: decision as 'approve' | 'reject' | 'edit',
          reason,
          customEdits: custom_edits,
          userId: req.userId || 'unknown',
        };

        const updatedWorkflow = await workflow.submitApproval(approval);
        const approvalPanel = workflow.getApprovalPanel(contentId);

        res.json({
          status: updatedWorkflow.currentStep,
          approval_panel: approvalPanel,
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Error in /approve: ${msg}`);
        res.status(400).json({ error: msg });
      }
    }
  );

  /**
   * GET /api/content/{contentId}/approval-panel
   * Get current approval panel for content
   *
   * Response: HTTP 200
   * {
   *   "content_id": "content_123",
   *   "current_step": "schedule_pending",
   *   "steps_history": [ ... ],
   *   "editable_fields": { ... },
   *   "action_buttons": { ... },
   *   "schedule_data": { ... },
   *   "content_data": { ... }
   * }
   */
  router.get(
    '/:contentId/approval-panel',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { contentId } = req.params;

        if (!contentId) {
          res.status(400).json({ error: 'contentId is required' });
          return;
        }

        const panel = workflow.getApprovalPanel(contentId);

        if (!panel) {
          res.status(404).json({ error: 'Content or workflow not found' });
          return;
        }

        res.json(panel);
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Error in /approval-panel: ${msg}`);
        res.status(500).json({ error: 'Failed to get approval panel' });
      }
    }
  );

  /**
   * POST /api/content/{contentId}/draft
   * Save draft without advancing workflow
   *
   * Request Body:
   * {
   *   "step_data": { ... fields for current step ... }
   * }
   *
   * Response: HTTP 200
   * {
   *   "status": "current_step",
   *   "saved_at": "2026-04-13T10:30:00Z"
   * }
   */
  router.post(
    '/:contentId/draft',
    verifyAccessToken,
    async (req: AuthRequest, res: Response): Promise<void> => {
      try {
        const { contentId } = req.params;
        const { step_data } = req.body;

        if (!contentId) {
          res.status(400).json({ error: 'contentId is required' });
          return;
        }

        if (!step_data || typeof step_data !== 'object') {
          res.status(400).json({ error: 'step_data object is required' });
          return;
        }

        const updated = await workflow.saveDraft(contentId, step_data);

        res.json({
          status: updated.currentStep,
          saved_at: new Date().toISOString(),
        });
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Error in /draft: ${msg}`);
        res.status(400).json({ error: msg });
      }
    }
  );

  return router;
}
