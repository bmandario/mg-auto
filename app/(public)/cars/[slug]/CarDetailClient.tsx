"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Car, DiagnosisStatus } from "@/lib/types";
import { incrementViewCount } from "@/lib/cars";
import { submitInquiry } from "@/lib/inquiries";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Gauge, Fuel, Settings2,
  Users, Zap, ChevronLeft, ChevronRight, X, Send, Banknote,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const inquirySchema = z.object({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone number required"),
  message: z.string().min(10, "Please write a message"),
});
type InquiryForm = z.infer<typeof inquirySchema>;

function formatPrice(p: number) {
  return "₱ " + p.toLocaleString("en-PH");
}

function computeFinancing(sellingPrice: number) {
  const dp = Math.round(sellingPrice * 0.2 / 1000) * 1000;
  const loanable = sellingPrice - dp;
  const rate = 0.012;
  const amort = (months: number) =>
    Math.round(((loanable + loanable * rate * months) / months) / 500) * 500;
  return {
    available: true,
    estimatedDownPayment: dp,
    terms: [
      { months: 12 as const, monthlyAmortization: amort(12) },
      { months: 24 as const, monthlyAmortization: amort(24) },
      { months: 36 as const, monthlyAmortization: amort(36) },
      { months: 48 as const, monthlyAmortization: amort(48) },
    ],
    requiredSalary: Math.round((amort(48) * 3) / 1000) * 1000,
    notes: "Figures are estimates based on 20% down payment and prevailing bank rates. Subject to credit approval.",
  };
}

function formatDate(raw?: string) {
  if (!raw) return "";
  // Accepts YYYY-MM-DD or already MM/DD/YYYY
  const [y, m, d] = raw.split("-");
  if (y && m && d) return `${m}/${d}/${y}`;
  return raw;
}

function RoadworthyBadge({ status }: { status: string }) {
  if (status === "pass")
    return (
      <div className="flex items-center gap-2 bg-emerald-400/10 border border-emerald-400/30 px-4 py-2">
        <CheckCircle size={16} className="text-emerald-400" />
        <div>
          <p className="text-emerald-400 font-bold text-xs tracking-widest uppercase">Roadworthy</p>
          <p className="text-emerald-400/60 text-[10px]">Passed inspection</p>
        </div>
      </div>
    );
  if (status === "fail")
    return (
      <div className="flex items-center gap-2 bg-red-400/10 border border-red-400/30 px-4 py-2">
        <XCircle size={16} className="text-red-400" />
        <div>
          <p className="text-red-400 font-bold text-xs tracking-widest uppercase">Not Roadworthy</p>
        </div>
      </div>
    );
  return (
    <div className="flex items-center gap-2 bg-yellow-400/10 border border-yellow-400/30 px-4 py-2">
      <Clock size={16} className="text-yellow-400" />
      <div>
        <p className="text-yellow-400 font-bold text-xs tracking-widest uppercase">Pending Inspection</p>
      </div>
    </div>
  );
}

