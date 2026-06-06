'use client';

import { useEffect, useState } from 'react';
import { useMachineStore } from '@/stores/machineStore';
import type { Alert } from '@/types';
import { Bell, AlertTriangle, Info, CheckCircle, Filter, Trash2 } from 'lucide-react';

export default function AlertsPage() {
  const { alerts, addAlert } = useMachineStore();
  const [dbAlerts, setDbAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/alerts?limit=50`);
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        setDbAlerts(data);
      } catch (err) {
        console.error('Error fetching alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 10000);
    return () => clearInterval(interval);
  }, []);

  // Merge socket alerts with DB alerts (socket alerts are newest)
  const allAlerts: Alert[] = [...alerts];
  for (const dbAlert of dbAlerts) {
    if (!allAlerts.find((a) => a.id === dbAlert.id)) {
      allAlerts.push(dbAlert);
    }
  }

  const filteredAlerts = filter === 'all'
    ? allAlerts
    : allAlerts.filter((a) => a.severity === filter);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="w-5 h-5 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getSeverityBg = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500/10 border-red-500/30';
      case 'warning': return 'bg-yellow-500/10 border-yellow-500/30';
      default: return 'bg-blue-500/10 border-blue-500/30';
    }
  };

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  };

  const criticalCount = allAlerts.filter((a) => a.severity === 'critical').length;
  const warningCount = allAlerts.filter((a) => a.severity === 'warning').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Alert Center</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time alerts and notifications from factory machines
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 text-red-400">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {criticalCount} critical
            </span>
            <span className="flex items-center gap-1 text-yellow-400">
              <span className="w-2 h-2 rounded-full bg-yellow-500" />
              {warningCount} warnings
            </span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-gray-500" />
        {['all', 'critical', 'warning', 'info'].map((severity) => (
          <button
            key={severity}
            onClick={() => setFilter(severity)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              filter === severity
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                : 'bg-gray-800/50 text-gray-500 border border-gray-800 hover:text-gray-300'
            }`}
          >
            {severity === 'all' ? 'All' : severity}
          </button>
        ))}
        <div className="ml-auto text-xs text-gray-600">
          {filteredAlerts.length} alerts
        </div>
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 animate-pulse">Loading alerts...</div>
        </div>
      ) : filteredAlerts.length === 0 ? (
        <div className="text-center py-16">
          <CheckCircle className="w-12 h-12 text-green-500/50 mx-auto mb-4" />
          <p className="text-gray-500">No alerts to display</p>
          <p className="text-xs text-gray-600 mt-1">All machines operating normally</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-start gap-4 p-4 rounded-xl border ${getSeverityBg(alert.severity)} transition-all hover:bg-opacity-20 animate-slide-in`}
            >
              <div className="mt-0.5">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-white">{alert.message}</p>
                    {alert.machine && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        Machine: {alert.machine.name} ({alert.machine.type})
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                      alert.severity === 'critical' ? 'bg-red-500/20 text-red-400' :
                      alert.severity === 'warning' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-blue-500/20 text-blue-400'
                    }`}>
                      {alert.severity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[11px] text-gray-600 font-mono">
                    {formatTime(alert.createdAt)}
                  </span>
                  {!alert.resolved && (
                    <span className="text-[10px] text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
