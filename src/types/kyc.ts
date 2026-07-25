export type KycStatus = "draft" | "pending" | "approved" | "rejected";

export type KycDocumentType = "pan_card" | "aadhaar" | "rera_certificate" | "other";

export type DealerKycDocument = {
  id: string;
  docType: KycDocumentType;
  fileName: string;
  createdAt: string;
};

export type DealerKycRecord = {
  id: string;
  userId: string;
  directoryProfileId: string | null;
  panNumber: string | null;
  aadhaarLast4: string | null;
  status: KycStatus;
  dealerNotes: string;
  adminNotes: string;
  rejectionReason: string | null;
  submittedAt: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  updatedAt: string;
  documents: DealerKycDocument[];
  /** Present on admin list responses */
  userEmail?: string;
  userName?: string;
};
