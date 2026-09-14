"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { propertyService, projectService } from "@/services";
import type { Project, Property } from "@/types";
import { CheckCircle2, XCircle, MapPin, Bed, Square, Clock, Building2 } from "lucide-react";
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
import { ListingPreviewModal } from "@/features/admin";

type QueueKind = "property" | "project";

type QueueItem =
  | { kind: "property"; item: Property }
  | { kind: "project"; item: Project };

export default function AdminApprovalsPage() {
  const { updateProperty, addLog, userEmail, refreshProperties, adminUsers } = useApp();
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewProperty, setPreviewProperty] = useState<Property | null>(null);
  const [pendingReject, setPendingReject] = useState<{
    kind: QueueKind;
    id: string;
    title: string;
  } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setActionError(null);
    try {
      const [propsPage, projectsPage] = await Promise.all([
        propertyService.listPage({
          status: "Pending Review",
          limit: 100,
          offset: 0,
        }),
        projectService.listPage({
          status: "Pending Review",
          limit: 100,
          offset: 0,
        }),
      ]);
      setQueue([
        ...propsPage.items.map((item) => ({ kind: "property" as const, item })),
        ...projectsPage.items.map((item) => ({ kind: "project" as const, item })),
      ]);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to load approval queue");
      setQueue([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const approve = async (kind: QueueKind, id: string, title: string) => {
    setActionError(null);
    setBusy(true);
    try {
      if (kind === "property") {
        await updateProperty(id, { status: "Active", rejectionReason: null });
        addLog({
          action: "Property Approved",
          performedBy: userEmail,
          role: "Admin",
          target: title,
        });
        void refreshProperties();
      } else {
        await projectService.update(id, { status: "Active", rejectionReason: null });
        addLog({
          action: "Project Approved",
          performedBy: userEmail,
          role: "Admin",
          target: title,
        });
      }
      setQueue((prev) => prev.filter((q) => !(q.kind === kind && q.item.id === id)));
      setPreviewProperty((prev) => (prev?.id === id ? null : prev));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to approve listing");
    } finally {
      setBusy(false);
    }
  };

  const rejectWithReason = async (
    kind: QueueKind,
    id: string,
    title: string,
    reason: string
  ) => {
    const trimmed = reason.trim();
    if (!trimmed) {
      setActionError("A rejection reason is required.");
      return;
    }
    setActionError(null);
    setBusy(true);
    try {
      if (kind === "property") {
        await updateProperty(id, {
          status: "Rejected",
          rejectionReason: trimmed,
        });
        addLog({
          action: `Property Rejected: ${trimmed.slice(0, 120)}`,
          performedBy: userEmail,
          role: "Admin",
          target: title,
        });
        void refreshProperties();
      } else {
        await projectService.update(id, {
          status: "Rejected",
          rejectionReason: trimmed,
        });
        addLog({
          action: `Project Rejected: ${trimmed.slice(0, 120)}`,
          performedBy: userEmail,
          role: "Admin",
          target: title,
        });
      }
      setQueue((prev) => prev.filter((q) => !(q.kind === kind && q.item.id === id)));
      setPreviewProperty(null);
      setPendingReject(null);
      setRejectReason("");
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to reject listing");
    } finally {
      setBusy(false);
    }
  };

  const openReject = (kind: QueueKind, id: string, title: string) => {
    setRejectReason("");
    setPendingReject({ kind, id, title });
    setPreviewProperty(null);
  };

  const confirmReject = async () => {
    if (!pendingReject) return;
    await rejectWithReason(
      pendingReject.kind,
      pendingReject.id,
      pendingReject.title,
      rejectReason
    );
  };

  const formatPrice = useMemo(
    () => (v: number) =>
      "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v),
    []
  );

  const propertyCount = queue.filter((q) => q.kind === "property").length;
  const projectCount = queue.filter((q) => q.kind === "project").length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Approval Queue"
        description={
          loading
            ? "Loading listings…"
            : queue.length > 0
              ? `${propertyCount} properties · ${projectCount} projects waiting for review`
              : "All properties and projects are up to date"
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
      ) : queue.length === 0 ? (
        <EmptyState
          title="All caught up!"
          description="No listings pending review."
          icon={<CheckCircle2 className="w-14 h-14 text-emerald-600/40" />}
        />
      ) : (
        <div className="space-y-5">
          {queue.map((entry, i) => {
            if (entry.kind === "project") {
              const project = entry.item;
              return (
                <motion.div
                  key={`project-${project.id}`}
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
                            project.images?.[0] ||
                            "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"
                          }
                          alt={project.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <Badge tone="info" size="sm">
                                Project
                              </Badge>
                            </div>
                            <h3 className="text-base font-serif font-black text-charcoal">
                              {project.title}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-1">
                              <MapPin className="w-3 h-3 text-charcoal/30" />
                              <p className="text-xs text-charcoal/50 font-semibold">
                                {project.city}
                              </p>
                            </div>
                          </div>
                          <Badge status="Pending Review" className="gap-1.5 py-1.5 px-3 rounded-xl">
                            <Clock className="w-3.5 h-3.5" />
                            Pending Review
                          </Badge>
                        </div>
                        <p className="text-xs text-charcoal/50 font-semibold leading-relaxed line-clamp-2 mb-4">
                          {project.description}
                        </p>
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div>
                            <p className="text-[10px] text-charcoal/30 font-black uppercase tracking-wider">
                              Submitted by
                            </p>
                            <p className="text-sm font-bold text-charcoal">
                              {project.contactName || "Dealer"}
                            </p>
                          </div>
                          <div className="flex gap-3">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => openReject("project", project.id, project.title)}
                              className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                            >
                              <XCircle className="w-4 h-4" /> Reject
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={busy}
                              onClick={() => approve("project", project.id, project.title)}
                              className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                            >
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            }

            const prop = entry.item;
            return (
              <motion.div
                key={`property-${prop.id}`}
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
                          <div className="flex items-center gap-2 mb-1">
                            <Badge tone="neutral" size="sm" className="gap-1">
                              <Building2 className="w-3 h-3" /> Property
                            </Badge>
                          </div>
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
                          {adminUsers.find(
                            (u) =>
                              u.email.toLowerCase() === (prop.ownerEmail || "").toLowerCase()
                          )?.role === "user" ? (
                            <Badge tone="info" size="sm" className="mt-1">
                              Client listing
                            </Badge>
                          ) : (
                            <Badge tone="neutral" size="sm" className="mt-1">
                              Dealer listing
                            </Badge>
                          )}
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
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={busy}
                      onClick={() => setPreviewProperty(prop)}
                      className="text-indigo font-bold px-0 hover:bg-transparent hover:underline"
                    >
                      Preview Listing →
                    </Button>
                    <div className="flex gap-3">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => openReject("property", prop.id, prop.title)}
                        className="border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={busy}
                        onClick={() => approve("property", prop.id, prop.title)}
                        className="border-emerald-500/20 text-emerald-600 hover:bg-emerald-500/10"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Approve
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      <ListingPreviewModal
        property={previewProperty}
        open={Boolean(previewProperty)}
        onClose={() => {
          if (!busy) setPreviewProperty(null);
        }}
        busy={busy}
        onApprove={(prop) => approve("property", prop.id, prop.title)}
        onReject={(prop) => openReject("property", prop.id, prop.title)}
        onRejectWithReason={(prop, reason) =>
          rejectWithReason("property", prop.id, prop.title, reason)
        }
      />

      <ConfirmDialog
        open={Boolean(pendingReject)}
        onClose={() => {
          if (!busy) {
            setPendingReject(null);
            setRejectReason("");
          }
        }}
        onConfirm={confirmReject}
        title={pendingReject?.kind === "project" ? "Reject project?" : "Reject listing?"}
        description={
          pendingReject
            ? `Mark "${pendingReject.title}" as Rejected. It is kept for revision — not deleted.`
            : undefined
        }
        confirmLabel="Reject"
        tone="danger"
        loading={busy}
      >
        <FormField label="Rejection reason" required className="mt-4 text-left">
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Explain what must be fixed before resubmitting…"
            className="resize-none"
          />
        </FormField>
      </ConfirmDialog>
    </div>
  );
}
