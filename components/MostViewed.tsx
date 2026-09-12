"use client";

import Link from "next/link";
import Image from "next/image";
import { Car } from "@/lib/types";
import { Eye } from "lucide-react";

export default function MostViewed({ cars }: { cars: Car[] }) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {cars.map((car) => {
          const photo = car.photos?.find((p) => p.isMain) || car.photos?.[0];
          return (
            <Link
              key={car.id}
              href={`/cars/${car.slug}`}
              className="flex-shrink-0 w-64 group bg-[#111] border border-[#1f1f1f] hover:border-[#cc1111]/50 transition-all duration-300"
            >
              <div className="relative aspect-video overflow-hidden bg-[#1a1a1a]">
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
                  <span className="text-[10px] text-[#aaa]">{car.viewCount || 0}</span>
                </div>
              </div>
              <div className="p-3">
                <p className="text-[9px] font-bold tracking-widest uppercase text-[#cc1111]">
                  {car.brand}
                </p>
                <p className="text-white font-bold text-sm truncate">{car.model}</p>
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
