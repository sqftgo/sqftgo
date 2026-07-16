"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function MainWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = pathname.startsWith("/dealer/") || pathname.startsWith("/admin");

  return (
    <main className={`flex-1 flex flex-col ${isDashboardRoute ? "pt-0 pb-0" : "pt-24 pb-24 md:pb-0"}`}>
      {children}
    </main>
  );
}
