"use client";

import { useEffect, useState } from "react";
import { getPartners, addPartner, updatePartner } from "@/lib/partners";
import { getCars } from "@/lib/cars";
import { Partner } from "@/lib/types";

const INPUT =
  "w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-2 text-sm outline-none transition-colors";
const LABEL = "block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerStats, setPartnerStats] = useState<Record<string, { units: number; totalValue: number }>>({});
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const [data, cars] = await Promise.all([getPartners(), getCars()]);
      setPartners(data);
      const stats: Record<string, { units: number; totalValue: number }> = {};
      cars.forEach((c) => {
        if (!c.partnerId) return;
        if (!stats[c.partnerId]) stats[c.partnerId] = { units: 0, totalValue: 0 };
        stats[c.partnerId].units += 1;
        stats[c.partnerId].totalValue += c.partnerCost || 0;
      });
      setPartnerStats(stats);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPartners(); }, []);

  const handleAddPartner = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!form.name.trim()) { setFormError("Name is required."); return; }
    if (!form.email.trim()) { setFormError("Email is required."); return; }

    setSaving(true);
    try {
      await addPartner({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), username: "", status: "active" });
      setForm({ name: "", email: "", phone: "" });
      setShowModal(false);
      await fetchPartners();
    } catch {
      setFormError("Failed to add partner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (partner: Partner) => {
    const newStatus = partner.status === "active" ? "inactive" : "active";
    setToggling(partner.id);
    try {
      await updatePartner(partner.id, { status: newStatus });
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, status: newStatus } : p))
      );
    } catch {
      alert("Failed to update partner status.");
    } finally {
      setToggling(null);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Suppliers</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">Partners</h1>
        </div>
        <button
          onClick={() => { setShowModal(true); setFormError(""); }}
          className="bg-[#cc1111] text-white px-5 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors"
        >
          + Add Partner
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : partners.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">No partners yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {[
                    { label: "Name",        cls: "text-left" },
                    { label: "Email",       cls: "text-left" },
                    { label: "Phone",       cls: "text-left" },
                    { label: "Units",       cls: "text-center" },
                    { label: "Total Value", cls: "text-right" },
                    { label: "Status",      cls: "text-left" },
                    { label: "Since",       cls: "text-left" },
                    { label: "Actions",     cls: "text-left" },
                  ].map(({ label, cls }) => (
                    <th
                      key={label}
                      className={`px-5 py-3 text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 ${cls}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map((partner) => (
                  <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm font-semibold text-gray-900">{partner.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{partner.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{partner.phone || "—"}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 font-semibold text-center">
                      {partnerStats[partner.id]?.units ?? 0}
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-900 font-semibold text-right">
                      {partnerStats[partner.id]?.totalValue
                        ? "₱ " + partnerStats[partner.id].totalValue.toLocaleString("en-PH")
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`border text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 ${
                          partner.status === "active"
                            ? "border-[#2a7a2a] text-[#4caf50]"
                            : "border-gray-300 text-gray-400"
                        }`}
                      >
                        {partner.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500">
                      {partner.createdAt
                        ? new Date(partner.createdAt).toLocaleDateString("en-PH", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        disabled={toggling === partner.id}
                        onClick={() => handleToggleStatus(partner)}
                        className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase transition-colors disabled:opacity-40 ${
                          partner.status === "active"
                            ? "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-[#cc1111]"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {toggling === partner.id ? "..." : partner.status === "active" ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Partner Modal */}
      {showModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div className="bg-white border border-gray-200 w-full max-w-md p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">New</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase">Add Partner</h2>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-900 text-lg leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddPartner} className="space-y-5">
              <div>
                <label className={LABEL}>Name *</label>
                <input
                  className={INPUT}
                  placeholder="Partner / supplier name"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                />
              </div>
              <div>
                <label className={LABEL}>Email *</label>
                <input
                  type="email"
                  className={INPUT}
                  placeholder="partner@example.com"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div>
                <label className={LABEL}>Phone</label>
                <input
                  className={INPUT}
                  placeholder="+63 9XX XXX XXXX"
                  value={form.phone}
                  onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                />
              </div>

              {formError && <p className="text-sm text-[#cc1111]">{formError}</p>}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 border border-[#cc1111] text-[#cc1111] py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#cc1111] hover:text-white transition-colors disabled:opacity-40"
                >
                  {saving ? "Saving..." : "Add Partner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
