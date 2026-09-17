"use client";

import { useEffect, useState, useMemo } from "react";
import { getCarsByPartnerId } from "@/lib/cars";
import { Car } from "@/lib/types";
import { usePartner } from "../layout";
import { BadgeCheck, CircleDollarSign } from "lucide-react";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 5 }, (_, i) => currentYear - i);
type FilterMode = "month" | "year" | "range";

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export default function PartnerEarningsPage() {
  const { partner } = usePartner();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMode, setFilterMode] = useState<FilterMode>("year");
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [rangeFrom, setRangeFrom] = useState(() => `${currentYear}-01-01`);
  const [rangeTo, setRangeTo] = useState(() => new Date().toISOString().split("T")[0]);

  useEffect(() => {
    getCarsByPartnerId(partner.id)
      .then((all) => setCars(all.filter((c) => c.status === "sold")))
      .finally(() => setLoading(false));
  }, [partner.id]);

  const filtered = useMemo(() => {
    return cars.filter((c) => {
      if (!c.soldDate) return false;
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

  const totalSoldValue = filtered.reduce((s, c) => s + (c.soldPrice || c.sellingPrice || 0), 0);

  function fmtDate(iso: string) {
    const [y, m, d] = iso.split("-");
    return `${m}/${d}/${y}`;
  }

  const filterLabel =
    filterMode === "year" ? `FY ${selectedYear}` :
    filterMode === "month" ? `${MONTHS[selectedMonth]} ${selectedYear}` :
    `${fmtDate(rangeFrom)} – ${fmtDate(rangeTo)}`;

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Finance</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">Earnings</h1>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 p-5 mb-6">
        <div className="flex flex-wrap items-end gap-5">
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

          <p className="text-xs text-gray-400 mb-1.5">
            Showing: <span className="font-semibold text-gray-700">{filterLabel}</span>
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Units Sold", value: String(filtered.length), sub: "For selected period", icon: BadgeCheck, accent: "#22c55e" },
              { label: "Total Sold Value", value: peso(totalSoldValue), sub: "Combined sold price", icon: CircleDollarSign, accent: "#22c55e" },
            ].map(({ label, value, sub, icon: Icon, accent }) => (
              <div
                key={label}
                className="bg-white border border-gray-200 px-6 py-5 flex items-center gap-4"
                style={{ borderLeftColor: accent, borderLeftWidth: 3 }}
              >
                <div className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: accent + "18" }}>
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">{label}</p>
                  <p className="font-display text-3xl text-gray-900 leading-none truncate">{value}</p>
                  <p className="text-[10px] text-gray-400 mt-1 tracking-wide">{sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Transaction table */}
          {filtered.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-400">No sold units for this period.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">Transaction History</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Date Sold", "Unit", "Year", "Selling Price", "Actual Sold Price"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{fmt(c.soldDate)}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">{c.brand} {c.model}</td>
                        <td className="px-5 py-3 text-gray-600">{c.year}</td>
                        <td className="px-5 py-3 text-gray-700">{peso(c.sellingPrice || 0)}</td>
                        <td className="px-5 py-3 font-semibold text-green-700">{c.soldPrice ? peso(c.soldPrice) : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-200 bg-gray-50">
                      <td colSpan={4} className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-500">Total Sold Value</td>
                      <td className="px-5 py-3 font-bold text-green-700">{peso(totalSoldValue)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
