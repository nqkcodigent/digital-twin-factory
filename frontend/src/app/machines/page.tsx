"use client";

import { useEffect, useState } from "react";
import { useMachineStore } from "@/stores/machineStore";
import {
  Cpu,
  Thermometer,
  Activity,
  Zap,
  Package,
  AlertTriangle,
  Calendar,
  Search,
  Filter,
  RefreshCw,
} from "lucide-react";

export default function MachinesPage() {
  const {
    machines,
    setMachines,
    setSelectedMachine,
    selectedMachine,
    loading,
  } = useMachineStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    async function fetchMachines() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/machines`,
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setMachines(data);
      } catch (err) {
        console.error("Error fetching machines:", err);
      }
    }
    fetchMachines();
    const interval = setInterval(fetchMachines, 10000);
    return () => clearInterval(interval);
  }, [setMachines]);

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      m.realtime?.status === statusFilter ||
      m.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "running":
        return "text-green-400 bg-green-500/10";
      case "warning":
        return "text-yellow-400 bg-yellow-500/10";
      case "stopped":
        return "text-red-400 bg-red-500/10";
      case "maintenance":
        return "text-blue-400 bg-blue-500/10";
      default:
        return "text-gray-400 bg-gray-500/10";
    }
  };

  const getSeverityClass = (temp: number, vib: number) => {
    if (temp > 90 || vib > 8) return "text-red-400";
    if (temp > 70 || vib > 6) return "text-yellow-400";
    return "text-white";
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Machines</h1>
          <p className="text-sm text-gray-400 mt-1">
            {machines.length} machines • Live monitoring
          </p>
        </div>
        <button
          onClick={() => {
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000"}/api/machines`,
            )
              .then((r) => r.json())
              .then(setMachines);
          }}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search machines..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-gray-500" />
          {["all", "running", "warning", "stopped", "maintenance"].map(
            (status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilter === status
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "bg-gray-800/50 text-gray-500 border border-gray-800 hover:text-gray-300"
                }`}
              >
                {status === "all" ? "All" : status.replace("_", " ")}
              </button>
            ),
          )}
        </div>
      </div>

      {/* Machine Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredMachines.map((machine) => {
          const realtime = machine.realtime;
          const temp = realtime?.temperature ?? machine.temperature;
          const vib = realtime?.vibration ?? machine.vibration;
          const power = realtime?.powerConsumption ?? machine.powerConsumption;
          const output = realtime?.productionOutput ?? machine.productionOutput;
          const status = realtime?.status ?? machine.status;

          return (
            <div
              key={machine.id}
              onClick={() => setSelectedMachine(machine)}
              className={`kpi-card cursor-pointer ${
                selectedMachine?.id === machine.id
                  ? "border-blue-500/50 ring-1 ring-blue-500/30"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-800">
                    <Cpu className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {machine.name}
                    </h3>
                    <p className="text-xs text-gray-500">{machine.type}</p>
                  </div>
                </div>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-medium capitalize ${getStatusColor(status)}`}
                >
                  {status}
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-2 bg-gray-800/50 rounded p-2">
                  <Thermometer className="w-3 h-3 text-red-400" />
                  <span
                    className={`text-xs font-mono ${getSeverityClass(temp, 0)}`}
                  >
                    {temp.toFixed(1)}°
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 rounded p-2">
                  <Activity className="w-3 h-3 text-yellow-400" />
                  <span
                    className={`text-xs font-mono ${getSeverityClass(0, vib)}`}
                  >
                    {vib.toFixed(1)} mm/s
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 rounded p-2">
                  <Zap className="w-3 h-3 text-blue-400" />
                  <span className="text-xs font-mono text-white">
                    {power.toFixed(0)} kWh
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-gray-800/50 rounded p-2">
                  <Package className="w-3 h-3 text-green-400" />
                  <span className="text-xs font-mono text-white">
                    {output} u
                  </span>
                </div>
              </div>

              {/* Footer Info */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-800">
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <AlertTriangle className="w-3 h-3" />
                  <span>{machine._count?.alerts ?? 0} alerts</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                  <Calendar className="w-3 h-3" />
                  <span>
                    {machine.lastMaintenanceDate
                      ? new Date(
                          machine.lastMaintenanceDate,
                        ).toLocaleDateString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredMachines.length === 0 && !loading && (
        <div className="text-center py-16">
          <Cpu className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">
            No machines found matching your filters
          </p>
        </div>
      )}
    </div>
  );
}
