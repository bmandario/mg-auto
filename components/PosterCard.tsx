"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";

function formatPrice(p: number) {
  return "₱ " + p.toLocaleString("en-PH");
}

export default function PosterCard({ car, index }: { car: Car; index: number }) {
  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
  const isSold = car.status === "sold";
  const isNew = car.createdAt
    ? Date.now() - new Date(car.createdAt).getTime() < 7 * 24 * 60 * 60 * 1000
    : false;

  return (
    <Link
      href={`/cars/${car.slug}`}
      className="group relative block aspect-[3/4] overflow-hidden bg-[#111] hover:ring-1 hover:ring-[#cc1111]/60 transition-all duration-500"
    >
      {/* Photo */}
      {mainPhoto ? (
        <Image
          src={mainPhoto.url}
          alt={`${car.brand} ${car.model}`}
          fill
          className={`object-cover transition-transform duration-700 group-hover:scale-105 ${
            isSold ? "brightness-[0.35]" : ""
          }`}
          sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
      ) : (
        <div className="w-full h-full bg-[#111] animate-pulse" />
      )}

      {/* Gradient overlay — stronger at bottom for text */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/10 to-transparent" />

      {/* Index number — faint watermark top-left */}
      <div className="absolute top-4 left-4">
        <span className="font-display text-4xl text-white/10 leading-none select-none">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      {/* New badge */}
      {isNew && !isSold && (
        <div className="absolute top-4 right-4 bg-[#cc1111] px-2 py-1">
          <span className="text-white text-[10px] font-black tracking-widest uppercase">New</span>
        </div>
      )}

      {/* Sold ribbon */}
      {isSold && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-[#cc1111] px-8 py-2 rotate-[-15deg]">
            <span className="text-white font-black text-xl tracking-widest uppercase">SOLD</span>
          </div>
        </div>
      )}

      {/* Info overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-1 group-hover:translate-y-0 transition-transform duration-300">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">
          {car.brand}
        </p>
        <h3 className="font-display text-white text-2xl uppercase leading-none mb-1 group-hover:text-[#cc1111] transition-colors duration-300">
          {car.model}
        </h3>
        <p className="text-white/40 text-xs mb-3">
          {car.year} · {car.carType} · {car.mileage.toLocaleString("en-PH")} km
        </p>
        {isSold ? (
          <p className="font-display text-white/20 text-xl tracking-wider">SOLD</p>
        ) : (
          <p className="font-display text-white text-xl tracking-wider">
            {formatPrice(car.sellingPrice)}
          </p>
        )}
      </div>
    </Link>
  );
}
