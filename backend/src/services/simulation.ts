import { Server as SocketIOServer } from 'socket.io';
import prisma from '../prisma/client';

interface MachineUpdate {
  id: string;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  productionOutput: number;
  status: string;
}

function randomInRange(min: number, max: number): number {
  return Math.round((min + Math.random() * (max - min)) * 100) / 100;
}

function shouldTriggerAnomaly(): boolean {
  return Math.random() < 0.08; // 8% chance per cycle
}

export class SimulationService {
  private io: SocketIOServer;
  private interval: NodeJS.Timeout | null = null;
  private machineStates: Map<string, MachineUpdate> = new Map();

  constructor(io: SocketIOServer) {
    this.io = io;
  }

  async initialize() {
    const machines = await prisma.machine.findMany();
    for (const machine of machines) {
      this.machineStates.set(machine.id, {
        id: machine.id,
        temperature: machine.temperature,
        vibration: machine.vibration,
        powerConsumption: machine.powerConsumption,
        productionOutput: machine.productionOutput,
        status: machine.status,
      });
    }
    console.log(`📡 Simulation initialized with ${machines.length} machines`);
  }

  start() {
    if (this.interval) return;
    console.log('▶️ IoT Simulation started (interval: 3s)');
    this.interval = setInterval(() => this.tick(), 3000);
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      console.log('⏹️ IoT Simulation stopped');
    }
  }

  private async tick() {
    for (const [machineId, state] of this.machineStates) {
      const anomaly = shouldTriggerAnomaly();

      // Generate sensor data with or without anomaly
      let newStatus = 'running';
      let temperature: number;
      let vibration: number;
      let powerConsumption: number;
      let productionOutput: number;

      if (anomaly) {
        const anomalyType = Math.random();
        if (anomalyType < 0.33) {
          // Overheat
          temperature = randomInRange(92, 115);
          vibration = randomInRange(3, 6);
          powerConsumption = randomInRange(300, 450);
          productionOutput = Math.floor(randomInRange(10, 30));
          newStatus = 'warning';
        } else if (anomalyType < 0.66) {
          // High vibration
          temperature = randomInRange(60, 80);
          vibration = randomInRange(8.2, 10);
          powerConsumption = randomInRange(250, 400);
          productionOutput = Math.floor(randomInRange(15, 40));
          newStatus = 'warning';
        } else {
          // Machine stopped
          temperature = randomInRange(25, 40);
          vibration = 0;
          powerConsumption = 0;
          productionOutput = 0;
          newStatus = 'stopped';
        }
      } else {
        // Normal operation with small variations
        temperature = randomInRange(20, 80);
        vibration = randomInRange(0, 7.5);
        powerConsumption = randomInRange(50, 450);
        productionOutput = Math.floor(randomInRange(10, 95));
      }

      const update: MachineUpdate = {
        id: machineId,
        temperature,
        vibration,
        powerConsumption,
        productionOutput,
        status: newStatus,
      };

      this.machineStates.set(machineId, update);

      // Emit machine update via Socket.IO
      this.io.emit('machine:update', update);

      // Save metric to database (batch every 10th tick to reduce DB load)
      if (Math.random() < 0.33) {
        await prisma.machineMetric.create({
          data: {
            machineId,
            temperature,
            vibration,
            powerConsumption,
            productionOutput,
          },
        }).catch(() => {}); // silently fail if DB issue
      }

      // Create alert if anomaly detected
      if (anomaly) {
        const machine = await prisma.machine.findUnique({ where: { id: machineId } });
        if (machine) {
          let severity = 'warning';
          let message = '';

          if (temperature > 90) {
            severity = 'critical';
            message = `${machine.name} overheating — ${temperature}°C detected`;
          } else if (vibration > 8) {
            message = `${machine.name} vibration abnormal — ${vibration} mm/s detected`;
          } else if (newStatus === 'stopped') {
            severity = 'critical';
            message = `${machine.name} stopped unexpectedly`;
          }

          if (message) {
            const alert = await prisma.alert.create({
              data: {
                machineId,
                severity,
                message,
              },
              include: { machine: true },
            }).catch(() => null);

            if (alert) {
              this.io.emit('alert:new', alert);
            }
          }
        }
      }
    }
  }

  getMachineState(machineId: string): MachineUpdate | undefined {
    return this.machineStates.get(machineId);
  }

  getAllMachineStates(): MachineUpdate[] {
    return Array.from(this.machineStates.values());
  }
}
