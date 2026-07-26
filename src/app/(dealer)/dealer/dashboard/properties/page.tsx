"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { Property } from "@/types";
import { usePropertiesQuery } from "@/hooks/queries/marketplace";
import { Plus, Edit2, Trash2, ExternalLink, Building2, CheckCircle2, XCircle, Grid, List, MoreVertical } from "lucide-react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  Badge,
  ConfirmDialog,
  DataTable,
  EmptyState,
  ErrorState,
  GlobalLoading,
  PropertyGridSkeleton,
  type DataTableColumn,
} from "@/components/ui";

const STATUS_OPTIONS = ["All", "Active", "Pending Review", "Sold", "Rented", "Draft", "Rejected"] as const;
const TYPE_OPTIONS = ["All", "Villa", "Apartment", "Home", "Office Space", "Shop", "Agricultural Land", "Hotel"];

export default function DealerPropertiesPage() {
  const { updateProperty, deleteProperty } = useApp();
  const myPropertiesQuery = usePropertiesQuery({ mine: true, limit: 100, offset: 0 });
  const properties = myPropertiesQuery.data?.items ?? [];
  const propertiesLoading =
    myPropertiesQuery.isPending || (myPropertiesQuery.isFetching && !myPropertiesQuery.data);

  const searchParams = useSearchParams();
  const statusParam = searchParams.get("status") || "All";

  const [statusFilter, setStatusFilter] = useState(statusParam);
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    setStatusFilter(statusParam);
  }, [statusParam]);

  const statusOptions = useMemo(() => STATUS_OPTIONS.map(s => ({
    label: s === "All" ? "All Statuses" : s,
    value: s
  })), []);

  const typeOptions = useMemo(() => TYPE_OPTIONS.map(t => ({
    label: t === "All" ? "All Types" : t,
    value: t
  })), []);

  const sortOptions = useMemo(() => [
    { label: "Newest First", value: "newest" },
    { label: "Price: High to Low", value: "price-desc" },
    { label: "Price: Low to High", value: "price-asc" },
  ], []);

  const myProperties = useMemo(() => {
    let props = [...properties];
    if (statusFilter !== "All") props = props.filter(p => p.status === statusFilter);
    if (typeFilter !== "All") props = props.filter(p => p.type === typeFilter);
    if (sortBy === "price-asc") props = [...props].sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") props = [...props].sort((a, b) => b.price - a.price);
    return props;
  }, [properties, statusFilter, typeFilter, sortBy]);

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    await deleteProperty(pendingDelete.id);
    setPendingDelete(null);
  };

  const handleStatusChange = async (id: string, status: Property["status"]) => {
    await updateProperty(id, { status });
  };

  const actionItemsFor = (prop: Property) => {
    const isLive = prop.status === "Active";
    return [
      {
        id: "view",
        label: isLive ? "View Live Page" : "Preview Listing",
        href: `/property/${prop.id}`,
        target: "_blank",
        icon: ExternalLink,
      },
      {
        id: "edit",
        label: "Edit Listing",
        href: `/dealer/dashboard/edit-property/${prop.id}`,
        icon: Edit2,
      },
      {
        id: "status-pending",
        label: "Submit for Review",
        onClick: () => void handleStatusChange(prop.id, "Pending Review"),
        icon: CheckCircle2,
        disabled: prop.status === "Pending Review" || prop.status === "Active",
      },
      {
        id: "status-draft",
        label: "Move to Draft",
        onClick: () => void handleStatusChange(prop.id, "Draft"),
        icon: XCircle,
        disabled: prop.status === "Draft" || prop.status === "Active",
      },
      {
        id: "delete",
        label: "Delete Listing",
        onClick: () => setPendingDelete({ id: prop.id, title: prop.title }),
        icon: Trash2,
        variant: "danger" as const,
        dividerBefore: true,
      },
    ];
  };

  const tableColumns: DataTableColumn<Property>[] = useMemo(
    () => [
      {
        key: "property",
        header: "Property",
        render: (prop) => (
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl overflow-hidden shrink-0 bg-sand/35 border border-indigo/5">
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
            <div>
              <p className="text-sm font-bold text-charcoal line-clamp-1 max-w-[200px]">{prop.title}</p>
              <p className="text-[10px] text-charcoal/50 font-semibold mt-0.5">
                {prop.locality}, {prop.city}
              </p>
            </div>
          </div>
        ),
      },
      {
        key: "type",
        header: "Type",
        render: (prop) => <span className="text-xs font-bold text-charcoal/65">{prop.type}</span>,
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
          <Badge status={prop.status} size="sm">
            {prop.status}
          </Badge>
        ),
      },
      {
        key: "actions",
        header: "Actions",
        render: (prop) => (
          <DropdownMenu
            accent="indigo"
            align="right"
            placement="auto"
            trigger={
              <button
                type="button"
                className="p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-indigo rounded-xl transition-all cursor-pointer"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
            }
            items={actionItemsFor(prop)}
          />
        ),
      },
    ],
    // actionItemsFor closes over handlers
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const headerDescription = propertiesLoading
    ? "Loading your listings…"
    : statusFilter === "Draft"
      ? `${myProperties.length} draft properties on hold (requiring updates)`
      : `${myProperties.length} active and draft listings found`;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title={statusFilter === "Draft" ? "Hold / Draft Properties" : "My Property Listings"}
        description={headerDescription}
        actions={
          <>
            <div className="bg-sand/35 border border-indigo/5 p-1 rounded-xl flex gap-0.5">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === "grid" ? "bg-white text-indigo shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
                aria-label="Grid view"
              >
                <Grid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`p-2 rounded-lg cursor-pointer transition-colors ${viewMode === "table" ? "bg-white text-indigo shadow-sm" : "text-charcoal/40 hover:text-charcoal"}`}
                aria-label="Table view"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <Link
              href="/dealer/dashboard/add-property"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-indigo/15 shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Property</span>
            </Link>
          </>
        }
      />

      {statusFilter !== "Draft" && (
        <div className="flex flex-wrap gap-3 bg-white/60 border border-indigo/10 rounded-3xl p-4 shadow-sm">
          <CustomSelect
            options={statusOptions}
            value={statusFilter}
            onChange={setStatusFilter}
            accent="indigo"
            buttonClassName="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
            className="w-44"
          />
          <CustomSelect
            options={typeOptions}
            value={typeFilter}
            onChange={setTypeFilter}
            accent="indigo"
            buttonClassName="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
            className="w-44"
          />
          <CustomSelect
            options={sortOptions}
            value={sortBy}
            onChange={setSortBy}
            accent="indigo"
            buttonClassName="bg-sand/30 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
            className="w-44"
          />
        </div>
      )}

      {myPropertiesQuery.isError ? (
        <ErrorState
          title="Could not load your listings"
          message={
            myPropertiesQuery.error instanceof Error
              ? myPropertiesQuery.error.message
              : "We couldn't load your property listings. Please try again."
          }
          onRetry={() => void myPropertiesQuery.refetch()}
        />
      ) : propertiesLoading ? (
        viewMode === "grid" ? (
          <PropertyGridSkeleton />
        ) : (
          <GlobalLoading label="Loading your listings…" />
        )
      ) : myProperties.length === 0 ? (
        <EmptyState
          title="No properties match your filters."
          description="Try adjusting filters or add your first listing."
          icon={<Building2 className="w-8 h-8 text-indigo/40" />}
        >
          <Link
            href="/dealer/dashboard/add-property"
            className="inline-block px-4 py-2 bg-indigo/10 text-indigo text-xs font-black uppercase tracking-wider rounded-xl transition-all"
          >
            Add first property
          </Link>
        </EmptyState>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {myProperties.map(prop => {
            const isLive = prop.status === "Active";
            return (
            <motion.div key={prop.id} layout className="bg-white/80 border border-indigo/10 rounded-3xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col justify-between overflow-visible">
              <div className="h-48 overflow-hidden relative bg-sand/35 rounded-t-3xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"} alt="" className="w-full h-full object-cover" />
                <div className="absolute top-4 left-4">
                  <Badge status={prop.status} size="sm">{prop.status}</Badge>
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[9px] font-black text-indigo/60 uppercase tracking-widest">{prop.type} · For {prop.purpose}</span>
                  <h3 className="text-sm font-bold text-charcoal line-clamp-1 mt-1">{prop.title}</h3>
                  <p className="text-[10px] text-charcoal/50 font-semibold mt-0.5">{prop.locality}, {prop.city}</p>
                </div>

                <div className="flex items-end justify-between border-t border-indigo/5 pt-3">
                  <div>
                    <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider block">Price</span>
                    <span className="text-base font-serif font-black text-indigo">{formatPrice(prop.price)}</span>
                  </div>
                  {!isLive && (
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-wider">
                      {prop.status === "Pending Review" ? "Awaiting admin" : "Not published"}
                    </span>
                  )}
                </div>

                <div className="flex gap-2 pt-2 items-center justify-between">
                  <Link
                    href={`/property/${prop.id}`}
                    target="_blank"
                    className="flex-1 py-2 border border-indigo/5 bg-sand/30 hover:bg-indigo/5 text-charcoal text-center text-[10px] font-black rounded-xl transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    {isLive ? "View Live" : "Preview"}
                  </Link>
                  <DropdownMenu
                    accent="indigo"
                    align="right"
                    placement="auto"
                    className="shrink-0"
                    trigger={
                      <button type="button" className="px-3.5 py-2 bg-indigo/5 border border-indigo/10 hover:bg-indigo hover:text-white text-indigo rounded-xl transition-all text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                        <MoreVertical className="w-3.5 h-3.5" /> Actions
                      </button>
                    }
                    items={actionItemsFor(prop)}
                  />
                </div>
              </div>
            </motion.div>
            );
          })}
        </div>
      ) : (
        <DataTable
          columns={tableColumns}
          rows={myProperties}
          rowKey={(p) => p.id}
          emptyMessage="No properties match your filters."
          className="rounded-3xl"
        />
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete listing?"
        description={pendingDelete ? `Delete "${pendingDelete.title}"? This action cannot be undone.` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
