import { Router, Response } from 'express';
import Database from 'better-sqlite3';
import { ReportService } from '../services/ReportService.js';
import { verifyAccessToken, AuthRequest } from '../middleware/authMiddleware.js';

export function createReportsRoutes(db: Database.Database): Router {
  const router = Router();
  const reportService = new ReportService(db);

  /**
   * GET /api/reports/:profileId
   * Generate performance report for a profile
   * Query params:
   *   - period: 'week' | 'month' (default: month)
   *   - start_date: ISO date string (optional, calculated from period if not provided)
   *   - end_date: ISO date string (optional, defaults to today)
   */
  router.get('/:profileId', verifyAccessToken, async (req: AuthRequest, res: Response) => {
    try {
      const { profileId } = req.params;
      const userId = req.userId!;
      const period = (req.query.period as string) || 'month';
      let startDate = (req.query.start_date as string) || null;
      const endDate = (req.query.end_date as string) || new Date().toISOString().split('T')[0];

      // If dates not provided, calculate based on period
      if (!startDate) {
        const today = new Date(endDate);
        let periodStart: Date;

        if (period === 'week') {
          // Last 7 days
          periodStart = new Date(today);
          periodStart.setDate(periodStart.getDate() - 7);
        } else if (period === 'month') {
          // Current month (1st to today)
          periodStart = new Date(today.getFullYear(), today.getMonth(), 1);
        } else {
          return res.status(400).json({ error: 'Invalid period. Use "week" or "month"' });
        }

        startDate = periodStart.toISOString().split('T')[0];
      }

      // Validate dates
      if (new Date(startDate) > new Date(endDate)) {
        return res.status(400).json({ error: 'start_date must be before end_date' });
      }

      const report = await reportService.generateReport(profileId, userId, startDate, endDate);

      res.json(report);
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);
      console.error('[Reports] Report generation error:', msg);

      if (msg.includes('Access denied')) {
        return res.status(403).json({ error: msg });
      }

      if (msg.includes('not found')) {
        return res.status(404).json({ error: msg });
      }

      res.status(500).json({ error: 'Failed to generate report' });
    }
  });

  return router;
}
