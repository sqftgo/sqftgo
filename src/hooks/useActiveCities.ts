"use client";

import { useEffect, useMemo } from "react";
import { useApp } from "@/context/AppContext";
import { ALL_BHARAT_CITY } from "@/constants/cities";

/**
 * Active admin-managed cities for public/dealer/admin pickers.
 * Single source of truth: `locations` catalog (inactive rows excluded).
 */
export function useActiveCities() {
  const { locations, locationsReady, selectedCity, setSelectedCity } = useApp();

  const activeLocations = useMemo(
    () =>
      locations
        .filter((l) => l.active)
        .slice()
        .sort((a, b) => {
          const order = (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
          if (order !== 0) return order;
          return a.city.localeCompare(b.city);
        }),
    [locations]
  );

  const cities = useMemo(() => activeLocations.map((l) => l.city), [activeLocations]);

  const cityOptions = useMemo(
    () => [
      { label: ALL_BHARAT_CITY, value: ALL_BHARAT_CITY },
      ...cities.map((c) => ({ label: c, value: c })),
    ],
    [cities]
  );

  const cityOptionsWithoutAll = useMemo(
    () => cities.map((c) => ({ label: c, value: c })),
    [cities]
  );

  const cityOptionsWithAllCities = useMemo(
    () => [{ label: "All Cities", value: "All" }, ...cities.map((c) => ({ label: c, value: c }))],
    [cities]
  );

  // Snap invalid saved preference onto an allowed city once catalog is ready.
  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (selectedCity === ALL_BHARAT_CITY) return;
    const ok = cities.some((c) => c.toLowerCase() === selectedCity.toLowerCase());
    if (!ok) {
      setSelectedCity(cities[0] ?? ALL_BHARAT_CITY);
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
    cityOptionsWithAllCities,
    findLocation,
  };
}
