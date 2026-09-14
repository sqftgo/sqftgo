import { type NextRequest } from "next/server";
import { authenticateApiRequest, jsonError, jsonOk } from "@/lib/api/auth";
import { mapAdminUser } from "@/lib/mappers/admin-user";
import { createServiceClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hasServiceRoleKey, hasSupabaseEnv } from "@/lib/supabase/env";
import type { AuthRole, ListerStatus } from "@/types";
import type { ProfileUpdate } from "@/types/database";

type PatchBody = {
  name?: string;
  email?: string;
  role?: AuthRole;
  status?: "active" | "suspended";
  listingStatus?: ListerStatus;
  grantListingSlots?: number;
};

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!hasSupabaseEnv()) {
    return jsonError("Supabase is not configured", 503);
  }

  const { user, profile, error } = await authenticateApiRequest(request);
  if (error || !user || !profile) {
    return jsonError("Unauthorized", 401);
  }
  if (profile.role !== "admin" || profile.status === "suspended") {
    return jsonError("Forbidden", 403);
  }

  const { id } = await context.params;
  if (!id) return jsonError("User id is required");

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return jsonError("Invalid JSON body");
  }

  if (typeof body.grantListingSlots === "number") {
    const slots = Math.floor(body.grantListingSlots);
    if (slots < 1 || slots > 1000) return jsonError("grantListingSlots must be 1–1000");
    if (!hasServiceRoleKey()) {
      return jsonError("SUPABASE_SERVICE_ROLE_KEY is required to grant listing slots.", 503);
    }
    const admin = createServiceClient();
    const { data: target, error: targetError } = await admin
      .from("profiles")
      .select("id, role, listing_slots_purchased")
      .eq("id", id)
      .maybeSingle();
    if (targetError || !target) return jsonError("User not found", 404);
    if (target.role !== "broker") return jsonError("Listing packs can only be granted to dealers.", 400);

    const { error: creditErr } = await admin.rpc("increment_listing_slots", {
      p_dealer_id: id,
      p_slots: slots,
    });
    if (creditErr) {
      const { error: fallbackErr } = await admin
        .from("profiles")
        .update({ listing_slots_purchased: (target.listing_slots_purchased ?? 0) + slots })
        .eq("id", id);
      if (fallbackErr) return jsonError(fallbackErr.message, 500);
    }

    await admin.from("listing_orders").insert({
      dealer_id: id,
      plan_id: null,
      provider: "admin",
      amount_paise: 0,
      slots,
      status: "paid",
      paid_at: new Date().toISOString(),
    });

    const { data, error: reloadError } = await admin.from("profiles").select("*").eq("id", id).single();
    if (reloadError || !data) return jsonError(reloadError?.message ?? "User not found", 404);
    return jsonOk(mapAdminUser(data));
  }

  const patch: ProfileUpdate = {};

  if (body.name !== undefined) patch.name = body.name;
  if (body.email !== undefined) patch.email = body.email;
  if (body.role !== undefined) patch.role = body.role;
  if (body.status !== undefined) patch.status = body.status;
  if (body.listingStatus !== undefined) {
    patch.listing_status = body.listingStatus;
    patch.listing_verified_at =
      body.listingStatus === "approved" ? new Date().toISOString() : null;
  }

  if (Object.keys(patch).length === 0) {
    return jsonError("No updates provided");
  }

  // Prevent locking yourself out of the sole admin account.
  if (id === user.id) {
    if (patch.role !== undefined && patch.role !== "admin") {
      return jsonError("You cannot demote your own admin role.", 403);
    }
    if (patch.status === "suspended") {
      return jsonError("You cannot suspend your own account.", 403);
    }
  }
  if (patch.role === "admin") {
    return jsonError("Admin role cannot be granted via the API.", 403);
  }

  const needsService =
    patch.role !== undefined ||
    patch.status !== undefined ||
    patch.listing_status !== undefined;
  if (needsService && !hasServiceRoleKey()) {
    return jsonError(
      "SUPABASE_SERVICE_ROLE_KEY is required to change role, status, or listing verification.",
      503
    );
  }

  const supabase = needsService
    ? createServiceClient()
    : hasServiceRoleKey()
      ? createServiceClient()
      : await createClient();

  const { data, error: updateError } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", id)
    .select("*")
    .single();

  if (updateError || !data) {
    return jsonError(updateError?.message ?? "User not found", 404);
  }

  return jsonOk(mapAdminUser(data));
}
