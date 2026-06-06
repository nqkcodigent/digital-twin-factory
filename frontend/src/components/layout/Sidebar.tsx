'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Boxes,
  Cpu,
  Bell,
  Wrench,
  Factory,
  Wifi,
} from 'lucide-react';
import { useSocketStore } from '@/stores/socketStore';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/twin', label: 'Digital Twin', icon: Boxes },
  { href: '/machines', label: 'Machines', icon: Cpu },
  { href: '/alerts', label: 'Alerts', icon: Bell },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isConnected = useSocketStore((s) => s.isConnected);

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-800">
        <div className="p-2 rounded-lg bg-blue-600/20">
          <Factory className="w-6 h-6 text-blue-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">Digital Twin</h1>
          <p className="text-[10px] text-gray-400">Factory Platform</p>
        </div>
      </div>

      {/* Connection Status */}
      <div className="px-6 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${
            isConnected ? 'bg-green-500 shadow-sm shadow-green-500/50' : 'bg-red-500'
          }`} />
          <span className={isConnected ? 'text-green-400' : 'text-red-400'}>
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
          <Wifi className={`w-3 h-3 ml-auto ${isConnected ? 'text-green-500' : 'text-gray-600'}`} />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50 border border-transparent'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
              {isActive && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-800">
        <p className="text-[10px] text-gray-600">
          Industry 4.0 • Real-time IoT
        </p>
      </div>
    </aside>
  );
}
