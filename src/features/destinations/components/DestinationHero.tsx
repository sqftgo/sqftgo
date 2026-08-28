import React from "react";
import Image from "next/image";

interface DestinationHeroProps {
  totalDestinations: number;
  totalProperties: number;
  avgGrowthScore: string;
  totalWeddingHotspots: number;
}

export default function DestinationHero({
  totalDestinations,
  totalProperties,
  avgGrowthScore,
  totalWeddingHotspots,
}: DestinationHeroProps) {

  return (
    <section className="relative pt-2 pb-20 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
      {/* Luxury Background Hero Container */}
      <div className="max-w-7xl mx-auto w-full relative rounded-[40px] bg-indigo overflow-hidden min-h-[500px] md:min-h-[560px] flex flex-col justify-between p-8 md:p-12 shadow-2xl border border-white/5 group">
        
        {/* Fix 3: next/image with slow hover parallax zoom effect */}
        <div className="absolute inset-0 overflow-hidden rounded-[40px] select-none pointer-events-none z-0">
          <Image
            src="/DestinationHero.png"
            alt="Royal Rajasthan Palace"
            fill
            className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[8000ms] ease-out"
            sizes="100vw"
            priority
          />
          {/* Dark gradient overlay for text contrast and premium feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo/50 via-indigo/40 to-indigo/80" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-indigo/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-6 mt-8 md:mt-12">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-tight text-white max-w-3xl text-center">
              Explore Royal Destinations
            </h1>
            <p className="text-white/85 text-xs sm:text-sm md:text-base font-semibold max-w-2xl leading-relaxed text-center">
              Across <span className="text-amber-200 font-extrabold">{totalDestinations} premium cities</span> with <span className="text-gold font-extrabold">{totalProperties} verified active listings</span>
            </p>
          </div>
        </div>

        {/* Fix 4: Stats Dashboard — computed real values instead of hardcoded */}
        <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-6 border-t border-white/10 max-w-4xl mx-auto mb-4">
          {[
            { value: `${totalDestinations}`, label: "Heritage Cities" },
            { value: `${totalProperties}`, label: "Verified Listings" },
            { value: avgGrowthScore, label: "Editorial score" },
            { value: `${totalWeddingHotspots}`, label: "Signature venues" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 min-w-[120px] text-center">
              <span className="text-xl sm:text-2xl font-serif font-black text-white leading-none">
                {stat.value}
              </span>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
