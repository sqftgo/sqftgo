"use client";

import React, { useState } from "react";
import { LayoutGrid, List, Plus, Search, Trash2, type LucideIcon } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Switch,
  Badge,
  ConfirmDialog,
  Button,
  TextInput,
  Panel,
  EmptyState,
} from "@/components/ui";
import { cn } from "@/lib/cn";

export type TaxonomyLayout = "list" | "grid";

export type TaxonomyRow = {
  id: string;
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  active: boolean;
};

export type TaxonomyManagerProps = {
  title: string;
  description: string;
  icon: LucideIcon;
  itemLabel: string;
  items: TaxonomyRow[];
  searchPlaceholder?: string;
  form: React.ReactNode;
  onSubmit: () => void;
  submitDisabled?: boolean;
  busy?: boolean;
  saved?: boolean;
  error?: string | null;
  onDismissSaved?: () => void;
  onDismissError?: () => void;
  onToggle: (id: string, active: boolean) => void;
  onDeleteRequest: (id: string, name: string) => void;
  pendingDelete: { id: string; name: string } | null;
  onCloseDelete: () => void;
  onConfirmDelete: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  /** Initial layout; users can switch between grid and list. */
  defaultLayout?: TaxonomyLayout;
  search: string;
  onSearchChange: (value: string) => void;
};

export function TaxonomyManager({
  title,
  description,
  icon: Icon,
  itemLabel,
  items,
  searchPlaceholder,
  form,
  onSubmit,
  submitDisabled,
  busy,
  saved,
  error,
  onDismissSaved,
  onDismissError,
  onToggle,
  onDeleteRequest,
  pendingDelete,
  onCloseDelete,
  onConfirmDelete,
  emptyTitle,
  emptyDescription,
  defaultLayout = "list",
  search,
  onSearchChange,
}: TaxonomyManagerProps) {
  const [layout, setLayout] = useState<TaxonomyLayout>(defaultLayout);
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title={title}
        description={description}
        actions={
          <div className="flex items-center gap-3 text-right">
            <div className="hidden sm:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/35">
                Total
              </p>
              <p className="text-lg font-serif font-black text-indigo leading-none">
                {items.length}
              </p>
            </div>
            <div className="hidden sm:block h-8 w-px bg-indigo/10" />
            <div className="hidden sm:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/35">
                Active
              </p>
              <p className="text-lg font-serif font-black text-terracotta leading-none">
                {activeCount}
              </p>
            </div>
          </div>
        }
      />

      {saved ? (
        <Alert
          variant="success"
          title={`${itemLabel} added`}
          onDismiss={onDismissSaved}
        />
      ) : null}
      {error ? (
        <Alert variant="danger" title={error} onDismiss={onDismissError} />
      ) : null}

      <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,340px)_1fr] gap-6 items-start">
        <Panel
          title={`Add ${itemLabel}`}
          description={`Create a new ${itemLabel.toLowerCase()} for listings`}
          padding="md"
          rounded="2xl"
        >
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit();
            }}
          >
            {form}
            <Button type="submit" size="md" disabled={submitDisabled || busy} className="w-full sm:w-auto">
              <Plus className="w-4 h-4" />
              Add {itemLabel}
            </Button>
          </form>
        </Panel>

        <Panel
          title={`All ${title}`}
          description={`${items.length} ${itemLabel.toLowerCase()}${items.length === 1 ? "" : "s"}`}
          padding="none"
          rounded="2xl"
          actions={
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-52">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-charcoal/35 pointer-events-none" />
                <TextInput
                  value={search}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={searchPlaceholder ?? `Search ${title.toLowerCase()}…`}
                  className="pl-9 py-2 text-xs"
                  aria-label={`Search ${title}`}
                />
              </div>
              <div
                className="flex items-center rounded-xl border border-indigo/10 bg-cream/50 p-0.5 shrink-0"
                role="group"
                aria-label="Layout"
              >
                <button
                  type="button"
                  onClick={() => setLayout("list")}
                  className={cn(
                    "p-2 rounded-lg transition-colors cursor-pointer",
                    layout === "list"
                      ? "bg-white text-terracotta shadow-sm"
                      : "text-charcoal/40 hover:text-charcoal/70"
                  )}
                  aria-label="List layout"
                  aria-pressed={layout === "list"}
                >
                  <List className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLayout("grid")}
                  className={cn(
                    "p-2 rounded-lg transition-colors cursor-pointer",
                    layout === "grid"
                      ? "bg-white text-terracotta shadow-sm"
                      : "text-charcoal/40 hover:text-charcoal/70"
                  )}
                  aria-label="Grid layout"
                  aria-pressed={layout === "grid"}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          }
        >
          {items.length === 0 ? (
            <div className="p-8">
              <EmptyState
                icon={<Icon className="w-5 h-5" />}
                title={emptyTitle ?? `No ${title.toLowerCase()} yet`}
                description={
                  emptyDescription ??
                  `Add your first ${itemLabel.toLowerCase()} using the form.`
                }
              />
            </div>
          ) : layout === "grid" ? (
            <div className="p-4 sm:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <TaxonomyCard
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onDeleteRequest={onDeleteRequest}
                />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-indigo/5">
              {items.map((item) => (
                <TaxonomyListRow
                  key={item.id}
                  item={item}
                  onToggle={onToggle}
                  onDeleteRequest={onDeleteRequest}
                />
              ))}
            </div>
          )}
        </Panel>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={onCloseDelete}
        onConfirm={onConfirmDelete}
        title={`Delete ${itemLabel.toLowerCase()}?`}
        description={
          pendingDelete
            ? `Delete "${pendingDelete.name}"? This cannot be undone.`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}

