"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type { ActivityLog, Amenity, Category, Location } from "@/types";
import { catalogService } from "@/services";

type UseCatalogArgs = {
  sessionReady: boolean;
  isLoggedIn: boolean;
  userRole: "user" | "broker" | "admin" | null;
};

export function useCatalog({ sessionReady, isLoggedIn, userRole }: UseCatalogArgs) {
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [locations, setLocationsState] = useState<Location[]>([]);
  const [locationsReady, setLocationsReady] = useState(false);
  const [amenities, setAmenitiesState] = useState<Amenity[]>([]);
  const [amenitiesReady, setAmenitiesReady] = useState(false);
  const [activityLogs, setActivityLogsState] = useState<ActivityLog[]>([]);
  const [logsReady, setLogsReady] = useState(false);

  const refreshCategories = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setCategoriesState([]);
      setCategoriesReady(true);
      return;
    }
    try {
      const rows = await catalogService.listCategories({ all: userRole === "admin" });
      setCategoriesState(rows);
    } catch {
      setCategoriesState([]);
    } finally {
      setCategoriesReady(true);
    }
  }, [userRole]);

  const refreshLocations = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setLocationsState([]);
      setLocationsReady(true);
      return;
    }
    try {
      const rows = await catalogService.listLocations({ all: userRole === "admin" });
      setLocationsState(rows);
    } catch {
      setLocationsState([]);
    } finally {
      setLocationsReady(true);
    }
  }, [userRole]);

  const refreshAmenities = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setAmenitiesState([]);
      setAmenitiesReady(true);
      return;
    }
    try {
      const rows = await catalogService.listAmenities({ all: userRole === "admin" });
      setAmenitiesState(rows);
    } catch {
      setAmenitiesState([]);
    } finally {
      setAmenitiesReady(true);
    }
  }, [userRole]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshCategories();
    void refreshLocations();
    void refreshAmenities();
  }, [sessionReady, isLoggedIn, userRole, refreshCategories, refreshLocations, refreshAmenities]);

  const refreshLogs = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn || userRole !== "admin") {
      setActivityLogsState([]);
      setLogsReady(true);
      return;
    }
    try {
      const rows = await catalogService.listLogs();
      setActivityLogsState(rows);
    } catch {
      setActivityLogsState([]);
    } finally {
      setLogsReady(true);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshLogs();
  }, [sessionReady, isLoggedIn, userRole, refreshLogs]);

  const setCategories: Dispatch<SetStateAction<Category[]>> = useCallback(
    (action) => {
      setCategoriesState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setLocations: Dispatch<SetStateAction<Location[]>> = useCallback(
    (action) => {
      setLocationsState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setAmenities: Dispatch<SetStateAction<Amenity[]>> = useCallback(
    (action) => {
      setAmenitiesState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const createCategory = useCallback(async (input: { name: string; icon: string }) => {
    const created = await catalogService.createCategory(input);
    setCategoriesState((prev) => [...prev, created]);
    return created;
  }, []);

  const updateCategory = useCallback(
    async (id: string, updates: { name?: string; icon?: string; active?: boolean }) => {
      const updated = await catalogService.updateCategory(id, updates);
      setCategoriesState((prev) => prev.map((c) => (c.id === id ? updated : c)));
      return updated;
    },
    []
  );

  const deleteCategory = useCallback(async (id: string) => {
    const result = await catalogService.deleteCategory(id);
    if (result.deactivated) {
      setCategoriesState((prev) =>
        prev.map((c) => (c.id === id ? { ...c, active: false } : c))
      );
    } else {
      setCategoriesState((prev) => prev.filter((c) => c.id !== id));
    }
  }, []);

  const createLocation = useCallback(
    async (input: { city: string; state: string; country: string }) => {
      const created = await catalogService.createLocation(input);
      setLocationsState((prev) => [...prev, created]);
      return created;
    },
    []
  );

  const updateLocation = useCallback(
    async (
      id: string,
      updates: { city?: string; state?: string; country?: string; active?: boolean }
    ) => {
      const updated = await catalogService.updateLocation(id, updates);
      setLocationsState((prev) => prev.map((l) => (l.id === id ? updated : l)));
      return updated;
    },
    []
  );

  const deleteLocation = useCallback(async (id: string) => {
    const result = await catalogService.deleteLocation(id);
    if (result.deactivated) {
      setLocationsState((prev) =>
        prev.map((l) => (l.id === id ? { ...l, active: false } : l))
      );
    } else {
      setLocationsState((prev) => prev.filter((l) => l.id !== id));
    }
  }, []);

  const createAmenity = useCallback(async (input: { name: string }) => {
    const created = await catalogService.createAmenity(input);
    setAmenitiesState((prev) => [...prev, created]);
    return created;
  }, []);

  const updateAmenity = useCallback(
    async (id: string, updates: { name?: string; active?: boolean }) => {
      const updated = await catalogService.updateAmenity(id, updates);
      setAmenitiesState((prev) => prev.map((a) => (a.id === id ? updated : a)));
      return updated;
    },
    []
  );

  const deleteAmenity = useCallback(async (id: string) => {
    const result = await catalogService.deleteAmenity(id);
    if (result.deactivated) {
      setAmenitiesState((prev) =>
        prev.map((a) => (a.id === id ? { ...a, active: false } : a))
      );
    } else {
      setAmenitiesState((prev) => prev.filter((a) => a.id !== id));
    }
  }, []);

  const addLog = useCallback((log: Omit<ActivityLog, "id" | "timestamp">) => {
    void (async () => {
      try {
        const created = await catalogService.addLog(log);
        setActivityLogsState((prev) => [created, ...prev.filter((l) => l.id !== created.id)]);
      } catch {
        // Fire-and-forget: never block primary admin/dealer actions.
      }
    })();
  }, []);

  return {
    categories,
    categoriesReady,
    refreshCategories,
    setCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    locations,
    locationsReady,
    refreshLocations,
    setLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    amenities,
    amenitiesReady,
    refreshAmenities,
    setAmenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    activityLogs,
    logsReady,
    refreshLogs,
    addLog,
  };
}
