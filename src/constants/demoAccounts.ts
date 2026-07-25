export type DemoRole = "user" | "broker";

export interface DemoAccount {
  email: string;
  passwords: readonly string[];
  role: DemoRole;
  name: string;
}

/** Public demo autocomplete accounts only — admin is seeded, never listed here. */
export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "broker@sqftgo.com",
    passwords: ["broker2026"],
    role: "broker",
    name: "Rajesh Mehta",
  },
  {
    email: "user@sqftgo.com",
    passwords: ["user2026"],
    role: "user",
    name: "Arjun Sharma",
  },
] as const;

export const SESSION_STORAGE_KEY = "sv_mock_session";

export function findDemoAccount(email: string, password: string): DemoAccount | null {
  const normalized = email.trim().toLowerCase();
  const account = DEMO_ACCOUNTS.find((a) => a.email.toLowerCase() === normalized);
  if (!account) return null;
  if (!account.passwords.includes(password)) return null;
  return account;
}
