import Link from 'next/link';
import { Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200/80 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 text-center sm:flex-row sm:px-6 sm:text-left lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D2550]">
            <span className="text-xs font-black text-[#F5B400]">FV</span>
          </div>
          <p className="text-sm font-medium text-slate-600">
            FitVed &copy; {new Date().getFullYear()} &bull; Empowering Society Wellness
          </p>
        </div>

        <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
          Crafted with <Heart className="h-3.5 w-3.5 fill-red-500 text-red-500 inline" /> for Bangalore Residential Communities
        </p>
      </div>
    </footer>
  );
}
