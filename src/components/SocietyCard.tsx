'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, MapPin, Users, Flame } from 'lucide-react';
import { Society } from '@/lib/types';

interface SocietyCardProps {
  society: Society;
  index: number;
  voteCount?: number;
}

export function SocietyCard({ society, index, voteCount = 0 }: SocietyCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: 'easeOut' }}
    >
      <Link
        href={`/society/${society.slug}`}
        className="group relative flex flex-col overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#1D2550]/30 hover:shadow-2xl hover:shadow-[#1D2550]/10 active:scale-[0.99]"
      >
        {/* Top Image Container with Zoom & Gradient */}
        <div className="relative h-56 w-full overflow-hidden bg-slate-100">
          <Image
            src={society.image}
            alt={society.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            priority={index < 3}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Badge Top Left */}
          {society.badge && (
            <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 rounded-full bg-[#1D2550]/90 px-3 py-1 text-xs font-semibold text-[#F5B400] shadow-lg backdrop-blur-md">
              <Flame className="h-3.5 w-3.5 fill-[#F5B400] text-[#F5B400]" />
              <span>{society.badge}</span>
            </div>
          )}

          {/* Live Interest Badge Top Right */}
          {voteCount > 0 && (
            <div className="absolute top-4 right-4 z-10 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#1D2550] shadow-md backdrop-blur-md">
              🔥 {voteCount} votes
            </div>
          )}

          {/* Location & Unit Tag at bottom of image */}
          <div className="absolute bottom-4 left-4 right-4 z-10 flex items-center justify-between text-white">
            <span className="flex items-center gap-1 text-xs font-medium text-white/90">
              <MapPin className="h-3.5 w-3.5 text-[#F5B400]" />
              {society.location}
            </span>
            <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-medium backdrop-blur-sm">
              <Users className="h-3 w-3 text-[#F5B400]" />
              {society.unitsCount}
            </span>
          </div>
        </div>

        {/* Card Body */}
        <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
          <div>
            <h3 className="text-xl font-bold tracking-tight text-[#1D2550] transition-colors group-hover:text-[#F5B400] sm:text-2xl">
              {society.name}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">
              {society.description}
            </p>
          </div>

          {/* Bottom Action Row */}
          <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
            <span className="text-xs font-semibold text-[#1D2550] group-hover:underline">
              Cast Preferred Timing
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1D2550] text-[#F5B400] transition-transform duration-300 group-hover:translate-x-1 group-hover:bg-[#F5B400] group-hover:text-[#1D2550]">
              <ArrowRight className="h-4 w-4" />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
