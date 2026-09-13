"use client";

import { useEffect, useState, useMemo } from "react";
import { getCars } from "@/lib/cars";
import { getInquiries } from "@/lib/inquiries";
import { Car, Inquiry } from "@/lib/types";
import { Download, TrendingUp, Package, PieChart, Users } from "lucide-react";
import * as XLSX from "xlsx";

type ReportTab = "sales" | "inventory" | "profit" | "partner";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);

type FilterMode = "month" | "year" | "range";

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export default function ReportsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<ReportTab>("sales");

  // Filters
  const [filterMode, setFilterMode] = useState<FilterMode>("year");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-indexed
  const [rangeFrom, setRangeFrom] = useState(() => `${currentYear}-01-01`);
  const [rangeTo, setRangeTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    Promise.all([getCars(), getInquiries()])
      .then(([c, i]) => { setCars(c); setInquiries(i); })
      .finally(() => setLoading(false));
  }, []);

  // Filter sold cars by date range
  const filteredSold = useMemo(() => {
    return cars.filter((c) => {
      if (c.status !== "sold" || !c.soldDate) return false;
      const d = new Date(c.soldDate);
      if (filterMode === "year") return d.getFullYear() === selectedYear;
      if (filterMode === "month") return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      if (filterMode === "range") {
        const from = new Date(rangeFrom);
        const to = new Date(rangeTo);
        to.setHours(23, 59, 59);
        return d >= from && d <= to;
      }
      return true;
    });
  }, [cars, filterMode, selectedYear, selectedMonth, rangeFrom, rangeTo]);

  // All cars filtered (for inventory / partner / profit — use all cars or sold only)
  const allFiltered = useMemo(() => {
    return cars.filter((c) => {
      const d = new Date(c.updatedAt || c.createdAt);
      if (filterMode === "year") return d.getFullYear() === selectedYear;
      if (filterMode === "month") return d.getFullYear() === selectedYear && d.getMonth() === selectedMonth;
      if (filterMode === "range") {
        const from = new Date(rangeFrom);
        const to = new Date(rangeTo);
        to.setHours(23, 59, 59);
        return d >= from && d <= to;
      }
      return true;
    });
  }, [cars, filterMode, selectedYear, selectedMonth, rangeFrom, rangeTo]);

  // ── Sales Summary ──────────────────────────────────────
  const salesByMonth = useMemo(() => {
    const map: Record<number, { units: number; revenue: number }> = {};
    filteredSold.forEach((c) => {
      const m = new Date(c.soldDate!).getMonth();
      if (!map[m]) map[m] = { units: 0, revenue: 0 };
      map[m].units += 1;
      map[m].revenue += c.soldPrice || c.sellingPrice || 0;
    });
    return map;
  }, [filteredSold]);

  const totalRevenue = filteredSold.reduce((s, c) => s + (c.soldPrice || c.sellingPrice || 0), 0);
  const totalUnitsSold = filteredSold.length;
  const avgSoldPrice = totalUnitsSold ? Math.round(totalRevenue / totalUnitsSold) : 0;

  // ── Profit Analysis ─────────────────────────────────────
  const profitRows = useMemo(() => {
    return filteredSold.map((c) => {
      const revenue = c.soldPrice || c.sellingPrice || 0;
      const cost = (c.partnerCost || 0) + (c.repairCost || 0);
      const profit = revenue - cost;
      return { ...c, revenue, cost, profit };
    }).sort((a, b) => b.profit - a.profit);
  }, [filteredSold]);

  const totalProfit = profitRows.reduce((s, r) => s + r.profit, 0);
  const totalCost = profitRows.reduce((s, r) => s + r.cost, 0);

  // ── Inventory ───────────────────────────────────────────
  const statusCount = useMemo(() => {
    const map: Record<string, number> = {};
    allFiltered.forEach((c) => { map[c.status] = (map[c.status] || 0) + 1; });
    return map;
  }, [allFiltered]);

  const brandCount = useMemo(() => {
    const map: Record<string, { count: number; value: number }> = {};
    allFiltered.filter((c) => c.status !== "sold").forEach((c) => {
      if (!map[c.brand]) map[c.brand] = { count: 0, value: 0 };
      map[c.brand].count += 1;
      map[c.brand].value += c.sellingPrice || 0;
    });
    return Object.entries(map).sort((a, b) => b[1].count - a[1].count);
  }, [allFiltered]);

  const typeCount = useMemo(() => {
    const map: Record<string, number> = {};
    allFiltered.filter((c) => c.status !== "sold").forEach((c) => {
      map[c.carType] = (map[c.carType] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [allFiltered]);

  // ── Partner Report ──────────────────────────────────────
  const partnerRows = useMemo(() => {
    const map: Record<string, { name: string; total: number; sold: number; revenue: number; partnerCost: number; profit: number }> = {};
    filteredSold.forEach((c) => {
      const key = c.partnerId || c.partnerName || "Unknown";
      if (!map[key]) map[key] = { name: c.partnerName || "Unknown", total: 0, sold: 0, revenue: 0, partnerCost: 0, profit: 0 };
      map[key].sold += 1;
      map[key].revenue += c.soldPrice || c.sellingPrice || 0;
      map[key].partnerCost += c.partnerCost || 0;
      map[key].profit += (c.soldPrice || c.sellingPrice || 0) - (c.partnerCost || 0) - (c.repairCost || 0);
    });
    // also count all cars per partner
    cars.forEach((c) => {
      const key = c.partnerId || c.partnerName || "Unknown";
      if (map[key]) map[key].total += 1;
    });
    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredSold, cars]);

  // ── Excel Export ─────────────────────────────────────────
  const handleExport = () => {
    const wb = XLSX.utils.book_new();

    // Sales sheet
    const salesData = filteredSold.map((c) => ({
      "Date Sold": c.soldDate || "",
      Brand: c.brand,
      Model: c.model,
      Year: c.year,
      "Selling Price": c.sellingPrice || 0,
      "Actual Sold Price": c.soldPrice || c.sellingPrice || 0,
      Partner: c.partnerName || "",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(salesData), "Sales");

    // Profit sheet
    const profitData = profitRows.map((r) => ({
      "Date Sold": r.soldDate || "",
      Brand: r.brand,
      Model: r.model,
      Year: r.year,
      "Sold Price": r.revenue,
      "Partner Cost": r.partnerCost || 0,
      "Repair Cost": r.repairCost || 0,
      "Total Cost": r.cost,
      "Gross Profit": r.profit,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(profitData), "Profit");

    // Inventory sheet
    const inventoryData = allFiltered.map((c) => ({
      Brand: c.brand,
      Model: c.model,
      Year: c.year,
      Status: c.status,
      "Car Type": c.carType,
      "Selling Price": c.sellingPrice || 0,
      "Partner Cost": c.partnerCost || 0,
      "Repair Cost": c.repairCost || 0,
      Partner: c.partnerName || "",
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(inventoryData), "Inventory");

    // Partner sheet
    const partnerData = partnerRows.map((p) => ({
      Partner: p.name,
      "Units Sold": p.sold,
      "Total Revenue": p.revenue,
      "Total Partner Cost": p.partnerCost,
      "Gross Profit": p.profit,
    }));
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(partnerData), "Partners");

    const label =
      filterMode === "year" ? `${selectedYear}` :
      filterMode === "month" ? `${MONTHS[selectedMonth]}-${selectedYear}` :
      `${rangeFrom}_to_${rangeTo}`;

    XLSX.writeFile(wb, `MG-Auto-Report-${label}.xlsx`);
  };

  const filterLabel =
    filterMode === "year" ? `FY ${selectedYear}` :
    filterMode === "month" ? `${MONTHS[selectedMonth]} ${selectedYear}` :
    `${rangeFrom} – ${rangeTo}`;

  const TABS: { key: ReportTab; label: string; icon: React.ReactNode }[] = [
    { key: "sales",     label: "Sales Summary",   icon: <TrendingUp size={13} /> },
    { key: "profit",    label: "Profit Analysis",  icon: <PieChart size={13} /> },
    { key: "inventory", label: "Inventory",        icon: <Package size={13} /> },
    { key: "partner",   label: "Partner Report",   icon: <Users size={13} /> },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Analytics</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">Reports</h1>
        </div>
        <button
          onClick={handleExport}
          disabled={loading}
          className="flex items-center gap-2 bg-[#cc1111] text-white px-5 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-40 mt-1"
        >
          <Download size={13} />
          Export Excel
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap items-end gap-5">
          {/* Mode toggle */}
          <div>
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Filter By</p>
            <div className="flex border border-gray-200 overflow-hidden">
              {(["month", "year", "range"] as FilterMode[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setFilterMode(m)}
                  className={`px-4 py-1.5 text-[10px] font-bold tracking-[0.2em] uppercase transition-colors ${
                    filterMode === m ? "bg-[#cc1111] text-white" : "bg-white text-gray-400 hover:text-gray-700"
                  }`}
                >
                  {m === "range" ? "Date Range" : m.charAt(0).toUpperCase() + m.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Year picker — always visible */}
          {(filterMode === "year" || filterMode === "month") && (
            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Year</p>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="border border-gray-200 text-sm text-gray-900 px-3 py-1.5 outline-none focus:border-[#cc1111] bg-white"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          {/* Month picker */}
          {filterMode === "month" && (
            <div>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Month</p>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="border border-gray-200 text-sm text-gray-900 px-3 py-1.5 outline-none focus:border-[#cc1111] bg-white"
              >
                {MONTHS.map((m, i) => <option key={m} value={i}>{m}</option>)}
              </select>
            </div>
          )}

          {/* Date range */}
          {filterMode === "range" && (
            <>
              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">From</p>
                <input
                  type="date"
                  value={rangeFrom}
                  onChange={(e) => setRangeFrom(e.target.value)}
                  className="border border-gray-200 text-sm text-gray-900 px-3 py-1.5 outline-none focus:border-[#cc1111] bg-white"
                />
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">To</p>
                <input
                  type="date"
                  value={rangeTo}
                  onChange={(e) => setRangeTo(e.target.value)}
                  className="border border-gray-200 text-sm text-gray-900 px-3 py-1.5 outline-none focus:border-[#cc1111] bg-white"
                />
              </div>
            </>
          )}

          <p className="text-xs text-gray-400 mb-1.5">Showing: <span className="font-semibold text-gray-700">{filterLabel}</span></p>
        </div>
      </div>

      {/* Report Tabs */}
      <div className="flex gap-0 mb-0 border-b border-gray-200">
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-3 text-[10px] font-bold tracking-[0.25em] uppercase transition-colors border-b-2 -mb-px ${
              tab === key ? "border-[#cc1111] text-[#cc1111]" : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {icon}{label}
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200 border-t-0 p-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : (
          <>
            {/* ── SALES SUMMARY ── */}
            {tab === "sales" && (
              <div className="space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Units Sold", value: totalUnitsSold.toString() },
                    { label: "Total Revenue", value: peso(totalRevenue) },
                    { label: "Avg. Sold Price", value: peso(avgSoldPrice) },
                  ].map((k) => (
                    <div key={k.label} className="border border-gray-200 p-5">
                      <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">{k.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                    </div>
                  ))}
                </div>

                {/* Monthly breakdown — only for year mode */}
                {filterMode === "year" && (
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">Monthly Breakdown</p>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {["Month", "Units Sold", "Revenue"].map((h) => (
                              <th key={h} className="px-4 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {MONTHS.map((m, i) => {
                            const row = salesByMonth[i];
                            return (
                              <tr key={m} className="border-b border-gray-100 hover:bg-gray-50">
                                <td className="px-4 py-2 font-medium text-gray-700">{m} {selectedYear}</td>
                                <td className="px-4 py-2 text-gray-900">{row?.units ?? "—"}</td>
                                <td className="px-4 py-2 text-gray-900">{row?.revenue ? peso(row.revenue) : "—"}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr className="border-t-2 border-gray-300 bg-gray-50">
                            <td className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-500">Total</td>
                            <td className="px-4 py-2 font-bold text-gray-900">{totalUnitsSold}</td>
                            <td className="px-4 py-2 font-bold text-gray-900">{peso(totalRevenue)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                )}

                {/* Unit list */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">Sold Units</p>
                  {filteredSold.length === 0 ? (
                    <p className="text-sm text-gray-400">No sold units for this period.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {["Date Sold", "Unit", "Year", "Selling Price", "Actual Sold Price", "Partner"].map((h) => (
                              <th key={h} className="px-4 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredSold.map((c) => (
                            <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{fmt(c.soldDate)}</td>
                              <td className="px-4 py-2 font-medium text-gray-900">{c.brand} {c.model}</td>
                              <td className="px-4 py-2 text-gray-600">{c.year}</td>
                              <td className="px-4 py-2 text-gray-700">{peso(c.sellingPrice || 0)}</td>
                              <td className="px-4 py-2 font-semibold text-green-700">{peso(c.soldPrice || c.sellingPrice || 0)}</td>
                              <td className="px-4 py-2 text-gray-600">{c.partnerName || "—"}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── PROFIT ANALYSIS ── */}
            {tab === "profit" && (
              <div className="space-y-6">
                {/* KPI cards */}
                <div className="grid grid-cols-4 gap-4">
                  {[
                    { label: "Units Sold", value: profitRows.length.toString() },
                    { label: "Total Revenue", value: peso(totalRevenue) },
                    { label: "Total Cost", value: peso(totalCost) },
                    { label: "Gross Profit", value: peso(totalProfit), highlight: true },
                  ].map((k) => (
                    <div key={k.label} className={`border p-5 ${k.highlight ? "border-green-200 bg-green-50" : "border-gray-200"}`}>
                      <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">{k.label}</p>
                      <p className={`text-2xl font-bold ${k.highlight ? "text-green-700" : "text-gray-900"}`}>{k.value}</p>
                    </div>
                  ))}
                </div>

                {profitRows.length === 0 ? (
                  <p className="text-sm text-gray-400">No sold units for this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {["Date Sold", "Unit", "Sold Price", "Partner Cost", "Repair Cost", "Gross Profit", "Margin"].map((h) => (
                            <th key={h} className="px-4 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {profitRows.map((r) => {
                          const margin = r.revenue ? Math.round((r.profit / r.revenue) * 100) : 0;
                          return (
                            <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{fmt(r.soldDate)}</td>
                              <td className="px-4 py-2 font-medium text-gray-900">{r.brand} {r.model} <span className="text-gray-400">({r.year})</span></td>
                              <td className="px-4 py-2 text-gray-700">{peso(r.revenue)}</td>
                              <td className="px-4 py-2 text-gray-600">{r.partnerCost ? peso(r.partnerCost) : "—"}</td>
                              <td className="px-4 py-2 text-gray-600">{r.repairCost ? peso(r.repairCost) : "—"}</td>
                              <td className={`px-4 py-2 font-semibold ${r.profit >= 0 ? "text-green-700" : "text-red-600"}`}>
                                {r.profit >= 0 ? "+" : ""}{peso(r.profit)}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                                  margin >= 20 ? "bg-green-100 text-green-700 border-green-200" :
                                  margin >= 10 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                  "bg-red-100 text-red-600 border-red-200"
                                }`}>{margin}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                          <td colSpan={2} className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-500">Total</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{peso(totalRevenue)}</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{peso(profitRows.reduce((s, r) => s + (r.partnerCost || 0), 0))}</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{peso(profitRows.reduce((s, r) => s + (r.repairCost || 0), 0))}</td>
                          <td className="px-4 py-2 font-bold text-green-700">{peso(totalProfit)}</td>
                          <td className="px-4 py-2 font-bold text-gray-900">
                            {totalRevenue ? Math.round((totalProfit / totalRevenue) * 100) : 0}%
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ── INVENTORY ── */}
            {tab === "inventory" && (
              <div className="space-y-6">
                {/* Status breakdown */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">By Status</p>
                  <div className="grid grid-cols-4 gap-4">
                    {["published", "unpublished", "sold", "draft"].map((s) => (
                      <div key={s} className="border border-gray-200 p-4">
                        <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-1 capitalize">{s}</p>
                        <p className="text-3xl font-bold text-gray-900">{statusCount[s] ?? 0}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  {/* By brand */}
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">By Brand (Active Stock)</p>
                    {brandCount.length === 0 ? (
                      <p className="text-sm text-gray-400">No active inventory.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {["Brand", "Units", "Total Value"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {brandCount.map(([brand, data]) => (
                            <tr key={brand} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{brand}</td>
                              <td className="px-3 py-2 text-gray-700">{data.count}</td>
                              <td className="px-3 py-2 text-gray-700">{peso(data.value)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  {/* By type */}
                  <div>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">By Car Type (Active Stock)</p>
                    {typeCount.length === 0 ? (
                      <p className="text-sm text-gray-400">No active inventory.</p>
                    ) : (
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200">
                            {["Type", "Units"].map((h) => (
                              <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {typeCount.map(([type, count]) => (
                            <tr key={type} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-3 py-2 font-medium text-gray-900">{type}</td>
                              <td className="px-3 py-2 text-gray-700">{count}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>

                {/* Full inventory list */}
                <div>
                  <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-3">Full Inventory List</p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {["Brand / Model", "Year", "Type", "Status", "Selling Price", "Partner Cost", "Partner"].map((h) => (
                            <th key={h} className="px-4 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {allFiltered.map((c) => (
                          <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="px-4 py-2 font-medium text-gray-900">{c.brand} {c.model}</td>
                            <td className="px-4 py-2 text-gray-600">{c.year}</td>
                            <td className="px-4 py-2 text-gray-600">{c.carType}</td>
                            <td className="px-4 py-2">
                              <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border ${
                                c.status === "published" ? "bg-green-100 text-green-700 border-green-200" :
                                c.status === "sold" ? "bg-red-100 text-red-700 border-red-200" :
                                c.status === "unpublished" ? "bg-amber-100 text-amber-700 border-amber-200" :
                                "bg-gray-100 text-gray-500 border-gray-200"
                              }`}>{c.status}</span>
                            </td>
                            <td className="px-4 py-2 text-gray-700">{peso(c.sellingPrice || 0)}</td>
                            <td className="px-4 py-2 text-gray-700">{c.partnerCost ? peso(c.partnerCost) : "—"}</td>
                            <td className="px-4 py-2 text-gray-600">{c.partnerName || "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ── PARTNER REPORT ── */}
            {tab === "partner" && (
              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: "Partners with Sales", value: partnerRows.length.toString() },
                    { label: "Total Revenue", value: peso(partnerRows.reduce((s, p) => s + p.revenue, 0)) },
                    { label: "Total Partner Cost", value: peso(partnerRows.reduce((s, p) => s + p.partnerCost, 0)) },
                  ].map((k) => (
                    <div key={k.label} className="border border-gray-200 p-5">
                      <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">{k.label}</p>
                      <p className="text-2xl font-bold text-gray-900">{k.value}</p>
                    </div>
                  ))}
                </div>

                {partnerRows.length === 0 ? (
                  <p className="text-sm text-gray-400">No partner data for this period.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200">
                          {["Partner", "Units Sold", "Total Revenue", "Total Partner Cost", "Gross Profit", "Profit Margin"].map((h) => (
                            <th key={h} className="px-4 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {partnerRows.map((p) => {
                          const margin = p.revenue ? Math.round((p.profit / p.revenue) * 100) : 0;
                          return (
                            <tr key={p.name} className="border-b border-gray-100 hover:bg-gray-50">
                              <td className="px-4 py-2 font-semibold text-gray-900">{p.name}</td>
                              <td className="px-4 py-2 text-gray-700">{p.sold}</td>
                              <td className="px-4 py-2 text-gray-700">{peso(p.revenue)}</td>
                              <td className="px-4 py-2 text-gray-700">{peso(p.partnerCost)}</td>
                              <td className={`px-4 py-2 font-semibold ${p.profit >= 0 ? "text-green-700" : "text-red-600"}`}>
                                {p.profit >= 0 ? "+" : ""}{peso(p.profit)}
                              </td>
                              <td className="px-4 py-2">
                                <span className={`text-[10px] font-bold px-2 py-0.5 border ${
                                  margin >= 20 ? "bg-green-100 text-green-700 border-green-200" :
                                  margin >= 10 ? "bg-amber-100 text-amber-700 border-amber-200" :
                                  "bg-red-100 text-red-600 border-red-200"
                                }`}>{margin}%</span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2 border-gray-300 bg-gray-50">
                          <td className="px-4 py-2 text-[10px] font-bold tracking-widest uppercase text-gray-500">Total</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{partnerRows.reduce((s, p) => s + p.sold, 0)}</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{peso(partnerRows.reduce((s, p) => s + p.revenue, 0))}</td>
                          <td className="px-4 py-2 font-bold text-gray-900">{peso(partnerRows.reduce((s, p) => s + p.partnerCost, 0))}</td>
                          <td className="px-4 py-2 font-bold text-green-700">{peso(partnerRows.reduce((s, p) => s + p.profit, 0))}</td>
                          <td />
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
