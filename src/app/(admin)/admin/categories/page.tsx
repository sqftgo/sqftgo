"use client";

import React, { useMemo, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { useApp } from "@/context/AppContext";
import { Tag } from "lucide-react";
import { TextInput, TextArea } from "@/components/ui";
import { CatalogIconPicker, TaxonomyManager } from "@/features/admin";
import {
  CatalogIcon,
  DEFAULT_CATEGORY_ICON,
  resolveCatalogIconName,
  type CatalogIconName,
} from "@/lib/icons/catalog-icons";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    addLog,
    userEmail,
  } = useApp();
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newIcon, setNewIcon] = useState<CatalogIconName>(DEFAULT_CATEGORY_ICON);
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<Category | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    icon: DEFAULT_CATEGORY_ICON as CatalogIconName,
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...categories]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((cat) => ({
        id: cat.id,
        title: cat.name,
        subtitle: `${cat.count} listings · /${cat.slug}${cat.description ? ` · ${cat.description}` : ""}`,
        leading: (
          <CatalogIcon
            name={cat.icon}
            fallback={DEFAULT_CATEGORY_ICON}
            className="w-5 h-5 text-indigo"
          />
        ),
        active: cat.active,
      }));
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle?.toLowerCase().includes(q) ?? false)
    );
  }, [categories, search]);

  const handleAdd = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createCategory({
        name: newName.trim(),
        icon: newIcon,
        description: newDescription.trim(),
      });
      addLog({ action: "Category Added", performedBy: userEmail, role: "Admin", target: newName });
      setNewName("");
      setNewDescription("");
      setNewIcon(DEFAULT_CATEGORY_ICON);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleClientError(err, { fallback: "Unable to add category" });
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateCategory(id, { active: !active });
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update category" });
    }
  };

  const openEdit = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (!cat) return;
    setEditing(cat);
    setEditForm({
      name: cat.name,
      description: cat.description || "",
      icon: resolveCatalogIconName(cat.icon, DEFAULT_CATEGORY_ICON),
    });
  };

  const saveEdit = async () => {
    if (!editing || !editForm.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await updateCategory(editing.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        icon: editForm.icon,
      });
      addLog({
        action: "Category Updated",
        performedBy: userEmail,
        role: "Admin",
        target: editForm.name.trim(),
      });
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update category" });
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (orderedIds: string[]) => {
    setError(null);
    try {
      await Promise.all(
        orderedIds.map((id, index) => updateCategory(id, { sortOrder: (index + 1) * 10 }))
      );
    } catch (err) {
      handleClientError(err, { fallback: "Unable to reorder categories" });
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      await deleteCategory(pendingDelete.id);
      addLog({
        action: "Category Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.name,
      });
      setPendingDelete(null);
    } catch (err) {
      handleClientError(err, { fallback: "Unable to delete category" });
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaxonomyManager
      title="Categories"
      description="Manage property type categories shown across listings and filters"
      icon={Tag}
      itemLabel="Category"
      items={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search categories…"
      busy={busy}
      saved={saved}
      error={error}
      onDismissSaved={() => setSaved(false)}
      onDismissError={() => setError(null)}
      submitDisabled={!newName.trim()}
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
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            aria-label="Category name"
          />
          <TextArea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            placeholder="Short description (optional)"
            rows={2}
            aria-label="Category description"
          />
          <CatalogIconPicker value={newIcon} onChange={setNewIcon} />
        </div>
      }
      editForm={
        <div className="space-y-3">
          <TextInput
            value={editForm.name}
            onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="Category name"
            aria-label="Edit category name"
          />
          <TextArea
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={3}
            aria-label="Edit category description"
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
