import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessDealerDashboard } from "@/lib/authz";
import { toUiStatus } from "@/lib/mappers/property";
import { createServiceClient } from "@/lib/supabase/admin";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { PropertyStatusDb } from "@/types/database";
import type { DealerAnalytics } from "@/types/platform";

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

function buildEmptyMonths(): { month: string; count: number }[] {
  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  return [...monthMap.entries()].map(([month, count]) => ({ month, count }));
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

function num(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);
  if (!hasServiceRoleKey()) {
    return jsonError("SUPABASE_SERVICE_ROLE_KEY is required for dealer analytics.", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (profile.status === "suspended") return jsonError("Forbidden", 403);
  if (!canAccessDealerDashboard(profile)) return jsonError("Forbidden", 403);

  const supabase = createServiceClient();

  const { data: ownedRows, error: propsErr } = await supabase
    .from("properties")
    .select("id, title, city, type, status, price, inquiry_count")
    .eq("owner_id", user.id);

  if (propsErr) return jsonError(propsErr.message, 500);

  const owned = (ownedRows ?? []) as OwnedPropertyRow[];
  if (owned.length === 0) {
    return jsonOk(emptyDealerAnalytics());
  }

  const propertyIds = owned.map((p) => p.id);

  const [inquiriesResult, visitsResult] = await Promise.all([
    supabase
      .from("property_inquiries")
      .select("id, property_id, created_at")
      .in("property_id", propertyIds),
    supabase.from("site_visits").select("id, status").in("property_id", propertyIds),
  ]);

  if (inquiriesResult.error) return jsonError(inquiriesResult.error.message, 500);
  if (visitsResult.error) return jsonError(visitsResult.error.message, 500);

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
    price: num(p.price),
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
    .reduce((sum, p) => sum + num(p.price), 0);

  const cityMap = new Map<string, number>();
  for (const p of owned) {
    cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  }
  const cityBreakdown = [...cityMap.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const monthMap = new Map<string, number>();
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  for (const row of inquiryRows) {
    const d = new Date(row.created_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const monthlyInquiries = [...monthMap.entries()].map(([month, count]) => ({
    month,
    count,
  }));

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

  const payload: DealerAnalytics = {
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

  return jsonOk(payload);
}
