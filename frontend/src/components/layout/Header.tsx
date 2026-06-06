'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Clock, ChevronRight } from 'lucide-react';

const pageLabels: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/twin': 'Digital Twin',
  '/machines': 'Machines',
  '/alerts': 'Alerts',
  '/maintenance': 'Maintenance',
};

export default function Header() {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPage = pageLabels[pathname] || 'Dashboard';

  return (
    <header className="sticky top-0 z-30 h-16 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800 flex items-center justify-between px-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-gray-500">Factory</span>
        <ChevronRight className="w-3.5 h-3.5 text-gray-600" />
        <span className="text-white font-medium">{currentPage}</span>
      </div>

      {/* Time */}
      <div className="flex items-center gap-2 text-sm text-gray-400">
        <Clock className="w-4 h-4" />
        <span className="font-mono">
          {time.toLocaleTimeString('en-US', { hour12: false })}
        </span>
      </div>
    </header>
  );
}
