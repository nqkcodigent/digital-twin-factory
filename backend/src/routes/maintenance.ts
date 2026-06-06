import { Router, Request, Response } from 'express';
import { MaintenanceService } from '../services/maintenanceService';

export function createMaintenanceRoutes(maintenanceService: MaintenanceService): Router {
  const router = Router();

  // GET /maintenance-tickets - List all maintenance tickets
  router.get('/', async (req: Request, res: Response) => {
    try {
      const status = req.query.status as string | undefined;
      const tickets = await maintenanceService.getTickets(status);
      res.json(tickets);
    } catch (error) {
      console.error('Error fetching tickets:', error);
      res.status(500).json({ error: 'Failed to fetch maintenance tickets' });
    }
  });

  // POST /maintenance-tickets - Create a new maintenance ticket
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { machineId, issue, priority, assignedTo } = req.body;

      if (!machineId || !issue) {
        res.status(400).json({ error: 'machineId and issue are required' });
        return;
      }

      const ticket = await maintenanceService.createTicket({
        machineId,
        issue,
        priority,
        assignedTo,
      });

      res.status(201).json(ticket);
    } catch (error) {
      console.error('Error creating ticket:', error);
      res.status(500).json({ error: 'Failed to create maintenance ticket' });
    }
  });

  // PATCH /maintenance-tickets/:id - Update ticket status
  router.patch('/:id', async (req: Request, res: Response) => {
    try {
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ error: 'status is required' });
        return;
      }

      const ticket = await maintenanceService.updateTicketStatus(req.params.id as string, status);
      res.json(ticket);
    } catch (error) {
      console.error('Error updating ticket:', error);
      res.status(500).json({ error: 'Failed to update ticket' });
    }
  });

  return router;
}
