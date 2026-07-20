import type { Notification, Category, Location, ActivityLog } from "@/types/catalog";
import type { MockUser } from "@/types/user";

export const initialNotifications: Notification[] = [
    { id: "notif-1", title: "Welcome to Sun Valley", message: "Your account has been set up successfully.", type: "success", read: false, date: "2026-07-16", forRole: "all" },
    { id: "notif-2", title: "New Inquiry Received", message: "Suresh Mehta submitted an inquiry on Ultra Luxury Lake-Facing Villa.", type: "info", read: false, date: "2026-07-15", forRole: "broker" },
    { id: "notif-3", title: "Property Approved", message: "Your listing 'Luxury Haveli in Jodhpur' has been approved by the admin.", type: "success", read: true, date: "2026-07-14", forRole: "broker" },
    { id: "notif-4", title: "Pending Approval", message: "2 properties are waiting for admin review.", type: "warning", read: false, date: "2026-07-16", forRole: "admin" },
  ];

export const initialCategories: Category[] = [
    { id: "cat-1", name: "Villa", icon: "🏡", count: 0, active: true },
    { id: "cat-2", name: "Apartment", icon: "🏢", count: 0, active: true },
    { id: "cat-3", name: "Home", icon: "🏠", count: 0, active: true },
    { id: "cat-4", name: "Office Space", icon: "🏗️", count: 0, active: true },
    { id: "cat-5", name: "Shop", icon: "🏪", count: 0, active: true },
    { id: "cat-6", name: "Agricultural Land", icon: "🌾", count: 0, active: true },
    { id: "cat-7", name: "Hotel", icon: "🏨", count: 0, active: true },
    { id: "cat-8", name: "Industrial Plot", icon: "🏭", count: 0, active: false },
  ];

export const initialLocations: Location[] = [
    { id: "loc-1", city: "Udaipur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-2", city: "Jaipur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-3", city: "Jodhpur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-4", city: "Jaisalmer", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-5", city: "Kota", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-6", city: "Ahmedabad", state: "Gujarat", country: "India", active: true, propertyCount: 0 },
    { id: "loc-7", city: "Surat", state: "Gujarat", country: "India", active: true, propertyCount: 0 },
    { id: "loc-8", city: "Shimla", state: "Himachal Pradesh", country: "India", active: false, propertyCount: 0 },
  ];

export const initialActivityLogs: ActivityLog[] = [
    { id: "log-1", action: "Property Approved", performedBy: "admin@svrepl.com", role: "Admin", target: "prop-1 — Ultra Luxury Lake-Facing Villa", timestamp: "2026-07-16 14:32:00" },
    { id: "log-2", action: "User Role Changed", performedBy: "admin@svrepl.com", role: "Admin", target: "broker@svrepl.com → broker", timestamp: "2026-07-15 10:15:00" },
    { id: "log-3", action: "New Dealer Registered", performedBy: "vikram@mewarproperty.in", role: "Broker", target: "Mewar Property Consultants", timestamp: "2026-07-14 09:45:00" },
    { id: "log-4", action: "Property Deleted", performedBy: "admin@svrepl.com", role: "Admin", target: "prop-draft-001", timestamp: "2026-07-13 16:22:00" },
    { id: "log-5", action: "Inquiry Submitted", performedBy: "user@svrepl.com", role: "User", target: "prop-2 — Premium 3 BHK Flat in C-Scheme", timestamp: "2026-07-12 11:05:00" },
  ];

export const initialMockUsers: MockUser[] = [
    { id: "usr-1", name: "Arjun Sharma", email: "user@svrepl.com", role: "user", status: "active", joinedDate: "2026-01-15", inquiriesCount: 4 },
    { id: "usr-2", name: "Priya Nair", email: "priya@gmail.com", role: "user", status: "active", joinedDate: "2026-02-20", inquiriesCount: 2 },
    { id: "usr-3", name: "Sanjay Gupta", email: "sanjay@outlook.com", role: "user", status: "suspended", joinedDate: "2026-03-05", inquiriesCount: 0 },
    { id: "usr-4", name: "Rajesh Mehta", email: "broker@svrepl.com", role: "broker", status: "active", joinedDate: "2025-11-10", inquiriesCount: 0 },
    { id: "usr-5", name: "Vikram Singh", email: "vikram@mewarproperty.in", role: "broker", status: "active", joinedDate: "2025-09-01", inquiriesCount: 0 },
    { id: "usr-6", name: "Admin User", email: "admin@svrepl.com", role: "admin", status: "active", joinedDate: "2025-06-01", inquiriesCount: 0 },
  ];
