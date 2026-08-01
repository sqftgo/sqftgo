"use client";

import React, { use } from "react";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import { DESTINATIONS } from "@/features/destinations";
import CityPageLayout from "@/features/destinations/components/CityPageLayout";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function CityDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);

  const slugLower = decodeURIComponent(resolvedParams.slug).toLowerCase();
  const destination = DESTINATIONS.find(
    (d) => d.name.toLowerCase() === slugLower
  );

  if (!destination) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 min-h-[60vh] bg-cream/30">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-indigo mb-2">Destination Not Found</h2>
        <p className="text-sm text-charcoal/70 mb-8 max-w-md text-center">
          The destination "{resolvedParams.slug}" you are looking for does not exist or has been moved.
        </p>
        <Link
          href="/destinations"
          className="px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-colors"
        >
          Back to All Destinations
        </Link>
      </div>
    );
  }

  return (
    <CityPageLayout destination={destination} />
  );
}
