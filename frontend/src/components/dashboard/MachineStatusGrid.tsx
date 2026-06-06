'use client';

import type { Machine } from '@/types';
import { Cpu, Thermometer, Activity, Zap } from 'lucide-react';

interface MachineStatusProps {
  statuses: {
    id: string;
    status: string;
    temperature: number;
    vibration: number;
  }[];
  machines: Machine[];
}

export default function MachineStatusGrid({ statuses, machines }: MachineStatusProps) {
  const getMachineName = (id: string) => {
    return machines.find((m) => m.id === id)?.name || id.substring(0, 8);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 'warning': return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 'stopped': return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'maintenance': return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/30';
    }
  };

  const getIndicator = (status: string) => {
    const colors = {
      running: 'bg-green-500',
      warning: 'bg-yellow-500',
      stopped: 'bg-red-500',
      maintenance: 'bg-blue-500',
    };
    return colors[status as keyof typeof colors] || 'bg-gray-500';
  };

  const getSeverity = (temp: number, vib: number) => {
    if (temp > 90 || vib > 8) return 'text-red-400';
    if (temp > 70 || vib > 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-blue-400" />
        Machine Status Overview
      </h3>

      <div className="space-y-2">
        {statuses.map((s) => (
          <div
            key={s.id}
            className={`flex items-center justify-between px-3 py-2.5 rounded-lg border ${getStatusColor(s.status)} transition-all`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-2 h-2 rounded-full ${getIndicator(s.status)} shadow-sm`} style={{
                boxShadow: `0 0 6px var(--tw-shadow-color)`
              }} />
              <div>
                <p className="text-sm font-medium text-white">{getMachineName(s.id)}</p>
                <p className="text-[10px] text-gray-500 capitalize">{s.status}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1.5">
                <Thermometer className="w-3 h-3 text-gray-500" />
                <span className={`text-xs font-mono ${getSeverity(s.temperature, 0)}`}>
                  {s.temperature.toFixed(1)}°
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <Activity className="w-3 h-3 text-gray-500" />
                <span className={`text-xs font-mono ${getSeverity(0, s.vibration)}`}>
                  {s.vibration.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
