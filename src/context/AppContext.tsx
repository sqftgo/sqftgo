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
  ActivityLog,
  MockUser,
  AssistanceRequest,
  GeneralEnquiry,
  CustomerReview,
  DirectoryProfile,
  PropertyInquiry,
} from "@/types";
import {
  getStore,
  subscribeStore,
  patchStore,
  propertyService,
  inquiryService,
  dealerService,
  catalogService,
  authService,
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
};

interface AppContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  assistanceRequests: AssistanceRequest[];
  setAssistanceRequests: React.Dispatch<React.SetStateAction<AssistanceRequest[]>>;
  addAssistanceRequest: (req: Omit<AssistanceRequest, "id" | "status">) => void;
  addProperty: (
    property: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & {
      status?: Property["status"];
    }
  ) => Promise<Property>;
  updateProperty: (propertyId: string, updates: Partial<Property>) => Promise<Property>;
  deleteProperty: (propertyId: string) => Promise<void>;
  refreshProperties: () => Promise<void>;
  propertiesReady: boolean;
  deleteInquiry: (propertyId: string, index: number) => void;
  inquiries: Record<string, PropertyInquiry[]>;
  submitInquiry: (
    propertyId: string,
    inquiry: { name: string; email: string; phone: string; message: string }
  ) => void;
  enquiries: GeneralEnquiry[];
  setEnquiries: React.Dispatch<React.SetStateAction<GeneralEnquiry[]>>;
  addGeneralEnquiry: (enquiry: Omit<GeneralEnquiry, "id" | "date">) => void;
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, "id" | "date">) => void;
  directoryProfiles: DirectoryProfile[];
  setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>>;
  addDirectoryProfile: (profile: Omit<DirectoryProfile, "id">) => void;
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
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markNotificationRead: (id: string) => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  activityLogs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  mockUsers: MockUser[];
  setMockUsers: React.Dispatch<React.SetStateAction<MockUser[]>>;
  compareList: string[];
  setCompareList: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCompare: (id: string) => void;
  logout: () => void | Promise<void>;
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
  const [selectedCity, setSelectedCityState] = useState(defaultSession.selectedCity);
  const [favorites, setFavorites] = useState<string[]>([]);
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

  useEffect(() => {
    if (!sessionReady) return;
    writeUiPrefs({ favorites, compareList, selectedCity });
  }, [sessionReady, favorites, compareList, selectedCity]);

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
    if (hasSupabaseEnv()) {
      try {
        await authService.logout();
      } catch {
        // Local state already cleared
      }
    }
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  }, []);

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
      const current = getStore().assistanceRequests;
      const next = typeof action === "function" ? action(current) : action;
      patchStore({ assistanceRequests: next });
    },
    []
  );

  const setEnquiries: React.Dispatch<React.SetStateAction<GeneralEnquiry[]>> = useCallback((action) => {
    const current = getStore().enquiries;
    const next = typeof action === "function" ? action(current) : action;
    patchStore({ enquiries: next });
  }, []);

  const setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>> = useCallback(
    (action) => {
      const current = getStore().directoryProfiles;
      const next = typeof action === "function" ? action(current) : action;
      patchStore({ directoryProfiles: next });
    },
    []
  );

  const setNotifications: React.Dispatch<React.SetStateAction<Notification[]>> = useCallback(
    (action) => {
      const current = getStore().notifications;
      const next = typeof action === "function" ? action(current) : action;
      patchStore({ notifications: next });
    },
    []
  );

  const setCategories: React.Dispatch<React.SetStateAction<Category[]>> = useCallback((action) => {
    const current = getStore().categories;
    const next = typeof action === "function" ? action(current) : action;
    patchStore({ categories: next });
  }, []);

  const setLocations: React.Dispatch<React.SetStateAction<Location[]>> = useCallback((action) => {
    const current = getStore().locations;
    const next = typeof action === "function" ? action(current) : action;
    patchStore({ locations: next });
  }, []);

  const setMockUsers: React.Dispatch<React.SetStateAction<MockUser[]>> = useCallback((action) => {
    const current = getStore().mockUsers;
    const next = typeof action === "function" ? action(current) : action;
    patchStore({ mockUsers: next });
  }, []);

  const addAssistanceRequest = useCallback((req: Omit<AssistanceRequest, "id" | "status">) => {
    void inquiryService.addAssistance(req);
  }, []);

  const addProperty = useCallback(
    async (
      prop: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & {
        status?: Property["status"];
      }
    ) => {
      const matchingProfile =
        isLoggedIn && userRole === "broker"
          ? getStore().directoryProfiles.find(
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
      return created;
    },
    [isLoggedIn, userRole, userEmail, userName, userProfile?.phone]
  );

  const updateProperty = useCallback(async (propertyId: string, updates: Partial<Property>) => {
    const updated = await propertyService.update(propertyId, updates);
    setPropertiesState((prev) => prev.map((p) => (p.id === propertyId ? updated : p)));
    return updated;
  }, []);

  const deleteProperty = useCallback(async (propertyId: string) => {
    await propertyService.remove(propertyId);
    setPropertiesState((prev) => prev.filter((p) => p.id !== propertyId));
  }, []);

  const deleteInquiry = useCallback((propertyId: string, index: number) => {
    void inquiryService.remove(propertyId, index);
  }, []);

  const submitInquiry = useCallback(
    (propertyId: string, inquiry: { name: string; email: string; phone: string; message: string }) => {
      void inquiryService.submit(propertyId, inquiry);
    },
    []
  );

  const addGeneralEnquiry = useCallback((enq: Omit<GeneralEnquiry, "id" | "date">) => {
    void inquiryService.addEnquiry(enq);
  }, []);

  const addReview = useCallback((rev: Omit<CustomerReview, "id" | "date">) => {
    void inquiryService.addReview(rev);
  }, []);

  const addDirectoryProfile = useCallback((prof: Omit<DirectoryProfile, "id">) => {
    void dealerService.create(prof);
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    void catalogService.markNotificationRead(id);
  }, []);

  const addLog = useCallback((log: Omit<ActivityLog, "id" | "timestamp">) => {
    void catalogService.addLog(log);
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      selectedCity,
      setSelectedCity,
      properties,
      setProperties,
      favorites,
      toggleFavorite,
      assistanceRequests: store.assistanceRequests,
      setAssistanceRequests,
      addAssistanceRequest,
      addProperty,
      updateProperty,
      deleteProperty,
      refreshProperties,
      propertiesReady,
      deleteInquiry,
      inquiries: store.inquiries,
      submitInquiry,
      enquiries: store.enquiries,
      setEnquiries,
      addGeneralEnquiry,
      reviews: store.reviews,
      addReview,
      directoryProfiles: store.directoryProfiles,
      setDirectoryProfiles,
      addDirectoryProfile,
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
      notifications: store.notifications,
      setNotifications,
      markNotificationRead,
      categories: store.categories,
      setCategories,
      locations: store.locations,
      setLocations,
      activityLogs: store.activityLogs,
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
      toggleFavorite,
      setAssistanceRequests,
      addAssistanceRequest,
      addProperty,
      updateProperty,
      deleteProperty,
      deleteInquiry,
      submitInquiry,
      setEnquiries,
      addGeneralEnquiry,
      addReview,
      setDirectoryProfiles,
      addDirectoryProfile,
      isLoggedIn,
      setIsLoggedIn,
      userEmail,
      setUserEmail,
      userRole,
      setUserRole,
      userName,
      setUserName,
      userProfile,
      setNotifications,
      markNotificationRead,
      setCategories,
      setLocations,
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
