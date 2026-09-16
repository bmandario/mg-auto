"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { Gauge, Fuel, Settings2, CheckCircle, XCircle, Clock, Banknote } from "lucide-react";

function formatPrice(p: number) {
  return "₱ " + p.toLocaleString("en-PH");
}

function formatMileage(m: number) {
  return m.toLocaleString("en-PH") + " km";
}

function RoadworthyBadge({ status }: { status: string }) {
  if (status === "pass")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-2 py-1 rounded-sm">
        <CheckCircle size={10} /> Roadworthy
      </span>
    );
  if (status === "fail")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-red-400 bg-red-400/10 border border-red-400/30 px-2 py-1 rounded-sm">
        <XCircle size={10} /> Not Roadworthy
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 px-2 py-1 rounded-sm">
      <Clock size={10} /> Pending
    </span>
  );
}

export default function CarCard({ car }: { car: Car }) {
  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const isSold = car.status === "sold";

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group block bg-white border border-[#e5e7eb] hover:border-[#cc1111]/50 shadow-sm hover:shadow-md transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#f0f1f3]">
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={`${car.brand} ${car.model}`}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSold ? "brightness-50" : ""
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-[#999] text-xs tracking-widest uppercase">No Photo</span>
          </div>
        )}

        {/* Sold ribbon */}
        {isSold && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-[#cc1111] px-6 py-2 rotate-[-20deg]">
              <span className="text-white font-black text-xl tracking-widest uppercase">SOLD</span>
            </div>
          </div>
        )}

        {/* View count */}
        {!isSold && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1">
            <span className="text-[10px] text-[#888] tracking-widest">{car.viewCount || 0} views</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Brand + Model */}
        <div className="mb-2">
          <p className="font-heading text-[10px] font-semibold tracking-[0.3em] uppercase text-[#cc1111] mb-0.5">
            {car.brand}
          </p>
          <h3 className="font-display text-[#0a0a0a] text-2xl leading-tight group-hover:text-[#cc1111] transition-colors uppercase">
            {car.model}
          </h3>
          <p className="font-heading text-[#666] text-sm tracking-wide">{car.year} · {car.carType}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          {isSold ? (
            <p className="font-display text-[#555] text-2xl tracking-wider">SOLD</p>
          ) : (
            <p className="font-display text-[#cc1111] text-2xl tracking-wider">
              {formatPrice(car.sellingPrice)}
            </p>
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-[#666] text-xs mb-4 border-t border-[#e5e7eb] pt-3">
          <span className="flex items-center gap-1.5">
            <Gauge size={12} className="text-[#cc1111]" />
            {formatMileage(car.mileage)}
          </span>
          <span className="flex items-center gap-1.5">
            <Settings2 size={12} className="text-[#cc1111]" />
            {car.transmission}
          </span>
          <span className="flex items-center gap-1.5">
            <Fuel size={12} className="text-[#cc1111]" />
            {car.fuelType}
          </span>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap gap-2">
          <RoadworthyBadge status={car.roadworthiness?.status || "pending"} />
          {!isSold && (
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-1 rounded-sm">
              <Banknote size={10} /> Easy Financing
            </span>
          )}
        </div>
      </div>

      {/* CTA bar */}
      <div className="px-4 pb-4">
        <div
          className={`font-heading w-full py-2.5 text-center text-xs font-bold tracking-widest uppercase border transition-colors duration-200 ${
            isSold
              ? "border-[#e5e7eb] text-[#999]"
              : "border-[#cc1111] text-[#cc1111] group-hover:text-white group-hover:bg-[#cc1111]"
          }`}
        >
          {isSold ? "View Details" : "View Car →"}
        </div>
      </div>
    </Link>
  );
}
