'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Users, Trophy, Flame, Sun, Moon, ArrowLeft, Download, RefreshCw } from 'lucide-react';
import { AdminLogin } from '@/components/AdminLogin';
import { AdminCharts } from '@/components/AdminCharts';
import { AdminTable } from '@/components/AdminTable';
import { AddSocietyForm } from '@/components/AddSocietyForm';
import { SocietyImage } from '@/components/SocietyImage';
import { ResidentResponse, Society } from '@/lib/types';
import {
  fetchAllResponses,
  deleteResponse,
  subscribeToResponses,
  getAllSocieties,
  deleteSociety,
  subscribeToSocieties,
} from '@/lib/db';
import { countByCategory, countVotesBySlotId, getSlotLabel } from '@/lib/slots';
import { Trash2, MapPin } from 'lucide-react';

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [responses, setResponses] = useState<ResidentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionError, setActionError] = useState<string | null>(null);
  const [dbError, setDbError] = useState<string | null>(null);
  const [societies, setSocieties] = useState<Society[]>([]);

  const fetchResponses = async () => {
    setLoading(true);
    try {
      const { data, error } = await fetchAllResponses();
      setResponses(data);
      setDbError(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSocieties = async () => {
    setSocieties(await getAllSocieties());
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchResponses();
      fetchSocieties();

      const unsubResponses = subscribeToResponses(fetchResponses);
      const unsubSocieties = subscribeToSocieties(fetchSocieties);
      return () => {
        unsubResponses();
        unsubSocieties();
      };
    }
  }, [isAuthenticated]);

  const handleDelete = async (id: string) => {
    setActionError(null);
    try {
      await deleteResponse(id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not delete the entry.');
    }
    await fetchResponses();
  };

  const handleDeleteSociety = async (society: Society) => {
    if (!confirm(`Remove "${society.name}"? Its existing votes are kept.`)) return;
    setActionError(null);
    try {
      await deleteSociety(society.id);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Could not remove the society.');
    }
    await fetchSocieties();
  };

  if (!isAuthenticated) {
    return <AdminLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  // Calculate Overview Stats
  const totalResponses = responses.length;

  // Votes per society id, for the manage-societies list
  const societyVoteCounts: Record<string, number> = {};
  responses.forEach((r) => {
    societyVoteCounts[r.societyId] = (societyVoteCounts[r.societyId] || 0) + 1;
  });

  // Top Society
  const societyCounts: Record<string, number> = {};
  responses.forEach((r) => {
    societyCounts[r.societyName] = (societyCounts[r.societyName] || 0) + 1;
  });
  let topSociety = 'N/A';
  let topSocietyCount = 0;
  Object.entries(societyCounts).forEach(([soc, count]) => {
    if (count > topSocietyCount) {
      topSocietyCount = count;
      topSociety = soc;
    }
  });

  // Top Slot — counted per selected slot, since one response can hold several
  const slotCounts = countVotesBySlotId(responses);
  let topSlot = 'N/A';
  let topSlotCount = 0;
  Object.entries(slotCounts).forEach(([slotId, count]) => {
    if (count > topSlotCount) {
      topSlotCount = count;
      topSlot = getSlotLabel(slotId);
    }
  });

  // Morning vs Evening count
  const { morningCount, eveningCount } = countByCategory(responses);
  const totalSlotSelections = morningCount + eveningCount;

  const morningPercent =
    totalSlotSelections > 0 ? Math.round((morningCount / totalSlotSelections) * 100) : 50;

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Top Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-[#1D2550]"
            >
              <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
            </Link>
            <span className="text-slate-300">&bull;</span>
            <span className="inline-flex items-center gap-1 rounded-full bg-[#1D2550] px-2.5 py-0.5 text-[10px] font-extrabold text-[#F5B400]">
              <Shield className="h-3 w-3" /> Secure Admin Dashboard
            </span>
          </div>

          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#1D2550] sm:text-4xl">
            Community Poll Analytics
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time voting metrics and resident directory across societies
          </p>
        </div>

        <button
          onClick={fetchResponses}
          disabled={loading}
          className="flex items-center gap-2 rounded-xl bg-[#1D2550] px-4 py-2.5 text-xs font-bold text-[#F5B400] shadow-md hover:bg-[#28336A] active:scale-95"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Realtime Data</span>
        </button>
      </div>

      {dbError && (
        <div className="mt-6 rounded-2xl border border-amber-300 bg-amber-50 px-5 py-4">
          <p className="text-sm font-black text-[#1D2550]">Database not connected</p>
          <p className="mt-1 text-sm font-medium text-amber-900">{dbError}</p>
          <p className="mt-2 text-xs text-amber-800">
            Until this is fixed the dashboard shows 0 because no responses can be read —
            it does not mean residents have not voted.
          </p>
        </div>
      )}

      {actionError && (
        <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {actionError}
        </div>
      )}

      {/* Overview Stat Cards Grid */}
      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Votes */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Responses
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-[#1D2550]">{totalResponses}</p>
          <p className="mt-1 text-xs text-slate-500">Total resident votes cast</p>
        </div>

        {/* Top Society */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Top Society
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Trophy className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-xl font-black text-[#1D2550] truncate">{topSociety}</p>
          <p className="mt-1 text-xs text-slate-500">
            {topSocietyCount} resident votes ({totalResponses > 0 ? Math.round((topSocietyCount / totalResponses) * 100) : 0}%)
          </p>
        </div>

        {/* Top Slot */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Most Voted Slot
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Flame className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-lg font-black text-[#1D2550] truncate">{topSlot}</p>
          <p className="mt-1 text-xs text-slate-500">
            {topSlotCount} total votes
          </p>
        </div>

        {/* Morning Ratio */}
        <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Morning vs. Evening
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Sun className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-2 text-3xl font-black text-[#1D2550]">{morningPercent}% AM</p>
          <p className="mt-1 text-xs text-slate-500">
            {morningCount} Morning vs {eveningCount} Evening
          </p>
        </div>
      </div>

      {/* Recharts Graphical Visualizations */}
      <div className="mt-8">
        <AdminCharts responses={responses} />
      </div>

      {/* Manage Societies */}
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AddSocietyForm onAdded={fetchSocieties} />

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-black text-[#1D2550]">
            Societies <span className="text-slate-400">({societies.length})</span>
          </h3>
          <p className="text-xs text-slate-500">
            Built-in communities are permanent; ones you add can be removed.
          </p>

          <div className="mt-4 max-h-[26rem] space-y-2 overflow-y-auto pr-1">
            {societies.map((society) => {
              const votes = societyVoteCounts[society.id] || 0;
              return (
                <div
                  key={society.id}
                  className="flex items-center gap-3 rounded-2xl border border-slate-200/80 p-2.5"
                >
                  <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    <SocietyImage src={society.image} alt={society.name} className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-[#1D2550]">{society.name}</p>
                    <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                      <MapPin className="h-3 w-3 shrink-0 text-[#F5B400]" />
                      {society.location}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold text-slate-600">
                    {votes} {votes === 1 ? 'vote' : 'votes'}
                  </span>
                  {society.editable ? (
                    <button
                      onClick={() => handleDeleteSociety(society)}
                      className="shrink-0 rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                      title="Remove society"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : (
                    <span className="shrink-0 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Built-in
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Directory Data Table */}
      <div className="mt-8">
        <AdminTable
          responses={responses}
          onDelete={handleDelete}
          onRefresh={fetchResponses}
        />
      </div>
    </div>
  );
}
