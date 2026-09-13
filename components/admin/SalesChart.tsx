"use client";

import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthData {
  month: string;
  units: number;
  value: number;
}

interface Props {
  data: MonthData[];
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 shadow-md px-4 py-3 text-xs">
      <p className="font-bold tracking-widest uppercase text-gray-700 mb-2">{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }} className="mb-1">
          {p.name === "value"
            ? `₱ ${Number(p.value).toLocaleString("en-PH")}`
            : `${p.value} unit${p.value !== 1 ? "s" : ""}`}
        </p>
      ))}
    </div>
  );
}

export default function SalesChart({ data }: Props) {
  if (!data.length) {
    return (
      <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
        No sales data yet.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={data} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          tick={{ fill: "#9ca3af", fontSize: 10, fontWeight: 700, letterSpacing: 2 }}
          axisLine={{ stroke: "#e5e7eb" }}
          tickLine={false}
        />
        <YAxis
          yAxisId="units"
          orientation="left"
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          allowDecimals={false}
          width={30}
        />
        <YAxis
          yAxisId="value"
          orientation="right"
          tick={{ fill: "#9ca3af", fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₱${(v / 1000000).toFixed(1)}M`}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 10, letterSpacing: 2, textTransform: "uppercase", color: "#6b7280", paddingTop: 12 }}
        />
        <Bar yAxisId="units" dataKey="units" name="Units Sold" fill="#cc1111" opacity={0.85} maxBarSize={36} />
        <Line
          yAxisId="value"
          type="monotone"
          dataKey="value"
          name="value"
          stroke="#374151"
          strokeWidth={2}
          dot={{ fill: "#374151", r: 3 }}
          activeDot={{ r: 5, fill: "#cc1111" }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
