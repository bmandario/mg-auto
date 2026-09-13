"use client";

import { useRef, useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { Car, CAR_BRANDS, CAR_TYPES, CarPhoto, Partner, Diagnosis, DIAGNOSIS_DEFAULTS } from "@/lib/types";
import { getPartners } from "@/lib/partners";
import SearchableSelect from "@/components/admin/SearchableSelect";
import DiagnosisSection from "@/components/admin/DiagnosisSection";
import Image from "next/image";

const INPUT =
  "w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-2 text-sm outline-none transition-colors";
const SELECT =
  "w-full bg-white border-b border-gray-300 focus:border-[#cc1111] text-gray-900 py-2 text-sm outline-none transition-colors";
const LABEL = "block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1";
const SECTION = "border-t border-gray-200 pt-8 mt-8";

type FormValues = {
  brand: string;
  model: string;
  year: number;
  color: string;
  carType: string;
  engine: string;
  seats: number;
  driveType: string;
  description: string;
  fuelType: string;
  transmission: string;
  mileage: number;
  status: "draft" | "published" | "unpublished" | "sold";
  partnerCost: number;
  repairCost: number;
  sellingPrice: number;
  partnerName: string;
  partnerId: string;
  roadworthiness: { status: string; expiryDate: string; notes: string };
  financing: {
    available: boolean;
    estimatedDownPayment: number;
    requiredSalary: number;
    terms: { months: number; monthlyAmortization: number }[];
    notes: string;
  };
  serviceHistory: { id: string; date: string; service: string; mileage: number; cost: number; notes: string }[];
  partsReplaced: { id: string; part: string; brand: string; date: string; cost: number }[];
};

interface Props {
  initialData?: Partial<Car>;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
}

export default function CarForm({ initialData, onSubmit, isLoading }: Props) {
  const [photos, setPhotos] = useState<CarPhoto[]>(initialData?.photos ?? []);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [partners, setPartners] = useState<Partner[]>([]);
  const [diagnosis, setDiagnosis] = useState<Diagnosis>(
    initialData?.diagnosis ?? {
      date: "",
      technician: "",
      overallStatus: "ok",
      categories: DIAGNOSIS_DEFAULTS,
      notes: "",
    }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getPartners().then(setPartners).catch(() => {});
  }, []);

  const { register, watch, getValues, setValue, control } = useForm<FormValues>({
    defaultValues: {
      brand: initialData?.brand ?? "",
      model: initialData?.model ?? "",
      year: initialData?.year ?? new Date().getFullYear(),
      color: initialData?.color ?? "",
      carType: initialData?.carType ?? "Sedan",
      engine: initialData?.engine ?? "",
      seats: initialData?.seats ?? 5,
      driveType: initialData?.driveType ?? "",
      description: initialData?.description ?? "",
      fuelType: initialData?.fuelType ?? "Gasoline",
      transmission: initialData?.transmission ?? "Automatic",
      mileage: initialData?.mileage ?? 0,
      status: (initialData?.status as any) ?? "draft",
      partnerCost: initialData?.partnerCost ?? 0,
      repairCost: initialData?.repairCost ?? 0,
      sellingPrice: initialData?.sellingPrice ?? 0,
      partnerName: initialData?.partnerName ?? "",
      partnerId: initialData?.partnerId ?? "",
      roadworthiness: initialData?.roadworthiness ?? { status: "pending", expiryDate: "", notes: "" },
      financing: initialData?.financing ?? {
        available: false,
        estimatedDownPayment: 0,
        requiredSalary: 0,
        terms: [
          { months: 12, monthlyAmortization: 0 },
          { months: 24, monthlyAmortization: 0 },
          { months: 36, monthlyAmortization: 0 },
          { months: 48, monthlyAmortization: 0 },
        ],
        notes: "",
      },
      serviceHistory: initialData?.serviceHistory ?? [],
      partsReplaced: initialData?.partsReplaced ?? [],
    },
  });

  const { fields: svcFields, append: appendSvc, remove: removeSvc } = useFieldArray({
    control,
    name: "serviceHistory",
  });

  const { fields: partsFields, append: appendPart, remove: removePart } = useFieldArray({
    control,
    name: "partsReplaced",
  });

  const [activeTab, setActiveTab] = useState<"service" | "parts" | "diagnosis" | "roadworthiness">("service");

  const partnerCost = Number(watch("partnerCost") || 0);
  const repairCost = Number(watch("repairCost") || 0);
  const recommendedPrice = Math.round((partnerCost + repairCost) * 1.25);
  const financingAvailable = watch("financing.available");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const brand = watch("brand") || "car";
    const model = watch("model") || "model";
    const year = watch("year") || "year";
    const slug = `${brand}-${model}-${year}`
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "");

    for (const file of files) {
      const path = `cars/${slug}/${Date.now()}-${file.name}`;
      const storageRef = ref(storage, path);
      const task = uploadBytesResumable(storageRef, file);

      task.on(
        "state_changed",
        (snap) => {
          const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
          setUploadProgress((prev) => ({ ...prev, [file.name]: pct }));
        },
        () => {
          setUploadProgress((prev) => { const n = { ...prev }; delete n[file.name]; return n; });
        },
        async () => {
          const url = await getDownloadURL(task.snapshot.ref);
          setPhotos((prev) => {
            const isFirst = prev.length === 0;
            return [...prev, { url, storagePath: path, isMain: isFirst }];
          });
          setUploadProgress((prev) => { const n = { ...prev }; delete n[file.name]; return n; });
        }
      );
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const setMainPhoto = (index: number) => {
    setPhotos((prev) => prev.map((p, i) => ({ ...p, isMain: i === index })));
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const next = prev.filter((_, i) => i !== index);
      if (next.length > 0 && !next.some((p) => p.isMain)) next[0] = { ...next[0], isMain: true };
      return next;
    });
  };

  const handleSave = async (status: "draft" | "published" | "unpublished" | "sold") => {
    const vals = getValues();
    await onSubmit({
      ...vals,
      status,
      photos,
      diagnosis,
      recommendedPrice,
      partnerCost: Number(vals.partnerCost),
      repairCost: Number(vals.repairCost),
      sellingPrice: Number(vals.sellingPrice),
      year: Number(vals.year),
      seats: Number(vals.seats),
      mileage: Number(vals.mileage),
    });
  };

  return (
    <div>
      {/* === BASIC INFO === */}
      <section>
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Section</p>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-6">Basic Info</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className={LABEL}>Brand</label>
            <select className={SELECT} {...register("brand")}>
              <option value="">Select brand</option>
              {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Model</label>
            <input className={INPUT} placeholder="e.g. Civic" {...register("model")} />
          </div>
          <div>
            <label className={LABEL}>Year</label>
            <input type="number" className={INPUT} {...register("year")} />
          </div>
          <div>
            <label className={LABEL}>Color</label>
            <input className={INPUT} placeholder="e.g. Pearl White" {...register("color")} />
          </div>
          <div>
            <label className={LABEL}>Car Type</label>
            <select className={SELECT} {...register("carType")}>
              {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Fuel Type</label>
            <select className={SELECT} {...register("fuelType")}>
              {["Gasoline", "Diesel", "Hybrid", "Electric"].map((f) => (
                <option key={f} value={f}>{f}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={LABEL}>Transmission</label>
            <select className={SELECT} {...register("transmission")}>
              {["Automatic", "Manual", "CVT"].map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className={LABEL}>Engine</label>
            <input className={INPUT} placeholder="e.g. 2.0L DOHC" {...register("engine")} />
          </div>
          <div>
            <label className={LABEL}>Seats</label>
            <input type="number" className={INPUT} {...register("seats")} />
          </div>
          <div>
            <label className={LABEL}>Drive Type</label>
            <input className={INPUT} placeholder="e.g. FWD, 4x4" {...register("driveType")} />
          </div>
          <div>
            <label className={LABEL}>Mileage (km)</label>
            <input type="number" className={INPUT} {...register("mileage")} />
          </div>
        </div>

        <div className="mt-6">
          <label className={LABEL}>Description</label>
          <textarea
            className={`${INPUT} resize-none`}
            rows={4}
            placeholder="Describe the vehicle..."
            {...register("description")}
          />
        </div>
      </section>

      {/* === STATUS & PRICING === */}
      <section className={SECTION}>
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Section</p>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-6">Status &amp; Pricing</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {initialData && (
            <div>
              <label className={LABEL}>Status</label>
              <select className={SELECT} {...register("status")}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="unpublished">Unpublished</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          )}
          <div>
            <label className={LABEL}>Partner / Supplier</label>
            <SearchableSelect
              options={partners.map((p) => ({ value: p.id, label: p.name }))}
              value={watch("partnerId") ?? ""}
              onChange={(id, name) => {
                setValue("partnerId", id);
                setValue("partnerName", name);
              }}
              placeholder="Search supplier..."
            />
            <input type="hidden" {...register("partnerId")} />
            <input type="hidden" {...register("partnerName")} />
          </div>
          <div>
            <label className={LABEL}>Partner Cost (₱)</label>
            <input type="number" className={INPUT} {...register("partnerCost")} />
          </div>
          <div>
            <label className={LABEL}>Repair Cost (₱)</label>
            <input type="number" className={INPUT} {...register("repairCost")} />
          </div>
          <div>
            <label className={LABEL}>Selling Price (₱)</label>
            <input type="number" className={INPUT} {...register("sellingPrice")} />
          </div>
          <div>
            <label className={LABEL}>Recommended Price (read-only)</label>
            <input
              readOnly
              value={`₱${recommendedPrice.toLocaleString()}`}
              className={`${INPUT} text-[#cc1111] cursor-default`}
            />
            <p className="text-[10px] text-gray-400 mt-1">(Partner Cost + Repair Cost) × 1.25</p>
          </div>
        </div>
      </section>

      {/* === PHOTOS === */}
      <section className={SECTION}>
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Section</p>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-6">Photos</h2>

        {photos.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-6">
            {photos.map((photo, i) => (
              <div key={i} className="relative group w-20 h-[60px]">
                <Image src={photo.url} alt="" width={80} height={60} className="object-cover w-full h-full border border-gray-200" />
                {photo.isMain && (
                  <span className="absolute top-0 left-0 bg-[#cc1111] text-white text-[8px] font-bold px-1">MAIN</span>
                )}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                  {!photo.isMain && (
                    <button type="button" onClick={() => setMainPhoto(i)} className="text-[8px] text-white border border-white px-1 py-0.5 hover:bg-white hover:text-black leading-none">
                      Set Main
                    </button>
                  )}
                  <button type="button" onClick={() => removePhoto(i)} className="text-[8px] text-[#cc1111] border border-[#cc1111] px-1 py-0.5 hover:bg-[#cc1111] hover:text-white leading-none">
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {Object.entries(uploadProgress).map(([name, pct]) => (
          <div key={name} className="mb-2">
            <div className="flex justify-between text-[10px] text-gray-500 mb-1">
              <span className="truncate max-w-xs">{name}</span>
              <span>{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 h-0.5">
              <div className="bg-[#cc1111] h-0.5 transition-all" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ))}

        <label className={LABEL}>Upload New Photos</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:border file:border-[#cc1111] file:text-[#cc1111] file:bg-transparent file:text-xs file:font-bold file:tracking-widest file:uppercase hover:file:bg-[#cc1111] hover:file:text-white file:cursor-pointer"
        />
      </section>

      {/* === FINANCING === */}
      <section className={SECTION}>
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Section</p>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-6">Financing</h2>

        <div className="flex items-center gap-3 mb-6">
          <input type="checkbox" id="fin-available" className="w-4 h-4 accent-[#cc1111]" {...register("financing.available")} />
          <label htmlFor="fin-available" className="text-sm text-gray-700">
            Financing available for this vehicle
          </label>
        </div>

        {financingAvailable && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={LABEL}>Down Payment (₱)</label>
                <input type="number" className={INPUT} {...register("financing.estimatedDownPayment")} />
              </div>
              <div>
                <label className={LABEL}>Required Monthly Salary (₱)</label>
                <input type="number" className={INPUT} {...register("financing.requiredSalary")} />
              </div>
            </div>

            <div>
              <label className={LABEL + " mb-3"}>Monthly Amortizations by Term</label>
              <div className="border border-gray-200">
                {([12, 24, 36, 48] as const).map((months, i) => (
                  <div key={months} className={`flex items-center ${i < 3 ? "border-b border-gray-200" : ""}`}>
                    <span className="w-28 px-4 py-3 text-xs text-gray-500 font-bold tracking-widest">{months} months</span>
                    <div className="flex-1 px-4 border-l border-gray-200">
                      <input type="number" className={INPUT} placeholder="0" {...register(`financing.terms.${i}.monthlyAmortization`)} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className={LABEL}>Notes</label>
              <input className={INPUT} placeholder="Financing notes..." {...register("financing.notes")} />
            </div>
          </div>
        )}
      </section>

      {/* === SERVICE / PARTS / DIAGNOSIS TABS === */}
      <section className={SECTION}>
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Records</p>
        <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-6">Vehicle Records</h2>

        {/* Tab bar */}
        <div className="flex gap-2 mb-6">
          {([
            { key: "service",        label: "Service History",  count: svcFields.length },
            { key: "parts",          label: "Parts Replaced",   count: partsFields.length },
            { key: "roadworthiness", label: "Roadworthiness",   count: null },
            { key: "diagnosis",      label: "Diagnosis Result", count: null },
          ] as const).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => setActiveTab(key)}
              className={`px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors flex items-center gap-1.5 ${
                activeTab === key
                  ? "bg-[#cc1111] text-white"
                  : "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800"
              }`}
            >
              {label}
              {count !== null && count > 0 && (
                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${activeTab === key ? "bg-white/20 text-white" : "bg-white text-gray-500"}`}>
                  {count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Service History */}
        {activeTab === "service" && (
          <div>
            <div className="space-y-3 mb-4">
              {svcFields.map((field, i) => (
                <div key={field.id} className="border border-gray-200 p-4 relative">
                  <button type="button" onClick={() => removeSvc(i)} className="absolute top-3 right-3 text-gray-400 hover:text-[#cc1111] text-xs font-bold">✕</button>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className={LABEL}>Date</label>
                      <input type="date" className={INPUT} {...register(`serviceHistory.${i}.date`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Service</label>
                      <input className={INPUT} placeholder="e.g. Oil Change" {...register(`serviceHistory.${i}.service`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Mileage</label>
                      <input type="number" className={INPUT} {...register(`serviceHistory.${i}.mileage`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Cost (₱)</label>
                      <input type="number" className={INPUT} {...register(`serviceHistory.${i}.cost`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Notes</label>
                      <input className={INPUT} placeholder="Notes" {...register(`serviceHistory.${i}.notes`)} />
                    </div>
                  </div>
                </div>
              ))}
              {svcFields.length === 0 && (
                <p className="text-sm text-gray-400">No service records yet.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => appendSvc({ id: Date.now().toString(), date: "", service: "", mileage: 0, cost: 0, notes: "" })}
              className="border border-gray-300 text-gray-500 px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase hover:border-gray-800 hover:text-gray-900 transition-colors"
            >
              + Add Service Record
            </button>
          </div>
        )}

        {/* Parts Replaced */}
        {activeTab === "parts" && (
          <div>
            <div className="space-y-3 mb-4">
              {partsFields.map((field, i) => (
                <div key={field.id} className="border border-gray-200 p-4 relative">
                  <button type="button" onClick={() => removePart(i)} className="absolute top-3 right-3 text-gray-400 hover:text-[#cc1111] text-xs font-bold">✕</button>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className={LABEL}>Part Name</label>
                      <input className={INPUT} placeholder="e.g. Timing Belt" {...register(`partsReplaced.${i}.part`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Brand</label>
                      <input className={INPUT} placeholder="e.g. Gates" {...register(`partsReplaced.${i}.brand`)} />
                    </div>
                    <div>
                      <label className={LABEL}>Date</label>
                      <input type="date" className={INPUT} {...register(`partsReplaced.${i}.date`)} />
                    </div>
                  </div>
                </div>
              ))}
              {partsFields.length === 0 && (
                <p className="text-sm text-gray-400">No parts records yet.</p>
              )}
            </div>
            <button
              type="button"
              onClick={() => appendPart({ id: Date.now().toString(), part: "", brand: "", date: "", cost: 0 })}
              className="border border-gray-300 text-gray-500 px-4 py-2 text-[10px] font-bold tracking-[0.3em] uppercase hover:border-gray-800 hover:text-gray-900 transition-colors"
            >
              + Add Part
            </button>
          </div>
        )}

        {/* Roadworthiness */}
        {activeTab === "roadworthiness" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className={LABEL}>Status</label>
              <select className={SELECT} {...register("roadworthiness.status")}>
                <option value="pending">Pending</option>
                <option value="pass">Pass</option>
                <option value="fail">Fail</option>
              </select>
            </div>
            <div>
              <label className={LABEL}>Expiry Date</label>
              <input type="date" className={INPUT} {...register("roadworthiness.expiryDate")} />
            </div>
            <div>
              <label className={LABEL}>Notes</label>
              <input className={INPUT} placeholder="Notes..." {...register("roadworthiness.notes")} />
            </div>
          </div>
        )}

        {/* Diagnosis */}
        {activeTab === "diagnosis" && (
          <DiagnosisSection value={diagnosis} onChange={setDiagnosis} />
        )}
      </section>

      {/* === SAVE ACTIONS === */}
      <section className={SECTION}>
        <div className="flex gap-4">
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSave("draft")}
            className="flex-1 border border-gray-300 text-gray-500 py-3 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-800 hover:text-gray-900 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save as Draft"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSave("unpublished")}
            className="flex-1 border border-[#7a6a2a] text-[#e0b840] py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#7a6a2a] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Saving..." : "Save as Unpublished"}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={() => handleSave("published")}
            className="flex-1 border border-[#cc1111] text-[#cc1111] py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#cc1111] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isLoading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </section>
    </div>
  );
}
