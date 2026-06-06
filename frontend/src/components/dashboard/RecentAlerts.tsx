'use client';

import type { Alert } from '@/types';
import { Bell, AlertTriangle, Info } from 'lucide-react';

interface RecentAlertsProps {
  alerts: Alert[];
}

export default function RecentAlerts({ alerts }: RecentAlertsProps) {
  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
      default: return <Info className="w-4 h-4 text-blue-400" />;
    }
  };

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical': return 'border-l-red-500 bg-red-500/5';
      case 'warning': return 'border-l-yellow-500 bg-yellow-500/5';
      default: return 'border-l-blue-500 bg-blue-500/5';
    }
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  return (
    <div className="chart-container">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Bell className="w-4 h-4 text-orange-400" />
        Recent Alerts
      </h3>

      {alerts.length === 0 ? (
        <div className="text-center py-8">
          <Bell className="w-8 h-8 text-gray-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500">No recent alerts</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-3 p-2.5 rounded-lg border-l-2 ${getSeverityStyle(alert.severity)} animate-slide-in`}
            >
              <div className="mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-300 line-clamp-2">{alert.message}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    alert.severity === 'critical' ? 'text-red-400 bg-red-500/20' :
                    alert.severity === 'warning' ? 'text-yellow-400 bg-yellow-500/20' :
                    'text-blue-400 bg-blue-500/20'
                  }`}>
                    {alert.severity}
                  </span>
                  <span className="text-[10px] text-gray-500">
                    {formatTime(alert.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
