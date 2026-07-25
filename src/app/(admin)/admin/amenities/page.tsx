"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Plus, Trash2 } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Switch,
  Badge,
  Button,
  TextInput,
  Panel,
  ConfirmDialog,
} from "@/components/ui";

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
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(
    null
  );

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
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Amenities"
        description="Manage available property amenities"
      />

      {saved && (
        <Alert variant="success" title="Amenity added!" onDismiss={() => setSaved(false)} />
      )}
      {error ? (
        <Alert variant="danger" title={error} onDismiss={() => setError(null)} />
      ) : null}

      <Panel>
        <div className="flex gap-3">
          <TextInput
            value={newAmenity}
            onChange={(e) => setNewAmenity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && void handleAdd()}
            placeholder="New amenity name..."
            className="flex-1"
          />
          <Button onClick={() => void handleAdd()} size="md" disabled={busy}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Panel>

      <Panel>
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-4">
          {amenities.length} amenities
        </p>
        <div className="flex flex-wrap gap-2">
          {amenities.map((a) => (
            <div
              key={a.id}
              className="flex items-center gap-2 bg-indigo/5 border border-indigo/5 rounded-xl px-3 py-2"
            >
              <span className="text-xs font-bold text-charcoal/70">{a.name}</span>
              <Badge status={a.active ? "active" : "inactive"} size="sm">
                {a.active ? "Active" : "Inactive"}
              </Badge>
              <Switch
                checked={a.active}
                onCheckedChange={() => void toggleActive(a.id, a.active)}
                size="sm"
                accent="terracotta"
                aria-label={`Toggle ${a.name}`}
              />
              <button
                type="button"
                onClick={() => setPendingDelete({ id: a.id, name: a.name })}
                className="text-charcoal/40 hover:text-rose-500 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => {
          void confirmDelete();
        }}
        title="Delete amenity?"
        description={
          pendingDelete
            ? `Remove "${pendingDelete.name}" from the amenities list?`
            : undefined
        }
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
