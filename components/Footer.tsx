import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-3">
              <span className="font-display text-gray-900 text-xl tracking-widest uppercase leading-none">
                AUTO EXCHANGE
              </span>
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-[#cc1111] mt-0.5">
                Pre-Owned Vehicles
              </p>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Quality pre-owned vehicles, fully inspected and roadworthy certified.
              Your trusted partner in finding the right car.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-900 mb-4">
              Browse
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Available Units", href: "/cars" },
                { label: "FAQs", href: "/faq" },
                { label: "About", href: "/about" },
                { label: "Contact Us", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-gray-500 text-sm hover:text-[#cc1111] transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-900 mb-4">
              Contact
            </h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <Mail size={14} className="text-[#cc1111] shrink-0" />
                gmsolutions888@gmail.com
              </li>
              <li className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={14} className="text-[#cc1111] shrink-0" />
                Philippines
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">
            © {new Date().getFullYear()} Auto Exchange. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/terms" className="text-gray-400 text-xs hover:text-gray-700 transition-colors">
              Terms of Use
            </Link>
            <Link href="/privacy" className="text-gray-400 text-xs hover:text-gray-700 transition-colors">
              Privacy Policy
            </Link>
            <Link href="/admin" className="text-gray-300 text-xs hover:text-[#cc1111] transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
