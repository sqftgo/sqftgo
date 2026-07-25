"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { propertyService, type PropertyFilters } from "@/services/properties";
import { dealerService, type DealerFilters } from "@/services/dealers";
import { authService } from "@/services/auth";
import { queryKeys } from "@/lib/queryKeys";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { useAuthContext } from "@/providers/AuthProvider";

export const DEFAULT_LIST_PAGE = { limit: 100, offset: 0 } as const;

export function usePropertiesQuery(filters: PropertyFilters = DEFAULT_LIST_PAGE) {
  const { sessionReady } = useAuthContext();
  const merged = { ...DEFAULT_LIST_PAGE, ...filters };

  return useQuery({
    queryKey: queryKeys.properties.list(merged),
    queryFn: () => propertyService.listPage(merged),
    enabled: sessionReady && hasSupabaseEnv(),
  });
}

export function useDealersQuery(filters: DealerFilters = DEFAULT_LIST_PAGE) {
  const { sessionReady } = useAuthContext();
  const merged = { ...DEFAULT_LIST_PAGE, ...filters };

  return useQuery({
    queryKey: queryKeys.dealers.list(merged),
    queryFn: () => dealerService.listProfilesPage(merged),
    enabled: sessionReady && hasSupabaseEnv(),
  });
}

export function useAdminUsersQuery(params: { limit?: number; offset?: number } = DEFAULT_LIST_PAGE) {
  const { sessionReady, userRole, isLoggedIn } = useAuthContext();
  const merged = { ...DEFAULT_LIST_PAGE, ...params };

  return useQuery({
    queryKey: queryKeys.adminUsers.list(merged),
    queryFn: () => authService.listUsersPage(merged),
    enabled:
      sessionReady &&
      hasSupabaseEnv() &&
      isLoggedIn &&
      userRole === "admin",
  });
}

export function useInvalidateMarketplace() {
  const queryClient = useQueryClient();
  return {
    invalidateProperties: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.properties.all }),
    invalidateDealers: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all }),
    invalidateAdminUsers: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.adminUsers.all }),
  };
}
