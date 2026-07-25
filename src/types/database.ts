export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "user" | "broker" | "admin";
export type ProfileStatus = "active" | "suspended";

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
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      app_role: AppRole;
      profile_status: ProfileStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};
