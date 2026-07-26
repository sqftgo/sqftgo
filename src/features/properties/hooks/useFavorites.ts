"use client";

import { useCallback, useEffect, useState } from "react";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { favoritesService } from "@/services";
import { readUiPrefs, writeUiPrefs } from "@/hooks/useCityPreference";

type UseFavoritesArgs = {
  isLoggedIn: boolean;
  sessionReady: boolean;
  selectedCity: string;
};

export function useFavorites({ isLoggedIn, sessionReady, selectedCity }: UseFavoritesArgs) {
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);

  useEffect(() => {
    const prefs = readUiPrefs();
    setFavorites(prefs.favorites);
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    // Never persist account favorites into shared localStorage — avoids cross-user leaks.
    writeUiPrefs({
      favorites: isLoggedIn ? [] : favorites,
      selectedCity,
    });
  }, [sessionReady, isLoggedIn, favorites, selectedCity]);

  const refreshFavorites = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setFavoritesReady(true);
      return;
    }
    try {
      const guestLocal = readUiPrefs().favorites;
      const server = await favoritesService.list();
      const merged = Array.from(new Set([...server, ...guestLocal]));
      const missingOnServer = guestLocal.filter((id) => !server.includes(id));
      await Promise.all(
        missingOnServer.map((id) => favoritesService.add(id).catch(() => undefined))
      );
      setFavorites(merged);
      writeUiPrefs({
        favorites: [],
        selectedCity: readUiPrefs().selectedCity,
      });
    } catch {
      // Keep existing in-memory favorites if sync fails
    } finally {
      setFavoritesReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    if (!isLoggedIn) {
      setFavorites(readUiPrefs().favorites);
      setFavoritesReady(true);
      return;
    }
    setFavoritesReady(false);
    void refreshFavorites();
  }, [sessionReady, isLoggedIn, refreshFavorites]);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id];
        return next;
      });

      if (!hasSupabaseEnv() || !isLoggedIn) return;

      const removing = favorites.includes(id);
      void (removing ? favoritesService.remove(id) : favoritesService.add(id)).catch(() => {
        setFavorites((prev) =>
          removing
            ? prev.includes(id)
              ? prev
              : [...prev, id]
            : prev.filter((favId) => favId !== id)
        );
      });
    },
    [favorites, isLoggedIn]
  );

  const clearFavoritesOnLogout = useCallback(() => {
    setFavorites([]);
    setFavoritesReady(true);
  }, []);

  return {
    favorites,
    favoritesReady,
    refreshFavorites,
    toggleFavorite,
    clearFavoritesOnLogout,
  };
}
