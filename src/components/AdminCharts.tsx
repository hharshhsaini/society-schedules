'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { ResidentResponse } from '@/lib/types';
import { countByCategory, countVotesBySlotId, getSlotLabel } from '@/lib/slots';

interface AdminChartsProps {
  responses: ResidentResponse[];
}

const COLORS = ['#1D2550', '#F5B400', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316'];

export function AdminCharts({ responses }: AdminChartsProps) {
  // 1. Calculate slot breakdown (one response can select several slots)
  const slotCounts = countVotesBySlotId(responses);

  const slotData = Object.entries(slotCounts).map(([slotId, count]) => ({
    slot: getSlotLabel(slotId).replace(' – ', '-'),
    count,
  }));

  // 2. Calculate Morning vs Evening ratio.
  // Use the real counts so a one-sided result (e.g. all morning) renders as
  // 100/0, not 50/50. Only when there are no votes at all do we show a single
  // neutral slice, so the donut is not blank.
  const { morningCount, eveningCount } = countByCategory(responses);
  const hasSlotVotes = morningCount + eveningCount > 0;

  // Colour travels with each datum, so dropping a zero slice never shifts the
  // remaining one onto the wrong colour.
  const pieData = hasSlotVotes
    ? [
        { name: 'Morning Slots (AM)', value: morningCount, color: '#1D2550' },
        { name: 'Evening Slots (PM)', value: eveningCount, color: '#F5B400' },
      ].filter((d) => d.value > 0)
    : [{ name: 'No votes yet', value: 1, color: '#E2E8F0' }];

  // 3. Society Breakdown
  const societyCounts: Record<string, number> = {};
  responses.forEach((r) => {
    societyCounts[r.societyName] = (societyCounts[r.societyName] || 0) + 1;
  });

  const societyData = Object.entries(societyCounts).map(([name, count]) => ({
    name: name.length > 15 ? name.substring(0, 15) + '...' : name,
    count,
  }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Time Slot Popularity Bar Chart */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1D2550]">Time Slot Demand Breakdown</h3>
          <p className="text-xs text-slate-500">Total votes per morning and evening timing slot</p>
        </div>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={slotData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
              <XAxis dataKey="slot" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #CBD5E1', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="count" fill="#1D2550" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Morning vs Evening Pie Chart */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-[#1D2550]">Morning vs. Evening Ratio</h3>
          <p className="text-xs text-slate-500">Overall preference distribution</p>
        </div>
        <div className="h-64 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
