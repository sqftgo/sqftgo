import type {
  Property,
  PropertyInquiry,
  AssistanceRequest,
  GeneralEnquiry,
  CustomerReview,
  DirectoryProfile,
  Notification,
  Category,
  Location,
  ActivityLog,
  MockUser,
  UserProfile,
} from "@/types";
import {
  initialProperties,
  initialAssistanceRequests,
  initialInquiries,
  initialEnquiries,
  initialReviews,
  directoryProfiles as seedDirectory,
  initialNotifications,
  initialCategories,
  initialLocations,
  initialActivityLogs,
  initialMockUsers,
} from "@/data";

export interface MessageThread {
  id: string;
  subject: string;
  participants: string[];
  lastMessage: string;
  date: string;
  unread: boolean;
  forRole: "broker" | "admin" | "user";
}

export interface VisitBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  date: string;
  time: string;
  status: "Scheduled" | "Completed" | "Cancelled";
  address: string;
}

export interface AppStore {
  properties: Property[];
  inquiries: Record<string, PropertyInquiry[]>;
  assistanceRequests: AssistanceRequest[];
  enquiries: GeneralEnquiry[];
  reviews: CustomerReview[];
  directoryProfiles: DirectoryProfile[];
  notifications: Notification[];
  categories: Category[];
  locations: Location[];
  activityLogs: ActivityLog[];
  mockUsers: MockUser[];
  messages: MessageThread[];
  visits: VisitBooking[];
}

function createInitialStore(): AppStore {
  return {
    properties: structuredClone(initialProperties),
    inquiries: structuredClone(initialInquiries),
    assistanceRequests: structuredClone(initialAssistanceRequests),
    enquiries: structuredClone(initialEnquiries),
    reviews: structuredClone(initialReviews),
    directoryProfiles: structuredClone(seedDirectory),
    notifications: structuredClone(initialNotifications),
    categories: structuredClone(initialCategories),
    locations: structuredClone(initialLocations),
    activityLogs: structuredClone(initialActivityLogs),
    mockUsers: structuredClone(initialMockUsers),
    messages: [
      {
        id: "msg-1",
        subject: "Site visit for Lake Villa",
        participants: ["Suresh Patidar", "Rajesh Mehta"],
        lastMessage: "Sunday 11am works for me.",
        date: "2026-07-15",
        unread: true,
        forRole: "broker",
      },
      {
        id: "msg-2",
        subject: "Lease terms clarification",
        participants: ["Ramesh Kumar", "Rajesh Mehta"],
        lastMessage: "Please share the security deposit terms.",
        date: "2026-07-14",
        unread: false,
        forRole: "broker",
      },
      {
        id: "msg-3",
        subject: "Support: Listing approval delay",
        participants: ["Admin Support", "Lake City Brokerage"],
        lastMessage: "We are reviewing your documents.",
        date: "2026-07-16",
        unread: true,
        forRole: "admin",
      },
    ],
    visits: [
      {
        id: "visit-1",
        propertyId: "prop-1",
        propertyTitle: "Ultra Luxury Lake-Facing Villa",
        date: "2026-07-22",
        time: "11:00 AM",
        status: "Scheduled",
        address: "Lake Palace Road, Udaipur",
      },
      {
        id: "visit-2",
        propertyId: "prop-2",
        propertyTitle: "Premium 3 BHK Flat in C-Scheme",
        date: "2026-07-18",
        time: "4:00 PM",
        status: "Completed",
        address: "C-Scheme, Jaipur",
      },
    ],
  };
}

let store = createInitialStore();

type Listener = () => void;
const listeners = new Set<Listener>();

export function getStore(): AppStore {
  return store;
}

export function replaceStore(next: AppStore) {
  store = next;
  listeners.forEach((l) => l());
}

export function patchStore(partial: Partial<AppStore>) {
  store = { ...store, ...partial };
  listeners.forEach((l) => l());
}

export function subscribeStore(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetStore() {
  store = createInitialStore();
  listeners.forEach((l) => l());
}

export type SessionSnapshot = {
  isLoggedIn: boolean;
  userEmail: string;
  userRole: "user" | "broker" | "admin" | null;
  userName: string;
  userProfile: UserProfile | null;
  favorites: string[];
  compareList: string[];
  selectedCity: string;
};
