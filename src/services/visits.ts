import type { VisitBooking, VisitStatusUi } from "@/types";

async function apiJson<T>(input: RequestInfo, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    credentials: "same-origin",
  });
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new Error(
      typeof data === "object" && data && "error" in data && data.error
        ? String(data.error)
        : "Request failed"
    );
  }
  return data;
}

export type VisitCreatePayload = {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  notes?: string;
};

export type VisitUpdatePayload = {
  status?: VisitStatusUi;
  date?: string;
  time?: string;
  notes?: string;
  brokerNotes?: string;
};

export interface VisitRepository {
  list(opts?: { status?: VisitStatusUi }): Promise<VisitBooking[]>;
  book(propertyId: string, payload: VisitCreatePayload): Promise<VisitBooking>;
  update(id: string, updates: VisitUpdatePayload): Promise<VisitBooking>;
}

export const supabaseVisitRepository: VisitRepository = {
  async list(opts) {
    const qs = opts?.status ? `?status=${encodeURIComponent(opts.status)}` : "";
    return apiJson<VisitBooking[]>(`/api/visits${qs}`);
  },

  async book(propertyId, payload) {
    return apiJson<VisitBooking>(`/api/properties/${propertyId}/visits`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async update(id, updates) {
    return apiJson<VisitBooking>(`/api/visits/${id}`, {
      method: "PATCH",
      body: JSON.stringify(updates),
    });
  },
};

export const visitService: VisitRepository = supabaseVisitRepository;
