"use client";
import React, { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Button,
  TextInput,
  Panel,
  ConfirmDialog,
} from "@/components/ui";

const DEFAULT_AMENITIES = [
  "Swimming Pool", "Parking", "Gym", "Security", "Power Backup", "Lift", "Garden", "Lake View",
  "Clubhouse", "Children Play Area", "CCTV", "Wi-Fi", "AC Rooms", "Terrace", "Modular Kitchen",
  "Vaastu Compliant", "Jogging Track", "Library", "Amphitheatre", "Meditation Zone"
];

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState(DEFAULT_AMENITIES);
  const [newAmenity, setNewAmenity] = useState("");
  const [saved, setSaved] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);

  const handleAdd = () => {
    if (!newAmenity.trim() || amenities.includes(newAmenity)) return;
    setAmenities(prev => [...prev, newAmenity]);
    setNewAmenity("");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setAmenities(prev => prev.filter(x => x !== pendingDelete));
    setPendingDelete(null);
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

      <Panel>
        <div className="flex gap-3">
          <TextInput
            value={newAmenity}
            onChange={e => setNewAmenity(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleAdd()}
            placeholder="New amenity name..."
            className="flex-1"
          />
          <Button onClick={handleAdd} size="md">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Panel>

      <Panel>
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-4">{amenities.length} amenities</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map(a => (
            <div key={a} className="flex items-center gap-2 bg-indigo/5 border border-indigo/5 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-charcoal/70">{a}</span>
              <button
                type="button"
                onClick={() => setPendingDelete(a)}
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
        onConfirm={confirmDelete}
        title="Delete amenity?"
        description={pendingDelete ? `Remove "${pendingDelete}" from the amenities list?` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
