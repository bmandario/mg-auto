"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCarsByPartnerId } from "@/lib/cars";
import { Car } from "@/lib/types";
import { usePartner } from "../layout";

type FilterTab = "all" | "published" | "unpublished" | "sold" | "draft";

const STATUS_BADGE: Record<string, string> = {
  published:   "bg-green-100 text-green-700 border-green-200",
  unpublished: "bg-amber-100 text-amber-700 border-amber-200",
  sold:        "bg-red-100 text-red-700 border-red-200",
  draft:       "bg-gray-100 text-gray-500 border-gray-200",
};

function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export default function PartnerUnitsPage() {
  const { partner } = usePartner();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("all");

  useEffect(() => {
    getCarsByPartnerId(partner.id)
      .then((all) => setCars(all))
      .finally(() => setLoading(false));
  }, [partner.id]);

  const tabs: FilterTab[] = ["all", "published", "unpublished", "sold", "draft"];
  const filtered = filter === "all" ? cars : cars.filter((c) => c.status === filter);
  const tabCount = (t: FilterTab) => t === "all" ? cars.length : cars.filter((c) => c.status === t).length;

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Inventory</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">My Units</h1>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-3 text-xs font-semibold tracking-wide capitalize transition-colors border-b-2 -mb-px ${
              filter === tab ? "border-[#cc1111] text-[#cc1111]" : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab} ({tabCount(tab)})
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No units found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Photo", "Unit", "Year", "Status", "Selling Price", "Views", ""].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((car) => {
                  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
                  return (
                    <tr key={car.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        {mainPhoto ? (
                          <Image src={mainPhoto.url} alt={`${car.brand} ${car.model}`} width={40} height={30} className="object-cover w-10 h-8" />
                        ) : (
                          <div className="w-10 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-[8px] text-gray-400">NO IMG</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-900">{car.brand} {car.model}</p>
                        <p className="text-xs text-gray-400">{car.carType} · {car.transmission}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{car.year}</td>
                      <td className="px-5 py-3">
                        <span className={`text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 border ${STATUS_BADGE[car.status] ?? STATUS_BADGE.draft}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-700">
                        {peso(car.sellingPrice || 0)}
                        {car.status === "sold" && car.soldPrice && (
                          <p className="text-green-700 font-semibold text-[11px] mt-0.5">Sold {peso(car.soldPrice)}</p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{car.viewCount || 0}</td>
                      <td className="px-5 py-3">
                        <Link
                          href={`/partner/units/${car.id}`}
                          className="bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
