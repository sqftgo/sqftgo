"use client";
import React from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import {
  Heart,
  MapPin,
  Mail,
  Edit2,
  User,
  LogOut,
  Building2,
  MessageSquare,
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  Avatar,
  Badge,
  Button,
  Panel,
  StatCard,
  KpiGrid,
  EmptyState,
} from "@/components/ui";

export default function ProfilePage() {
  const {
    isLoggedIn,
    userEmail,
    userRole,
    userName,
    userProfile,
    favorites,
    properties,
    inquiries,
    logout,
  } = useApp();
  const router = useRouter();

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <EmptyState
          title="Sign In Required"
          description="Please login to view your profile."
          icon={<User className="w-8 h-8 text-indigo/40" />}
        >
          <Link href="/login">
            <Button variant="secondary" fullWidth>
              Sign In
            </Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const myFavoriteProps = properties.filter((p) => favorites.includes(p.id));
  const myInquiries = properties.flatMap((p) =>
    (inquiries[p.id] || [])
      .filter((i) => i.email === userEmail)
      .map((i) => ({ ...i, propertyTitle: p.title, propId: p.id }))
  );
  const displayName = userName || userEmail.split("@")[0];

  const handleLogout = () => {
    void logout().finally(() => router.push("/"));
  };

  const roleTone =
    userRole === "admin" ? "warning" : userRole === "broker" ? "primary" : "info";

  const formatPrice = (v: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const completionBits = [
    Boolean(userProfile?.name || userName),
    Boolean(userProfile?.phone),
    Boolean(userProfile?.city),
    Boolean(userProfile?.bio),
    Boolean(userProfile?.avatar),
  ];
  const completion = Math.round(
    (completionBits.filter(Boolean).length / completionBits.length) * 100
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Panel padding="lg" rounded="3xl" className="shadow-lg backdrop-blur-sm bg-white/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar
            name={displayName}
            src={userProfile?.avatar}
            size="xl"
            shape="rounded"
            tone="indigo"
          />
          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-2xl font-serif font-black text-charcoal capitalize">
                  {displayName}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-4 h-4 text-charcoal/40" />
                  <p className="text-sm text-charcoal/60 font-semibold">{userEmail}</p>
                </div>
                {(userProfile?.city || userProfile?.phone) && (
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-charcoal/55 font-semibold">
                    {userProfile?.city ? (
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {userProfile.city}
                      </span>
                    ) : null}
                    {userProfile?.phone ? <span>{userProfile.phone}</span> : null}
                  </div>
                )}
                {userProfile?.bio ? (
                  <p className="mt-3 text-sm text-charcoal/65 font-medium max-w-xl">
                    {userProfile.bio}
                  </p>
                ) : null}
              </div>
              <Badge tone={roleTone}>{userRole || "User"}</Badge>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6 flex-wrap">
          <Link href="/profile/edit">
            <Button variant="secondary" size="sm">
              <Edit2 className="w-3.5 h-3.5" /> Edit Profile
            </Button>
          </Link>
          {userRole !== "broker" && userRole !== "admin" && (
            <Link href="/my-listings">
              <Button variant="outline" size="sm">
                <Building2 className="w-3.5 h-3.5" /> My listings
              </Button>
            </Link>
          )}
          {userRole === "broker" && (
            <Link href="/dealer/dashboard">
              <Button variant="outline" size="sm" className="text-purple-600 border-purple-500/20">
                <Building2 className="w-3.5 h-3.5" /> Dealer Dashboard
              </Button>
            </Link>
          )}
          {userRole === "admin" && (
            <Link href="/admin">
              <Button variant="outline" size="sm" className="text-terracotta border-terracotta/20">
                <Building2 className="w-3.5 h-3.5" /> Admin Panel
              </Button>
            </Link>
          )}
          <Button variant="outline" size="sm" onClick={handleLogout} className="border-rose-200 text-rose-500">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </Button>
        </div>
      </Panel>

      <KpiGrid className="sm:grid-cols-3">
        <Link href="/favorites">
          <StatCard
            label="Saved Properties"
            value={myFavoriteProps.length}
            icon={<Heart className="w-4 h-4 text-indigo" />}
            tone="indigo"
          />
        </Link>
        <Link href="/my-inquiries">
          <StatCard
            label="Inquiries Sent"
            value={myInquiries.length}
            icon={<MessageSquare className="w-4 h-4 text-indigo" />}
          />
        </Link>
        <Link href="/profile/edit">
          <StatCard
            label="Profile Completion"
            value={`${completion}%`}
            icon={<User className="w-4 h-4 text-indigo" />}
          />
        </Link>
      </KpiGrid>

      {myFavoriteProps.length > 0 && (
        <Panel
          title="Saved Properties"
          rounded="3xl"
          padding="none"
          actions={
            <Link
              href="/favorites"
              className="text-[10px] font-black text-indigo uppercase tracking-wider hover:underline"
            >
              View All
            </Link>
          }
        >
          <div className="divide-y divide-indigo/5">
            {myFavoriteProps.slice(0, 4).map((prop) => (
              <Link
                key={prop.id}
                href={`/property/${prop.id}`}
                className="flex items-center gap-4 p-4 hover:bg-indigo/5 transition-colors"
              >
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-sand/35 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.images?.[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-charcoal truncate">{prop.title}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-charcoal/30" />
                    <p className="text-[10px] text-charcoal/50 font-semibold">
                      {prop.locality}, {prop.city}
                    </p>
                  </div>
                </div>
                <p className="text-sm font-serif font-black text-indigo shrink-0">
                  {formatPrice(prop.price)}
                </p>
              </Link>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
