"use client";

import { useEffect, useState } from "react";
import { platformService } from "@/services/platform";
import type { PublicPlatformSettings } from "@/types";

const FALLBACK: PublicPlatformSettings = {
  siteName: "SqftGo",
  tagline: "Real Estate",
  supportEmail: "contact@sqftgo.com",
  supportPhone: null,
  allowUserListings: true,
  maxListingsPerUser: 3,
  currencyCode: "INR",
  priceRanges: null,
};

/**
 * Public platform branding / caps for marketplace UI.
 */
export function usePublicPlatformSettings(): PublicPlatformSettings {
  const [settings, setSettings] = useState<PublicPlatformSettings>(FALLBACK);

  useEffect(() => {
    let cancelled = false;
    void platformService
      .getPublicSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setSettings(FALLBACK);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
}
