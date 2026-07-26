"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { MapPin } from "lucide-react";
import { TextInput } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin/components/TaxonomyManager";

export default function AdminLocationsPage() {
  const {
    locations,
    createLocation,
    updateLocation,
    deleteLocation,
    addLog,
    userEmail,
  } = useApp();
  const [form, setForm] = useState({ city: "", state: "", country: "India" });
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = locations.map((loc) => ({
      id: loc.id,
      title: loc.city,
      subtitle: `${loc.state}, ${loc.country} · ${loc.propertyCount} properties`,
      leading: <MapPin className="w-4 h-4 text-terracotta" />,
      active: loc.active,
    }));
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle?.toLowerCase().includes(q) ?? false)
    );
  }, [locations, search]);

  const handleAdd = async () => {
    if (!form.city.trim() || !form.state.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createLocation({
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
      });
      addLog({
        action: "Location Added",
        performedBy: userEmail,
        role: "Admin",
        target: `${form.city}, ${form.state}`,
      });
      setForm({ city: "", state: "", country: "India" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add location");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateLocation(id, { active: !active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update location");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      await deleteLocation(pendingDelete.id);
      addLog({
        action: "Location Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.name,
      });
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete location");
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaxonomyManager
      title="Locations"
      description="Manage cities and regions available on the marketplace"
      icon={MapPin}
      itemLabel="Location"
      items={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search city or state…"
      busy={busy}
      saved={saved}
      error={error}
      onDismissSaved={() => setSaved(false)}
      onDismissError={() => setError(null)}
      submitDisabled={!form.city.trim() || !form.state.trim()}
      onSubmit={() => void handleAdd()}
      onToggle={(id, active) => void toggleActive(id, active)}
      onDeleteRequest={(id, name) => setPendingDelete({ id, name })}
      pendingDelete={pendingDelete}
      onCloseDelete={() => setPendingDelete(null)}
      onConfirmDelete={() => void confirmDelete()}
      form={
        <div className="space-y-3">
          <TextInput
            value={form.city}
            onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City name"
            aria-label="City"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <TextInput
              value={form.state}
              onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))}
              placeholder="State"
              aria-label="State"
            />
            <TextInput
              value={form.country}
              onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Country"
              aria-label="Country"
            />
          </div>
        </div>
      }
    />
  );
}
