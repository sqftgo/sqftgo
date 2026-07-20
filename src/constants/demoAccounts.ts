export type DemoRole = "user" | "broker" | "admin";

export interface DemoAccount {
  email: string;
  passwords: readonly string[];
  role: DemoRole;
  name: string;
}

export const DEMO_ACCOUNTS: readonly DemoAccount[] = [
  {
    email: "admin@svrepl.com",
    passwords: ["admin2026", "admin123"],
    role: "admin",
    name: "Super Admin",
  },
  {
    email: "broker@svrepl.com",
    passwords: ["broker2026", "broker123"],
    role: "broker",
    name: "Rajesh Mehta",
  },
  {
    email: "user@svrepl.com",
    passwords: ["user2026", "user123"],
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
