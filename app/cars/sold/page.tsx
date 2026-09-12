import { getCars } from "@/lib/cars";
import CarGrid from "@/components/CarGrid";
import { Car } from "@/lib/types";

export const revalidate = 60;

export default async function SoldCarsPage() {
  let cars: Car[] = [];
  try {
    cars = await getCars({ status: "sold" });
  } catch {
    // empty state
  }

  return (
    <div className="pt-16">
      {/* Header */}
      <section className="py-16 border-b border-[#1f1f1f] bg-[#080808]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
            Archive
          </p>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            Sold Cars
          </h1>
          <p className="text-[#555] text-sm mt-3 max-w-md">
            These vehicles have found their new owners. Browse our available inventory for your next car.
          </p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-16">
        {cars.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#444] text-lg">No sold cars yet.</p>
          </div>
        ) : (
          <CarGrid cars={cars} />
        )}
      </section>
    </div>
  );
}
