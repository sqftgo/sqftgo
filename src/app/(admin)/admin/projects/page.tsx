"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { useApp } from "@/context/AppContext";
import { projectService } from "@/services";
import type { Project } from "@/types";
import { Trash2, MoreVertical, CheckCircle2, XCircle, Star, MapPin } from "lucide-react";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  SearchInput,
  ConfirmDialog,
  Badge,
  Alert,
  FormField,
  TextArea,
  AdminCard,
  EmptyState,
} from "@/components/ui";
import { useInvalidateMarketplace, useActiveCities } from "@/hooks";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

export default function AdminProjectsPage() {
  const { addLog, userEmail } = useApp();
  const { invalidateProjects } = useInvalidateMarketplace();
  const { cityOptionsWithAllCities: cityOptions } = useActiveCities();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [pendingReject, setPendingReject] = useState<{ id: string; title: string } | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await projectService.listPage({ limit: 100, offset: 0 });
      setProjects(page.items.filter((p) => p.status !== "Draft"));
    } catch (err) {
      handleClientError(err, { fallback: "Unable to load projects" });
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusOptions = useMemo(
    () =>
      ["All", "Active", "Pending Review", "Rejected", "Sold"].map((s) => ({
        label: s === "All" ? "All Statuses" : s,
        value: s,
      })),
    []
  );

  const filtered = projects.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.contactName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchCity = cityFilter === "All" || p.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const formatPrice = (p: Project) => {
    if (p.priceFrom == null && p.priceTo == null) return "On request";
    const fmt = (v: number) =>
      "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);
    if (p.priceFrom != null && p.priceTo != null) return `${fmt(p.priceFrom)} – ${fmt(p.priceTo)}`;
    if (p.priceFrom != null) return `From ${fmt(p.priceFrom)}`;
    return `Up to ${fmt(p.priceTo!)}`;
  };

  const handleStatusChange = async (
    id: string,
    title: string,
    status: Project["status"],
    reason?: string
  ) => {
    if (status === "Rejected") {
      const trimmed = reason?.trim() ?? "";
      if (!trimmed) {
        setError("A rejection reason is required.");
        return;
      }
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await projectService.update(id, {
        status,
        ...(status === "Rejected"
          ? { rejectionReason: reason!.trim() }
          : status === "Active" || status === "Pending Review"
            ? { rejectionReason: null }
            : {}),
      });
      setProjects((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addLog({
        action: `Project Status → ${status}`,
        performedBy: userEmail,
        role: "Admin",
        target: title,
      });
      void invalidateProjects();
      setPendingReject(null);
      setRejectReason("");
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update status" });
    } finally {
      setBusy(false);
    }
  };

  const toggleFeatured = async (project: Project) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await projectService.update(project.id, { featured: !project.featured });
      setProjects((prev) => prev.map((p) => (p.id === project.id ? updated : p)));
      addLog({
        action: updated.featured ? "Project Featured" : "Project Unfeatured",
        performedBy: userEmail,
        role: "Admin",
        target: project.title,
      });
      void invalidateProjects();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update featured flag" });
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusy(true);
    try {
      await projectService.remove(pendingDelete.id);
      setProjects((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      addLog({
        action: "Project Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.title,
      });
      setPendingDelete(null);
      void invalidateProjects();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to delete project" });
    } finally {
      setBusy(false);
    }
  };

  const accentFor = (status: Project["status"]) => {
    if (status === "Active") return "emerald" as const;
    if (status === "Pending Review") return "gold" as const;
    if (status === "Rejected") return "rose" as const;
    return "indigo" as const;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Project Management"
        description={
          loading
            ? "Loading projects…"
            : `${filtered.length} of ${projects.length} projects shown`
        }
      />

      {error ? (
        <Alert
          variant="danger"
          title="Action failed"
          description={error}
          onDismiss={() => setError(null)}
        />
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          accent="terracotta"
        />
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          accent="terracotta"
          buttonClassName="bg-sand/35 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
          className="w-44"
        />
        <CustomSelect
          options={cityOptions}
          value={cityFilter}
          onChange={setCityFilter}
          accent="terracotta"
          buttonClassName="bg-sand/35 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
          className="w-44"
        />
      </div>

      {loading ? (
        <p className="text-sm font-semibold text-charcoal/50">Loading…</p>
      ) : filtered.length === 0 ? (
        <EmptyState title="No projects found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((row) => (
            <AdminCard
              key={row.id}
              accent={accentFor(row.status)}
              media={
                <div className="relative h-44 w-full bg-sand/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={row.images[0] || FALLBACK_IMG}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <p className="font-serif text-lg font-black text-white drop-shadow-sm line-clamp-1">
                      {formatPrice(row)}
                    </p>
                    <Badge status={row.status} size="sm" className="bg-white/95 shrink-0">
                      {row.status}
                    </Badge>
                  </div>
                </div>
              }
              footer={
                <>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/45">
                    {row.contactName}
                  </span>
                  <DropdownMenu
                    accent="terracotta"
                    align="right"
                    trigger={
                      <button
                        type="button"
                        className="p-2 bg-white border border-indigo/10 text-charcoal/45 hover:text-terracotta rounded-xl transition-colors cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    }
                    items={[
                      {
                        id: "feature",
                        label: row.featured ? "Remove Featured" : "Mark Featured",
                        onClick: () => void toggleFeatured(row),
                        icon: Star,
                        disabled: busy,
                      },
                      {
                        id: "status-active",
                        label: "Approve Project",
                        onClick: () => void handleStatusChange(row.id, row.title, "Active"),
                        icon: CheckCircle2,
                        disabled: busy || row.status === "Active",
                      },
                      {
                        id: "status-pending",
                        label: "Mark Pending Review",
                        onClick: () =>
                          void handleStatusChange(row.id, row.title, "Pending Review"),
                        icon: XCircle,
                        disabled: busy || row.status === "Pending Review",
                      },
                      {
                        id: "reject",
                        label: "Reject…",
                        onClick: () => {
                          setRejectReason("");
                          setPendingReject({ id: row.id, title: row.title });
                        },
                        icon: XCircle,
                        disabled: busy,
                      },
                      {
                        id: "delete",
                        label: "Delete Project",
                        onClick: () => setPendingDelete({ id: row.id, title: row.title }),
                        icon: Trash2,
                        variant: "danger",
                        dividerBefore: true,
                      },
                    ]}
                  />
                </>
              }
            >
              <div>
                <h3 className="font-serif text-base font-black text-charcoal line-clamp-2 leading-snug">
                  {row.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-charcoal/50">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {row.locality}, {row.city}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="neutral" size="sm">
                  {row.ownershipRole} · {row.lifecycle}
                </Badge>
                {row.featured ? (
                  <Badge tone="warning" size="sm">
                    Featured
                  </Badge>
                ) : null}
              </div>
              {row.status === "Rejected" && row.rejectionReason ? (
                <p className="text-[11px] text-rose-600 font-semibold leading-snug line-clamp-2">
                  {row.rejectionReason}
                </p>
              ) : null}
            </AdminCard>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Delete project?"
        description={
          pendingDelete
            ? `Delete “${pendingDelete.title}”? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
      />

      <ConfirmDialog
        open={Boolean(pendingReject)}
        onClose={() => {
          setPendingReject(null);
          setRejectReason("");
        }}
        onConfirm={() => {
          if (!pendingReject) return;
          void handleStatusChange(
            pendingReject.id,
            pendingReject.title,
            "Rejected",
            rejectReason
          );
        }}
        title="Reject project?"
        description="Dealers will see this reason on their dashboard."
        confirmLabel="Reject"
        tone="danger"
        loading={busy}
      >
        <FormField label="Rejection reason" required>
          <TextArea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            rows={3}
            placeholder="Incomplete pricing / missing photos / …"
          />
        </FormField>
      </ConfirmDialog>
    </div>
  );
}
