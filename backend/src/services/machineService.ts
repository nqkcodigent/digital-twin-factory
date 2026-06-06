import prisma from '../prisma/client';
import { SimulationService } from './simulation';

export class MachineService {
  constructor(private simulationService: SimulationService) {}

  async getAllMachines() {
    const machines = await prisma.machine.findMany({
      include: {
        workshop: {
          include: { factory: true },
        },
        _count: {
          select: {
            alerts: { where: { resolved: false } },
            maintenanceTickets: { where: { status: { not: 'completed' } } },
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    // Attach real-time state from simulation
    return machines.map((m: typeof machines[0]) => ({
      ...m,
      realtime: this.simulationService.getMachineState(m.id) || null,
    }));
  }

  async getMachineById(id: string) {
    const machine = await prisma.machine.findUnique({
      where: { id },
      include: {
        workshop: {
          include: { factory: true },
        },
        metrics: {
          orderBy: { recordedAt: 'desc' },
          take: 50,
        },
        alerts: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        maintenanceTickets: {
          include: { assignedUser: true },
          orderBy: { createdAt: 'desc' },
        },
        maintenanceLogs: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!machine) return null;

    return {
      ...machine,
      realtime: this.simulationService.getMachineState(machine.id) || null,
    };
  }
}
