"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { getPartnerByUid } from "@/lib/partners";

export default function PartnerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const partner = await getPartnerByUid(cred.user.uid);
      if (!partner) {
        await auth.signOut();
        setError("No partner account found for this login.");
        return;
      }
      if (partner.status === "inactive") {
        await auth.signOut();
        setError("Your account is inactive. Please contact the administrator.");
        return;
      }
      router.push("/partner/dashboard");
    } catch {
      setError("Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl text-[#111] tracking-widest leading-none mb-2">
            AUTO EXCHANGE
          </h1>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">
            Partner Portal
          </p>
        </div>

        <div className="bg-white border border-[#e5e5e5] shadow-sm p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#888] mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[#ddd] focus:border-[#cc1111] text-[#111] placeholder-[#bbb] py-2.5 text-sm font-sans font-medium outline-none transition-colors"
              placeholder="you@email.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#888] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-transparent border-b border-[#ddd] focus:border-[#cc1111] text-[#111] placeholder-[#bbb] py-2.5 text-sm font-sans font-medium outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-[#cc1111]">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#cc1111] text-white py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-40 mt-2"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
        </div>
      </div>
    </div>
  );
}
