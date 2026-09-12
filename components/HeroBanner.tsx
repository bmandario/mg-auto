"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export default function HeroBanner() {
  return (
    <section className="relative h-[75vh] min-h-[500px] flex items-center overflow-hidden bg-[#080808]">
      {/* Background grid lines */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(#cc1111 1px, transparent 1px), linear-gradient(90deg, #cc1111 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Car image — right side, bleeds off edge like Car 4 reference */}
      <motion.div
        initial={{ opacity: 0, x: 60 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.9, ease: "easeOut" }}
        className="absolute right-0 top-0 bottom-0 w-[55%] hidden lg:block"
      >
        <Image
          src="https://images.unsplash.com/photo-1580014317999-e9f1936787a5?w=1400&q=85&fit=crop"
          alt="Featured car"
          fill
          className="object-cover object-center"
          priority
          sizes="55vw"
        />
        {/* Fade car into the dark left side */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#080808] via-[#080808]/60 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-transparent to-[#080808]/40" />
      </motion.div>

      {/* Red glow behind text */}
      <div className="absolute left-1/4 top-1/2 -translate-y-1/2 w-80 h-80 bg-[#cc1111]/8 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl"
        >
          <p className="font-heading text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-3">
            MG Auto · Philippines
          </p>
          <h1 className="font-display text-7xl sm:text-8xl md:text-[110px] font-black text-white tracking-tight leading-none mb-6 uppercase">
            Find Your
            <br />
            <span className="text-[#cc1111]">Next Car.</span>
          </h1>
          <p className="font-heading text-[#666] text-base sm:text-lg max-w-md mb-8 leading-relaxed">
            Fully inspected, roadworthy certified pre-owned vehicles. Complete
            service history and parts transparency.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link
              href="#browse"
              className="font-heading px-8 py-3 border border-[#cc1111] text-[#cc1111] text-xs font-bold tracking-widest uppercase hover:text-white hover:bg-[#cc1111] transition-colors"
            >
              Browse Cars
            </Link>
            <Link
              href="#inquire"
              className="font-heading px-8 py-3 border border-[#444] text-[#888] text-xs font-bold tracking-widest uppercase hover:border-[#888] hover:text-white transition-colors"
            >
              Get in Touch
            </Link>
          </div>
        </motion.div>

        {/* Stats — visible on desktop, floated above the car image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.7 }}
          className="absolute bottom-8 right-8 hidden lg:flex gap-10"
        >
          {[
            { value: "100%", label: "Inspected" },
            { value: "Full", label: "History" },
            { value: "₱0", label: "Hidden Fees" },
          ].map((s) => (
            <div key={s.label} className="text-right">
              <p className="font-display text-4xl font-black text-[#cc1111]">{s.value}</p>
              <p className="font-heading text-[10px] tracking-widest uppercase text-[#555]">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
    </section>
  );
}
