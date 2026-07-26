import type React from "react";
import type {
  Property,
  UserProfile,
  Notification,
  Category,
  Location,
  Amenity,
  ActivityLog,
  AdminUser,
  AssistanceRequest,
  GeneralEnquiry,
  DirectoryProfile,
  PropertyInquiry,
  VisitBooking,
} from "@/types";

export interface AppContextType {
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
  propertiesLoading: boolean;
  propertiesError: string | null;
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
  directoryProfiles: DirectoryProfile[];
  directoryProfilesReady: boolean;
  directoryProfilesError: string | null;
  refreshDirectoryProfiles: () => Promise<void>;
  setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>>;
  addDirectoryProfile: (profile: Omit<DirectoryProfile, "id">) => Promise<DirectoryProfile>;
  updateDirectoryProfile: (id: string, updates: Partial<DirectoryProfile>) => Promise<DirectoryProfile>;
  deleteDirectoryProfile: (id: string) => Promise<void>;
  isLoggedIn: boolean;
  userEmail: string;
  userRole: "user" | "broker" | "admin" | null;
  userName: string;
  userProfile: UserProfile | null;
  updateProfile: (input: {
    name?: string;
    phone?: string | null;
    bio?: string | null;
    city?: string | null;
    avatarUrl?: string | null;
  }) => Promise<UserProfile>;
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
  adminUsers: AdminUser[];
  setAdminUsers: React.Dispatch<React.SetStateAction<AdminUser[]>>;

  logout: () => Promise<void>;
  sessionReady: boolean;
}
