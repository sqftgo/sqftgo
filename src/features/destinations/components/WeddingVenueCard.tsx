"use client";

import Image from "next/image";
import { Users, CheckCircle2, MapPin } from "lucide-react";
import type { WeddingVenue } from "../data/destinations";

interface WeddingVenueCardProps {
  venue: WeddingVenue;
  onInquire: (venue: WeddingVenue) => void;
}

function isIndicativeTariff(price: string): boolean {
  return /indicative/i.test(price) || /on request/i.test(price);
}

export default function WeddingVenueCard({ venue, onInquire }: WeddingVenueCardProps) {
  const tariffHint = isIndicativeTariff(venue.pricePerEvent)
    ? "2026 market band, not a live quote"
    : "Confirm current tariff with the venue";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_oklch(0_0_0/0.04),0_12px_28px_oklch(0_0_0/0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_oklch(0_0_0/0.04),0_18px_40px_oklch(0.10_0.04_270/0.10)]">
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-sand/20">
        <Image
          src={venue.image}
          alt={venue.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/10" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.10)]" />

        <div className="absolute top-3 left-3 right-3 z-10 flex items-start justify-between gap-2">
          <span className="max-w-[58%] truncate rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-md">
            {venue.type}
          </span>
          <span className="shrink-0 max-w-[42%] text-right rounded-full bg-terracotta px-3 py-1 text-[9px] font-black uppercase tracking-wider text-white shadow-[0_4px_12px_oklch(0.5_0.12_40/0.35)]">
            {venue.pricePerEvent}
          </span>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 text-white">
          <h3 className="font-serif text-2xl font-black leading-tight tracking-tight drop-shadow-md">
            {venue.name}
          </h3>
          <p className="mt-1 text-[10px] font-bold uppercase tracking-[0.16em] text-amber-200">
            {venue.vibe}
          </p>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {venue.areaNote ? (
          <p className="flex items-start gap-1.5 text-[11px] font-semibold leading-snug text-terracotta">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <span>{venue.areaNote}</span>
          </p>
        ) : null}

        <p className="line-clamp-3 text-[13px] leading-relaxed text-charcoal/70">
          {venue.description}
        </p>

        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[12px] font-semibold text-indigo">
            <Users className="h-4 w-4 shrink-0 text-terracotta" />
            <span>
              <span className="font-medium text-charcoal/55">Capacity</span>
              <span className="mx-1.5 text-sand">·</span>
              <span className="font-bold text-charcoal">{venue.capacity}</span>
            </span>
          </div>
          <p className="pl-6 text-[10px] font-semibold uppercase tracking-wide text-charcoal/45">
            {tariffHint}
          </p>
        </div>

        <ul className="flex flex-col gap-1.5">
          {venue.highlights.map((h) => (
            <li
              key={h}
              className="flex items-start gap-2 rounded-xl bg-sand/25 px-2.5 py-2 text-[11px] font-semibold leading-snug text-charcoal/80"
            >
              <CheckCircle2 className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
              <span>{h}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onInquire(venue)}
          className="mt-auto flex h-11 w-full cursor-pointer items-center justify-center rounded-2xl bg-indigo text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_20px_oklch(0.35_0.08_270/0.22)] transition-[transform,background-color] duration-200 hover:bg-indigo-hover active:scale-[0.96]"
        >
          Enquire about this venue
        </button>
      </div>
    </article>
  );
}
