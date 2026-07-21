"use client";
import React, { useState } from "react";
import { useApp, Location } from "@/context/AppContext";
import { Plus, Trash2 } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Switch,
  Badge,
  ConfirmDialog,
  Button,
  TextInput,
  Panel,
} from "@/components/ui";

export default function AdminLocationsPage() {
  const { locations, setLocations, addLog, userEmail } = useApp();
  const [form, setForm] = useState({ city: "", state: "", country: "India" });
  const [saved, setSaved] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = () => {
    if (!form.city.trim()) return;
    const newLoc: Location = { id: `loc-${Date.now()}`, ...form, active: true, propertyCount: 0 };
    setLocations(prev => [...prev, newLoc]);
    addLog({ action: "Location Added", performedBy: userEmail, role: "Admin", target: `${form.city}, ${form.state}` });
    setForm({ city: "", state: "", country: "India" });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleActive = (id: string) => setLocations(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setLocations(prev => prev.filter(l => l.id !== pendingDelete.id));
    addLog({ action: "Location Deleted", performedBy: userEmail, role: "Admin", target: pendingDelete.name });
    setPendingDelete(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Locations"
        description="Manage cities and regions on the platform"
      />

      {saved && (
        <Alert variant="success" title="Location added!" onDismiss={() => setSaved(false)} />
      )}

      <Panel title="Add Location">
        <div className="flex flex-wrap gap-3">
          <TextInput
            value={form.city}
            onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
            placeholder="City name"
            className="flex-1 min-w-[150px]"
          />
          <TextInput
            value={form.state}
            onChange={e => setForm(f => ({ ...f, state: e.target.value }))}
            placeholder="State"
            className="flex-1 min-w-[150px]"
          />
          <TextInput
            value={form.country}
            onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
            placeholder="Country"
            className="flex-1 min-w-[120px]"
          />
          <Button onClick={handleAdd} size="md">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Panel>

      <Panel padding="none">
        <div className="divide-y divide-indigo/5">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-indigo/5 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">{loc.city}</p>
                <p className="text-[10px] text-charcoal/40 font-semibold">{loc.state}, {loc.country}</p>
              </div>
              <Badge status={loc.active ? "active" : "inactive"} size="sm">
                {loc.active ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-2">
                <Switch
                  checked={loc.active}
                  onCheckedChange={() => toggleActive(loc.id)}
                  size="sm"
                  accent="terracotta"
                  aria-label={`Toggle ${loc.city}`}
                />
                <button
                  type="button"
                  onClick={() => setPendingDelete({ id: loc.id, name: loc.city })}
                  className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete location?"
        description={pendingDelete ? `Delete location "${pendingDelete.name}"?` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
