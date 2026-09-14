"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Wrench } from "lucide-react";
import { TextInput, TextArea } from "@/components/ui";
import { TaxonomyManager } from "@/features/admin";
import { servicePlatformService } from "@/services";
import type { ServiceType } from "@/types";
import { useApp } from "@/context/AppContext";

export default function AdminServicesPage() {
  const { addLog, userEmail } = useApp();
  const [items, setItems] = useState<ServiceType[]>([]);
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

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
    const rows = items.map((st) => ({
      id: st.id,
      title: st.name,
      subtitle: st.description || "No description",
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
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await servicePlatformService.createServiceType({
        name: newName.trim(),
        description: newDescription.trim(),
        icon: "🔧",
      });
      addLog({
        action: "Service type added",
        performedBy: userEmail,
        role: "Admin",
        target: newName.trim(),
      });
      setNewName("");
      setNewDescription("");
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
      submitDisabled={!newName.trim()}
      onSubmit={() => void handleAdd()}
      onToggle={(id, active) => void toggleActive(id, active)}
      onDeleteRequest={(id, name) => setPendingDelete({ id, name })}
      pendingDelete={pendingDelete}
      onCloseDelete={() => setPendingDelete(null)}
      onConfirmDelete={() => void confirmDelete()}
      emptyTitle="No service types"
      emptyDescription="Add the first service trade for relocators."
      form={
        <div className="space-y-3">
          <TextInput
            placeholder="Service name (e.g. Interior Decorator)"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
          />
          <TextArea
            placeholder="Short description shown to relocators"
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            rows={3}
          />
        </div>
      }
    />
  );
}
