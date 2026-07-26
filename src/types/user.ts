export type AuthRole = "user" | "broker" | "admin";

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
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  status: "active" | "suspended";
  joinedDate: string;
  inquiriesCount: number;
}
