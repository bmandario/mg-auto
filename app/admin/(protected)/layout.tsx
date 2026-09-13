"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { signOut } from "@/lib/auth";
import {
  LayoutDashboard,
  Car,
  MessageSquare,
  Users,
  LogOut,
  BarChart2,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/cars", label: "Units", icon: Car },
  { href: "/admin/inquiries", label: "Inquiries", icon: MessageSquare },
  { href: "/admin/partners", label: "Partners", icon: Users },
  { href: "/admin/reports", label: "Reports", icon: BarChart2 },
];

export default function AdminProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authChecked, setAuthChecked] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthenticated(true);
      } else {
        router.push("/admin");
      }
      setAuthChecked(true);
    });
    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/admin");
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#f5f6fa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1f1f1f] border-t-[#cc1111] rounded-full animate-spin" />
      </div>
    );
  }

  if (!authenticated) return null;

  return (
    <div className="min-h-screen bg-[#f5f6fa] flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col z-40">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-[#1f1f1f]">
          <h2 className="font-display text-2xl text-white tracking-widest leading-none">
            AUTO EXCHANGE
          </h2>
          <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mt-1">
            Admin
          </p>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/");
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors ${
                  isActive
                    ? "text-[#cc1111] border-l-2 border-[#cc1111] bg-[#1a0808]"
                    : "text-[#666] hover:text-[#f5f5f5] border-l-2 border-transparent"
                }`}
              >
                <Icon size={16} />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Sign Out */}
        <div className="px-4 py-4 border-t border-[#1f1f1f]">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 w-full px-2 py-2 text-sm text-[#555] hover:text-[#cc1111] transition-colors"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen bg-[#f5f6fa] text-gray-900 p-8">
        {children}
      </main>
    </div>
  );
}
