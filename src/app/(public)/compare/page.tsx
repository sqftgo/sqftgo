"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { X, MapPin, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { AMENITIES as AMENITY_FALLBACK } from "@/constants";

export default function ComparePage() {
  const { compareList, setCompareList, properties } = useApp();
  const items = properties.filter((p) => compareList.includes(p.id));

  const formatPrice = (v: number) =>
    "₹" + new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(v);

  const removeFromCompare = (id: string) =>
    setCompareList((prev: string[]) => prev.filter((x: string) => x !== id));

  const amenityRows = useMemo(() => {
    const fromProps = Array.from(
      new Set(items.flatMap((p) => (Array.isArray(p.amenities) ? p.amenities : [])))
    ).sort((a, b) => a.localeCompare(b));
    return fromProps.length > 0 ? fromProps : [...AMENITY_FALLBACK].slice(0, 9);
  }, [items]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-serif font-black text-charcoal">Compare Properties</h1>
          <p className="text-charcoal/50 text-sm font-semibold mt-1">
            {items.length > 0
              ? `Comparing ${items.length} ${items.length === 1 ? "property" : "properties"} (max 4)`
              : "No properties selected for comparison"}
          </p>
        </div>
        {items.length > 0 ? (
          <button
            type="button"
            onClick={() => setCompareList([])}
            className="text-xs font-black uppercase tracking-wider text-charcoal/45 hover:text-rose-500 transition-colors cursor-pointer"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white/80 rounded-3xl border border-indigo/10 shadow">
          <div className="w-20 h-20 bg-indigo/5 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <CheckCircle2 className="w-10 h-10 text-indigo/20" />
          </div>
          <h2 className="text-xl font-serif font-black text-charcoal mb-2">Nothing to compare yet</h2>
          <p className="text-charcoal/50 text-sm font-semibold mb-6">
            Add properties to compare by clicking the compare icon on listing cards.
          </p>
          <Link
            href="/listings"
            className="inline-flex items-center gap-2 px-6 py-3 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors"
          >
            Browse Listings <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <div className="min-w-[640px]">
            <div
              className="grid gap-4 mb-6"
              style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
            >
              <div className="flex items-end pb-2">
                <span className="text-[10px] font-black text-charcoal/30 uppercase tracking-wider">
                  Properties
                </span>
              </div>
              {items.map((prop) => (
                <div
                  key={prop.id}
                  className="bg-white/90 border border-indigo/10 rounded-2xl overflow-hidden shadow relative"
                >
                  <button
                    type="button"
                    onClick={() => removeFromCompare(prop.id)}
                    className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 hover:bg-white rounded-lg shadow cursor-pointer transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-charcoal/60" />
                  </button>
                  <div className="h-36 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={prop.images?.[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-charcoal leading-tight line-clamp-2">
                      {prop.title}
                    </p>
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="w-3 h-3 text-charcoal/30" />
                      <p className="text-[10px] text-charcoal/50">{prop.city}</p>
                    </div>
                    <p className="text-base font-serif font-black text-indigo mt-1">
                      {formatPrice(prop.price)}
                    </p>
                    <Link
                      href={`/property/${prop.id}`}
                      className="block mt-2 w-full py-1.5 bg-indigo/10 text-indigo text-[10px] font-black text-center rounded-lg hover:bg-indigo/20 transition-colors uppercase tracking-wider"
                    >
                      View
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {(
              [
                { label: "Type", key: "type" },
                { label: "Purpose", key: "purpose" },
                { label: "Size", key: "size", format: (v: unknown) => `${v} sq.ft.` },
                {
                  label: "BHK",
                  key: "bhk",
                  format: (v: unknown) => (v ? `${v} BHK` : "—"),
                },
                {
                  label: "Bathrooms",
                  key: "bathrooms",
                  format: (v: unknown) => (v ? `${v}` : "—"),
                },
                {
                  label: "Parking",
                  key: "parking",
                  format: (v: unknown) => (v ? `${v} space(s)` : "—"),
                },
                { label: "Furnished", key: "furnished" },
                {
                  label: "Year Built",
                  key: "yearBuilt",
                  format: (v: unknown) => (v as string) || "—",
                },
                {
                  label: "RERA ID",
                  key: "reraId",
                  format: (v: unknown) => (v as string) || "Not Registered",
                },
              ] as const
            ).map(({ label, key, format }) => (
              <div
                key={key}
                className="grid gap-4 mb-2"
                style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
              >
                <div className="flex items-center px-4 py-3 bg-white/40 rounded-xl">
                  <span className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">
                    {label}
                  </span>
                </div>
                {items.map((prop) => {
                  const val = prop[key as keyof typeof prop];
                  const displayed = format ? format(val) : (val as string) || "—";
                  return (
                    <div
                      key={prop.id}
                      className="flex items-center px-4 py-3 bg-white/80 border border-indigo/5 rounded-xl"
                    >
                      <span className="text-sm font-bold text-charcoal">{displayed}</span>
                    </div>
                  );
                })}
              </div>
            ))}

            <div className="mt-5">
              <p className="text-[10px] font-black text-charcoal/30 uppercase tracking-wider mb-3">
                Amenities
              </p>
              {amenityRows.map((amenity) => (
                <div
                  key={amenity}
                  className="grid gap-4 mb-1.5"
                  style={{ gridTemplateColumns: `200px repeat(${items.length}, 1fr)` }}
                >
                  <div className="flex items-center px-4 py-2.5 bg-white/40 rounded-xl">
                    <span className="text-[10px] font-semibold text-charcoal/50">{amenity}</span>
                  </div>
                  {items.map((prop) => {
                    const has = prop.amenities?.includes(amenity);
                    return (
                      <div
                        key={prop.id}
                        className="flex items-center px-4 py-2.5 bg-white/80 border border-indigo/5 rounded-xl"
                      >
                        {has ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-rose-300/60" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
