"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, X } from "lucide-react";

export default function FloatingInquiry() {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 9000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible || dismissed) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="flex items-center gap-3 bg-white border border-gray-200 shadow-xl px-5 py-4 max-w-xs">
        <div className="w-9 h-9 bg-[#cc1111] flex items-center justify-center flex-shrink-0">
          <MessageCircle size={18} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-gray-900 text-xs font-bold mb-0.5">Got questions?</p>
          <Link
            href="/contact"
            className="text-[#cc1111] text-[11px] font-bold tracking-widest uppercase hover:underline"
          >
            Message us →
          </Link>
        </div>
        <button
          onClick={() => setDismissed(true)}
          className="text-gray-300 hover:text-gray-600 flex-shrink-0 ml-1"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
