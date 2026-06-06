import { Router, Request, Response } from 'express';
import { MachineService } from '../services/machineService';

export function createMachineRoutes(machineService: MachineService): Router {
  const router = Router();

  // GET /machines - List all machines with latest metrics
  router.get('/', async (_req: Request, res: Response) => {
    try {
      const machines = await machineService.getAllMachines();
      res.json(machines);
    } catch (error) {
      console.error('Error fetching machines:', error);
      res.status(500).json({ error: 'Failed to fetch machines' });
    }
  });

  // GET /machines/:id - Get single machine detail
  router.get('/:id', async (req: Request, res: Response) => {
    try {
      const machine = await machineService.getMachineById(req.params.id as string);

      if (!machine) {
        res.status(404).json({ error: 'Machine not found' });
        return;
      }

      res.json(machine);
    } catch (error) {
      console.error('Error fetching machine:', error);
      res.status(500).json({ error: 'Failed to fetch machine' });
    }
  });

  return router;
}
