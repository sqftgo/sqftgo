"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useProjectsQuery, useInvalidateMarketplace } from "@/hooks";
import { projectService } from "@/services";
import type { Project } from "@/types";
import {
  Badge,
  ConfirmDialog,
  CustomSelect,
  DashboardPageHeader,
  EmptyState,
  ErrorState,
  GlobalLoading,
} from "@/components/ui";
import { Building2, Edit2, FolderKanban, Plus, Trash2 } from "lucide-react";

const STATUS_OPTIONS = ["All", "Active", "Pending Review", "Draft", "Rejected", "Sold"] as const;

export default function DealerProjectsPage() {
  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "All";
  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { invalidateProjects } = useInvalidateMarketplace();

  const query = useProjectsQuery({ mine: true, limit: 100, offset: 0 });
  const projects = query.data?.items ?? [];
  const loading = query.isPending || (query.isFetching && !query.data);

  const statusOptions = useMemo(
    () =>
      STATUS_OPTIONS.map((s) => ({
        label: s === "All" ? "All Statuses" : s,
        value: s,
      })),
    [],
  );

  const filtered = useMemo(() => {
    if (statusFilter === "All") return projects;
    return projects.filter((p) => p.status === statusFilter);
  }, [projects, statusFilter]);

  const formatPrice = (p: Project) => {
    if (p.priceFrom == null && p.priceTo == null) return "Price on request";
    const fmt = (v: number) =>
      "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);
    if (p.priceFrom != null && p.priceTo != null) {
      return `${fmt(p.priceFrom)} – ${fmt(p.priceTo)}`;
    }
    if (p.priceFrom != null) return `From ${fmt(p.priceFrom)}`;
    return `Up to ${fmt(p.priceTo!)}`;
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setBusyId(pendingDelete.id);
    try {
      await projectService.remove(pendingDelete.id);
      await invalidateProjects();
      setPendingDelete(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusyId(null);
    }
  };

  const setStatus = async (id: string, status: "Draft" | "Pending Review") => {
    setBusyId(id);
    try {
      await projectService.update(id, { status });
      await invalidateProjects();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <GlobalLoading />;
  if (query.isError) {
    return (
      <ErrorState
        title="Could not load projects"
        message={query.error instanceof Error ? query.error.message : "Try again"}
      />
    );
  }

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="My Projects"
        description="Developments and inventory you own or market."
        actions={
          <Link
            href="/dealer/dashboard/add-project"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-terracotta text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
        }
      />

      <div className="flex flex-wrap gap-3 items-center">
        <div className="w-48">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
          />
        </div>
        <p className="text-xs font-semibold text-charcoal/45">
          {filtered.length} project{filtered.length === 1 ? "" : "s"}
        </p>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<FolderKanban className="w-8 h-8" />}
          title="No projects yet"
          description="Add your first project to showcase owned or marketed inventory."
        >
          <Link
            href="/dealer/dashboard/add-project"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo text-white text-xs font-bold uppercase tracking-wider rounded-xl"
          >
            <Plus className="w-4 h-4" />
            Add Project
          </Link>
        </EmptyState>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="bg-white border border-indigo/10 rounded-3xl overflow-hidden shadow-sm flex flex-col"
            >
              <div className="relative h-40 bg-indigo/5">
                {p.images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.images[0]} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-indigo/30">
                    <Building2 className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <Badge status={p.status}>{p.status}</Badge>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col gap-3">
                <div>
                  <h3 className="font-serif font-black text-charcoal text-lg leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-xs font-semibold text-charcoal/45 mt-1">
                    {p.locality}, {p.city} · {p.ownershipRole} · {p.lifecycle}
                  </p>
                </div>
                <p className="text-sm font-bold text-indigo">{formatPrice(p)}</p>
                {p.rejectionReason ? (
                  <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                    Rejected: {p.rejectionReason}
                  </p>
                ) : null}
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <Link
                    href={`/dealer/dashboard/edit-project/${p.id}`}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-indigo/15 text-[11px] font-bold uppercase tracking-wider text-charcoal/70 hover:bg-indigo/5"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Edit
                  </Link>
                  {p.status === "Draft" ? (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => void setStatus(p.id, "Pending Review")}
                      className="px-3 py-2 rounded-xl bg-indigo/10 text-indigo text-[11px] font-bold uppercase tracking-wider disabled:opacity-50"
                    >
                      Submit
                    </button>
                  ) : null}
                  {p.status === "Pending Review" || p.status === "Rejected" ? (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => void setStatus(p.id, "Draft")}
                      className="px-3 py-2 rounded-xl border border-indigo/15 text-[11px] font-bold uppercase tracking-wider text-charcoal/60 disabled:opacity-50"
                    >
                      To Draft
                    </button>
                  ) : null}
                  {p.status !== "Active" ? (
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => setPendingDelete({ id: p.id, title: p.title })}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 text-red-600 text-[11px] font-bold uppercase tracking-wider hover:bg-red-50 disabled:opacity-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Delete
                    </button>
                  ) : null}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete project?"
        description={
          pendingDelete
            ? `“${pendingDelete.title}” will be permanently removed.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        onConfirm={() => void confirmDelete()}
        onClose={() => setPendingDelete(null)}
      />
    </div>
  );
}
