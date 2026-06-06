import { Router, Request, Response } from 'express';
import { DashboardService } from '../services/dashboardService';

export function createDashboardRoutes(dashboardService: DashboardService): Router {
  const router = Router();

  // GET /dashboard - Get dashboard KPI data
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const data = await dashboardService.getDashboard();
      res.json(data);
    } catch (error) {
      console.error('Error fetching dashboard:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  });

  return router;
}
