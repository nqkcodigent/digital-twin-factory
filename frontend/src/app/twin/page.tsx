'use client';

import dynamic from 'next/dynamic';
import { useMachineStore } from '@/stores/machineStore';
import MachineDetailPanel from '@/components/twin/MachineDetailPanel';

const FactoryScene = dynamic(() => import('@/components/twin/FactoryScene'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full text-gray-500">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm">Loading 3D Factory...</p>
      </div>
    </div>
  ),
});

export default function TwinPage() {
  const selectedMachine = useMachineStore((s) => s.selectedMachine);

  return (
    <div className="relative flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white">Digital Twin</h1>
        <p className="text-sm text-gray-400 mt-1">
          3D factory visualization with real-time machine monitoring
        </p>
      </div>

      {/* 3D Viewport */}
      <div className="flex-1 bg-gray-900/50 rounded-xl border border-gray-800 overflow-hidden relative">
        <FactoryScene />
      </div>

      {/* Detail Panel */}
      {selectedMachine && <MachineDetailPanel />}
    </div>
  );
}
