import { getCars } from "@/lib/cars";
import MostViewed from "@/components/MostViewed";
import HeroBanner from "@/components/HeroBanner";
import StatsBar from "@/components/StatsBar";
import FloatingInquiry from "@/components/FloatingInquiry";
import { Car } from "@/lib/types";
import { ShieldCheck, ClipboardList, BadgeCheck, Banknote } from "lucide-react";

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
      <div className="mt-6">
        <StatsBar
          availableUnits={availableCars.length}
          soldCars={soldCars.length}
          totalViews={totalViews}
        />
      </div>

      {/* Most Viewed */}
      {mostViewed.length > 0 && (
        <section className="pt-6 pb-16 border-b border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">
                Trending
              </p>
              <h2 className="font-display text-3xl text-gray-900 tracking-[0.15em] uppercase">
                Most Viewed
              </h2>
            </div>
            <a
              href="/cars"
              className="text-[11px] font-bold tracking-widest uppercase text-[#cc1111] hover:underline hidden sm:block"
            >
              View All →
            </a>
          </div>
          <MostViewed cars={mostViewed} />
        </section>
      )}

      {/* Why Buy From Us */}
      <section className="py-14 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-2">
              Why Master Garage
            </p>
            <h2 className="font-display text-3xl sm:text-4xl text-white uppercase tracking-[0.1em]">
              Every Car. Fully Verified.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <ShieldCheck size={28} strokeWidth={1.5} />, title: "Multi-Point Inspection", desc: "Every unit inspected by certified Master Garage technicians before listing.", featured: false },
              { icon: <ClipboardList size={28} strokeWidth={1.5} />, title: "Full Service History", desc: "Complete maintenance records and parts replaced — no hidden surprises.", featured: false },
              { icon: <BadgeCheck size={28} strokeWidth={1.5} />, title: "Roadworthy Certified", desc: "Each car is assessed and certified roadworthy before hitting our listings.", featured: true },
              { icon: <Banknote size={28} strokeWidth={1.5} />, title: "Easy Financing", desc: "We connect you with financing options to make ownership accessible.", featured: false },
            ].map((item) => (
              <div
                key={item.title}
                className={`p-6 transition-colors ${
                  item.featured
                    ? "border border-[#cc1111] bg-[#cc1111]/5"
                    : "border border-[#1f1f1f] hover:border-[#cc1111]/40"
                }`}
              >
                <div className="text-[#cc1111] mb-4">{item.icon}</div>
                <p className="text-white font-bold text-sm mb-2 tracking-wide">{item.title}</p>
                <p className="text-[#888] text-sm leading-relaxed">{item.desc}</p>
                {item.featured && (
                  <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mt-3">
                    Our #1 Differentiator
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <FloatingInquiry />
    </div>
  );
}
