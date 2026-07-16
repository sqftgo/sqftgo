"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Heart, MapPin, Phone, Mail, Edit2, User, LogOut, Building2, MessageSquare } from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { isLoggedIn, userEmail, userRole, userName, favorites, properties, inquiries, setIsLoggedIn, setUserEmail, setUserRole } = useApp();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-xl">
          <User className="w-14 h-14 text-indigo/30 mx-auto mb-5" />
          <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Sign In Required</h1>
          <p className="text-charcoal/50 text-sm font-semibold mb-6">Please login to view your profile.</p>
          <Link href="/login" className="block w-full py-3 bg-indigo text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  const myFavoriteProps = properties.filter(p => favorites.includes(p.id));
  const myInquiries = properties.flatMap(p => (inquiries[p.id] || []).filter(i => i.email === userEmail).map(i => ({ ...i, propertyTitle: p.title, propId: p.id })));
  const displayName = userName || userEmail.split("@")[0];

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    if (setUserRole) setUserRole(null);
    router.push("/");
  };

  const ROLE_COLOR: Record<string, string> = {
    user: "bg-sky-500/10 text-sky-600 border-sky-500/20",
    broker: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    admin: "bg-terracotta/10 text-terracotta border-terracotta/20",
  };

  const formatPrice = (v: number) => "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-lg backdrop-blur-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <div className="w-20 h-20 rounded-2xl bg-indigo/10 border-2 border-indigo/20 flex items-center justify-center text-indigo font-black text-3xl shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-serif font-black text-charcoal capitalize">{displayName}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-charcoal/40" />
                  <p className="text-sm text-charcoal/60 font-semibold">{userEmail}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border ${ROLE_COLOR[userRole || "user"]}`}>
                  {userRole || "User"}
                </span>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap">
          <Link href="/profile/edit" className="flex items-center gap-2 px-5 py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors">
            <Edit2 className="w-3.5 h-3.5" /> Edit Profile
          </Link>
          {userRole === "broker" && (
            <Link href="/dealer/dashboard" className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/10 border border-purple-500/20 text-purple-600 text-xs font-black uppercase tracking-wider rounded-xl hover:bg-purple-500/20 transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Dealer Dashboard
            </Link>
          )}
          {userRole === "admin" && (
            <Link href="/admin" className="flex items-center gap-2 px-5 py-2.5 bg-terracotta/10 border border-terracotta/20 text-terracotta text-xs font-black uppercase tracking-wider rounded-xl hover:bg-terracotta/20 transition-colors">
              <Building2 className="w-3.5 h-3.5" /> Admin Panel
            </Link>
          )}
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2.5 border border-rose-200 text-rose-500 text-xs font-bold rounded-xl hover:bg-rose-50 transition-colors cursor-pointer">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Saved Properties", value: myFavoriteProps.length, icon: Heart, link: "/favorites" },
          { label: "Inquiries Sent", value: myInquiries.length, icon: MessageSquare, link: "/my-inquiries" },
          { label: "Profile Completion", value: "80%", icon: User, link: "/profile/edit" },
        ].map(({ label, value, icon: Icon, link }) => (
          <Link key={label} href={link} className="bg-white/80 border border-indigo/10 rounded-2xl p-5 shadow hover:shadow-md hover:border-indigo/20 transition-all">
            <Icon className="w-5 h-5 text-indigo/60 mb-3" />
            <p className="text-2xl font-serif font-black text-charcoal">{value}</p>
            <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider mt-1">{label}</p>
          </Link>
        ))}
      </div>

      {/* Favorite Properties */}
      {myFavoriteProps.length > 0 && (
        <div className="bg-white/80 border border-indigo/10 rounded-3xl overflow-hidden shadow">
          <div className="flex items-center justify-between p-5 border-b border-indigo/5">
            <h2 className="text-base font-serif font-black text-charcoal">Saved Properties</h2>
            <Link href="/favorites" className="text-[10px] font-black text-indigo uppercase tracking-wider hover:underline">View All</Link>
          </div>
          <div className="divide-y divide-indigo/5">
            {myFavoriteProps.slice(0, 4).map(prop => (
              <Link key={prop.id} href={`/property/${prop.id}`} className="flex items-center gap-4 p-4 hover:bg-indigo/2 transition-colors">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={prop.images?.[0]} alt={prop.title} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
                  <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-charcoal/30" /><p className="text-[10px] text-charcoal/50 font-semibold">{prop.locality}, {prop.city}</p></div>
                </div>
                <p className="text-sm font-serif font-black text-indigo shrink-0">{formatPrice(prop.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
