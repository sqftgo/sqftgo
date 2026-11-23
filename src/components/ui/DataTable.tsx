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
      <div className="surface-card rounded-3xl px-6 py-14 text-center text-sm font-semibold text-charcoal/50">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className={cn("surface-card overflow-hidden rounded-3xl", className)}>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-indigo/5 bg-sand/25">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={cn(
                    "px-5 py-3.5 text-[10px] font-black uppercase tracking-widest text-charcoal/45",
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
              <tr
                key={rowKey(row)}
                className="border-b border-indigo/5 last:border-0 transition-colors hover:bg-sand/20"
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn("px-5 py-4 align-middle", col.className)}>
                    {col.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default DataTable;
