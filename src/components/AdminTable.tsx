'use client';

import { useState } from 'react';
import { Search, Download, Trash2, Filter, RefreshCw, MessageSquare, Phone } from 'lucide-react';
import { ResidentResponse } from '@/lib/types';
import { exportResponsesToCSV, exportResponsesToExcel } from '@/lib/export';
import { POLL_SLOTS } from '@/data/pollSlots';
import { parseSlotIds } from '@/lib/slots';

interface AdminTableProps {
  responses: ResidentResponse[];
  onDelete: (id: string) => Promise<void>;
  onRefresh: () => void;
}

export function AdminTable({ responses, onDelete, onRefresh }: AdminTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [societyFilter, setSocietyFilter] = useState('ALL');
  const [slotFilter, setSlotFilter] = useState('ALL');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Extract unique societies
  const uniqueSocieties = Array.from(new Set(responses.map((r) => r.societyName)));

  // Filter responses
  const filteredResponses = responses.filter((r) => {
    const matchesSearch =
      r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.phoneNumber.includes(searchTerm) ||
      (r.apartment && r.apartment.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSociety = societyFilter === 'ALL' || r.societyName === societyFilter;
    const matchesSlot =
      slotFilter === 'ALL' || parseSlotIds(r.slotId).includes(slotFilter);

    return matchesSearch && matchesSociety && matchesSlot;
  });

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this resident entry?')) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* Table Header Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h3 className="text-xl font-extrabold text-[#1D2550]">Resident Response Directory</h3>
          <p className="text-xs text-slate-500">
            Showing {filteredResponses.length} of {responses.length} total votes
          </p>
        </div>

        {/* Action Buttons: Export CSV & Excel */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onRefresh}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Refresh</span>
          </button>

          <button
            onClick={() => exportResponsesToCSV(filteredResponses)}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-[#1D2550] shadow-2xs hover:bg-slate-50"
          >
            <Download className="h-3.5 w-3.5 text-[#F5B400]" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => exportResponsesToExcel(filteredResponses)}
            className="flex items-center gap-1.5 rounded-xl bg-[#1D2550] px-3.5 py-2 text-xs font-bold text-[#F5B400] shadow-md hover:bg-[#28336A]"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* Search Input */}
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            placeholder="Search by name, phone, or tower..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 pl-9 pr-3 text-xs font-medium text-slate-900 focus:border-[#1D2550] focus:bg-white focus:outline-none"
          />
        </div>

        {/* Filter by Society */}
        <div className="relative">
          <select
            value={societyFilter}
            onChange={(e) => setSocietyFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:border-[#1D2550] focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Societies ({uniqueSocieties.length})</option>
            {uniqueSocieties.map((soc) => (
              <option key={soc} value={soc}>
                {soc}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Time Slot */}
        <div className="relative">
          <select
            value={slotFilter}
            onChange={(e) => setSlotFilter(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3 text-xs font-medium text-slate-900 focus:border-[#1D2550] focus:bg-white focus:outline-none"
          >
            <option value="ALL">All Time Slots</option>
            {POLL_SLOTS.map((slot) => (
              <option key={slot.id} value={slot.id}>
                {slot.label} ({slot.category.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Response Table */}
      <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-200/80">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 uppercase text-slate-500 font-bold text-[10px] tracking-wider border-b border-slate-200">
            <tr>
              <th className="py-3 px-4">Resident Name</th>
              <th className="py-3 px-4">Society</th>
              <th className="py-3 px-4">Selected Timing</th>
              <th className="py-3 px-4">Mobile & WhatsApp</th>
              <th className="py-3 px-4">Apartment / Tower</th>
              <th className="py-3 px-4">Submitted At</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
            {filteredResponses.length > 0 ? (
              filteredResponses.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1D2550]">
                    {r.name}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold text-slate-800">
                      {r.societyName}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center gap-1 font-extrabold text-[#1D2550] bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200">
                      {r.slotLabel}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-800">
                        <Phone className="h-3 w-3 text-slate-400" />
                        {r.phoneNumber}
                      </span>
                      {r.whatsapp && (
                        <span className="flex items-center gap-1 text-[11px] text-emerald-600">
                          <MessageSquare className="h-3 w-3" />
                          WA: {r.whatsapp}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">
                    {r.apartment || '-'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-500">
                    {new Date(r.createdAt).toLocaleString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(r.id)}
                      disabled={deletingId === r.id}
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                      title="Delete Entry"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No resident responses match your current filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
