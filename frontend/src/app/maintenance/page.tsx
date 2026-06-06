'use client';

import { useEffect, useState, useCallback } from 'react';
import { useMachineStore } from '@/stores/machineStore';
import type { MaintenanceTicket } from '@/types';
import {
  Wrench,
  Plus,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
} from 'lucide-react';

export default function MaintenancePage() {
  const { machines } = useMachineStore();
  const [tickets, setTickets] = useState<MaintenanceTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    machineId: '',
    issue: '',
    priority: 'medium' as string,
  });

  const fetchTickets = useCallback(async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/maintenance-tickets`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setTickets(data);
    } catch (err) {
      console.error('Error fetching tickets:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTickets();
    const interval = setInterval(fetchTickets, 15000);
    return () => clearInterval(interval);
  }, [fetchTickets]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.machineId || !formData.issue) return;

    setSubmitting(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/maintenance-tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      await fetchTickets();
      setShowForm(false);
      setFormData({ machineId: '', issue: '', priority: 'medium' });
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (ticketId: string, status: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}/api/maintenance-tickets/${ticketId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update ticket');
      await fetchTickets();
    } catch (err) {
      console.error('Error updating ticket:', err);
    }
  };

  const getPriorityColor = (p: string) => {
    switch (p) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'in_progress': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-400" />;
      default: return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const openCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Maintenance</h1>
          <p className="text-sm text-gray-400 mt-1">
            Track and manage maintenance tasks
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-orange-400">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              {openCount} open
            </span>
            <span className="flex items-center gap-1 text-blue-400">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              {inProgressCount} in progress
            </span>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Ticket
          </button>
          <button onClick={fetchTickets} className="btn-secondary">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Create Ticket Form */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6 w-full max-w-lg shadow-2xl animate-slide-in">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Create Maintenance Ticket</h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
              >
                <Plus className="w-5 h-5 text-gray-400 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Machine
                </label>
                <select
                  value={formData.machineId}
                  onChange={(e) => setFormData({ ...formData, machineId: e.target.value })}
                  className="select-field"
                  required
                >
                  <option value="">Select a machine...</option>
                  {machines.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Issue Description
                </label>
                <textarea
                  value={formData.issue}
                  onChange={(e) => setFormData({ ...formData, issue: e.target.value })}
                  className="input-field min-h-[80px] resize-none"
                  placeholder="Describe the maintenance issue..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-400 mb-1.5">
                  Priority
                </label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setFormData({ ...formData, priority: p })}
                      className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium capitalize border transition-all ${
                        formData.priority === p
                          ? getPriorityColor(p)
                          : 'bg-gray-800/50 text-gray-500 border-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Ticket'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tickets List */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500 animate-pulse">Loading tickets...</div>
        </div>
      ) : tickets.length === 0 ? (
        <div className="text-center py-16">
          <Wrench className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500">No maintenance tickets</p>
          <p className="text-xs text-gray-600 mt-1">Create a ticket to start tracking maintenance work</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-gray-900/80 backdrop-blur-sm border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <div className="p-2 rounded-lg bg-gray-800">
                    <Wrench className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-white">{ticket.issue}</h3>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      {ticket.machine && (
                        <span>{ticket.machine.name} ({ticket.machine.type})</span>
                      )}
                      <span>•</span>
                      <span className="font-mono">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </span>
                      {ticket.assignedUser && (
                        <>
                          <span>•</span>
                          <span>Assigned to: {ticket.assignedUser.name}</span>
                        </>
                      )}
                    </div>

                    {/* Logs */}
                    {ticket.logs && ticket.logs.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-800">
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500 mb-2">
                          <MessageSquare className="w-3 h-3" />
                          Activity Log
                        </div>
                        {ticket.logs.map((log) => (
                          <div key={log.id} className="text-xs text-gray-400 py-1">
                            <span className="text-gray-500 font-mono">
                              {new Date(log.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}
                            </span>
                            {' — '}
                            {log.action}
                            {log.performedBy && (
                              <span className="text-gray-600"> by {log.performedBy}</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {getStatusIcon(ticket.status)}
                  <span className="text-xs capitalize text-gray-400">
                    {ticket.status.replace('_', ' ')}
                  </span>
                  {ticket.status !== 'completed' && (
                    <div className="flex gap-1 ml-2">
                      {ticket.status === 'open' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket.id, 'in_progress')}
                          className="px-2 py-1 text-[10px] bg-blue-600/20 text-blue-400 rounded hover:bg-blue-600/30 transition-colors"
                        >
                          Start
                        </button>
                      )}
                      {ticket.status === 'in_progress' && (
                        <button
                          onClick={() => handleStatusUpdate(ticket.id, 'completed')}
                          className="px-2 py-1 text-[10px] bg-green-600/20 text-green-400 rounded hover:bg-green-600/30 transition-colors"
                        >
                          Complete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
