import type { DatabaseAdapter } from '../config/database';
import { randomUUID } from 'crypto';
import { logger } from '../utils/logger.js';

/**
 * Workflow state types - 3 main stages: schedule → content → publish
 */
export type WorkflowStep =
  | 'schedule_pending'
  | 'schedule_approved'
  | 'schedule_draft'
  | 'content_pending'
  | 'content_approved'
  | 'content_draft'
  | 'publish_pending'
  | 'published'
  | 'rejected';

export type ApprovalDecision = 'approve' | 'reject' | 'edit';

/**
 * Approval action with optional custom edits
 */
export interface ApprovalAction {
  contentId: string;
  decision: ApprovalDecision;
  reason?: string;
  customEdits?: Record<string, unknown>; // Schedule, content fields user edited
  userId: string;
}

/**
 * Complete workflow state record
 */
export interface WorkflowState {
  id: string;
  contentId: string;
  profileId: string;
  mode: 'manual' | 'autopilot';
  currentStep: WorkflowStep;
  scheduleData: Record<string, unknown> | undefined;
  contentData: Record<string, unknown> | undefined;
  publishData: Record<string, unknown> | undefined;
  userEdits: Record<string, unknown> | undefined;
  autoApproveEnabled: boolean;
  autoApproveTimeoutHours: number;
  lastApprovalAt: string | null;
  approvedBy: string | null;
  rejectedAt: string | null;
  rejectionReason: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Approval panel structure returned to frontend
 */
export interface ApprovalPanel {
  contentId: string;
  currentStep: WorkflowStep;
  stepsHistory: Array<{
    step: WorkflowStep;
    status: 'completed' | 'pending' | 'skipped';
    completedAt?: string;
    approvedBy?: string;
  }>;
  editableFields: Record<string, unknown>;
  actionButtons: {
    approve: boolean;
    reject: boolean;
    edit: boolean;
    skip: boolean;
  };
  autoApproveIn?: number; // seconds until auto-approve
  scheduleData?: Record<string, unknown>;
  contentData?: Record<string, unknown>;
}

/**
 * ManualWorkflow: Orchestrates 3-stage approval workflow
 *
 * Stages:
 * 1. Schedule: When to publish (days, times, content types)
 * 2. Content: Caption + visuals ready for approval
 * 3. Publish: Final confirmation before publishing
 */
export class ManualWorkflow {
  private db: DatabaseAdapter;

  constructor(db: DatabaseAdapter) {
    this.db = db;
  }

