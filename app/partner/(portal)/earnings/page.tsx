"use client";

import { useEffect, useState } from "react";
import { getCars } from "@/lib/cars";
import { Car } from "@/lib/types";
import { usePartner } from "../layout";

function fmt(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PH", { month: "short", day: "numeric", year: "numeric" });
}
function peso(n: number) {
  return `₱${n.toLocaleString("en-PH")}`;
}

export default function PartnerEarningsPage() {
  const { partner } = usePartner();
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCars()
      .then((all) => setCars(all.filter((c) => c.partnerId === partner.id && c.status === "sold")))
      .finally(() => setLoading(false));
  }, [partner.id]);

  const totalReceived = cars.reduce((s, c) => s + (c.paymentToPartner || 0), 0);
  const pendingCars = cars.filter((c) => !c.paymentToPartner);
  const paidCars = cars.filter((c) => !!c.paymentToPartner);

  return (
    <div>
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111] mb-1">Finance</p>
        <h1 className="font-display text-4xl text-gray-900 tracking-wide">Earnings</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 border-t-[#cc1111] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* KPIs */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white border border-green-200 p-6">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Total Received</p>
              <p className="text-3xl font-bold text-green-700">{peso(totalReceived)}</p>
              <p className="text-xs text-gray-400 mt-1">{paidCars.length} unit{paidCars.length !== 1 ? "s" : ""} paid</p>
            </div>
            <div className="bg-white border border-amber-200 p-6">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Pending Payment</p>
              <p className="text-3xl font-bold text-amber-600">{pendingCars.length}</p>
              <p className="text-xs text-gray-400 mt-1">unit{pendingCars.length !== 1 ? "s" : ""} awaiting payment</p>
            </div>
            <div className="bg-white border border-gray-200 p-6">
              <p className="text-[9px] font-bold tracking-[0.3em] uppercase text-gray-400 mb-1">Total Units Sold</p>
              <p className="text-3xl font-bold text-gray-900">{cars.length}</p>
            </div>
          </div>

          {pendingCars.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 px-5 py-3">
              <p className="text-sm text-amber-700 font-semibold mb-1">Pending Payments</p>
              <p className="text-xs text-amber-600">
                {pendingCars.map((c) => `${c.brand} ${c.model}`).join(", ")} — contact your coordinator for payment details.
              </p>
            </div>
          )}

          {/* Earnings table */}
          {cars.length === 0 ? (
            <div className="bg-white border border-gray-200 p-12 text-center">
              <p className="text-sm text-gray-400">No sold units yet.</p>
            </div>
          ) : (
            <div className="bg-white border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-100">
                <p className="text-[10px] font-bold tracking-[0.4em] uppercase text-[#cc1111]">Transaction History</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      {["Date Sold", "Unit", "Year", "Selling Price", "Actual Sold Price", "Your Payment", "Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[9px] font-bold tracking-[0.25em] uppercase text-gray-400">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {cars.map((c) => (
                      <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{fmt(c.soldDate)}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">{c.brand} {c.model}</td>
                        <td className="px-5 py-3 text-gray-600">{c.year}</td>
                        <td className="px-5 py-3 text-gray-700">{peso(c.sellingPrice || 0)}</td>
                        <td className="px-5 py-3 text-gray-700">{c.soldPrice ? peso(c.soldPrice) : "—"}</td>
                        <td className="px-5 py-3 font-semibold text-gray-900">
                          {c.paymentToPartner ? (
                            <span className="text-green-700">{peso(c.paymentToPartner)}</span>
                          ) : (
                            <span className="text-amber-600 text-xs">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {c.paymentToPartner ? (
                            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border bg-green-100 text-green-700 border-green-200">Paid</span>
                          ) : (
                            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 border bg-amber-100 text-amber-700 border-amber-200">Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-gray-300 bg-gray-50">
                      <td colSpan={5} className="px-5 py-3 text-[10px] font-bold tracking-widest uppercase text-gray-500">Total Received</td>
                      <td className="px-5 py-3 font-bold text-green-700">{peso(totalReceived)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
