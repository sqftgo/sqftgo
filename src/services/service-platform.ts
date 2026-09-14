import { apiClient } from "@/lib/api/client";
import type {
  ServiceBooking,
  ServiceBookingStatus,
  ServiceType,
  ServiceVerification,
} from "@/types";

export const servicePlatformApi = {
  listServiceTypes(all = false): Promise<ServiceType[]> {
    const q = all ? "?all=1" : "";
    return apiClient<ServiceType[]>(`/api/service-types${q}`);
  },

  createServiceType(input: {
    name: string;
    description?: string;
    icon?: string;
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
      description: string;
      icon: string;
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
};

export const servicePlatformService = servicePlatformApi;
