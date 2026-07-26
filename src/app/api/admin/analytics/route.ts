import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { canAccessAdminRoutes } from "@/lib/authz";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { PlatformAnalytics } from "@/types/platform";

async function db() {
  return hasServiceRoleKey() ? createServiceClient() : await createClient();
}

export async function GET(request: NextRequest) {
  if (!hasSupabaseEnv()) return jsonError("Supabase is not configured", 503);

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) return jsonError("Unauthorized", 401);
  if (!canAccessAdminRoutes(profile)) return jsonError("Forbidden", 403);

  const supabase = await db();

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

  const activeRows = (activeProps.data ?? []) as { price: number | string; city: string }[];
  const inventoryValueSum = activeRows.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  const cityMap = new Map<string, number>();
  for (const p of activeRows) {
    cityMap.set(p.city, (cityMap.get(p.city) ?? 0) + 1);
  }
  const cityBreakdown = [...cityMap.entries()]
    .map(([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 12);

  const recent = (recentInquiriesRows.data ?? []) as {
    id: string;
    name: string;
    email: string;
    phone: string;
    message: string;
    created_at: string;
    property_id: string;
  }[];

  const monthMap = new Map<string, number>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    monthMap.set(key, 0);
  }
  for (const row of (monthlyCreatedAts.data ?? []) as { created_at: string }[]) {
    const d = new Date(row.created_at);
    const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    if (monthMap.has(key)) monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
  }
  const monthlyInquiries = [...monthMap.entries()].map(([month, count]) => ({
    month,
    count,
  }));
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

  const payload: PlatformAnalytics = {
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

  return jsonOk(payload);
}
