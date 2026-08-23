"use client";

import React, { useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
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
import type { ListingFilterKind } from "@/types/listing-filter";

const KIND_OPTIONS = [
  { label: "Text search", value: "text" },
  { label: "Toggle", value: "toggle" },
  { label: "Multi-select", value: "multi" },
];

const FIELD_OPTIONS = PROPERTY_FIELD_WHITELIST.map((f) => ({ label: f, value: f }));

export default function AdminListingFiltersPage() {
  const { addLog, userEmail } = useApp();
  const { filters, ready, error, refresh } = useListingFilters({ all: true });
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

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
      setLocalError(err instanceof Error ? err.message : "Unable to update filter");
    }
  };

  const move = async (id: string, direction: -1 | 1) => {
    const idx = sorted.findIndex((f) => f.id === id);
    const swap = sorted[idx + direction];
    if (!swap) return;
    setLocalError(null);
    try {
      await Promise.all([
        listingFilterApi.update(id, { sortOrder: swap.sortOrder }),
        listingFilterApi.update(swap.id, { sortOrder: sorted[idx].sortOrder }),
      ]);
      await refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to reorder filter");
    }
  };

  const saveLabel = async (id: string, label: string) => {
    const trimmed = label.trim();
    if (trimmed.length < 2) return;
    try {
      await listingFilterApi.update(id, { label: trimmed });
      await refresh();
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to rename filter");
    }
  };

  const handleAdd = async () => {
    if (busy) return;
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
        options: newKind === "multi" ? options : [],
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
      setLocalError(err instanceof Error ? err.message : "Unable to add filter");
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
      setLocalError(err instanceof Error ? err.message : "Unable to remove filter");
    }
  };

  return (
    <div className="space-y-6">
      <DashboardPageHeader
        title="Search filters"
        description="Choose which filters buyers see on web listings and the mobile Explore sheet. Turn filters on or off, rename them, reorder them, or add a custom one. Dealers posting properties are not affected."
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
            <CustomSelect options={KIND_OPTIONS} value={newKind} onChange={(v) => setNewKind(v as ListingFilterKind)} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">Property field</p>
            <CustomSelect options={FIELD_OPTIONS} value={newField} onChange={(v) => setNewField(v as typeof newField)} />
          </div>
          {newKind === "multi" ? (
            <div className="md:col-span-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1.5">
                Options (comma separated)
              </p>
              <TextInput
                value={newOptions}
                onChange={(e) => setNewOptions(e.target.value)}
                placeholder="e.g. Yes, No"
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
        description={!ready ? "Loading…" : `${sorted.length} filters · on = shown to buyers`}
        padding="none"
        rounded="2xl"
      >
        <div className="divide-y divide-indigo/5">
          {sorted.map((row, idx) => (
            <div key={row.id} className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4">
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
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={idx === 0}
                  onClick={() => void move(row.id, -1)}
                >
                  Up
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={idx === sorted.length - 1}
                  onClick={() => void move(row.id, 1)}
                >
                  Down
                </Button>
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
