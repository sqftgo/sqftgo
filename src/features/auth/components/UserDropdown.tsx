"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  LogOut,
  Building,
  Users,
  MessageSquare,
  Briefcase,
  Sliders,
  Calendar,
} from "lucide-react";

interface UserDropdownProps {
  userEmail: string;
  userName?: string;
  userAvatar?: string | null;
  userRole: "user" | "broker" | "admin" | null;
  onClose: () => void;
  onLogout: () => void;
  align?: "left" | "right";
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userEmail,
  userName,
  userAvatar,
  userRole,
  onClose,
  onLogout,
  align = "right"
}) => {
  const router = useRouter();
  const isAdmin = userRole === "admin" || userEmail === "admin@sqftgo.com";
  const isBroker = userRole === "broker";
  const displayName = (userName || "").trim() || userEmail;
  const initial = displayName ? displayName.charAt(0).toUpperCase() : "U";

  const handleLogoutClick = () => {
    onLogout();
    onClose();
    router.push("/");
  };

  const handleItemClick = () => {
    onClose();
  };

  return (
    <div
      className={`absolute z-[100] mt-3 w-64 rounded-3xl bg-white text-charcoal shadow-2xl border border-indigo/10 overflow-hidden flex flex-col ${
        align === "right" ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Upward Tooltip Caret */}
      <div 
        className={`absolute -top-2 w-4 h-4 rotate-45 bg-white border-t border-l border-indigo/10 z-[101] ${
          align === "right" ? "right-6" : "left-6"
        }`} 
      />

            <Link
              href={isAdmin ? "/admin" : isBroker ? "/dealer/dashboard" : "/my-listings"}
              onClick={handleItemClick}
              className="p-4 bg-sand/30 border-b border-sand/40 flex items-center gap-3 hover:bg-sand/50 transition-colors"
            >
        <div className="w-10 h-10 rounded-2xl bg-indigo text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo/25 overflow-hidden shrink-0">
          {userAvatar ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={userAvatar} alt="" className="w-full h-full object-cover" />
          ) : (
            initial
          )}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-charcoal truncate" title={userEmail}>
            {displayName}
          </span>
          {displayName !== userEmail ? (
            <span className="text-[10px] font-semibold text-charcoal/45 truncate" title={userEmail}>
              {userEmail}
            </span>
          ) : null}
          <span className="text-[9px] font-black tracking-wider uppercase mt-0.5 flex items-center gap-1">
            {isAdmin ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                <span className="text-terracotta">Superadmin</span>
              </>
            ) : isBroker ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600">Verified Dealer</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo animate-pulse" />
                <span className="text-indigo">Verified Client</span>
              </>
            )}
          </span>
        </div>
      </Link>

      {/* Dropdown Menu Items */}
      <div className="p-2 flex flex-col gap-0.5 max-h-[350px] overflow-y-auto no-scrollbar">
        {isAdmin ? (
          /* Admin portal — real App Router paths (not legacy ?tab= links) */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Admin Portal
            </div>

            <Link
              href="/admin"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-indigo bg-indigo/5 hover:bg-indigo/10 border border-indigo/20 transition-all group mb-1.5"
            >
              <Sliders className="w-4 h-4 text-indigo" />
              <span>Admin Dashboard</span>
            </Link>

            <Link
              href="/admin/properties"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Building className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Properties</span>
            </Link>

            <Link
              href="/admin/dealers"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Briefcase className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Dealers</span>
            </Link>

            <Link
              href="/admin/approvals"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Approvals</span>
            </Link>

            <Link
              href="/admin/users"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Users className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Users</span>
            </Link>
          </>
        ) : isBroker ? (
          /* Dealer dashboard navigation (DB role remains broker) */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Dealer Console
            </div>

            <Link
              href="/dealer/dashboard"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-indigo bg-indigo/5 hover:bg-indigo/10 border border-indigo/20 transition-all group mb-1.5"
            >
              <Sliders className="w-4 h-4 text-indigo" />
              <span>Dealer Dashboard</span>
            </Link>

            <Link
              href="/services"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Briefcase className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Services Directory</span>
            </Link>


          </>
        ) : (
          /* Client / Partner Regular User Navigation */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Client Portal
            </div>

            <Link
              href="/profile"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <User className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>My Profile</span>
            </Link>

            <Link
              href="/my-listings"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Building className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>My listings</span>
            </Link>

            <Link
              href="/my-inquiries"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>My Inquiries</span>
            </Link>

            <Link
              href="/my-visits"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Calendar className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>My Visits</span>
            </Link>

            <Link
              href="/services"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Briefcase className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Services Directory</span>
            </Link>
          </>
        )}

        {/* Separator */}
        <div className="border-t border-sand/40 my-1" />

        {/* Sign Out Action */}
        <button suppressHydrationWarning
          onClick={handleLogoutClick}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/70 hover:text-rose-600 hover:bg-rose-50 transition-colors w-full text-left cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-charcoal/40 group-hover:text-rose-500 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