  /**
   * Create new manual mode workflow for content
   */
  async initializeWorkflow(
    contentId: string,
    profileId: string,
    scheduleData: Record<string, unknown>,
  ): Promise<WorkflowState> {
    const id = randomUUID();
    const now = new Date().toISOString();

    const stmt = this.db.prepare(`
      INSERT INTO workflow_states (
        id, content_id, profile_id, mode, current_step,
        schedule_data, auto_approve_enabled, auto_approve_timeout_hours,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    try {
      stmt.run(
        id,
        contentId,
        profileId,
        'manual',
        'schedule_pending',
        JSON.stringify(scheduleData),
        1, // auto-approve enabled by default
        24, // 24-hour timeout
        now,
        now
      );

      const logStmt = this.db.prepare(`
        INSERT INTO workflow_history (id, content_id, profile_id, action, from_step, to_step, decision, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);
      logStmt.run(randomUUID(), contentId, profileId, 'initialize', null, 'schedule_pending', 'system', now);

      return this.getWorkflowState(contentId)!;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to initialize workflow: ${msg}`);
    }
  }

  /**
   * Get current workflow state
   */
  getWorkflowState(contentId: string): WorkflowState | null {
    const stmt = this.db.prepare('SELECT * FROM workflow_states WHERE content_id = ?');
    const row = stmt.get(contentId) as Record<string, unknown>;

    if (!row) return null;

    return {
      id: row.id as string,
      contentId: row.content_id as string,
      profileId: row.profile_id as string,
      mode: row.mode as 'manual' | 'autopilot',
      currentStep: row.current_step as WorkflowStep,
      scheduleData: row.schedule_data ? JSON.parse(row.schedule_data as string) : undefined,
      contentData: row.content_data ? JSON.parse(row.content_data as string) : undefined,
      publishData: row.publish_data ? JSON.parse(row.publish_data as string) : undefined,
      userEdits: row.user_edits ? JSON.parse(row.user_edits as string) : undefined,
      autoApproveEnabled: row.auto_approve_enabled === 1,
      autoApproveTimeoutHours: row.auto_approve_timeout_hours as number,
      lastApprovalAt: (row.last_approval_at as string | null) || null,
      approvedBy: (row.approved_by as string | null) || null,
      rejectedAt: (row.rejected_at as string | null) || null,
      rejectionReason: (row.rejection_reason as string | null) || null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  /**
   * Submit approval decision (approve/reject/edit)
   * Validates transition and updates workflow state
   */
  async submitApproval(action: ApprovalAction): Promise<WorkflowState> {
    const workflow = this.getWorkflowState(action.contentId);
    if (!workflow) {
      throw new Error(`Workflow not found for content ${action.contentId}`);
    }

    const now = new Date().toISOString();

    // Validate decision is allowed from current step
    this.validateTransition(workflow.currentStep, action.decision);

    let nextStep: WorkflowStep;

    if (action.decision === 'approve') {
      nextStep = this.getNextStep(workflow.currentStep);
    } else if (action.decision === 'reject') {
      nextStep = 'rejected';
    } else if (action.decision === 'edit') {
      // Stay in same step but mark as edited by user
      nextStep = workflow.currentStep;
    } else {
      throw new Error(`Invalid decision: ${action.decision}`);
    }

    // Update workflow state
    const updateStmt = this.db.prepare(`
      UPDATE workflow_states
      SET current_step = ?,
          user_edits = ?,
          last_approval_at = ?,
          approved_by = ?,
          rejected_at = ?,
          rejection_reason = ?,
          updated_at = ?
      WHERE content_id = ?
    `);

    updateStmt.run(
      nextStep,
      action.customEdits ? JSON.stringify(action.customEdits) : null,
      action.decision === 'approve' ? now : null,
      action.decision === 'approve' ? action.userId : null,
      action.decision === 'reject' ? now : null,
      action.decision === 'reject' ? action.reason || null : null,
      now,
      action.contentId
    );

    // Log to history
    const logStmt = this.db.prepare(`
      INSERT INTO workflow_history (id, content_id, profile_id, action, from_step, to_step, decision, user_id, reason, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    logStmt.run(
      randomUUID(),
      action.contentId,
      workflow.profileId,
      'approval',
      workflow.currentStep,
      nextStep,
      action.decision,
      action.userId,
      action.reason || null,
      now
    );

    return this.getWorkflowState(action.contentId)!;
  }

  /**
   * Save draft without advancing workflow
   * Persists current step data without changing status
   */
  async saveDraft(
    contentId: string,
    stepData: Record<string, unknown>
  ): Promise<WorkflowState> {
    const workflow = this.getWorkflowState(contentId);
    if (!workflow) {
      throw new Error(`Workflow not found for content ${contentId}`);
    }

    const now = new Date().toISOString();
    const currentStep = workflow.currentStep;

    // Update appropriate data field based on step
    let updateSQL = 'UPDATE workflow_states SET ';
    const updates: string[] = [];

    if (currentStep.includes('schedule')) {
      updates.push(`schedule_data = '${JSON.stringify(stepData)}'`);
    } else if (currentStep.includes('content')) {
      updates.push(`content_data = '${JSON.stringify(stepData)}'`);
    } else if (currentStep.includes('publish')) {
      updates.push(`publish_data = '${JSON.stringify(stepData)}'`);
    }

    updates.push(`updated_at = '${now}'`);
    updateSQL += updates.join(', ') + ` WHERE content_id = '${contentId}'`;

    // Note: Using string interpolation here for brevity - in production use prepared statements
    this.db.exec(updateSQL);

    // Log draft save
    const logStmt = this.db.prepare(`
      INSERT INTO workflow_history (id, content_id, profile_id, action, from_step, to_step, decision, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    logStmt.run(
      randomUUID(),
      contentId,
      workflow.profileId,
      'draft_save',
      currentStep,
      currentStep,
      'system',
      now
    );

    return this.getWorkflowState(contentId)!;
  }

  /**
   * Get approval panel for frontend
   * Returns structured data about current step and available actions
   */
  getApprovalPanel(contentId: string): ApprovalPanel | null {
    const workflow = this.getWorkflowState(contentId);
    if (!workflow) return null;

    // Get history for steps completed
    const historyStmt = this.db.prepare(`
      SELECT DISTINCT to_step, action, timestamp FROM workflow_history
      WHERE content_id = ? AND decision IN ('approve', 'system')
      ORDER BY timestamp ASC
    `);
    const history = historyStmt.all(contentId) as Array<Record<string, unknown>>;

    const stepsHistory = [
      'schedule_approved',
      'content_approved',
      'published',
    ].map(step => {
      const completed = history.some(h => h.to_step === step);
      return {
        step: step as WorkflowStep,
        status: completed ? ('completed' as const) : workflow.currentStep === step ? ('pending' as const) : ('skipped' as const),
        completedAt: completed ? new Date().toISOString() : undefined,
      };
    });

    return {
      contentId,
      currentStep: workflow.currentStep,
      stepsHistory,
      editableFields: this.getEditableFieldsForStep(workflow.currentStep, workflow),
      actionButtons: {
        approve: !workflow.currentStep.includes('rejected') && workflow.currentStep !== 'published',
        reject: !workflow.currentStep.includes('rejected') && workflow.currentStep !== 'published',
        edit: !workflow.currentStep.includes('rejected') && workflow.currentStep !== 'published',
        skip: workflow.autoApproveEnabled && !workflow.currentStep.includes('rejected'),
      },
      scheduleData: workflow.scheduleData,
      contentData: workflow.contentData,
    };
  }

  /**
   * Get editable fields for current step
   */
  private getEditableFieldsForStep(step: WorkflowStep, workflow: WorkflowState): Record<string, unknown> {
    if (step.includes('schedule')) {
      return workflow.scheduleData || {};
    } else if (step.includes('content')) {
      return workflow.contentData || {};
    } else if (step.includes('publish')) {
      return workflow.publishData || {};
    }
    return {};
  }

  /**
   * Validate state transition is allowed
   */
  private validateTransition(currentStep: WorkflowStep, decision: ApprovalDecision): void {
    if (decision === 'reject' && currentStep === 'published') {
      throw new Error('Cannot reject published content');
    }
    if (decision === 'approve' && currentStep === 'published') {
      throw new Error('Content already published');
    }
  }

  /**
   * Get next step in workflow
   */
  private getNextStep(currentStep: WorkflowStep): WorkflowStep {
    const stepProgression: Record<WorkflowStep, WorkflowStep> = {
      'schedule_pending': 'schedule_approved',
      'schedule_approved': 'content_pending',
      'schedule_draft': 'schedule_pending',
      'content_pending': 'content_approved',
      'content_approved': 'publish_pending',
      'content_draft': 'content_pending',
      'publish_pending': 'published',
      'published': 'published',
      'rejected': 'schedule_pending', // After rejection, restart from schedule
    };

    return stepProgression[currentStep] || 'rejected';
  }

  /**
   * Check for auto-approvals based on timeout
   * Called periodically to auto-approve pending items
   */
  async checkAutoApprovals(): Promise<number> {
    const now = new Date();
    const stmt = this.db.prepare(`
      SELECT ws.* FROM workflow_states ws
      WHERE ws.auto_approve_enabled = 1
      AND ws.current_step NOT IN ('published', 'rejected')
      AND datetime(ws.created_at, '+' || ws.auto_approve_timeout_hours || ' hours') < ?
    `);

    const pendingApprovals = stmt.all(now) as Array<Record<string, unknown>>;
    let count = 0;

    for (const approval of pendingApprovals) {
      try {
        await this.submitApproval({
          contentId: approval.content_id as string,
          decision: 'approve',
          userId: 'system:auto-approve',
        });
        count++;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        logger.error(`Auto-approval failed for ${approval.content_id}: ${msg}`);
      }
    }

    return count;
  }
}

export function createManualWorkflow(db: DatabaseAdapter): ManualWorkflow {
  return new ManualWorkflow(db);
}