function TaxonomyListRow({
  item,
  onToggle,
  onDeleteRequest,
}: {
  item: TaxonomyRow;
  onToggle: (id: string, active: boolean) => void;
  onDeleteRequest: (id: string, name: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 sm:gap-4 px-4 sm:px-5 py-3.5 hover:bg-sand/30 transition-colors">
      {item.leading ? (
        <div className="w-11 h-11 rounded-xl bg-sand/50 border border-indigo/5 flex items-center justify-center shrink-0 text-xl">
          {item.leading}
        </div>
      ) : null}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-charcoal truncate">{item.title}</p>
        {item.subtitle ? (
          <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5 truncate">
            {item.subtitle}
          </p>
        ) : null}
      </div>
      <Badge status={item.active ? "active" : "inactive"} size="sm" className="hidden sm:inline-flex">
        {item.active ? "Active" : "Inactive"}
      </Badge>
      <div className="flex items-center gap-1.5 shrink-0">
        <Switch
          checked={item.active}
          onCheckedChange={() => onToggle(item.id, item.active)}
          size="sm"
          accent="terracotta"
          aria-label={`Toggle ${item.title}`}
        />
        <button
          type="button"
          onClick={() => onDeleteRequest(item.id, item.title)}
          className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg transition-all cursor-pointer"
          aria-label={`Delete ${item.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function TaxonomyCard({
  item,
  onToggle,
  onDeleteRequest,
}: {
  item: TaxonomyRow;
  onToggle: (id: string, active: boolean) => void;
  onDeleteRequest: (id: string, name: string) => void;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-indigo/10 bg-cream/40 p-4 flex flex-col gap-3 transition-colors",
        !item.active && "opacity-70"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex items-start gap-3">
          {item.leading ? (
            <div className="w-10 h-10 rounded-xl bg-white border border-indigo/5 flex items-center justify-center shrink-0 text-lg">
              {item.leading}
            </div>
          ) : null}
          <div className="min-w-0">
            <p className="text-sm font-bold text-charcoal truncate">{item.title}</p>
            {item.subtitle ? (
              <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">
                {item.subtitle}
              </p>
            ) : null}
          </div>
        </div>
        <Badge status={item.active ? "active" : "inactive"} size="sm">
          {item.active ? "Active" : "Inactive"}
        </Badge>
      </div>
      <div className="flex items-center justify-between pt-1 border-t border-indigo/5">
        <Switch
          checked={item.active}
          onCheckedChange={() => onToggle(item.id, item.active)}
          size="sm"
          accent="terracotta"
          aria-label={`Toggle ${item.title}`}
        />
        <button
          type="button"
          onClick={() => onDeleteRequest(item.id, item.title)}
          className="p-2 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg transition-all cursor-pointer"
          aria-label={`Delete ${item.title}`}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

export default TaxonomyManager;
