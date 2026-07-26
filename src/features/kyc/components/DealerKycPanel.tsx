"use client";

import React, { useEffect, useState } from "react";
import { kycService } from "@/services";
import type { DealerKycRecord } from "@/types";
import { Alert, Button, FormField, TextInput, TextArea } from "@/components/ui";

export type DealerKycPanelProps = {
  directoryProfileId: string | null | undefined;
  reraId: string;
  onReraIdChange: (value: string) => void;
  inputClassName?: string;
  /** Notifies parent when KYC record loads or updates (e.g. profile badge). */
  onKycChange?: (record: DealerKycRecord | null) => void;
};

export function DealerKycPanel({
  directoryProfileId,
  reraId,
  onReraIdChange,
  inputClassName = "",
  onKycChange,
}: DealerKycPanelProps) {
  const [kyc, setKyc] = useState<DealerKycRecord | null>(null);
  const [kycForm, setKycForm] = useState({
    panNumber: "",
    aadhaarLast4: "",
    dealerNotes: "",
  });
  const [kycBusy, setKycBusy] = useState(false);
  const [kycError, setKycError] = useState<string | null>(null);
  const [kycMessage, setKycMessage] = useState<string | null>(null);

  useEffect(() => {
    onKycChange?.(kyc);
  }, [kyc, onKycChange]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const record = await kycService.getMine();
        if (cancelled) return;
        setKyc(record);
        if (record) {
          setKycForm({
            panNumber: record.panNumber ?? "",
            aadhaarLast4: record.aadhaarLast4 ?? "",
            dealerNotes: record.dealerNotes ?? "",
          });
        }
      } catch {
        // KYC optional until migration applied
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const locked = kyc?.status === "pending" || kyc?.status === "approved";

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-serif font-black text-charcoal">Private KYC & RERA</h3>
        <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
          KYC is stored in a private table (not on the public directory). RERA ID remains part of
          your public business profile.
        </p>
      </div>

      {kycError ? <Alert variant="danger" title="KYC error" description={kycError} /> : null}
      {kycMessage ? (
        <Alert variant="success" title="KYC updated" description={kycMessage} />
      ) : null}
      {kyc?.status === "rejected" && kyc.rejectionReason ? (
        <Alert variant="warning" title="KYC rejected" description={kyc.rejectionReason} />
      ) : null}

      <FormField label="RERA Registration Certificate ID (public directory)">
        <TextInput
          type="text"
          value={reraId}
          onChange={(e) => onReraIdChange(e.target.value)}
          placeholder="e.g. RAJ-RERA-A-2025-XXXX"
          className={inputClassName}
        />
      </FormField>

      <FormField label="PAN number (private)">
        <TextInput
          type="text"
          value={kycForm.panNumber}
          onChange={(e) =>
            setKycForm((f) => ({ ...f, panNumber: e.target.value.toUpperCase() }))
          }
          disabled={locked}
          placeholder="ABCDE1234F"
          className={inputClassName}
        />
      </FormField>

      <FormField label="Aadhaar last 4 digits (private)">
        <TextInput
          type="text"
          value={kycForm.aadhaarLast4}
          onChange={(e) =>
            setKycForm((f) => ({
              ...f,
              aadhaarLast4: e.target.value.replace(/\D/g, "").slice(0, 4),
            }))
          }
          disabled={locked}
          placeholder="1234"
          className={inputClassName}
          maxLength={4}
        />
      </FormField>

      <FormField label="Notes for reviewer">
        <TextArea
          value={kycForm.dealerNotes}
          onChange={(e) => setKycForm((f) => ({ ...f, dealerNotes: e.target.value }))}
          disabled={locked}
          rows={3}
        />
      </FormField>

      <FormField label="Upload document (PAN / Aadhaar / RERA PDF)">
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,application/pdf"
          disabled={locked || kycBusy}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setKycBusy(true);
            setKycError(null);
            try {
              const saved = await kycService.save({
                panNumber: kycForm.panNumber || null,
                aadhaarLast4: kycForm.aadhaarLast4 || null,
                dealerNotes: kycForm.dealerNotes,
                directoryProfileId: directoryProfileId ?? null,
                submit: false,
              });
              setKyc(saved);
              const doc = await kycService.uploadDocument(file, "other");
              setKyc((prev) =>
                prev ? { ...prev, documents: [doc, ...prev.documents] } : prev
              );
              setKycMessage(`Uploaded ${doc.fileName}`);
            } catch (err) {
              setKycError(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setKycBusy(false);
              e.target.value = "";
            }
          }}
          className="block w-full text-xs"
        />
        {kyc?.documents?.length ? (
          <p className="text-[10px] text-charcoal/50 font-semibold mt-2">
            {kyc.documents.length} document(s) on file
          </p>
        ) : null}
      </FormField>

      <div className="flex flex-wrap gap-2 justify-end pt-2">
        <Button
          type="button"
          variant="outline"
          size="md"
          disabled={kycBusy || locked}
          onClick={async () => {
            setKycBusy(true);
            setKycError(null);
            try {
              const saved = await kycService.save({
                panNumber: kycForm.panNumber || null,
                aadhaarLast4: kycForm.aadhaarLast4 || null,
                dealerNotes: kycForm.dealerNotes,
                directoryProfileId: directoryProfileId ?? null,
                submit: false,
              });
              setKyc(saved);
              setKycMessage("KYC draft saved");
            } catch (err) {
              setKycError(err instanceof Error ? err.message : "Save failed");
            } finally {
              setKycBusy(false);
            }
          }}
        >
          Save draft
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="md"
          disabled={kycBusy || locked}
          onClick={async () => {
            setKycBusy(true);
            setKycError(null);
            try {
              const saved = await kycService.save({
                panNumber: kycForm.panNumber || null,
                aadhaarLast4: kycForm.aadhaarLast4 || null,
                dealerNotes: kycForm.dealerNotes,
                directoryProfileId: directoryProfileId ?? null,
                submit: true,
              });
              setKyc(saved);
              setKycMessage("Submitted for admin review");
            } catch (err) {
              setKycError(err instanceof Error ? err.message : "Submit failed");
            } finally {
              setKycBusy(false);
            }
          }}
        >
          Submit for review
        </Button>
      </div>
    </div>
  );
}
