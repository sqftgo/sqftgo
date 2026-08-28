import type { DirectoryProfile } from "@/types";

/** Agents / consultants shown on the public `/dealers` directory. */
export const AGENT_DEALER_CATEGORIES = [
  "Agent & Broker",
  "Property Consultant",
] as const;

/** Public + admin dealer directory (agents, consultants, builders). */
export const DEALER_CATEGORIES = [
  ...AGENT_DEALER_CATEGORIES,
  "Builder & Developer",
] as const;

export type DealerCategory = (typeof DEALER_CATEGORIES)[number];

export function isAgentOrConsultantCategory(
  category: DirectoryProfile["category"] | string
): boolean {
  return (AGENT_DEALER_CATEGORIES as readonly string[]).includes(category);
}

export function isDealerCategory(
  category: DirectoryProfile["category"] | string
): boolean {
  return (DEALER_CATEGORIES as readonly string[]).includes(category);
}

/** Service directory: non-dealer trades (excludes agents, consultants, builders). */
export function isServiceDirectoryCategory(
  category: DirectoryProfile["category"] | string
): boolean {
  return !isDealerCategory(category);
}
