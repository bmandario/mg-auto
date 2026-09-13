import { Car, Eye, CheckCircle } from "lucide-react";

interface Props {
  availableUnits: number;
  soldCars: number;
  totalViews: number;
}

export default function StatsBar({ availableUnits, soldCars, totalViews }: Props) {
  const stats = [
    {
      icon: <Car size={28} strokeWidth={1.5} />,
      value: availableUnits,
      label: "Available Units",
    },
    {
      icon: <CheckCircle size={28} strokeWidth={1.5} />,
      value: soldCars,
      label: "Sold Units",
    },
    {
      icon: <Eye size={28} strokeWidth={1.5} />,
      value: totalViews.toLocaleString("en-PH"),
      label: "Total Views",
    },
  ];

  return (
    <section className="border-y border-[#1f1f1f] bg-[#0d0d0d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-[#1f1f1f]">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 px-4">
              <div className="text-[#cc1111]">{s.icon}</div>
              <div className="text-center sm:text-left">
                <p className="font-display text-4xl sm:text-5xl text-white leading-none">
                  {s.value}
                </p>
                <p className="font-heading text-[10px] font-semibold tracking-widest uppercase text-[#555] mt-1">
                  {s.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
