'use client';

import { useMachineStore } from '@/stores/machineStore';
import {
  X,
  Thermometer,
  Activity,
  Zap,
  Package,
  Calendar,
  AlertTriangle,
  Cpu,
} from 'lucide-react';

export default function MachineDetailPanel() {
  const selectedMachine = useMachineStore((s) => s.selectedMachine);
  const setSelectedMachine = useMachineStore((s) => s.setSelectedMachine);

  if (!selectedMachine) return null;

  const realtime = selectedMachine.realtime;
  const temp = realtime?.temperature ?? selectedMachine.temperature;
  const vib = realtime?.vibration ?? selectedMachine.vibration;
  const power = realtime?.powerConsumption ?? selectedMachine.powerConsumption;
  const output = realtime?.productionOutput ?? selectedMachine.productionOutput;
  const status = realtime?.status ?? selectedMachine.status;

  const getStatusColor = (s: string) => {
    switch (s) {
      case 'running': return 'text-green-400 bg-green-500/20 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30';
      case 'stopped': return 'text-red-400 bg-red-500/20 border-red-500/30';
      case 'maintenance': return 'text-blue-400 bg-blue-500/20 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/30';
    }
  };

  const getSeverityColor = (value: number, threshold: number, warnThreshold: number) => {
    if (value >= threshold) return 'text-red-400';
    if (value >= warnThreshold) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-900 border-l border-gray-800 shadow-2xl z-50 animate-slide-in overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-600/20">
            <Cpu className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">{selectedMachine.name}</h2>
            <p className="text-xs text-gray-500">{selectedMachine.type}</p>
          </div>
        </div>
        <button
          onClick={() => setSelectedMachine(null)}
          className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
        >
          <X className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="p-5 space-y-5">
        {/* Status Badge */}
        <div className="flex items-center justify-between">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize border ${getStatusColor(status)}`}>
            {status}
          </span>
          {selectedMachine._count && (
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-orange-400" />
                {selectedMachine._count.alerts} alerts
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-blue-400" />
                {selectedMachine._count.maintenanceTickets} active
              </span>
            </div>
          )}
        </div>

        {/* Real-time Metrics */}
        <div>
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Real-time Metrics
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Thermometer className="w-3 h-3 text-red-400" />
                <span className="text-[10px] text-gray-500">Temperature</span>
              </div>
              <p className={`text-lg font-bold font-mono ${getSeverityColor(temp, 90, 70)}`}>
                {temp.toFixed(1)}°
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Activity className="w-3 h-3 text-yellow-400" />
                <span className="text-[10px] text-gray-500">Vibration</span>
              </div>
              <p className={`text-lg font-bold font-mono ${getSeverityColor(vib, 8, 6)}`}>
                {vib.toFixed(1)} mm/s
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Zap className="w-3 h-3 text-blue-400" />
                <span className="text-[10px] text-gray-500">Power</span>
              </div>
              <p className="text-lg font-bold font-mono text-white">
                {power.toFixed(0)} kWh
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
              <div className="flex items-center gap-1.5 mb-1">
                <Package className="w-3 h-3 text-green-400" />
                <span className="text-[10px] text-gray-500">Output</span>
              </div>
              <p className="text-lg font-bold font-mono text-white">
                {output} units
              </p>
            </div>
          </div>
        </div>

        {/* Last Maintenance */}
        {selectedMachine.lastMaintenanceDate && (
          <div className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-3 h-3 text-gray-400" />
              <span className="text-[10px] text-gray-500 uppercase tracking-wider">Last Maintenance</span>
            </div>
            <p className="text-sm text-gray-300 font-mono">
              {new Date(selectedMachine.lastMaintenanceDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </p>
          </div>
        )}

        {/* Recent Alerts */}
        {selectedMachine.alerts && selectedMachine.alerts.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Recent Alerts
            </h3>
            <div className="space-y-2">
              {selectedMachine.alerts.slice(0, 5).map((alert) => (
                <div
                  key={alert.id}
                  className={`flex items-start gap-2 p-2.5 rounded-lg border-l-2 ${
                    alert.severity === 'critical' ? 'border-l-red-500 bg-red-500/5' :
                    alert.severity === 'warning' ? 'border-l-yellow-500 bg-yellow-500/5' :
                    'border-l-blue-500 bg-blue-500/5'
                  }`}
                >
                  <AlertTriangle className={`w-3 h-3 mt-0.5 ${
                    alert.severity === 'critical' ? 'text-red-400' :
                    alert.severity === 'warning' ? 'text-yellow-400' : 'text-blue-400'
                  }`} />
                  <p className="text-xs text-gray-400 line-clamp-2">{alert.message}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Maintenance Tickets */}
        {selectedMachine.maintenanceTickets && selectedMachine.maintenanceTickets.length > 0 && (
          <div>
            <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
              Maintenance Tickets
            </h3>
            <div className="space-y-2">
              {selectedMachine.maintenanceTickets.slice(0, 3).map((ticket) => (
                <div key={ticket.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-800">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                      ticket.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                      ticket.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-[10px] capitalize ${
                      ticket.status === 'completed' ? 'text-green-400' :
                      ticket.status === 'in_progress' ? 'text-yellow-400' :
                      'text-gray-400'
                    }`}>
                      {ticket.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">{ticket.issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
