"use client";

import React, { useCallback, useMemo, useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { ImagePlus, MapPin } from "lucide-react";
import { TextInput } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin";
import { cityCoverImage } from "@/constants/city-images";

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
  const [form, setForm] = useState({ city: "", state: "", country: "India" });
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
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
        setError(err instanceof Error ? err.message : "Unable to upload city image");
      } finally {
        setUploadingId(null);
      }
    },
    [uploadCityCover, addLog, userEmail]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = locations.map((loc) => {
      const cover = loc.coverImageUrl?.trim() || cityCoverImage(loc.city);
      return {
        id: loc.id,
        title: loc.city,
        subtitle: `${loc.state}, ${loc.country} · ${loc.propertyCount} properties`,
        leading: (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={cover}
            alt=""
            className="w-full h-full object-cover rounded-xl"
          />
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
      description="Add cities, enable or disable them, and set the cover image used across the site"
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
          <p className="text-[11px] font-semibold text-charcoal/50 leading-relaxed">
            After adding a city, use <span className="text-indigo">Image</span> on the row to upload
            a cover. That image is used for destinations, city pages, and other city UI.
          </p>
        </div>
      }
    />
  );
}
