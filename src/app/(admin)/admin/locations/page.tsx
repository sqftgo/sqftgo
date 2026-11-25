"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { useApp } from "@/context/AppContext";
import { ImagePlus, MapPin } from "lucide-react";
import { TextInput } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin";
import { cityCoverImage } from "@/constants/city-images";
import type { Location } from "@/types";

export default function AdminLocationsPage() {
  const {
    locations,
    createLocation,
    updateLocation,
    uploadCityCover,
    deleteLocation,
    addLog,
    userEmail,
  } = useApp();
  const [form, setForm] = useState({
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
  });
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<Location | null>(null);
  const [editForm, setEditForm] = useState({
    city: "",
    state: "",
    country: "India",
    latitude: "",
    longitude: "",
  });
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const handleUpload = useCallback(
    async (id: string, city: string, file: File) => {
      setUploadingId(id);
      setError(null);
      try {
        await uploadCityCover(id, file);
        addLog({
          action: "City Cover Updated",
          performedBy: userEmail,
          role: "Admin",
          target: city,
        });
      } catch (err) {
        handleClientError(err, { fallback: "Unable to upload city image" });
      } finally {
        setUploadingId(null);
      }
    },
    [uploadCityCover, addLog, userEmail]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...locations]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.city.localeCompare(b.city))
      .map((loc) => {
        const cover = loc.coverImageUrl?.trim() || cityCoverImage(loc.city);
        return {
          id: loc.id,
          title: loc.city,
          subtitle: `${loc.state}, ${loc.country} · ${loc.propertyCount} properties · /${loc.slug}`,
          leading: (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={cover} alt="" className="w-full h-full object-cover rounded-xl" />
          ),
          trailing: (
            <div className="flex items-center gap-1">
              <input
                ref={(el) => {
                  fileInputs.current[loc.id] = el;
                }}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) void handleUpload(loc.id, loc.city, file);
                }}
              />
              <button
                type="button"
                disabled={uploadingId === loc.id || busy}
                onClick={() => fileInputs.current[loc.id]?.click()}
                className="inline-flex items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wide bg-indigo/5 text-indigo hover:bg-indigo/10 disabled:opacity-50 cursor-pointer"
                aria-label={`Upload cover for ${loc.city}`}
              >
                <ImagePlus className="w-3.5 h-3.5" />
                {uploadingId === loc.id ? "…" : "Image"}
              </button>
            </div>
          ),
          active: loc.active,
        };
      });
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle?.toLowerCase().includes(q) ?? false)
    );
  }, [locations, search, uploadingId, busy, handleUpload]);

  const parseCoord = (raw: string): number | null => {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    const n = Number(trimmed);
    return Number.isFinite(n) ? n : null;
  };

  const handleAdd = async () => {
    if (!form.city.trim() || !form.state.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createLocation({
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim() || "India",
        latitude: parseCoord(form.latitude),
        longitude: parseCoord(form.longitude),
      });
      addLog({
        action: "Location Added",
        performedBy: userEmail,
        role: "Admin",
        target: `${form.city}, ${form.state}`,
      });
      setForm({ city: "", state: "", country: "India", latitude: "", longitude: "" });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleClientError(err, { fallback: "Unable to add location" });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateLocation(id, { active: !active });
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update location" });
    }
  };

  const openEdit = (id: string) => {
    const loc = locations.find((l) => l.id === id);
    if (!loc) return;
    setEditing(loc);
    setEditForm({
      city: loc.city,
      state: loc.state,
      country: loc.country,
      latitude: loc.latitude != null ? String(loc.latitude) : "",
      longitude: loc.longitude != null ? String(loc.longitude) : "",
    });
  };

  const saveEdit = async () => {
    if (!editing || !editForm.city.trim() || !editForm.state.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateLocation(editing.id, {
        city: editForm.city.trim(),
        state: editForm.state.trim(),
        country: editForm.country.trim() || "India",
        latitude: parseCoord(editForm.latitude),
        longitude: parseCoord(editForm.longitude),
      });
      addLog({
        action: "Location Updated",
        performedBy: userEmail,
        role: "Admin",
        target: editForm.city.trim(),
      });
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update location" });
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (orderedIds: string[]) => {
    try {
      await Promise.all(
        orderedIds.map((id, index) => updateLocation(id, { sortOrder: (index + 1) * 10 }))
      );
    } catch (err) {
      handleClientError(err, { fallback: "Unable to reorder locations" });
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
      handleClientError(err, { fallback: "Unable to delete location" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaxonomyManager
      title="Locations"
      description="Add cities, enable or disable them, and set the cover image used across the site"
      icon={MapPin}
      itemLabel="Location"
      items={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search city, state, or country…"
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
      onEditRequest={openEdit}
      editingId={editing?.id ?? null}
      editTitle={editing ? `Edit ${editing.city}` : undefined}
      onCloseEdit={() => setEditing(null)}
      onSaveEdit={() => void saveEdit()}
      editSubmitDisabled={!editForm.city.trim() || !editForm.state.trim()}
      onReorder={(ids) => void reorder(ids)}
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
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              value={form.latitude}
              onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
              placeholder="Latitude (optional)"
              aria-label="Latitude"
            />
            <TextInput
              value={form.longitude}
              onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
              placeholder="Longitude (optional)"
              aria-label="Longitude"
            />
          </div>
          <p className="text-[11px] font-semibold text-charcoal/50 leading-relaxed">
            After adding a city, use <span className="text-indigo">Image</span> on the row to upload
            a cover. That image is used for destinations, city pages, and other city UI.
          </p>
        </div>
      }
      editForm={
        <div className="space-y-3">
          <TextInput
            value={editForm.city}
            onChange={(e) => setEditForm((f) => ({ ...f, city: e.target.value }))}
            placeholder="City"
          />
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              value={editForm.state}
              onChange={(e) => setEditForm((f) => ({ ...f, state: e.target.value }))}
              placeholder="State"
            />
            <TextInput
              value={editForm.country}
              onChange={(e) => setEditForm((f) => ({ ...f, country: e.target.value }))}
              placeholder="Country"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextInput
              value={editForm.latitude}
              onChange={(e) => setEditForm((f) => ({ ...f, latitude: e.target.value }))}
              placeholder="Latitude"
            />
            <TextInput
              value={editForm.longitude}
              onChange={(e) => setEditForm((f) => ({ ...f, longitude: e.target.value }))}
              placeholder="Longitude"
            />
          </div>
        </div>
      }
    />
  );
}
