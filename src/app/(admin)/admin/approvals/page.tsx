"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { propertyService } from "@/services";
import type { Property } from "@/types";
import { CheckCircle2, XCircle, MapPin, Bed, Square, Clock } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  DashboardPageHeader,
  ConfirmDialog,
  Badge,
  EmptyState,
  Button,
  Alert,
  FormField,
  TextArea,
} from "@/components/ui";

export default function AdminApprovalsPage() {
  const { updateProperty, addLog, userEmail, refreshProperties } = useApp();
  const [pending, setPending] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingReject, setPendingReject] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const page = await propertyService.listPage({
        status: "Pending Review",
        limit: 100,
        offset: 0,
      });
      setPending(page.items);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to load approval queue");
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (id: string, title: string) => {
    setActionError(null);
    setBusy(true);
    try {
      await updateProperty(id, { status: "Active", rejectionReason: null });
      addLog({
        action: "Property Approved",
        performedBy: userEmail,
        role: "Admin",
        target: title,
      });
      setPending((prev) => prev.filter((p) => p.id !== id));
      void refreshProperties();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to approve listing");
    } finally {
      setBusy(false);
    }
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    const reason = rejectReason.trim();
    if (!reason) {
      setActionError("A rejection reason is required.");
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      await updateProperty(pendingReject.id, {
        status: "Rejected",
        rejectionReason: reason,
      });
      addLog({
        action: `Property Rejected: ${reason.slice(0, 120)}`,
        performedBy: userEmail,
        role: "Admin",
        target: pendingReject.title,
      });
      setPending((prev) => prev.filter((p) => p.id !== pendingReject.id));
      setPendingReject(null);
      setRejectReason("");
      void refreshProperties();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to reject listing");
    } finally {
      setBusy(false);
    }
  };

  const formatPrice = useMemo(
    () => (v: number) =>
      "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v),
    []
  );

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Property Approval Queue"
        description={
          loading
            ? "Loading listings…"
            : pending.length > 0
              ? `${pending.length} listings waiting for review`
              : "All listings are up to date"
        }
      />

      {actionError ? (
        <Alert
          variant="danger"
          title="Action failed"
          description={actionError}
          onDismiss={() => setActionError(null)}
        />
      ) : null}

      {loading ? (
        <Alert variant="info" title="Loading" description="Fetching pending listings…" />
      ) : pending.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="No listings pending review."
          icon={<CheckCircle2 className="w-14 h-14 text-emerald-600/40" />}
        />
      ) : (
        <div className="space-y-5">
          {pending.map((prop, i) => (
            <motion.div
              key={prop.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="bg-white/80 border border-amber-500/20 rounded-2xl overflow-hidden shadow-sm"
            >
              <div className="p-5 md:p-6">
                <div className="flex flex-col md:flex-row gap-5">
                  <div className="w-full md:w-48 h-40 rounded-xl overflow-hidden shrink-0 bg-sand/35 border border-indigo/5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        prop.images?.[0] ||
                        "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"
                      }
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                      <div>
                        <h3 className="text-base font-serif font-black text-charcoal">
                          {prop.title}
                        </h3>
                        <div className="flex items-center gap-1.5 mt-1">
                          <MapPin className="w-3 h-3 text-charcoal/30" />
                          <p className="text-xs text-charcoal/50 font-semibold">
                            {prop.locality}, {prop.city}
                          </p>
                        </div>
                      </div>
                      <Badge status="Pending Review" className="gap-1.5 py-1.5 px-3 rounded-xl">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Review
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-3">
                      <div className="flex items-center gap-1.5 text-xs text-charcoal/50 font-semibold">
                        <Bed className="w-3.5 h-3.5 text-charcoal/30" />
                        {prop.bhk || "—"} BHK
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-charcoal/50 font-semibold">
                        <Square className="w-3.5 h-3.5 text-charcoal/30" />
                        {prop.size} sq.ft.
                      </div>
                      <span className="text-xs text-charcoal/50 font-semibold">
                        {prop.type} · {prop.furnished}
                      </span>
                    </div>

                    <p className="text-xs text-charcoal/50 font-semibold leading-relaxed line-clamp-2 mb-4">
                      {prop.description}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[10px] text-charcoal/30 font-black uppercase tracking-wider">
                          Submitted by
                        </p>
                        <p className="text-sm font-bold text-charcoal">{prop.ownerName}</p>
                        <p className="text-[10px] text-charcoal/40">{prop.ownerEmail}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-charcoal/30 font-black uppercase tracking-wider">
                          Price
                        </p>
                        <p className="text-xl font-serif font-black text-indigo">
                          {formatPrice(prop.price)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {prop.reraId && (
                  <div className="mt-4 pt-4 border-t border-indigo/5 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-[10px] text-emerald-600 font-bold">
                      RERA Registered: {prop.reraId}
                    </span>
                  </div>
                )}

                <div className="mt-5 pt-4 border-t border-indigo/5 flex items-center justify-between flex-wrap gap-3">
                  <Link
                    href={`/property/${prop.id}`}
                    target="_blank"
                    className="text-xs text-indigo font-bold hover:underline"
                  >
                    Preview Listing →
                  </Link>
                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => {
                        setRejectReason("");
                        setPendingReject({ id: prop.id, title: prop.title });
                      }}
                      className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busy}
                      onClick={() => approve(prop.id, prop.title)}
                      className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingReject)}
        onClose={() => {
          if (!busy) {
            setPendingReject(null);
            setRejectReason("");
          }
        }}
        onConfirm={confirmReject}
        title="Reject listing?"
        description={
          pendingReject
            ? `Mark "${pendingReject.title}" as Rejected. The listing is kept for the dealer to revise — it is not deleted.`
            : undefined
        }
        confirmLabel="Reject listing"
        tone="danger"
        loading={busy}
      >
        <FormField label="Rejection reason" required className="mt-4 text-left">
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explain what the dealer must fix before resubmitting…"
            className="resize-none"
          />
        </FormField>
      </ConfirmDialog>
    </div>
  );
}
