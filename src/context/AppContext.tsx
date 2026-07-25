"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";
import { SESSION_STORAGE_KEY } from "@/constants/demoAccounts";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import type {
  Property,
  UserProfile,
  Notification,
  Category,
  Location,
  Amenity,
  ActivityLog,
  MockUser,
  AssistanceRequest,
  GeneralEnquiry,
  CustomerReview,
  DirectoryProfile,
  PropertyInquiry,
  VisitBooking,
} from "@/types";
import {
  getStore,
  subscribeStore,
  patchStore,
  propertyService,
  inquiryService,
  dealerService,
  catalogService,
  notificationService,
  visitService,
  authService,
  favoritesService,
  type SessionSnapshot,
} from "@/services";

export type {
  Property,
  UserProfile,
  Notification,
  Category,
  Location,
  ActivityLog,
  MockUser,
  AssistanceRequest,
  GeneralEnquiry,
  CustomerReview,
  DirectoryProfile,
  PropertyInquiry,
  VisitBooking,
};

interface AppContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  favorites: string[];
  favoritesReady: boolean;
  refreshFavorites: () => Promise<void>;
  toggleFavorite: (id: string) => void;
  assistanceRequests: AssistanceRequest[];
  assistanceReady: boolean;
  refreshAssistance: () => Promise<void>;
  setAssistanceRequests: React.Dispatch<React.SetStateAction<AssistanceRequest[]>>;
  addAssistanceRequest: (req: Omit<AssistanceRequest, "id" | "status">) => Promise<AssistanceRequest>;
  updateAssistanceRequest: (
    id: string,
    updates: { status?: AssistanceRequest["status"]; notes?: string }
  ) => Promise<AssistanceRequest>;
  deleteAssistanceRequest: (id: string) => Promise<void>;
  addProperty: (
    property: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & {
      status?: Property["status"];
    }
  ) => Promise<Property>;
  updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<Property>;
  deleteProperty: (propertyId: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
  propertiesReady: boolean;
  deleteInquiry: (inquiryId: string) => Promise<void>;
  inquiries: Record<string, PropertyInquiry[]>;
  inquiriesReady: boolean;
  refreshInquiries: () => Promise<void>;
  submitInquiry: (
    propertyId: string,
    inquiry: { name: string; email: string; phone: string; message: string }
  ) => Promise<PropertyInquiry>;
  enquiries: GeneralEnquiry[];
  enquiriesReady: boolean;
  refreshEnquiries: () => Promise<void>;
  setEnquiries: React.Dispatch<React.SetStateAction<GeneralEnquiry[]>>;
  addGeneralEnquiry: (
    enquiry: Omit<GeneralEnquiry, "id" | "date"> & { payload?: Record<string, unknown> }
  ) => Promise<GeneralEnquiry>;
  deleteGeneralEnquiry: (id: string) => Promise<void>;
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, "id" | "date">) => void;
  directoryProfiles: DirectoryProfile[];
  directoryProfilesReady: boolean;
  refreshDirectoryProfiles: () => Promise<void>;
  setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>>;
  addDirectoryProfile: (profile: Omit<DirectoryProfile, "id">) => Promise<DirectoryProfile>;
  updateDirectoryProfile: (id: string, updates: Partial<DirectoryProfile>) => Promise<DirectoryProfile>;
  deleteDirectoryProfile: (id: string) => Promise<void>;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userRole: "user" | "broker" | "admin" | null;
  setUserRole: (role: "user" | "broker" | "admin" | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  notifications: Notification[];
  notificationsReady: boolean;
  refreshNotifications: () => Promise<void>;
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  visits: VisitBooking[];
  visitsReady: boolean;
  refreshVisits: () => Promise<void>;
  bookVisit: (
    propertyId: string,
    payload: {
      name: string;
      email: string;
      phone: string;
      date: string;
      time: string;
      notes?: string;
    }
  ) => Promise<VisitBooking>;
  updateVisit: (
    id: string,
    updates: {
      status?: VisitBooking["status"];
      date?: string;
      time?: string;
      notes?: string;
      brokerNotes?: string;
    }
  ) => Promise<VisitBooking>;
  categories: Category[];
  categoriesReady: boolean;
  refreshCategories: () => Promise<void>;
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  createCategory: (input: { name: string; icon: string }) => Promise<Category>;
  updateCategory: (
    id: string,
    updates: { name?: string; icon?: string; active?: boolean }
  ) => Promise<Category>;
  deleteCategory: (id: string) => Promise<void>;
  locations: Location[];
  locationsReady: boolean;
  refreshLocations: () => Promise<void>;
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  createLocation: (input: {
    city: string;
    state: string;
    country: string;
  }) => Promise<Location>;
  updateLocation: (
    id: string,
    updates: { city?: string; state?: string; country?: string; active?: boolean }
  ) => Promise<Location>;
  deleteLocation: (id: string) => Promise<void>;
  amenities: Amenity[];
  amenitiesReady: boolean;
  refreshAmenities: () => Promise<void>;
  setAmenities: React.Dispatch<React.SetStateAction<Amenity[]>>;
  createAmenity: (input: { name: string }) => Promise<Amenity>;
  updateAmenity: (
    id: string,
    updates: { name?: string; active?: boolean }
  ) => Promise<Amenity>;
  deleteAmenity: (id: string) => Promise<void>;
  activityLogs: ActivityLog[];
  logsReady: boolean;
  refreshLogs: () => Promise<void>;
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  mockUsers: MockUser[];
  setMockUsers: React.Dispatch<React.SetStateAction<MockUser[]>>;
  compareList: string[];
  setCompareList: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCompare: (id: string) => void;
  logout: () => Promise<void>;
  sessionReady: boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSession: SessionSnapshot = {
  isLoggedIn: false,
  userEmail: "",
  userRole: null,
  userName: "",
  userProfile: null,
  favorites: [],
  compareList: [],
  selectedCity: "Udaipur",
};

type UiPrefs = Pick<SessionSnapshot, "favorites" | "compareList" | "selectedCity">;

function readUiPrefs(): UiPrefs {
  if (typeof window === "undefined") {
    return {
      favorites: defaultSession.favorites,
      compareList: defaultSession.compareList,
      selectedCity: defaultSession.selectedCity,
    };
  }
  try {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return {
        favorites: defaultSession.favorites,
        compareList: defaultSession.compareList,
        selectedCity: defaultSession.selectedCity,
      };
    }
    const parsed = JSON.parse(raw) as Partial<SessionSnapshot>;
    return {
      favorites: Array.isArray(parsed.favorites) ? parsed.favorites : [],
      compareList: Array.isArray(parsed.compareList) ? parsed.compareList : [],
      selectedCity:
        typeof parsed.selectedCity === "string" && parsed.selectedCity
          ? parsed.selectedCity
          : defaultSession.selectedCity,
    };
  } catch {
    return {
      favorites: defaultSession.favorites,
      compareList: defaultSession.compareList,
      selectedCity: defaultSession.selectedCity,
    };
  }
}

