import { apiClient } from "@/lib/api/client";
import type {
  DealerAnalytics,
  PlatformAnalytics,
  PlatformSettings,
  PublicPlatformSettings,
} from "@/types";

export const platformService = {
  getPublicSettings() {
    return apiClient<PublicPlatformSettings>("/api/platform/settings");
  },
  getSettings() {
    return apiClient<PlatformSettings>("/api/admin/settings");
  },
  updateSettings(
    input: Omit<PlatformSettings, "updatedAt" | "updatedBy"> & {
      priceRanges?: PlatformSettings["priceRanges"];
    }
  ) {
    return apiClient<PlatformSettings>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  getAnalytics() {
    return apiClient<PlatformAnalytics>("/api/admin/analytics");
  },
  getDealerAnalytics() {
    return apiClient<DealerAnalytics>("/api/dealer/analytics");
  },
};
