import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { toUiStatus } from "@/lib/mappers/property";
import type { Database, PropertyStatusDb } from "@/types/database";
import type { DealerAnalytics, PlatformAnalytics } from "@/types/platform";

type ApiDb = SupabaseClient<Database>;

type OwnedPropertyRow = {
  id: string;
  title: string;
  city: string;
  type: string;
  status: PropertyStatusDb;
  price: number | string;
  inquiry_count: number;
};

type InquiryRow = {
  id: string;
  property_id: string;
  created_at: string;
};

type VisitRow = {
  id: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
};

export function buildEmptyMonthMap(now = new Date()): Map<string, number> {
  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  return monthMap;
}

export function buildEmptyMonths(now = new Date()): { month: string; count: number }[] {
  return [...buildEmptyMonthMap(now).entries()].map(([month, count]) => ({
    month,
    count,
  }));
}

export function monthlyInquiriesFromCreatedAts(
  createdAts: Iterable<string>,
  now = new Date()
): { month: string; count: number }[] {
  const monthMap = buildEmptyMonthMap(now);
  for (const created_at of createdAts) {
    const d = new Date(created_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  return [...monthMap.entries()].map(([month, count]) => ({ month, count }));
}

export function cityBreakdownFromRows(
  rows: { city: string }[],
  limit = 12
): { city: string; count: number }[] {
  const cityMap = new Map<string, number>();
  for (const p of rows) {
    cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  }
  return [...cityMap.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export function numPrice(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

function emptyDealerAnalytics(): DealerAnalytics {
  return {
    listingsTotal: 0,
    listingsActive: 0,
    listingsPending: 0,
    listingsDraft: 0,
    listingsRejected: 0,
    inquiriesTotal: 0,
    visitsTotal: 0,
    visitsPending: 0,
    visitsConfirmed: 0,
    inventoryValueSum: 0,
    cityBreakdown: [],
    monthlyInquiries: buildEmptyMonths(),
    topListings: [],
    listings: [],
  };
}

export async function fetchPlatformAnalytics(
  supabase: ApiDb
): Promise<PlatformAnalytics> {
  const now = new Date();
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1)
  ).toISOString();

  const [
    accounts,
    buyerUsers,
    brokerUsers,
    propertiesTotal,
    activeListings,
    pendingReview,
    propertyInquiries,
    generalEnquiries,
    dealers,
    siteVisits,
    activeProps,
    recentInquiriesRows,
    monthlyCreatedAts,
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "user"),
    supabase
      .from("profiles")
      .select("*", { count: "exact", head: true })
      .eq("role", "broker"),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .neq("status", "draft"),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "active"),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending_review"),
    supabase.from("property_inquiries").select("*", { count: "exact", head: true }),
    supabase.from("general_enquiries").select("*", { count: "exact", head: true }),
    supabase.from("directory_profiles").select("*", { count: "exact", head: true }),
    supabase.from("site_visits").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("price, city").eq("status", "active"),
    supabase
      .from("property_inquiries")
      .select("id, name, email, phone, message, created_at, property_id")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("property_inquiries")
      .select("created_at")
      .gte("created_at", monthStart),
  ]);

  const activeRows = (activeProps.data ?? []) as {
    price: number | string;
    city: string;
  }[];
  const inventoryValueSum = activeRows.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  const cityBreakdown = cityBreakdownFromRows(activeRows);

  const recent = (recentInquiriesRows.data ?? []) as {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
    property_id: string;
  }[];

  const monthlyInquiries = monthlyInquiriesFromCreatedAts(
    ((monthlyCreatedAts.data ?? []) as { created_at: string }[]).map(
      (row) => row.created_at
    ),
    now
  );

  const propIds = [...new Set(recent.map((r) => r.property_id))];
  const titleById = new Map<string, string>();
  if (propIds.length) {
    const { data: props } = await supabase
      .from("properties")
      .select("id, title")
      .in("id", propIds);
    for (const p of (props ?? []) as { id: string; title: string }[]) {
      titleById.set(p.id, p.title);
    }
  }

  return {
    accounts: accounts.count ?? 0,
    buyerUsers: buyerUsers.count ?? 0,
    brokerUsers: brokerUsers.count ?? 0,
    propertiesTotal: propertiesTotal.count ?? 0,
    activeListings: activeListings.count ?? 0,
    pendingReview: pendingReview.count ?? 0,
    propertyInquiries: propertyInquiries.count ?? 0,
    generalEnquiries: generalEnquiries.count ?? 0,
    dealers: dealers.count ?? 0,
    siteVisits: siteVisits.count ?? 0,
    inventoryValueSum,
    cityBreakdown,
    monthlyInquiries,
    recentInquiries: recent.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      phone: r.phone,
      message: r.message,
      date: r.created_at.slice(0, 10),
      propertyTitle: titleById.get(r.property_id) ?? "Unknown property",
    })),
  };
}

