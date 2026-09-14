"use client";

import { useEffect, useState, createContext, useContext } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { onAuthStateChanged, signOut as firebaseSignOut, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getPartnerByUid } from "@/lib/partners";
import { getNotificationsForPartner } from "@/lib/notifications";
import { Partner } from "@/lib/types";
import { LayoutDashboard, Car, DollarSign, Bell, LogOut, KeyRound, X } from "lucide-react";

interface PartnerContextValue {
  partner: Partner;
  unreadCount: number;
  refreshUnread: () => void;
}
export const PartnerContext = createContext<PartnerContextValue | null>(null);
export function usePartner() {
  const ctx = useContext(PartnerContext);
  if (!ctx) throw new Error("usePartner must be used inside partner portal layout");
  return ctx;
}

const NAV = [
  { href: "/partner/dashboard",      label: "Dashboard",      icon: LayoutDashboard },
  { href: "/partner/units",          label: "My Units",       icon: Car },
  { href: "/partner/earnings",       label: "Earnings",       icon: DollarSign },
  { href: "/partner/notifications",  label: "Notifications",  icon: Bell },
];

export default function PartnerPortalLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Change password modal
  const [showChangePw, setShowChangePw] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");
  const [pwSaving, setPwSaving] = useState(false);

  const refreshUnread = async (partnerId: string) => {
    try {
      const notifs = await getNotificationsForPartner(partnerId);
      setUnreadCount(notifs.filter((n) => !n.read).length);
    } catch {}
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/partner"); return; }
      try {
        const p = await getPartnerByUid(user.uid);
        if (!p || p.status === "inactive") { await firebaseSignOut(auth); router.push("/partner"); return; }
        setPartner(p);
        refreshUnread(p.id);
      } catch {
        router.push("/partner");
      } finally {
        setAuthChecked(true);
      }
    });
    return () => unsub();
  }, [router]);

  const handleSignOut = async () => {
    await firebaseSignOut(auth);
    router.push("/partner");
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(""); setPwSuccess("");
    if (!currentPw) { setPwError("Current password is required."); return; }
    if (newPw.length < 6) { setPwError("New password must be at least 6 characters."); return; }
    if (newPw !== confirmPw) { setPwError("Passwords do not match."); return; }
    const user = auth.currentUser;
    if (!user || !user.email) { setPwError("Session expired. Please log in again."); return; }
    setPwSaving(true);
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPw);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPw);
      setPwSuccess("Password updated successfully.");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
    } catch (err: any) {
      if (err?.code === "auth/wrong-password" || err?.code === "auth/invalid-credential") {
        setPwError("Current password is incorrect.");
      } else {
        setPwError("Failed to update password. Please try again.");
      }
    } finally {
      setPwSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#1f1f1f] border-t-[#cc1111] rounded-full animate-spin" />
      </div>
    );
  }
  if (!partner) return null;

  return (
    <PartnerContext.Provider value={{ partner, unreadCount, refreshUnread: () => refreshUnread(partner.id) }}>
      <div className="min-h-screen bg-[#f5f6fa] flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 h-full w-60 bg-[#0d0d0d] border-r border-[#1f1f1f] flex flex-col z-40">
          <div className="px-6 py-6 border-b border-[#1f1f1f]">
            <h2 className="font-display text-2xl text-white tracking-widest leading-none">AUTO EXCHANGE</h2>
            <p className="text-[9px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mt-1">Partner Portal</p>
          </div>

          <div className="px-6 py-4 border-b border-[#1f1f1f]">
            <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-600 mb-0.5">Logged in as</p>
            <p className="text-sm font-semibold text-white truncate">{partner.name}</p>
          </div>

          <nav className="flex-1 py-4 overflow-y-auto">
            {NAV.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-6 py-3 text-sm font-medium transition-colors border-l-2 ${
                    isActive ? "text-[#cc1111] border-[#cc1111] bg-[#1a0808]" : "text-[#666] border-transparent hover:text-[#f5f5f5]"
                  }`}
                >
                  <Icon size={16} />
                  {label}
                  {label === "Notifications" && unreadCount > 0 && (
                    <span className="ml-auto bg-[#cc1111] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="px-4 py-4 border-t border-[#1f1f1f] space-y-1">
            <button
              onClick={() => { setShowChangePw(true); setPwError(""); setPwSuccess(""); setCurrentPw(""); setNewPw(""); setConfirmPw(""); }}
              className="flex items-center gap-3 w-full px-2 py-2 text-sm text-[#555] hover:text-[#f5f5f5] transition-colors"
            >
              <KeyRound size={16} />
              Change Password
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-2 py-2 text-sm text-[#555] hover:text-[#cc1111] transition-colors"
            >
              <LogOut size={16} />
              Sign Out
            </button>
          </div>
        </aside>

        <main className="ml-60 flex-1 min-h-screen bg-[#f5f6fa] text-gray-900 p-8">
          {children}
        </main>
      </div>

      {/* Change Password Modal */}
      {showChangePw && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowChangePw(false); }}
        >
          <div className="bg-white border border-gray-200 w-full max-w-sm p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Security</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase">Change Password</h2>
              </div>
              <button onClick={() => setShowChangePw(false)} className="text-gray-400 hover:text-gray-900 transition-colors">
                <X size={18} />
              </button>
            </div>

            {pwSuccess ? (
              <div className="space-y-5">
                <div className="bg-green-50 border border-green-200 px-4 py-3">
                  <p className="text-sm font-semibold text-green-700">✓ {pwSuccess}</p>
                </div>
                <button
                  onClick={() => setShowChangePw(false)}
                  className="w-full bg-gray-700 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-gray-900 transition-colors"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleChangePassword} className="space-y-5">
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Current Password</label>
                  <input
                    type="password"
                    value={currentPw}
                    onChange={(e) => { setCurrentPw(e.target.value); setPwError(""); }}
                    placeholder="••••••••"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">New Password</label>
                  <input
                    type="password"
                    value={newPw}
                    onChange={(e) => { setNewPw(e.target.value); setPwError(""); }}
                    placeholder="Min. 6 characters"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => { setConfirmPw(e.target.value); setPwError(""); }}
                    placeholder="Re-enter new password"
                    className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                  />
                </div>

                {pwError && <p className="text-xs text-[#cc1111]">{pwError}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setShowChangePw(false)}
                    className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={pwSaving}
                    className="flex-1 bg-[#cc1111] text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-40">
                    {pwSaving ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </PartnerContext.Provider>
  );
}
