"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { TextInput, TextArea } from "@/components/ui";
import { CatalogIconPicker, TaxonomyManager } from "@/features/admin";
import {
  CatalogIcon,
  DEFAULT_SERVICE_ICON,
  resolveCatalogIconName,
  type CatalogIconName,
} from "@/lib/icons/catalog-icons";
import { servicePlatformService } from "@/services";
import type { ServiceType } from "@/types";
import { useApp } from "@/context/AppContext";

export default function AdminServicesPage() {
  const { addLog, userEmail } = useApp();
  const [items, setItems] = useState<ServiceType[]>([]);
  const [form, setForm] = useState({
    name: "",
    description: "",
    icon: DEFAULT_SERVICE_ICON as CatalogIconName,
  });
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [editing, setEditing] = useState<ServiceType | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    icon: DEFAULT_SERVICE_ICON as CatalogIconName,
  });

  const load = async () => {
    try {
      setItems(await servicePlatformService.listServiceTypes(true));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load service types");
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rows = [...items]
      .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
      .map((st) => ({
        id: st.id,
        title: st.name,
        subtitle: `${st.description || "No description"} · /${st.slug}`,
        leading: (
          <CatalogIcon
            name={st.icon}
            fallback={DEFAULT_SERVICE_ICON}
            className="w-5 h-5 text-indigo"
          />
        ),
        active: st.active,
      }));
    if (!q) return rows;
    return rows.filter(
      (r) =>
        r.title.toLowerCase().includes(q) ||
        (r.subtitle ?? "").toLowerCase().includes(q)
    );
  }, [items, search]);

  const handleAdd = async () => {
    if (!form.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await servicePlatformService.createServiceType({
        name: form.name.trim(),
        description: form.description.trim(),
        icon: form.icon,
      });
      addLog({
        action: "Service type added",
        performedBy: userEmail,
        role: "Admin",
        target: form.name.trim(),
      });
      setForm({ name: "", description: "", icon: DEFAULT_SERVICE_ICON });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add service type");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await servicePlatformService.updateServiceType(id, { active: !active });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update service type");
    }
  };

  const openEdit = (id: string) => {
    const row = items.find((s) => s.id === id);
    if (!row) return;
    setEditing(row);
    setEditForm({
      name: row.name,
      description: row.description || "",
      icon: resolveCatalogIconName(row.icon, DEFAULT_SERVICE_ICON),
    });
  };

  const saveEdit = async () => {
    if (!editing || !editForm.name.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await servicePlatformService.updateServiceType(editing.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        icon: editForm.icon,
      });
      addLog({
        action: "Service type updated",
        performedBy: userEmail,
        role: "Admin",
        target: editForm.name.trim(),
      });
      setEditing(null);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update service type");
    } finally {
      setBusy(false);
    }
  };

  const reorder = async (orderedIds: string[]) => {
    try {
      await Promise.all(
        orderedIds.map((id, index) =>
          servicePlatformService.updateServiceType(id, { sortOrder: (index + 1) * 10 })
        )
      );
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to reorder service types");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      await servicePlatformService.deleteServiceType(pendingDelete.id);
      addLog({
        action: "Service type removed",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.name,
      });
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete service type");
    } finally {
      setBusy(false);
    }
  };

  return (
    <TaxonomyManager
      title="Service types"
      description="Trades shown on the public Services directory (name + description)."
      icon={Wrench}
      itemLabel="Service type"
      items={filtered}
      search={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search service types…"
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
      emptyTitle="No service types"
      emptyDescription="Add the first service trade for relocators."
      form={
        <div className="space-y-3">
          <TextInput
            placeholder="Service name (e.g. Interior Decorator)"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          />
          <TextArea
            placeholder="Short description shown to relocators"
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            rows={3}
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
            placeholder="Service name"
          />
          <TextArea
            value={editForm.description}
            onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
            placeholder="Description"
            rows={3}
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
