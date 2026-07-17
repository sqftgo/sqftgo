"use client";
import React, { useState } from "react";
import { useApp, MockUser } from "@/context/AppContext";
import { Search, Edit2, Trash2, Shield, UserCheck, UserX, Plus } from "lucide-react";

const ROLE_COLORS: Record<string, string> = {
  user: "bg-sky-500/10 text-sky-600 border-sky-500/20",
  broker: "bg-purple-500/10 text-purple-600 border-purple-500/20",
  admin: "bg-terracotta/10 text-terracotta border-terracotta/20",
};

export default function AdminUsersPage() {
  const { mockUsers, setMockUsers, addLog, userEmail } = useApp();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const filtered = mockUsers.filter(u => {
    const matchSearch = !search || u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  const toggleStatus = (id: string, name: string, current: string) => {
    const next = current === "active" ? "suspended" : "active";
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, status: next as "active" | "suspended" } : u));
    addLog({ action: `User ${next === "suspended" ? "Suspended" : "Activated"}`, performedBy: userEmail, role: "Admin", target: name });
  };

  const changeRole = (id: string, name: string, role: MockUser["role"]) => {
    setMockUsers(prev => prev.map(u => u.id === id ? { ...u, role } : u));
    addLog({ action: "User Role Changed", performedBy: userEmail, role: "Admin", target: `${name} → ${role}` });
  };

  const deleteUser = (id: string, name: string) => {
    if (!confirm(`Delete user "${name}"?`)) return;
    setMockUsers(prev => prev.filter(u => u.id !== id));
    addLog({ action: "User Deleted", performedBy: userEmail, role: "Admin", target: name });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">User Management</h1>
          <p className="text-charcoal/40 text-sm font-semibold mt-1">{mockUsers.length} registered users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-charcoal/30" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users..." className="w-full bg-sand/35 border border-indigo/5 focus:border-terracotta/50 text-charcoal placeholder-charcoal/40 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="bg-sand/35 border border-indigo/5 text-charcoal/80 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          {["All", "user", "broker", "admin"].map(r => <option key={r} value={r}>{r === "All" ? "All Roles" : r.charAt(0).toUpperCase() + r.slice(1)}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-sand/35 border border-indigo/5 text-charcoal/80 text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none cursor-pointer">
          {["All", "active", "suspended"].map(s => <option key={s} value={s}>{s === "All" ? "All Status" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white/80 border border-indigo/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b border-indigo/5 bg-white/40">
              <tr>{["User", "Role", "Status", "Joined", "Inquiries", "Actions"].map(h => (
                <th key={h} className="px-5 py-3.5 text-[9px] font-black text-charcoal/40 uppercase tracking-wider whitespace-nowrap">{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-indigo/5">
              {filtered.map(user => (
                <tr key={user.id} className="hover:bg-indigo/5 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo/10 flex items-center justify-center text-indigo font-black text-xs shrink-0">{user.name.charAt(0)}</div>
                      <div>
                        <p className="text-sm font-bold text-charcoal">{user.name}</p>
                        <p className="text-[10px] text-charcoal/40 font-semibold">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select value={user.role} onChange={e => changeRole(user.id, user.name, e.target.value as MockUser["role"])}
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg border bg-transparent cursor-pointer ${ROLE_COLORS[user.role]}`}>
                      {["user", "broker", "admin"].map(r => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`text-[9px] font-black uppercase px-2 py-1 rounded-lg border ${user.status === "active" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-rose-500/10 text-rose-500 border-rose-500/20"}`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-5 py-4"><span className="text-xs text-charcoal/50 font-semibold">{user.joinedDate}</span></td>
                  <td className="px-5 py-4"><span className="text-sm font-bold text-charcoal/70">{user.inquiriesCount}</span></td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => toggleStatus(user.id, user.name, user.status)}
                        className={`p-2 rounded-lg transition-all cursor-pointer ${user.status === "active" ? "bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500" : "bg-indigo/5 hover:bg-emerald-500/10 text-charcoal/40 hover:text-emerald-600"}`}
                        title={user.status === "active" ? "Suspend" : "Activate"}>
                        {user.status === "active" ? <UserX className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                      </button>
                      <button onClick={() => deleteUser(user.id, user.name)} className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg transition-all cursor-pointer" title="Delete">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && <div className="p-10 text-center text-charcoal/40 text-sm font-semibold">No users match your filters.</div>}
      </div>
    </div>
  );
}
