# Digital Twin Factory Platform

A mini MVP of an Industry 4.0 Digital Twin Factory with real-time IoT simulation, 3D visualization, and maintenance management.

## Tech Stack

**Frontend:** Next.js 15 (App Router), TypeScript, TailwindCSS, Zustand, Socket.IO Client, React Three Fiber, Recharts
**Backend:** Node.js, Express, Socket.IO, MariaDB, Prisma ORM

## Quick Start

### Prerequisites

- Node.js 18+
- Docker (for MariaDB)
- npm

### 1. Start MariaDB

```bash
docker compose up -d
```

### 2. Backend Setup

```bash
cd backend
npm install
npx prisma generate
npx prisma db push
npm run prisma:seed
npm run dev
```

Backend runs on `http://localhost:4000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

## Features

### Factory Overview
- One sample factory with a workshop area
- 3D factory model with camera orbit controls (drag + scroll)

### Machine Management
5 sample machines: CNC Machine, Conveyor Belt, Robot Arm, Packaging Machine, Air Compressor
Each with: status, temperature, vibration, power consumption, production output, maintenance history

### Real-time IoT Simulation
- Backend generates sensor data every 3 seconds
- Temperature: 20-120°C, Vibration: 0-10 mm/s, Power: 50-500 kWh, Production: 0-100 units
- Random anomalies: overheating (>90°C), high vibration (>8 mm/s), machine stopped

### 3D Digital Twin
- Interactive 3D factory with colored machine boxes
- Green = Normal, Yellow = Warning, Red = Critical
- Click machines to open detail panel with real-time metrics

### Alert Center
- Real-time alerts with timestamp, severity, and machine info
- Filter by severity (info, warning, critical)

### Maintenance Module
- Create, track, and complete maintenance tickets
- Priority levels (low, medium, high)
- Status workflow: open → in_progress → completed

### Dashboard
- KPI cards: Total machines, Active, Critical, Alerts today
- Charts: Temperature, Power Consumption, Production Output trends

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/machines` | List all machines |
| GET | `/api/machines/:id` | Machine detail |
| GET | `/api/alerts` | List alerts |
| GET | `/api/dashboard` | Dashboard KPI data |
| GET | `/api/maintenance-tickets` | List tickets |
| POST | `/api/maintenance-tickets` | Create ticket |
| PATCH | `/api/maintenance-tickets/:id` | Update ticket status |
| GET | `/api/health` | Health check |

### Socket.IO Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `machine:update` | Server → Client | Real-time machine data (3s interval) |
| `alert:new` | Server → Client | New anomaly alert |
| `init:machines` | Server → Client | Initial machine states on connect |

## Project Structure

```
├── backend/
│   ├── prisma/           # Prisma schema + migrations
│   ├── src/
│   │   ├── prisma/       # DB client + seed
│   │   ├── routes/       # REST API routes
│   │   ├── services/     # IoT simulation
│   │   └── index.ts      # Express server
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/          # Next.js pages
│   │   ├── components/   # React components
│   │   ├── stores/       # Zustand state
│   │   ├── lib/          # Socket client + hooks
│   │   └── types/        # TypeScript types
│   └── package.json
├── docker-compose.yml
└── README.md
```

## ERD (Entity Relationship Diagram)

```
┌─────────┐       ┌──────────────────┐
│  Users  │1──N──│MaintenanceTicket  │
└─────────┘       └──────────────────┘
                        ↑
┌──────────┐       ┌────┴──────┐       ┌────────────────┐
│ Factory  │1──N──│  Workshop │1──N──│    Machine     │
└──────────┘       └───────────┘       └────────────────┘
                        ↑                    │
                        │              ┌─────┴──────┐
                        │              │     N      │
                        │         ┌────┴────┐       │
                        │         │  Alert  │       │
                        │         └─────────┘       │
                        │              N             │
                        │         ┌────────────────┐ │
                        ├─────────│ MachineMetric   │ │
                        │         └────────────────┘ │
                        │              N             │
                        │         ┌────────────────┐ │
                        └─────────│MaintenanceLog  │─┘
                                  └────────────────┘
```

### Tables

| Table | Description |
|-------|-------------|
| **users** | Operators and technicians who handle maintenance tasks |
| **factories** | Factory locations (e.g., Industry 4.0 Smart Factory) |
| **workshops** | Production areas within a factory |
| **machines** | Core IoT assets with real-time sensor data fields |
| **machine_metrics** | Time-series sensor data (temperature, vibration, power, output) |
| **alerts** | Anomaly events (overheat, high vibration, machine stopped) |
| **maintenance_tickets** | Work orders with priority and status workflow |
| **maintenance_logs** | Action history for each ticket |

### Key Relationships

- **Factory** 1→N **Workshop** 1→N **Machine**
- **Machine** 1→N **MachineMetric** (time-series sensor logs)
- **Machine** 1→N **Alert** (anomaly events)
- **Machine** 1→N **MaintenanceTicket** (work orders)
- **MaintenanceTicket** 1→N **MaintenanceLog** (action history)
- **User** 1→N **MaintenanceTicket** (as assignee)

## Theme

- Dark mode industrial dashboard
- Blue + Orange accent colors
- Factory / Industry 4.0 aesthetic
