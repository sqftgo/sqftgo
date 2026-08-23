export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "user" | "broker" | "admin";
export type ProfileStatus = "active" | "suspended";

export type PropertyTypeDb =
  | "Home"
  | "Villa"
  | "Hotel"
  | "Agricultural Land"
  | "Apartment"
  | "Office Space"
  | "Commercial Space"
  | "Shop"
  | "Industrial Plot";

export type PropertyPurposeDb = "buy" | "sell" | "rent" | "lease";
export type FurnishedStatusDb = "Furnished" | "Semi-Furnished" | "Unfurnished";
export type PropertyStatusDb =
  | "draft"
  | "pending_review"
  | "active"
  | "sold"
  | "rented"
  | "rejected";

export type ProjectStatusDb =
  | "draft"
  | "pending_review"
  | "active"
  | "sold"
  | "rejected";

export type ProjectLifecycleDb = "upcoming" | "under_construction" | "ready";

export type ProjectOwnershipRoleDb = "owner" | "builder" | "marketing_partner";

export type ProjectRow = {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  city: string;
  state: string | null;
  country: string | null;
  locality: string;
  ownership_role: ProjectOwnershipRoleDb;
  lifecycle: ProjectLifecycleDb;
  property_types: string[];
  configurations: string[];
  price_from: number | string | null;
  price_to: number | string | null;
  size_from: number | string | null;
  size_to: number | string | null;
  amenities: string[];
  images: string[];
  contact_name: string;
  contact_phone: string;
  rera_id: string | null;
  rera_approved: boolean;
  possession_date: string | null;
  launch_date: string | null;
  status: ProjectStatusDb;
  rejection_reason: string | null;
  featured: boolean;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
};

export type ProjectInsert = {
  id?: string;
  owner_id: string;
  title: string;
  description?: string;
  city: string;
  state?: string | null;
  country?: string | null;
  locality?: string;
  ownership_role?: ProjectOwnershipRoleDb;
  lifecycle?: ProjectLifecycleDb;
  property_types?: string[];
  configurations?: string[];
  price_from?: number | null;
  price_to?: number | null;
  size_from?: number | null;
  size_to?: number | null;
  amenities?: string[];
  images?: string[];
  contact_name?: string;
  contact_phone?: string;
  rera_id?: string | null;
  rera_approved?: boolean;
  possession_date?: string | null;
  launch_date?: string | null;
  status?: ProjectStatusDb;
  rejection_reason?: string | null;
  featured?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ProjectUpdate = Partial<ProjectInsert>;

export type InquiryStatusDb = "new" | "read" | "archived";

export type DirectoryCategoryDb =
  | "Agent & Broker"
  | "Builder & Developer"
  | "Interior Decorator"
  | "Architect"
  | "Building Contractor"
  | "Property Consultant"
  | "Vastu Consultant"
  | "Home Valuation/Inspection"
  | "Home Shifting/Deep Cleaning";

export type AssistanceStatusDb =
  | "Received"
  | "Assigned to Agent"
  | "Properties Suggested";

export type ProfileRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
  city: string | null;
  role: AppRole;
  status: ProfileStatus;
  created_at: string;
  updated_at: string;
};

export type ProfileInsert = {
  id: string;
  email: string;
  name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  role?: AppRole;
  status?: ProfileStatus;
  created_at?: string;
  updated_at?: string;
};

export type ProfileUpdate = {
  id?: string;
  email?: string;
  name?: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  city?: string | null;
  role?: AppRole;
  status?: ProfileStatus;
  created_at?: string;
  updated_at?: string;
};

