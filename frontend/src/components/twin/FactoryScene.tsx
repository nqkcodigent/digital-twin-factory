'use client';

import { useRef, useState, useMemo, useCallback } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { Text, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useMachineStore } from '@/stores/machineStore';
import type { Machine } from '@/types';

// Ground grid
function Ground() {
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]}>
        <planeGeometry args={[20, 15]} />
        <meshStandardMaterial color="#1a1a2e" />
      </mesh>
      <gridHelper args={[20, 20, '#2a2a4a', '#1e1e3a']} position={[0, -0.49, 0]} />
    </group>
  );
}

// Factory floor lines
function FactoryFloor() {
  return (
    <group>
      {/* Floor outline */}
      <mesh position={[0, -0.48, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshBasicMaterial color="#1a1a2e" wireframe={false} transparent opacity={0.3} />
      </mesh>
      {/* Border glow */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(14, 0.1, 10)]} />
        <lineBasicMaterial color="#3b82f6" opacity={0.3} transparent />
      </lineSegments>
    </group>
  );
}

function MachineBox({ machine, onClick }: { machine: Machine; onClick: (id: string) => void }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  // Get color based on status and realtime data
  const color = useMemo(() => {
    const realtime = machine.realtime;
    const temp = realtime?.temperature ?? machine.temperature;
    const vib = realtime?.vibration ?? machine.vibration;
    const status = realtime?.status ?? machine.status;

    if (status === 'stopped') return '#ef4444'; // Red
    if (temp > 90 || vib > 8) return '#ef4444'; // Red - Critical
    if (temp > 70 || vib > 6 || status === 'warning') return '#eab308'; // Yellow - Warning
    return '#22c55e'; // Green - Normal
  }, [machine]);

  const emissiveColor = useMemo(() => {
    if (color === '#ef4444') return '#ef4444';
    if (color === '#eab308') return '#eab308';
    return '#000000';
  }, [color]);

  const handleClick = useCallback((e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onClick(machine.id);
  }, [machine.id, onClick]);

  const getMachineDimensions = (type: string) => {
    switch (type) {
      case 'CNC': return [1.5, 1.2, 1.2];
      case 'Conveyor': return [2.0, 0.6, 0.8];
      case 'Robot': return [1.0, 1.8, 1.0];
      case 'Packaging': return [1.2, 1.4, 1.2];
      case 'Compressor': return [1.0, 1.0, 1.0];
      default: return [1.0, 1.0, 1.0];
    }
  };

  const [w, h, d] = getMachineDimensions(machine.type);

  useFrame((state) => {
    if (meshRef.current && (color === '#ef4444' || color === '#eab308')) {
      // Pulse effect for warning/critical machines
      const pulse = Math.sin(state.clock.elapsedTime * 3) * 0.15 + 0.35;
      (meshRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity = hovered ? 0.8 : pulse;
    }
  });

  return (
    <group position={[machine.positionX, machine.positionY, machine.positionZ]}>
      {/* Machine body */}
      <mesh
        ref={meshRef}
        onClick={handleClick}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        scale={hovered ? 1.08 : 1}
      >
        <boxGeometry args={[w, h, d]} />
        <meshStandardMaterial
          color={color}
          emissive={emissiveColor}
          emissiveIntensity={hovered ? 0.5 : 0.2}
          roughness={0.4}
          metalness={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Outline */}
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(w * 1.02, h * 1.02, d * 1.02)]} />
        <lineBasicMaterial color={hovered ? '#ffffff' : '#4a4a6a'} />
      </lineSegments>

      {/* Label */}
      <Text
        position={[0, h / 2 + 0.4, 0]}
        fontSize={0.2}
        color={hovered ? '#ffffff' : '#9ca3af'}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.01}
        outlineColor="#000000"
      >
        {machine.name}
      </Text>
    </group>
  );
}

function FactoryLights() {
  return (
    <>
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 10, 5]} intensity={0.8} />
      <directionalLight position={[-5, 5, -5]} intensity={0.3} color="#3b82f6" />
      <pointLight position={[0, 6, 0]} intensity={0.5} color="#f97316" />
      <hemisphereLight args={['#3b82f6', '#1a1a2e', 0.5]} />
    </>
  );
}

interface FactorySceneProps {
  onMachineClick?: (id: string) => void;
}

export default function FactoryScene({ onMachineClick }: FactorySceneProps) {
  const machines = useMachineStore((s) => s.machines);
  const setSelectedMachine = useMachineStore((s) => s.setSelectedMachine);

  const handleMachineClick = useCallback((id: string) => {
    const machine = machines.find((m) => m.id === id);
    if (machine) {
      setSelectedMachine(machine);
      onMachineClick?.(id);
    }
  }, [machines, setSelectedMachine, onMachineClick]);

  if (machines.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        <p>Loading factory model...</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      {/* Top-left info overlay */}
      <div className="absolute top-3 left-3 z-10 bg-gray-900/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-800">
        <p className="text-xs text-blue-400 font-medium">⌨ Drag to orbit • Scroll to zoom</p>
      </div>

      <Canvas
        camera={{ position: [6, 4, 8], fov: 50 }}
        shadows
        dpr={[1, 2]}
      >
        <FactoryLights />
        <Ground />
        <FactoryFloor />
        
        {machines.map((machine) => (
          <MachineBox
            key={machine.id}
            machine={machine}
            onClick={handleMachineClick}
          />
        ))}

        <OrbitControls
          enableDamping
          dampingFactor={0.1}
          minDistance={3}
          maxDistance={20}
          maxPolarAngle={Math.PI / 2.1}
          target={[0, 0, 0]}
        />
      </Canvas>
    </div>
  );
}
