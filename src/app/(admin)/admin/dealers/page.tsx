"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Trash2, CheckCircle2, MapPin, Phone, Globe, ExternalLink, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DashboardPageHeader,
  SearchInput,
  Avatar,
  Badge,
  ConfirmDialog,
} from "@/components/ui";

export default function AdminDealersPage() {
  const { directoryProfiles, deleteDirectoryProfile, addLog, userEmail } = useApp();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const dealers = directoryProfiles.filter(p => {
    const isDealerCat = p.category === "Agent & Broker" || p.category === "Property Consultant" || p.category === "Builder & Developer";
    const matchSearch = !search || p.firmName.toLowerCase().includes(search.toLowerCase()) || p.ownerName.toLowerCase().includes(search.toLowerCase());
    return isDealerCat && matchSearch;
  });

  const confirmDelete = async () => {
    if (!pendingDelete || deleting) return;
    const { id, name } = pendingDelete;
    setDeleting(true);
    try {
      await deleteDirectoryProfile(id);
      addLog({ action: "Dealer Removed", performedBy: userEmail, role: "Admin", target: name });
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Dealer Management"
        description={`${dealers.length} registered dealers`}
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search dealers..."
            accent="terracotta"
            containerClassName="w-60 flex-none min-w-0"
          />
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {dealers.map(dealer => (
          <div key={dealer.id} className="bg-white/80 border border-indigo/10 rounded-2xl p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar name={dealer.firmName} size="md" shape="square" tone="indigo" className="bg-purple-500/10 text-purple-600 border-purple-500/20" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-charcoal leading-tight truncate">{dealer.firmName}</p>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">{dealer.ownerName}</p>
                </div>
              </div>
              <Badge tone="primary" size="sm" className="ml-2 shrink-0 whitespace-nowrap">
                {dealer.category}
              </Badge>
            </div>

            <div className="space-y-2 mb-4">
              {dealer.city && <div className="flex items-center gap-2 text-[10px] text-charcoal/65 font-semibold"><MapPin className="w-3 h-3 text-charcoal/30 shrink-0" />{dealer.city}</div>}
              {dealer.mobile && <div className="flex items-center gap-2 text-[10px] text-charcoal/65 font-semibold"><Phone className="w-3 h-3 text-charcoal/30 shrink-0" />{dealer.mobile}</div>}
              {dealer.reraId && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                  <span className="text-[10px] text-emerald-600 font-bold">{dealer.reraId}</span>
                </div>
              )}
            </div>

            {dealer.description && (
              <p className="text-[11px] text-charcoal/50 font-semibold leading-relaxed mb-4 line-clamp-2">{dealer.description}</p>
            )}

            <div className="flex items-center justify-between pt-3 border-t border-indigo/5">
              <span className="text-[10px] text-charcoal/40 font-semibold">{dealer.experience || "—"} experience</span>
              <DropdownMenu
                accent="terracotta"
                align="right"
                trigger={
                  <button type="button" className="p-1.5 bg-indigo/5 hover:bg-indigo/10 text-charcoal/40 hover:text-terracotta rounded-lg transition-all cursor-pointer">
                    <MoreVertical className="w-3.5 h-3.5" />
                  </button>
                }
                items={[
                  { id: "view-public", label: "View Profile Page", href: `/dealers/${dealer.id}`, target: "_blank", icon: ExternalLink },
                  { id: "website", label: "Visit Website", href: dealer.website ? `https://${dealer.website}` : undefined, disabled: !dealer.website, target: "_blank", icon: Globe },
                  { id: "call", label: `Call: ${dealer.mobile || "—"}`, href: dealer.mobile ? `tel:${dealer.mobile}` : undefined, disabled: !dealer.mobile, icon: Phone },
                  { id: "delete", label: "Remove Dealer Account", onClick: () => setPendingDelete({ id: dealer.id, name: dealer.firmName }), icon: Trash2, variant: "danger", dividerBefore: true }
                ]}
              />
            </div>
          </div>
        ))}
      </div>

      {dealers.length === 0 && (
        <div className="bg-white/80 border border-indigo/10 rounded-2xl p-16 text-center shadow-sm">
          <p className="text-charcoal/40 font-semibold">No dealers found matching your search.</p>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Remove dealer?"
        description={pendingDelete ? `Remove dealer "${pendingDelete.name}" from the platform?` : undefined}
        confirmLabel="Remove"
        tone="danger"
      />
    </div>
  );
}
