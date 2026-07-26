"use client";

import React, { createContext, useCallback, useContext, useMemo } from "react";
import { useAuthContext } from "@/providers/AuthProvider";
import { useCityPreference } from "@/hooks/useCityPreference";
import { useFavorites } from "@/features/properties/hooks/useFavorites";
import { usePropertyMutations } from "@/features/properties/hooks/usePropertyMutations";
import { useCatalog } from "@/features/catalog/hooks/useCatalog";
import { useInquiries } from "@/features/inquiries/hooks/useInquiries";
import { useVisits } from "@/features/visits/hooks/useVisits";
import { useLeads } from "@/features/leads/hooks/useLeads";
import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useDirectoryProfiles } from "@/features/dealers/hooks/useDirectoryProfiles";
import type { AppContextType } from "./app-context-types";

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuthContext();
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    sessionReady,
    logout: authLogout,
    updateProfile: authUpdateProfile,
  } = auth;

  const { selectedCity, setSelectedCity } = useCityPreference();

  const {
    favorites,
    favoritesReady,
    refreshFavorites,
    toggleFavorite,
    clearFavoritesOnLogout,
  } = useFavorites({ isLoggedIn, sessionReady, selectedCity });

  const {
    notifications,
    notificationsReady,
    refreshNotifications,
    setNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useNotifications({ sessionReady, isLoggedIn, userRole });

  const {
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
  } = useDirectoryProfiles();

  const {
    properties,
    setProperties,
    addProperty,
    updateProperty,
    deleteProperty,
    refreshProperties,
    propertiesReady,
    propertiesLoading,
    propertiesError,
  } = usePropertyMutations({
    isLoggedIn,
    userRole,
    userEmail,
    userName,
    userProfile,
    directoryProfiles,
    refreshNotifications,
  });

  const {
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
  } = useCatalog({ sessionReady, isLoggedIn, userRole });

  const {
    inquiries,
    inquiriesReady,
    refreshInquiries,
    submitInquiry,
    deleteInquiry,
    clearInquiriesOnLogout,
  } = useInquiries({
    sessionReady,
    isLoggedIn,
    userRole,
    refreshProperties,
  });

  const { visits, visitsReady, refreshVisits, bookVisit, updateVisit } = useVisits({
    sessionReady,
    isLoggedIn,
    userRole,
    refreshNotifications,
  });

  const {
    assistanceRequests,
    assistanceReady,
    refreshAssistance,
    setAssistanceRequests,
    addAssistanceRequest,
    updateAssistanceRequest,
    deleteAssistanceRequest,
    enquiries,
    enquiriesReady,
    refreshEnquiries,
    setEnquiries,
    addGeneralEnquiry,
    deleteGeneralEnquiry,
  } = useLeads({ sessionReady, isLoggedIn, userRole });

  const updateProfile = useCallback(
    async (input: {
      name?: string;
      phone?: string | null;
      bio?: string | null;
      city?: string | null;
      avatarUrl?: string | null;
    }) => {
      return authUpdateProfile(input);
    },
    [authUpdateProfile]
  );

  const logout = useCallback(async () => {
    clearInquiriesOnLogout();
    clearFavoritesOnLogout();
    await authLogout();
  }, [authLogout, clearInquiriesOnLogout, clearFavoritesOnLogout]);

  const value = useMemo<AppContextType>(
    () => ({
      selectedCity,
      setSelectedCity,
      properties,
      setProperties,
      favorites,
      favoritesReady,
      refreshFavorites,
      toggleFavorite,
      assistanceRequests,
      assistanceReady,
      refreshAssistance,
      setAssistanceRequests,
      addAssistanceRequest,
      updateAssistanceRequest,
      deleteAssistanceRequest,
      addProperty,
      updateProperty,
      deleteProperty,
      refreshProperties,
      propertiesReady,
      propertiesLoading,
      propertiesError,
      deleteInquiry,
      inquiries,
      inquiriesReady,
      refreshInquiries,
      submitInquiry,
      enquiries,
      enquiriesReady,
      refreshEnquiries,
      setEnquiries,
      addGeneralEnquiry,
      deleteGeneralEnquiry,
      directoryProfiles,
      directoryProfilesReady,
      directoryProfilesError,
      refreshDirectoryProfiles,
      setDirectoryProfiles,
      addDirectoryProfile,
      updateDirectoryProfile,
      deleteDirectoryProfile,
      isLoggedIn,
      userEmail,
      userRole,
      userName,
      userProfile,
      updateProfile,
      notifications,
      notificationsReady,
      refreshNotifications,
      setNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      visits,
      visitsReady,
      refreshVisits,
      bookVisit,
      updateVisit,
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
      adminUsers,
      setAdminUsers,
      logout,
      sessionReady,
    }),
    [
      selectedCity,
      setSelectedCity,
      properties,
      propertiesReady,
      propertiesLoading,
      propertiesError,
      refreshProperties,
      setProperties,
      favorites,
      favoritesReady,
      refreshFavorites,
      toggleFavorite,
      setAssistanceRequests,
      assistanceRequests,
      assistanceReady,
      refreshAssistance,
      addAssistanceRequest,
      updateAssistanceRequest,
      deleteAssistanceRequest,
      addProperty,
      updateProperty,
      deleteProperty,
      deleteInquiry,
      inquiries,
      inquiriesReady,
      refreshInquiries,
      submitInquiry,
      enquiries,
      enquiriesReady,
      refreshEnquiries,
      setEnquiries,
      addGeneralEnquiry,
      deleteGeneralEnquiry,
      directoryProfiles,
      directoryProfilesReady,
      directoryProfilesError,
      refreshDirectoryProfiles,
      setDirectoryProfiles,
      addDirectoryProfile,
      updateDirectoryProfile,
      deleteDirectoryProfile,
      isLoggedIn,
      userEmail,
      userRole,
      userName,
      userProfile,
      updateProfile,
      notifications,
      notificationsReady,
      refreshNotifications,
      setNotifications,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      visits,
      visitsReady,
      refreshVisits,
      bookVisit,
      updateVisit,
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
      adminUsers,
      setAdminUsers,
      logout,
      sessionReady,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
