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
  Plus, 
  Search, 
  Compass, 
  Sliders,
  Sparkles
} from "lucide-react";
import { motion } from "framer-motion";

interface UserDropdownProps {
  userEmail: string;
  userRole: "user" | "broker" | "admin" | null;
  onClose: () => void;
  onLogout: () => void;
  align?: "left" | "right";
}

export const UserDropdown: React.FC<UserDropdownProps> = ({
  userEmail,
  userRole,
  onClose,
  onLogout,
  align = "right"
}) => {
  const router = useRouter();
  const isAdmin = userRole === "admin" || userEmail === "admin@svrepl.com";
  const isBroker = userRole === "broker";
  
  // Create email initials (e.g. "AD" for admin, or first letter of user email)
  const initial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

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
      className={`absolute z-[100] mt-3 w-64 rounded-3xl bg-white text-charcoal shadow-2xl border border-gray-100 overflow-hidden flex flex-col ${
        align === "right" ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Upward Tooltip Caret */}
      <div 
        className={`absolute -top-2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100 z-[101] ${
          align === "right" ? "right-6" : "left-6"
        }`} 
      />

      {/* Account Info Profile Header */}
      <div className="p-4 bg-sand/30 border-b border-sand/40 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-indigo text-white flex items-center justify-center font-extrabold text-sm shadow-md shadow-indigo/25">
          {initial}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-charcoal truncate" title={userEmail}>
            {userEmail}
          </span>
          <span className="text-[9px] font-black tracking-wider uppercase mt-0.5 flex items-center gap-1">
            {isAdmin ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                <span className="text-terracotta">Superadmin</span>
              </>
            ) : isBroker ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-emerald-600">Verified Broker</span>
              </>
            ) : (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo animate-pulse" />
                <span className="text-indigo">Verified Client</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Dropdown Menu Items */}
      <div className="p-2 flex flex-col gap-0.5 max-h-[350px] overflow-y-auto no-scrollbar">
        {isAdmin ? (
          /* Admin Specific Navigation & Sourcing Data Controls */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Sourcing Command
            </div>
            
            <Link
              href="/admin?tab=overview"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Sliders className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Overview Command</span>
            </Link>

            <Link
              href="/admin?tab=properties"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Building className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Properties Database</span>
            </Link>

            <Link
              href="/admin?tab=enquiries"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <MessageSquare className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Sourcing Enquiries</span>
            </Link>

            <Link
              href="/admin?tab=directory"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Briefcase className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Business Directory</span>
            </Link>

            <div className="border-t border-sand/40 my-1" />

            <Link
              href="/admin?tab=post-property"
              onClick={handleItemClick}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo hover:bg-indigo-hover transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-white" />
                <span>Add Property Listing</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/80 animate-pulse" />
            </Link>
          </>
        ) : isBroker ? (
          /* Broker Specific Navigation */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Broker Console
            </div>

            <Link
              href="/dealer/dashboard"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-extrabold text-indigo bg-indigo/5 hover:bg-indigo/10 border border-indigo/20 transition-all group mb-1.5"
            >
              <Sliders className="w-4 h-4 text-indigo" />
              <span>Dealers Dashboard</span>
            </Link>

            <Link
              href="/hub"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Compass className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Explore Sourcing Hub</span>
            </Link>

            <Link
              href="/listings"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Building className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Browse Properties</span>
            </Link>

            <Link
              href="/services"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Briefcase className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Services Directory</span>
            </Link>

            <div className="border-t border-sand/40 my-1" />

            <Link
              href="/post-property"
              onClick={handleItemClick}
              className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-white bg-indigo hover:bg-indigo-hover transition-colors shadow-sm"
            >
              <div className="flex items-center gap-2.5">
                <Plus className="w-4 h-4 text-white" />
                <span>Add Property Listing</span>
              </div>
              <Sparkles className="w-3.5 h-3.5 text-white/80 animate-pulse" />
            </Link>
          </>
        ) : (
          /* Client / Partner Regular User Navigation */
          <>
            <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-widest">
              Client Portal
            </div>

            <Link
              href="/hub"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Compass className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Explore Sourcing Hub</span>
            </Link>

            <Link
              href="/listings"
              onClick={handleItemClick}
              className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/80 hover:text-indigo hover:bg-sand/30 transition-all group"
            >
              <Building className="w-4 h-4 text-charcoal/40 group-hover:text-indigo transition-colors" />
              <span>Browse Properties</span>
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
        <button
          onClick={handleLogoutClick}
          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-charcoal/70 hover:text-red-600 hover:bg-red-50 transition-colors w-full text-left cursor-pointer group"
        >
          <LogOut className="w-4 h-4 text-charcoal/40 group-hover:text-red-500 transition-colors" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};
