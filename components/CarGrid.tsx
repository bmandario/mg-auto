"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Car, CAR_BRANDS, CAR_TYPES } from "@/lib/types";
import CarCard from "./CarCard";
import { SlidersHorizontal, X, ChevronDown, Search } from "lucide-react";

const SLIDER_MIN = 0;
const SLIDER_MAX = 5000000;
const SLIDER_STEP = 50000;

function fmtPrice(v: number) {
  if (v >= 1000000) return `₱${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `₱${Math.round(v / 1000)}k`;
  return `₱${v}`;
}

function PriceSlider({
  min,
  max,
  onMinChange,
  onMaxChange,
}: {
  min: number;
  max: number;
  onMinChange: (v: number) => void;
  onMaxChange: (v: number) => void;
}) {
  const leftPct = ((min - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;
  const rightPct = ((max - SLIDER_MIN) / (SLIDER_MAX - SLIDER_MIN)) * 100;

  const thumbCls =
    "absolute w-full h-0 appearance-none bg-transparent pointer-events-none " +
    "[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 " +
    "[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#cc1111] " +
    "[&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white " +
    "[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer " +
    "[&::-webkit-slider-thumb]:pointer-events-auto " +
    "[&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full " +
    "[&::-moz-range-thumb]:bg-[#cc1111] [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-white " +
    "[&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:pointer-events-auto";

  return (
    <div className="w-full">
      {/* Value labels */}
      <div className="flex justify-between text-xs font-semibold text-gray-700 mb-3">
        <span>{fmtPrice(min)}</span>
        <span>{max >= SLIDER_MAX ? `${fmtPrice(SLIDER_MAX)}+` : fmtPrice(max)}</span>
      </div>

      {/* Track */}
      <div className="relative h-1.5 bg-gray-200 rounded-full">
        {/* Active range fill */}
        <div
          className="absolute h-1.5 bg-[#cc1111] rounded-full"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />
        {/* Min thumb */}
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={min}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v <= max - SLIDER_STEP) onMinChange(v);
          }}
          className={thumbCls}
        />
        {/* Max thumb */}
        <input
          type="range"
          min={SLIDER_MIN}
          max={SLIDER_MAX}
          step={SLIDER_STEP}
          value={max}
          onChange={(e) => {
            const v = Number(e.target.value);
            if (v >= min + SLIDER_STEP) onMaxChange(v);
          }}
          className={thumbCls}
        />
      </div>

      {/* Min / Max labels */}
      <div className="flex justify-between text-[10px] text-gray-400 mt-2">
        <span>{fmtPrice(SLIDER_MIN)}</span>
        <span>{fmtPrice(SLIDER_MAX)}+</span>
      </div>
    </div>
  );
}

interface Filters {
  brand: string;
  carType: string;
  priceMin: number;
  priceMax: number;
  sort: string;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Viewed", value: "views" },
];

export default function CarGrid({ cars, defaultShowFilters = false, columns = 3 }: { cars: Car[]; defaultShowFilters?: boolean; columns?: 3 | 4 }) {
  const searchParams = useSearchParams();
  const [filters, setFilters] = useState<Filters>({
    brand: searchParams.get("brand") || "",
    carType: searchParams.get("carType") || "",
    priceMin: SLIDER_MIN,
    priceMax: SLIDER_MAX,
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (defaultShowFilters) {
      setShowFilters(window.innerWidth >= 1024);
    }
  }, [defaultShowFilters]);
  const [page, setPage] = useState(12);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  const priceActive = filters.priceMin > SLIDER_MIN || filters.priceMax < SLIDER_MAX;

  const filtered = useMemo(() => {
    let result = [...cars];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((c) =>
        `${c.brand} ${c.model} ${c.year} ${c.carType}`.toLowerCase().includes(q)
      );
    }
    if (filters.brand) result = result.filter((c) => c.brand === filters.brand);
    if (filters.carType) result = result.filter((c) => c.carType === filters.carType);
    result = result.filter(
      (c) => c.sellingPrice >= filters.priceMin && c.sellingPrice <= filters.priceMax
    );

    switch (filters.sort) {
      case "price_asc":
        result.sort((a, b) => a.sellingPrice - b.sellingPrice);
        break;
      case "price_desc":
        result.sort((a, b) => b.sellingPrice - a.sellingPrice);
        break;
      case "views":
        result.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
        break;
      default:
        result.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
    }

    return result;
  }, [cars, filters, searchQuery]);

  const activeFilterCount = [filters.brand, filters.carType, priceActive].filter(Boolean).length;

  function clearFilters() {
    setFilters({ brand: "", carType: "", priceMin: SLIDER_MIN, priceMax: SLIDER_MAX, sort: "newest" });
    setSearchQuery("");
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-gray-200 py-3 mb-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-[#cc1111] text-[#cc1111] bg-red-50"
                  : "border-gray-300 text-gray-500 hover:border-[#cc1111] hover:text-[#cc1111]"
              }`}
            >
              <SlidersHorizontal size={12} />
              Filter
              {activeFilterCount > 0 && (
                <span className="bg-[#cc1111] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>

            {/* Active filter tags */}
            {filters.brand && (
              <Tag label={filters.brand} onRemove={() => setFilters((f) => ({ ...f, brand: "" }))} />
            )}
            {filters.carType && (
              <Tag label={filters.carType} onRemove={() => setFilters((f) => ({ ...f, carType: "" }))} />
            )}
            {priceActive && (
              <Tag
                label={`${fmtPrice(filters.priceMin)} – ${filters.priceMax >= SLIDER_MAX ? `${fmtPrice(SLIDER_MAX)}+` : fmtPrice(filters.priceMax)}`}
                onRemove={() => setFilters((f) => ({ ...f, priceMin: SLIDER_MIN, priceMax: SLIDER_MAX }))}
              />
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[10px] tracking-widest uppercase text-gray-400 hover:text-[#cc1111] transition-colors"
              >
                Clear All
              </button>
            )}

            {/* Search */}
            <div className="ml-auto flex items-center gap-2">
              <div className="flex items-center">
                <div
                  className={`flex items-center border border-gray-200 overflow-hidden transition-all duration-300 ${
                    searchOpen ? "w-48 sm:w-64 pl-3" : "w-0 border-0"
                  }`}
                >
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search brand, model…"
                    className="w-full text-xs text-gray-700 placeholder-gray-300 outline-none bg-transparent py-2"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="px-2 text-gray-300 hover:text-gray-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (searchOpen && searchQuery === "") setSearchOpen(false);
                    else setSearchOpen(true);
                  }}
                  className={`flex items-center justify-center w-8 h-8 border transition-colors ${
                    searchOpen || searchQuery
                      ? "border-[#cc1111] text-[#cc1111]"
                      : "border-gray-200 text-gray-400 hover:border-[#cc1111] hover:text-[#cc1111]"
                  }`}
                >
                  <Search size={13} />
                </button>
              </div>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-gray-400 text-xs hidden sm:block">Sort:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                  className="appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-2 pr-7 focus:outline-none focus:border-[#cc1111] cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded filter row */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-3 pt-3 border-t border-gray-100">
              {/* Brand */}
              <div className="relative">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block mb-2">Brand</label>
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111]"
                >
                  <option value="">All Brands</option>
                  {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 bottom-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Type */}
              <div className="relative">
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block mb-2">Type</label>
                <select
                  value={filters.carType}
                  onChange={(e) => setFilters((f) => ({ ...f, carType: e.target.value }))}
                  className="w-full appearance-none bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111]"
                >
                  <option value="">All Types</option>
                  {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 bottom-3 text-gray-400 pointer-events-none" />
              </div>

              {/* Price slider */}
              <div>
                <label className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 block mb-2">Budget</label>
                <PriceSlider
                  min={filters.priceMin}
                  max={filters.priceMax}
                  onMinChange={(v) => setFilters((f) => ({ ...f, priceMin: v }))}
                  onMaxChange={(v) => setFilters((f) => ({ ...f, priceMax: v }))}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
        <p className="text-gray-400 text-sm">
          <span className="text-gray-900 font-semibold">{filtered.length}</span> car{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-display text-5xl text-gray-200 uppercase tracking-widest mb-4">
              No Units Found
            </p>
            <p className="text-gray-400 text-sm mb-8 max-w-sm mx-auto leading-relaxed">
              {activeFilterCount > 0
                ? "No cars match your current filters. Try adjusting or clearing them."
                : "We\u2019re updating our inventory. Check back soon or leave us a message."}
            </p>
            <div className="flex justify-center gap-3 flex-wrap">
              {activeFilterCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:bg-[#cc1111] hover:text-white transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <Link
                href="/contact"
                className="px-6 py-2.5 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors"
              >
                Contact Us →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={`grid grid-cols-1 sm:grid-cols-2 gap-6 ${columns === 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
              {filtered.slice(0, page).map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {page < filtered.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setPage((p) => p + 12)}
                  className="px-10 py-3 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:bg-[#cc1111] hover:text-white transition-colors"
                >
                  Load More
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function Tag({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-[#cc1111] text-[10px] font-bold tracking-widest uppercase px-2 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-red-800">
        <X size={10} />
      </button>
    </span>
  );
}
