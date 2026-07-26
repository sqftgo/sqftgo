"use client";

import { useCallback, type Dispatch, type SetStateAction } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import {
  DEFAULT_LIST_PAGE,
  useAdminUsersQuery,
  useDealersQuery,
} from "@/hooks/queries/marketplace";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { PaginatedResult } from "@/lib/api/client";
import type { DirectoryProfile, AdminUser } from "@/types";
import { dealerService } from "@/services";

export function useDirectoryProfiles() {
  const queryClient = useQueryClient();
  const dealersQuery = useDealersQuery();
  const adminUsersQuery = useAdminUsersQuery();
  const directoryProfiles = dealersQuery.data?.items ?? [];
  const adminUsers = adminUsersQuery.data?.items ?? [];
  const directoryProfilesReady = dealersQuery.isFetched || !hasSupabaseEnv();
  const directoryProfilesError =
    dealersQuery.isError && dealersQuery.error instanceof Error
      ? dealersQuery.error.message
      : dealersQuery.isError
        ? "Unable to load dealer directory"
        : null;

  const refreshDirectoryProfiles = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all });
  }, [queryClient]);

  const setDirectoryProfiles: Dispatch<SetStateAction<DirectoryProfile[]>> = useCallback(
    (action) => {
      queryClient.setQueryData(
        queryKeys.dealers.list(DEFAULT_LIST_PAGE),
        (prev: PaginatedResult<DirectoryProfile> | undefined) => {
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

  const setAdminUsers: Dispatch<SetStateAction<AdminUser[]>> = useCallback(
    (action) => {
      queryClient.setQueryData(
        queryKeys.adminUsers.list(DEFAULT_LIST_PAGE),
        (prev: PaginatedResult<AdminUser> | undefined) => {
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

  const addDirectoryProfile = useCallback(
    async (prof: Omit<DirectoryProfile, "id">) => {
      const created = await dealerService.create(prof);
      setDirectoryProfiles((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      void queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all });
      return created;
    },
    [setDirectoryProfiles, queryClient]
  );

  const updateDirectoryProfile = useCallback(
    async (id: string, updates: Partial<DirectoryProfile>) => {
      const updated = await dealerService.update(id, updates);
      setDirectoryProfiles((prev) => prev.map((p) => (p.id === id ? updated : p)));
      void queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all });
      return updated;
    },
    [setDirectoryProfiles, queryClient]
  );

  const deleteDirectoryProfile = useCallback(
    async (id: string) => {
      await dealerService.remove(id);
      setDirectoryProfiles((prev) => prev.filter((p) => p.id !== id));
      void queryClient.invalidateQueries({ queryKey: queryKeys.dealers.all });
    },
    [setDirectoryProfiles, queryClient]
  );

  return {
    directoryProfiles,
    directoryProfilesReady,
    directoryProfilesError,
    refreshDirectoryProfiles,
    setDirectoryProfiles,
    addDirectoryProfile,
    updateDirectoryProfile,
    deleteDirectoryProfile,
    adminUsers,
    setAdminUsers,
  };
}
