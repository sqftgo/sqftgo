import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListingOrderRow, ListingPlanRow } from "@/types/database";

export type { ListingOrderRow, ListingPlanRow };

export function mapListingPlan(row: ListingPlanRow) {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    description: row.description,
    pricePaise: row.price_paise,
    priceInr: Math.round(row.price_paise / 100),
    slots: row.slots,
    isActive: row.is_active,
    sortOrder: row.sort_order,
  };
}

/** Idempotent: paying the same Razorpay payment twice does not add slots twice. */
export async function fulfillListingOrder(
  admin: SupabaseClient,
  input: {
    orderId: string;
    paymentId?: string | null;
  }
): Promise<{ alreadyPaid: boolean; slots: number }> {
  const { data: order, error } = await admin
    .from("listing_orders")
    .select("*")
    .eq("id", input.orderId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!order) throw new Error("Order not found");
  if (order.status === "paid") return { alreadyPaid: true, slots: order.slots };

  const { data: updated, error: upErr } = await admin
    .from("listing_orders")
    .update({
      status: "paid",
      razorpay_payment_id: input.paymentId ?? order.razorpay_payment_id,
      paid_at: new Date().toISOString(),
    })
    .eq("id", order.id)
    .eq("status", "created")
    .select("id, slots, dealer_id")
    .maybeSingle();

  if (upErr) throw new Error(upErr.message);
  if (!updated) return { alreadyPaid: true, slots: order.slots };

  const { error: creditErr } = await admin.rpc("increment_listing_slots", {
    p_dealer_id: updated.dealer_id,
    p_slots: updated.slots,
  });
  if (creditErr) {
    const { data: profile, error: profileError } = await admin
      .from("profiles")
      .select("listing_slots_purchased")
      .eq("id", updated.dealer_id)
      .maybeSingle();
    if (profileError) throw new Error(profileError.message);
    const { error: fallbackErr } = await admin
      .from("profiles")
      .update({
        listing_slots_purchased: (profile?.listing_slots_purchased ?? 0) + updated.slots,
      })
      .eq("id", updated.dealer_id);
    if (fallbackErr) throw new Error(fallbackErr.message);
  }

  return { alreadyPaid: false, slots: updated.slots };
}
