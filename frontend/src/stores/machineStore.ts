import { create } from 'zustand';
import type { Machine, Alert, DashboardData } from '@/types';

interface MachineStore {
  machines: Machine[];
  selectedMachine: Machine | null;
  alerts: Alert[];
  dashboard: DashboardData | null;
  loading: boolean;
  error: string | null;

  setMachines: (machines: Machine[]) => void;
  updateMachine: (update: Partial<Machine> & { id: string }) => void;
  addAlert: (alert: Alert) => void;
  setSelectedMachine: (machine: Machine | null) => void;
  setDashboard: (data: DashboardData) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useMachineStore = create<MachineStore>((set, get) => ({
  machines: [],
  selectedMachine: null,
  alerts: [],
  dashboard: null,
  loading: false,
  error: null,

  setMachines: (machines) => set({ machines }),

  updateMachine: (update) => {
    set((state) => {
      const updatedMachines = state.machines.map((m) => {
        if (m.id === update.id) {
          return {
            ...m,
            ...update,
            realtime: update.realtime || m.realtime,
          };
        }
        return m;
      });

      // Also update selected machine if it's the one being updated
      const selectedMachine = state.selectedMachine?.id === update.id
        ? { ...state.selectedMachine, ...update, realtime: update.realtime || state.selectedMachine.realtime }
        : state.selectedMachine;

      return { machines: updatedMachines, selectedMachine };
    });
  },

  addAlert: (alert) => {
    set((state) => ({
      alerts: [alert, ...state.alerts].slice(0, 100), // Keep last 100 alerts
    }));
  },

  setSelectedMachine: (machine) => set({ selectedMachine: machine }),

  setDashboard: (data) => set({ dashboard: data }),

  setLoading: (loading) => set({ loading }),

  setError: (error) => set({ error }),
}));
