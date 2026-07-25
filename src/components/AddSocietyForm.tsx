'use client';

import { useRef, useState } from 'react';
import { Building2, ImagePlus, Loader2, Plus, X } from 'lucide-react';
import { addSociety } from '@/lib/db';
import { Society } from '@/lib/types';

interface AddSocietyFormProps {
  onAdded: (society: Society) => void;
}

/**
 * Downscales the chosen photo in the browser and returns a JPEG data URL.
 * Keeping it small (max 720px, q0.72) matters because the image is stored
 * inline in the societies row and shipped to every visitor on the landing page.
 */
function fileToCompressedDataUrl(file: File, maxWidth = 720): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the image file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('That file is not a readable image.'));
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported in this browser.'));
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.72));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export function AddSocietyForm({ onAdded }: AddSocietyFormProps) {
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [unitsCount, setUnitsCount] = useState('');
  const [description, setDescription] = useState('');
  const [badge, setBadge] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [imageName, setImageName] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okName, setOkName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file (JPG, PNG, or WebP).');
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setImageDataUrl(dataUrl);
      setImageName(file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not process that image.');
    }
  };

  const reset = () => {
    setName('');
    setLocation('');
    setUnitsCount('');
    setDescription('');
    setBadge('');
    setImageDataUrl('');
    setImageName('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOkName(null);

    if (!name.trim() || !location.trim() || !unitsCount.trim()) {
      setError('Name, location, and units are required.');
      return;
    }
    if (!imageDataUrl) {
      setError('Please upload a photo of the society.');
      return;
    }

    setSubmitting(true);
    try {
      const society = await addSociety({
        name,
        location,
        unitsCount,
        description,
        badge,
        image: imageDataUrl,
      });
      setOkName(society.name);
      reset();
      onAdded(society);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not add the society.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full rounded-xl border border-slate-200 bg-slate-50/60 px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-[#1D2550] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D2550]/20';

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D2550] text-[#F5B400]">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-lg font-black text-[#1D2550]">Add a Society</h3>
          <p className="text-xs text-slate-500">
            New communities appear on the home page instantly with the standard yoga timing slots.
          </p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Society Name<span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Prestige Lakeside Habitat"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Location<span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. Whitefield, Bangalore"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Units / Size<span className="text-red-500">*</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. 3000+ Units"
            value={unitsCount}
            onChange={(e) => setUnitsCount(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Badge <span className="font-medium text-slate-400">(optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="e.g. 🔥 New"
            value={badge}
            onChange={(e) => setBadge(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
            Description <span className="font-medium text-slate-400">(optional)</span>
          </label>
          <input
            className={inputClass}
            placeholder="One line about the community"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>
      </div>

      {/* Photo upload */}
      <div className="mt-4">
        <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-600">
          Society Photo<span className="text-red-500">*</span>
        </label>

        {imageDataUrl ? (
          <div className="relative overflow-hidden rounded-2xl border border-slate-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageDataUrl} alt="Preview" className="h-44 w-full object-cover" />
            <button
              type="button"
              onClick={() => {
                setImageDataUrl('');
                setImageName('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute right-2 top-2 flex items-center gap-1 rounded-lg bg-black/60 px-2 py-1 text-[11px] font-bold text-white backdrop-blur-sm"
            >
              <X className="h-3.5 w-3.5" /> Remove
            </button>
            <span className="absolute bottom-2 left-2 max-w-[70%] truncate rounded-lg bg-black/60 px-2 py-1 text-[11px] font-medium text-white">
              {imageName}
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex h-44 w-full flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50/50 text-slate-500 transition-colors hover:border-[#1D2550] hover:text-[#1D2550]"
          >
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm font-bold">Click to upload a photo</span>
            <span className="text-xs text-slate-400">JPG, PNG or WebP — auto-compressed</span>
          </button>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>

      {error && (
        <p className="mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
      {okName && (
        <p className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
          “{okName}” added. It is now live on the home page.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D2550] py-3 text-sm font-bold text-[#F5B400] shadow-md transition-all hover:bg-[#28336A] active:scale-95 disabled:opacity-60"
      >
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" /> Adding…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" /> Add Society
          </>
        )}
      </button>
    </form>
  );
}
