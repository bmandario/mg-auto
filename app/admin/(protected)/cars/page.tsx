"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getCars, updateCar, logCarActivity } from "@/lib/cars";
import { getInquiries } from "@/lib/inquiries";
import { addNotification } from "@/lib/notifications";
import { Car, CAR_BRANDS, CAR_TYPES } from "@/lib/types";
import { EyeOff, BadgeCheck, Search, X } from "lucide-react";

type FilterTab = "all" | "published" | "unpublished" | "sold" | "draft";

const STATUS_BADGE: Record<string, string> = {
  published: "border-[#2a7a2a] text-[#4caf50]",
  unpublished: "border-[#7a6a2a] text-[#e0b840]",
  sold: "border-[#cc1111] text-[#cc1111]",
  draft: "border-gray-300 text-gray-400",
};

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [inquiryCounts, setInquiryCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterTab>("published");
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");
  const [unpublishing, setUnpublishing] = useState<string | null>(null);
  const [marking, setMarking] = useState<string | null>(null);

  // Unpublish modal
  const [confirmCar, setConfirmCar] = useState<{ id: string; title: string } | null>(null);

  // Sold modal
  const [soldCar, setSoldCar] = useState<{ id: string; title: string; sellingPrice: number; partnerId: string; partnerName: string } | null>(null);
  const [soldPrice, setSoldPrice] = useState("");
  const [soldDate, setSoldDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentToPartner, setPaymentToPartner] = useState("");
  const [soldError, setSoldError] = useState("");

  const fetchCars = async () => {
    setLoading(true);
    try {
      const [data, inquiries] = await Promise.all([getCars(), getInquiries()]);
      setCars(data);
      const counts: Record<string, number> = {};
      inquiries.forEach((inq) => {
        counts[inq.carId] = (counts[inq.carId] || 0) + 1;
      });
      setInquiryCounts(counts);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCars(); }, []);

  const handleUnpublishConfirm = async () => {
    if (!confirmCar) return;
    setUnpublishing(confirmCar.id);
    setConfirmCar(null);
    try {
      await updateCar(confirmCar.id, { status: "unpublished", updatedAt: new Date().toISOString() });
      await logCarActivity(confirmCar.id, "Moved to Unpublished");
      setCars((prev) => prev.map((c) => c.id === confirmCar.id ? { ...c, status: "unpublished" } : c));
    } catch {
      alert("Failed to unpublish unit.");
    } finally {
      setUnpublishing(null);
    }
  };

  const openSoldModal = (car: Car) => {
    setSoldCar({ id: car.id, title: `${car.brand} ${car.model}`, sellingPrice: car.sellingPrice || 0, partnerId: car.partnerId || "", partnerName: car.partnerName || "" });
    setSoldPrice(String(car.sellingPrice || ""));
    setSoldDate(new Date().toISOString().split("T")[0]);
    setPaymentToPartner(String(car.partnerCost || ""));
    setSoldError("");
  };

  const handleMarkSold = async () => {
    if (!soldCar) return;
    const price = Number(soldPrice);
    if (!price || price <= 0) { setSoldError("Please enter a valid sold price."); return; }
    if (!soldDate) { setSoldError("Please enter the sold date."); return; }
    const payment = Number(paymentToPartner) || 0;
    setMarking(soldCar.id);
    const soldCarSnapshot = { ...soldCar };
    setSoldCar(null);
    try {
      await updateCar(soldCarSnapshot.id, {
        status: "sold",
        soldPrice: price,
        soldDate,
        paymentToPartner: payment,
        updatedAt: new Date().toISOString(),
      });
      await logCarActivity(soldCarSnapshot.id, "Marked as Sold", `₱${price.toLocaleString("en-PH")} on ${soldDate}`);
      if (soldCarSnapshot.partnerId) {
        await addNotification(soldCarSnapshot.partnerId, "sold", soldCarSnapshot.id, soldCarSnapshot.title, `Your unit ${soldCarSnapshot.title} has been sold for ₱${price.toLocaleString("en-PH")}.`);
      }
      setCars((prev) => prev.map((c) => c.id === soldCarSnapshot.id ? { ...c, status: "sold", soldPrice: price, soldDate, paymentToPartner: payment } : c));
    } catch {
      alert("Failed to mark unit as sold.");
    } finally {
      setMarking(null);
    }
  };

  const hasFilters = search || brandFilter || typeFilter || yearFilter;

  const applyFilters = (list: Car[]) => {
    let out = list;
    if (search) {
      const q = search.toLowerCase();
      out = out.filter((c) =>
        `${c.brand} ${c.model}`.toLowerCase().includes(q) ||
        String(c.year).includes(q) ||
        (c.partnerName || "").toLowerCase().includes(q)
      );
    }
    if (brandFilter) out = out.filter((c) => c.brand === brandFilter);
    if (typeFilter)  out = out.filter((c) => c.carType === typeFilter);
    if (yearFilter)  out = out.filter((c) => String(c.year) === yearFilter);
    return out;
  };

  const byStatus = filter === "all" ? cars : cars.filter((c) => c.status === filter);
  const filtered = applyFilters(byStatus);

  const tabs: FilterTab[] = ["all", "published", "unpublished", "sold", "draft"];
  const tabCount = (t: FilterTab) => {
    const byTab = t === "all" ? cars : cars.filter((c) => c.status === t);
    return applyFilters(byTab).length;
  };

  const yearOptions = [...new Set(cars.map((c) => String(c.year)))].sort((a, b) => Number(b) - Number(a));

  const clearFilters = () => { setSearch(""); setBrandFilter(""); setTypeFilter(""); setYearFilter(""); };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Inventory</p>
          <h1 className="font-display text-4xl text-gray-900 tracking-wide">Units</h1>
        </div>
        <Link
          href="/admin/cars/new"
          className="bg-[#cc1111] text-white px-5 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#aa0e0e] transition-colors"
        >
          + Add New Unit
        </Link>
      </div>

      {/* Search + Filters */}
      <div className="bg-white border border-gray-200 p-4 mb-5 flex flex-wrap items-end gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search brand, model, year, partner..."
            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 focus:border-[#cc1111] outline-none text-gray-900 placeholder-gray-400 bg-transparent"
          />
        </div>

        {/* Brand */}
        <select
          value={brandFilter}
          onChange={(e) => setBrandFilter(e.target.value)}
          className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
        >
          <option value="">All Brands</option>
          {CAR_BRANDS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        {/* Car Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
        >
          <option value="">All Types</option>
          {CAR_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>

        {/* Year */}
        <select
          value={yearFilter}
          onChange={(e) => setYearFilter(e.target.value)}
          className="border border-gray-200 text-sm text-gray-700 px-3 py-2 outline-none focus:border-[#cc1111] bg-white"
        >
          <option value="">All Years</option>
          {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        {/* Clear */}
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 text-[10px] font-bold tracking-[0.2em] uppercase text-gray-400 hover:text-[#cc1111] transition-colors"
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
            className={`px-5 py-3 text-xs font-semibold tracking-wide capitalize transition-colors border-b-2 -mb-px ${
              filter === tab
                ? "border-[#cc1111] text-[#cc1111]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            {tab} ({tabCount(tab)})
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            {hasFilters ? "No units match your search or filters." : "No units found."}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  {["Photo", "Brand / Model", "Year", "Status", "Price", "Views", "Inquiries", "Actions"].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((car) => {
                  const mainPhoto = car.photos?.find((p) => p.isMain) || car.photos?.[0];
                  return (
                    <tr key={car.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="px-5 py-3">
                        {mainPhoto ? (
                          <Image src={mainPhoto.url} alt={`${car.brand} ${car.model}`} width={40} height={30} className="object-cover w-10 h-8" />
                        ) : (
                          <div className="w-10 h-8 bg-gray-100 border border-gray-200 flex items-center justify-center">
                            <span className="text-[8px] text-gray-400">NO IMG</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm font-semibold text-gray-900">{car.brand} {car.model}</p>
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{car.year}</td>
                      <td className="px-5 py-3">
                        <span className={`border text-[9px] font-bold tracking-[0.2em] uppercase px-2 py-0.5 ${STATUS_BADGE[car.status] ?? "border-gray-300 text-gray-400"}`}>
                          {car.status}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-sm">
                        <p className="text-gray-900">₱{(car.sellingPrice || 0).toLocaleString()}</p>
                        {car.status === "sold" && car.soldPrice && (
                          <p className="text-green-600 font-semibold text-[11px] mt-0.5">
                            Sold ₱{car.soldPrice.toLocaleString()}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-3 text-sm text-gray-500">{car.viewCount || 0}</td>
                      <td className="px-5 py-3">
                        {(inquiryCounts[car.id] || 0) > 0 ? (
                          <span className="border border-[#cc1111]/40 text-[#cc1111] text-[9px] font-bold tracking-widest px-2 py-0.5">
                            {inquiryCounts[car.id]}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-sm">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex gap-1.5 flex-wrap">
                          <Link
                            href={`/admin/cars/${car.id}/view`}
                            className="bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors"
                          >
                            View
                          </Link>
                          {car.status === "published" && (
                            <>
                              <button
                                onClick={() => openSoldModal(car)}
                                disabled={marking === car.id}
                                className="bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors disabled:opacity-40"
                              >
                                {marking === car.id ? "..." : "Sold"}
                              </button>
                              <button
                                onClick={() => setConfirmCar({ id: car.id, title: `${car.brand} ${car.model}` })}
                                disabled={unpublishing === car.id}
                                className="bg-gray-100 text-gray-500 px-2.5 py-1 text-[9px] font-bold tracking-[0.15em] uppercase hover:bg-red-100 hover:text-[#cc1111] transition-colors disabled:opacity-40"
                              >
                                {unpublishing === car.id ? "..." : "Unpublish"}
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Sold Modal */}
      {soldCar && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setSoldCar(null); }}
        >
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-sm p-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-green-50 border border-green-200 flex items-center justify-center shrink-0">
                <BadgeCheck size={18} className="text-green-600" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Mark as Sold</p>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">{soldCar.title}</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">
                  Actual Sold Price (₱)
                </label>
                <input
                  type="number"
                  value={soldPrice}
                  onChange={(e) => { setSoldPrice(e.target.value); setSoldError(""); }}
                  placeholder={soldCar.sellingPrice.toLocaleString()}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                />
                <p className="text-[10px] text-gray-400 mt-1">Listed at ₱{soldCar.sellingPrice.toLocaleString()}</p>
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">
                  Date Sold
                </label>
                <input
                  type="date"
                  value={soldDate}
                  onChange={(e) => { setSoldDate(e.target.value); setSoldError(""); }}
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 py-2 text-sm outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">
                  Payment to Partner (₱)
                </label>
                <input
                  type="number"
                  value={paymentToPartner}
                  onChange={(e) => { setPaymentToPartner(e.target.value); setSoldError(""); }}
                  placeholder="0"
                  className="w-full bg-transparent border-b border-gray-300 focus:border-[#cc1111] text-gray-900 placeholder-gray-300 py-2 text-sm outline-none transition-colors"
                />
                {soldCar?.partnerName && <p className="text-[10px] text-gray-400 mt-1">Partner: {soldCar.partnerName}</p>}
              </div>

              {soldError && <p className="text-xs text-[#cc1111]">{soldError}</p>}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setSoldCar(null)}
                className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleMarkSold}
                className="flex-1 bg-green-600 text-white py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-green-700 transition-colors"
              >
                Confirm Sold
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Unpublish Confirm Modal */}
      {confirmCar && (
        <div
          className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setConfirmCar(null); }}
        >
          <div className="bg-white border border-gray-200 shadow-xl w-full max-w-sm p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                <EyeOff size={18} className="text-[#e0b840]" />
              </div>
              <div>
                <p className="text-[10px] font-bold tracking-[0.3em] uppercase text-gray-400">Confirm Action</p>
                <h3 className="text-base font-bold text-gray-900 uppercase tracking-wide">Unpublish Unit</h3>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-1">You are about to unpublish:</p>
            <p className="text-sm font-bold text-gray-900 mb-4">{confirmCar.title}</p>
            <p className="text-xs text-gray-400 mb-6">
              This unit will no longer be visible to the public. You can re-publish it at any time from the edit page.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmCar(null)}
                className="flex-1 border border-gray-300 text-gray-500 py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:border-gray-700 hover:text-gray-900 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUnpublishConfirm}
                className="flex-1 border border-[#7a6a2a] text-[#e0b840] py-2.5 text-xs font-bold tracking-[0.3em] uppercase hover:bg-[#7a6a2a] hover:text-white transition-colors"
              >
                Yes, Unpublish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
