"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "@/lib/auth";
import { isAdmin } from "@/lib/admins";
import { signOut } from "@/lib/auth";

const schema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type FormData = z.infer<typeof schema>;

const INPUT_CLASS =
  "w-full bg-transparent border-b border-[#ddd] focus:border-[#cc1111] text-[#111] placeholder-[#bbb] py-2.5 text-sm font-sans font-medium outline-none transition-colors";

export default function AdminLoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setServerError("");
    setLoading(true);
    try {
      const cred = await signIn(data.email, data.password);
      const adminAccess = await isAdmin(cred.user.uid);
      if (!adminAccess) {
        await signOut();
        setServerError("Access denied. This account is not authorized as an admin.");
        return;
      }
      router.push("/admin/dashboard");
    } catch (err: any) {
      if (
        err.code === "auth/wrong-password" ||
        err.code === "auth/user-not-found" ||
        err.code === "auth/invalid-credential"
      ) {
        setServerError("Invalid email or password.");
      } else {
        setServerError("An error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="font-display text-5xl text-[#111] tracking-widest mb-1">AUTO EXCHANGE</h1>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">
            Admin Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#e5e5e5] shadow-sm p-8">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#888] mb-2">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                placeholder="admin@example.com"
                className={INPUT_CLASS}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-[#cc1111]">{errors.email.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#888] mb-2">
                Password
              </label>
              <input
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={INPUT_CLASS}
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-[#cc1111]">{errors.password.message}</p>
              )}
            </div>

            {/* Server error */}
            {serverError && (
              <p className="text-sm text-[#cc1111] text-center">{serverError}</p>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full border border-[#cc1111] text-[#cc1111] py-3 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#cc1111] hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
