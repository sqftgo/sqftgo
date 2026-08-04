"use client";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { propertyService } from "@/services";
import type { Property } from "@/types";
import { Trash2, ExternalLink, MoreVertical, CheckCircle2, XCircle, Star } from "lucide-react";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  SearchInput,
  DataTable,
  ConfirmDialog,
  Badge,
  Alert,
  type DataTableColumn,
} from "@/components/ui";

export default function AdminPropertiesPage() {
  const { updateProperty, deleteProperty, addLog, userEmail, refreshProperties } = useApp();
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
      setError(err instanceof Error ? err.message : "Unable to load properties");
      setProperties([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const cities = useMemo(() => [...new Set(properties.map((p) => p.city))], [properties]);

  const statusOptions = useMemo(
    () =>
      ["All", "Active", "Pending Review", "Rejected", "Sold", "Rented"].map((s) => ({
        label: s === "All" ? "All Statuses" : s,
        value: s,
      })),
    []
  );

  const cityOptions = useMemo(
    () => [{ label: "All Cities", value: "All" }, ...cities.map((c) => ({ label: c, value: c }))],
    [cities]
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
      setError(err instanceof Error ? err.message : "Unable to update status");
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
      setError(err instanceof Error ? err.message : "Unable to update featured flag");
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
      setError(err instanceof Error ? err.message : "Unable to delete property");
    } finally {
      setBusy(false);
    }
  };

  const formatPrice = (v: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const columns: DataTableColumn<Property>[] = [
    {
      key: "property",
      header: "Property",
      render: (prop) => (
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl overflow-hidden bg-sand/35 border border-indigo/5 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={
                prop.images?.[0] ||
                "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=200&q=80"
              }
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
          <div className="max-w-[200px]">
            <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
            <p className="text-[10px] text-charcoal/40 font-semibold truncate">
              {prop.type} · {prop.purpose}
              {prop.featured ? " · Featured" : ""}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (prop) => (
        <span className="text-xs text-charcoal/60 font-semibold">{prop.ownerName}</span>
      ),
    },
    {
      key: "city",
      header: "City",
      render: (prop) => (
        <span className="text-xs text-charcoal/60 font-semibold">{prop.city}</span>
      ),
    },
    {
      key: "price",
      header: "Price",
      render: (prop) => (
        <span className="text-sm font-serif font-black text-indigo">{formatPrice(prop.price)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (prop) => (
        <div className="space-y-1 max-w-[160px]">
          <select
            value={prop.status === "Rejected" ? "Rejected" : prop.status}
            disabled={busy || prop.status === "Rejected"}
            onChange={(e) =>
              handleStatusChange(prop.id, prop.title, e.target.value as Property["status"])
            }
            className="bg-transparent cursor-pointer text-xs font-semibold disabled:opacity-60"
          >
            {["Active", "Pending Review", "Sold", "Rented"].map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
            {prop.status === "Rejected" ? <option value="Rejected">Rejected</option> : null}
          </select>
          {prop.status === "Rejected" && prop.rejectionReason ? (
            <p className="text-[10px] text-rose-600 font-semibold leading-snug line-clamp-2">
              {prop.rejectionReason}
            </p>
          ) : null}
        </div>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (prop) => (
        <div className="flex items-center gap-2">
          <Badge status={prop.status} size="sm">
            {prop.status}
          </Badge>
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
                onClick: () => void handleStatusChange(prop.id, prop.title, "Pending Review"),
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
        </div>
      ),
    },
  ];

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

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(p) => p.id}
        emptyMessage={loading ? "Loading…" : "No properties found."}
      />

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
