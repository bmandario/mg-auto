"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ResponsiveContainer, ComposedChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { getCarsByPartnerId } from "@/lib/cars";
import { getNotificationsForPartner } from "@/lib/notifications";
import { Car, PartnerNotification } from "@/lib/types";
import { usePartner } from "../layout";
import { Car as CarIcon, Radio, BadgeCheck, CircleDollarSign } from "lucide-react";

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
function peso(n: number) {
  if (!n) return "₱0";
  return "₱" + n.toLocaleString("en-PH");
}

function isSameMonth(iso?: string) {
  if (!iso) return false;
  const d = new Date(iso);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function buildMonthlyData(cars: Car[]) {
  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      month: d.toLocaleDateString("en-PH", { month: "short", year: "2-digit" }),
      y: d.getFullYear(),
      m: d.getMonth(),
      listings: 0,
      sold: 0,
      revenue: 0,
    };
  });

  cars.forEach((c) => {
    const created = c.createdAt ? new Date(c.createdAt as string) : null;
    if (created) {
      const slot = months.find((s) => s.y === created.getFullYear() && s.m === created.getMonth());
      if (slot) slot.listings += 1;
    }
    if (c.status === "sold" && c.soldDate) {
      const s = new Date(c.soldDate);
      const slot = months.find((sl) => sl.y === s.getFullYear() && sl.m === s.getMonth());
      if (slot) {
        slot.sold += 1;
        slot.revenue += c.soldPrice || 0;
      }
    }
  });

  return months.map(({ month, listings, sold, revenue }) => ({ month, listings, sold, revenue }));
}

const STATUS_BADGE: Record<string, string> = {
  published:   "bg-green-100 text-green-700 border-green-200",
  unpublished: "bg-amber-100 text-amber-700 border-amber-200",
  sold:        "bg-red-100 text-red-700 border-red-200",
  draft:       "bg-gray-100 text-gray-500 border-gray-200",
};

const MONTH_LABEL = new Date().toLocaleDateString("en-PH", { month: "long", year: "numeric" });

export default function PartnerDashboardPage() {
  const { partner } = usePartner();
  const [cars, setCars] = useState<Car[]>([]);
  const [notifications, setNotifications] = useState<PartnerNotification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getCarsByPartnerId(partner.id), getNotificationsForPartner(partner.id)])
      .then(([allCars, notifs]) => {
        console.log("partner.id:", partner.id);
        console.log("cars returned:", allCars.length, allCars.map(c => ({ id: c.id, partnerId: c.partnerId })));
        setCars(allCars);
        setNotifications(notifs.slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, [partner.id]);

  const published  = cars.filter((c) => c.status === "published");
  const sold       = cars.filter((c) => c.status === "sold");
  const totalSoldValue = sold.reduce((s, c) => s + (c.soldPrice || c.sellingPrice || 0), 0);
  const pendingPayment = sold.filter((c) => !c.paymentToPartner).length;

  // This month
  const newListingsMonth = cars.filter((c) => isSameMonth(c.createdAt as string));
  const soldMonth        = sold.filter((c) => isSameMonth(c.soldDate));
  const salesMonth       = soldMonth.reduce((s, c) => s + (c.soldPrice || 0), 0);

  const monthlyData = buildMonthlyData(cars);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Welcome back</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">{partner.name}</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">

          {/* All-time KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              { label: "Total Units", value: String(cars.length), sub: "All tagged units", icon: CarIcon, accent: "#cc1111" },
              { label: "Live Listings", value: String(published.length), sub: "Currently published", icon: Radio, accent: "#3b82f6" },
              { label: "Units Sold", value: String(sold.length), sub: "Moved units", icon: BadgeCheck, accent: "#22c55e" },
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

          {/* Monthly Activity Chart */}
          <div className="bg-white border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-gray-400 mb-1">Monthly Activity</p>
                <p className="text-xs text-gray-500">Last 6 months — new listings, sold units &amp; sales revenue</p>
              </div>
              <div className="text-right">
                <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">{MONTH_LABEL}</p>
                <p className="text-xs text-gray-500">
                  {newListingsMonth.length} new &nbsp;·&nbsp; {soldMonth.length} sold &nbsp;·&nbsp; {peso(salesMonth)}
                </p>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <ComposedChart data={monthlyData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 10, fill: "#9ca3af", fontWeight: 600, letterSpacing: 1 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  yAxisId="count"
                  allowDecimals={false}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={24}
                />
                <YAxis
                  yAxisId="revenue"
                  orientation="right"
                  tickFormatter={(v) => v >= 1000000 ? `₱${(v / 1000000).toFixed(1)}M` : v >= 1000 ? `₱${(v / 1000).toFixed(0)}K` : `₱${v}`}
                  tick={{ fontSize: 10, fill: "#9ca3af" }}
                  axisLine={false}
                  tickLine={false}
                  width={48}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, border: "1px solid #e5e7eb", borderRadius: 0, boxShadow: "none" }}
                  formatter={(value, name) => {
                    const v = Number(value);
                    if (name === "revenue") return [`₱${v.toLocaleString("en-PH")}`, "Sales Revenue"];
                    if (name === "listings") return [v, "New Listings"];
                    if (name === "sold") return [v, "Sold Units"];
                    return [v, String(name)];
                  }}
                />
                <Legend
                  iconType="square"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 10, paddingTop: 12, letterSpacing: "0.05em", textTransform: "uppercase" }}
                  formatter={(v) => v === "listings" ? "New Listings" : v === "sold" ? "Sold Units" : "Sales Revenue"}
                />
                <Bar yAxisId="count" dataKey="listings" fill="#3b82f6" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Bar yAxisId="count" dataKey="sold" fill="#d1d5db" radius={[2, 2, 0, 0]} maxBarSize={20} />
                <Line yAxisId="revenue" type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: "#22c55e" }} activeDot={{ r: 5 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>


          <div className="grid grid-cols-2 gap-6">
            {/* Most Viewed units */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">Most Viewed</p>
                <Link href="/partner/units" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-700 transition-colors">View All →</Link>
              </div>
              {cars.length === 0 ? (
                <p className="text-sm text-gray-400">No units yet.</p>
              ) : (
                <div className="space-y-3">
                  {[...cars].sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)).slice(0, 5).map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 py-2 border-b border-gray-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{c.brand} {c.model}</p>
                        <p className="text-xs text-gray-400">{c.year} · {peso(c.sellingPrice || 0)}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-gray-500">{(c.viewCount || 0).toLocaleString()} views</span>
                        <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border ${STATUS_BADGE[c.status] ?? STATUS_BADGE.draft}`}>
                          {c.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recent notifications */}
            <div className="bg-white border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">Recent Notifications</p>
                <Link href="/partner/notifications" className="text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-gray-700 transition-colors">View All →</Link>
              </div>
              {notifications.length === 0 ? (
                <p className="text-sm text-gray-400">No notifications yet.</p>
              ) : (
                <div className="space-y-3">
                  {notifications.map((n) => (
                    <div key={n.id} className={`flex items-start gap-3 py-2 border-b border-gray-50 last:border-0 ${!n.read ? "opacity-100" : "opacity-60"}`}>
                      <span className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${n.type === "sold" ? "bg-green-500" : n.type === "tagged" ? "bg-purple-500" : "bg-blue-500"} ${!n.read ? "" : "opacity-0"}`} />
                      <div>
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{fmt(n.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
