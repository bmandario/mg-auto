import { Suspense } from "react";
import { getCars } from "@/lib/cars";
import CarGrid from "@/components/CarGrid";
import { Car } from "@/lib/types";

export const revalidate = 60;

export const metadata = {
  title: "Available Units — Auto Exchange",
  description: "Browse our fully inspected, roadworthy certified pre-owned vehicles.",
};

export default async function AvailableCarsPage() {
  let cars: Car[] = [];
  try {
    cars = await getCars({ status: "published" });
  } catch {
    // empty state
  }

  return (
    <div className="pt-16 bg-white min-h-screen">
      <Suspense fallback={<div className="py-20 text-center text-gray-400 text-sm">Loading...</div>}>
        <CarGrid cars={cars} defaultShowFilters columns={4} />
      </Suspense>
    </div>
  );
}
