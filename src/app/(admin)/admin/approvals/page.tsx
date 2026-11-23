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
  AdminCard,
} from "@/components/ui";
import { ListingPreviewModal } from "@/features/admin";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {queue.map((entry, i) => {
            if (entry.kind === "project") {
              const project = entry.item;
              return (
                <motion.div
                  key={`project-${project.id}`}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <AdminCard
                    accent="gold"
                    media={
                      <div className="relative h-48 w-full bg-sand/40">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.images?.[0] || FALLBACK_IMG}
                          alt={project.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
                          <Badge tone="info" size="sm" className="bg-white/95">
                            Project
                          </Badge>
                          <Badge
                            status="Pending Review"
                            className="gap-1.5 bg-white/95 py-1.5 px-3 rounded-xl"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            Pending
                          </Badge>
                        </div>
                      </div>
                    }
                    footer={
                      <>
                        <div>
                          <p className="text-[10px] text-charcoal/40 font-black uppercase tracking-wider">
                            Submitted by
                          </p>
                          <p className="text-sm font-bold text-charcoal">
                            {project.contactName || "Dealer"}
                          </p>
                        </div>
                        <div className="flex gap-2">
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
                      </>
                    }
                  >
                    <h3 className="font-serif text-lg font-black text-charcoal leading-snug">
                      {project.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-charcoal/50 font-semibold">
                      <MapPin className="w-3.5 h-3.5" />
                      {project.city}
                    </div>
                    <p className="text-xs text-charcoal/55 font-semibold leading-relaxed line-clamp-2">
                      {project.description}
                    </p>
                  </AdminCard>
                </motion.div>
              );
            }

            const prop = entry.item;
            return (
              <motion.div
                key={`property-${prop.id}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <AdminCard
                  accent="gold"
                  media={
                    <div className="relative h-48 w-full bg-sand/40">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={prop.images?.[0] || FALLBACK_IMG}
                        alt={prop.title}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between gap-2">
                        <Badge tone="neutral" size="sm" className="gap-1 bg-white/95">
                          <Building2 className="w-3 h-3" /> Property
                        </Badge>
                        <Badge
                          status="Pending Review"
                          className="gap-1.5 bg-white/95 py-1.5 px-3 rounded-xl"
                        >
                          <Clock className="w-3.5 h-3.5" />
                          Pending
                        </Badge>
                      </div>
                      <p className="absolute bottom-3 left-4 font-serif text-2xl font-black text-white drop-shadow">
                        {formatPrice(prop.price)}
                      </p>
                    </div>
                  }
                  footer={
                    <>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={busy}
                        onClick={() => setPreviewProperty(prop)}
                        className="text-indigo font-bold px-0 hover:bg-transparent hover:underline"
                      >
                        Preview →
                      </Button>
                      <div className="flex gap-2">
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
                    </>
                  }
                >
                  <h3 className="font-serif text-lg font-black text-charcoal leading-snug">
                    {prop.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/50 font-semibold">
                    <MapPin className="w-3.5 h-3.5" />
                    {prop.locality}, {prop.city}
                  </div>
                  <div className="flex flex-wrap gap-3 text-xs text-charcoal/55 font-semibold">
                    <span className="inline-flex items-center gap-1">
                      <Bed className="w-3.5 h-3.5" />
                      {prop.bhk || "—"} BHK
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Square className="w-3.5 h-3.5" />
                      {prop.size} sq.ft.
                    </span>
                    <span>
                      {prop.type} · {prop.furnished}
                    </span>
                  </div>
                  <p className="text-xs text-charcoal/55 font-semibold leading-relaxed line-clamp-2">
                    {prop.description}
                  </p>
                  <div className="rounded-2xl bg-sand/40 px-3 py-2.5">
                    <p className="text-[10px] text-charcoal/40 font-black uppercase tracking-wider">
                      Submitted by
                    </p>
                    <p className="text-sm font-bold text-charcoal">{prop.ownerName}</p>
                    <p className="text-[11px] text-charcoal/45">{prop.ownerEmail}</p>
                    {adminUsers.find(
                      (u) => u.email.toLowerCase() === (prop.ownerEmail || "").toLowerCase()
                    )?.role === "user" ? (
                      <Badge tone="info" size="sm" className="mt-1.5">
                        Client listing
                      </Badge>
                    ) : (
                      <Badge tone="neutral" size="sm" className="mt-1.5">
                        Dealer listing
                      </Badge>
                    )}
                  </div>
                  {prop.reraId ? (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[11px] text-emerald-700 font-bold">
                        RERA {prop.reraId}
                      </span>
                    </div>
                  ) : null}
                </AdminCard>
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
