"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { Tag } from "lucide-react";
import { TextInput } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin";


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
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = categories.map((cat) => ({
      id: cat.id,
      title: cat.name,
      subtitle: `${cat.count} properties`,
      active: cat.active,
    }));
    if (!q) return rows;
    return rows.filter((r) => r.title.toLowerCase().includes(q));
  }, [categories, search]);

  const handleAdd = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createCategory({ name: newName.trim(), icon: "·" });
      addLog({ action: "Category Added", performedBy: userEmail, role: "Admin", target: newName });
      setNewName("");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateCategory(id, { active: !active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category");
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
      setError(err instanceof Error ? err.message : "Unable to delete category");
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
      form={
        <TextInput
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Category name"
          aria-label="Category name"
        />
      }
    />
  );
}
