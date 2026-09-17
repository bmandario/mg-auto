"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { Gauge, Fuel, Settings2, CheckCircle, XCircle, Clock, Banknote, Eye } from "lucide-react";

function formatPrice(p: number) {
  return "₱ " + p.toLocaleString("en-PH");
}

function formatMileage(m: number) {
  return m.toLocaleString("en-PH") + " km";
}

function RoadworthyBadge({ status }: { status: string }) {
  if (status === "pass")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-1">
        <CheckCircle size={10} /> Roadworthy
      </span>
    );
  if (status === "fail")
    return (
      <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-red-600 bg-red-50 border border-red-200 px-2 py-1">
        <XCircle size={10} /> Not Roadworthy
      </span>
    );
  return (
    <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1">
      <Clock size={10} /> Pending
    </span>
  );
}

export default function CarCard({ car }: { car: Car }) {
  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const isSold = car.status === "sold";
  const isNew = car.createdAt
    ? Date.now() - new Date(car.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group block bg-white border border-gray-200 hover:border-[#cc1111]/50 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
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
          <div className="w-full h-full flex items-center justify-center animate-pulse">
            <span className="text-gray-300 text-xs tracking-widest uppercase">No Photo</span>
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

        {/* New badge */}
        {isNew && !isSold && (
          <div className="absolute top-3 left-3 bg-[#cc1111] px-2 py-1">
            <span className="text-white text-[10px] font-black tracking-widest uppercase">New</span>
          </div>
        )}

        {/* View count */}
        {!isSold && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 px-2 py-1">
            <Eye size={10} className="text-[#cc1111]" />
            <span className="text-[10px] text-white/80">{car.viewCount || 0} views</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4 pb-5">
        {/* Brand + Model */}
        <div className="mb-2">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-0.5">
            {car.brand}
          </p>
          <h3 className="font-display text-gray-900 text-2xl leading-tight group-hover:text-[#cc1111] transition-colors uppercase">
            {car.model}
          </h3>
          <p className="text-gray-400 text-sm">{car.year} · {car.carType}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          {isSold ? (
            <p className="font-display text-gray-300 text-2xl tracking-wider">SOLD</p>
          ) : (
            <p className="font-display text-[#cc1111] text-2xl tracking-wider">
              {formatPrice(car.sellingPrice)}
            </p>
          )}
        </div>

        {/* Specs row */}
        <div className="flex items-center gap-4 text-gray-400 text-xs mb-4 border-t border-gray-100 pt-3">
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
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-blue-400 bg-blue-400/10 border border-blue-400/30 px-2 py-1">
              <Banknote size={10} /> Easy Financing
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
