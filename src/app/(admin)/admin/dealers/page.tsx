"use client";
import React, { useMemo, useState } from "react";
import { handleClientError } from "@/lib/errors/handle-client-error";
import { useApp } from "@/context/AppContext";
import { isDealerCategory } from "@/features/dealers";
import { authService } from "@/services/auth";
import {
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  ExternalLink,
  MoreVertical,
  ShieldCheck,
  UserCheck,
  UserX,
} from "lucide-react";
import {
  DropdownMenu,
  DashboardPageHeader,
  SearchInput,
  Avatar,
  Badge,
  ConfirmDialog,
  Alert,
  AdminCard,
  EmptyState,
} from "@/components/ui";

export default function AdminDealersPage() {
  const {
    directoryProfiles,
    deleteDirectoryProfile,
    updateDirectoryProfile,
    addLog,
    userEmail,
    adminUsers,
    setAdminUsers,
    refreshDirectoryProfiles,
  } = useApp();
  const [search, setSearch] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const roleByUserId = useMemo(() => {
    const map = new Map<string, string>();
    for (const u of adminUsers) map.set(u.id, u.role);
    return map;
  }, [adminUsers]);

  const dealers = directoryProfiles.filter((p) => {
    const matchSearch =
      !search ||
      p.firmName.toLowerCase().includes(search.toLowerCase()) ||
      p.ownerName.toLowerCase().includes(search.toLowerCase());
    return isDealerCategory(p.category) && matchSearch;
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

  const setVerification = async (
    dealerId: string,
    firmName: string,
    status: "verified" | "pending" | "rejected" | "unverified"
  ) => {
    setActionError(null);
    setBusyId(dealerId);
    try {
      await updateDirectoryProfile(dealerId, { verificationStatus: status });
      addLog({
        action: `Dealer ${status}`,
        performedBy: userEmail,
        role: "Admin",
        target: firmName,
      });
      void refreshDirectoryProfiles();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update verification" });
    } finally {
      setBusyId(null);
    }
  };

  const setDashboardAccess = async (
    dealerId: string,
    userId: string | null | undefined,
    firmName: string,
    grant: boolean
  ) => {
    if (!userId) {
      setActionError("This directory card is not linked to a user account.");
      return;
    }
    setActionError(null);
    setBusyId(dealerId);
    try {
      const updated = await authService.updateUser(userId, {
        role: grant ? "broker" : "user",
      });
      setAdminUsers((prev) =>
        prev.map((u) => (u.id === updated.id ? { ...u, role: updated.role } : u))
      );
      if (grant) {
        await updateDirectoryProfile(dealerId, { verificationStatus: "pending" });
      }
      addLog({
        action: grant ? "Dealer Access Granted" : "Dealer Access Revoked",
        performedBy: userEmail,
        role: "Admin",
        target: firmName,
      });
      void refreshDirectoryProfiles();
    } catch (err) {
      handleClientError(err, { fallback: "Unable to update dealer access" });
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Dealer Management"
        description={`${dealers.length} registered dealers · Grant access, verify badges, or remove`}
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

      {actionError ? (
        <Alert
          variant="danger"
          title="Action failed"
          description={actionError}
          onDismiss={() => setActionError(null)}
        />
      ) : null}

      {dealers.length === 0 ? (
        <EmptyState
          title="No dealers found"
          description="No dealers match your search."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {dealers.map((dealer) => {
            const role = dealer.userId ? roleByUserId.get(dealer.userId) : undefined;
            const hasAccess = role === "broker" || role === "admin";
            const verification = dealer.verificationStatus ?? "unverified";
            const accent =
              verification === "verified"
                ? "emerald"
                : verification === "rejected"
                  ? "rose"
                  : hasAccess
                    ? "indigo"
                    : "gold";

            return (
              <AdminCard
                key={dealer.id}
                accent={accent}
                footer={
                  <>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-charcoal/45">
                      {dealer.experience || "—"} experience
                    </span>
                    <DropdownMenu
                      accent="terracotta"
                      align="right"
                      trigger={
                        <button
                          type="button"
                          disabled={busyId === dealer.id}
                          className="p-2 bg-white border border-indigo/10 hover:border-terracotta/30 text-charcoal/45 hover:text-terracotta rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      }
                      items={[
                        {
                          id: "view-public",
                          label: "View Profile Page",
                          href: `/dealers/${dealer.id}`,
                          target: "_blank",
                          icon: ExternalLink,
                        },
                        {
                          id: "call",
                          label: `Call: ${dealer.mobile || "—"}`,
                          href: dealer.mobile ? `tel:${dealer.mobile}` : undefined,
                          disabled: !dealer.mobile,
                          icon: Phone,
                        },
                        {
                          id: "grant",
                          label: hasAccess
                            ? "Revoke dashboard access"
                            : "Grant dashboard access",
                          onClick: () =>
                            void setDashboardAccess(
                              dealer.id,
                              dealer.userId,
                              dealer.firmName,
                              !hasAccess
                            ),
                          icon: hasAccess ? UserX : UserCheck,
                          dividerBefore: true,
                          disabled: !dealer.userId || busyId === dealer.id,
                        },
                        {
                          id: "verify",
                          label:
                            verification === "verified"
                              ? "Remove verified badge"
                              : "Mark verified",
                          onClick: () =>
                            void setVerification(
                              dealer.id,
                              dealer.firmName,
                              verification === "verified" ? "pending" : "verified"
                            ),
                          icon: ShieldCheck,
                          disabled: busyId === dealer.id,
                        },
                        {
                          id: "delete",
                          label: "Remove Dealer Account",
                          onClick: () =>
                            setPendingDelete({ id: dealer.id, name: dealer.firmName }),
                          icon: Trash2,
                          variant: "danger",
                          dividerBefore: true,
                        },
                      ]}
                    />
                  </>
                }
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar
                      name={dealer.firmName}
                      size="lg"
                      shape="rounded"
                      tone="indigo"
                      className="ring-4 ring-sand/70"
                    />
                    <div className="min-w-0">
                      <h3 className="font-serif text-base font-black text-charcoal leading-tight truncate">
                        {dealer.firmName}
                      </h3>
                      <p className="text-xs text-charcoal/45 font-semibold mt-0.5">
                        {dealer.ownerName}
                      </p>
                    </div>
                  </div>
                  <Badge tone="primary" size="sm" className="shrink-0 whitespace-nowrap">
                    {dealer.category}
                  </Badge>
                </div>

                <div className="flex flex-wrap gap-1.5">
                  <Badge tone={hasAccess ? "success" : "neutral"} size="sm">
                    {hasAccess ? "Dashboard access" : "No dashboard"}
                  </Badge>
                  <Badge
                    tone={
                      verification === "verified"
                        ? "success"
                        : verification === "rejected"
                          ? "danger"
                          : verification === "pending"
                            ? "warning"
                            : "neutral"
                    }
                    size="sm"
                  >
                    {verification}
                  </Badge>
                </div>

                <div className="space-y-1.5 rounded-2xl bg-sand/35 px-3 py-2.5">
                  {dealer.city && (
                    <div className="flex items-center gap-2 text-xs text-charcoal/70 font-semibold">
                      <MapPin className="w-3.5 h-3.5 text-indigo/40 shrink-0" />
                      {dealer.city}
                    </div>
                  )}
                  {dealer.mobile && (
                    <div className="flex items-center gap-2 text-xs text-charcoal/70 font-semibold">
                      <Phone className="w-3.5 h-3.5 text-indigo/40 shrink-0" />
                      {dealer.mobile}
                    </div>
                  )}
                  {dealer.reraId && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="text-xs text-emerald-700 font-bold">{dealer.reraId}</span>
                    </div>
                  )}
                </div>

                {dealer.description ? (
                  <p className="text-xs text-charcoal/55 font-semibold leading-relaxed line-clamp-2">
                    {dealer.description}
                  </p>
                ) : null}
              </AdminCard>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={() => void confirmDelete()}
        title="Remove dealer?"
        description={
          pendingDelete
            ? `Remove dealer "${pendingDelete.name}" from the platform?`
            : undefined
        }
        confirmLabel="Remove"
        tone="danger"
      />
    </div>
  );
}
