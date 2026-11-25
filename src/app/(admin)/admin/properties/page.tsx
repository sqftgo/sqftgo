"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { useApp } from "@/context/AppContext";
import { propertyService } from "@/services";
import type { Property } from "@/types";
import {
  Trash2,
  ExternalLink,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Star,
  MapPin,
} from "lucide-react";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  SearchInput,
  ConfirmDialog,
  Badge,
  Alert,
  AdminCard,
  EmptyState,
} from "@/components/ui";
import { useActiveCities } from "@/hooks/useActiveCities";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80";

export default function AdminPropertiesPage() {
  const { updateProperty, deleteProperty, addLog, userEmail, refreshProperties } = useApp();
  const { cityOptionsWithAllCities: cityOptions } = useActiveCities();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [cityFilter, setCityFilter] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const page = await propertyService.listPage({ limit: 100, offset: 0 });
      setProperties(page.items.filter((p) => p.status !== "Draft"));
    } catch (err) {
      handleClientError(err, { fallback: "Unable to load properties" });
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const statusOptions = useMemo(
    () =>
      ["All", "Active", "Pending Review", "Rejected", "Sold", "Rented"].map((s) => ({
        label: s === "All" ? "All Statuses" : s,
        value: s,
      })),
    []
  );

  const filtered = properties.filter((p) => {
    const matchSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || p.status === statusFilter;
    const matchCity = cityFilter === "All" || p.city === cityFilter;
    return matchSearch && matchStatus && matchCity;
  });

  const handleStatusChange = async (id: string, title: string, status: Property["status"]) => {
    if (status === "Rejected") {
      setError("Use Approvals to reject a listing with a required reason.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProperty(id, {
        status,
        ...(status === "Active" || status === "Pending Review"
          ? { rejectionReason: null }
          : {}),
      });
      setProperties((prev) => prev.map((p) => (p.id === id ? updated : p)));
      addLog({
        action: `Property Status → ${status}`,
        performedBy: userEmail,
        role: "Admin",
        target: title,
      });
      void refreshProperties();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update status" });
    } finally {
      setBusy(false);
    }
  };

  const toggleFeatured = async (prop: Property) => {
    setBusy(true);
    setError(null);
    try {
      const updated = await updateProperty(prop.id, { featured: !prop.featured });
      setProperties((prev) => prev.map((p) => (p.id === prop.id ? updated : p)));
      addLog({
        action: updated.featured ? "Property Featured" : "Property Unfeatured",
        performedBy: userEmail,
        role: "Admin",
        target: prop.title,
      });
      void refreshProperties();
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
      await deleteProperty(pendingDelete.id);
      setProperties((prev) => prev.filter((p) => p.id !== pendingDelete.id));
      addLog({
        action: "Property Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.title,
      });
      setPendingDelete(null);
      void refreshProperties();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to delete property" });
    } finally {
      setBusy(false);
    }
  };

  const formatPrice = (v: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const accentFor = (status: Property["status"]) => {
    if (status === "Active") return "emerald" as const;
    if (status === "Pending Review") return "gold" as const;
    if (status === "Rejected") return "rose" as const;
    return "indigo" as const;
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Property Management"
        description={
          loading
            ? "Loading inventory…"
            : `${filtered.length} of ${properties.length} properties shown · reject via Approvals`
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
          placeholder="Search properties..."
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
        <EmptyState title="No properties found" description="Try a different search or filter." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((prop) => (
            <AdminCard
              key={prop.id}
              accent={accentFor(prop.status)}
              media={
                <div className="relative h-44 w-full bg-sand/40">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.images?.[0] || FALLBACK_IMG}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/55 via-transparent to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
                    <p className="font-serif text-xl font-black text-white drop-shadow-sm">
                      {formatPrice(prop.price)}
                    </p>
                    <Badge status={prop.status} size="sm" className="bg-white/95">
                      {prop.status}
                    </Badge>
                  </div>
                </div>
              }
              footer={
                <>
                  <select
                    value={prop.status === "Rejected" ? "Rejected" : prop.status}
                    disabled={busy || prop.status === "Rejected"}
                    onChange={(e) =>
                      handleStatusChange(
                        prop.id,
                        prop.title,
                        e.target.value as Property["status"]
                      )
                    }
                    className="bg-white border border-indigo/10 rounded-xl px-3 py-1.5 text-xs font-semibold cursor-pointer disabled:opacity-60"
                  >
                    {["Active", "Pending Review", "Sold", "Rented"].map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                    {prop.status === "Rejected" ? (
                      <option value="Rejected">Rejected</option>
                    ) : null}
                  </select>
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
                        id: "view",
                        label: "View Public Page",
                        href: `/property/${prop.id}`,
                        target: "_blank",
                        icon: ExternalLink,
                      },
                      {
                        id: "feature",
                        label: prop.featured ? "Remove Featured" : "Mark Featured",
                        onClick: () => void toggleFeatured(prop),
                        icon: Star,
                        disabled: busy,
                      },
                      {
                        id: "status-active",
                        label: "Approve Listing",
                        onClick: () => void handleStatusChange(prop.id, prop.title, "Active"),
                        icon: CheckCircle2,
                        disabled: busy || prop.status === "Active",
                      },
                      {
                        id: "status-pending",
                        label: "Mark Pending Review",
                        onClick: () =>
                          void handleStatusChange(prop.id, prop.title, "Pending Review"),
                        icon: XCircle,
                        disabled: busy || prop.status === "Pending Review",
                      },
                      {
                        id: "delete",
                        label: "Delete Listing",
                        onClick: () => setPendingDelete({ id: prop.id, title: prop.title }),
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
                  {prop.title}
                </h3>
                <div className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-charcoal/50">
                  <MapPin className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">
                    {prop.locality ? `${prop.locality}, ` : ""}
                    {prop.city}
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge tone="neutral" size="sm">
                  {prop.type} · {prop.purpose}
                </Badge>
                {prop.featured ? (
                  <Badge tone="warning" size="sm">
                    Featured
                  </Badge>
                ) : null}
              </div>
              <p className="text-xs font-semibold text-charcoal/55">
                Owner · {prop.ownerName}
              </p>
              {prop.status === "Rejected" && prop.rejectionReason ? (
                <p className="text-[11px] text-rose-600 font-semibold leading-snug line-clamp-2">
                  {prop.rejectionReason}
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
        title="Delete property?"
        description={
          pendingDelete
            ? `Delete "${pendingDelete.title}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
        loading={busy}
      />
    </div>
  );
}
