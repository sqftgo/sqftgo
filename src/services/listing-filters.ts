import { apiClient } from "@/lib/api/client";
import type { ListingFilter, ListingFilterKind, ListingFilterOption } from "@/types/listing-filter";

export type ListingFilterCreateInput = {
  key: string;
  label: string;
  kind: ListingFilterKind;
  propertyField?: string | null;
  catalog?: ListingFilter["catalog"] | null;
  options?: ListingFilterOption[];
  active?: boolean;
  sortOrder?: number;
};

export type ListingFilterUpdateInput = {
  label?: string;
  kind?: ListingFilterKind;
  propertyField?: string | null;
  catalog?: ListingFilter["catalog"] | null;
  options?: ListingFilterOption[];
  active?: boolean;
  sortOrder?: number;
};

export const listingFilterApi = {
  list(opts?: { all?: boolean }) {
    const qs = opts?.all ? "?all=1" : "";
    return apiClient<ListingFilter[]>(`/api/listing-filters${qs}`);
  },
  create(input: ListingFilterCreateInput) {
    return apiClient<ListingFilter>("/api/listing-filters", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
  update(id: string, updates: ListingFilterUpdateInput) {
    return apiClient<ListingFilter>(`/api/listing-filters/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
  remove(id: string) {
    return apiClient<{ ok: boolean; deactivated?: boolean }>(`/api/listing-filters/${id}`, {
      method: "DELETE",
    });
  },
};
