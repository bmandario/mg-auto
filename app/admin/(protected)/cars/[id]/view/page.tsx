"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCarById, updateCar, logCarActivity } from "@/lib/cars";
import { addNotification } from "@/lib/notifications";
import { Car, ActivityEntry } from "@/lib/types";
import {
  ArrowLeft, Pencil, ExternalLink, BadgeCheck, EyeOff,
  Calendar, Tag, Gauge, Fuel, Settings2, Users, Palette,
  PackageCheck, CircleDollarSign, X, ChevronLeft, ChevronRight,
} from "lucide-react";

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

// Build timeline from fields + activityLog
function buildTimeline(car: Car): { action: string; detail?: string; at: string }[] {
  const events: { action: string; detail?: string; at: string }[] = [];

  if (car.createdAt) events.push({ action: "Unit added to inventory", detail: `Status: ${car.status === "draft" ? "Draft" : car.status}`, at: car.createdAt });
  if (car.publishedAt) events.push({ action: "Published to public listing", at: car.publishedAt });
  if (car.activityLog?.length) {
    car.activityLog.forEach((e) => events.push(e));
  }

  // Sort ascending
  events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime());
  return events;
}

const ICON_MAP: Record<string, React.ReactNode> = {
  "Unit added to inventory": <PackageCheck size={14} />,
  "Published to public listing": <BadgeCheck size={14} />,
  "Moved to Unpublished": <EyeOff size={14} />,
  "Moved to Draft": <Pencil size={14} />,
  "Marked as Sold": <CircleDollarSign size={14} />,
};
const COLOR_MAP: Record<string, string> = {
  "Unit added to inventory": "bg-blue-100 text-blue-600 border-blue-200",
  "Published to public listing": "bg-green-100 text-green-600 border-green-200",
  "Moved to Unpublished": "bg-amber-100 text-amber-600 border-amber-200",
  "Moved to Draft": "bg-gray-100 text-gray-500 border-gray-200",
  "Marked as Sold": "bg-red-100 text-red-600 border-red-200",
};

