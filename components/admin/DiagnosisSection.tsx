"use client";

import { useState } from "react";
import { Diagnosis, DiagnosisCategory, DiagnosisStatus, DIAGNOSIS_DEFAULTS } from "@/lib/types";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";

const STATUS_CONFIG: Record<DiagnosisStatus, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  ok:        { label: "OK",        color: "#4caf50", bg: "#4caf5018", icon: <CheckCircle size={14} /> },
  attention: { label: "Attention", color: "#e0b840", bg: "#e0b84018", icon: <AlertTriangle size={14} /> },
  critical:  { label: "Critical",  color: "#cc1111", bg: "#cc111118", icon: <XCircle size={14} /> },
};

const INPUT = "w-full bg-transparent border-b border-gray-200 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-1.5 text-sm outline-none transition-colors";
const LABEL = "block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1";

interface Props {
  value: Diagnosis;
  onChange: (d: Diagnosis) => void;
}

export default function DiagnosisSection({ value, onChange }: Props) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const set = (patch: Partial<Diagnosis>) => onChange({ ...value, ...patch });

  const setItem = (catIdx: number, itemIdx: number, patch: Partial<{ status: DiagnosisStatus; notes: string }>) => {
    const cats = value.categories.map((cat, ci) =>
      ci !== catIdx ? cat : {
        ...cat,
        items: cat.items.map((item, ii) => ii !== itemIdx ? item : { ...item, ...patch }),
      }
    );
    onChange({ ...value, categories: cats });
  };

  const countByStatus = (status: DiagnosisStatus) =>
    value.categories.flatMap((c) => c.items).filter((i) => i.status === status).length;

  return (
    <div className="space-y-6">
      {/* Header fields */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className={LABEL}>Inspection Date</label>
          <input type="date" className={INPUT} value={value.date} onChange={(e) => set({ date: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>Technician</label>
          <input className={INPUT} placeholder="Technician name" value={value.technician} onChange={(e) => set({ technician: e.target.value })} />
        </div>
        <div>
          <label className={LABEL}>Overall Status</label>
          <div className="flex gap-2 pt-1">
            {(["ok", "attention", "critical"] as DiagnosisStatus[]).map((s) => {
              const cfg = STATUS_CONFIG[s];
              const active = value.overallStatus === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => set({ overallStatus: s })}
                  className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-[10px] font-bold tracking-widest uppercase border transition-colors"
                  style={{
                    borderColor: active ? cfg.color : "#333",
                    color: active ? cfg.color : "#555",
                    backgroundColor: active ? cfg.bg : "transparent",
                  }}
                >
                  <span style={{ color: cfg.color }}>{cfg.icon}</span>
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary pills */}
      <div className="flex gap-3">
        {(["ok", "attention", "critical"] as DiagnosisStatus[]).map((s) => {
          const cfg = STATUS_CONFIG[s];
          const count = countByStatus(s);
          return (
            <div key={s} className="flex items-center gap-1.5 px-3 py-1.5 border text-xs font-bold tracking-widest uppercase" style={{ borderColor: cfg.color + "40", color: cfg.color }}>
              {cfg.icon}
              <span>{count} {cfg.label}</span>
            </div>
          );
        })}
      </div>

      {/* Categories */}
      {value.categories.map((cat, catIdx) => {
        const isOpen = !collapsed[cat.category];
        const issues = cat.items.filter((i) => i.status !== "ok").length;
        return (
          <div key={cat.category} className="border border-gray-200">
            {/* Category header */}
            <button
              type="button"
              onClick={() => setCollapsed((prev) => ({ ...prev, [cat.category]: !prev[cat.category] }))}
              className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold tracking-[0.3em] uppercase text-gray-900">{cat.category}</span>
                {issues > 0 && (
                  <span className="text-[9px] font-bold tracking-wider px-2 py-0.5 border border-[#e0b840]/40 text-[#e0b840]">
                    {issues} issue{issues > 1 ? "s" : ""}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3">
                <div className="flex gap-1">
                  {cat.items.map((item, ii) => {
                    const cfg = STATUS_CONFIG[item.status];
                    return <span key={ii} className="w-2 h-2 rounded-full" style={{ backgroundColor: cfg.color }} />;
                  })}
                </div>
                {isOpen ? <ChevronUp size={14} className="text-gray-400" /> : <ChevronDown size={14} className="text-gray-400" />}
              </div>
            </button>

            {/* Items */}
            {isOpen && (
              <div className="divide-y divide-gray-100">
                {cat.items.map((item, itemIdx) => (
                  <div key={itemIdx} className="px-5 py-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {/* Name + status toggles */}
                    <div>
                      <p className="text-sm text-gray-900 mb-2">{item.name}</p>
                      <div className="flex gap-2">
                        {(["ok", "attention", "critical"] as DiagnosisStatus[]).map((s) => {
                          const cfg = STATUS_CONFIG[s];
                          const active = item.status === s;
                          return (
                            <button
                              key={s}
                              type="button"
                              onClick={() => setItem(catIdx, itemIdx, { status: s })}
                              className="flex items-center gap-1 px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase border transition-colors"
                              style={{
                                borderColor: active ? cfg.color : "#2a2a2a",
                                color: active ? cfg.color : "#555",
                                backgroundColor: active ? cfg.bg : "transparent",
                              }}
                            >
                              <span style={{ color: cfg.color }}>{cfg.icon}</span>
                              {cfg.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    {/* Notes */}
                    <input
                      className={INPUT}
                      placeholder="Notes (optional)"
                      value={item.notes}
                      onChange={(e) => setItem(catIdx, itemIdx, { notes: e.target.value })}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Overall notes */}
      <div>
        <label className={LABEL}>Overall Diagnosis Notes</label>
        <textarea
          rows={3}
          className="w-full bg-transparent border-b border-gray-200 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-2 text-sm outline-none transition-colors resize-none"
          placeholder="General findings or recommendations..."
          value={value.notes}
          onChange={(e) => set({ notes: e.target.value })}
        />
      </div>
    </div>
  );
}
