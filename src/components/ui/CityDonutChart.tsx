"use client";

import React, { useMemo } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export type CitySharePoint = {
  name: string;
  count: number;
  percent: number;
};

export type CityDonutChartProps = {
  data: CitySharePoint[];
  className?: string;
  height?: number;
};

const CITY_COLORS = [
  "#1b3864",
  "#c45c26",
  "#2f6b4f",
  "#7a5c2e",
  "#4a6fa5",
  "#8b4513",
];

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name?: string; value?: number; payload?: CitySharePoint }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  const row = item.payload;
  return (
    <div className="rounded-xl border border-indigo/10 bg-white px-3 py-2 shadow-lg shadow-indigo/10">
      <p className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">
        {item.name}
      </p>
      <p className="mt-0.5 text-sm font-serif font-black text-indigo">
        {row?.count ?? item.value} listings · {row?.percent ?? 0}%
      </p>
    </div>
  );
}

export function CityDonutChart({
  data,
  className = "",
  height = 180,
}: CityDonutChartProps) {
  const total = useMemo(
    () => data.reduce((sum, row) => sum + row.count, 0),
    [data]
  );

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center py-6 text-charcoal/30 text-xs font-semibold">
        No city records found.
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative" style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="62%"
              outerRadius="88%"
              paddingAngle={3}
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell
                  key={entry.name}
                  fill={CITY_COLORS[index % CITY_COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[9px] font-black uppercase tracking-wider text-charcoal/35">
            Total
          </p>
          <p className="text-xl font-serif font-black text-indigo tabular-nums">
            {total}
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-2.5">
        {data.slice(0, 4).map((city, index) => (
          <div
            key={city.name}
            className="flex items-center justify-between gap-2 text-[10px] font-bold text-charcoal"
          >
            <span className="flex min-w-0 items-center gap-2">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ backgroundColor: CITY_COLORS[index % CITY_COLORS.length] }}
              />
              <span className="truncate">{city.name}</span>
            </span>
            <span className="shrink-0 text-charcoal/40 font-semibold">
              {city.count} · {city.percent}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
