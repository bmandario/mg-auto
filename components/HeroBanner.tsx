"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, ClipboardList, BadgeCheck } from "lucide-react";

export default function HeroBanner() {
  return (
    <section className="relative h-screen min-h-[680px] flex items-center overflow-hidden bg-white">
      {/* Subtle light grid */}
      <div
        className="absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Full-bleed car image — covers entire right side including behind text */}
      <motion.div
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1.0, ease: "easeOut" }}
        className="absolute right-0 top-0 bottom-0 w-[75%]"
      >
        <Image
          src="https://images.unsplash.com/photo-1570303278489-041bd897a873?w=1600&q=90&fit=crop"
          alt="Honda Civic — featured car"
          fill
          className="object-cover object-center"
          priority
          sizes="75vw"
        />
        {/* Left fade — softer so car bleeds behind the text */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/10 to-transparent" />
        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white to-transparent" />
      </motion.div>

      {/* Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-lg relative z-10">
          {/* Eyebrow */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-[11px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-5"
          >
            More Than Just a Car
          </motion.p>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-[80px] sm:text-[100px] lg:text-[110px] text-gray-900 leading-none mb-6 uppercase"
          >
            Find Your
            <br />
            <span className="text-[#cc1111]">Next Car.</span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25 }}
            className="text-gray-500 text-base max-w-sm mb-8 leading-relaxed"
          >
            Fully inspected by Master Garage, roadworthy certified pre-owned vehicles.
            Complete service history and parts transparency.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.35 }}
            className="flex flex-wrap gap-4 mb-14"
          >
            <Link
              href="#browse"
              className="px-8 py-3.5 bg-[#cc1111] text-white text-xs font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors"
            >
              Browse Cars →
            </Link>
            <Link
              href="#inquire"
              className="px-8 py-3.5 border border-gray-300 text-gray-600 text-xs font-bold tracking-widest uppercase hover:border-gray-800 hover:text-gray-900 transition-colors"
            >
              Get in Touch
            </Link>
          </motion.div>

        </div>
      </div>

      {/* Trust badges — pinned to right side over the car image */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.7, delay: 0.6 }}
        className="absolute right-10 top-1/2 -translate-y-1/2 hidden lg:flex flex-col gap-3 z-10"
      >
        {[
          { icon: <ShieldCheck size={22} />, label: "Fully Inspected" },
          { icon: <ClipboardList size={22} />, label: "Full History" },
          { icon: <BadgeCheck size={22} />, label: "Warranty Certified" },
        ].map((b) => (
          <span
            key={b.label}
            className="flex items-center gap-3 px-5 py-4 bg-white border border-gray-200 text-xs font-bold tracking-widest uppercase text-gray-700 shadow-sm"
          >
            <span className="text-[#cc1111]">{b.icon}</span>
            {b.label}
          </span>
        ))}
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">Scroll</span>
        <div className="w-px h-10 bg-gradient-to-b from-gray-300 to-transparent" />
      </motion.div>
    </section>
  );
}
