import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Clean existing data
  await prisma.maintenanceLog.deleteMany();
  await prisma.maintenanceTicket.deleteMany();
  await prisma.alert.deleteMany();
  await prisma.machineMetric.deleteMany();
  await prisma.machine.deleteMany();
  await prisma.workshop.deleteMany();
  await prisma.factory.deleteMany();
  await prisma.user.deleteMany();

  // Create user
  const user = await prisma.user.create({
    data: {
      email: 'operator@factory.io',
      name: 'Main Operator',
      role: 'operator',
    },
  });

  // Create factory
  const factory = await prisma.factory.create({
    data: {
      name: 'Industry 4.0 Smart Factory',
      location: 'Shanghai, China',
    },
  });

  // Create workshop
  const workshop = await prisma.workshop.create({
    data: {
      name: 'Main Production Workshop A',
      factoryId: factory.id,
    },
  });

  // Machine definitions with 3D positions
  const machineDefs = [
    {
      name: 'CNC Machine',
      type: 'CNC',
      positionX: -4,
      positionY: 0,
      positionZ: 2,
    },
    {
      name: 'Conveyor Belt',
      type: 'Conveyor',
      positionX: 0,
      positionY: 0,
      positionZ: 2,
    },
    {
      name: 'Robot Arm',
      type: 'Robot',
      positionX: 4,
      positionY: 0,
      positionZ: 2,
    },
    {
      name: 'Packaging Machine',
      type: 'Packaging',
      positionX: -2,
      positionY: 0,
      positionZ: -2,
    },
    {
      name: 'Air Compressor',
      type: 'Compressor',
      positionX: 2,
      positionY: 0,
      positionZ: -2,
    },
  ];

  const machines = [];
  for (const def of machineDefs) {
    const machine = await prisma.machine.create({
      data: {
        name: def.name,
        type: def.type,
        status: 'running',
        temperature: 45 + Math.random() * 20,
        vibration: 1.5 + Math.random() * 3,
        powerConsumption: 150 + Math.random() * 150,
        productionOutput: Math.floor(Math.random() * 50),
        lastMaintenanceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        positionX: def.positionX,
        positionY: def.positionY,
        positionZ: def.positionZ,
        workshopId: workshop.id,
      },
    });
    machines.push(machine);
  }

  // Create historical metrics (last 24 hours, every 30 minutes = 48 data points)
  const now = Date.now();
  for (const machine of machines) {
    const metrics = [];
    for (let i = 48; i >= 0; i--) {
      const timestamp = new Date(now - i * 30 * 60 * 1000);
      metrics.push({
        machineId: machine.id,
        temperature: 40 + Math.sin(i * 0.3) * 15 + Math.random() * 10,
        vibration: 2 + Math.sin(i * 0.2) * 1.5 + Math.random() * 2,
        powerConsumption: 200 + Math.sin(i * 0.15) * 80 + Math.random() * 40,
        productionOutput: Math.floor(30 + Math.sin(i * 0.1) * 20 + Math.random() * 15),
        recordedAt: timestamp,
      });
    }
    await prisma.machineMetric.createMany({ data: metrics });
  }

  // Create sample alerts
  const alertData = [
    {
      machineId: machines[0].id,
      severity: 'critical',
      message: 'CNC Machine overheating — temperature exceeded 95°C',
    },
    {
      machineId: machines[1].id,
      severity: 'warning',
      message: 'Conveyor Belt vibration abnormal — 8.2 mm/s detected',
    },
    {
      machineId: machines[2].id,
      severity: 'critical',
      message: 'Robot Arm offline — connection lost',
    },
    {
      machineId: machines[3].id,
      severity: 'warning',
      message: 'Packaging Machine production output dropping below threshold',
    },
    {
      machineId: machines[4].id,
      severity: 'info',
      message: 'Air Compressor maintenance due in 3 days',
    },
  ];

  for (const alert of alertData) {
    await prisma.alert.create({
      data: {
        ...alert,
        createdAt: new Date(now - Math.random() * 24 * 60 * 60 * 1000),
      },
    });
  }

  // Create sample maintenance tickets
  const ticketData = [
    {
      machineId: machines[0].id,
      assignedTo: user.id,
      issue: 'Coolant system needs replacement',
      priority: 'high',
      status: 'in_progress',
    },
    {
      machineId: machines[2].id,
      assignedTo: user.id,
      issue: 'Gripper calibration required',
      priority: 'medium',
      status: 'open',
    },
    {
      machineId: machines[3].id,
      issue: 'Seal replacement for packaging head',
      priority: 'low',
      status: 'completed',
    },
  ];

  for (const ticket of ticketData) {
    const created = await prisma.maintenanceTicket.create({ data: ticket });

    if (ticket.status === 'completed') {
      await prisma.maintenanceLog.create({
        data: {
          maintenanceTicketId: created.id,
          machineId: ticket.machineId,
          description: 'Replaced worn-out seals on packaging head',
          action: 'Replaced seals and tested packaging cycle',
          performedBy: user.name,
        },
      });
    }

    if (ticket.status === 'in_progress') {
      await prisma.maintenanceLog.create({
        data: {
          maintenanceTicketId: created.id,
          machineId: ticket.machineId,
          description: 'Started coolant system disassembly',
          action: 'Drained coolant, removed old pump',
          performedBy: user.name,
        },
      });
    }
  }

  console.log('✅ Seed data created successfully!');
  console.log(`   Factory: ${factory.name}`);
  console.log(`   Workshop: ${workshop.name}`);
  console.log(`   Machines: ${machines.length}`);
  console.log(`   Alerts: ${alertData.length}`);
  console.log(`   Tickets: ${ticketData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
