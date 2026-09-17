"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Car, DiagnosisStatus } from "@/lib/types";
import { incrementViewCount } from "@/lib/cars";
import { submitInquiry } from "@/lib/inquiries";
import { motion } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Gauge, Fuel, Settings2,
  Users, Send, Banknote, AlertTriangle, Share2, ChevronLeft, Eye,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const WHATSAPP_NUMBER = "639XXXXXXXXX"; // update with actual number

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
  const [y, m, d] = raw.split("-");
  if (y && m && d) return `${m}/${d}/${y}`;
  return raw;
}

function RoadworthyBadge({ status }: { status: string }) {
  if (status === "pass")
    return (
      <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-4 py-2">
        <CheckCircle size={16} className="text-emerald-600" />
        <div>
          <p className="text-emerald-700 font-bold text-xs tracking-widest uppercase">Roadworthy</p>
          <p className="text-emerald-500 text-[10px]">Passed inspection</p>
        </div>
      </div>
    );
  if (status === "fail")
    return (
      <div className="flex items-center gap-2 bg-red-50 border border-red-200 px-4 py-2">
        <XCircle size={16} className="text-red-600" />
        <div>
          <p className="text-red-700 font-bold text-xs tracking-widest uppercase">Not Roadworthy</p>
        </div>
      </div>
    );
  return (
    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2">
      <Clock size={16} className="text-amber-500" />
      <div>
        <p className="text-amber-700 font-bold text-xs tracking-widest uppercase">Pending Inspection</p>
      </div>
    </div>
  );
}

