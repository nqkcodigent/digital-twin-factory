import prisma from '../prisma/client';
import { SimulationService } from './simulation';

interface TrendPoint {
  time: string;
  value: number;
}

interface DashboardResponse {
  totalMachines: number;
  activeMachines: number;
  criticalCount: number;
  alertsToday: number;
  trends: {
    temperature: TrendPoint[];
    powerConsumption: TrendPoint[];
    productionOutput: TrendPoint[];
  };
  machineStatuses: {
    id: string;
    status: string;
    temperature: number;
    vibration: number;
  }[];
}

function average(arr: number[]): number {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

export class DashboardService {
  constructor(private simulationService: SimulationService) {}

  async getDashboard(): Promise<DashboardResponse> {
    const machines = await prisma.machine.findMany();
    const totalMachines = machines.length;

    const states = this.simulationService.getAllMachineStates();
    const activeMachines = states.filter((s) => s.status === 'running').length;
    const criticalCount = states.filter(
      (s) => s.temperature > 90 || s.vibration > 8
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const alertsToday = await prisma.alert.count({
      where: { createdAt: { gte: today } },
    });

    // Get recent metrics and aggregate by minute for chart trends
    const recentMetrics = await prisma.machineMetric.findMany({
      orderBy: { recordedAt: 'desc' },
      take: 60,
    });

    const timelineMap = new Map<string, {
      temperature: number[];
      powerConsumption: number[];
      productionOutput: number[];
    }>();

    for (const metric of recentMetrics.reverse()) {
      const key = metric.recordedAt.toISOString().substring(0, 16); // group by minute
      if (!timelineMap.has(key)) {
        timelineMap.set(key, {
          temperature: [],
          powerConsumption: [],
          productionOutput: [],
        });
      }
      const entry = timelineMap.get(key)!;
      entry.temperature.push(metric.temperature);
      entry.powerConsumption.push(metric.powerConsumption);
      entry.productionOutput.push(metric.productionOutput);
    }

    const temperatureTrend: TrendPoint[] = [];
    const powerTrend: TrendPoint[] = [];
    const productionTrend: TrendPoint[] = [];

    for (const [time, values] of timelineMap) {
      temperatureTrend.push({
        time,
        value: Math.round(average(values.temperature) * 10) / 10,
      });
      powerTrend.push({
        time,
        value: Math.round(average(values.powerConsumption) * 10) / 10,
      });
      productionTrend.push({
        time,
        value: Math.round(average(values.productionOutput) * 10) / 10,
      });
    }

    return {
      totalMachines,
      activeMachines,
      criticalCount,
      alertsToday,
      trends: {
        temperature: temperatureTrend,
        powerConsumption: powerTrend,
        productionOutput: productionTrend,
      },
      machineStatuses: states.map((s) => ({
        id: s.id,
        status: s.status,
        temperature: s.temperature,
        vibration: s.vibration,
      })),
    };
  }
}
