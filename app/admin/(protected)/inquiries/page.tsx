"use client";

import { useEffect, useState } from "react";
import { getInquiries, updateInquiryStatus } from "@/lib/inquiries";
import { Inquiry } from "@/lib/types";

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

  const filtered = filter === "all" ? inquiries : inquiries.filter((i) => i.status === filter);
  const tabs: Filter[] = ["all", "new", "read", "responded"];
  const tabCount = (t: Filter) => (t === "all" ? inquiries.length : inquiries.filter((i) => i.status === t).length);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Leads</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">Inquiries</h1>
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
          <div className="py-16 text-center text-gray-400 text-sm">No inquiries found.</div>
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
                      {new Date(inq.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
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
