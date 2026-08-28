"use client";

import React, { useEffect, useState } from "react";
import { servicePlatformService } from "@/services";
import type { ServiceVerification } from "@/types";
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

export default function AdminServiceVerificationsPage() {
  const [items, setItems] = useState<ServiceVerification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<ServiceVerification | null>(null);
  const [action, setAction] = useState<"approve" | "reject" | null>(null);
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await servicePlatformService.adminListVerifications("pending");
      setItems(res.items);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load verification queue");
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
      await servicePlatformService.adminReviewVerification(pending.id, {
        status: action === "approve" ? "approved" : "rejected",
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
        title="Service verifications"
        description="Review service owner documents and approve verified badges on public profiles."
      />

      {error ? <Alert variant="danger" title="Error" description={error} /> : null}
      {loading ? (
        <Alert variant="info" title="Loading" description="Fetching pending submissions…" />
      ) : null}

      {!loading && items.length === 0 ? (
        <Panel className="p-8 text-center text-sm text-charcoal/60 font-semibold">
          No pending service verifications.
        </Panel>
      ) : null}

      <div className="grid gap-4">
        {items.map((item) => (
          <Panel key={item.id} className="p-5 flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-serif font-black text-lg text-indigo">
                  {item.firmName ?? "Service firm"}
                </h3>
                <p className="text-xs text-charcoal/60 font-semibold mt-1">
                  {item.ownerName} · {item.category} · {item.city}
                </p>
                {item.businessRegistrationId ? (
                  <p className="text-[11px] font-bold text-charcoal/50 mt-2">
                    Reg ID: {item.businessRegistrationId}
                  </p>
                ) : null}
                {item.ownerNotes ? (
                  <p className="text-sm text-charcoal/70 mt-2">{item.ownerNotes}</p>
                ) : null}
                <p className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40 mt-2">
                  Docs: {item.documents?.length ?? 0}
                </p>
              </div>
              <Badge tone="warning">Pending</Badge>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={() => {
                  setPending(item);
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
                  setPending(item);
                  setAction("reject");
                }}
              >
                Reject
              </Button>
            </div>
          </Panel>
        ))}
      </div>

      <ConfirmDialog
        open={!!pending && !!action}
        title={action === "approve" ? "Approve verification?" : "Reject verification?"}
        description={
          action === "approve"
            ? "This marks the public profile as verified."
            : "The owner can resubmit after fixing issues."
        }
        confirmLabel={action === "approve" ? "Approve" : "Reject"}
        tone={action === "reject" ? "danger" : "warning"}
        loading={busy}
        onClose={() => {
          if (busy) return;
          setPending(null);
          setAction(null);
        }}
        onConfirm={() => void confirm()}
      >
        <div className="space-y-3 mt-4">
          <FormField label="Admin notes">
            <TextArea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
          </FormField>
          {action === "reject" ? (
            <FormField label="Rejection reason (required)">
              <TextArea value={reason} onChange={(e) => setReason(e.target.value)} rows={2} />
            </FormField>
          ) : null}
        </div>
      </ConfirmDialog>
    </div>
  );
}
