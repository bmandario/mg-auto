import Link from "next/link";
import { Mail, MapPin } from "lucide-react";

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
  </svg>
);

const YoutubeIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.95C5.12 20 12 20 12 20s6.88 0 8.59-.47a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
    <polygon fill="white" points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
);

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
            <p className="text-gray-500 text-sm leading-relaxed mb-5">
              Quality pre-owned vehicles, fully inspected and roadworthy certified.
              Your trusted partner in finding the right car.
            </p>
            {/* Social icons */}
            <div className="flex gap-3">
              {[
                { icon: <FacebookIcon />, href: "#" },
                { icon: <InstagramIcon />, href: "#" },
                { icon: <YoutubeIcon />, href: "#" },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-8 h-8 flex items-center justify-center border border-gray-200 text-gray-400 hover:border-[#cc1111] hover:text-[#cc1111] transition-colors"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-900 mb-4">
              Browse
            </h4>
            <ul className="space-y-2.5">
              {[
                { label: "Available Units", href: "/#browse" },
                { label: "Sold Units", href: "/cars/sold" },
                { label: "About", href: "/about" },
                { label: "Contact Us", href: "#inquire" },
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
