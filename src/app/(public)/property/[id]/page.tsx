"use client";

import React, { use } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { AlertCircle } from "lucide-react";
import { PropertyDetailView } from "@/features/properties/components/PropertyDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { properties, favorites, toggleFavorite } = useApp();

  const property = properties.find((p) => p.id === resolvedParams.id && p.status === "Active");
  const isSaved = favorites.includes(resolvedParams.id);

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf8f5]">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-slate-950 dark:text-white mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          The property listing you are trying to view does not exist or has been removed.
        </p>
        <Link
          href="/listings"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const similarProperties = properties
    .filter((p) => p.city === property.city && p.id !== property.id && p.status === "Active")
    .slice(0, 2);

  return (
    <PropertyDetailView
      property={property}
      isSaved={isSaved}
      onToggleFavorite={toggleFavorite}
      similarProperties={similarProperties}
    />
  );
}