export default function CarDetailClient({ car }: { car: Car }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [tab, setTab] = useState<"overview" | "service" | "parts" | "financing" | "diagnosis">("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
  });

  const financing = car.financing?.available ? car.financing : computeFinancing(car.sellingPrice);
  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const photos = car.photos || [];
  const activePhotoUrl = photos[activePhoto]?.url || mainPhoto?.url;

  useEffect(() => {
    // Increment view count
    incrementViewCount(car.id).catch(() => {});
  }, [car.id]);

  async function onSubmit(data: InquiryForm) {
    setSubmitting(true);
    try {
      await submitInquiry({
        carId: car.id,
        carTitle: `${car.year} ${car.brand} ${car.model}`,
        carSlug: car.slug,
        ...data,
      });
      setSubmitted(true);
    } catch {
      alert("Failed to send inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const specs = [
    { label: "Engine", value: car.engine },
    { label: "Transmission", value: car.transmission },
    { label: "Fuel Type", value: car.fuelType },
    { label: "Drive Type", value: car.driveType },
    { label: "Seats", value: car.seats ? `${car.seats} seats` : "—" },
    { label: "Color", value: car.color },
    { label: "Year", value: String(car.year) },
    { label: "Mileage", value: `${car.mileage?.toLocaleString("en-PH")} km` },
  ];

  return (
    <div className="pt-16 bg-[#0a0a0a] min-h-screen">
      {/* HERO */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden bg-[#050505]">
        {activePhotoUrl ? (
          <Image
            src={activePhotoUrl}
            alt={`${car.brand} ${car.model}`}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        ) : (
          <div className="absolute inset-0 bg-[#111]" />
        )}
        {/* Dark gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
              {car.carType} · {car.year}
            </p>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl font-black text-white tracking-tight uppercase leading-none mb-2">
              {car.brand}
            </h1>
            <h2 className="font-display text-5xl sm:text-6xl font-black text-[#cc1111] tracking-tight uppercase mb-6">
              {car.model}
            </h2>
            <div className="flex flex-wrap items-center gap-6">
              {car.status === "sold" ? (
                <span className="font-display text-4xl text-[#555] tracking-wider">SOLD</span>
              ) : (
                <span className="font-display text-4xl text-[#cc1111] tracking-wider">
                  {formatPrice(car.sellingPrice)}
                </span>
              )}
              <RoadworthyBadge status={car.roadworthiness?.status || "pending"} />
              {car.financing?.available && (
                <div className="flex items-center gap-2 bg-blue-400/10 border border-blue-400/30 px-4 py-2">
                  <Banknote size={16} className="text-blue-400" />
                  <div>
                    <p className="text-blue-400 font-bold text-xs tracking-widest uppercase">Easy Financing</p>
                    <p className="text-blue-400/60 text-[10px]">Ask for details</p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* PHOTO GALLERY */}
      {photos.length > 1 && (
        <section className="bg-[#080808] border-b border-[#1f1f1f]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 relative w-24 h-16 overflow-hidden border-2 transition-all ${
                    i === activePhoto ? "border-[#cc1111]" : "border-transparent opacity-50 hover:opacity-80"
                  }`}
                >
                  <Image
                    src={photo.url}
                    alt={`Photo ${i + 1}`}
                    fill
                    className="object-cover"
                    sizes="96px"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* KEY STATS — Car 1 style */}
      <section className="relative bg-[#080808] py-16 overflow-hidden border-b border-[#1f1f1f]">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#cc1111 1px, transparent 1px), linear-gradient(90deg, #cc1111 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: `${car.mileage?.toLocaleString("en-PH")}`, unit: "km", label: "Mileage" },
              { value: String(car.year), unit: "", label: "Year" },
              { value: car.transmission, unit: "", label: "Gearbox" },
              { value: car.fuelType, unit: "", label: "Fuel Type" },
            ].map((s) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="group"
              >
                <p className="font-display text-4xl sm:text-6xl text-white leading-none">
                  {s.value}
                  {s.unit && <span className="text-xl text-white/40 ml-1">{s.unit}</span>}
                </p>
                <p className="font-heading text-[10px] font-semibold tracking-widest uppercase text-[#555] mt-2">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + SPECS — split layout */}
      <section className="py-20 border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Car photo bleeding */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-72 sm:h-96 -mx-4 sm:mx-0 overflow-hidden"
            >
              {activePhotoUrl && (
                <Image
                  src={activePhotoUrl}
                  alt={car.model}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              )}
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
            </motion.div>

            {/* About text */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">
                About This Car
              </p>
              <h3 className="font-display text-4xl sm:text-5xl font-black text-white uppercase tracking-tight leading-none mb-4">
                {car.brand} {car.model},<br />
                {car.year}
              </h3>
              {car.description && (
                <p className="text-[#666] leading-relaxed mb-6">{car.description}</p>
              )}
              <RoadworthyBadge status={car.roadworthiness?.status || "pending"} />
              {car.roadworthiness?.notes && (
                <p className="text-[#555] text-sm mt-3">{car.roadworthiness.notes}</p>
              )}
              {car.roadworthiness?.expiryDate && (
                <p className="text-[#444] text-xs mt-1 tracking-widest">
                  EXPIRES: {formatDate(car.roadworthiness.expiryDate)}
                </p>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* TECH SPECS — Car 2 style */}
      <section className="py-20 border-b border-[#1f1f1f] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            {/* Specs table */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
                Tech Specs
              </p>
              <h3 className="font-heading text-4xl font-bold text-white uppercase tracking-[0.2em] mb-8">
                Specifications
              </h3>
              <div className="space-y-0">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between items-center py-3 border-b border-[#cc1111]/20">
                    <span className="text-[#555] text-sm">{s.label}</span>
                    <span className="text-white font-semibold text-sm text-right">{s.value || "—"}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Car photo — bleeding right */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-80 sm:h-[450px] -mr-4 sm:mr-0 lg:-mr-8 overflow-hidden hidden lg:block"
            >
              {photos[1]?.url || activePhotoUrl ? (
                <Image
                  src={photos[1]?.url || activePhotoUrl!}
                  alt={car.model}
                  fill
                  className="object-cover"
                  sizes="50vw"
                />
              ) : null}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* SERVICE HISTORY + PARTS */}
      <section className="py-20 border-b border-[#1f1f1f]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs */}
          <div className="flex gap-0 mb-10 border-b border-[#1f1f1f] flex-wrap">
            {(["overview", "service", "parts", "diagnosis", "financing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-[#cc1111] text-[#cc1111]"
                    : "border-transparent text-[#555] hover:text-[#aaa]"
                }`}
              >
                {t === "overview" ? "Overview"
                  : t === "service" ? "Service History"
                  : t === "parts" ? "Parts Replaced"
                  : t === "financing" ? "Financing"
                  : "Diagnosis"}
              </button>
            ))}
          </div>

          {tab === "overview" && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { icon: <Gauge size={20} className="text-[#cc1111]" />, label: "Mileage", value: `${car.mileage?.toLocaleString("en-PH")} km` },
                { icon: <Settings2 size={20} className="text-[#cc1111]" />, label: "Transmission", value: car.transmission },
                { icon: <Fuel size={20} className="text-[#cc1111]" />, label: "Fuel", value: car.fuelType },
                { icon: <Users size={20} className="text-[#cc1111]" />, label: "Seats", value: car.seats ? `${car.seats}` : "—" },
              ].map((s) => (
                <div key={s.label} className="bg-[#111] border border-[#1f1f1f] p-5">
                  {s.icon}
                  <p className="text-[#555] text-[10px] tracking-widest uppercase mt-3 mb-1">{s.label}</p>
                  <p className="text-white font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "service" && (
            <div>
              {!car.serviceHistory?.length ? (
                <p className="text-[#444] text-sm">No service records added yet.</p>
              ) : (
                <div className="relative pl-6 border-l border-[#1f1f1f] space-y-0">
                  {car.serviceHistory.map((s, i) => (
                    <div key={s.id || i} className="relative pb-8">
                      {/* Red dot */}
                      <div className="absolute -left-[25px] top-0 w-3 h-3 bg-[#cc1111] rounded-full" />
                      <div className="bg-[#111] border border-[#1f1f1f] p-5">
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111]">
                            {formatDate(s.date)}
                          </p>
                          <p className="text-[10px] text-[#555]">{s.mileage?.toLocaleString("en-PH")} km</p>
                        </div>
                        <p className="text-white font-semibold mb-1">{s.service}</p>
                        {s.notes && <p className="text-[#555] text-sm">{s.notes}</p>}
                        {s.cost > 0 && (
                          <p className="text-[#cc1111] text-sm font-bold mt-2">
                            ₱ {s.cost.toLocaleString("en-PH")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === "parts" && (
            <div>
              {!car.partsReplaced?.length ? (
                <p className="text-[#444] text-sm">No parts replacement records added yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#1f1f1f]">
                      {["Part", "Brand", "Date"].map((h) => (
                        <th key={h} className="text-left text-[10px] font-bold tracking-widest uppercase text-[#444] pb-3 pr-4">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {car.partsReplaced.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-[#1a1a1a]">
                        <td className="py-3 pr-4 text-white font-medium">{p.part}</td>
                        <td className="py-3 pr-4 text-white">{p.brand}</td>
                        <td className="py-3 text-white">{formatDate(p.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
          {tab === "financing" && (
            <div className="space-y-8">
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#111] border border-[#1f1f1f] p-6">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111] mb-2">Estimated Down Payment</p>
                  <p className="font-display text-3xl text-white leading-none">
                    {formatPrice(financing.estimatedDownPayment)}
                  </p>
                </div>
                <div className="bg-[#111] border border-[#1f1f1f] p-6">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111] mb-2">Required Monthly Salary</p>
                  <p className="font-display text-3xl text-white leading-none">
                    {formatPrice(financing.requiredSalary)}
                  </p>
                </div>
              </div>

              {/* Amortization table */}
              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] mb-4">Estimated Monthly Amortization</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([12, 24, 36, 48] as const).map((mo) => {
                    const term = financing.terms.find((t) => t.months === mo);
                    return (
                      <div key={mo} className="bg-[#111] border border-[#1f1f1f] p-5 text-center">
                        <p className="font-display text-4xl text-[#cc1111] leading-none">{mo}</p>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] mt-1 mb-3">months</p>
                        <p className="font-display text-xl text-white leading-none">
                          {term ? formatPrice(term.monthlyAmortization) : "—"}
                        </p>
                        <p className="text-[10px] text-[#444] mt-1">/ month</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {financing.notes && (
                <p className="text-[#555] text-sm border-l-2 border-[#cc1111]/30 pl-4">
                  {financing.notes}
                </p>
              )}

              <p className="text-[#333] text-xs">
                * Figures are estimates only. Actual amounts may vary based on lender approval, credit standing, and prevailing interest rates.
              </p>
            </div>
          )}

          {tab === "diagnosis" && (
            <div>
              {!car.diagnosis ? (
                <p className="text-[#444] text-sm">No diagnosis records available for this unit.</p>
              ) : (
                <div className="space-y-6">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[#1f1f1f]">
                    <div className="flex flex-wrap gap-6">
                      {car.diagnosis.date && (
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] mb-1">Inspection Date</p>
                          <p className="text-white text-sm">{formatDate(car.diagnosis.date)}</p>
                        </div>
                      )}
                      {car.diagnosis.technician && (
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] mb-1">Technician</p>
                          <p className="text-white text-sm">{car.diagnosis.technician}</p>
                        </div>
                      )}
                    </div>
                    {/* Overall status badge */}
                    {car.diagnosis.overallStatus && (() => {
                      const cfg: Record<DiagnosisStatus, { label: string; color: string; border: string; bg: string; icon: React.ReactNode }> = {
                        ok:        { label: "All Clear",  color: "#4caf50", border: "#4caf5040", bg: "#4caf5018", icon: <CheckCircle size={16} /> },
                        attention: { label: "Needs Attention", color: "#e0b840", border: "#e0b84040", bg: "#e0b84018", icon: <AlertTriangle size={16} /> },
                        critical:  { label: "Critical Issues",  color: "#cc1111", border: "#cc111140", bg: "#cc111118", icon: <XCircle size={16} /> },
                      };
                      const c = cfg[car.diagnosis!.overallStatus];
                      return (
                        <div className="flex items-center gap-2 px-4 py-2 border text-sm font-bold tracking-widest uppercase"
                          style={{ borderColor: c.border, color: c.color, backgroundColor: c.bg }}>
                          <span>{c.icon}</span>
                          {c.label}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Summary pills */}
                  <div className="flex flex-wrap gap-3">
                    {([
                      { status: "ok" as DiagnosisStatus,        label: "OK",        color: "#4caf50", border: "#4caf5040", icon: <CheckCircle size={12} /> },
                      { status: "attention" as DiagnosisStatus,  label: "Attention", color: "#e0b840", border: "#e0b84040", icon: <AlertTriangle size={12} /> },
                      { status: "critical" as DiagnosisStatus,   label: "Critical",  color: "#cc1111", border: "#cc111140", icon: <XCircle size={12} /> },
                    ]).map(({ status, label, color, border, icon }) => {
                      const count = car.diagnosis!.categories.flatMap(c => c.items).filter(i => i.status === status).length;
                      return (
                        <div key={status} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold tracking-widest uppercase"
                          style={{ borderColor: border, color }}>
                          {icon}
                          <span>{count} {label}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Categories */}
                  {car.diagnosis.categories.map((cat) => {
                    const issues = cat.items.filter(i => i.status !== "ok").length;
                    const dotColors: Record<DiagnosisStatus, string> = { ok: "#4caf50", attention: "#e0b840", critical: "#cc1111" };
                    return (
                      <div key={cat.category} className="border border-[#1f1f1f]">
                        {/* Category heading */}
                        <div className="flex items-center justify-between px-5 py-3 bg-[#0d0d0d]">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-[0.3em] uppercase text-white">{cat.category}</span>
                            {issues > 0 && (
                              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border border-[#e0b840]/40 text-[#e0b840]">
                                {issues} issue{issues > 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            {cat.items.map((item, ii) => (
                              <span key={ii} className="w-2 h-2 rounded-full" style={{ backgroundColor: dotColors[item.status] }} />
                            ))}
                          </div>
                        </div>

                        {/* Items */}
                        <div className="divide-y divide-[#1a1a1a]">
                          {cat.items.map((item, ii) => {
                            const statusCfg: Record<DiagnosisStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                              ok:        { label: "OK",        color: "#4caf50", bg: "#4caf5018", icon: <CheckCircle size={12} /> },
                              attention: { label: "Attention", color: "#e0b840", bg: "#e0b84018", icon: <AlertTriangle size={12} /> },
                              critical:  { label: "Critical",  color: "#cc1111", bg: "#cc111118", icon: <XCircle size={12} /> },
                            };
                            const sc = statusCfg[item.status];
                            return (
                              <div key={ii} className="px-5 py-3 flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white">{item.name}</p>
                                  {item.notes && <p className="text-[#555] text-xs mt-0.5">{item.notes}</p>}
                                </div>
                                <div className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase flex-shrink-0"
                                  style={{ color: sc.color, backgroundColor: sc.bg }}>
                                  {sc.icon}
                                  <span className="ml-1">{sc.label}</span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Overall notes */}
                  {car.diagnosis.notes && (
                    <div className="border-l-2 border-[#cc1111]/30 pl-4">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#555] mb-1">Diagnosis Notes</p>
                      <p className="text-[#888] text-sm">{car.diagnosis.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* INQUIRE — Car 1 style */}
      <section id="inquire" className="relative py-24 overflow-hidden bg-[#080808]">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: "linear-gradient(#cc1111 1px, transparent 1px), linear-gradient(90deg, #cc1111 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-[#cc1111]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">
            Interested?
          </p>
          <h3 className="font-display text-5xl sm:text-6xl font-black text-white uppercase tracking-tight mb-2">
            Ask About
          </h3>
          <h3 className="font-display text-5xl sm:text-6xl font-black text-[#cc1111] uppercase tracking-tight mb-8">
            This Unit
          </h3>

          {submitted ? (
            <div className="bg-emerald-400/10 border border-emerald-400/30 p-8">
              <CheckCircle size={32} className="text-emerald-400 mx-auto mb-3" />
              <p className="text-emerald-400 font-bold tracking-widest uppercase">Inquiry Sent!</p>
              <p className="text-[#666] text-sm mt-2">We'll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("name")}
                    placeholder="Your Name *"
                    className="w-full bg-transparent border-b border-[#333] focus:border-[#cc1111] text-white placeholder-[#444] py-3 text-sm outline-none transition-colors"
                  />
                  {errors.name && <p className="text-[#cc1111] text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register("email")}
                    placeholder="Email Address *"
                    className="w-full bg-transparent border-b border-[#333] focus:border-[#cc1111] text-white placeholder-[#444] py-3 text-sm outline-none transition-colors"
                  />
                  {errors.email && <p className="text-[#cc1111] text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <input
                  {...register("phone")}
                  placeholder="Phone Number *"
                  className="w-full bg-transparent border-b border-[#333] focus:border-[#cc1111] text-white placeholder-[#444] py-3 text-sm outline-none transition-colors"
                />
                {errors.phone && <p className="text-[#cc1111] text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <textarea
                  {...register("message")}
                  placeholder="Your Message *"
                  rows={3}
                  className="w-full bg-transparent border-b border-[#333] focus:border-[#cc1111] text-white placeholder-[#444] py-3 text-sm outline-none transition-colors resize-none"
                />
                {errors.message && <p className="text-[#cc1111] text-xs mt-1">{errors.message.message}</p>}
              </div>
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="font-heading px-12 py-3 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:text-white hover:bg-[#cc1111] transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  <Send size={14} />
                  {submitting ? "Sending..." : "Send Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}