function writeUiPrefs(prefs: UiPrefs) {
  if (typeof window === "undefined") return;
  localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(prefs));
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const store = useSyncExternalStore(subscribeStore, getStore, getStore);

  const [sessionReady, setSessionReady] = useState(false);
  const [properties, setPropertiesState] = useState<Property[]>([]);
  const [propertiesReady, setPropertiesReady] = useState(false);
  const [inquiries, setInquiriesState] = useState<Record<string, PropertyInquiry[]>>({});
  const [inquiriesReady, setInquiriesReady] = useState(false);
  const [directoryProfiles, setDirectoryProfilesState] = useState<DirectoryProfile[]>([]);
  const [directoryProfilesReady, setDirectoryProfilesReady] = useState(false);
  const [assistanceRequests, setAssistanceRequestsState] = useState<AssistanceRequest[]>([]);
  const [assistanceReady, setAssistanceReady] = useState(false);
  const [enquiries, setEnquiriesState] = useState<GeneralEnquiry[]>([]);
  const [enquiriesReady, setEnquiriesReady] = useState(false);
  const [notifications, setNotificationsState] = useState<Notification[]>([]);
  const [notificationsReady, setNotificationsReady] = useState(false);
  const [visits, setVisitsState] = useState<VisitBooking[]>([]);
  const [visitsReady, setVisitsReady] = useState(false);
  const [categories, setCategoriesState] = useState<Category[]>([]);
  const [categoriesReady, setCategoriesReady] = useState(false);
  const [locations, setLocationsState] = useState<Location[]>([]);
  const [locationsReady, setLocationsReady] = useState(false);
  const [amenities, setAmenitiesState] = useState<Amenity[]>([]);
  const [amenitiesReady, setAmenitiesReady] = useState(false);
  const [activityLogs, setActivityLogsState] = useState<ActivityLog[]>([]);
  const [logsReady, setLogsReady] = useState(false);
  const [selectedCity, setSelectedCityState] = useState(defaultSession.selectedCity);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [favoritesReady, setFavoritesReady] = useState(false);
  const [compareList, setCompareList] = useState<string[]>([]);
  const [isLoggedIn, setIsLoggedInState] = useState(false);
  const [userEmail, setUserEmailState] = useState("");
  const [userRole, setUserRoleState] = useState<"user" | "broker" | "admin" | null>(null);
  const [userName, setUserNameState] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const prefs = readUiPrefs();
    setSelectedCityState(prefs.selectedCity);
    setFavorites(prefs.favorites);
    setCompareList(prefs.compareList);

    let cancelled = false;

    async function hydrateAuth() {
      // Never trust localStorage for roles/identity — only Supabase cookie session.
      if (!hasSupabaseEnv()) {
        setIsLoggedInState(false);
        setUserEmailState("");
        setUserRoleState(null);
        setUserNameState("");
        setUserProfile(null);
        if (!cancelled) setSessionReady(true);
        return;
      }

      try {
        const session = await authService.getSession();
        if (cancelled) return;
        if (session) {
          setIsLoggedInState(true);
          setUserEmailState(session.email);
          setUserRoleState(session.role);
          setUserNameState(session.name);
          setUserProfile(session.profile);
        } else {
          setIsLoggedInState(false);
          setUserEmailState("");
          setUserRoleState(null);
          setUserNameState("");
          setUserProfile(null);
        }
      } catch {
        if (!cancelled) {
          setIsLoggedInState(false);
          setUserEmailState("");
          setUserRoleState(null);
          setUserNameState("");
          setUserProfile(null);
        }
      } finally {
        if (!cancelled) setSessionReady(true);
      }
    }

    void hydrateAuth();
    return () => {
      cancelled = true;
    };
  }, []);

  const refreshProperties = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setPropertiesState([]);
      setPropertiesReady(true);
      return;
    }
    try {
      const rows = await propertyService.list();
      setPropertiesState(rows);
    } catch {
      setPropertiesState([]);
    } finally {
      setPropertiesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshProperties();
  }, [sessionReady, isLoggedIn, userRole, refreshProperties]);

  const refreshNotifications = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setNotificationsState([]);
      setNotificationsReady(true);
      return;
    }
    try {
      const rows = await notificationService.list();
      setNotificationsState(rows);
    } catch {
      setNotificationsState([]);
    } finally {
      setNotificationsReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshNotifications();
  }, [sessionReady, isLoggedIn, userRole, refreshNotifications]);

  const refreshVisits = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setVisitsState([]);
      setVisitsReady(true);
      return;
    }
    try {
      const rows = await visitService.list();
      setVisitsState(rows);
    } catch {
      setVisitsState([]);
    } finally {
      setVisitsReady(true);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshVisits();
  }, [sessionReady, isLoggedIn, userRole, refreshVisits]);

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

  const refreshInquiries = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn) {
      setInquiriesState({});
      setInquiriesReady(true);
      return;
    }
    try {
      if (userRole === "user") {
        const rows = await inquiryService.listFlat({ mine: true });
        const out: Record<string, PropertyInquiry[]> = {};
        for (const row of rows) {
          const entry: PropertyInquiry = {
            id: row.id,
            name: row.name,
            email: row.email,
            phone: row.phone,
            message: row.message,
            date: row.date,
            status: row.status,
          };
          if (!out[row.propertyId]) out[row.propertyId] = [];
          out[row.propertyId].push(entry);
        }
        setInquiriesState(out);
      } else {
        setInquiriesState(await inquiryService.listAll());
      }
    } catch {
      setInquiriesState({});
    } finally {
      setInquiriesReady(true);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshInquiries();
  }, [sessionReady, isLoggedIn, userRole, refreshInquiries]);

  const refreshDirectoryProfiles = useCallback(async () => {
    if (!hasSupabaseEnv()) {
      setDirectoryProfilesState([]);
      setDirectoryProfilesReady(true);
      return;
    }
    try {
      const rows = await dealerService.listProfiles();
      setDirectoryProfilesState(rows);
    } catch {
      setDirectoryProfilesState([]);
    } finally {
      setDirectoryProfilesReady(true);
    }
  }, []);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshDirectoryProfiles();
  }, [sessionReady, refreshDirectoryProfiles]);

  const refreshAssistance = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn || userRole !== "admin") {
      setAssistanceRequestsState([]);
      setAssistanceReady(true);
      return;
    }
    try {
      setAssistanceRequestsState(await inquiryService.listAssistance());
    } catch {
      setAssistanceRequestsState([]);
    } finally {
      setAssistanceReady(true);
    }
  }, [isLoggedIn, userRole]);

  const refreshEnquiries = useCallback(async () => {
    if (!hasSupabaseEnv() || !isLoggedIn || userRole !== "admin") {
      setEnquiriesState([]);
      setEnquiriesReady(true);
      return;
    }
    try {
      setEnquiriesState(await inquiryService.listEnquiries());
    } catch {
      setEnquiriesState([]);
    } finally {
      setEnquiriesReady(true);
    }
  }, [isLoggedIn, userRole]);

  useEffect(() => {
    if (!sessionReady) return;
    void refreshAssistance();
    void refreshEnquiries();
  }, [sessionReady, refreshAssistance, refreshEnquiries]);

  useEffect(() => {
    if (!sessionReady) return;
    // Never persist account favorites into shared localStorage — avoids cross-user leaks.
    writeUiPrefs({
      favorites: isLoggedIn ? [] : favorites,
      compareList,
      selectedCity,
    });
  }, [sessionReady, isLoggedIn, favorites, compareList, selectedCity]);

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
        compareList: readUiPrefs().compareList,
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

  const setSelectedCity = useCallback((city: string) => setSelectedCityState(city), []);
  const setIsLoggedIn = useCallback((val: boolean) => setIsLoggedInState(val), []);
  const setUserEmail = useCallback((email: string) => setUserEmailState(email), []);
  const setUserRole = useCallback(
    (role: "user" | "broker" | "admin" | null) => setUserRoleState(role),
    []
  );
  const setUserName = useCallback((name: string) => setUserNameState(name), []);

  const logout = useCallback(async () => {
    setIsLoggedInState(false);
    setUserEmailState("");
    setUserRoleState(null);
    setUserNameState("");
    setUserProfile(null);
    setInquiriesState({});
    setInquiriesReady(false);
    setFavorites([]);
    setFavoritesReady(true);
    if (hasSupabaseEnv()) {
      try {
        await authService.logout();
      } catch {
        // Local state already cleared
      }
    }
  }, []);

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

  const toggleCompare = useCallback((id: string) => {
    setCompareList((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : prev.length >= 4
          ? [...prev.slice(1), id]
          : [...prev, id]
    );
  }, []);

  const setProperties: React.Dispatch<React.SetStateAction<Property[]>> = useCallback((action) => {
    setPropertiesState((current) =>
      typeof action === "function" ? action(current) : action
    );
  }, []);

  const setAssistanceRequests: React.Dispatch<React.SetStateAction<AssistanceRequest[]>> = useCallback(
    (action) => {
      setAssistanceRequestsState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setEnquiries: React.Dispatch<React.SetStateAction<GeneralEnquiry[]>> = useCallback((action) => {
    setEnquiriesState((current) => (typeof action === "function" ? action(current) : action));
  }, []);

  const setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>> = useCallback(
    (action) => {
      setDirectoryProfilesState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> = useCallback(
    (action) => {
      setNotificationsState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setCategories: React.Dispatch<React.SetStateAction<Category[]>> = useCallback(
    (action) => {
      setCategoriesState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

  const setLocations: React.Dispatch<React.SetStateAction<Location[]>> = useCallback(
    (action) => {
      setLocationsState((current) =>
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

  const setAmenities: React.Dispatch<React.SetStateAction<Amenity[]>> = useCallback(
    (action) => {
      setAmenitiesState((current) =>
        typeof action === "function" ? action(current) : action
      );
    },
    []
  );

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

  const setMockUsers: React.Dispatch<React.SetStateAction<MockUser[]>> = useCallback((action) => {
    const current = getStore().mockUsers;
    const next = typeof action === "function" ? action(current) : action;
    patchStore({ mockUsers: next });
  }, []);

  const addAssistanceRequest = useCallback(async (req: Omit<AssistanceRequest, "id" | "status">) => {
    const created = await inquiryService.addAssistance(req);
    setAssistanceRequestsState((prev) => [created, ...prev.filter((r) => r.id !== created.id)]);
    return created;
  }, []);

  const updateAssistanceRequest = useCallback(
    async (id: string, updates: { status?: AssistanceRequest["status"]; notes?: string }) => {
      const updated = await inquiryService.updateAssistance(id, updates);
      setAssistanceRequestsState((prev) => prev.map((r) => (r.id === id ? updated : r)));
      return updated;
    },
    []
  );

  const deleteAssistanceRequest = useCallback(async (id: string) => {
    await inquiryService.removeAssistance(id);
    setAssistanceRequestsState((prev) => prev.filter((r) => r.id !== id));
  }, []);

  const addProperty = useCallback(
    async (
      prop: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & {
        status?: Property["status"];
      }
    ) => {
      const matchingProfile =
        isLoggedIn && userRole === "broker"
          ? directoryProfiles.find(
              (dp) => dp.email.toLowerCase() === userEmail.toLowerCase()
            )
          : null;

      const created = await propertyService.create({
        ...prop,
        ownerName: matchingProfile?.ownerName ?? (userName || "Owner User"),
        ownerPhone: matchingProfile?.mobile ?? userProfile?.phone ?? "+91 99000 99000",
        ownerEmail: isLoggedIn ? userEmail : undefined,
      });
      setPropertiesState((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
      void refreshNotifications();
      return created;
    },
    [
      isLoggedIn,
      userRole,
      userEmail,
      userName,
      userProfile?.phone,
      directoryProfiles,
      refreshNotifications,
    ]
  );

  const updateProperty = useCallback(
    async (propertyId: string, updates: Partial<Property>) => {
      const updated = await propertyService.update(propertyId, updates);
      setPropertiesState((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
      void refreshNotifications();
      return updated;
    },
    [refreshNotifications]
  );

  const deleteProperty = useCallback(async (propertyId: string) => {
    await propertyService.remove(propertyId);
    setPropertiesState((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const deleteInquiry = useCallback(
    async (inquiryId: string) => {
      await inquiryService.removeById(inquiryId);
      setInquiriesState((prev) => {
        const next: Record<string, PropertyInquiry[]> = {};
        for (const [pid, list] of Object.entries(prev)) {
          const filtered = list.filter((inq) => inq.id !== inquiryId);
          if (filtered.length) next[pid] = filtered;
        }
        return next;
      });
      void refreshProperties();
    },
    [refreshProperties]
  );

  const submitInquiry = useCallback(
    async (
      propertyId: string,
      inquiry: { name: string; email: string; phone: string; message: string }
    ) => {
      const created = await inquiryService.submit(propertyId, inquiry);
      setInquiriesState((prev) => ({
        ...prev,
        [propertyId]: [created, ...(prev[propertyId] ?? [])],
      }));
      void refreshProperties();
      return created;
    },
    [refreshProperties]
  );

  const addGeneralEnquiry = useCallback(
    async (enq: Omit<GeneralEnquiry, "id" | "date"> & { payload?: Record<string, unknown> }) => {
      const created = await inquiryService.addEnquiry(enq);
      setEnquiriesState((prev) => [created, ...prev.filter((e) => e.id !== created.id)]);
      return created;
    },
    []
  );

  const deleteGeneralEnquiry = useCallback(async (id: string) => {
    await inquiryService.removeEnquiry(id);
    setEnquiriesState((prev) => prev.filter((e) => e.id !== id));
  }, []);

  const addReview = useCallback((rev: Omit<CustomerReview, "id" | "date">) => {
    void inquiryService.addReview(rev);
  }, []);

  const addDirectoryProfile = useCallback(async (prof: Omit<DirectoryProfile, "id">) => {
    const created = await dealerService.create(prof);
    setDirectoryProfilesState((prev) => [created, ...prev.filter((p) => p.id !== created.id)]);
    return created;
  }, []);

  const updateDirectoryProfile = useCallback(
    async (id: string, updates: Partial<DirectoryProfile>) => {
      const updated = await dealerService.update(id, updates);
      setDirectoryProfilesState((prev) => prev.map((p) => (p.id === id ? updated : p)));
      return updated;
    },
    []
  );

  const deleteDirectoryProfile = useCallback(async (id: string) => {
    await dealerService.remove(id);
    setDirectoryProfilesState((prev) => prev.filter((p) => p.id !== id));
  }, []);

  const markNotificationRead = useCallback(async (id: string) => {
    const updated = await notificationService.markRead(id);
    setNotificationsState((prev) => prev.map((n) => (n.id === id ? updated : n)));
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    await notificationService.markAllRead();
    setNotificationsState((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    await notificationService.remove(id);
    setNotificationsState((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const bookVisit = useCallback(
    async (
      propertyId: string,
      payload: {
        name: string;
        email: string;
        phone: string;
        date: string;
        time: string;
        notes?: string;
      }
    ) => {
      const created = await visitService.book(propertyId, payload);
      setVisitsState((prev) => [created, ...prev.filter((v) => v.id !== created.id)]);
      void refreshNotifications();
      return created;
    },
    [refreshNotifications]
  );

  const updateVisit = useCallback(
    async (
      id: string,
      updates: {
        status?: VisitBooking["status"];
        date?: string;
        time?: string;
        notes?: string;
        brokerNotes?: string;
      }
    ) => {
      const updated = await visitService.update(id, updates);
      setVisitsState((prev) => prev.map((v) => (v.id === id ? updated : v)));
      void refreshNotifications();
      return updated;
    },
    [refreshNotifications]
  );

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
      reviews: store.reviews,
      addReview,
      directoryProfiles,
      directoryProfilesReady,
      refreshDirectoryProfiles,
      setDirectoryProfiles,
      addDirectoryProfile,
      updateDirectoryProfile,
      deleteDirectoryProfile,
      isLoggedIn,
      setIsLoggedIn,
      userEmail,
      setUserEmail,
      userRole,
      setUserRole,
      userName,
      setUserName,
      userProfile,
      setUserProfile,
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
      mockUsers: store.mockUsers,
      setMockUsers,
      compareList,
      setCompareList,
      toggleCompare,
      logout,
      sessionReady,
    }),
    [
      selectedCity,
      setSelectedCity,
      properties,
      propertiesReady,
      refreshProperties,
      store,
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
      addReview,
      directoryProfiles,
      directoryProfilesReady,
      refreshDirectoryProfiles,
      setDirectoryProfiles,
      addDirectoryProfile,
      updateDirectoryProfile,
      deleteDirectoryProfile,
      isLoggedIn,
      setIsLoggedIn,
      userEmail,
      setUserEmail,
      userRole,
      setUserRole,
      userName,
      setUserName,
      userProfile,
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
      setMockUsers,
      compareList,
      toggleCompare,
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
