"use client";

import { useEffect, useRef, useState } from "react";
import { Car, Eye, CheckCircle } from "lucide-react";

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        if (target === 0) { setCount(0); return; }
        const steps = 50;
        const duration = 1000;
        const increment = target / steps;
        let current = 0;
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            setCount(target);
            clearInterval(timer);
          } else {
            setCount(Math.floor(current));
          }
        }, duration / steps);
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return <span ref={ref}>{count.toLocaleString("en-PH")}</span>;
}

interface Props {
  availableUnits: number;
  soldCars: number;
  totalViews: number;
}

export default function StatsBar({ availableUnits, soldCars, totalViews }: Props) {
  const stats = [
    { icon: <Car size={28} strokeWidth={1.5} />, value: availableUnits, label: "Available Units" },
    { icon: <CheckCircle size={28} strokeWidth={1.5} />, value: soldCars, label: "Sold Units" },
    { icon: <Eye size={28} strokeWidth={1.5} />, value: totalViews, label: "Total Views" },
  ];

  return (
    <section className="border-y border-gray-200 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 divide-x divide-gray-200">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col sm:flex-row items-center justify-center gap-4 py-10 px-4">
              <div className="text-[#cc1111]">{s.icon}</div>
              <div className="text-center sm:text-left">
                <p className="font-display text-4xl sm:text-5xl text-gray-900 leading-none">
                  <CountUp target={s.value} />
                </p>
                <p className="text-[10px] font-semibold tracking-widest uppercase text-gray-400 mt-1">
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
