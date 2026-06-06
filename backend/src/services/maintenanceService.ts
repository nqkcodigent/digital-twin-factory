import prisma from '../prisma/client';

const PRIORITY_ORDER: Record<string, number> = { high: 0, medium: 1, low: 2 };

export class MaintenanceService {
  async getTickets(status?: string) {
    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    const tickets = await prisma.maintenanceTicket.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true, type: true },
        },
        assignedUser: {
          select: { id: true, name: true, email: true },
        },
        logs: {
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: [
        { priority: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    // Sort by priority (high first, then medium, then low)
    return tickets.sort(
      (a: typeof tickets[0], b: typeof tickets[0]) => (PRIORITY_ORDER[a.priority] ?? 99) - (PRIORITY_ORDER[b.priority] ?? 99)
    );
  }

  async createTicket(data: {
    machineId: string;
    issue: string;
    priority?: string;
    assignedTo?: string;
  }) {
    const ticket = await prisma.maintenanceTicket.create({
      data: {
        machineId: data.machineId,
        issue: data.issue,
        priority: data.priority || 'medium',
        status: 'open',
        assignedTo: data.assignedTo || null,
      },
      include: {
        machine: { select: { id: true, name: true, type: true } },
        assignedUser: { select: { id: true, name: true } },
      },
    });

    // Update machine status to maintenance if priority is high
    if (data.priority === 'high') {
      await prisma.machine.update({
        where: { id: data.machineId },
        data: { status: 'maintenance' },
      }).catch(() => { /* machine may already be in maintenance */ });
    }

    return ticket;
  }

  async updateTicketStatus(id: string, status: string) {
    const ticket = await prisma.maintenanceTicket.update({
      where: { id },
      data: { status },
    });

    // If completed, add a log entry and restore machine to running
    if (status === 'completed') {
      await prisma.maintenanceLog.create({
        data: {
          maintenanceTicketId: ticket.id,
          machineId: ticket.machineId,
          description: 'Maintenance completed',
          action: 'Issue resolved',
          performedBy: 'System',
        },
      });

      await prisma.machine.update({
        where: { id: ticket.machineId },
        data: { status: 'running' },
      }).catch(() => {});
    }

    return ticket;
  }
}
