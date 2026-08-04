"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle } from "lucide-react";

import { useApp } from "@/context/AppContext";
import { PropertyDetailView } from "@/features/properties/components/PropertyDetail";
import { queryKeys } from "@/lib/queryKeys";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { propertyService } from "@/services";
import type { Property } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function isPublicActive(property: Property | null | undefined): property is Property {
  return Boolean(property && property.status === "Active");
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const id = resolvedParams.id;
  const { properties, favorites, toggleFavorite, propertiesLoading, propertiesReady } = useApp();

  const fromList = properties.find((p) => p.id === id);

  const detailQuery = useQuery({
    queryKey: queryKeys.properties.detail(id),
    queryFn: () => propertyService.getById(id),
    enabled: Boolean(id) && hasSupabaseEnv(),
    // Prefer fresh by-id fetch for shared/deep links; list cache is paginated.
    staleTime: 30_000,
  });

  const property =
    (isPublicActive(detailQuery.data) ? detailQuery.data : null) ||
    (isPublicActive(fromList) ? fromList : null);

  const waitingForList = !propertiesReady || propertiesLoading;
  const waitingForDetail =
    detailQuery.isPending || (detailQuery.isFetching && detailQuery.data === undefined);
  const loading = !property && (waitingForDetail || (waitingForList && !detailQuery.isFetched));

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf8f5]">
        <div className="w-10 h-10 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-slate-500">Loading property…</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf8f5]">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-slate-950 dark:text-white mb-2">
          Property Not Found
        </h2>
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
      isSaved={favorites.includes(id)}
      onToggleFavorite={toggleFavorite}
      similarProperties={similarProperties}
    />
  );
}
