export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  date: string;
  forRole: "user" | "broker" | "admin" | "all";
  entityType?: string;
  entityId?: string;
  createdAt?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  imageUrl?: string | null;
  count: number;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  slug: string;
  active: boolean;
  propertyCount: number;
  sortOrder: number;
  /** Admin-managed cover; preferred by cityCoverImage() app-wide. */
  coverImageUrl?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface Amenity {
  id: string;
  name: string;
  description: string;
  icon: string;
  category?: string | null;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
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
  slug: string;
  description: string;
  icon: string;
  imageUrl?: string | null;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type DirectorySocialLinks = {
  facebook?: string;
  instagram?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
  whatsapp?: string;
};

export interface DirectoryProfile {
  id: string;
  /** Linked auth/profiles id when the directory card is claimed. */
  userId?: string | null;
  /** SEO-friendly public path segment (`/services/{slug}`). */
  slug?: string | null;
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
  /** Short hero introduction; falls back to description when empty. */
  intro?: string;
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
  socialLinks?: DirectorySocialLinks;
  /** True when premium website promotion is currently active (server-enriched). */
  websitePromotionActive?: boolean;
  averageRating?: number | null;
  reviewCount?: number;
}

export interface ServicePortfolioImage {
  id: string;
  directoryProfileId: string;
  imageUrl: string;
  caption: string;
  sortOrder: number;
  createdAt?: string;
}

export interface ServiceReview {
  id: string;
  directoryProfileId: string;
  userId: string;
  rating: number;
  title: string;
  body: string;
  status: "published" | "hidden" | "pending";
  createdAt: string;
  updatedAt?: string;
  reviewerName?: string;
}

export type WebsitePromotionBillingType = "one_time" | "recurring";
export type WebsitePromotionStatus =
  | "inactive"
  | "pending"
  | "active"
  | "expired"
  | "cancelled";

export interface ServiceWebsitePromotionPlan {
  id: string;
  slug: string;
  name: string;
  description: string;
  pricePaise: number;
  currency: string;
  billingType: WebsitePromotionBillingType;
  durationDays: number;
  isActive: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceWebsitePromotion {
  id: string;
  directoryProfileId: string;
  userId: string;
  planId: string | null;
  status: WebsitePromotionStatus;
  startsAt: string | null;
  expiresAt: string | null;
  websiteUrl: string;
  adminNotes?: string;
  lastPaymentId?: string | null;
  isActive: boolean;
  plan?: ServiceWebsitePromotionPlan | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ServiceWebsitePromotionPayment {
  id: string;
  directoryProfileId: string;
  userId: string;
  planId: string | null;
  amountPaise: number;
  currency: string;
  status: "created" | "paid" | "failed" | "refunded";
  razorpayOrderId?: string | null;
  razorpayPaymentId?: string | null;
  receipt?: string | null;
  paidAt?: string | null;
  createdAt: string;
  planName?: string;
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
