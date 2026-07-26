/**
 * Extracts foundation files from AppContext.tsx without modifying it.
 * Creates: types, constants, lib, data, mocks
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const CTX = path.join(ROOT, "src/context/AppContext.tsx");
const CARD = path.join(ROOT, "src/components/ui/PropertyCard.tsx");
const FILTER = path.join(ROOT, "src/components/ui/FilterPanel.tsx");

const src = fs.readFileSync(CTX, "utf8");
const filterSrc = fs.readFileSync(FILTER, "utf8");
const cardSrc = fs.readFileSync(CARD, "utf8");

function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function write(rel, content) {
  const full = path.join(ROOT, rel);
  ensureDir(path.dirname(full));
  fs.writeFileSync(full, content.replace(/\r\n/g, "\n"), "utf8");
  console.log("wrote", rel);
}

function extractInterface(name) {
  const re = new RegExp("export interface " + name + "\\s*\\{");
  const m = re.exec(src);
  if (!m) throw new Error("Interface not found: " + name);
  let i = m.index + m[0].length;
  let depth = 1;
  while (i < src.length && depth > 0) {
    const ch = src[i];
    if (ch === "{") depth++;
    else if (ch === "}") depth--;
    i++;
  }
  return src.slice(m.index, i).trim();
}

function extractBalanced(source, startIndex) {
  let i = startIndex;
  while (/\s/.test(source[i])) i++;
  const opener = source[i];
  if (opener !== "{" && opener !== "[") {
    throw new Error("Expected { or [ at " + startIndex);
  }
  const closer = opener === "{" ? "}" : "]";
  let depth = 0;
  const start = i;
  while (i < source.length) {
    const ch = source[i];
    if (ch === '"' || ch === "'" || ch === "`") {
      const q = ch;
      i++;
      while (i < source.length) {
        if (source[i] === "\\") {
          i += 2;
          continue;
        }
        if (source[i] === q) {
          i++;
          break;
        }
        i++;
      }
      continue;
    }
    if (ch === opener) depth++;
    else if (ch === closer) {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    i++;
  }
  return { text: source.slice(start, i), end: i };
}

function extractConstBlock(constName) {
  const re = new RegExp("const " + constName + "[^=]*=\\s*");
  const m = re.exec(src);
  if (!m) throw new Error("Const not found: " + constName);
  const { text, end } = extractBalanced(src, m.index + m[0].length);
  let e = end;
  if (src[e] === ";") e++;
  return { full: src.slice(m.index, e).trim(), literal: text };
}

function extractUseStateInit(varName) {
  const re = new RegExp(
    "const \\[" + varName + "[^\\]]*\\]\\s*=\\s*useState(?:<[^>]+>)?\\("
  );
  const m = re.exec(src);
  if (!m) throw new Error("useState not found: " + varName);
  const { text } = extractBalanced(src, m.index + m[0].length);
  return text;
}

function extractConstFromFilter(name) {
  const re = new RegExp("const " + name + "\\s*=\\s*");
  const m = re.exec(filterSrc);
  if (!m) throw new Error("Filter const not found: " + name);
  const { text, end } = extractBalanced(filterSrc, m.index + m[0].length);
  let e = end;
  if (filterSrc[e] === ";") e++;
  return filterSrc.slice(m.index, e).trim();
}

function extractFormatIndianCurrency() {
  const start = cardSrc.indexOf("export const formatIndianCurrency");
  if (start < 0) throw new Error("formatIndianCurrency not found");
  let i = cardSrc.indexOf("{", start);
  let depth = 0;
  while (i < cardSrc.length) {
    if (cardSrc[i] === "{") depth++;
    else if (cardSrc[i] === "}") {
      depth--;
      if (depth === 0) {
        i++;
        break;
      }
    }
    i++;
  }
  if (cardSrc[i] === ";") i++;
  return cardSrc.slice(start, i).trim();
}

// ─── Types ───────────────────────────────────────────────────────────

write(
  "src/types/property.ts",
  [
    "export interface PropertyInquiry {",
    "  name: string;",
    "  email: string;",
    "  phone: string;",
    "  message: string;",
    "  date: string;",
    "}",
    "",
    extractInterface("Property"),
    "",
  ].join("\n")
);

write(
  "src/types/user.ts",
  [extractInterface("UserProfile"), "", extractInterface("MockUser"), ""].join("\n")
);

write(
  "src/types/inquiry.ts",
  [
    extractInterface("AssistanceRequest"),
    "",
    extractInterface("GeneralEnquiry"),
    "",
    extractInterface("CustomerReview"),
    "",
  ].join("\n")
);

write(
  "src/types/catalog.ts",
  [
    extractInterface("Notification"),
    "",
    extractInterface("Category"),
    "",
    extractInterface("Location"),
    "",
    extractInterface("ActivityLog"),
    "",
    extractInterface("DirectoryProfile"),
    "",
  ].join("\n")
);

write(
  "src/types/index.ts",
  [
    'export type { Property, PropertyInquiry } from "./property";',
    'export type { UserProfile, MockUser } from "./user";',
    'export type { AssistanceRequest, GeneralEnquiry, CustomerReview } from "./inquiry";',
    'export type { Notification, Category, Location, ActivityLog, DirectoryProfile } from "./catalog";',
    "",
  ].join("\n")
);

// ─── Data: properties ────────────────────────────────────────────────

const mockImages = extractConstBlock("mockImages");
const initialProperties = extractConstBlock("initialProperties");

write(
  "src/data/properties.ts",
  [
    'import type { Property } from "@/types/property";',
    "",
    "export const mockImages = " + mockImages.literal + ";",
    "",
    "export const initialProperties: Property[] = " + initialProperties.literal + ";",
    "",
  ].join("\n")
);

// ─── Data: inquiries ─────────────────────────────────────────────────

write(
  "src/data/inquiries.ts",
  [
    'import type { AssistanceRequest, GeneralEnquiry, CustomerReview } from "@/types/inquiry";',
    'import type { PropertyInquiry } from "@/types/property";',
    "",
    "export const initialAssistanceRequests: AssistanceRequest[] = " +
      extractUseStateInit("assistanceRequests") +
      ";",
    "",
    "export const initialInquiries: { [key: string]: PropertyInquiry[] } = " +
      extractUseStateInit("inquiries") +
      ";",
    "",
    "export const initialEnquiries: GeneralEnquiry[] = " +
      extractUseStateInit("enquiries") +
      ";",
    "",
    "export const initialReviews: CustomerReview[] = " +
      extractUseStateInit("reviews") +
      ";",
    "",
  ].join("\n")
);

// ─── Data: directory ─────────────────────────────────────────────────

write(
  "src/data/directory.ts",
  [
    'import type { DirectoryProfile } from "@/types/catalog";',
    "",
    "export const directoryProfiles: DirectoryProfile[] = " +
      extractUseStateInit("directoryProfiles") +
      ";",
    "",
  ].join("\n")
);

// ─── Data: catalog ───────────────────────────────────────────────────

write(
  "src/data/catalog.ts",
  [
    'import type { Notification, Category, Location, ActivityLog } from "@/types/catalog";',
    'import type { MockUser } from "@/types/user";',
    "",
    "export const initialNotifications: Notification[] = " +
      extractUseStateInit("notifications") +
      ";",
    "",
    "export const initialCategories: Category[] = " +
      extractUseStateInit("categories") +
      ";",
    "",
    "export const initialLocations: Location[] = " +
      extractUseStateInit("locations") +
      ";",
    "",
    "export const initialActivityLogs: ActivityLog[] = " +
      extractUseStateInit("activityLogs") +
      ";",
    "",
    "export const initialMockUsers: MockUser[] = " +
      extractUseStateInit("mockUsers") +
      ";",
    "",
  ].join("\n")
);

write(
  "src/data/index.ts",
  [
    'export { mockImages, initialProperties } from "./properties";',
    "export {",
    "  initialAssistanceRequests,",
    "  initialInquiries,",
    "  initialEnquiries,",
    "  initialReviews,",
    '} from "./inquiries";',
    'export { directoryProfiles } from "./directory";',
    "export {",
    "  initialNotifications,",
    "  initialCategories,",
    "  initialLocations,",
    "  initialActivityLogs,",
    "  initialMockUsers,",
    '} from "./catalog";',
    "",
  ].join("\n")
);

// ─── Constants ───────────────────────────────────────────────────────

write(
  "src/constants/cities.ts",
  [
    "export const CITIES = [",
    '  "All India",',
    '  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner",',
    '  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar",',
    '  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand",',
    '  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra",',
    '  "Delhi", "Mumbai", "Pune"',
    "] as const;",
    "",
    'export const CITIES_WITHOUT_ALL = CITIES.filter((c) => c !== "All India");',
    "",
  ].join("\n")
);

{
  const lines = [
    extractConstFromFilter("PROPERTY_TYPES").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("BUDGET_BUY_MIN_OPTIONS").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("BUDGET_BUY_MAX_OPTIONS").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("BUDGET_RENT_MIN_OPTIONS").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("BUDGET_RENT_MAX_OPTIONS").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("SIZE_MIN_OPTIONS").replace(/^const /, "export const "),
    "",
    extractConstFromFilter("SIZE_MAX_OPTIONS").replace(/^const /, "export const "),
    "",
    'export const BHK_OPTIONS = ["1", "2", "3", "4"] as const;',
    "",
    'export const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;',
    "",
    extractConstFromFilter("AMENITY_OPTIONS")
      .replace(/^const /, "export const ")
      .replace("AMENITY_OPTIONS", "AMENITIES"),
    "",
  ];
  write("src/constants/propertyOptions.ts", lines.join("\n"));
}

write(
  "src/constants/routes.ts",
  [
    "export const ROUTES = {",
    '  home: "/",',
    '  listings: "/listings",',
    '  property: "/property",',
    '  login: "/login",',
    '  signup: "/signup",',
    '  register: "/register",',
    '  forgotPassword: "/forgot-password",',
    '  favorites: "/favorites",',
    '  compare: "/compare",',
    '  destinations: "/destinations",',
    '  dealers: "/dealers",',
    '  services: "/services",',
    '  servicesRegister: "/services/register",',
    '  postProperty: "/post-property",',
    '  hub: "/hub",',
    '  help: "/help",',
    '  privacy: "/privacy",',
    '  terms: "/terms",',
    '  profile: "/profile",',
    '  profileEdit: "/profile/edit",',
    '  settings: "/settings",',
    '  myInquiries: "/my-inquiries",',
    '  myVisits: "/my-visits",',
    '  dealerRegister: "/dealer/register",',
    '  dealerDashboard: "/dealer/dashboard",',
    '  dealerProperties: "/dealer/dashboard/properties",',
    '  dealerAddProperty: "/dealer/dashboard/add-property",',
    '  dealerInquiries: "/dealer/dashboard/inquiries",',
    '  dealerAnalytics: "/dealer/dashboard/analytics",',
    '  dealerSettings: "/dealer/dashboard/settings",',
    '  dealerProfile: "/dealer/dashboard/profile",',
    '  dealerSubscription: "/dealer/dashboard/subscription",',
    '  admin: "/admin",',
    '  adminLogin: "/admin/login",',
    '  adminProperties: "/admin/properties",',
    '  adminUsers: "/admin/users",',
    '  adminDealers: "/admin/dealers",',
    '  adminApprovals: "/admin/approvals",',
    '  adminCategories: "/admin/categories",',
    '  adminLocations: "/admin/locations",',
    '  adminAmenities: "/admin/amenities",',
    '  adminNotifications: "/admin/notifications",',
    '  adminMessages: "/admin/messages",',
    '  adminAnalytics: "/admin/analytics",',
    '  adminReports: "/admin/reports",',
    '  adminLogs: "/admin/logs",',
    '  adminRoles: "/admin/roles",',
    '  adminSettings: "/admin/settings",',
    '  adminProfile: "/admin/profile",',
    "} as const;",
    "",
  ].join("\n")
);

write(
  "src/constants/demoAccounts.ts",
  [
    "export const DEMO_ACCOUNTS = [",
    '  { email: "admin@sqftgo.com", password: "admin2026", role: "admin" as const, name: "Admin" },',
    '  { email: "broker@sqftgo.com", password: "admin123", role: "broker" as const, name: "Rajesh Mehta" },',
    '  { email: "user@sqftgo.com", password: "user123", role: "user" as const, name: "Priya Sharma" },',
    "] as const;",
    "",
    'export const SESSION_STORAGE_KEY = "sv_mock_session";',
    "",
  ].join("\n")
);

write(
  "src/constants/index.ts",
  [
    'export { CITIES, CITIES_WITHOUT_ALL } from "./cities";',
    "export {",
    "  PROPERTY_TYPES,",
    "  BUDGET_BUY_MIN_OPTIONS,",
    "  BUDGET_BUY_MAX_OPTIONS,",
    "  BUDGET_RENT_MIN_OPTIONS,",
    "  BUDGET_RENT_MAX_OPTIONS,",
    "  SIZE_MIN_OPTIONS,",
    "  SIZE_MAX_OPTIONS,",
    "  BHK_OPTIONS,",
    "  FURNISHING_OPTIONS,",
    "  AMENITIES,",
    '} from "./propertyOptions";',
    'export { ROUTES } from "./routes";',
    'export { DEMO_ACCOUNTS, SESSION_STORAGE_KEY } from "./demoAccounts";',
    "",
  ].join("\n")
);

// ─── Lib ─────────────────────────────────────────────────────────────

write("src/lib/format.ts", extractFormatIndianCurrency() + "\n");

write(
  "src/lib/cn.ts",
  [
    "/** Join class names, filtering out falsy values. */",
    "export function cn(...classes: Array<string | false | null | undefined>): string {",
    '  return classes.filter(Boolean).join(" ");',
    "}",
    "",
  ].join("\n")
);

