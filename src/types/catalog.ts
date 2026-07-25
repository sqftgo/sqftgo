export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  date: string;
  forRole: "user" | "broker" | "admin" | "all";
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  active: boolean;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
  propertyCount: number;
}

export interface Amenity {
  id: string;
  name: string;
  active: boolean;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  target: string;
  timestamp: string;
}

export interface DirectoryProfile {
  id: string;
  /** Linked auth/profiles id when the directory card is claimed. */
  userId?: string | null;
  firmName: string;
  ownerName: string;
  category: "Agent & Broker" | "Builder & Developer" | "Interior Decorator" | "Architect" | "Building Contractor" | "Property Consultant" | "Vastu Consultant" | "Home Valuation/Inspection" | "Home Shifting/Deep Cleaning";
  city: string;
  address: string;
  email: string;
  website: string;
  mobile: string;
  description: string;
  reraId?: string;
  experience?: string;
  specialties?: string[];
  teamSize?: number;
  listingsCount?: number;
}
