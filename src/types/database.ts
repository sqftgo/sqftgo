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
  | "rented";

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

export type ProfileRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatar_url: string | null;
  bio: string | null;
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
  featured: boolean;
  rera_approved: boolean;
  rera_id: string | null;
  verified_date: string | null;
  seo_title: string | null;
  seo_description: string | null;
  verification_checks: Json | null;
  price_breakdown: Json | null;
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
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
