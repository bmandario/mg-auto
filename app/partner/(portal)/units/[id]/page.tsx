"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCarById } from "@/lib/cars";
import { Car } from "@/lib/types";
import { usePartner } from "../../layout";
import {
  ArrowLeft, ExternalLink, Calendar, Tag, Gauge,
  Fuel, Settings2, Users, Palette,
  PackageCheck, BadgeCheck, EyeOff, Pencil, CircleDollarSign,
} from "lucide-react";

function buildTimeline(car: Car): { action: string; detail?: string; at: string }[] {
  const events: { action: string; detail?: string; at: string }[] = [];
  if (car.createdAt) events.push({ action: "Unit added to inventory", detail: `Status: ${car.status === "draft" ? "Draft" : car.status}`, at: car.createdAt });
  if (car.publishedAt) events.push({ action: "Published to public listing", at: car.publishedAt });
  if (car.activityLog?.length) car.activityLog.forEach((e) => events.push(e));
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return events;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "Unit added to inventory":    <PackageCheck size={14} />,
  "Published to public listing": <BadgeCheck size={14} />,
  "Moved to Unpublished":       <EyeOff size={14} />,
  "Moved to Draft":             <Pencil size={14} />,
  "Marked as Sold":             <CircleDollarSign size={14} />,
};
const COLOR_MAP: Record<string, string> = {
  "Unit added to inventory":    "bg-blue-100 text-blue-600 border-blue-200",
  "Published to public listing": "bg-green-100 text-green-600 border-green-200",
  "Moved to Unpublished":       "bg-amber-100 text-amber-600 border-amber-200",
  "Moved to Draft":             "bg-gray-100 text-gray-500 border-gray-200",
  "Marked as Sold":             "bg-red-100 text-red-600 border-red-200",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  published:   { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300" },
  unpublished: { bg: "bg-amber-100",  text: "text-amber-700",  border: "border-amber-300" },
  sold:        { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300"   },
  draft:       { bg: "bg-gray-100",   text: "text-gray-500",   border: "border-gray-300"  },
};

function fmt(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}
function fmtTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()} ${d.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`;
}
function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export default function PartnerUnitDetailPage() {
  const { partner } = usePartner();
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [recordsTab, setRecordsTab] = useState<"service" | "parts" | "roadworthiness" | "diagnosis">("service");

  useEffect(() => {
    getCarById(id).then((data) => {
      if (!data || data.partnerId !== partner.id) { router.push("/partner/units"); return; }
      setCar(data);
    }).catch(() => router.push("/partner/units")).finally(() => setLoading(false));
  }, [id, partner.id, router]);

  if (loading) return (
    <div className="flex items-center justify-center py-32">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
    </div>
  );
  if (!car) return null;

  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const sc = STATUS_COLORS[car.status] ?? STATUS_COLORS.draft;
  const timeline = buildTimeline(car);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link href="/partner/units" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-gray-700 mb-3 transition-colors">
            <ArrowLeft size={12} /> Back to My Units
          </Link>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Unit Details</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">{car.brand} {car.model}</h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase border ${sc.bg} ${sc.text} ${sc.border}`}>
              {car.status}
            </span>
            <span className="text-sm text-gray-400">{car.year} · {car.carType}</span>
          </div>
        </div>
        {car.slug && car.status === "published" && (
          <a href={`/cars/${car.slug}`} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-1.5 border border-gray-300 text-gray-500 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors mt-6 shrink-0">
            <ExternalLink size={12} /> View Public Listing
          </a>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT */}
        <div className="lg:col-span-2 space-y-6">
          {/* Photos */}
          {car.photos?.length > 0 && (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="flex gap-3 p-3 overflow-x-auto scrollbar-thin">
                {car.photos.map((p, i) => (
                  <button key={i} onClick={() => setLightboxIndex(i)}
                    className="relative shrink-0 w-56 h-40 overflow-hidden border border-gray-200 cursor-zoom-in hover:border-[#cc1111] transition-colors">
                    <Image src={p.url} alt={`${car.brand} ${car.model} ${i + 1}`} fill className="object-cover hover:scale-105 transition-transform duration-300" sizes="224px" />
                    {p.isMain && <span className="absolute top-1 left-1 bg-[#cc1111] text-white text-[7px] font-bold px-1.5 py-0.5">MAIN</span>}
                  </button>
                ))}
              </div>
              <p className="px-3 pb-2 text-[10px] text-gray-400">{car.photos.length} photo{car.photos.length !== 1 ? "s" : ""} · scroll to view all</p>
            </div>
          )}

          {/* Specs */}
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-4">Specifications</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { icon: <Gauge size={14} />,     label: "Mileage",      value: car.mileage ? `${car.mileage.toLocaleString("en-PH")} km` : "—" },
                { icon: <Calendar size={14} />,  label: "Year",         value: String(car.year) },
                { icon: <Settings2 size={14} />, label: "Transmission", value: car.transmission },
                { icon: <Fuel size={14} />,      label: "Fuel Type",    value: car.fuelType },
                { icon: <Users size={14} />,     label: "Seats",        value: car.seats ? String(car.seats) : "—" },
                { icon: <Palette size={14} />,   label: "Color",        value: car.color || "—" },
                { icon: <Tag size={14} />,       label: "Drive Type",   value: car.driveType || "—" },
                { icon: <Tag size={14} />,       label: "Engine",       value: car.engine || "—" },
              ].map((s) => (
                <div key={s.label} className="flex items-start gap-2">
                  <span className="mt-0.5 text-gray-400 shrink-0">{s.icon}</span>
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">{s.label}</p>
                    <p className="text-sm font-medium text-gray-900">{s.value}</p>
                  </div>
                </div>
              ))}
            </div>
            {car.description && (
              <div className="mt-5 pt-5 border-t border-gray-100">
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Description</p>
                <p className="text-sm text-gray-600 leading-relaxed">{car.description}</p>
              </div>
            )}
          </div>

          {/* Pricing — partner-visible only */}
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-4">Pricing</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Partner Price</p>
                <p className="text-base font-bold text-gray-900">{car.partnerCost ? peso(car.partnerCost) : "—"}</p>
              </div>
              <div>
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Selling Price</p>
                <p className="text-base font-bold text-gray-900">{peso(car.sellingPrice || 0)}</p>
              </div>
              {car.status === "sold" && car.soldPrice && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Actual Sold Price</p>
                  <p className="text-base font-bold text-green-700">{peso(car.soldPrice)}</p>
                </div>
              )}
              {car.status === "sold" && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Your Payment</p>
                  <p className="text-base font-bold text-gray-900">{car.paymentToPartner ? peso(car.paymentToPartner) : <span className="text-amber-600 text-sm font-semibold">Pending</span>}</p>
                </div>
              )}
              {car.status === "sold" && car.soldDate && (
                <div>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Date Sold</p>
                  <p className="text-sm font-medium text-gray-900">{fmt(car.soldDate)}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT — activity + quick info */}
        <div className="space-y-6">
          {/* Activity timeline */}
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-5">Activity</p>
            {timeline.length === 0 ? (
              <p className="text-sm text-gray-400">No activity recorded yet.</p>
            ) : (
              <div className="relative pl-5 border-l-2 border-gray-100 space-y-6">
                {[...timeline].reverse().map((event, i) => {
                  const colorCls = COLOR_MAP[event.action] ?? "bg-gray-100 text-gray-500 border-gray-200";
                  const icon = ICON_MAP[event.action] ?? <Tag size={14} />;
                  return (
                    <div key={i} className="relative">
                      <div className={`absolute -left-[26px] w-5 h-5 rounded-full border flex items-center justify-center ${colorCls}`}>
                        {icon}
                      </div>
                      <p className="text-xs font-bold text-gray-900">{event.action}</p>
                      {event.detail && <p className="text-xs text-gray-500 mt-0.5">{event.detail}</p>}
                      <p className="text-[10px] text-gray-400 mt-1">{fmtTime(event.at)}</p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="bg-white border border-gray-200 p-6 space-y-3">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">Quick Info</p>
            {[
              { label: "Status",      value: car.status.charAt(0).toUpperCase() + car.status.slice(1) },
              { label: "Created",     value: fmt(car.createdAt) },
              { label: "Published",   value: fmt(car.publishedAt) },
              { label: "Sold Date",   value: fmt(car.soldDate) },
              { label: "Views",       value: String(car.viewCount || 0) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center text-sm border-b border-gray-50 pb-2 last:border-0 last:pb-0">
                <span className="text-gray-400 text-xs font-semibold tracking-wide">{label}</span>
                <span className="text-gray-900 font-medium">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Records */}
      <div className="mt-6 bg-white border border-gray-200">
        <div className="flex border-b border-gray-200">
          {(["service", "parts", "roadworthiness", "diagnosis"] as const).map((tab) => {
            const labels: Record<string, string> = { service: "Service History", parts: "Parts Replaced", roadworthiness: "Roadworthiness", diagnosis: "Diagnosis" };
            const counts: Record<string, number | null> = { service: car.serviceHistory?.length ?? 0, parts: car.partsReplaced?.length ?? 0, roadworthiness: null, diagnosis: null };
            const active = recordsTab === tab;
            return (
              <button key={tab} onClick={() => setRecordsTab(tab)}
                className={`px-5 py-3 text-[10px] font-bold tracking-[0.25em] uppercase transition-colors flex items-center gap-2 border-b-2 -mb-px ${
                  active ? "bg-[#cc1111] text-white border-[#cc1111]" : "bg-transparent text-gray-400 border-transparent hover:text-gray-700"
                }`}>
                {labels[tab]}
                {counts[tab] !== null && (counts[tab] as number) > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>{counts[tab]}</span>
                )}
              </button>
            );
          })}
        </div>
        <div className="p-6">
          {recordsTab === "service" && (
            !car.serviceHistory?.length ? <p className="text-sm text-gray-400">No service records.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200">{["Date","Service","Mileage","Notes"].map((h) => <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>)}</tr></thead>
                  <tbody>{car.serviceHistory.map((r) => <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-600">{fmt(r.date)}</td><td className="px-3 py-2 font-medium text-gray-900">{r.service}</td><td className="px-3 py-2 text-gray-600">{r.mileage ? `${r.mileage.toLocaleString("en-PH")} km` : "—"}</td><td className="px-3 py-2 text-gray-500">{r.notes || "—"}</td></tr>)}</tbody>
                </table>
              </div>
            )
          )}
          {recordsTab === "parts" && (
            !car.partsReplaced?.length ? <p className="text-sm text-gray-400">No parts records.</p> : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead><tr className="border-b border-gray-200">{["Date","Part","Brand"].map((h) => <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>)}</tr></thead>
                  <tbody>{car.partsReplaced.map((p) => <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50"><td className="px-3 py-2 text-gray-600">{fmt(p.date)}</td><td className="px-3 py-2 font-medium text-gray-900">{p.part}</td><td className="px-3 py-2 text-gray-600">{p.brand || "—"}</td></tr>)}</tbody>
                </table>
              </div>
            )
          )}
          {recordsTab === "roadworthiness" && (
            !car.roadworthiness ? <p className="text-sm text-gray-400">No roadworthiness record.</p> : (
              <div className="space-y-4 max-w-sm">
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 w-28">Status</p>
                  <span className={`px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase border ${car.roadworthiness.status === "pass" ? "bg-green-100 text-green-700 border-green-300" : car.roadworthiness.status === "fail" ? "bg-red-100 text-red-700 border-red-300" : "bg-amber-100 text-amber-700 border-amber-300"}`}>{car.roadworthiness.status}</span>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 w-28">Expiry Date</p>
                  <p className="text-sm text-gray-900">{fmt(car.roadworthiness.expiryDate)}</p>
                </div>
                {car.roadworthiness.notes && (
                  <div className="flex items-start gap-3">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 w-28 mt-0.5">Notes</p>
                    <p className="text-sm text-gray-600">{car.roadworthiness.notes}</p>
                  </div>
                )}
              </div>
            )
          )}

          {recordsTab === "diagnosis" && (
            !car.diagnosis ? <p className="text-sm text-gray-400">No diagnosis recorded.</p> : (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Date</p>
                    <p className="text-sm font-medium text-gray-900">{fmt(car.diagnosis.date)}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Technician</p>
                    <p className="text-sm font-medium text-gray-900">{car.diagnosis.technician || "—"}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-0.5">Overall</p>
                    <span className={`inline-block px-2 py-0.5 text-[9px] font-bold tracking-widest uppercase border ${
                      car.diagnosis.overallStatus === "ok" ? "bg-green-100 text-green-700 border-green-300" :
                      car.diagnosis.overallStatus === "attention" ? "bg-amber-100 text-amber-700 border-amber-300" :
                      "bg-red-100 text-red-700 border-red-300"
                    }`}>{car.diagnosis.overallStatus}</span>
                  </div>
                </div>

                {car.diagnosis.categories?.map((cat) => (
                  <div key={cat.category}>
                    <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-500 mb-2 border-b border-gray-100 pb-1">{cat.category}</p>
                    <div className="space-y-1.5">
                      {cat.items.map((item) => (
                        <div key={item.name} className="flex items-start justify-between gap-4">
                          <p className="text-sm text-gray-700">{item.name}</p>
                          <div className="flex items-center gap-2 shrink-0">
                            {item.notes && <p className="text-xs text-gray-400 italic">{item.notes}</p>}
                            <span className={`text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border ${
                              item.status === "ok" ? "bg-green-100 text-green-700 border-green-200" :
                              item.status === "attention" ? "bg-amber-100 text-amber-700 border-amber-200" :
                              "bg-red-100 text-red-700 border-red-200"
                            }`}>{item.status}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}

                {car.diagnosis.notes && (
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Notes</p>
                    <p className="text-sm text-gray-600">{car.diagnosis.notes}</p>
                  </div>
                )}
              </div>
            )
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && car.photos?.length > 0 && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50" onClick={() => setLightboxIndex(null)}>
          <button onClick={() => setLightboxIndex(null)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">✕</button>
          {car.photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + car.photos.length) % car.photos.length); }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors p-2 text-2xl">‹</button>
          )}
          <div className="relative w-full max-w-4xl h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image src={car.photos[lightboxIndex].url} alt="" fill className="object-contain" sizes="100vw" />
          </div>
          {car.photos.length > 1 && (
            <button onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % car.photos.length); }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors p-2 text-2xl">›</button>
          )}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold tracking-widest">{lightboxIndex + 1} / {car.photos.length}</p>
        </div>
      )}
    </div>
  );
}
