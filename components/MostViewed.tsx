"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { Eye } from "lucide-react";

export default function MostViewed({ cars }: { cars: Car[] }) {
  const top4 = cars.slice(0, 4);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {top4.map((car) => {
          const photo = car.photos?.find((p) => p.isMain) || car.photos?.[0];
          return (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="group bg-white border border-gray-200 hover:border-[#cc1111] hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-gray-100">
                {photo ? (
                  <Image
                    src={photo.url}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="400px"
                  />
                ) : (
                  <div className="w-full h-full animate-pulse" />
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-white/90 px-1.5 py-0.5 border border-gray-200">
                  <Eye size={10} className="text-[#cc1111]" />
                  <span className="text-[10px] text-gray-500">{car.viewCount || 0}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">
                  {car.brand}
                </p>
                <p className="text-gray-900 font-bold text-sm truncate">{car.model}</p>
                <p className="text-gray-400 text-xs mt-0.5">{car.year} · {car.carType}</p>
                <p className="text-[#cc1111] font-bold text-sm mt-2">
                  ₱ {car.sellingPrice.toLocaleString("en-PH")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
