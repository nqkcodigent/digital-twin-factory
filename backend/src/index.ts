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

// Track database connection status (no repeated $connect calls)
let dbConnected = false;

// Health check — always returns 200 so Railway keeps the container alive
// DB status is reported in the response body, not the HTTP status code
app.get('/api/health', (_req, res) => {
  res.json({
    status: dbConnected ? 'ok' : 'degraded',
    database: dbConnected ? 'connected' : 'connecting',
    timestamp: new Date().toISOString()
  });
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

// Start server — listen first, then connect DB asynchronously
const PORT = parseInt(process.env.PORT || '4000', 10);

async function connectDatabase() {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 3000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await prisma.$connect();
      console.log('✅ Connected to MariaDB');
      dbConnected = true;
      return true;
    } catch (error) {
      console.error(`❌ DB connection attempt ${attempt}/${MAX_RETRIES} failed:`, error instanceof Error ? error.message : error);
      if (attempt < MAX_RETRIES) {
        console.log(`⏳ Retrying in ${RETRY_DELAY / 1000}s...`);
        await new Promise(r => setTimeout(r, RETRY_DELAY));
      }
    }
  }

  console.error('❌ All database connection attempts failed. Server running in degraded mode.');
  return false;
}

async function startSimulation() {
  try {
    await simulationService.initialize();
    simulationService.start();
    console.log('📡 Simulation engine started');
  } catch (error) {
    console.error('⚠️ Simulation engine failed to start:', error);
  }
}

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

  // Connect DB and start simulation after server is listening
  connectDatabase().then(connected => {
    if (connected) {
      startSimulation();
    }
  });
});

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