export type PropertyRow = {
  id: string;
  owner_id: string;
  title: string;
  price: number | string;
  type: PropertyTypeDb;
  purpose: PropertyPurposeDb;
  bhk: number | null;
  bathrooms: number | null;
  parking: number | null;
  year_built: number | null;
  city: string;
  state: string | null;
  country: string | null;
  locality: string;
  nearby_hospital: string | null;
  nearby_school: string | null;
  nearby_transportation: string | null;
  size: number | string;
  furnished: FurnishedStatusDb;
  description: string;
  amenities: string[];
  images: string[];
  video_url: string | null;
  owner_name: string;
  owner_phone: string;
  owner_email: string | null;
  inquiry_count: number;
  status: PropertyStatusDb;
  rejection_reason: string | null;
  featured: boolean;
  rera_approved: boolean;
  rera_id: string | null;
  verified_date: string | null;
  seo_title: string | null;
  seo_description: string | null;
  verification_checks: Json | null;
  price_breakdown: Json | null;
  project_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type PropertyInsert = {
  id?: string;
  owner_id: string;
  title: string;
  price: number;
  type: PropertyTypeDb;
  purpose: PropertyPurposeDb;
  bhk?: number | null;
  bathrooms?: number | null;
  parking?: number | null;
  year_built?: number | null;
  city: string;
  state?: string | null;
  country?: string | null;
  locality: string;
  nearby_hospital?: string | null;
  nearby_school?: string | null;
  nearby_transportation?: string | null;
  size: number;
  furnished?: FurnishedStatusDb;
  description?: string;
  amenities?: string[];
  images?: string[];
  video_url?: string | null;
  owner_name: string;
  owner_phone: string;
  owner_email?: string | null;
  inquiry_count?: number;
  status?: PropertyStatusDb;
  rejection_reason?: string | null;
  featured?: boolean;
  rera_approved?: boolean;
  rera_id?: string | null;
  verified_date?: string | null;
  seo_title?: string | null;
  seo_description?: string | null;
  verification_checks?: Json | null;
  price_breakdown?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type PropertyUpdate = Partial<PropertyInsert>;

export type PropertyInquiryRow = {
  id: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatusDb;
  created_at: string;
  updated_at: string;
};

export type PropertyInquiryInsert = {
  id?: string;
  property_id: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  status?: InquiryStatusDb;
  created_at?: string;
  updated_at?: string;
};

export type PropertyInquiryUpdate = Partial<PropertyInquiryInsert>;

export type DirectoryProfileRow = {
  id: string;
  user_id: string | null;
  firm_name: string;
  owner_name: string;
  category: DirectoryCategoryDb;
  city: string;
  address: string;
  email: string;
  website: string;
  mobile: string;
  description: string;
  rera_id: string | null;
  experience: string | null;
  specialties: string[];
  team_size: number | null;
  listings_count: number;
  created_at: string;
  updated_at: string;
};

export type DirectoryProfileInsert = {
  id?: string;
  user_id?: string | null;
  firm_name: string;
  owner_name: string;
  category: DirectoryCategoryDb;
  city: string;
  address?: string;
  email: string;
  website?: string;
  mobile: string;
  description?: string;
  rera_id?: string | null;
  experience?: string | null;
  specialties?: string[];
  team_size?: number | null;
  listings_count?: number;
  created_at?: string;
  updated_at?: string;
};

export type DirectoryProfileUpdate = Partial<DirectoryProfileInsert>;

export type AssistanceRequestRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  areas: string[];
  bhk: string;
  family_size: number;
  move_in_date: string;
  notes: string;
  status: AssistanceStatusDb;
  created_at: string;
  updated_at: string;
};

export type AssistanceRequestInsert = {
  id?: string;
  name: string;
  email: string;
  phone: string;
  budget?: string;
  areas?: string[];
  bhk?: string;
  family_size?: number;
  move_in_date?: string;
  notes?: string;
  status?: AssistanceStatusDb;
  created_at?: string;
  updated_at?: string;
};

export type AssistanceRequestUpdate = Partial<AssistanceRequestInsert>;

export type GeneralEnquiryRow = {
  id: string;
  name: string;
  city: string;
  property_type: string;
  budget: string;
  email: string;
  mobile: string;
  remarks: string;
  message: string | null;
  payload: Json | null;
  created_at: string;
  updated_at: string;
};

export type GeneralEnquiryInsert = {
  id?: string;
  name: string;
  city?: string;
  property_type?: string;
  budget?: string;
  email: string;
  mobile: string;
  remarks?: string;
  message?: string | null;
  payload?: Json | null;
  created_at?: string;
  updated_at?: string;
};

export type GeneralEnquiryUpdate = Partial<GeneralEnquiryInsert>;

export type NotificationTypeDb = "info" | "success" | "warning" | "error";
export type NotificationForRoleDb = "user" | "broker" | "admin" | "all";

export type NotificationRow = {
  id: string;
  user_id: string;
  for_role: NotificationForRoleDb;
  title: string;
  message: string;
  type: NotificationTypeDb;
  read: boolean;
  event_key: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
  updated_at: string;
};

export type NotificationInsert = {
  id?: string;
  user_id: string;
  for_role?: NotificationForRoleDb;
  title: string;
  message: string;
  type?: NotificationTypeDb;
  read?: boolean;
  event_key?: string | null;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type NotificationUpdate = Partial<
  Pick<NotificationInsert, "read" | "title" | "message" | "type" | "for_role">
>;

export type VisitStatusDb = "pending" | "confirmed" | "completed" | "cancelled";

export type SiteVisitRow = {
  id: string;
  property_id: string;
  user_id: string | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  status: VisitStatusDb;
  notes: string | null;
  broker_notes: string | null;
  cancelled_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export type SiteVisitInsert = {
  id?: string;
  property_id: string;
  user_id?: string | null;
  visitor_name: string;
  visitor_email: string;
  visitor_phone: string;
  scheduled_date: string;
  scheduled_time: string;
  status?: VisitStatusDb;
  notes?: string | null;
  broker_notes?: string | null;
  cancelled_at?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type SiteVisitUpdate = Partial<SiteVisitInsert>;

export type CategoryRow = {
  id: string;
  name: string;
  icon: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type CategoryInsert = {
  id?: string;
  name: string;
  icon?: string;
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type CategoryUpdate = Partial<CategoryInsert>;

export type LocationRow = {
  id: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type LocationInsert = {
  id?: string;
  city: string;
  state: string;
  country?: string;
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type LocationUpdate = Partial<LocationInsert>;

export type AmenityRow = {
  id: string;
  name: string;
  active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type AmenityInsert = {
  id?: string;
  name: string;
  active?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type AmenityUpdate = Partial<AmenityInsert>;

export type ListingFilterKindDb =
  | "purpose"
  | "city"
  | "locality"
  | "type"
  | "bhk"
  | "furnishing"
  | "price"
  | "size"
  | "amenities"
  | "rera"
  | "featured"
  | "text"
  | "toggle"
  | "multi";

export type ListingFilterRow = {
  id: string;
  key: string;
  label: string;
  kind: ListingFilterKindDb;
  property_field: string | null;
  catalog: "cities" | "categories" | "amenities" | null;
  options: Json;
  active: boolean;
  system: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ListingFilterInsert = {
  id?: string;
  key: string;
  label: string;
  kind: ListingFilterKindDb;
  property_field?: string | null;
  catalog?: "cities" | "categories" | "amenities" | null;
  options?: Json;
  active?: boolean;
  system?: boolean;
  sort_order?: number;
  created_at?: string;
  updated_at?: string;
};

export type ListingFilterUpdate = Partial<ListingFilterInsert>;

export type ActivityLogRow = {
  id: string;
  action: string;
  performed_by: string;
  actor_id: string | null;
  role: string;
  target: string;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string;
};

export type ActivityLogInsert = {
  id?: string;
  action: string;
  performed_by: string;
  actor_id?: string | null;
  role: string;
  target?: string;
  entity_type?: string | null;
  entity_id?: string | null;
  created_at?: string;
};

export type MessageThreadKindDb = "direct" | "support";
export type MessageThreadStatusDb = "open" | "resolved" | "archived";

export type MessageThreadRow = {
  id: string;
  subject: string;
  created_by: string;
  participant_ids: string[];
  property_id: string | null;
  kind: MessageThreadKindDb;
  status: MessageThreadStatusDb;
  last_message_at: string;
  last_message_preview: string;
  created_at: string;
  updated_at: string;
};

export type MessageThreadInsert = {
  id?: string;
  subject: string;
  created_by: string;
  participant_ids: string[];
  property_id?: string | null;
  kind?: MessageThreadKindDb;
  status?: MessageThreadStatusDb;
  last_message_at?: string;
  last_message_preview?: string;
  created_at?: string;
  updated_at?: string;
};

export type MessageThreadUpdate = Partial<MessageThreadInsert>;

export type MessageRow = {
  id: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at: string;
};

export type MessageInsert = {
  id?: string;
  thread_id: string;
  sender_id: string;
  body: string;
  created_at?: string;
};

export type MessageThreadReadRow = {
  thread_id: string;
  user_id: string;
  last_read_at: string;
};

export type UserFavoriteRow = {
  user_id: string;
  property_id: string;
  created_at: string;
};

export type UserFavoriteInsert = {
  user_id: string;
  property_id: string;
  created_at?: string;
};

export type KycStatusDb = "draft" | "pending" | "approved" | "rejected";

export type PlatformSettingsRow = {
  id: number;
  site_name: string;
  tagline: string;
  support_email: string | null;
  support_phone: string | null;
  maintenance_mode: boolean;
  require_listing_approval: boolean;
  max_listings_per_dealer: number | null;
  currency_code: string;
  analytics_measurement_id: string | null;
  updated_at: string;
  updated_by: string | null;
};

export type PlatformSettingsUpdate = {
  site_name?: string;
  tagline?: string;
  support_email?: string | null;
  support_phone?: string | null;
  maintenance_mode?: boolean;
  require_listing_approval?: boolean;
  max_listings_per_dealer?: number | null;
  currency_code?: string;
  analytics_measurement_id?: string | null;
  updated_at?: string;
  updated_by?: string | null;
};

export type DealerKycRow = {
  id: string;
  user_id: string;
  directory_profile_id: string | null;
  pan_number: string | null;
  aadhaar_last4: string | null;
  status: KycStatusDb;
  dealer_notes: string;
  admin_notes: string;
  rejection_reason: string | null;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
};

export type DealerKycInsert = {
  id?: string;
  user_id: string;
  directory_profile_id?: string | null;
  pan_number?: string | null;
  aadhaar_last4?: string | null;
  status?: KycStatusDb;
  dealer_notes?: string;
  admin_notes?: string;
  rejection_reason?: string | null;
  submitted_at?: string | null;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type DealerKycUpdate = Partial<DealerKycInsert>;

export type DealerKycDocumentRow = {
  id: string;
  kyc_id: string;
  doc_type: string;
  storage_path: string;
  file_name: string;
  created_at: string;
};

export type DealerKycDocumentInsert = {
  id?: string;
  kyc_id: string;
  doc_type: string;
  storage_path: string;
  file_name?: string;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      properties: {
        Row: PropertyRow;
        Insert: PropertyInsert;
        Update: PropertyUpdate;
        Relationships: [
          {
            foreignKeyName: "properties_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      projects: {
        Row: ProjectRow;
        Insert: ProjectInsert;
        Update: ProjectUpdate;
        Relationships: [
          {
            foreignKeyName: "projects_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      property_inquiries: {
        Row: PropertyInquiryRow;
        Insert: PropertyInquiryInsert;
        Update: PropertyInquiryUpdate;
        Relationships: [
          {
            foreignKeyName: "property_inquiries_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      directory_profiles: {
        Row: DirectoryProfileRow;
        Insert: DirectoryProfileInsert;
        Update: DirectoryProfileUpdate;
        Relationships: [
          {
            foreignKeyName: "directory_profiles_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      assistance_requests: {
        Row: AssistanceRequestRow;
        Insert: AssistanceRequestInsert;
        Update: AssistanceRequestUpdate;
        Relationships: [];
      };
      general_enquiries: {
        Row: GeneralEnquiryRow;
        Insert: GeneralEnquiryInsert;
        Update: GeneralEnquiryUpdate;
        Relationships: [];
      };
      notifications: {
        Row: NotificationRow;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_favorites: {
        Row: UserFavoriteRow;
        Insert: UserFavoriteInsert;
        Update: Partial<UserFavoriteInsert>;
        Relationships: [
          {
            foreignKeyName: "user_favorites_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_favorites_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
        ];
      };
      site_visits: {
        Row: SiteVisitRow;
        Insert: SiteVisitInsert;
        Update: SiteVisitUpdate;
        Relationships: [
          {
            foreignKeyName: "site_visits_property_id_fkey";
            columns: ["property_id"];
            isOneToOne: false;
            referencedRelation: "properties";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "site_visits_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      message_threads: {
        Row: MessageThreadRow;
        Insert: MessageThreadInsert;
        Update: MessageThreadUpdate;
        Relationships: [
          {
            foreignKeyName: "message_threads_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      messages: {
        Row: MessageRow;
        Insert: MessageInsert;
        Update: Partial<MessageInsert>;
        Relationships: [
          {
            foreignKeyName: "messages_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "message_threads";
            referencedColumns: ["id"];
          },
        ];
      };
      message_thread_reads: {
        Row: MessageThreadReadRow;
        Insert: MessageThreadReadRow;
        Update: Partial<MessageThreadReadRow>;
        Relationships: [];
      };
      categories: {
        Row: CategoryRow;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      locations: {
        Row: LocationRow;
        Insert: LocationInsert;
        Update: LocationUpdate;
        Relationships: [];
      };
      amenities: {
        Row: AmenityRow;
        Insert: AmenityInsert;
        Update: AmenityUpdate;
        Relationships: [];
      };
      listing_filters: {
        Row: ListingFilterRow;
        Insert: ListingFilterInsert;
        Update: ListingFilterUpdate;
        Relationships: [];
      };
      activity_logs: {
        Row: ActivityLogRow;
        Insert: ActivityLogInsert;
        Update: never;
        Relationships: [
          {
            foreignKeyName: "activity_logs_actor_id_fkey";
            columns: ["actor_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      platform_settings: {
        Row: PlatformSettingsRow;
        Insert: Partial<PlatformSettingsRow> & { id?: number };
        Update: PlatformSettingsUpdate;
        Relationships: [];
      };
      dealer_kyc: {
        Row: DealerKycRow;
        Insert: DealerKycInsert;
        Update: DealerKycUpdate;
        Relationships: [
          {
            foreignKeyName: "dealer_kyc_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      dealer_kyc_documents: {
        Row: DealerKycDocumentRow;
        Insert: DealerKycDocumentInsert;
        Update: Partial<DealerKycDocumentInsert>;
        Relationships: [
          {
            foreignKeyName: "dealer_kyc_documents_kyc_id_fkey";
            columns: ["kyc_id"];
            isOneToOne: false;
            referencedRelation: "dealer_kyc";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_admin: { Args: Record<string, never>; Returns: boolean };
      is_broker: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      app_role: AppRole;
      profile_status: ProfileStatus;
      property_type: PropertyTypeDb;
      property_purpose: PropertyPurposeDb;
      furnished_status: FurnishedStatusDb;
      property_status: PropertyStatusDb;
      inquiry_status: InquiryStatusDb;
      directory_category: DirectoryCategoryDb;
      assistance_status: AssistanceStatusDb;
      notification_type: NotificationTypeDb;
      notification_for_role: NotificationForRoleDb;
      visit_status: VisitStatusDb;
      message_thread_kind: MessageThreadKindDb;
      message_thread_status: MessageThreadStatusDb;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