export async function fetchDealerAnalytics(
  supabase: ApiDb,
  ownerId: string
): Promise<DealerAnalytics> {
  const { data: ownedRows, error: propsErr } = await supabase
    .from("properties")
    .select("id, title, city, type, status, price, inquiry_count")
    .eq("owner_id", ownerId);

  if (propsErr) throw new Error(propsErr.message);

  const owned = (ownedRows ?? []) as OwnedPropertyRow[];
  if (owned.length === 0) {
    return emptyDealerAnalytics();
  }

  const propertyIds = owned.map((p) => p.id);

  const [inquiriesResult, visitsResult] = await Promise.all([
    supabase
      .from("property_inquiries")
      .select("id, property_id, created_at")
      .in("property_id", propertyIds),
    supabase.from("site_visits").select("id, status").in("property_id", propertyIds),
  ]);

  if (inquiriesResult.error) throw new Error(inquiriesResult.error.message);
  if (visitsResult.error) throw new Error(visitsResult.error.message);

  const inquiryRows = (inquiriesResult.data ?? []) as InquiryRow[];
  const visitRows = (visitsResult.data ?? []) as VisitRow[];

  const inquiryCountByProperty = new Map<string, number>();
  for (const row of inquiryRows) {
    inquiryCountByProperty.set(
      row.property_id,
      (inquiryCountByProperty.get(row.property_id) ?? 0) + 1
    );
  }

  // Prefer live inquiry rows over possibly stale denormalized inquiry_count.
  const resolveInquiryCount = (p: OwnedPropertyRow) =>
    inquiryCountByProperty.get(p.id) ?? p.inquiry_count ?? 0;

  const listings = owned.map((p) => ({
    id: p.id,
    title: p.title,
    type: p.type,
    city: p.city,
    status: toUiStatus(p.status),
    inquiryCount: resolveInquiryCount(p),
    price: numPrice(p.price),
  }));

  const listingsTotal = owned.length;
  const listingsActive = owned.filter((p) => p.status === "active").length;
  const listingsPending = owned.filter((p) => p.status === "pending_review").length;
  const listingsDraft = owned.filter((p) => p.status === "draft").length;
  const listingsRejected = owned.filter((p) => p.status === "rejected").length;

  const inquiriesTotal = inquiryRows.length;
  const visitsTotal = visitRows.length;
  const visitsPending = visitRows.filter((v) => v.status === "pending").length;
  const visitsConfirmed = visitRows.filter((v) => v.status === "confirmed").length;

  const inventoryValueSum = owned
    .filter((p) => p.status === "active")
    .reduce((sum, p) => sum + numPrice(p.price), 0);

  const cityBreakdown = cityBreakdownFromRows(owned);

  const monthlyInquiries = monthlyInquiriesFromCreatedAts(
    inquiryRows.map((row) => row.created_at)
  );

  const topListings = [...listings]
    .sort((a, b) => b.inquiryCount - a.inquiryCount)
    .slice(0, 5)
    .map((p) => ({
      id: p.id,
      title: p.title,
      city: p.city,
      status: p.status,
      inquiryCount: p.inquiryCount,
    }));

  return {
    listingsTotal,
    listingsActive,
    listingsPending,
    listingsDraft,
    listingsRejected,
    inquiriesTotal,
    visitsTotal,
    visitsPending,
    visitsConfirmed,
    inventoryValueSum,
    cityBreakdown,
    monthlyInquiries,
    topListings,
    listings,
  };
}
