"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { DEFAULT_LIST_PAGE, usePropertiesQuery } from "@/hooks/queries/marketplace";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { PaginatedResult } from "@/lib/api/client";
import type { DirectoryProfile, Property, UserProfile } from "@/types";
import { propertyService } from "@/services";
import { findMyDirectoryProfile } from "@/lib/ownership";

type UsePropertyMutationsArgs = {
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
  userEmail: string;
  userName: string;
  userProfile: UserProfile | null;
  directoryProfiles: DirectoryProfile[];
  refreshNotifications: () => Promise<void>;
};

export function usePropertyMutations({
  isLoggedIn,
  userRole,
  userEmail,
  userName,
  userProfile,
  directoryProfiles,
  refreshNotifications,
}: UsePropertyMutationsArgs) {
  const queryClient = useQueryClient();
  const propertiesQuery = usePropertiesQuery();
  const properties = propertiesQuery.data?.items ?? [];
  const propertiesReady = propertiesQuery.isFetched || !hasSupabaseEnv();
  const propertiesLoading =
    propertiesQuery.isPending || (propertiesQuery.isFetching && !propertiesQuery.data);
  const propertiesError =
    propertiesQuery.isError && propertiesQuery.error instanceof Error
      ? propertiesQuery.error.message
      : propertiesQuery.isError
        ? "Unable to load properties"
        : null;

  const refreshProperties = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
  }, [queryClient]);

  const setProperties: Dispatch<SetStateAction<Property[]>> = useCallback(
    (action) => {
      queryClient.setQueryData(
        queryKeys.properties.list(DEFAULT_LIST_PAGE),
        (prev: PaginatedResult<Property> | undefined) => {
          const current = prev?.items ?? [];
          const nextItems = typeof action === "function" ? action(current) : action;
          return {
            items: nextItems,
            total: nextItems.length,
            limit: prev?.limit ?? DEFAULT_LIST_PAGE.limit,
            offset: prev?.offset ?? DEFAULT_LIST_PAGE.offset,
          };
        }
      );
    },
    [queryClient]
  );

  const addProperty = useCallback(
    async (
      prop: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & {
        status?: Property["status"];
      }
    ) => {
      const matchingProfile =
        isLoggedIn && userRole === "broker"
          ? findMyDirectoryProfile(directoryProfiles, userProfile?.id, userEmail)
          : null;

      const created = await propertyService.create({
        ...prop,
        ownerName: matchingProfile?.ownerName ?? (userName || "Owner User"),
        ownerPhone: matchingProfile?.mobile ?? userProfile?.phone ?? "+91 99000 99000",
        ownerEmail: isLoggedIn ? userEmail : undefined,
      });
      setProperties((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      void refreshNotifications();
      return created;
    },
    [
      isLoggedIn,
      userRole,
      userEmail,
      userName,
      userProfile?.phone,
      userProfile?.id,
      directoryProfiles,
      setProperties,
      queryClient,
      refreshNotifications,
    ]
  );

  const updateProperty = useCallback(
    async (propertyId: string, updates: Partial<Property>) => {
      const updated = await propertyService.update(propertyId, updates);
      setProperties((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
      void refreshNotifications();
      return updated;
    },
    [setProperties, queryClient, refreshNotifications]
  );

  const deleteProperty = useCallback(
    async (propertyId: string) => {
      await propertyService.remove(propertyId);
      setProperties((prev) => prev.filter((p) => p.id !== propertyId));
      void queryClient.invalidateQueries({ queryKey: queryKeys.properties.all });
    },
    [setProperties, queryClient]
  );

  return {
    properties,
    setProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    refreshProperties,
    propertiesReady,
    propertiesLoading,
    propertiesError,
  };
}
