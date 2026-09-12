"use client";

import { useState, useMemo } from "react";
import { Car, CAR_BRANDS, CAR_TYPES, PRICE_RANGES } from "@/lib/types";
import CarCard from "./CarCard";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

interface Filters {
  brand: string;
  carType: string;
  priceRange: number;
  sort: string;
}

const SORT_OPTIONS = [
  { label: "Newest First", value: "newest" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
  { label: "Most Viewed", value: "views" },
];

export default function CarGrid({ cars }: { cars: Car[] }) {
  const [filters, setFilters] = useState<Filters>({
    brand: "",
    carType: "",
    priceRange: -1,
    sort: "newest",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(12);

  const filtered = useMemo(() => {
    let result = [...cars];

    if (filters.brand) result = result.filter((c) => c.brand === filters.brand);
    if (filters.carType) result = result.filter((c) => c.carType === filters.carType);
    if (filters.priceRange >= 0) {
      const range = PRICE_RANGES[filters.priceRange];
      result = result.filter(
        (c) => c.sellingPrice >= range.min && c.sellingPrice <= range.max
      );
    }

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
  }, [cars, filters]);

  const activeFilterCount = [filters.brand, filters.carType, filters.priceRange >= 0].filter(Boolean).length;

  function clearFilters() {
    setFilters({ brand: "", carType: "", priceRange: -1, sort: "newest" });
  }

  return (
    <div>
      {/* Filter bar */}
      <div className="sticky top-16 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-[#1f1f1f] py-3 mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Filter toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold tracking-widest uppercase border transition-colors ${
                showFilters || activeFilterCount > 0
                  ? "border-[#cc1111] text-[#cc1111] bg-[#cc1111]/10"
                  : "border-[#2a2a2a] text-[#888] hover:border-[#cc1111] hover:text-[#cc1111]"
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
            {filters.priceRange >= 0 && (
              <Tag
                label={PRICE_RANGES[filters.priceRange].label}
                onRemove={() => setFilters((f) => ({ ...f, priceRange: -1 }))}
              />
            )}
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-[10px] tracking-widest uppercase text-[#555] hover:text-[#cc1111] transition-colors"
              >
                Clear All
              </button>
            )}

            {/* Sort — pushed right */}
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[#555] text-xs hidden sm:block">Sort:</span>
              <div className="relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((f) => ({ ...f, sort: e.target.value }))}
                  className="appearance-none bg-[#111] border border-[#2a2a2a] text-[#aaa] text-xs px-3 py-2 pr-7 focus:outline-none focus:border-[#cc1111] cursor-pointer"
                >
                  {SORT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Expanded filter row */}
          {showFilters && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3 pt-3 border-t border-[#1f1f1f]">
              {/* Brand */}
              <div className="relative">
                <select
                  value={filters.brand}
                  onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value }))}
                  className="w-full appearance-none bg-[#111] border border-[#2a2a2a] text-[#aaa] text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111]"
                >
                  <option value="">All Brands</option>
                  {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>

              {/* Type */}
              <div className="relative">
                <select
                  value={filters.carType}
                  onChange={(e) => setFilters((f) => ({ ...f, carType: e.target.value }))}
                  className="w-full appearance-none bg-[#111] border border-[#2a2a2a] text-[#aaa] text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111]"
                >
                  <option value="">All Types</option>
                  {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>

              {/* Price range */}
              <div className="relative">
                <select
                  value={filters.priceRange}
                  onChange={(e) => setFilters((f) => ({ ...f, priceRange: Number(e.target.value) }))}
                  className="w-full appearance-none bg-[#111] border border-[#2a2a2a] text-[#aaa] text-xs px-3 py-2.5 pr-7 focus:outline-none focus:border-[#cc1111]"
                >
                  <option value={-1}>All Prices</option>
                  {PRICE_RANGES.map((r, i) => <option key={i} value={i}>{r.label}</option>)}
                </select>
                <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-[#555] pointer-events-none" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results count */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <p className="text-[#555] text-sm">
          <span className="text-white font-semibold">{filtered.length}</span> car{filtered.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#444] text-lg mb-2">No cars match your filters.</p>
            <button onClick={clearFilters} className="text-[#cc1111] text-sm hover:underline">
              Clear filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.slice(0, page).map((car) => (
                <CarCard key={car.id} car={car} />
              ))}
            </div>

            {page < filtered.length && (
              <div className="text-center mt-12">
                <button
                  onClick={() => setPage((p) => p + 12)}
                  className="font-heading px-10 py-3 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:bg-[#cc1111] hover:text-white transition-colors"
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
    <span className="flex items-center gap-1.5 bg-[#cc1111]/20 border border-[#cc1111]/40 text-[#cc1111] text-[10px] font-bold tracking-widest uppercase px-2 py-1">
      {label}
      <button onClick={onRemove} className="hover:text-white">
        <X size={10} />
      </button>
    </span>
  );
}