export default function CarDetailClient({ car, relatedCars = [] }: { car: Car; relatedCars?: Car[] }) {
  const [activePhoto, setActivePhoto] = useState(0);
  const [tab, setTab] = useState<"overview" | "service" | "parts" | "financing" | "diagnosis">("overview");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showFloating, setShowFloating] = useState(false);

  useEffect(() => {
    const handler = () => setShowFloating(window.scrollY > 500);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const { register, handleSubmit, formState: { errors } } = useForm<InquiryForm>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      message: `Hi, I'm interested in the ${car.year} ${car.brand} ${car.model}. Please contact me with more details.`,
    },
  });

  function copyLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  const isSold = car.status === "sold";
  const financing = car.financing?.available ? car.financing : computeFinancing(car.sellingPrice);
  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const photos = car.photos || [];
  const activePhotoUrl = photos[activePhoto]?.url || mainPhoto?.url;

  useEffect(() => {
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
    <div className="pt-16 bg-white min-h-screen">

      {/* HERO — full bleed car photo */}
      <section className="relative h-[70vh] min-h-[500px] flex items-end overflow-hidden bg-gray-100">
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
          <div className="absolute inset-0 bg-gray-200" />
        )}
        {/* Gradient overlay — bottom-up so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pb-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
              {car.carType} · {car.year}
            </p>
            <h1 className="font-display text-6xl sm:text-7xl md:text-8xl text-white tracking-tight uppercase leading-none mb-1">
              {car.brand}
            </h1>
            <h2 className="font-display text-5xl sm:text-6xl text-[#cc1111] tracking-tight uppercase mb-6">
              {car.model}
            </h2>
            <div className="flex flex-wrap items-center gap-4">
              {car.status === "sold" ? (
                <span className="font-display text-4xl text-gray-400 tracking-wider">SOLD</span>
              ) : (
                <span className="font-display text-4xl text-white tracking-wider">
                  {formatPrice(car.sellingPrice)}
                </span>
              )}
              <RoadworthyBadge status={car.roadworthiness?.status || "pending"} />
              {car.financing?.available && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-4 py-2">
                  <Banknote size={16} className="text-blue-600" />
                  <div>
                    <p className="text-blue-700 font-bold text-xs tracking-widest uppercase">Easy Financing</p>
                    <p className="text-blue-500 text-[10px]">Ask for details</p>
                  </div>
                </div>
              )}
            </div>
            <div className="flex items-center gap-4 mt-4">
              {!!car.viewCount && (
                <span className="flex items-center gap-1.5 text-white/50 text-xs">
                  <Eye size={13} /> {car.viewCount.toLocaleString()} views
                </span>
              )}
              <button
                onClick={copyLink}
                className="flex items-center gap-1.5 text-white/60 hover:text-white text-xs transition-colors"
              >
                <Share2 size={13} />
                {copied ? "Link copied!" : "Share"}
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* PHOTO STRIP */}
      {photos.length > 1 && (
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {photos.map((photo, i) => (
                <button
                  key={i}
                  onClick={() => setActivePhoto(i)}
                  className={`flex-shrink-0 relative w-24 h-16 overflow-hidden border-2 transition-all ${
                    i === activePhoto ? "border-[#cc1111]" : "border-gray-200 opacity-60 hover:opacity-100"
                  }`}
                >
                  <Image src={photo.url} alt={`Photo ${i + 1}`} fill className="object-cover" sizes="96px" />
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BACK LINK */}
      <div className="bg-white border-b border-gray-100 px-4 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto">
        <Link href="/cars" className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-gray-400 hover:text-[#cc1111] transition-colors">
          <ChevronLeft size={12} /> Back to Listings
        </Link>
      </div>

      {/* KEY STATS */}
      <section className="bg-gray-50 border-b border-gray-200 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              >
                <p className="font-display text-4xl sm:text-6xl text-gray-900 leading-none">
                  {s.value}
                  {s.unit && <span className="text-xl text-gray-400 ml-1">{s.unit}</span>}
                </p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-2">
                  {s.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT + PHOTO — dark */}
      <section className="py-20 border-b border-[#1f1f1f] bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-72 sm:h-96 -mx-4 sm:mx-0 overflow-hidden"
            >
              {activePhotoUrl && (
                <Image src={activePhotoUrl} alt={car.model} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 50vw" />
              )}
              <div className="absolute inset-y-0 right-0 w-24 bg-gradient-to-l from-[#0a0a0a] to-transparent" />
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">About This Car</p>
              <h3 className="font-display text-4xl sm:text-5xl text-white uppercase tracking-tight leading-none mb-4">
                {car.brand} {car.model},<br />{car.year}
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

      {/* TECH SPECS — dark */}
      <section className="py-20 border-b border-[#1f1f1f] bg-[#0a0a0a] overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">Tech Specs</p>
              <h3 className="font-display text-4xl text-white uppercase tracking-[0.15em] mb-8">Specifications</h3>
              <div className="space-y-0">
                {specs.map((s) => (
                  <div key={s.label} className="flex justify-between items-center py-3 border-b border-[#1f1f1f]">
                    <span className="text-[#555] text-sm">{s.label}</span>
                    <span className="text-white font-semibold text-sm text-right">{s.value || "—"}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative h-80 sm:h-[450px] -mr-4 sm:mr-0 lg:-mr-8 overflow-hidden hidden lg:block"
            >
              {(photos[1]?.url || activePhotoUrl) && (
                <Image src={photos[1]?.url || activePhotoUrl!} alt={car.model} fill className="object-cover" sizes="50vw" />
              )}
              <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-[#0a0a0a] to-transparent" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TABS — Overview / Service / Parts / Diagnosis / Financing — light */}
      <section className="py-20 border-b border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-0 mb-10 border-b border-gray-200 flex-wrap">
            {(["overview", "service", "parts", "diagnosis", "financing"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-6 py-3 text-xs font-bold tracking-widest uppercase transition-colors border-b-2 -mb-px ${
                  tab === t ? "border-[#cc1111] text-[#cc1111]" : "border-transparent text-gray-400 hover:text-gray-700"
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
                <div key={s.label} className="bg-white border border-gray-200 p-5">
                  {s.icon}
                  <p className="text-gray-500 text-[10px] tracking-widest uppercase mt-3 mb-1">{s.label}</p>
                  <p className="text-gray-900 font-bold">{s.value}</p>
                </div>
              ))}
            </div>
          )}

          {tab === "service" && (
            <div>
              {!car.serviceHistory?.length ? (
                <p className="text-gray-400 text-sm">No service records added yet.</p>
              ) : (
                <div className="relative pl-6 border-l border-gray-200 space-y-0">
                  {car.serviceHistory.map((s, i) => (
                    <div key={s.id || i} className="relative pb-8">
                      <div className="absolute -left-[25px] top-0 w-3 h-3 bg-[#cc1111] rounded-full" />
                      <div className="bg-white border border-gray-200 p-5">
                        <div className="flex flex-wrap justify-between gap-2 mb-2">
                          <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111]">{formatDate(s.date)}</p>
                          <p className="text-[10px] text-gray-500">{s.mileage?.toLocaleString("en-PH")} km</p>
                        </div>
                        <p className="text-gray-900 font-semibold mb-1">{s.service}</p>
                        {s.notes && <p className="text-gray-600 text-sm">{s.notes}</p>}
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
                <p className="text-gray-400 text-sm">No parts replacement records added yet.</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Part", "Brand", "Date"].map((h) => (
                        <th key={h} className="text-left text-[10px] font-bold tracking-widest uppercase text-gray-400 pb-3 pr-4">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {car.partsReplaced.map((p, i) => (
                      <tr key={p.id || i} className="border-b border-gray-100">
                        <td className="py-3 pr-4 text-gray-900 font-medium">{p.part}</td>
                        <td className="py-3 pr-4 text-gray-600">{p.brand}</td>
                        <td className="py-3 text-gray-600">{formatDate(p.date)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {tab === "financing" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white border border-gray-200 p-6">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111] mb-2">Estimated Down Payment</p>
                  <p className="font-display text-3xl text-gray-900 leading-none">{formatPrice(financing.estimatedDownPayment)}</p>
                </div>
                <div className="bg-white border border-gray-200 p-6">
                  <p className="text-[10px] font-bold tracking-widest uppercase text-[#cc1111] mb-2">Required Monthly Salary</p>
                  <p className="font-display text-3xl text-gray-900 leading-none">{formatPrice(financing.requiredSalary)}</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-4">Estimated Monthly Amortization</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {([12, 24, 36, 48] as const).map((mo) => {
                    const term = financing.terms.find((t) => t.months === mo);
                    return (
                      <div key={mo} className="bg-white border border-gray-200 p-5 text-center">
                        <p className="font-display text-4xl text-[#cc1111] leading-none">{mo}</p>
                        <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mt-1 mb-3">months</p>
                        <p className="font-display text-xl text-gray-900 leading-none">{term ? formatPrice(term.monthlyAmortization) : "—"}</p>
                        <p className="text-[10px] text-gray-400 mt-1">/ month</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {financing.notes && (
                <p className="text-gray-500 text-sm border-l-2 border-[#cc1111]/30 pl-4">{financing.notes}</p>
              )}
              <p className="text-gray-400 text-xs">* Figures are estimates only. Actual amounts may vary based on lender approval, credit standing, and prevailing interest rates.</p>
            </div>
          )}

          {tab === "diagnosis" && (
            <div>
              {!car.diagnosis ? (
                <p className="text-[#555] text-sm">No diagnosis records available for this unit.</p>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
                    <div className="flex flex-wrap gap-6">
                      {car.diagnosis.date && (
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Inspection Date</p>
                          <p className="text-gray-900 text-sm">{formatDate(car.diagnosis.date)}</p>
                        </div>
                      )}
                      {car.diagnosis.technician && (
                        <div>
                          <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Technician</p>
                          <p className="text-gray-900 text-sm">{car.diagnosis.technician}</p>
                        </div>
                      )}
                    </div>
                    {car.diagnosis.overallStatus && (() => {
                      const cfg: Record<DiagnosisStatus, { label: string; color: string; border: string; bg: string; icon: React.ReactNode }> = {
                        ok:        { label: "All Clear",       color: "#16a34a", border: "#bbf7d0", bg: "#f0fdf4", icon: <CheckCircle size={16} /> },
                        attention: { label: "Needs Attention", color: "#b45309", border: "#fde68a", bg: "#fffbeb", icon: <AlertTriangle size={16} /> },
                        critical:  { label: "Critical Issues", color: "#cc1111", border: "#fecaca", bg: "#fef2f2", icon: <XCircle size={16} /> },
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

                  <div className="flex flex-wrap gap-3">
                    {([
                      { status: "ok" as DiagnosisStatus,       label: "OK",        color: "#16a34a", border: "#bbf7d0", icon: <CheckCircle size={12} /> },
                      { status: "attention" as DiagnosisStatus, label: "Attention", color: "#b45309", border: "#fde68a", icon: <AlertTriangle size={12} /> },
                      { status: "critical" as DiagnosisStatus,  label: "Critical",  color: "#cc1111", border: "#fecaca", icon: <XCircle size={12} /> },
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

                  {car.diagnosis.categories.map((cat) => {
                    const issues = cat.items.filter(i => i.status !== "ok").length;
                    const dotColors: Record<DiagnosisStatus, string> = { ok: "#16a34a", attention: "#b45309", critical: "#cc1111" };
                    return (
                      <div key={cat.category} className="border border-gray-200">
                        <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                          <div className="flex items-center gap-3">
                            <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-900">{cat.category}</span>
                            {issues > 0 && (
                              <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border border-amber-200 text-amber-700 bg-amber-50">
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
                        <div className="divide-y divide-gray-100">
                          {cat.items.map((item, ii) => {
                            const statusCfg: Record<DiagnosisStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
                              ok:        { label: "OK",        color: "#16a34a", bg: "#f0fdf4", icon: <CheckCircle size={12} /> },
                              attention: { label: "Attention", color: "#b45309", bg: "#fffbeb", icon: <AlertTriangle size={12} /> },
                              critical:  { label: "Critical",  color: "#cc1111", bg: "#fef2f2", icon: <XCircle size={12} /> },
                            };
                            const sc = statusCfg[item.status];
                            return (
                              <div key={ii} className="px-5 py-3 flex items-start justify-between gap-4 bg-white">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-gray-900">{item.name}</p>
                                  {item.notes && <p className="text-gray-400 text-xs mt-0.5">{item.notes}</p>}
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

                  {car.diagnosis.notes && (
                    <div className="border-l-2 border-[#cc1111]/30 pl-4">
                      <p className="text-[10px] font-bold tracking-widest uppercase text-gray-400 mb-1">Diagnosis Notes</p>
                      <p className="text-gray-600 text-sm">{car.diagnosis.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* INQUIRE */}
      <section id="inquire" className="relative py-24 bg-gray-50 overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)", backgroundSize: "60px 60px" }}
        />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">Interested?</p>
          <h3 className="font-display text-5xl sm:text-6xl text-gray-900 uppercase tracking-tight mb-1">Ask About</h3>
          <h3 className="font-display text-5xl sm:text-6xl text-[#cc1111] uppercase tracking-tight mb-8">This Unit</h3>

          {/* WhatsApp CTA */}
          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.year} ${car.brand} ${car.model}. Is it still available?`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3 bg-[#25D366] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#1ebe5c] transition-colors mb-6"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.52 5.855L.057 23.98l6.305-1.454A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.6-.5-5.1-1.373l-.365-.217-3.743.863.93-3.63-.239-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
            Chat on WhatsApp
          </a>

          <p className="text-gray-400 text-xs mb-8 tracking-widest">— or fill out the form below —</p>

          {isSold ? (
            <div className="bg-gray-100 border border-gray-200 p-8">
              <XCircle size={32} className="text-gray-400 mx-auto mb-3" />
              <p className="text-gray-700 font-bold tracking-widest uppercase">This unit has been sold</p>
              <p className="text-gray-500 text-sm mt-2 mb-5">Browse our other available units below.</p>
              <Link href="/cars" className="inline-flex items-center gap-2 px-8 py-3 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors">
                Browse Available Cars
              </Link>
            </div>
          ) : submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 p-8">
              <CheckCircle size={32} className="text-emerald-600 mx-auto mb-3" />
              <p className="text-emerald-700 font-bold tracking-widest uppercase">Inquiry Sent!</p>
              <p className="text-gray-500 text-sm mt-2">We&apos;ll get back to you as soon as possible.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <input
                    {...register("name")}
                    placeholder="Your Name *"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-3 text-sm outline-none transition-colors"
                  />
                  {errors.name && <p className="text-[#cc1111] text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <input
                    {...register("email")}
                    placeholder="Email Address *"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-3 text-sm outline-none transition-colors"
                  />
                  {errors.email && <p className="text-[#cc1111] text-xs mt-1">{errors.email.message}</p>}
                </div>
              </div>
              <div>
                <input
                  {...register("phone")}
                  placeholder="Phone Number *"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-3 text-sm outline-none transition-colors"
                />
                {errors.phone && <p className="text-[#cc1111] text-xs mt-1">{errors.phone.message}</p>}
              </div>
              <div>
                <textarea
                  {...register("message")}
                  rows={3}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-3 text-sm outline-none transition-colors resize-none"
                />
                {errors.message && <p className="text-[#cc1111] text-xs mt-1">{errors.message.message}</p>}
              </div>
              <div className="text-center pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-12 py-3 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-50 flex items-center gap-2 mx-auto"
                >
                  <Send size={14} />
                  {submitting ? "Sending..." : "Send Inquiry"}
                </button>
              </div>
            </form>
          )}
        </div>
      </section>

      {/* RELATED CARS */}
      {relatedCars.length > 0 && (
        <section className="py-16 border-t border-gray-100 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">You May Also Like</p>
            <h3 className="font-display text-3xl text-gray-900 uppercase mb-8">Similar Units</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {relatedCars.map((c) => {
                const photo = c.photos?.find((p) => p.isMain) || c.photos?.[0];
                return (
                  <Link key={c.id} href={`/cars/${c.slug}`} className="group border border-gray-200 hover:border-[#cc1111]/40 hover:-translate-y-1 transition-all duration-200">
                    <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                      {photo ? (
                        <Image src={photo.url} alt={`${c.brand} ${c.model}`} fill className="object-cover group-hover:scale-105 transition-transform duration-300" sizes="(max-width: 640px) 50vw, 25vw" />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100" />
                      )}
                      {c.status === "sold" && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-white font-black text-sm tracking-widest uppercase">SOLD</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">{c.brand} · {c.year}</p>
                      <p className="text-gray-900 font-bold text-sm leading-tight mt-0.5">{c.model}</p>
                      <p className="text-[#cc1111] font-bold text-sm mt-1">{formatPrice(c.sellingPrice)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* FLOATING RESERVE BUTTON */}
      {!isSold && (
        <a
          href="#inquire"
          className={`fixed right-6 bottom-8 z-50 flex items-center gap-2 px-6 py-4 bg-[#cc1111] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-all duration-300 shadow-lg shadow-[#cc1111]/30 ${showFloating ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 translate-y-4 pointer-events-none"}`}
        >
          <Send size={13} />
          Reserve This Unit
        </a>
      )}

      {/* STICKY MOBILE CTA */}
      {!isSold && (
        <div className="fixed bottom-0 left-0 right-0 z-50 sm:hidden bg-white border-t border-gray-200 px-4 py-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-[9px] font-bold tracking-widest uppercase text-gray-400">Selling Price</p>
            <p className="font-display text-xl text-[#cc1111] leading-none">{formatPrice(car.sellingPrice)}</p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi, I'm interested in the ${car.year} ${car.brand} ${car.model}. Is it still available?`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#25D366] text-white text-[10px] font-bold tracking-widest uppercase"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.553 4.12 1.52 5.855L.057 23.98l6.305-1.454A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.854 0-3.6-.5-5.1-1.373l-.365-.217-3.743.863.93-3.63-.239-.374A9.96 9.96 0 012 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z"/></svg>
              WhatsApp
            </a>
            <a
              href="#inquire"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#cc1111] text-white text-[10px] font-bold tracking-widest uppercase"
            >
              <Send size={12} /> Inquire
            </a>
          </div>
        </div>
      )}

    </div>
  );
}
