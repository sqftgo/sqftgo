"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Star } from "lucide-react";
import { TextInput } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin/components/TaxonomyManager";

export default function AdminAmenitiesPage() {
  const {
    amenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    addLog,
    userEmail,
  } = useApp();
  const [newAmenity, setNewAmenity] = useState("");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = amenities.map((a) => ({
      id: a.id,
      title: a.name,
      subtitle: a.active ? "Available on listings" : "Hidden from listing forms",
      active: a.active,
    }));
    if (!q) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(q));
  }, [amenities, search]);

  const handleAdd = async () => {
    if (!newAmenity.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createAmenity({ name: newAmenity.trim() });
      addLog({
        action: "Amenity Added",
        performedBy: userEmail,
        role: "Admin",
        target: newAmenity.trim(),
      });
      setNewAmenity("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add amenity");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateAmenity(id, { active: !active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update amenity");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      await deleteAmenity(pendingDelete.id);
      addLog({
        action: "Amenity Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.name,
      });
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete amenity");
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaxonomyManager
      title="Amenities"
      description="Manage amenities dealers can attach to property listings"
      icon={Star}
      itemLabel="Amenity"
      items={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search amenities…"
      defaultLayout="grid"
      busy={busy}
      saved={saved}
      error={error}
      onDismissSaved={() => setSaved(false)}
      onDismissError={() => setError(null)}
      submitDisabled={!newAmenity.trim()}
      onSubmit={() => void handleAdd()}
      onToggle={(id, active) => void toggleActive(id, active)}
      onDeleteRequest={(id, name) => setPendingDelete({ id, name })}
      pendingDelete={pendingDelete}
      onCloseDelete={() => setPendingDelete(null)}
      onConfirmDelete={() => void confirmDelete()}
      form={
        <TextInput
          value={newAmenity}
          onChange={(e) => setNewAmenity(e.target.value)}
          placeholder="Amenity name (e.g. Swimming Pool)"
          aria-label="Amenity name"
        />
      }
    />
  );
}
