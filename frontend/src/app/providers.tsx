'use client';

import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import { useSocketEvents } from '@/lib/hooks/useSocketEvents';

export function Providers({ children }: { children: React.ReactNode }) {
  useSocketEvents();

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen">
        <Header />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
