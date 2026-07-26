"use client";

import { useCallback, useEffect, useState } from "react";
import { SESSION_STORAGE_KEY } from "@/constants/demoAccounts";

const defaultSession = {
  favorites: [] as string[],
  selectedCity: "Udaipur",
};

export type UiPrefs = {
  favorites: string[];
  selectedCity: string;
};

export function readUiPrefs(): UiPrefs {
  if (typeof window === "undefined") {
    return {
      favorites: defaultSession.favorites,
      selectedCity: defaultSession.selectedCity,
    };
  }
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return {
        favorites: defaultSession.favorites,
        selectedCity: defaultSession.selectedCity,
      };
    }
    const parsed = JSON.parse(raw) as Partial<UiPrefs>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      selectedCity:
        typeof parsed.selectedCity === "string" && parsed.selectedCity
          ? parsed.selectedCity
          : defaultSession.selectedCity,
    };
  } catch {
    return {
      favorites: defaultSession.favorites,
      selectedCity: defaultSession.selectedCity,
    };
  }
}

export function writeUiPrefs(prefs: UiPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(prefs));
}

export function useCityPreference() {
  const [selectedCity, setSelectedCityState] = useState(defaultSession.selectedCity);

  useEffect(() => {
    const prefs = readUiPrefs();
    setSelectedCityState(prefs.selectedCity);
  }, []);

  const setSelectedCity = useCallback((city: string) => setSelectedCityState(city), []);

  return { selectedCity, setSelectedCity };
}
