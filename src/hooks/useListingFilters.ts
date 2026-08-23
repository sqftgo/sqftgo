"use client";

import { useCallback, useEffect, useState } from "react";
import type { ListingFilter } from "@/types/listing-filter";
import { listingFilterApi } from "@/services";
import { DEFAULT_LISTING_FILTERS, isListingFilterOn } from "@/lib/listing-filters/defaults";

export function useListingFilters(opts?: { all?: boolean }) {
  const all = opts?.all === true;
  const [filters, setFilters] = useState<ListingFilter[]>(all ? [] : DEFAULT_LISTING_FILTERS);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const rows = await listingFilterApi.list({ all });
      setFilters(rows);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load listing filters");
      if (!all) setFilters(DEFAULT_LISTING_FILTERS);
    } finally {
      setReady(true);
    }
  }, [all]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return {
    filters,
    ready,
    error,
    refresh,
    isOn: (key: string) => isListingFilterOn(filters, key),
  };
}
