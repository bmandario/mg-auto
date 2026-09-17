"use client";

import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { UserCircle } from "lucide-react";

export default function AdminUserBadge() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setEmail(user?.email ?? null);
    });
    return () => unsubscribe();
  }, []);

  if (!email) return null;

  return (
    <div className="flex items-center gap-2 text-sm text-gray-500">
      <UserCircle size={16} className="text-[#cc1111]" />
      <span className="font-medium text-gray-700">{email}</span>
    </div>
  );
}
