import { apiClient } from "@/lib/api/client";
import type { DealerKycDocument, DealerKycRecord, KycDocumentType } from "@/types";

export const kycService = {
  getMine() {
    return apiClient<DealerKycRecord | null>("/api/dealer/kyc");
  },
  save(input: {
    panNumber?: string | null;
    aadhaarLast4?: string | null;
    dealerNotes?: string;
    directoryProfileId?: string | null;
    submit?: boolean;
  }) {
    return apiClient<DealerKycRecord>("/api/dealer/kyc", {
      method: "PUT",
      body: JSON.stringify(input),
    });
  },
  async uploadDocument(file: File, docType: KycDocumentType) {
    const body = new FormData();
    body.append("file", file);
    body.append("docType", docType);
    const res = await fetch("/api/dealer/kyc/documents", {
      method: "POST",
      body,
      credentials: "same-origin",
    });
    const data = (await res.json().catch(() => ({}))) as DealerKycDocument & {
      error?: string;
    };
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data as DealerKycDocument;
  },
  adminList(status?: string) {
    const q = status ? `?status=${encodeURIComponent(status)}` : "";
    return apiClient<{ items: DealerKycRecord[] }>(`/api/admin/kyc${q}`);
  },
  adminReview(
    id: string,
    input: {
      action: "approve" | "reject";
      adminNotes?: string;
      rejectionReason?: string;
    }
  ) {
    return apiClient<DealerKycRecord>(`/api/admin/kyc/${id}`, {
      method: "PATCH",
      body: JSON.stringify(input),
    });
  },
};
