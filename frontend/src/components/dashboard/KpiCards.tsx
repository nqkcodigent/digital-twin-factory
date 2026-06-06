'use client';

import type { DashboardData } from '@/types';
import { Cpu, CheckCircle2, AlertTriangle, Bell } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  color: string;
  subtitle?: string;
}

function KpiCard({ title, value, icon, color, subtitle }: KpiCardProps) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg`} style={{ backgroundColor: `${color}15` }}>
          <div style={{ color }}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

export default function KpiCards({ data }: { data: DashboardData }) {
  const criticalPct = data.totalMachines > 0
    ? Math.round((data.criticalCount / data.totalMachines) * 100)
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <KpiCard
        title="Total Machines"
        value={data.totalMachines}
        icon={<Cpu className="w-6 h-6" />}
        color="#3b82f6"
        subtitle="Connected to platform"
      />
      <KpiCard
        title="Active Machines"
        value={data.activeMachines}
        icon={<CheckCircle2 className="w-6 h-6" />}
        color="#22c55e"
        subtitle={`${data.totalMachines > 0 ? Math.round((data.activeMachines / data.totalMachines) * 100) : 0}% operational`}
      />
      <KpiCard
        title="Critical Machines"
        value={data.criticalCount}
        icon={<AlertTriangle className="w-6 h-6" />}
        color="#ef4444"
        subtitle={`${criticalPct}% of total`}
      />
      <KpiCard
        title="Alerts Today"
        value={data.alertsToday}
        icon={<Bell className="w-6 h-6" />}
        color="#f97316"
        subtitle="Requires attention"
      />
    </div>
  );
}
