"use client";

import { useEffect, useState } from "react";
import {
  DEFAULT_PRICE_RANGES,
  type PriceRangeConfig,
} from "@/features/admin/data/priceRanges";
import { platformService } from "@/services/platform";

/**
 * Budget dropdown options for listing filters — loaded from platform settings.
 */
export function useBudgetPriceOptions(): PriceRangeConfig {
  const [options, setOptions] = useState<PriceRangeConfig>(DEFAULT_PRICE_RANGES);

  useEffect(() => {
    let cancelled = false;

    const refresh = async () => {
      try {
        const settings = await platformService.getPublicSettings();
        if (!cancelled && settings.priceRanges) {
          setOptions(settings.priceRanges);
        }
      } catch {
        if (!cancelled) setOptions(DEFAULT_PRICE_RANGES);
      }
    };

    void refresh();
    const onUpdate = () => {
      void refresh();
    };
    window.addEventListener("sqftgo:price-ranges-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("sqftgo:price-ranges-updated", onUpdate);
    };
  }, []);

  return options;
}
