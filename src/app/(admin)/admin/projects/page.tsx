"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { projectService } from "@/services";
import type { Project } from "@/types";
import { Trash2, MoreVertical, CheckCircle2, XCircle, Star } from "lucide-react";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  SearchInput,
  DataTable,
  ConfirmDialog,
  Badge,
  Alert,
  FormField,
  TextArea,
  type DataTableColumn,
} from "@/components/ui";
import { useInvalidateMarketplace } from "@/hooks";

export default function AdminProjectsPage() {
  const { addLog, userEmail } = useApp();
  const { invalidateProjects } = useInvalidateMarketplace();
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
      setError(err instanceof Error ? err.message : "Unable to load projects");
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cities = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  const statusOptions = useMemo(
    () =>
      ["All", "Active", "Pending Review", "Rejected", "Sold"].map((s) => ({
        label: s === "All" ? "All Statuses" : s,
        value: s,
      })),
    [],
  );

  const cityOptions = useMemo(
    () => [{ label: "All Cities", value: "All" }, ...cities.map((c) => ({ label: c, value: c }))],
    [cities],
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
    reason?: string,
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
      setError(err instanceof Error ? err.message : "Unable to update status");
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
      setError(err instanceof Error ? err.message : "Unable to update featured flag");
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
      setError(err instanceof Error ? err.message : "Unable to delete project");
    } finally {
      setBusy(false);
    }
  };

  const columns: DataTableColumn<Project>[] = [
    {
      key: "project",
      header: "Project",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
            {row.images[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={row.images[0]} alt="" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-indigo/5" />
            )}
          </div>
          <div className="max-w-[220px]">
            <p className="text-sm font-bold text-charcoal truncate">{row.title}</p>
            <p className="text-[10px] text-charcoal/40 font-semibold truncate">
              {row.ownershipRole} · {row.lifecycle}
              {row.featured ? " · Featured" : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "contact",
      header: "Contact",
      render: (row) => (
        <span className="text-xs text-charcoal/60 font-semibold">{row.contactName}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (row) => (
        <span className="text-xs text-charcoal/60 font-semibold">
          {row.locality}, {row.city}
        </span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <span className="text-sm font-serif font-black text-indigo">{formatPrice(row)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <div className="space-y-1 max-w-[160px]">
          <Badge status={row.status}>{row.status}</Badge>
          {row.status === "Rejected" && row.rejectionReason ? (
            <p className="text-[10px] text-rose-600 font-semibold leading-snug line-clamp-2">
              {row.rejectionReason}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (row) => (
        <DropdownMenu
          accent="terracotta"
          align="right"
          trigger={
            <button
              type="button"
              className="p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-terracotta rounded-xl transition-all cursor-pointer"
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
              onClick: () => void handleStatusChange(row.id, row.title, "Pending Review"),
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
      ),
    },
  ];

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

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        emptyMessage={loading ? "Loading…" : "No projects found."}
      />

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
            rejectReason,
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
