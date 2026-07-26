"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DashboardPageHeader, PageLoader } from "@/components/ui";
import { cn } from "@/lib/cn";
import { DealerInquiriesPanel } from "@/features/inquiries";
import { DealerMessagesPanel } from "@/features/messages";

type CommTab = "inquiries" | "messages";

export default function DealerCommunicationsPage() {
  return (
    <React.Suspense fallback={<PageLoader label="Loading communications..." />}>
      <CommunicationsContent />
    </React.Suspense>
  );
}

function CommunicationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");
  const activeTab: CommTab = tabParam === "messages" ? "messages" : "inquiries";

  const setTab = (tab: CommTab) => {
    const href =
      tab === "messages"
        ? "/dealer/dashboard/inquiries?tab=messages"
        : "/dealer/dashboard/inquiries";
    router.replace(href, { scroll: false });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto text-charcoal">
      <DashboardPageHeader
        title="Communications"
        description="Customer inquiries and direct messages in one place"
      />

      <div
        className="flex gap-1 bg-sand/35 border border-indigo/5 p-1 rounded-2xl w-full sm:w-fit"
        role="tablist"
        aria-label="Communications sections"
      >
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "inquiries"}
          onClick={() => setTab("inquiries")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
            activeTab === "inquiries"
              ? "bg-white text-indigo shadow-sm"
              : "text-charcoal/45 hover:text-charcoal"
          )}
        >
          Inquiries
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "messages"}
          onClick={() => setTab("messages")}
          className={cn(
            "flex-1 sm:flex-none px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors cursor-pointer",
            activeTab === "messages"
              ? "bg-white text-indigo shadow-sm"
              : "text-charcoal/45 hover:text-charcoal"
          )}
        >
          Messages
        </button>
      </div>

      {activeTab === "inquiries" ? <DealerInquiriesPanel /> : <DealerMessagesPanel />}
    </div>
  );
}
