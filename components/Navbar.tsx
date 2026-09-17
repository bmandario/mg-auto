"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Available Units", href: "/cars" },
  { label: "FAQs", href: "/faq" },
  { label: "About", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white ${
        scrolled ? "shadow-md" : "border-b border-gray-100"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex flex-col leading-none">
            <span className="font-display text-gray-900 text-xl tracking-widest uppercase">
              AUTO EXCHANGE
            </span>
            <span className="text-[9px] font-semibold tracking-[0.3em] uppercase text-[#cc1111] mt-0.5">
              Pre-Owned Vehicles
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-[11px] font-semibold tracking-widest uppercase transition-colors duration-200 ${
                  pathname === l.href
                    ? "text-[#cc1111]"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Right: CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              href="/cars"
              className="px-5 py-2 bg-[#cc1111] text-white text-[10px] font-bold tracking-widest uppercase hover:bg-[#aa0e0e] transition-colors"
            >
              Browse Cars
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-white border-t border-gray-100 py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-[11px] font-semibold tracking-widest uppercase text-gray-600 hover:text-[#cc1111] hover:bg-gray-50"
              >
                {l.label}
              </Link>
            ))}
            <div className="px-4 pt-3">
              <Link
                href="/cars"
                onClick={() => setOpen(false)}
                className="block text-center px-5 py-2.5 bg-[#cc1111] text-white text-[10px] font-bold tracking-widest uppercase"
              >
                Browse Cars
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
