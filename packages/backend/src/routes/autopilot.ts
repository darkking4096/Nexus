import { Router, Response } from 'express';
import type { DatabaseAdapter } from '../config/database';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';
import { AutopilotService, CreateAutopilotPayload, UpdateAutopilotPayload } from '../services/AutopilotService.js';

/**
 * Autopilot Routes
 * POST /api/profiles/{profileId}/autopilot - Create config
 * GET /api/profiles/{profileId}/autopilot - Read config
 * POST /api/profiles/{profileId}/autopilot/toggle - Toggle enable/disable
 * PUT /api/profiles/{profileId}/autopilot - Update config (for future use)
 * DELETE /api/profiles/{profileId}/autopilot - Delete config (for future use)
 */

export function createAutopilotRoutes(db: DatabaseAdapter): Router {
  const router = Router({ mergeParams: true });
  const autopilotService = new AutopilotService(db);

  /**
   * POST /api/profiles/{profileId}/autopilot
   * Create autopilot configuration
   * Request body: { enabled, days, times }
   */
  router.post('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const payload: CreateAutopilotPayload = req.body;

      // Validate payload
      if (payload.enabled === undefined || !payload.days || !payload.times) {
        res.status(400).json({
          error: 'Missing required fields: enabled (boolean), days (array), times (array)',
        });
        return;
      }

      const result = autopilotService.createAutopilot(profileId, payload);

      if ('error' in result) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(200).json({
        status: 'active',
        config_id: result.config_id,
        config: result.config,
      });
    } catch (error) {
      console.error('Error creating autopilot config:', error);
      res.status(500).json({ error: 'Failed to create autopilot configuration' });
    }
  });

  /**
   * GET /api/profiles/{profileId}/autopilot
   * Retrieve autopilot configuration for profile
   */
  router.get('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;

      const config = autopilotService.readAutopilot(profileId);

      if (!config) {
        res.status(404).json({ error: 'Autopilot configuration not found for this profile' });
        return;
      }

      res.status(200).json(config);
    } catch (error) {
      console.error('Error reading autopilot config:', error);
      res.status(500).json({ error: 'Failed to retrieve autopilot configuration' });
    }
  });

  /**
   * POST /api/profiles/{profileId}/autopilot/toggle
   * Toggle autopilot enable/disable without losing configuration
   * Query param: enabled=true|false
   */
  router.post('/toggle', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const { enabled } = req.query;

      // Validate enabled parameter
      if (enabled === undefined) {
        res.status(400).json({ error: 'Query parameter "enabled" is required (true or false)' });
        return;
      }

      const enabledBool = enabled === 'true';

      const result = autopilotService.toggleAutopilot(profileId, enabledBool);

      if ('error' in result) {
        res.status(404).json({ error: result.error });
        return;
      }

      res.status(200).json({
        status: enabledBool ? 'active' : 'inactive',
        config: result.config,
      });
    } catch (error) {
      console.error('Error toggling autopilot:', error);
      res.status(500).json({ error: 'Failed to toggle autopilot' });
    }
  });

  /**
   * PUT /api/profiles/{profileId}/autopilot
   * Update autopilot configuration (days, times, enabled)
   */
  router.put('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const payload: UpdateAutopilotPayload = req.body;

      const result = autopilotService.updateAutopilot(profileId, payload);

      if ('error' in result) {
        res.status(400).json({ error: result.error });
        return;
      }

      res.status(200).json({
        status: 'updated',
        config: result.config,
      });
    } catch (error) {
      console.error('Error updating autopilot config:', error);
      res.status(500).json({ error: 'Failed to update autopilot configuration' });
    }
  });

  /**
   * DELETE /api/profiles/{profileId}/autopilot
   * Delete autopilot configuration
   */
  router.delete('/', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;

      const result = autopilotService.deleteAutopilot(profileId);

      if ('error' in result) {
        res.status(404).json({ error: result.error });
        return;
      }

      res.status(200).json({ status: 'deleted', success: true });
    } catch (error) {
      console.error('Error deleting autopilot config:', error);
      res.status(500).json({ error: 'Failed to delete autopilot configuration' });
    }
  });

  return router;
}

export default createAutopilotRoutes;
