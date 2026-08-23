export type AuthRole = "user" | "broker" | "admin";

export type ListerStatus = "none" | "pending" | "approved" | "rejected";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  role: AuthRole;
  joinedDate: string;
  listingStatus?: ListerStatus;
  listingVerifiedAt?: string | null;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: "active" | "suspended";
  joinedDate: string;
  inquiriesCount: number;
  listingStatus?: ListerStatus;
  listingVerifiedAt?: string | null;
}

/** @deprecated Use AdminUser */
export type MockUser = AdminUser;
