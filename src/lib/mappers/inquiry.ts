import type { PropertyInquiry, PropertyInquiryView } from "@/types";
import type { PropertyInquiryRow } from "@/types/database";

export type { PropertyInquiryView };

export function mapInquiryRow(row: PropertyInquiryRow): PropertyInquiryView {
  return {
    id: row.id,
    propertyId: row.property_id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    message: row.message,
    status: row.status,
    date: row.created_at.split("T")[0] ?? row.created_at,
  };
}

export function toInquiryRecord(
  rows: PropertyInquiryView[]
): Record<string, PropertyInquiry[]> {
  const out: Record<string, PropertyInquiry[]> = {};
  for (const row of rows) {
    const entry: PropertyInquiry = {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      message: row.message,
      date: row.date,
      status: row.status,
    };
    if (!out[row.propertyId]) out[row.propertyId] = [];
    out[row.propertyId].push(entry);
  }
  return out;
}
