"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, CAR_BRANDS, CAR_TYPES } from "@/lib/types";
import PosterCard from "./PosterCard";
import { ChevronDown } from "lucide-react";

/* ─── Price slider ───────────────────────────────────────────── */
const SLIDER_MIN = 0;
const SLIDER_MAX = 5000000;
const SLIDER_STEP = 50000;

function fmtPrice(v: number) {
  if (v >= 1000000) return `₱${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `₱${Math.round(v / 1000)}k`;
  return `₱${v}`;
}

function PriceSlider({
  min, max, onMinChange, onMaxChange,
}: {
  min: number; max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const leftPct = ((min - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const rightPct = ((max - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  const thumbCls =
    "absolute w-full h-0 appearance-none bg-transparent pointer-events-none " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#cc1111] " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0a0a0a] " +
    "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-webkit-slider-thumb]:pointer-events-auto " +
    "[&::-moz-range-thumb]:w-3.5 [&::-moz-range-thumb]:h-3.5 [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:bg-[#cc1111] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0a0a0a] " +
    "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto";

  return (
    <div className="w-full">
      <div className="flex justify-between text-xs font-semibold text-white mb-3">
        <span>{fmtPrice(min)}</span>
        <span>{max >= SLIDER_MAX ? `${fmtPrice(SLIDER_MAX)}+` : fmtPrice(max)}</span>
      </div>
      <div className="relative h-px bg-[#2a2a2a]">
        <div
          className="absolute h-px bg-[#cc1111]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        <input type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={SLIDER_STEP} value={min}
          onChange={(e) => { const v = Number(e.target.value); if (v <= max - SLIDER_STEP) onMinChange(v); }}
          className={thumbCls} />
        <input type="range" min={SLIDER_MIN} max={SLIDER_MAX} step={SLIDER_STEP} value={max}
          onChange={(e) => { const v = Number(e.target.value); if (v >= min + SLIDER_STEP) onMaxChange(v); }}
          className={thumbCls} />
      </div>
      <div className="flex justify-between text-[10px] text-[#444] mt-2">
        <span>{fmtPrice(SLIDER_MIN)}</span>
        <span>{fmtPrice(SLIDER_MAX)}+</span>
      </div>
    </div>
  );
}

/* ─── Types ──────────────────────────────────────────────────── */
interface Filters {
  brand: string;
  carType: string;
  priceMin: number;
  priceMax: number;
  sort: string;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
  { label: "Most Viewed", value: "views" },
];

/* ─── Main component ─────────────────────────────────────────── */
export default function BrochureGrid({ cars }: { cars: Car[] }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    brand: searchParams.get("brand") || "",
    carType: searchParams.get("carType") || "",
    priceMin: SLIDER_MIN,
    priceMax: SLIDER_MAX,
    sort: "newest",
  });
  const [mobileOpen, setMobileOpen] = useState(false);
  const [page, setPage] = useState(18);

  const priceActive = filters.priceMin > SLIDER_MIN || filters.priceMax < SLIDER_MAX;
  const activeCount = [filters.brand, filters.carType, priceActive].filter(Boolean).length;

  const filtered = useMemo(() => {
    let r = [...cars];
    if (filters.brand) r = r.filter((c) => c.brand === filters.brand);
    if (filters.carType) r = r.filter((c) => c.carType === filters.carType);
    r = r.filter((c) => c.sellingPrice >= filters.priceMin && c.sellingPrice <= filters.priceMax);
    switch (filters.sort) {
      case "price_asc": r.sort((a, b) => a.sellingPrice - b.sellingPrice); break;
      case "price_desc": r.sort((a, b) => b.sellingPrice - a.sellingPrice); break;
      case "views": r.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)); break;
      default: r.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return r;
  }, [cars, filters]);

  function clear() {
    setFilters({ brand: "", carType: "", priceMin: SLIDER_MIN, priceMax: SLIDER_MAX, sort: "newest" });
  }

  /* ── Sidebar content (shared desktop/mobile) ── */
  const sidebar = (
    <div className="space-y-7">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-white">Filters</p>
        {activeCount > 0 && (
          <button onClick={clear} className="text-[10px] tracking-widest uppercase text-[#cc1111] hover:text-red-400 transition-colors">
            Clear All
          </button>
        )}
      </div>

      {/* Count */}
      <p className="text-[#444] text-xs">
        <span className="text-white font-semibold">{filtered.length}</span> unit{filtered.length !== 1 ? "s" : ""} available
      </p>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Brand */}
      <div>
        <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#444] block mb-2.5">Brand</label>
        <div className="relative">
          <select
            value={filters.brand}
            onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
            className="w-full appearance-none bg-[#0f0f0f] border border-[#1f1f1f] text-white text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111] cursor-pointer"
          >
            <option value="">All Brands</option>
            {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#444] block mb-2.5">Type</label>
        <div className="relative">
          <select
            value={filters.carType}
            onChange={(e) => setFilters((f) => ({ ...f, carType: e.target.value }))}
            className="w-full appearance-none bg-[#0f0f0f] border border-[#1f1f1f] text-white text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111] cursor-pointer"
          >
            <option value="">All Types</option>
            {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <ChevronDown size={11} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#444] pointer-events-none" />
        </div>
      </div>

      {/* Price */}
      <div>
        <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#444] block mb-4">Budget</label>
        <PriceSlider
          min={filters.priceMin}
          max={filters.priceMax}
          onMinChange={(v) => setFilters((f) => ({ ...f, priceMin: v }))}
          onMaxChange={(v) => setFilters((f) => ({ ...f, priceMax: v }))}
        />
      </div>

      <div className="h-px bg-[#1a1a1a]" />

      {/* Sort */}
      <div>
        <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#444] block mb-2">Sort By</label>
        <div className="space-y-0.5">
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setFilters((f) => ({ ...f, sort: o.value }))}
              className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                filters.sort === o.value
                  ? "text-[#cc1111] bg-[#cc1111]/5"
                  : "text-[#555] hover:text-white"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-64px)] bg-[#0a0a0a]">

      {/* ── Desktop sidebar ── */}
      <aside className="hidden lg:block w-60 xl:w-64 shrink-0 border-r border-[#141414]">
        <div className="sticky top-16 h-[calc(100vh-64px)] overflow-y-auto p-6">
          {sidebar}
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0">

        {/* Mobile filter bar */}
        <div className="lg:hidden sticky top-16 z-40 bg-[#0a0a0a] border-b border-[#141414] px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${
              mobileOpen || activeCount > 0
                ? "border-[#cc1111] text-[#cc1111]"
                : "border-[#1f1f1f] text-[#555] hover:border-[#cc1111] hover:text-[#cc1111]"
            }`}
          >
            Filters
            {activeCount > 0 && (
              <span className="bg-[#cc1111] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {activeCount}
              </span>
            )}
          </button>
          <span className="text-[#444] text-xs ml-auto">
            <span className="text-white font-semibold">{filtered.length}</span> units
          </span>
        </div>

        {/* Mobile filter panel */}
        {mobileOpen && (
          <div className="lg:hidden bg-[#0d0d0d] border-b border-[#141414] p-6">
            {sidebar}
          </div>
        )}

        {/* Grid */}
        <div className="p-4 sm:p-6">
          {filtered.length === 0 ? (
            <div className="text-center py-32">
              <p className="font-display text-5xl text-[#1a1a1a] uppercase tracking-widest mb-4">No Units</p>
              <p className="text-[#444] text-sm mb-6">No cars match your current filters.</p>
              <button
                onClick={clear}
                className="px-6 py-2.5 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:bg-[#cc1111] hover:text-white transition-colors"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.slice(0, page).map((car, i) => (
                  <PosterCard key={car.id} car={car} index={i} />
                ))}
              </div>

              {page < filtered.length && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setPage((p) => p + 18)}
                    className="px-10 py-3 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:bg-[#cc1111] hover:text-white transition-colors"
                  >
                    Load More
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
