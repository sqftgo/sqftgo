import { apiClient } from "@/lib/api/client";
import type {
  ServiceBooking,
  ServiceBookingStatus,
  ServicePortfolioImage,
  ServiceReview,
  ServiceType,
  ServiceVerification,
  ServiceWebsitePromotion,
  ServiceWebsitePromotionPayment,
  ServiceWebsitePromotionPlan,
} from "@/types";

export const servicePlatformApi = {
  listServiceTypes(all = false): Promise<ServiceType[]> {
    const q = all ? "?all=1" : "";
    return apiClient<ServiceType[]>(`/api/service-types${q}`);
  },

  createServiceType(input: {
    name: string;
    slug?: string;
    description?: string;
    icon?: string;
    imageUrl?: string | null;
    active?: boolean;
    sortOrder?: number;
  }): Promise<ServiceType> {
    return apiClient<ServiceType>("/api/service-types", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  updateServiceType(
    id: string,
    input: Partial<{
      name: string;
      slug: string;
      description: string;
      icon: string;
      imageUrl: string | null;
      active: boolean;
      sortOrder: number;
    }>
  ): Promise<ServiceType> {
    return apiClient<ServiceType>(`/api/service-types/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  deleteServiceType(id: string): Promise<{ ok: boolean; deactivated?: boolean }> {
    return apiClient(`/api/service-types/${id}`, { method: "DELETE" });
  },

  getMyVerification(): Promise<ServiceVerification | null> {
    return apiClient<ServiceVerification | null>("/api/service-verifications");
  },

  submitVerification(input: {
    businessRegistrationId?: string | null;
    ownerNotes?: string;
  }): Promise<ServiceVerification> {
    return apiClient<ServiceVerification>("/api/service-verifications", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  adminListVerifications(status = "pending"): Promise<{ items: ServiceVerification[] }> {
    return apiClient<{ items: ServiceVerification[] }>(
      `/api/admin/service-verifications?status=${encodeURIComponent(status)}`
    );
  },

  adminReviewVerification(
    id: string,
    input: {
      status: "approved" | "rejected" | "pending";
      adminNotes?: string;
      rejectionReason?: string | null;
    }
  ): Promise<ServiceVerification> {
    return apiClient<ServiceVerification>(`/api/admin/service-verifications/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  createBooking(
    profileId: string,
    input: { preferredAt: string; message?: string; contactPhone: string }
  ): Promise<ServiceBooking> {
    return apiClient<ServiceBooking>(`/api/services/${profileId}/bookings`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listOwnerBookings(profileId: string): Promise<{ items: ServiceBooking[] }> {
    return apiClient<{ items: ServiceBooking[] }>(`/api/services/${profileId}/bookings`);
  },

  listMyBookings(): Promise<{ items: ServiceBooking[] }> {
    return apiClient<{ items: ServiceBooking[] }>("/api/service-bookings");
  },

  updateBooking(
    id: string,
    input: Partial<{
      status: ServiceBookingStatus;
      ownerNotes: string;
      message: string;
      contactPhone: string;
      preferredAt: string;
    }>
  ): Promise<ServiceBooking> {
    return apiClient<ServiceBooking>(`/api/service-bookings/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  getWebsitePromotion(): Promise<{
    directoryProfileId: string;
    profileWebsite: string;
    promotion: ServiceWebsitePromotion | null;
    payments: ServiceWebsitePromotionPayment[];
    plans: ServiceWebsitePromotionPlan[];
  }> {
    return apiClient("/api/services/website-promotion");
  },

  updateWebsitePromotionUrl(websiteUrl: string): Promise<{
    promotion: ServiceWebsitePromotion | null;
  }> {
    return apiClient("/api/services/website-promotion", {
      method: "PATCH",
      body: JSON.stringify({ websiteUrl }),
    });
  },

  createWebsitePromotionOrder(input: {
    planId: string;
    websiteUrl?: string;
  }): Promise<{
    orderId: string;
    amount: number;
    currency: string;
    keyId: string;
    paymentRecordId: string;
    plan: {
      id: string;
      name: string;
      amountPaise: number;
      durationDays: number;
      billingType: string;
    };
  }> {
    return apiClient("/api/services/website-promotion/order", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  verifyWebsitePromotionPayment(input: {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  }): Promise<{
    alreadyProcessed: boolean;
    promotion: ServiceWebsitePromotion | null;
  }> {
    return apiClient("/api/services/website-promotion/verify", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listReviews(profileId: string): Promise<{
    items: ServiceReview[];
    averageRating: number | null;
    reviewCount: number;
  }> {
    return apiClient(`/api/services/${profileId}/reviews`);
  },

  submitReview(
    profileId: string,
    input: { rating: number; title?: string; body: string }
  ): Promise<ServiceReview> {
    return apiClient(`/api/services/${profileId}/reviews`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  listPortfolio(profileId: string): Promise<{ items: ServicePortfolioImage[] }> {
    return apiClient(`/api/services/${profileId}/portfolio`);
  },

  addPortfolioImage(
    profileId: string,
    input: { imageUrl: string; caption?: string; sortOrder?: number }
  ): Promise<ServicePortfolioImage> {
    return apiClient(`/api/services/${profileId}/portfolio`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  deletePortfolioImage(profileId: string, imageId: string): Promise<{ ok: boolean }> {
    return apiClient(
      `/api/services/${profileId}/portfolio?imageId=${encodeURIComponent(imageId)}`,
      { method: "DELETE" }
    );
  },

  adminListWebsitePromotions(status?: string): Promise<{
    items: Array<ServiceWebsitePromotion & { firmName?: string | null }>;
    payments: ServiceWebsitePromotionPayment[];
  }> {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiClient(`/api/admin/website-promotion${q}`);
  },

  adminPatchWebsitePromotion(
    id: string,
    input: {
      status?: ServiceWebsitePromotion["status"];
      expiresAt?: string | null;
      startsAt?: string | null;
      websiteUrl?: string;
      adminNotes?: string;
      extendDays?: number;
    }
  ): Promise<ServiceWebsitePromotion> {
    return apiClient(`/api/admin/website-promotion/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },

  adminListWebsitePlans(): Promise<{ items: ServiceWebsitePromotionPlan[] }> {
    return apiClient("/api/admin/website-promotion/plans");
  },

  adminCreateWebsitePlan(input: {
    slug: string;
    name: string;
    description?: string;
    priceInr: number;
    currency?: string;
    billingType: "one_time" | "recurring";
    durationDays: number;
    isActive?: boolean;
    sortOrder?: number;
  }): Promise<ServiceWebsitePromotionPlan> {
    return apiClient("/api/admin/website-promotion/plans", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  adminPatchWebsitePlan(
    id: string,
    input: Partial<{
      name: string;
      description: string;
      priceInr: number;
      currency: string;
      billingType: "one_time" | "recurring";
      durationDays: number;
      isActive: boolean;
      sortOrder: number;
    }>
  ): Promise<ServiceWebsitePromotionPlan> {
    return apiClient(`/api/admin/website-promotion/plans/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};

export const servicePlatformService = servicePlatformApi;
