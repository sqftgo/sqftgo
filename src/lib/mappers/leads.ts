import type { AssistanceRequest, GeneralEnquiry } from "@/types";
import type { AssistanceRequestRow, AssistanceStatusDb, GeneralEnquiryRow } from "@/types/database";

export function mapAssistanceRow(row: AssistanceRequestRow): AssistanceRequest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    budget: row.budget,
    areas: row.areas ?? [],
    bhk: row.bhk,
    familySize: row.family_size,
    moveInDate: row.move_in_date,
    notes: row.notes,
    status: row.status,
  };
}

export function mapEnquiryRow(row: GeneralEnquiryRow): GeneralEnquiry & { payload?: Record<string, unknown> | null } {
  return {
    id: row.id,
    name: row.name,
    city: row.city,
    propertyType: row.property_type,
    budget: row.budget,
    email: row.email,
    mobile: row.mobile,
    remarks: row.remarks,
    message: row.message ?? undefined,
    date: row.created_at.split("T")[0] ?? row.created_at,
    payload: (row.payload as Record<string, unknown> | null) ?? undefined,
  };
}

export function mapAssistanceStatus(status: AssistanceRequest["status"]): AssistanceStatusDb {
  return status;
}
