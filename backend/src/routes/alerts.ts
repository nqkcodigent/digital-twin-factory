import { Router, Request, Response } from 'express';
import { AlertService } from '../services/alertService';

export function createAlertRoutes(alertService: AlertService): Router {
  const router = Router();

  // GET /alerts - List all alerts
  router.get('/', async (req: Request, res: Response) => {
    try {
      const { resolved } = req.query;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;

      const options: { resolved?: boolean; limit?: number } = {};
      if (resolved === 'true') options.resolved = true;
      if (resolved === 'false') options.resolved = false;
      if (limit) options.limit = limit;

      const alerts = await alertService.getAlerts(options);
      res.json(alerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  });

  return router;
}
