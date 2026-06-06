export interface Factory {
  id: string;
  name: string;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Workshop {
  id: string;
  name: string;
  factoryId: string;
  factory?: Factory;
}

export interface Machine {
  id: string;
  name: string;
  type: string;
  status: string;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  productionOutput: number;
  lastMaintenanceDate: string | null;
  positionX: number;
  positionY: number;
  positionZ: number;
  workshopId: string;
  workshop?: Workshop;
  _count?: {
    alerts: number;
    maintenanceTickets: number;
  };
  realtime?: MachineRealtimeState | null;
  // Full detail (from GET /machines/:id)
  metrics?: MachineMetric[];
  alerts?: Alert[];
  maintenanceTickets?: MaintenanceTicket[];
  maintenanceLogs?: MaintenanceLog[];
}

export interface MachineRealtimeState {
  id: string;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  productionOutput: number;
  status: string;
}

export interface MachineMetric {
  id: string;
  machineId: string;
  temperature: number;
  vibration: number;
  powerConsumption: number;
  productionOutput: number;
  recordedAt: string;
}

export interface Alert {
  id: string;
  machineId: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  resolved: boolean;
  createdAt: string;
  machine?: {
    id: string;
    name: string;
    type: string;
  };
}

export interface MaintenanceTicket {
  id: string;
  machineId: string;
  assignedTo: string | null;
  issue: string;
  priority: 'low' | 'medium' | 'high';
  status: 'open' | 'in_progress' | 'completed';
  createdAt: string;
  updatedAt: string;
  machine?: {
    id: string;
    name: string;
    type: string;
  };
  assignedUser?: {
    id: string;
    name: string;
    email: string;
  } | null;
  logs?: MaintenanceLog[];
}

export interface MaintenanceLog {
  id: string;
  maintenanceTicketId: string;
  machineId: string;
  description: string;
  action: string;
  performedBy: string | null;
  createdAt: string;
}

export interface DashboardData {
  totalMachines: number;
  activeMachines: number;
  criticalCount: number;
  alertsToday: number;
  trends: {
    temperature: { time: string; value: number }[];
    powerConsumption: { time: string; value: number }[];
    productionOutput: { time: string; value: number }[];
  };
  machineStatuses: {
    id: string;
    status: string;
    temperature: number;
    vibration: number;
  }[];
}

export type MachineStatus = 'running' | 'warning' | 'stopped' | 'maintenance';
export type AlertSeverity = 'info' | 'warning' | 'critical';
export type TicketPriority = 'low' | 'medium' | 'high';
export type TicketStatus = 'open' | 'in_progress' | 'completed';
