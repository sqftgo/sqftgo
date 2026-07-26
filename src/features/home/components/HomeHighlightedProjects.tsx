"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";
import { BROWSE_CITIES } from "../data/constants";

export function HomeHighlightedProjects() {
  const router = useRouter();
  const { setSelectedCity } = useApp();

  // Preserved from original page (browseCities was unused in JSX).
  void BROWSE_CITIES;

  const handleCityBrowse = (cityName: string) => {
    setSelectedCity(cityName);
    router.push(`/listings?city=${cityName}`);
  };

  return (
    <>
      {/* 4. TOP HIGHLIGHTED PROJECTS (Side-by-side Showcase Cards) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2.5">
          <span className="text-terracotta font-black text-xs uppercase tracking-wider">
            Premium Highlight Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
            Top Highlighted Projects
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm">
            Handpicked architecture portfolios, showcasing elite properties in highly sought-after cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Highlight 1 */}
          <div className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-sand transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Udaipur Lakeside Villas"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-charcoal/10" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left items-start">
              <span className="text-gold text-[9px] font-black uppercase tracking-widest mb-1.5">Exclusive Collection</span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-2">Restored Lakeside Villas, Udaipur</h3>
              <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-md mb-5">
                Breathtaking view plots, swimming pools, and limestone arches resting on the shores of Lake Pichola and Fateh Sagar.
              </p>
              <button suppressHydrationWarning
                onClick={() => handleCityBrowse("Udaipur")}
                className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
              >
                <span>Browse Villas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-sand transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
              alt="Jaipur Luxury Penthouses"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-charcoal/10" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left items-start">
              <span className="text-gold text-[9px] font-black uppercase tracking-widest mb-1.5">Modern Heritage</span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-2">Premium Royal Penthouses, Jaipur</h3>
              <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-md mb-5">
                High-rise residential configurations in Malviya Nagar & Mansarovar, featuring modern amenities and Aravali hill views.
              </p>
              <button suppressHydrationWarning
                onClick={() => handleCityBrowse("Jaipur")}
                className="px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
              >
                <span>Browse Penthouses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </section>
    </>
  );
}
