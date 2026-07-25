'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Sparkles, Flame, ShieldCheck, Dumbbell, Flower2, Activity, CalendarHeart } from 'lucide-react';
import { SocietyCard } from '@/components/SocietyCard';
import { Society, ResidentResponse } from '@/lib/types';
import {
  getAllResponses,
  getAllSocieties,
  subscribeToResponses,
  subscribeToSocieties,
} from '@/lib/db';

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [responses, setResponses] = useState<ResidentResponse[]>([]);
  const [societies, setSocieties] = useState<Society[]>([]);

  useEffect(() => {
    async function loadStats() {
      const data = await getAllResponses();
      setResponses(data);
    }
    async function loadSocieties() {
      const data = await getAllSocieties();
      setSocieties(data);
    }
    loadStats();
    loadSocieties();

    const unsubResponses = subscribeToResponses(loadStats);
    const unsubSocieties = subscribeToSocieties(loadSocieties);
    return () => {
      unsubResponses();
      unsubSocieties();
    };
  }, []);

  // Compute vote counts per society
  const voteCounts: Record<string, number> = {};
  responses.forEach((r) => {
    voteCounts[r.societyId] = (voteCounts[r.societyId] || 0) + 1;
  });

  const filteredSocieties = societies.filter(
    (soc) =>
      soc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      soc.location.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative overflow-hidden pt-8 pb-20 sm:pt-12 sm:pb-28">
      {/* Background Subtle Gradient Blobs */}
      <div className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-amber-200/20 via-[#1D2550]/5 to-amber-300/20 blur-3xl" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 rounded-full border border-amber-300/80 bg-gradient-to-r from-amber-50 to-amber-100/50 px-4 py-1.5 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-[#F5B400]" />
            <span className="text-xs font-extrabold uppercase tracking-wider text-[#1D2550]">
              FitVed Community Yoga Initiative
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mt-6 text-4xl font-black tracking-tight text-[#1D2550] sm:text-5xl lg:text-6xl"
          >
            Choose Your Society
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-4 text-base font-medium leading-relaxed text-slate-600 sm:text-lg lg:text-xl"
          >
            Help us schedule the most convenient yoga classes for your community.
          </motion.p>

          {/* Quick Search Bar */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 mx-auto max-w-lg"
          >
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                <Search className="h-5 w-5" />
              </div>
              <input
                type="text"
                placeholder="Search your society (e.g. Sobha, Prestige, Brigade)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 bg-white py-3.5 pl-11 pr-4 text-sm font-medium text-slate-900 shadow-md transition-all placeholder:text-slate-400 focus:border-[#1D2550] focus:outline-none focus:ring-2 focus:ring-[#1D2550]/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 rounded-full bg-slate-100 p-1 text-xs text-slate-500 hover:bg-slate-200"
                >
                  Clear
                </button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Societies Grid */}
        <div className="mt-12">
          {filteredSocieties.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSocieties.map((society, index) => (
                <SocietyCard
                  key={society.id}
                  society={society}
                  index={index}
                  voteCount={voteCounts[society.id] || 0}
                />
              ))}
            </div>
          ) : (
            <div className="mt-12 rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center">
              <p className="text-lg font-bold text-slate-700">No society found matching &quot;{searchQuery}&quot;</p>
              <p className="mt-1 text-sm text-slate-500">
                Try searching for another keyword or check back soon as we add more communities!
              </p>
              <button
                onClick={() => setSearchQuery('')}
                className="mt-4 rounded-xl bg-[#1D2550] px-4 py-2 text-xs font-bold text-[#F5B400]"
              >
                Reset Search
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
