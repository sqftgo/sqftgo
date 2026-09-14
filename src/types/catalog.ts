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

export type DirectoryVerificationStatus =
  | "unverified"
  | "pending"
  | "verified"
  | "rejected";

export interface ServiceType {
  id: string;
  name: string;
  description: string;
  icon: string;
  active: boolean;
  sortOrder: number;
}

export interface DirectoryProfile {
  id: string;
  /** Linked auth/profiles id when the directory card is claimed. */
  userId?: string | null;
  firmName: string;
  ownerName: string;
  /** Dealer enum-legacy values or service type name. */
  category: string;
  serviceTypeId?: string | null;
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
  verificationStatus?: DirectoryVerificationStatus;
  listingActive?: boolean;
  lat?: number | null;
  lng?: number | null;
  coverImageUrl?: string | null;
  logoUrl?: string | null;
  businessHours?: Record<string, string> | null;
  servicesOffered?: string[];
}

export type ServiceBookingStatus = "pending" | "confirmed" | "cancelled" | "completed";

export interface ServiceBooking {
  id: string;
  directoryProfileId: string;
  userId: string;
  preferredAt: string;
  message: string;
  contactPhone: string;
  status: ServiceBookingStatus;
  ownerNotes: string;
  createdAt: string;
  /** Optional join fields for UI */
  firmName?: string;
  city?: string;
}

export type ServiceVerificationStatus = "draft" | "pending" | "approved" | "rejected";

export interface ServiceVerificationDocument {
  id: string;
  verificationId: string;
  docType: "business_license" | "gst_certificate" | "owner_id" | "other";
  storagePath: string;
  fileName: string;
  createdAt: string;
}

export interface ServiceVerification {
  id: string;
  directoryProfileId: string;
  userId: string;
  status: ServiceVerificationStatus;
  businessRegistrationId?: string | null;
  ownerNotes: string;
  adminNotes: string;
  rejectionReason?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  documents?: ServiceVerificationDocument[];
  firmName?: string;
  ownerName?: string;
  city?: string;
  category?: string;
}
