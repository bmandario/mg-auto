"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { Eye } from "lucide-react";

export default function MostViewed({ cars }: { cars: Car[] }) {
  const top5 = cars.slice(0, 5);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {top5.map((car) => {
          const photo = car.photos?.find((p) => p.isMain) || car.photos?.[0];
          return (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="group bg-white border border-[#e5e7eb] hover:border-[#cc1111]/50 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-[#f0f1f3]">
                {photo && (
                  <Image
                    src={photo.url}
                    alt={`${car.brand} ${car.model}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="256px"
                  />
                )}
                <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/70 px-1.5 py-0.5">
                  <Eye size={10} className="text-[#cc1111]" />
                  <span className="text-[10px] text-white">{car.viewCount || 0}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[9px] font-bold tracking-widest uppercase text-[#cc1111]">
                  {car.brand}
                </p>
                <p className="text-[#0a0a0a] font-bold text-sm truncate">{car.model}</p>
                <p className="text-[#cc1111] font-bold text-sm mt-1">
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

