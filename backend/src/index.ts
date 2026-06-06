import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { SimulationService } from './services/simulation';
import { ServiceContainer } from './services';
import { createMachineRoutes } from './routes/machines';
import { createAlertRoutes } from './routes/alerts';
import { createMaintenanceRoutes } from './routes/maintenance';
import { createDashboardRoutes } from './routes/dashboard';

const prisma = new PrismaClient();
const app = express();
const server = http.createServer(app);

// Dynamic CORS origins — allow Railway URLs, localhost for dev
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  ...(process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',').map(s => s.trim()) : []),
].filter(Boolean);

// Socket.IO setup
const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingInterval: 10000,
  pingTimeout: 5000,
  transports: ['websocket', 'polling'],
});

// Middleware
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json());

// Initialize services
const simulationService = new SimulationService(io);
const services = new ServiceContainer(simulationService);

// Routes (thin controllers using service layer)
app.use('/api/machines', createMachineRoutes(services.machineService));
app.use('/api/alerts', createAlertRoutes(services.alertService));
app.use('/api/maintenance-tickets', createMaintenanceRoutes(services.maintenanceService));
app.use('/api/dashboard', createDashboardRoutes(services.dashboardService));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  // Send initial state to newly connected client
  const states = simulationService.getAllMachineStates();
  socket.emit('init:machines', states);

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    await prisma.$connect();
    console.log('✅ Connected to MariaDB');

    await simulationService.initialize();
    simulationService.start();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📡 WebSocket ready for connections`);
      console.log(`\n📋 API Endpoints:`);
      console.log(`   GET  /api/machines`);
      console.log(`   GET  /api/machines/:id`);
      console.log(`   GET  /api/alerts`);
      console.log(`   GET  /api/dashboard`);
      console.log(`   GET  /api/maintenance-tickets`);
      console.log(`   POST /api/maintenance-tickets`);
      console.log(`   PATCH /api/maintenance-tickets/:id`);
      console.log(`   GET  /api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

start();

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down...');
  simulationService.stop();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  simulationService.stop();
  server.close();
  await prisma.$disconnect();
  process.exit(0);
});
