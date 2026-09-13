import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-[#0d0d0d] border-t border-[#1f1f1f] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <span className="font-display text-white text-xl tracking-widest uppercase leading-none">AUTO EXCHANGE</span>
            </div>
            <p className="text-[#666] text-sm leading-relaxed">
              Quality pre-owned vehicles, fully inspected and roadworthy certified.
              Your trusted partner in finding the right car.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#cc1111] mb-4">
              Browse
            </h4>
            <ul className="space-y-2">
              {[
                { label: "Available Units", href: "/#browse" },
                { label: "Sold Units", href: "/cars/sold" },
                { label: "About", href: "/about" },
              ].map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-[#666] text-sm hover:text-white transition-colors">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-semibold tracking-widest uppercase text-[#cc1111] mb-4">
              Contact
            </h4>
            <ul className="space-y-2 text-[#666] text-sm">
              <li>gmsolutions888@gmail.com</li>
              <li>Philippines</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#1f1f1f] mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-[#444] text-xs">
            © {new Date().getFullYear()} Auto Exchange. All rights reserved.
          </p>
          <Link href="/admin" className="text-[#333] text-xs hover:text-[#cc1111] transition-colors">
            Admin Portal
          </Link>
        </div>
      </div>
    </footer>
  );
}
