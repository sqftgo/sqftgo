import { apiClient } from "@/lib/api/client";
import type { DealerListingQuotaView, ListingPlan } from "@/types/listing-plan";

export const listingPlanApi = {
  listActive: () => apiClient<ListingPlan[]>("/api/listing-plans"),
  getQuota: () => apiClient<DealerListingQuotaView>("/api/dealer/listing-quota"),
  createOrder: (planId: string) =>
    apiClient<{
      orderId: string;
      razorpayOrderId: string;
      amountPaise: number;
      currency: string;
      keyId: string | null;
      planName: string;
      slots: number;
      prefill: { name: string; email: string; contact: string };
    }>("/api/payments/razorpay/order", {
      method: "POST",
      body: JSON.stringify({ planId }),
    }),
  verifyPayment: (input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }) =>
    apiClient<{ ok: boolean; quota: DealerListingQuotaView }>("/api/payments/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  adminList: () => apiClient<ListingPlan[]>("/api/admin/listing-plans"),
  adminCreate: (input: {
    slug: string;
    name: string;
    description?: string;
    priceInr: number;
    slots: number;
    isActive?: boolean;
    sortOrder?: number;
  }) =>
    apiClient<ListingPlan>("/api/admin/listing-plans", {
      method: "POST",
      body: JSON.stringify(input),
    }),
  adminPatch: (
    id: string,
    input: Partial<{
      name: string;
      description: string;
      priceInr: number;
      slots: number;
      isActive: boolean;
      sortOrder: number;
    }>
  ) =>
    apiClient<ListingPlan>(`/api/admin/listing-plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    }),
};
