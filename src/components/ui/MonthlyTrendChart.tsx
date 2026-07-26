"use client";

import React, { useId, useMemo } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export type MonthlyTrendPoint = {
  month: string;
  count: number;
};

export type MonthlyTrendChartProps = {
  data: MonthlyTrendPoint[];
  className?: string;
  height?: number;
};

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const date = new Date(Date.UTC(Number(year), Number(m) - 1, 1));
  return date.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value?: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-xl border border-indigo/10 bg-white px-3 py-2 shadow-lg shadow-indigo/10">
      <p className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
        {label}
      </p>
      <p className="mt-0.5 text-sm font-serif font-black text-indigo">
        {value} {value === 1 ? "enquiry" : "enquiries"}
      </p>
    </div>
  );
}

export function MonthlyTrendChart({
  data,
  className = "",
  height = 220,
}: MonthlyTrendChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const chartData = useMemo(
    () =>
      data.map((row) => ({
        ...row,
        label: formatMonthLabel(row.month),
      })),
    [data]
  );

  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.count, 0),
    [data]
  );

  return (
    <div className={className}>
      <div className="mb-3 flex items-end justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
            Period total
          </p>
          <p className="text-2xl font-serif font-black text-indigo tabular-nums">
            {total}
          </p>
        </div>
        <p className="text-[10px] font-semibold text-charcoal/35">
          Hover a point for monthly detail
        </p>
      </div>
      <div style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: -18, bottom: 0 }}
          >
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1b3864" stopOpacity={0.35} />
                <stop offset="55%" stopColor="#1b3864" stopOpacity={0.08} />
                <stop offset="100%" stopColor="#1b3864" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 6"
              vertical={false}
              stroke="rgba(27, 56, 100, 0.08)"
            />
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "rgba(28, 25, 23, 0.4)", fontSize: 11, fontWeight: 700 }}
              dy={6}
            />
            <YAxis
              allowDecimals={false}
              axisLine={false}
              tickLine={false}
              width={36}
              tick={{ fill: "rgba(28, 25, 23, 0.35)", fontSize: 10, fontWeight: 600 }}
            />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{
                stroke: "rgba(27, 56, 100, 0.2)",
                strokeWidth: 1,
                strokeDasharray: "4 4",
              }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#1b3864"
              strokeWidth={2.5}
              fill={`url(#${gradientId})`}
              activeDot={{
                r: 5,
                fill: "#1b3864",
                stroke: "#fff",
                strokeWidth: 2,
              }}
              dot={{
                r: 3.5,
                fill: "#1b3864",
                stroke: "#fff",
                strokeWidth: 2,
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