write(
  "src/lib/validation.ts",
  [
    "export function isEmail(value: string): boolean {",
    "  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value.trim());",
    "}",
    "",
    "export function isPhone(value: string): boolean {",
    '  const digits = value.replace(/\\D/g, "");',
    "  return digits.length >= 10 && digits.length <= 15;",
    "}",
    "",
    "export function required(value: string | null | undefined): boolean {",
    "  return Boolean(value && value.trim().length > 0);",
    "}",
    "",
  ].join("\n")
);

write(
  "src/lib/delay.ts",
  [
    "/** Promise-based delay for mock async flows. */",
    "export function delay(ms: number): Promise<void> {",
    "  return new Promise((resolve) => setTimeout(resolve, ms));",
    "}",
    "",
  ].join("\n")
);

write(
  "src/lib/index.ts",
  [
    'export { formatIndianCurrency } from "./format";',
    'export { cn } from "./cn";',
    'export { isEmail, isPhone, required } from "./validation";',
    'export { delay } from "./delay";',
    "",
  ].join("\n")
);

write(
  "src/mocks/delay.ts",
  [
    'import { delay } from "@/lib/delay";',
    "",
    "/** Simulate network latency for mock API calls. */",
    "export function simulateNetwork(ms = 400): Promise<void> {",
    "  return delay(ms);",
    "}",
    "",
    "export { delay };",
    "",
  ].join("\n")
);

console.log("\nDone. AppContext.tsx was not modified.");
