export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  city?: string;
  role: "user" | "broker" | "admin";
  joinedDate: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "broker" | "admin";
  status: "active" | "suspended";
  joinedDate: string;
  inquiriesCount: number;
}
