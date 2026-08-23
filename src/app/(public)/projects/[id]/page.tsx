"use client";

import React, { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  MapPin,
  Building2,
  Phone,
  User,
  ArrowLeft,
} from "lucide-react";
import { queryKeys } from "@/lib/queryKeys";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { projectService } from "@/services";
import { formatIndianCurrency } from "@/lib/format";
import type { Project } from "@/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatProjectPrice(p: Project): string {
  if (p.priceFrom == null && p.priceTo == null) return "Price on request";
  if (p.priceFrom != null && p.priceTo != null) {
    if (p.priceFrom === p.priceTo) return formatIndianCurrency(p.priceFrom, "buy");
    return `${formatIndianCurrency(p.priceFrom, "buy")} – ${formatIndianCurrency(p.priceTo, "buy")}`;
  }
  if (p.priceFrom != null) return `From ${formatIndianCurrency(p.priceFrom, "buy")}`;
  return `Up to ${formatIndianCurrency(p.priceTo!, "buy")}`;
}

function formatSize(p: Project): string | null {
  if (p.sizeFrom == null && p.sizeTo == null) return null;
  if (p.sizeFrom != null && p.sizeTo != null) {
    return `${p.sizeFrom.toLocaleString("en-IN")} – ${p.sizeTo.toLocaleString("en-IN")} sq.ft`;
  }
  if (p.sizeFrom != null) return `From ${p.sizeFrom.toLocaleString("en-IN")} sq.ft`;
  return `Up to ${p.sizeTo!.toLocaleString("en-IN")} sq.ft`;
}

export default function PublicProjectDetailPage({ params }: PageProps) {
  const { id } = use(params);

  const detailQuery = useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: () => projectService.getById(id),
    enabled: Boolean(id) && hasSupabaseEnv(),
    staleTime: 30_000,
  });

  const project =
    detailQuery.data && detailQuery.data.status === "Active" ? detailQuery.data : null;

  const loading =
    detailQuery.isPending || (detailQuery.isFetching && detailQuery.data === undefined);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cream min-h-[50vh]">
        <div className="w-10 h-10 rounded-full border-2 border-indigo border-t-transparent animate-spin mb-4" />
        <p className="text-sm text-charcoal/50 font-semibold">Loading project…</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-cream min-h-[50vh]">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-charcoal mb-2">Project Not Found</h2>
        <p className="text-sm text-charcoal/50 mb-8 font-semibold text-center max-w-sm">
          This project is unavailable or no longer active.
        </p>
        <Link
          href="/"
          className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
        >
          Back to Home
        </Link>
      </div>
    );
  }

  const sizeLabel = formatSize(project);
  const hero = project.images[0];

  return (
    <div className="flex-1 bg-cream min-h-screen">
      <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-charcoal/50 hover:text-indigo transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl border border-sand bg-sand/30">
              {hero ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={hero} alt={project.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo/25">
                  <Building2 className="w-16 h-16" />
                </div>
              )}
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-cream/95 border border-sand px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-indigo">
                  {project.city}
                </span>
                <span className="bg-indigo/90 text-white px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  {project.lifecycle}
                </span>
              </div>
            </div>

            {project.images.length > 1 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {project.images.slice(1, 5).map((url) => (
                  <div
                    key={url}
                    className="aspect-[4/3] rounded-2xl overflow-hidden border border-sand bg-sand/20"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            ) : null}

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
              <h1 className="text-3xl md:text-4xl font-serif font-black text-charcoal tracking-tight">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-sm font-semibold text-charcoal/55">
                <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                {[project.locality, project.city, project.state].filter(Boolean).join(", ")}
              </div>
              <p className="text-sm font-semibold text-charcoal/70 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {(project.propertyTypes.length > 0 || project.configurations.length > 0) && (
              <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="text-lg font-serif font-black text-indigo">Inventory</h2>
                {project.propertyTypes.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.propertyTypes.map((t) => (
                      <span
                        key={t}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-indigo/5 text-indigo border border-indigo/15"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                ) : null}
                {project.configurations.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {project.configurations.map((c) => (
                      <span
                        key={c}
                        className="px-3 py-1.5 rounded-full text-xs font-bold bg-terracotta/10 text-terracotta border border-terracotta/20"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            )}

            {project.amenities.length > 0 ? (
              <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm">
                <h2 className="text-lg font-serif font-black text-indigo">Amenities</h2>
                <div className="flex flex-wrap gap-2">
                  {project.amenities.map((a) => (
                    <span
                      key={a}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-sand/40 text-charcoal/70 border border-sand"
                    >
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            <div className="bg-white border border-indigo/10 rounded-3xl p-6 shadow-sm space-y-5">
              <div>
                <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">
                  Price range
                </p>
                <p className="text-2xl font-serif font-black text-indigo mt-1">
                  {formatProjectPrice(project)}
                </p>
              </div>
              {sizeLabel ? (
                <div>
                  <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">
                    Size range
                  </p>
                  <p className="text-sm font-bold text-charcoal mt-1">{sizeLabel}</p>
                </div>
              ) : null}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-sand/20 border border-sand rounded-2xl px-3 py-3">
                  <p className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider">
                    Stage
                  </p>
                  <p className="text-xs font-bold text-charcoal mt-1">{project.lifecycle}</p>
                </div>
                <div className="bg-sand/20 border border-sand rounded-2xl px-3 py-3">
                  <p className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider">
                    Role
                  </p>
                  <p className="text-xs font-bold text-charcoal mt-1">{project.ownershipRole}</p>
                </div>
              </div>
              {(project.launchDate || project.possessionDate) && (
                <div className="text-xs font-semibold text-charcoal/55 space-y-1 border-t border-sand pt-4">
                  {project.launchDate ? <p>Launch: {project.launchDate}</p> : null}
                  {project.possessionDate ? <p>Possession: {project.possessionDate}</p> : null}
                </div>
              )}
            </div>

            <div className="bg-white border border-indigo/10 rounded-3xl p-6 shadow-sm space-y-4">
              <p className="text-[9px] font-black text-indigo/60 uppercase tracking-wider">
                Contact dealer
              </p>
              <div className="flex items-center gap-2 text-sm font-bold text-charcoal">
                <User className="w-4 h-4 text-indigo/50" />
                {project.contactName}
              </div>
              <a
                href={`tel:${project.contactPhone}`}
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
              >
                <Phone className="w-4 h-4" />
                {project.contactPhone}
              </a>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
