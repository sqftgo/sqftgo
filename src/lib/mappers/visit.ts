import type { VisitBooking, VisitStatusUi } from "@/types/visit";
import type { VisitStatusDb, SiteVisitRow } from "@/types/database";

const UI_TO_DB: Record<VisitStatusUi, VisitStatusDb> = {
  "Pending Approval": "pending",
  Confirmed: "confirmed",
  Completed: "completed",
  Cancelled: "cancelled",
};

const DB_TO_UI: Record<VisitStatusDb, VisitStatusUi> = {
  pending: "Pending Approval",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function toDbVisitStatus(status: VisitStatusUi): VisitStatusDb {
  return UI_TO_DB[status];
}

export function toUiVisitStatus(status: VisitStatusDb): VisitStatusUi {
  return DB_TO_UI[status];
}

export type SiteVisitJoined = SiteVisitRow & {
  properties?: {
    id: string;
    title: string;
    images: string[] | null;
    locality: string;
    city: string;
    owner_name: string;
    owner_phone: string;
    owner_id: string;
  } | null;
};

export function mapVisitRow(row: SiteVisitJoined): VisitBooking {
  const prop = row.properties;
  const image = prop?.images?.[0] ?? "";
  const locality = prop?.locality ?? "";
  const city = prop?.city ?? "";
  return {
    id: row.id,
    propertyId: row.property_id,
    propertyTitle: prop?.title ?? "Property",
    propertyImage: image,
    locality,
    city,
    address: [locality, city].filter(Boolean).join(", "),
    date: row.scheduled_date,
    time: row.scheduled_time,
    visitorName: row.visitor_name,
    visitorEmail: row.visitor_email,
    visitorPhone: row.visitor_phone,
    brokerName: prop?.owner_name ?? "Broker",
    brokerPhone: prop?.owner_phone ?? "",
    status: toUiVisitStatus(row.status),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}
