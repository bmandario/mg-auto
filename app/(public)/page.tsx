import { getCars } from "@/lib/cars";
import CarGrid from "@/components/CarGrid";
import MostViewed from "@/components/MostViewed";
import HeroBanner from "@/components/HeroBanner";
import StatsBar from "@/components/StatsBar";
import { Car } from "@/lib/types";

export const revalidate = 60;

export default async function HomePage() {
  let availableCars: Car[] = [];
  let soldCars: Car[] = [];

  try {
    [availableCars, soldCars] = await Promise.all([
      getCars({ status: "published" }),
      getCars({ status: "sold" }),
    ]);
  } catch {
    // Firebase not yet populated — show empty state
  }

  const allCars = [...availableCars, ...soldCars];
  const totalViews = allCars.reduce((sum, c) => sum + (c.viewCount || 0), 0);

  const mostViewed = [...availableCars]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, 5);

  return (
    <div className="bg-white">
      <HeroBanner />

      {/* Stats Bar */}
      <div className="mt-2">
      <StatsBar
        availableUnits={availableCars.length}
        soldCars={soldCars.length}
        totalViews={totalViews}
      />
      </div>

      {/* Most Viewed */}
      {mostViewed.length > 0 && (
        <section className="pt-6 pb-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">
              Trending
            </p>
            <h2 className="font-display text-3xl text-gray-900 tracking-[0.15em] uppercase">
              Most Viewed
            </h2>
          </div>
          <MostViewed cars={mostViewed} />
        </section>
      )}

      {/* Available Cars */}
      <section className="pt-6 pb-16 bg-gray-50" id="browse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <p className="text-xs font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
            Available Now
          </p>
          <h2 className="font-display text-5xl sm:text-6xl text-gray-900 tracking-[0.1em] uppercase">
            Available Units For Sale
          </h2>
        </div>
        <CarGrid cars={availableCars} />
      </section>
    </div>
  );
}
