"use client";

import { useEffect, useState } from "react";
import { getInquiries, updateInquiryStatus } from "@/lib/inquiries";
import { Inquiry } from "@/lib/types";
import { Search, X } from "lucide-react";

type Filter = "all" | "new" | "read" | "responded";

const STATUS_STYLE: Record<string, string> = {
  new: "border-[#cc1111] text-[#cc1111]",
  read: "border-gray-300 text-gray-400",
  responded: "border-[#2a7a2a] text-[#4caf50]",
};

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const data = await getInquiries();
      setInquiries(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInquiries(); }, []);

  const handleStatusChange = async (id: string, status: Inquiry["status"]) => {
    setUpdating(id);
    try {
      await updateInquiryStatus(id, status);
      setInquiries((prev) => prev.map((i) => (i.id === id ? { ...i, status } : i)));
    } catch {
      alert("Failed to update status.");
    } finally {
      setUpdating(null);
    }
  };

  const hasFilters = search || dateFrom || dateTo;

  const applyFilters = (list: Inquiry[]) => {
    let out = list;
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((i) =>
        i.name.toLowerCase().includes(q) ||
        i.email.toLowerCase().includes(q) ||
        i.phone.includes(q) ||
        i.carTitle.toLowerCase().includes(q) ||
        i.message.toLowerCase().includes(q)
      );
    }
    if (dateFrom) out = out.filter((i) => new Date(i.createdAt) >= new Date(dateFrom));
    if (dateTo) {
      const to = new Date(dateTo);
      to.setHours(23, 59, 59);
      out = out.filter((i) => new Date(i.createdAt) <= to);
    }
    return out;
  };

  const byStatus = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const filtered = applyFilters(byStatus);
  const tabs: Filter[] = ["all", "new", "read", "responded"];
  const tabCount = (t: Filter) => {
    const byTab = t === "all" ? inquiries : inquiries.filter((i) => i.status === t);
    return applyFilters(byTab).length;
  };
  const clearFilters = () => { setSearch(""); setDateFrom(""); setDateTo(""); };

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Leads</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">Inquiries</h1>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-5 flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, phone, car, message..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 focus:border-[#cc1111] outline-none text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>

        <div>
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-1">From</p>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
          />
        </div>

        <div>
          <p className="text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400 mb-1">To</p>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
          />
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-[#cc1111] transition-colors pb-0.5"
          >
            <X size={12} /> Clear
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-0 mb-6 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-5 py-3 text-[10px] font-bold tracking-[0.3em] uppercase transition-colors border-b-2 -mb-px ${
              filter === tab
                ? "border-[#cc1111] text-[#cc1111]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab} ({tabCount(tab)})
          </button>
        ))}
      </div>

      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {hasFilters ? "No inquiries match your search or filters." : "No inquiries found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Car", "Name", "Email", "Phone", "Message", "Date", "Status", "Action"].map((h) => (
                    <th
                      key={h}
                      className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((inq) => (
                  <tr key={inq.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-5 py-4 text-sm text-gray-900 max-w-[160px] truncate">{inq.carTitle}</td>
                    <td className="px-5 py-4 text-sm text-gray-900 whitespace-nowrap">{inq.name}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{inq.email}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">{inq.phone}</td>
                    <td className="px-5 py-4 text-sm text-gray-500 max-w-[200px]">
                      <span className="line-clamp-2">{inq.message}</span>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-500 whitespace-nowrap">
                      {(() => { const d = new Date(inq.createdAt); return `${String(d.getMonth()+1).padStart(2,"0")}/${String(d.getDate()).padStart(2,"0")}/${d.getFullYear()}`; })()}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={`border text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 ${STATUS_STYLE[inq.status] ?? ""}`}
                      >
                        {inq.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex gap-1">
                        {inq.status === "new" && (
                          <button
                            disabled={updating === inq.id}
                            onClick={() => handleStatusChange(inq.id, "read")}
                            className="border border-gray-300 text-gray-500 px-2 py-1 text-[9px] font-bold tracking-widest uppercase hover:border-gray-800 hover:text-gray-900 transition-colors disabled:opacity-40"
                          >
                            Mark Read
                          </button>
                        )}
                        {inq.status !== "responded" && (
                          <button
                            disabled={updating === inq.id}
                            onClick={() => handleStatusChange(inq.id, "responded")}
                            className="border border-[#2a7a2a] text-[#4caf50] px-2 py-1 text-[9px] font-bold tracking-widest uppercase hover:bg-[#2a7a2a] hover:text-white transition-colors disabled:opacity-40"
                          >
                            Responded
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
