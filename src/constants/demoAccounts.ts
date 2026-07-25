export type DemoRole = "user" | "broker";

export interface DemoAccount {
  email: string;
  role: DemoRole;
  name: string;
}

/** Public demo autocomplete accounts only — admin is seeded, never listed here. */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "broker@sqftgo.com",
    role: "broker",
    name: "Rajesh Mehta",
  },
  {
    email: "user@sqftgo.com",
    role: "user",
    name: "Arjun Sharma",
  },
] as const;

/** Persists non-auth UI prefs (city, favorites). Auth always comes from Supabase cookies. */
export const SESSION_STORAGE_KEY = "sv_ui_prefs";
