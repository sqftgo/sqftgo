"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRICE_RANGES,
  PRICE_RANGES_STORAGE_KEY,
  loadPriceRanges,
  type PriceRangeConfig,
} from "@/features/admin/data/priceRanges";

/**
 * Client-side budget dropdown options for listing filters.
 * Falls back to defaults until localStorage config hydrates.
 */
export function useBudgetPriceOptions(): PriceRangeConfig {
  const [options, setOptions] = useState<PriceRangeConfig>(DEFAULT_PRICE_RANGES);

  useEffect(() => {
    const refresh = () => setOptions(loadPriceRanges());
    refresh();

    const onStorage = (event: StorageEvent) => {
      if (event.key === PRICE_RANGES_STORAGE_KEY) refresh();
    };
    window.addEventListener("storage", onStorage);
    window.addEventListener("sqftgo:price-ranges-updated", refresh);
    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("sqftgo:price-ranges-updated", refresh);
    };
  }, []);

  return options;
}
