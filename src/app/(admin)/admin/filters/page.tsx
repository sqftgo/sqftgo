"use client";

import React, { useMemo, useRef, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { GripVertical, SlidersHorizontal } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { listingFilterApi } from "@/services";
import { useListingFilters } from "@/hooks/useListingFilters";
import { DashboardPageHeader } from "@/components/ui/DashboardPageHeader";
import { Alert } from "@/components/ui/Alert";
import { Switch } from "@/components/ui/Switch";
import { Button } from "@/components/ui/Button";
import { TextInput } from "@/components/ui/FormField";
import { Panel } from "@/components/ui/Panel";
import CustomSelect from "@/components/ui/CustomSelect";
import { PROPERTY_FIELD_WHITELIST } from "@/lib/validation/listing-filter";
import {
  CUSTOM_LISTING_FILTER_KINDS,
  type ListingFilterKind,
} from "@/types/listing-filter";
import { cn } from "@/lib/cn";

const KIND_OPTIONS = [
  { label: "Text Search", value: "text" },
  { label: "Dropdown / Single Select", value: "dropdown" },
  { label: "Multi Select", value: "multi" },
  { label: "Checkbox", value: "checkbox" },
  { label: "Range (Min/Max)", value: "range" },
  { label: "Boolean (Yes/No)", value: "boolean" },
  { label: "Toggle", value: "toggle" },
  { label: "Number", value: "number" },
  { label: "Date", value: "date" },
];

const FIELD_OPTIONS = PROPERTY_FIELD_WHITELIST.map((f) => ({ label: f, value: f }));

const KINDS_WITH_OPTIONS = new Set(["multi", "dropdown", "checkbox"]);

export default function AdminListingFiltersPage() {
  const { addLog, userEmail } = useApp();
  const { filters, ready, error, refresh } = useListingFilters({ all: true });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [dragId, setDragId] = useState<string | null>(null);
  const dragOverId = useRef<string | null>(null);

  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newKind, setNewKind] = useState<ListingFilterKind>("text");
  const [newField, setNewField] = useState<(typeof PROPERTY_FIELD_WHITELIST)[number]>("nearbyHospital");
  const [newOptions, setNewOptions] = useState("");

  const sorted = useMemo(
    () => [...filters].sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label)),
    [filters]
  );

  const flashSaved = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 1800);
  };

  const toggle = async (id: string, active: boolean) => {
    setLocalError(null);
    try {
      await listingFilterApi.update(id, { active: !active });
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update filter" });
    }
  };

  const saveLabel = async (id: string, label: string) => {
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    try {
      await listingFilterApi.update(id, { label: trimmed });
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to rename filter" });
    }
  };

  const reorder = async (orderedIds: string[]) => {
    setLocalError(null);
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          listingFilterApi.update(id, { sortOrder: (index + 1) * 10 })
        )
      );
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to reorder filters" });
    }
  };

  const handleDrop = (targetId: string) => {
    if (!dragId || dragId === targetId) {
      setDragId(null);
      return;
    }
    const ids = sorted.map((f) => f.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    if (from < 0 || to < 0) {
      setDragId(null);
      return;
    }
    const next = [...ids];
    next.splice(from, 1);
    next.splice(to, 0, dragId);
    void reorder(next);
    setDragId(null);
  };

  const handleAdd = async () => {
    if (busy) return;
    if (!CUSTOM_LISTING_FILTER_KINDS.includes(newKind)) {
      setLocalError("Choose a custom filter type");
      return;
    }
    setBusy(true);
    setLocalError(null);
    try {
      const options = newOptions
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean)
        .map((v) => ({ label: v, value: v }));
      await listingFilterApi.create({
        key: newKey.trim().toLowerCase().replace(/\s+/g, "_"),
        label: newLabel.trim(),
        kind: newKind,
        propertyField: newField,
        options: KINDS_WITH_OPTIONS.has(newKind) ? options : [],
        active: true,
      });
      addLog({
        action: "Listing Filter Added",
        performedBy: userEmail,
        role: "Admin",
        target: newLabel.trim(),
      });
      setNewKey("");
      setNewLabel("");
      setNewOptions("");
      flashSaved();
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to add filter" });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: string, label: string, system: boolean) => {
    setLocalError(null);
    try {
      await listingFilterApi.remove(id);
      addLog({
        action: system ? "Listing Filter Deactivated" : "Listing Filter Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: label,
      });
      await refresh();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to remove filter" });
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Search filters"
        description="Choose which filters buyers see on web listings and the mobile Explore sheet. Turn filters on or off, rename them, drag to reorder, or add a custom one mapped to a property field."
      />

      {(saved || error || localError) && (
        <div className="space-y-3">
          {saved ? (
            <Alert variant="success" title="Saved" description="Filter catalog updated." />
          ) : null}
          {localError || error ? (
            <Alert
              variant="danger"
              title="Could not update filters"
              description={localError || error || ""}
            />
          ) : null}
        </div>
      )}

      <Panel title="Add a filter" description="Custom filters search an existing property field." rounded="2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">Key</p>
            <TextInput value={newKey} onChange={(e) => setNewKey(e.target.value)} placeholder="e.g. lake_view" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">Label</p>
            <TextInput value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="e.g. Lake view" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">Type</p>
            <CustomSelect
              options={KIND_OPTIONS}
              value={newKind}
              onChange={(v) => setNewKind(v as ListingFilterKind)}
            />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">Property field</p>
            <CustomSelect
              options={FIELD_OPTIONS}
              value={newField}
              onChange={(v) => setNewField(v as typeof newField)}
            />
          </div>
          {KINDS_WITH_OPTIONS.has(newKind) ? (
            <div className="md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">
                Options (comma separated)
              </p>
              <TextInput
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="e.g. Yes, No, Maybe"
              />
            </div>
          ) : null}
        </div>
        <div className="mt-4">
          <Button
            type="button"
            disabled={busy || !newKey.trim() || !newLabel.trim()}
            onClick={() => void handleAdd()}
          >
            <SlidersHorizontal className="w-4 h-4" />
            Add filter
          </Button>
        </div>
      </Panel>

      <Panel
        title="Marketplace filters"
        description={!ready ? "Loading…" : `${sorted.length} filters · drag to reorder · on = shown to buyers`}
        padding="none"
        rounded="2xl"
      >
        <div className="divide-y divide-indigo/5">
          {sorted.map((row) => (
            <div
              key={row.id}
              draggable
              onDragStart={() => setDragId(row.id)}
              onDragOver={(e) => {
                e.preventDefault();
                dragOverId.current = row.id;
              }}
              onDrop={() => handleDrop(row.id)}
              onDragEnd={() => setDragId(null)}
              className={cn(
                "flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4",
                dragId === row.id && "opacity-50 bg-sand/30"
              )}
            >
              <span className="text-charcoal/30 cursor-grab active:cursor-grabbing shrink-0 hidden sm:block" aria-hidden>
                <GripVertical className="w-4 h-4" />
              </span>
              <div className="flex-1 min-w-0">
                <input
                  defaultValue={row.label}
                  key={`${row.id}-${row.label}`}
                  onBlur={(e) => {
                    if (e.target.value.trim() !== row.label) void saveLabel(row.id, e.target.value);
                  }}
                  className="w-full bg-transparent text-sm font-bold text-indigo focus:outline-none"
                />
                <p className="text-[10px] font-semibold text-charcoal/45 mt-0.5">
                  {row.key} · {row.kind}
                  {row.propertyField ? ` · ${row.propertyField}` : ""}
                  {row.system ? " · system" : " · custom"}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Switch
                  checked={row.active}
                  onCheckedChange={() => void toggle(row.id, row.active)}
                  aria-label={`Toggle ${row.label}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void handleDelete(row.id, row.label, row.system)}
                >
                  {row.system ? "Hide" : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
