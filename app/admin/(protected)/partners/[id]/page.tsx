"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getPartnerById } from "@/lib/partners";
import { getCars } from "@/lib/cars";
import { Partner, Car } from "@/lib/types";
import { ArrowLeft, KeyRound, Package, CheckCircle2, PhilippinePeso } from "lucide-react";

const STATUS_BADGE: Record<string, string> = {
  published: "border-green-300 text-green-700",
  unpublished: "border-amber-300 text-amber-700",
  sold: "border-red-300 text-red-700",
  draft: "border-gray-300 text-gray-400",
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

function ph(n?: number) {
  if (!n) return "—";
  return "₱ " + n.toLocaleString("en-PH");
}

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [available, setAvailable] = useState<Car[]>([]);
  const [sold, setSold] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"available" | "sold">("available");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [p, cars] = await Promise.all([getPartnerById(id), getCars()]);
        setPartner(p);
        const mine = cars.filter((c) => c.partnerId === id);
        setAvailable(mine.filter((c) => c.status === "published" || c.status === "unpublished" || c.status === "draft"));
        setSold(mine.filter((c) => c.status === "sold"));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="py-24 text-center text-gray-400 text-sm">
        Partner not found.
      </div>
    );
  }

  const totalPartnerCost = [...available, ...sold].reduce((s, c) => s + (c.partnerCost || 0), 0);
  const totalSoldRevenue = sold.reduce((s, c) => s + (c.soldPrice || 0), 0);
  const totalPaid = sold.reduce((s, c) => s + (c.paymentToPartner || 0), 0);
  const pending = sold.reduce((s, c) => s + ((c.partnerCost || 0) - (c.paymentToPartner || 0)), 0);

  const displayUnits = tab === "available" ? available : sold;

  return (
    <div>
      {/* Back + Header */}
      <div className="mb-8">
        <Link
          href="/admin/partners"
          className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-[#cc1111] transition-colors mb-5"
        >
          <ArrowLeft size={12} /> Back to Partners
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Partner</p>
            <h1 className="font-display text-4xl text-gray-900 tracking-wide">{partner.name}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {partner.email && <span>{partner.email}</span>}
              {partner.phone && <span>{partner.phone}</span>}
              <span
                className={`border text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 ${
                  partner.status === "active"
                    ? "border-[#2a7a2a] text-[#4caf50]"
                    : "border-gray-300 text-gray-400"
                }`}
              >
                {partner.status}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {partner.uid ? (
              <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-green-600 border border-green-300 px-2.5 py-1">
                <KeyRound size={10} /> Portal Access
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 border border-gray-300 px-2.5 py-1">
                <KeyRound size={10} /> No Portal Access
              </span>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Available Units</p>
          <p className="text-3xl font-display text-gray-900">{available.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Sold Units</p>
          <p className="text-3xl font-display text-gray-900">{sold.length}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Total Revenue (Sold)</p>
          <p className="text-xl font-bold text-gray-900">{ph(totalSoldRevenue)}</p>
        </div>
        <div className="bg-white border border-gray-200 p-5">
          <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-2">Payment Pending</p>
          <p className="text-xl font-bold text-[#cc1111]">{ph(pending > 0 ? pending : undefined)}</p>
          {totalPaid > 0 && (
            <p className="text-[10px] text-gray-400 mt-1">Paid: {ph(totalPaid)}</p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-0 border-b border-gray-200">
        {(["available", "sold"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-6 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors border-b-2 -mb-px ${
              tab === t
                ? "border-[#cc1111] text-[#cc1111]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {t === "available" ? `Available (${available.length})` : `Sold (${sold.length})`}
          </button>
        ))}
      </div>

      {/* Units Table */}
      <div className="bg-white border border-gray-200 border-t-0">
        {displayUnits.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No {tab} units for this partner.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    { label: "Unit", cls: "text-left" },
                    { label: "Year", cls: "text-center" },
                    { label: "Status", cls: "text-left" },
                    { label: "Partner Cost", cls: "text-right" },
                    ...(tab === "sold"
                      ? [
                          { label: "Sold Price", cls: "text-right" },
                          { label: "Payment to Partner", cls: "text-right" },
                          { label: "Sold Date", cls: "text-left" },
                        ]
                      : [
                          { label: "Selling Price", cls: "text-right" },
                        ]),
                    { label: "", cls: "text-left" },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 ${cls}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayUnits.map((car) => {
                  const thumb = car.photos?.find((p) => p.isMain) ?? car.photos?.[0];
                  return (
                    <tr key={car.id} className="border-b border-gray-100 hover:bg-gray-50">
                      {/* Unit */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {thumb ? (
                            <div className="w-12 h-9 relative shrink-0 overflow-hidden rounded">
                              <Image src={thumb.url} alt={car.brand} fill className="object-cover" />
                            </div>
                          ) : (
                            <div className="w-12 h-9 bg-gray-100 rounded shrink-0" />
                          )}
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{car.brand} {car.model}</p>
                            <p className="text-[10px] text-gray-400 uppercase tracking-widest">{car.carType} · {car.transmission}</p>
                          </div>
                        </div>
                      </td>
                      {/* Year */}
                      <td className="px-5 py-4 text-sm text-gray-700 text-center">{car.year}</td>
                      {/* Status */}
                      <td className="px-5 py-4">
                        <span className={`border text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 ${STATUS_BADGE[car.status] ?? "border-gray-200 text-gray-400"}`}>
                          {car.status}
                        </span>
                      </td>
                      {/* Partner Cost */}
                      <td className="px-5 py-4 text-sm text-gray-700 text-right">{ph(car.partnerCost)}</td>
                      {/* Sold-specific columns */}
                      {tab === "sold" ? (
                        <>
                          <td className="px-5 py-4 text-sm font-semibold text-gray-900 text-right">{ph(car.soldPrice)}</td>
                          <td className="px-5 py-4 text-sm text-right">
                            {car.paymentToPartner ? (
                              <span className="text-green-700 font-semibold">{ph(car.paymentToPartner)}</span>
                            ) : (
                              <span className="text-[#cc1111] text-[10px] font-bold tracking-widest uppercase">Pending</span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm text-gray-500">{fmt(car.soldDate)}</td>
                        </>
                      ) : (
                        <td className="px-5 py-4 text-sm text-gray-700 text-right">{ph(car.sellingPrice)}</td>
                      )}
                      {/* View link */}
                      <td className="px-5 py-4">
                        <Link
                          href={`/admin/cars/${car.id}/view`}
                          className="text-[9px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-[#cc1111] transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {tab === "sold" && sold.length > 0 && (
                <tfoot>
                  <tr className="border-t border-gray-200 bg-gray-50">
                    <td colSpan={3} className="px-5 py-3 text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">Totals</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{ph(totalPartnerCost)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-gray-900 text-right">{ph(totalSoldRevenue)}</td>
                    <td className="px-5 py-3 text-sm font-bold text-green-700 text-right">{ph(totalPaid)}</td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
