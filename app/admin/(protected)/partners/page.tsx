"use client";

import { useEffect, useState } from "react";
import { getPartners, addPartner, updatePartner } from "@/lib/partners";
import { getCars } from "@/lib/cars";
import { Partner } from "@/lib/types";
import Link from "next/link";
import { Search, X, KeyRound } from "lucide-react";

const INPUT =
  "w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-400 py-2 text-sm outline-none transition-colors";
const LABEL = "block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1";

export default function PartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [partnerStats, setPartnerStats] = useState<Record<string, { units: number; totalValue: number }>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | "active" | "inactive">("");
  const [showModal, setShowModal] = useState(false);
  const [newlyAddedPartner, setNewlyAddedPartner] = useState<Partner | null>(null);
  const [saving, setSaving] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  // Deactivate confirm modal
  const [confirmPartner, setConfirmPartner] = useState<Partner | null>(null);

  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formError, setFormError] = useState("");

  // Credentials modal
  const [credPartner, setCredPartner] = useState<Partner | null>(null);
  const [credEmail, setCredEmail] = useState("");
  const [credPassword, setCredPassword] = useState("");
  const [credError, setCredError] = useState("");
  const [credSaving, setCredSaving] = useState(false);
  const [credSuccess, setCredSuccess] = useState("");

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
      const id = await addPartner({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), username: "", status: "active" });
      const created: Partner = { id, name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim(), username: "", uid: "", status: "active", createdAt: new Date().toISOString() };
      setForm({ name: "", email: "", phone: "" });
      setShowModal(false);
      await fetchPartners();
      setNewlyAddedPartner(created);
    } catch {
      setFormError("Failed to add partner. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (partner: Partner) => {
    // Deactivation requires confirmation modal; activation proceeds directly
    if (partner.status === "active") {
      setConfirmPartner(partner);
      return;
    }
    await doToggle(partner, "active");
  };

  const doToggle = async (partner: Partner, newStatus: "active" | "inactive") => {
    setConfirmPartner(null);
    setToggling(partner.id);
    try {
      await updatePartner(partner.id, { status: newStatus });
      // Sync Firebase Auth disabled state if partner has a uid
      if (partner.uid) {
        await fetch("/api/admin/toggle-partner-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: partner.uid, disabled: newStatus === "inactive" }),
        });
      }
      setPartners((prev) =>
        prev.map((p) => (p.id === partner.id ? { ...p, status: newStatus } : p))
      );
    } catch {
      alert("Failed to update partner status.");
    } finally {
      setToggling(null);
    }
  };

  const openCredModal = (partner: Partner) => {
    const suggested = String(Math.floor(100000 + Math.random() * 900000));
    setCredPartner(partner);
    setCredEmail(partner.email || "");
    setCredPassword(suggested);
    setCredError("");
    setCredSuccess("");
  };

  const handleSetCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credPartner) return;
    setCredError("");
    setCredSuccess("");
    if (!credPassword) { setCredError("Password is required."); return; }
    if (credPassword.length < 6) { setCredError("Password must be at least 6 characters."); return; }

    setCredSaving(true);
    try {
      if (credPartner.uid) {
        // Reset password for existing account
        const res = await fetch("/api/admin/update-partner-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: credPartner.uid, password: credPassword }),
        });
        const data = await res.json();
        if (!res.ok) { setCredError(data.error || "Failed to reset password."); return; }
        setCredSuccess("Password updated. Share the new password with the partner.");
      } else {
        // Create new account
        if (!credEmail.trim()) { setCredError("Email is required."); return; }
        const res = await fetch("/api/admin/create-partner-auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: credEmail.trim(), password: credPassword }),
        });
        const data = await res.json();
        if (!res.ok) { setCredError(data.error || "Failed to create account."); return; }
        await updatePartner(credPartner.id, { uid: data.uid, email: credEmail.trim() });
        setPartners((prev) => prev.map((p) => p.id === credPartner.id ? { ...p, uid: data.uid, email: credEmail.trim() } : p));
        setCredSuccess("Account created. The partner can now log in.");
      }
      setCredPassword("");
    } catch {
      setCredError("Something went wrong. Please try again.");
    } finally {
      setCredSaving(false);
    }
  };

  const handleSendReset = async () => {
    if (!credPartner) return;
    setCredError("");
    setCredSuccess("");
    setCredSaving(true);
    try {
      const res = await fetch("/api/admin/reset-partner-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: credPartner.email }),
      });
      const data = await res.json();
      if (!res.ok) { setCredError(data.error || "Failed to send reset email."); return; }
      setCredSuccess(`Password reset email sent to ${credPartner.email}.`);
    } catch {
      setCredError("Something went wrong. Please try again.");
    } finally {
      setCredSaving(false);
    }
  };

  const hasFilters = search || statusFilter;

  const filteredPartners = partners.filter((p) => {
    if (statusFilter && p.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.email.toLowerCase().includes(q) ||
        (p.phone || "").includes(q)
      );
    }
    return true;
  });

  const clearFilters = () => { setSearch(""); setStatusFilter(""); };

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

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 focus:border-[#cc1111] outline-none text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "active" | "inactive")}
          className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-[#cc1111] transition-colors pb-0.5"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {hasFilters ? "No partners match your search or filters." : "No partners yet."}
          </div>
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
                {filteredPartners.map((partner) => (
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
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/partners/${partner.id}`}
                          className="bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors"
                        >
                          View
                        </Link>
                        {!partner.uid ? (
                          <button
                            onClick={() => openCredModal(partner)}
                            className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors"
                          >
                            <KeyRound size={10} />
                            Set Login
                          </button>
                        ) : (
                          <button
                            onClick={() => openCredModal(partner)}
                            className="flex items-center gap-1 bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors"
                          >
                            <KeyRound size={10} />
                            Reset Password
                          </button>
                        )}
                        <button
                          disabled={toggling === partner.id}
                          onClick={() => handleToggleStatus(partner)}
                          className={`px-2.5 py-1 text-[9px] font-bold tracking-widest uppercase transition-colors disabled:opacity-40 ${
                            partner.status === "active"
                              ? "bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-[#cc1111]"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {toggling === partner.id ? "..." : partner.status === "active" ? "Deactivate" : "Activate"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Credentials Modal */}
      {credPartner && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setCredPartner(null); }}
        >
          <div className="bg-white border border-gray-200 w-full max-w-md p-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Partner Portal Access</p>
                <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase">{credPartner.name}</h2>
              </div>
              <button onClick={() => setCredPartner(null)} className="text-gray-400 hover:text-gray-900 text-lg leading-none">✕</button>
            </div>

            {credPartner.uid ? (
              /* Already has account — reset password directly */
              <form onSubmit={handleSetCredentials} className="space-y-5">
                <div className="bg-green-50 border border-green-200 px-4 py-3 flex items-center gap-3">
                  <span className="text-green-600 text-lg">✓</span>
                  <div>
                    <p className="text-sm font-semibold text-green-700">Account active</p>
                    <p className="text-xs text-green-600 mt-0.5">{credPartner.email}</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={LABEL} style={{ marginBottom: 0 }}>New Password *</label>
                    <button
                      type="button"
                      onClick={() => { setCredPassword(String(Math.floor(100000 + Math.random() * 900000))); setCredError(""); }}
                      className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#cc1111] hover:underline"
                    >
                      Suggest Password
                    </button>
                  </div>
                  <input
                    type="text"
                    value={credPassword}
                    onChange={(e) => { setCredPassword(e.target.value); setCredError(""); }}
                    className={INPUT}
                    placeholder="Enter or generate a temporary password"
                  />
                  {credPassword && (
                    <p className="text-[10px] text-gray-400 mt-1">Share this temporary password with the partner.</p>
                  )}
                </div>

                {credError && <p className="text-xs text-[#cc1111]">{credError}</p>}
                {credSuccess && <p className="text-xs text-green-600">{credSuccess}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCredPartner(null)}
                    className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={credSaving}
                    className="flex-1 bg-blue-600 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-blue-700 transition-colors disabled:opacity-40">
                    {credSaving ? "Updating..." : "Reset Password"}
                  </button>
                </div>
              </form>
            ) : (
              /* No account yet — show create form */
              <form onSubmit={handleSetCredentials} className="space-y-5">
                <p className="text-xs text-gray-500 -mt-2">Create login credentials for this partner to access the Partner Portal.</p>

                <div>
                  <label className={LABEL}>Email *</label>
                  <input
                    type="email"
                    value={credEmail}
                    onChange={(e) => { setCredEmail(e.target.value); setCredError(""); }}
                    className={INPUT}
                    placeholder="partner@email.com"
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className={LABEL} style={{ marginBottom: 0 }}>Password *</label>
                    <button
                      type="button"
                      onClick={() => {
                        const suggested = String(Math.floor(100000 + Math.random() * 900000));
                        setCredPassword(suggested);
                        setCredError("");
                      }}
                      className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#cc1111] hover:underline"
                    >
                      Suggest Password
                    </button>
                  </div>
                  <input
                    type="text"
                    value={credPassword}
                    onChange={(e) => { setCredPassword(e.target.value); setCredError(""); }}
                    className={INPUT}
                    placeholder="Enter or generate a temporary password"
                  />
                  {credPassword && (
                    <p className="text-[10px] text-gray-400 mt-1">Share this temporary password with the partner.</p>
                  )}
                </div>

                {credError && <p className="text-xs text-[#cc1111]">{credError}</p>}
                {credSuccess && <p className="text-xs text-green-600">{credSuccess}</p>}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setCredPartner(null)}
                    className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" disabled={credSaving}
                    className="flex-1 bg-blue-600 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-blue-700 transition-colors disabled:opacity-40">
                    {credSaving ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Post-add: set login prompt */}
      {newlyAddedPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 w-full max-w-sm p-8 shadow-xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <KeyRound size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-gray-400">Partner Added</p>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">{newlyAddedPartner.name}</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Partner has been added successfully. Would you like to set up their login credentials for the Partner Portal now?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setNewlyAddedPartner(null)}
                className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors"
              >
                Later
              </button>
              <button
                onClick={() => { openCredModal(newlyAddedPartner); setNewlyAddedPartner(null); }}
                className="flex-1 bg-blue-600 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-blue-700 transition-colors"
              >
                Set Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate Confirm Modal */}
      {confirmPartner && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white border border-gray-200 w-full max-w-sm p-8 shadow-xl">
            <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Confirm Action</p>
            <h2 className="text-xl font-bold text-gray-900 tracking-wide uppercase mb-4">Deactivate Partner?</h2>
            <p className="text-sm text-gray-600 mb-2">
              You are about to deactivate <span className="font-semibold text-gray-900">{confirmPartner.name}</span>.
            </p>
            <p className="text-sm text-gray-600 mb-6">
              {confirmPartner.uid
                ? "Their portal access will also be disabled immediately."
                : "This partner has no portal account."}
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmPartner(null)}
                className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={toggling === confirmPartner.id}
                onClick={() => doToggle(confirmPartner, "inactive")}
                className="flex-1 bg-[#cc1111] text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors disabled:opacity-40"
              >
                {toggling === confirmPartner.id ? "Deactivating..." : "Deactivate"}
              </button>
            </div>
          </div>
        </div>
      )}

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