export default function CarViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [car, setCar] = useState<Car | null>(null);
  const [loading, setLoading] = useState(true);
  const [marking, setMarking] = useState(false);
  const [recordsTab, setRecordsTab] = useState<"service" | "parts" | "diagnosis" | "roadworthiness">("service");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  // Sold modal
  const [showSoldModal, setShowSoldModal] = useState(false);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldDate, setSoldDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentToPartner, setPaymentToPartner] = useState("");
  const [soldError, setSoldError] = useState("");

  useEffect(() => {
    getCarById(id)
      .then((data) => { if (data) setCar(data); else router.push("/admin/cars"); })
      .catch(() => router.push("/admin/cars"))
      .finally(() => setLoading(false));
  }, [id, router]);

  const handleMarkSold = async () => {
    if (!car) return;
    const price = Number(soldPrice);
    if (!price || price <= 0) { setSoldError("Please enter a valid sold price."); return; }
    if (!soldDate) { setSoldError("Please enter the sold date."); return; }
    const payment = Number(paymentToPartner) || 0;
    setMarking(true);
    setShowSoldModal(false);
    try {
      await updateCar(id, { status: "sold", soldPrice: price, soldDate, paymentToPartner: payment, updatedAt: new Date().toISOString() });
      await logCarActivity(id, "Marked as Sold", `₱${price.toLocaleString("en-PH")} on ${soldDate}`);
      if (car.partnerId) {
        await addNotification(car.partnerId, "sold", id, `${car.brand} ${car.model}`, `Your unit ${car.brand} ${car.model} has been sold for ₱${price.toLocaleString("en-PH")}.`);
      }
      setCar((prev) => prev ? { ...prev, status: "sold", soldPrice: price, soldDate, paymentToPartner: payment } : prev);
    } catch {
      alert("Failed to mark unit as sold.");
    } finally {
      setMarking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
      </div>
    );
  }
  if (!car) return null;

  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const sc = STATUS_COLORS[car.status] ?? STATUS_COLORS.draft;
  const timeline = buildTimeline(car);

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <div>
          <Link href="/admin/cars" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 hover:text-gray-700 mb-3 transition-colors">
            <ArrowLeft size={12} /> Back to Units
          </Link>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Unit Details</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">
            {car.brand} {car.model}
          </h1>
          <div className="flex items-center gap-3 mt-2">
            <span className={`inline-flex items-center px-2.5 py-0.5 text-[9px] font-bold tracking-[0.2em] uppercase border ${sc.bg} ${sc.text} ${sc.border}`}>
              {car.status}
            </span>
            <span className="text-sm text-gray-400">{car.year} · {car.carType}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 mt-6">
          {car.status === "published" && (
            <button
              onClick={() => { setSoldPrice(String(car.sellingPrice || "")); setSoldDate(new Date().toISOString().split("T")[0]); setPaymentToPartner(String(car.partnerCost || "")); setSoldError(""); setShowSoldModal(true); }}
              disabled={marking}
              className="bg-green-600 text-white px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase hover:bg-green-700 transition-colors disabled:opacity-40"
            >
              {marking ? "Saving..." : "Mark as Sold"}
            </button>
          )}
          {car.slug && (
            <a href={`/cars/${car.slug}`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 border border-gray-300 text-gray-500 px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors">
              <ExternalLink size={12} /> View as Public
            </a>
          )}
          {car.status !== "sold" && (
            <Link href={`/admin/cars/${id}/edit`}
              className="flex items-center gap-1.5 bg-gray-700 text-white px-4 py-2 text-xs font-bold tracking-[0.2em] uppercase hover:bg-gray-900 transition-colors">
              <Pencil size={12} /> Edit
            </Link>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT — photo + specs */}
        <div className="lg:col-span-2 space-y-6">

          {/* Photos */}
          {car.photos?.length > 0 && (
            <div className="bg-white border border-gray-200 overflow-hidden">
              <div className="flex gap-3 p-3 overflow-x-auto">
                  {car.photos.map((p, i) => (
                    <button
                      key={i}
                      onClick={() => setLightboxIndex(i)}
                      className="relative shrink-0 w-56 h-40 overflow-hidden border border-gray-200 cursor-zoom-in hover:border-[#cc1111] transition-colors"
                    >
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
                { icon: <Gauge size={14} />,    label: "Mileage",      value: car.mileage ? `${car.mileage.toLocaleString("en-PH")} km` : "—" },
                { icon: <Calendar size={14} />, label: "Year",         value: String(car.year) },
                { icon: <Settings2 size={14} />,label: "Transmission", value: car.transmission },
                { icon: <Fuel size={14} />,     label: "Fuel Type",    value: car.fuelType },
                { icon: <Users size={14} />,    label: "Seats",        value: car.seats ? `${car.seats}` : "—" },
                { icon: <Palette size={14} />,  label: "Color",        value: car.color || "—" },
                { icon: <Tag size={14} />,      label: "Drive Type",   value: car.driveType || "—" },
                { icon: <Tag size={14} />,      label: "Engine",       value: car.engine || "—" },
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

          {/* Pricing */}
          <div className="bg-white border border-gray-200 p-6">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-4">Pricing</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Partner Cost",    value: car.partnerCost   ? `₱ ${car.partnerCost.toLocaleString("en-PH")}`   : "—" },
                { label: "Repair Cost",     value: car.repairCost    ? `₱ ${car.repairCost.toLocaleString("en-PH")}`    : "—" },
                { label: "Selling Price",   value: car.sellingPrice  ? `₱ ${car.sellingPrice.toLocaleString("en-PH")}`  : "—" },
                { label: car.status === "sold" ? "Sold Price" : "Rec. Price",
                  value: car.status === "sold" && car.soldPrice
                    ? `₱ ${car.soldPrice.toLocaleString("en-PH")}`
                    : car.recommendedPrice ? `₱ ${car.recommendedPrice.toLocaleString("en-PH")}` : "—",
                  highlight: car.status === "sold" },
              ].map((p) => (
                <div key={p.label}>
                  <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">{p.label}</p>
                  <p className={`text-base font-bold ${p.highlight ? "text-green-600" : "text-gray-900"}`}>{p.value}</p>
                </div>
              ))}
            </div>
            {car.partnerName && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 mb-1">Partner / Supplier</p>
                <p className="text-sm font-medium text-gray-900">{car.partnerName}</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT — activity timeline */}
        <div className="space-y-6">
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

          {/* Quick info */}
          <div className="bg-white border border-gray-200 p-6 space-y-3">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">Quick Info</p>
            {[
              { label: "Created",    value: fmt(car.createdAt) },
              { label: "Published",  value: fmt(car.publishedAt) },
              { label: "Sold Date",  value: fmt(car.soldDate) },
              { label: "Last Update",value: fmt(car.updatedAt) },
              { label: "Views",      value: String(car.viewCount || 0) },
              { label: "Inquiries",  value: String(car.inquiryCount || 0) },
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
        {/* Tab bar */}
        <div className="flex border-b border-gray-200">
          {(["service", "parts", "diagnosis", "roadworthiness"] as const).map((tab) => {
            const labels: Record<string, string> = {
              service: "Service History",
              parts: "Parts Replaced",
              diagnosis: "Diagnosis",
              roadworthiness: "Roadworthiness",
            };
            const counts: Record<string, number | null> = {
              service: car.serviceHistory?.length ?? 0,
              parts: car.partsReplaced?.length ?? 0,
              diagnosis: null,
              roadworthiness: null,
            };
            const active = recordsTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setRecordsTab(tab)}
                className={`px-5 py-3 text-[10px] font-bold tracking-[0.25em] uppercase transition-colors flex items-center gap-2 border-b-2 -mb-px ${
                  active ? "bg-[#cc1111] text-white border-[#cc1111]" : "bg-transparent text-gray-400 border-transparent hover:text-gray-700"
                }`}
              >
                {labels[tab]}
                {counts[tab] !== null && (counts[tab] as number) > 0 && (
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${active ? "bg-white/20 text-white" : "bg-gray-100 text-gray-500"}`}>
                    {counts[tab]}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {/* Service History */}
          {recordsTab === "service" && (
            <>
              {!car.serviceHistory?.length ? (
                <p className="text-sm text-gray-400">No service records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Date", "Service", "Mileage", "Cost", "Notes"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {car.serviceHistory.map((r) => (
                        <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{fmt(r.date)}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{r.service}</td>
                          <td className="px-3 py-2 text-gray-600">{r.mileage ? `${r.mileage.toLocaleString("en-PH")} km` : "—"}</td>
                          <td className="px-3 py-2 text-gray-600">{r.cost ? `₱${r.cost.toLocaleString("en-PH")}` : "—"}</td>
                          <td className="px-3 py-2 text-gray-500">{r.notes || "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Parts Replaced */}
          {recordsTab === "parts" && (
            <>
              {!car.partsReplaced?.length ? (
                <p className="text-sm text-gray-400">No parts replacement records found.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        {["Date", "Part", "Brand", "Cost"].map((h) => (
                          <th key={h} className="px-3 py-2 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {car.partsReplaced.map((p) => (
                        <tr key={p.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="px-3 py-2 text-gray-600 whitespace-nowrap">{fmt(p.date)}</td>
                          <td className="px-3 py-2 font-medium text-gray-900">{p.part}</td>
                          <td className="px-3 py-2 text-gray-600">{p.brand || "—"}</td>
                          <td className="px-3 py-2 text-gray-600">{p.cost ? `₱${p.cost.toLocaleString("en-PH")}` : "—"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Diagnosis */}
          {recordsTab === "diagnosis" && (
            <>
              {!car.diagnosis ? (
                <p className="text-sm text-gray-400">No diagnosis recorded.</p>
              ) : (
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
              )}
            </>
          )}

          {/* Roadworthiness */}
          {recordsTab === "roadworthiness" && (
            <>
              {!car.roadworthiness ? (
                <p className="text-sm text-gray-400">No roadworthiness record found.</p>
              ) : (
                <div className="space-y-4 max-w-sm">
                  <div className="flex items-center gap-3">
                    <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400 w-28">Status</p>
                    <span className={`px-2.5 py-0.5 text-[9px] font-bold tracking-widest uppercase border ${
                      car.roadworthiness.status === "pass" ? "bg-green-100 text-green-700 border-green-300" :
                      car.roadworthiness.status === "fail" ? "bg-red-100 text-red-700 border-red-300" :
                      "bg-amber-100 text-amber-700 border-amber-300"
                    }`}>{car.roadworthiness.status}</span>
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
              )}
            </>
          )}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && car.photos?.length > 0 && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50"
          onClick={() => setLightboxIndex(null)}
        >
          {/* Close */}
          <button
            onClick={() => setLightboxIndex(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {car.photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex - 1 + car.photos.length) % car.photos.length); }}
              className="absolute left-4 text-white/70 hover:text-white transition-colors p-2"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Image */}
          <div className="relative w-full max-w-4xl h-[80vh] mx-16" onClick={(e) => e.stopPropagation()}>
            <Image
              src={car.photos[lightboxIndex].url}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
            />
          </div>

          {/* Next */}
          {car.photos.length > 1 && (
            <button
              onClick={(e) => { e.stopPropagation(); setLightboxIndex((lightboxIndex + 1) % car.photos.length); }}
              className="absolute right-4 text-white/70 hover:text-white transition-colors p-2"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Counter */}
          <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/50 text-xs font-bold tracking-widest">
            {lightboxIndex + 1} / {car.photos.length}
          </p>
        </div>
      )}

      {/* Mark Sold Modal */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowSoldModal(false); }}>
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-sm p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <BadgeCheck size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Mark as Sold</p>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">{car.brand} {car.model}</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Actual Sold Price (₱)</label>
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => { setSoldPrice(e.target.value); setSoldError(""); }}
                  placeholder={String(car.sellingPrice || "")}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                />
                <p className="text-[10px] text-gray-400 mt-1">Listed at ₱{(car.sellingPrice || 0).toLocaleString("en-PH")}</p>
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Date Sold</label>
                <input
                  type="date"
                  value={soldDate}
                  onChange={(e) => { setSoldDate(e.target.value); setSoldError(""); }}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 py-2 text-sm outline-none transition-colors"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Payment to Partner (₱)</label>
                <input
                  type="number"
                  value={paymentToPartner}
                  onChange={(e) => { setPaymentToPartner(e.target.value); setSoldError(""); }}
                  placeholder="0"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                />
                {car.partnerName && <p className="text-[10px] text-gray-400 mt-1">Partner: {car.partnerName}</p>}
              </div>
              {soldError && <p className="text-xs text-[#cc1111]">{soldError}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSoldModal(false)}
                className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors">
                Cancel
              </button>
              <button onClick={handleMarkSold}
                className="flex-1 bg-green-600 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-green-700 transition-colors">
                Confirm Sold
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
