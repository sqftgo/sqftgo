"use client";

import React, { useCallback, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { useAuthContext } from "@/providers/AuthProvider";
import type { PropertyFilters } from "@/services";

export function useAuth() {
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    sessionReady,
    login,
    signup,
    logout,
  } = useAuthContext();

  const { adminUsers } = useApp();

  return {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    sessionReady,
    adminUsers,
    login,
    signup,
    logout,
  };
}

export function useProperties(filters?: PropertyFilters) {
  const {
    properties,
    addProperty,
    updateProperty,
    deleteProperty,
    favorites,
    toggleFavorite,
  } = useApp();

  const filtered = useMemo(() => {
    if (!filters) return properties;
    return properties.filter((p) => {
      if (filters.city && filters.city !== "All India" && p.city !== filters.city) return false;
      if (filters.type && filters.type !== "any" && p.type !== filters.type) return false;
      if (filters.purpose && p.purpose !== filters.purpose) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (
        filters.ownerEmail &&
        p.ownerEmail?.toLowerCase() !== filters.ownerEmail.toLowerCase()
      )
        return false;
      if (filters.featured !== undefined && Boolean(p.featured) !== filters.featured) return false;
      if (filters.minPrice !== undefined && p.price < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.price > filters.maxPrice) return false;
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const hay = `${p.title} ${p.locality} ${p.city} ${p.type}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [properties, filters]);

  return {
    properties: filtered,
    allProperties: properties,
    addProperty,
    updateProperty,
    deleteProperty,
    favorites,
    toggleFavorite,
  };
}

export function useAsyncState<T>() {
  const [state, setState] = React.useState<{
    data: T | null;
    loading: boolean;
    error: string | null;
  }>({ data: null, loading: false, error: null });

  const run = useCallback(async (fn: () => Promise<T>) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setState({ data: null, loading: false, error: message });
      throw err;
    }
  }, []);

  return { ...state, run, setState };
}
