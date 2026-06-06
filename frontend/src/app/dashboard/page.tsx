'use client';

import { useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import { useMachineStore } from '@/stores/machineStore';
import type { DashboardData, Alert } from '@/types';
import KpiCards from '@/components/dashboard/KpiCards';
import TrendChart from '@/components/dashboard/TrendChart';
import MachineStatusGrid from '@/components/dashboard/MachineStatusGrid';
import RecentAlerts from '@/components/dashboard/RecentAlerts';
import { Activity, Bell, AlertTriangle, TrendingUp } from 'lucide-react';

export default function DashboardPage() {
  const { setDashboard, setLoading, setError, machines, alerts } = useMachineStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);

  useEffect(() => {
    async function fetchDashboard() {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/dashboard`);
        if (!res.ok) throw new Error('Failed to fetch dashboard data');
        const data = await res.json();
        setDashboardData(data);
        setDashboard(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 15000);
    return () => clearInterval(interval);
  }, [setDashboard, setLoading, setError]);

  // Merge socket-received alerts
  const latestAlerts = dashboardData
    ? (alerts.length > 0 ? alerts.slice(0, 5) : [])
    : [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-sm text-gray-400 mt-1">
            Real-time factory overview & performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <Activity className="w-4 h-4 text-green-500" />
          <span>Live updates every 3s</span>
        </div>
      </div>

      {/* KPI Cards */}
      {dashboardData && (
        <>
          <KpiCards data={dashboardData} />

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <TrendChart
              title="Temperature Trend"
              data={dashboardData.trends.temperature}
              color="#ef4444"
              unit="°C"
              icon={<AlertTriangle className="w-4 h-4" />}
            />
            <TrendChart
              title="Power Consumption"
              data={dashboardData.trends.powerConsumption}
              color="#3b82f6"
              unit="kWh"
              icon={<TrendingUp className="w-4 h-4" />}
            />
            <TrendChart
              title="Production Output"
              data={dashboardData.trends.productionOutput}
              color="#22c55e"
              unit="units"
              icon={<Activity className="w-4 h-4" />}
            />
          </div>

          {/* Bottom Row: Machine Status + Recent Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MachineStatusGrid statuses={dashboardData.machineStatuses} machines={machines} />
            </div>
            <div>
              <RecentAlerts alerts={latestAlerts} />
            </div>
          </div>
        </>
      )}

      {!dashboardData && (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 animate-pulse">Loading dashboard...</div>
        </div>
      )}
    </div>
  );
}
