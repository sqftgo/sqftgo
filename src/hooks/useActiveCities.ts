"use client";

import { useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ALL_INDIA_CITY } from "@/constants/cities";

/**
 * Active admin-managed cities for public/dealer pickers.
 * Admin catalog may include inactive rows — those are filtered out here.
 */
export function useActiveCities() {
  const { locations, locationsReady, selectedCity, setSelectedCity } = useApp();

  const activeLocations = useMemo(
    () => locations.filter((l) => l.active).sort((a, b) => a.city.localeCompare(b.city)),
    [locations]
  );

  const cities = useMemo(() => activeLocations.map((l) => l.city), [activeLocations]);

  const cityOptions = useMemo(
    () => [
      { label: ALL_INDIA_CITY, value: ALL_INDIA_CITY },
      ...cities.map((c) => ({ label: c, value: c })),
    ],
    [cities]
  );

  const cityOptionsWithoutAll = useMemo(
    () => cities.map((c) => ({ label: c, value: c })),
    [cities]
  );

  // Snap invalid saved preference onto an allowed city once catalog is ready.
  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (selectedCity === ALL_INDIA_CITY) return;
    const ok = cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase());
    if (!ok) {
      setSelectedCity(cities[0] ?? ALL_INDIA_CITY);
    }
  }, [locationsReady, cities, selectedCity, setSelectedCity]);

  const findLocation = (city: string) =>
    activeLocations.find((l) => l.city.toLowerCase() === city.trim().toLowerCase()) ?? null;

  return {
    locationsReady,
    activeLocations,
    cities,
    cityOptions,
    cityOptionsWithoutAll,
    findLocation,
  };
}
