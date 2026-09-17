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

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group block bg-white border border-gray-200 hover:border-[#cc1111] hover:shadow-lg transition-all duration-300"
    >
      {/* Photo */}
      <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
        {mainPhoto ? (
          <Image
            src={mainPhoto.url}
            alt={`${car.brand} ${car.model}`}
            fill
            className={`object-cover transition-transform duration-500 group-hover:scale-105 ${
              isSold ? "brightness-75" : ""
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
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

        {/* View count */}
        {!isSold && (
          <div className="absolute top-3 right-3 flex items-center gap-1 bg-white/90 border border-gray-200 px-2 py-1">
            <Eye size={10} className="text-gray-400" />
            <span className="text-[10px] text-gray-500">{car.viewCount || 0} views</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        {/* Brand + Model */}
        <div className="mb-2">
          <p className="text-[10px] font-semibold tracking-[0.3em] uppercase text-[#cc1111] mb-0.5">
            {car.brand}
          </p>
          <h3 className="font-display text-gray-900 text-2xl leading-tight group-hover:text-[#cc1111] transition-colors uppercase">
            {car.model}
          </h3>
          <p className="text-gray-400 text-sm tracking-wide">{car.year} · {car.carType}</p>
        </div>

        {/* Price */}
        <div className="mb-4">
          {isSold ? (
            <p className="font-display text-gray-400 text-2xl tracking-wider">SOLD</p>
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
            <span className="flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase text-blue-600 bg-blue-50 border border-blue-200 px-2 py-1">
              <Banknote size={10} /> Easy Financing
            </span>
          )}
        </div>
      </div>

      {/* CTA bar */}
      <div className="px-4 pb-4">
        <div
          className={`w-full py-2.5 text-center text-xs font-bold tracking-widest uppercase border transition-colors duration-200 ${
            isSold
              ? "border-gray-200 text-gray-400"
              : "border-[#cc1111] text-[#cc1111] group-hover:bg-[#cc1111] group-hover:text-white"
          }`}
        >
          {isSold ? "View Details" : "VIEW CAR →"}
        </div>
      </div>
    </Link>
  );
}
