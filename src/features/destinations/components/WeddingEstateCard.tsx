"use client";

import Image from "next/image";
import { MapPin, ShieldCheck } from "lucide-react";
import type { WeddingProperty } from "../data/destinations";

interface WeddingEstateCardProps {
  property: WeddingProperty;
  onInquire: (property: WeddingProperty) => void;
}

function parseSpecLine(text: string, index: number): { id: string; value: string; label: string } {
  const match = text.match(/^([\d,.]+(?:\s*-\s*[\d,.]+)?)\s+(.+)$/);
  return {
    id: `spec-${index}`,
    value: match?.[1] ?? text,
    label: match?.[2] ?? "",
  };
}

function specParts(specs: string | undefined): { id: string; value: string; label: string }[] {
  if (!specs || typeof specs !== "string") return [];
  return specs
    .split("•")
    .map((part) => part.trim())
    .filter(Boolean)
    .map(parseSpecLine);
}

export default function WeddingEstateCard({ property, onInquire }: WeddingEstateCardProps) {
  const specs = specParts(property.specs);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_1px_2px_oklch(0_0_0/0.04),0_12px_28px_oklch(0_0_0/0.06)] transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_1px_2px_oklch(0_0_0/0.04),0_18px_40px_oklch(0.18_0.04_270/0.10)] md:flex-row">
      <div className="relative h-56 w-full shrink-0 overflow-hidden bg-sand/20 md:h-auto md:w-[42%]">
        <Image
          src={property.image}
          alt={property.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 40vw"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
        <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.10)]" />

        <span className="absolute top-3 left-3 z-10 max-w-[calc(100%-1.5rem)] truncate rounded-full border border-amber-400/40 bg-black/70 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-amber-200 backdrop-blur-md">
          Illustrative · {property.propertyType}
        </span>

        <p className="absolute bottom-3 left-3 right-3 z-10 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-amber-200">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{property.location}</span>
        </p>
      </div>

      <div className="flex min-w-0 flex-1 flex-col gap-4 p-5 md:p-6">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="min-w-0 font-serif text-xl font-black leading-tight tracking-tight text-indigo md:text-[1.35rem]">
              {property.title}
            </h3>
            <span className="shrink-0 rounded-full bg-charcoal/80 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white">
              Example {property.price}
            </span>
          </div>
          <p className="text-[10px] font-black uppercase tracking-wider text-amber-800">
            Not a live SqftGo listing
          </p>
          <p className="line-clamp-2 text-[13px] leading-relaxed text-charcoal/65">
            {property.description}
          </p>
        </div>

        {specs.length > 0 && (
          <div className={`grid gap-2 ${specs.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>
            {specs.map((spec) => (
              <div
                key={spec.id}
                className="rounded-xl bg-sand/40 px-2 py-2.5 text-center"
              >
                <p className="text-sm font-black leading-none text-indigo">{spec.value}</p>
                {spec.label ? (
                  <p className="mt-1 text-[9px] font-bold uppercase tracking-wide text-charcoal/50 leading-tight">
                    {spec.label}
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        )}

        <ul className="grid grid-cols-1 gap-1.5 min-[420px]:grid-cols-2">
          {property.features.map((feature) => (
            <li
              key={feature}
              className="flex items-start gap-1.5 rounded-xl bg-indigo/[0.05] px-2.5 py-2 text-[11px] font-semibold leading-snug text-charcoal/80"
            >
              <ShieldCheck className="mt-px h-3.5 w-3.5 shrink-0 text-indigo" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={() => onInquire(property)}
          className="mt-auto flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-2xl bg-terracotta text-[11px] font-black uppercase tracking-widest text-white shadow-[0_8px_20px_oklch(0.55_0.14_40/0.28)] transition-[transform,background-color] duration-200 hover:bg-terracotta-hover active:scale-[0.96]"
        >
          <ShieldCheck className="h-3.5 w-3.5 text-amber-200" />
          Ask about similar estates
        </button>
      </div>
    </article>
  );
}
