"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";

const links = [
  { label: "Browse Cars", href: "/" },
  { label: "Sold Cars", href: "/cars/sold" },
  { label: "Contact", href: "#inquire" },
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-md shadow-lg shadow-black/50" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-[#cc1111] flex items-center justify-center">
              <span className="text-white font-black text-sm">MG</span>
            </div>
            <div>
              <span className="font-heading text-white font-bold text-lg tracking-widest uppercase">
                AUTO
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`text-sm font-medium tracking-widest uppercase transition-colors duration-200 ${
                  pathname === l.href
                    ? "text-[#cc1111]"
                    : "text-[#aaa] hover:text-white"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/admin"
              className="text-xs tracking-widest uppercase text-[#555] hover:text-[#cc1111] transition-colors"
            >
              Admin
            </Link>
          </nav>

          {/* Mobile toggle */}
          <button
            className="md:hidden text-white p-2"
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden bg-[#111] border-t border-[#1f1f1f] py-4">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="block px-4 py-3 text-sm font-medium tracking-widest uppercase text-[#aaa] hover:text-white hover:bg-[#1a1a1a]"
              >
                {l.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
