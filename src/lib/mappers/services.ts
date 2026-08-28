import type {
  ServiceBooking,
  ServiceType,
  ServiceVerification,
  ServiceVerificationDocument,
} from "@/types";
import type {
  ServiceBookingRow,
  ServiceTypeRow,
  ServiceVerificationDocumentRow,
  ServiceVerificationRow,
} from "@/types/database";

export function mapServiceTypeRow(row: ServiceTypeRow): ServiceType {
  return {
    id: row.id,
    name: row.name,
    description: row.description ?? "",
    icon: row.icon,
    active: row.active,
    sortOrder: row.sort_order,
  };
}

export function mapServiceBookingRow(
  row: ServiceBookingRow,
  extras?: { firmName?: string; city?: string }
): ServiceBooking {
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    userId: row.user_id,
    preferredAt: row.preferred_at,
    message: row.message,
    contactPhone: row.contact_phone,
    status: row.status,
    ownerNotes: row.owner_notes,
    createdAt: row.created_at,
    firmName: extras?.firmName,
    city: extras?.city,
  };
}

export function mapServiceVerificationDocRow(
  row: ServiceVerificationDocumentRow
): ServiceVerificationDocument {
  return {
    id: row.id,
    verificationId: row.verification_id,
    docType: row.doc_type,
    storagePath: row.storage_path,
    fileName: row.file_name,
    createdAt: row.created_at,
  };
}

export function mapServiceVerificationRow(
  row: ServiceVerificationRow,
  extras?: {
    documents?: ServiceVerificationDocument[];
    firmName?: string;
    ownerName?: string;
    city?: string;
    category?: string;
  }
): ServiceVerification {
  return {
    id: row.id,
    directoryProfileId: row.directory_profile_id,
    userId: row.user_id,
    status: row.status,
    businessRegistrationId: row.business_registration_id,
    ownerNotes: row.owner_notes,
    adminNotes: row.admin_notes,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    documents: extras?.documents,
    firmName: extras?.firmName,
    ownerName: extras?.ownerName,
    city: extras?.city,
    category: extras?.category,
  };
}
