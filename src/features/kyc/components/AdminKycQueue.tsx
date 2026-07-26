"use client";

import React, { useEffect, useState } from "react";
import { kycService } from "@/services";
import type { DealerKycRecord } from "@/types";
import {
  DashboardPageHeader,
  Alert,
  Panel,
  Badge,
  Button,
  ConfirmDialog,
  TextArea,
  FormField,
} from "@/components/ui";

export function AdminKycQueue() {
  const [items, setItems] = useState<DealerKycRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<DealerKycRecord | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await kycService.adminList("pending");
      setItems(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load KYC queue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const confirm = async () => {
    if (!pending || !action) return;
    if (action === "reject" && !reason.trim()) {
      setError("Rejection reason is required");
      return;
    }
    setBusy(true);
    try {
      await kycService.adminReview(pending.id, {
        action,
        adminNotes: notes,
        rejectionReason: action === "reject" ? reason : undefined,
      });
      setPending(null);
      setAction(null);
      setReason("");
      setNotes("");
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Review failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal w-full space-y-6">
      <DashboardPageHeader
        title="Dealer KYC reviews"
        description="Private submissions from dealer_kyc. Approve or reject with a reason."
      />

      {error ? <Alert variant="danger" title="Error" description={error} /> : null}
      {loading ? (
        <Alert variant="info" title="Loading" description="Fetching pending KYC…" />
      ) : null}

      {items.length === 0 && !loading ? (
        <Panel padding="lg" rounded="3xl">
          <p className="text-sm font-semibold text-charcoal/55">No pending KYC submissions.</p>
        </Panel>
      ) : (
        <div className="space-y-4">
          {items.map((row) => (
            <Panel key={row.id} padding="lg" rounded="3xl" className="space-y-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-serif font-black text-charcoal">
                    {row.userName || "Dealer"}{" "}
                    <span className="text-charcoal/45 font-sans text-xs font-semibold">
                      {row.userEmail}
                    </span>
                  </p>
                  <p className="text-[11px] text-charcoal/50 font-semibold mt-1">
                    Submitted{" "}
                    {row.submittedAt ? new Date(row.submittedAt).toLocaleString() : "—"}
                  </p>
                </div>
                <Badge tone="warning" size="sm">
                  {row.status}
                </Badge>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-semibold">
                <p>PAN: {row.panNumber || "—"}</p>
                <p>Aadhaar last4: {row.aadhaarLast4 || "—"}</p>
                <p>Docs: {row.documents.length}</p>
              </div>
              {row.dealerNotes ? (
                <p className="text-xs text-charcoal/60">{row.dealerNotes}</p>
              ) : null}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    setPending(row);
                    setAction("approve");
                  }}
                >
                  Approve
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPending(row);
                    setAction("reject");
                  }}
                >
                  Reject
                </Button>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pending && action)}
        onClose={() => {
          setPending(null);
          setAction(null);
        }}
        title={action === "approve" ? "Approve KYC?" : "Reject KYC?"}
        description="This updates dealer_kyc status and writes an activity log."
        confirmLabel={action === "approve" ? "Approve" : "Reject"}
        onConfirm={() => void confirm()}
        tone={action === "reject" ? "danger" : "warning"}
        loading={busy}
      >
        <div className="space-y-3">
          <FormField label="Admin notes">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </FormField>
          {action === "reject" ? (
            <FormField label="Rejection reason" required>
              <TextArea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </FormField>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  );
}
