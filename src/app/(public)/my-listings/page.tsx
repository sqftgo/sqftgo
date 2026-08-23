"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { usePropertiesQuery } from "@/hooks/queries/marketplace";
import { inquiryService } from "@/services";
import { ROUTES } from "@/constants/routes";
import { listingStatusLabel } from "@/lib/user-listings";
import type { PropertyInquiryView } from "@/types";
import {
  Building2,
  Mail,
  MapPin,
  MessageSquare,
  Plus,
  ShieldCheck,
  Clock,
  XCircle,
} from "lucide-react";
import {
  Avatar,
  Badge,
  Button,
  EmptyState,
  Panel,
  StatCard,
  KpiGrid,
} from "@/components/ui";

export default function MyListingsPage() {
  const { isLoggedIn, sessionReady, userEmail, userName, userProfile, userRole } = useApp();
  const mineQuery = usePropertiesQuery({ mine: true, limit: 20 });
  const listings = mineQuery.data?.items ?? [];
  const [leads, setLeads] = useState<PropertyInquiryView[]>([]);
  const [leadsReady, setLeadsReady] = useState(false);

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    let cancelled = false;
    (async () => {
      try {
        const rows = await inquiryService.listFlat({ received: true });
        if (!cancelled) setLeads(rows.filter((r) => r.status !== "archived"));
      } catch {
        if (!cancelled) setLeads([]);
      } finally {
        if (!cancelled) setLeadsReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sessionReady, isLoggedIn]);

  const displayName = (userName || userProfile?.name || "").trim() || userEmail.split("@")[0];
  const listingStatus = userProfile?.listingStatus ?? "none";
  const remaining = Math.max(0, 2 - listings.filter((p) => p.status !== "Rejected").length);
  const canAdd = remaining > 0 && listingStatus !== "rejected" && userRole !== "broker";

  const titleById = useMemo(() => {
    const map = new Map<string, string>();
    for (const p of listings) map.set(p.id, p.title);
    return map;
  }, [listings]);

  if (!sessionReady) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <p className="text-sm font-semibold text-charcoal/50">Loading your profile…</p>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center p-6">
        <EmptyState
          title="Sign in required"
          description="Sign in to manage your listings and see buyer inquiries."
        >
          <Link href="/login">
            <Button variant="secondary">Sign in</Button>
          </Link>
        </EmptyState>
      </div>
    );
  }

  const formatPrice = (v: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const statusTone = (status: string) => {
    if (status === "Active") return "success" as const;
    if (status === "Pending Review") return "warning" as const;
    if (status === "Rejected") return "danger" as const;
    return "neutral" as const;
  };

  const verifyTone =
    listingStatus === "approved"
      ? "success"
      : listingStatus === "pending"
        ? "warning"
        : listingStatus === "rejected"
          ? "danger"
          : "info";

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 space-y-8">
      <Panel padding="lg" rounded="3xl" className="shadow-lg bg-white/80">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar
            name={displayName}
            src={userProfile?.avatar}
            size="xl"
            shape="rounded"
            tone="indigo"
          />
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-serif font-black text-charcoal capitalize truncate">
              {displayName}
            </h1>
            <div className="flex items-center gap-2 mt-1">
              <Mail className="w-4 h-4 text-charcoal/40" />
              <p className="text-sm text-charcoal/60 font-semibold truncate">{userEmail}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-3">
              <Badge tone={verifyTone} size="sm">
                <span className="inline-flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  {listingStatusLabel(listingStatus)}
                </span>
              </Badge>
              {userProfile?.listingVerifiedAt ? (
                <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">
                  Verified {new Date(userProfile.listingVerifiedAt).toLocaleDateString("en-IN")}
                </span>
              ) : null}
            </div>
            <p className="mt-3 text-sm text-charcoal/60 font-medium max-w-xl">
              You can list up to 2 properties. Each listing stays private until an admin
              approves it. Include nearest hospital, school, and transportation on every listing.
            </p>
          </div>
          {canAdd ? (
            <Link href={ROUTES.postProperty}>
              <Button>
                <Plus className="w-4 h-4" /> Add property
              </Button>
            </Link>
          ) : null}
        </div>
      </Panel>

      <KpiGrid className="sm:grid-cols-3">
        <StatCard
          label="My listings"
          value={listings.length}
          icon={<Building2 className="w-4 h-4 text-indigo" />}
          tone="indigo"
        />
        <StatCard
          label="Slots left"
          value={remaining}
          icon={<Plus className="w-4 h-4 text-indigo" />}
        />
        <StatCard
          label="Buyer inquiries"
          value={leadsReady ? leads.length : "—"}
          icon={<MessageSquare className="w-4 h-4 text-indigo" />}
        />
      </KpiGrid>

      <Panel title="My properties" rounded="3xl" padding="none">
        {mineQuery.isPending && listings.length === 0 ? (
          <p className="p-6 text-sm font-semibold text-charcoal/50">Loading listings…</p>
        ) : listings.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No properties yet"
              description="Add a home, plot, or commercial listing. Admin reviews it before buyers can see it."
            >
              <Link href={ROUTES.postProperty}>
                <Button>
                  <Plus className="w-4 h-4" /> List a property
                </Button>
              </Link>
            </EmptyState>
          </div>
        ) : (
          <div className="divide-y divide-indigo/5">
            {listings.map((prop) => (
              <div key={prop.id} className="flex items-center gap-4 p-4">
                <div className="w-14 h-14 rounded-xl overflow-hidden bg-sand/35 shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={prop.images?.[0]}
                    alt=""
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
                  {prop.status === "Rejected" && prop.rejectionReason ? (
                    <p className="mt-1 text-[11px] text-rose-600 font-semibold line-clamp-2">
                      {prop.rejectionReason}
                    </p>
                  ) : null}
                </div>
                <div className="text-right shrink-0 space-y-1">
                  <Badge tone={statusTone(prop.status)} size="sm">
                    {prop.status}
                  </Badge>
                  <p className="text-sm font-serif font-black text-indigo">
                    {formatPrice(prop.price)}
                  </p>
                  {prop.status !== "Active" ? (
                    <Link
                      href={`/my-listings/${prop.id}/edit`}
                      className="block text-[10px] font-black text-indigo uppercase tracking-wider hover:underline"
                    >
                      Edit
                    </Link>
                  ) : (
                    <Link
                      href={`/property/${prop.id}`}
                      className="block text-[10px] font-black text-indigo uppercase tracking-wider hover:underline"
                    >
                      View
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>

      <Panel title="Inquiries on your listings" rounded="3xl" padding="none">
        {!leadsReady ? (
          <p className="p-6 text-sm font-semibold text-charcoal/50">Loading inquiries…</p>
        ) : leads.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No buyer inquiries yet"
              description="When someone messages you about an Active listing, it shows up here."
            />
          </div>
        ) : (
          <div className="divide-y divide-indigo/5">
            {leads.map((lead) => (
              <div key={lead.id} className="p-4 space-y-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-bold text-charcoal">{lead.name}</p>
                    <p className="text-[11px] text-charcoal/45 font-semibold">
                      {titleById.get(lead.propertyId) ?? "Your listing"} · {lead.email} ·{" "}
                      {lead.phone}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold text-charcoal/40 inline-flex items-center gap-1">
                    {lead.status === "new" ? (
                      <Clock className="w-3 h-3" />
                    ) : lead.status === "archived" ? (
                      <XCircle className="w-3 h-3" />
                    ) : null}
                    {lead.date}
                  </span>
                </div>
                <p className="text-sm text-charcoal/70 font-medium">{lead.message}</p>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}
