"use client";

import React, { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { authService } from "@/services";
import { useInvalidateMarketplace } from "@/hooks/queries/marketplace";
import type { AdminUser, AuthRole } from "@/types";
import { Users, ShieldOff, UserCheck, Briefcase } from "lucide-react";
import {
  DashboardPageHeader,
  SearchInput,
  Badge,
  Button,
  Alert,
  ConfirmDialog,
  CustomSelect,
  EmptyState,
  Panel,
} from "@/components/ui";

const ROLE_OPTIONS = [
  { label: "Buyer (user)", value: "user" },
  { label: "Broker", value: "broker" },
] as const;

export default function AdminUsersPage() {
  const { adminUsers, addLog, userEmail, userProfile } = useApp();
  const { invalidateAdminUsers } = useInvalidateMarketplace();
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [pendingSuspend, setPendingSuspend] = useState<AdminUser | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return adminUsers;
    return adminUsers.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [adminUsers, search]);

  const patchUser = async (
    user: AdminUser,
    updates: { role?: AuthRole; status?: AdminUser["status"] },
    logAction: string
  ) => {
    setError(null);
    setBusyId(user.id);
    try {
      await authService.updateUser(user.id, updates);
      addLog({
        action: logAction,
        performedBy: userEmail,
        role: "Admin",
        target: user.email,
      });
      await invalidateAdminUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update user");
    } finally {
      setBusyId(null);
    }
  };

  const confirmSuspend = async () => {
    if (!pendingSuspend) return;
    const nextStatus = pendingSuspend.status === "suspended" ? "active" : "suspended";
    const action =
      nextStatus === "suspended"
        ? `Suspended user ${pendingSuspend.email}`
        : `Reactivated user ${pendingSuspend.email}`;
    await patchUser(pendingSuspend, { status: nextStatus }, action);
    setPendingSuspend(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="User Management"
        description={`${adminUsers.length} accounts · change role or suspend without granting admin`}
        actions={
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search name, email, role…"
            accent="terracotta"
            containerClassName="w-64 flex-none min-w-0"
          />
        }
      />

      {error ? (
        <Alert
          variant="danger"
          title="Update failed"
          description={error}
          onDismiss={() => setError(null)}
        />
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No users found"
          description="Try a different search, or wait for the admin users list to load."
          icon={<Users className="w-14 h-14 text-charcoal/25" />}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((user) => {
            const isSelf = user.id === userProfile?.id;
            const busy = busyId === user.id;
            const isAdminRole = user.role === "admin";

            return (
              <Panel key={user.id} padding="md" rounded="2xl" className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-bold text-charcoal truncate">{user.name}</p>
                    <Badge
                      tone={user.status === "active" ? "success" : "danger"}
                      size="sm"
                    >
                      {user.status}
                    </Badge>
                    <Badge tone="neutral" size="sm">
                      {user.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal/50 font-semibold mt-1 truncate">
                    {user.email}
                  </p>
                  <p className="text-[10px] text-charcoal/35 font-semibold mt-0.5">
                    Joined {user.joinedDate}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {!isAdminRole ? (
                    <div
                      className={`w-40 ${busy || isSelf ? "pointer-events-none opacity-50" : ""}`}
                    >
                      <CustomSelect
                        value={user.role}
                        onChange={(value) => {
                          if (busy || isSelf) return;
                          const role = value as AuthRole;
                          if (role === user.role) return;
                          void patchUser(
                            user,
                            { role },
                            `Changed role of ${user.email} to ${role}`
                          );
                        }}
                        options={[...ROLE_OPTIONS]}
                        accent="terracotta"
                        buttonClassName="px-3 py-2 text-xs font-bold bg-sand/30 border border-indigo/10"
                      />
                    </div>
                  ) : (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/40 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Admin (locked)
                    </span>
                  )}

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={busy || isSelf || isAdminRole}
                    onClick={() => setPendingSuspend(user)}
                    className={
                      user.status === "suspended"
                        ? "border-emerald-500/20 text-emerald-700 hover:bg-emerald-500/10"
                        : "border-rose-500/20 text-rose-600 hover:bg-rose-500/10"
                    }
                  >
                    {user.status === "suspended" ? (
                      <>
                        <UserCheck className="w-4 h-4" /> Reactivate
                      </>
                    ) : (
                      <>
                        <ShieldOff className="w-4 h-4" /> Suspend
                      </>
                    )}
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingSuspend)}
        onClose={() => setPendingSuspend(null)}
        onConfirm={() => void confirmSuspend()}
        title={
          pendingSuspend?.status === "suspended" ? "Reactivate account?" : "Suspend account?"
        }
        description={
          pendingSuspend
            ? pendingSuspend.status === "suspended"
              ? `Restore access for ${pendingSuspend.email}.`
              : `Suspend ${pendingSuspend.email}. They will not be able to sign in or use protected actions.`
            : undefined
        }
        confirmLabel={pendingSuspend?.status === "suspended" ? "Reactivate" : "Suspend"}
        tone={pendingSuspend?.status === "suspended" ? "warning" : "danger"}
        loading={Boolean(busyId)}
      />
    </div>
  );
}
