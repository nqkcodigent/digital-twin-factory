import prisma from '../prisma/client';

export class AlertService {
  async getAlerts(options?: { resolved?: boolean; limit?: number }) {
    const where: Record<string, unknown> = {};

    if (options?.resolved !== undefined) {
      where.resolved = options.resolved;
    }

    const limit = options?.limit ?? 100;

    return prisma.alert.findMany({
      where,
      include: {
        machine: {
          select: { id: true, name: true, type: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: Math.min(limit, 500),
    });
  }
}
