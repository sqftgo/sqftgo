import type {
  DealerKycDocumentRow,
  DealerKycRow,
} from "@/types/database";
import type {
  DealerKycDocument,
  DealerKycRecord,
  KycDocumentType,
} from "@/types/kyc";

export function mapKycDocument(row: DealerKycDocumentRow): DealerKycDocument {
  return {
    id: row.id,
    docType: row.doc_type as KycDocumentType,
    fileName: row.file_name,
    createdAt: row.created_at,
  };
}

export function mapDealerKyc(
  row: DealerKycRow,
  documents: DealerKycDocumentRow[] = [],
  extras?: { userEmail?: string; userName?: string }
): DealerKycRecord {
  return {
    id: row.id,
    userId: row.user_id,
    directoryProfileId: row.directory_profile_id,
    panNumber: row.pan_number,
    aadhaarLast4: row.aadhaar_last4,
    status: row.status,
    dealerNotes: row.dealer_notes,
    adminNotes: row.admin_notes,
    rejectionReason: row.rejection_reason,
    submittedAt: row.submitted_at,
    reviewedAt: row.reviewed_at,
    reviewedBy: row.reviewed_by,
    updatedAt: row.updated_at,
    documents: documents.map(mapKycDocument),
    userEmail: extras?.userEmail,
    userName: extras?.userName,
  };
}
