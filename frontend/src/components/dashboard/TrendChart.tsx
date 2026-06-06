'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { ReactNode } from 'react';

interface TrendChartProps {
  title: string;
  data: { time: string; value: number }[];
  color: string;
  unit: string;
  icon: ReactNode;
}

export default function TrendChart({ title, data, color, unit, icon }: TrendChartProps) {
  // Format data for display
  const chartData = data.map((d) => ({
    time: new Date(d.time).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }),
    value: d.value,
  }));

  return (
    <div className="chart-container">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded-md" style={{ backgroundColor: `${color}20` }}>
          <div style={{ color }}>{icon}</div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white">{title}</h3>
          <p className="text-[10px] text-gray-500">{unit}</p>
        </div>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.length > 0 ? chartData : [{ time: '00:00', value: 0 }]}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis
              dataKey="time"
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fill: '#6b7280', fontSize: 10 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1f2937',
                border: '1px solid #374151',
                borderRadius: '8px',
                fontSize: '12px',
                color: '#f3f4f6',
              }}
              labelStyle={{ color: '#9ca3af' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
