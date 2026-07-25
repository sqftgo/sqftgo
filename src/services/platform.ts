import { apiClient } from "@/lib/api/client";
import type { PlatformAnalytics, PlatformSettings } from "@/types";

export const platformService = {
  getSettings() {
    return apiClient<PlatformSettings>("/api/admin/settings");
  },
  updateSettings(input: Omit<PlatformSettings, "updatedAt" | "updatedBy">) {
    return apiClient<PlatformSettings>("/api/admin/settings", {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
  getAnalytics() {
    return apiClient<PlatformAnalytics>("/api/admin/analytics");
  },
};
