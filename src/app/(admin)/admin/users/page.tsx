"use client";
import React, { useState, useMemo } from "react";
import { useApp, MockUser } from "@/context/AppContext";
import { Trash2, Shield, UserCheck, UserX, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  CustomSelect,
  DashboardPageHeader,
  SearchInput,
  Badge,
  Avatar,
  DataTable,
  ConfirmDialog,
  type DataTableColumn,
} from "@/components/ui";

const ROLE_COLORS: Record<string, string> = {
  user: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  broker: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  admin: "bg-terracotta/10 text-terracotta border-terracotta/20",
};

export default function AdminUsersPage() {
  const { adminUsers, setAdminUsers, addLog, userEmail } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { authService } = await import("@/services/auth");
        const users = await authService.listUsers();
        if (!cancelled) setAdminUsers(users);
      } catch {
        // Keep existing admin user cache if admin API is unavailable
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [setAdminUsers]);

  const roleOptions = useMemo(() => ["All", "user", "broker", "admin"].map(r => ({
    label: r === "All" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1),
    value: r
  })), []);

  const statusOptions = useMemo(() => ["All", "active", "suspended"].map(s => ({
    label: s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1),
    value: s
  })), []);

  const filtered = adminUsers.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = async (id: string, name: string, current: string) => {
    const next = current === "active" ? "suspended" : "active";
    setActionError(null);
    try {
      const { authService } = await import("@/services/auth");
      const updated = await authService.updateUser(id, { status: next as "active" | "suspended" });
      setAdminUsers(prev => prev.map(u => u.id === id ? updated : u));
      addLog({ action: `User ${next === "suspended" ? "Suspended" : "Activated"}`, performedBy: userEmail, role: "Admin", target: name });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to update user status");
    }
  };

  const changeRole = async (id: string, name: string, role: MockUser["role"]) => {
    setActionError(null);
    try {
      const { authService } = await import("@/services/auth");
      const updated = await authService.updateUser(id, { role });
      setAdminUsers(prev => prev.map(u => u.id === id ? updated : u));
      addLog({ action: "User Role Changed", performedBy: userEmail, role: "Admin", target: `${name} → ${role}` });
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Unable to change role");
    }
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    // Soft-delete via suspend until Auth Admin delete is wired
    void toggleStatus(pendingDelete.id, pendingDelete.name, "active");
    setPendingDelete(null);
  };

  const columns: DataTableColumn<MockUser>[] = [
    {
      key: "user",
      header: "User",
      render: (user) => (
        <div className="flex items-center gap-3">
          <Avatar name={user.name} size="md" tone="indigo" />
          <div>
            <p className="text-sm font-bold text-charcoal">{user.name}</p>
            <p className="text-[10px] text-charcoal/40 font-semibold">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      header: "Role",
      render: (user) => (
        <select
          value={user.role}
          onChange={(e) => changeRole(user.id, user.name, e.target.value as MockUser["role"])}
          className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${ROLE_COLORS[user.role]}`}
        >
          {["user", "broker", "admin"].map((r) => (
            <option key={r} value={r}>{r}</option>
          ))}
        </select>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (user) => (
        <Badge status={user.status}>{user.status}</Badge>
      ),
    },
    {
      key: "joined",
      header: "Joined",
      render: (user) => (
        <span className="text-xs text-charcoal/50 font-semibold">{user.joinedDate}</span>
      ),
    },
    {
      key: "inquiries",
      header: "Inquiries",
      render: (user) => (
        <span className="text-sm font-bold text-charcoal/70">{user.inquiriesCount}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (user) => (
        <DropdownMenu
          accent="terracotta"
          align="right"
          trigger={
            <button type="button" className="p-2 hover:bg-indigo/5 text-charcoal/40 hover:text-terracotta rounded-xl transition-all cursor-pointer">
              <MoreVertical className="w-4 h-4" />
            </button>
          }
          items={[
            {
              id: "toggle-status",
              label: user.status === "active" ? "Suspend User" : "Activate User",
              onClick: () => toggleStatus(user.id, user.name, user.status),
              icon: user.status === "active" ? UserX : UserCheck,
              variant: user.status === "active" ? "danger" : "success",
            },
            { id: "set-user", label: "Make Regular User", onClick: () => changeRole(user.id, user.name, "user"), disabled: user.role === "user", icon: Shield },
            { id: "set-broker", label: "Make Broker / Dealer", onClick: () => changeRole(user.id, user.name, "broker"), disabled: user.role === "broker", icon: Shield },
            { id: "set-admin", label: "Make Administrator", onClick: () => changeRole(user.id, user.name, "admin"), disabled: user.role === "admin", icon: Shield },
            {
              id: "delete",
              label: "Delete User Account",
              onClick: () => setPendingDelete({ id: user.id, name: user.name }),
              icon: Trash2,
              variant: "danger",
              dividerBefore: true,
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="User Management"
        description={`${adminUsers.length} registered users`}
      />
      {actionError ? (
        <p className="text-sm font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          {actionError}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search users..."
          accent="terracotta"
        />
        <CustomSelect
          options={roleOptions}
          value={roleFilter}
          onChange={setRoleFilter}
          accent="terracotta"
          buttonClassName="bg-sand/35 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
          className="w-44"
        />
        <CustomSelect
          options={statusOptions}
          value={statusFilter}
          onChange={setStatusFilter}
          accent="terracotta"
          buttonClassName="bg-sand/35 border border-indigo/5 text-charcoal text-xs font-semibold px-4 py-2.5 rounded-xl"
          className="w-44"
        />
      </div>

      <DataTable
        columns={columns}
        rows={filtered}
        rowKey={(u) => u.id}
        emptyMessage="No users match your filters."
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete user?"
        description={pendingDelete ? `Delete user "${pendingDelete.name}"? This cannot be undone.` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
