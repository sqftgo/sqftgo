"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Star } from "lucide-react";
import { TextInput, TextArea } from "@/components/ui";
import { CatalogIconPicker, TaxonomyManager } from "@/features/admin";
import {
  CatalogIcon,
  DEFAULT_AMENITY_ICON,
  resolveCatalogIconName,
  type CatalogIconName,
} from "@/lib/icons/catalog-icons";
import type { Amenity } from "@/types";

export default function AdminAmenitiesPage() {
  const {
    amenities,
    createAmenity,
    updateAmenity,
    deleteAmenity,
    addLog,
    userEmail,
  } = useApp();
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: DEFAULT_AMENITY_ICON as CatalogIconName,
    category: "",
  });
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<Amenity | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    icon: DEFAULT_AMENITY_ICON as CatalogIconName,
    category: "",
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...amenities]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((a) => ({
        id: a.id,
        title: a.name,
        subtitle: [
          a.category || null,
          a.description || (a.active ? "Available on listings" : "Hidden from listing forms"),
        ]
          .filter(Boolean)
          .join(" · "),
        leading: (
          <CatalogIcon
            name={a.icon}
            fallback={DEFAULT_AMENITY_ICON}
            className="w-5 h-5 text-indigo"
          />
        ),
        active: a.active,
      }));
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle?.toLowerCase().includes(q) ?? false)
    );
  }, [amenities, search]);

  const handleAdd = async () => {
    if (!form.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createAmenity({
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
        category: form.category.trim() || null,
      });
      addLog({
        action: "Amenity Added",
        performedBy: userEmail,
        role: "Admin",
        target: form.name.trim(),
      });
      setForm({
        name: "",
        description: "",
        icon: DEFAULT_AMENITY_ICON,
        category: "",
      });
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

  const openEdit = (id: string) => {
    const row = amenities.find((a) => a.id === id);
    if (!row) return;
    setEditing(row);
    setEditForm({
      name: row.name,
      description: row.description || "",
      icon: resolveCatalogIconName(row.icon, DEFAULT_AMENITY_ICON),
      category: row.category || "",
    });
  };

  const saveEdit = async () => {
    if (!editing || !editForm.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateAmenity(editing.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        icon: editForm.icon,
        category: editForm.category.trim() || null,
      });
      addLog({
        action: "Amenity Updated",
        performedBy: userEmail,
        role: "Admin",
        target: editForm.name.trim(),
      });
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update amenity");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (orderedIds: string[]) => {
    try {
      await Promise.all(
        orderedIds.map((id, index) => updateAmenity(id, { sortOrder: (index + 1) * 10 }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reorder amenities");
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
      submitDisabled={!form.name.trim()}
      onSubmit={() => void handleAdd()}
      onToggle={(id, active) => void toggleActive(id, active)}
      onDeleteRequest={(id, name) => setPendingDelete({ id, name })}
      pendingDelete={pendingDelete}
      onCloseDelete={() => setPendingDelete(null)}
      onConfirmDelete={() => void confirmDelete()}
      onEditRequest={openEdit}
      editingId={editing?.id ?? null}
      editTitle={editing ? `Edit ${editing.name}` : undefined}
      onCloseEdit={() => setEditing(null)}
      onSaveEdit={() => void saveEdit()}
      editSubmitDisabled={!editForm.name.trim()}
      onReorder={(ids) => void reorder(ids)}
      form={
        <div className="space-y-3">
          <TextInput
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Amenity name (e.g. Swimming Pool)"
            aria-label="Amenity name"
          />
          <TextArea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description (optional)"
            rows={2}
          />
          <TextInput
            value={form.category}
            onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Group (optional)"
            aria-label="Amenity category"
          />
          <CatalogIconPicker
            value={form.icon}
            onChange={(icon) => setForm((f) => ({ ...f, icon }))}
          />
        </div>
      }
      editForm={
        <div className="space-y-3">
          <TextInput
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Amenity name"
          />
          <TextArea
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={3}
          />
          <TextInput
            value={editForm.category}
            onChange={(e) => setEditForm((f) => ({ ...f, category: e.target.value }))}
            placeholder="Group"
          />
          <CatalogIconPicker
            value={editForm.icon}
            onChange={(icon) => setEditForm((f) => ({ ...f, icon }))}
          />
        </div>
      }
    />
  );
}
