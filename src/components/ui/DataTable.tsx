"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface DataTableColumn<T> {
  key: string;
  header: string;
  className?: string;
  render: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  emptyMessage?: string;
  className?: string;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  emptyMessage = "No records found.",
  className,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return (
      <div className="rounded-2xl border border-indigo/10 bg-white/60 px-6 py-12 text-center text-sm font-semibold text-charcoal/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto rounded-2xl border border-indigo/10 bg-white shadow-sm", className)}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-indigo/5 bg-white/40">
          <tr>
            {columns.map((col) => (
              <th
                key={col.key}
                className={cn(
                  "px-4 py-3 text-[10px] font-black uppercase tracking-widest text-charcoal/45",
                  col.className
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-indigo/5 last:border-0 hover:bg-sand/20">
              {columns.map((col) => (
                <td key={col.key} className={cn("px-4 py-3.5 align-middle", col.className)}>
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default DataTable;
