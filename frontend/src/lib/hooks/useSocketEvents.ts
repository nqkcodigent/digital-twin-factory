'use client';

import { useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { useMachineStore } from '@/stores/machineStore';
import { useSocketStore } from '@/stores/socketStore';
import type { MachineRealtimeState, Alert } from '@/types';

export function useSocketEvents() {
  const updateMachine = useMachineStore((s) => s.updateMachine);
  const addAlert = useMachineStore((s) => s.addAlert);
  const setConnected = useSocketStore((s) => s.setConnected);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const socket = getSocket();

    socket.on('connect', () => setConnected(true));
    socket.on('disconnect', () => setConnected(false));

    socket.on('init:machines', (states: MachineRealtimeState[]) => {
      states.forEach((state) => updateMachine(state));
    });

    socket.on('machine:update', (update: MachineRealtimeState) => {
      updateMachine(update);
    });

    socket.on('alert:new', (alert: Alert) => {
      addAlert(alert);
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('init:machines');
      socket.off('machine:update');
      socket.off('alert:new');
    };
  }, [updateMachine, addAlert, setConnected]);
}
