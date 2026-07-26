"use client";

import React, { useState } from "react";
import {
  MapPin,
  ArrowRight,
  TrendingUp,
  FileText,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HomeResearchInsights() {
  const [showPriceTrends, setShowPriceTrends] = useState(false);
  const [showLocalityReviews, setShowLocalityReviews] = useState(false);
  const [showBuyersGuide, setShowBuyersGuide] = useState(false);

  return (
    <>
      {/* 6. RESEARCH & INSIGHTS (Housing's Insights Cards with Modal Trigger) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2.5">
          <span className="text-terracotta font-black text-xs uppercase tracking-wider">
            Market Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
            Research & Insights
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm">
            Make informed financial decisions with real-time analytics, local reviews, and compliance checklists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Price Trends */}
          <div
            onClick={() => setShowPriceTrends(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-terracotta/35 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-terracotta/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-terracotta transition-colors">
                Real Estate Price Trends
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                Review historical price per sqft values across Udaipur, Jaipur, and Jodhpur over the last 5 years.
              </p>
            </div>
            <span className="text-[10px] text-terracotta font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Analyze Trends</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Locality Review */}
          <div
            onClick={() => setShowLocalityReviews(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo/25 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 text-indigo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-indigo transition-colors">
                Locality Review Index
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                Read independent scores regarding connectivity, safety, and school density in top residential neighborhoods.
              </p>
            </div>
            <span className="text-[10px] text-indigo font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Read Reviews</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Buyer's Guide */}
          <div
            onClick={() => setShowBuyersGuide(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/45 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-gold/90 transition-colors">
                Red-Tape Buyer&apos;s Guide
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                A checklist of legal document procedures, registry structures, stamp duty protocols, and title scrutiny.
              </p>
            </div>
            <span className="text-[10px] text-gold/90 font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Browse Checklist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

        </div>

      </section>

      {/* 11. PRICE TRENDS MODAL */}
      <AnimatePresence>
        {showPriceTrends && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPriceTrends(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button suppressHydrationWarning
                type="button"
                onClick={() => setShowPriceTrends(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-terracotta" />
                <h3 className="font-serif font-black text-xl text-indigo">Average Property Price Trends (2021-2026)</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Average valuation in Rupees per Square Foot (₹/sqft) for luxury residential properties across Rajasthan&apos;s key municipalities.
              </p>

              {/* SVG Line Chart */}
              <div className="w-full bg-sand/15 border border-sand/40 rounded-2xl p-4 sm:p-6 mb-6">
                <svg viewBox="0 0 500 250" className="w-full h-auto text-charcoal">
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="480" y2="40" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="190" x2="480" y2="190" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  
                  {/* Axes */}
                  <line x1="40" y1="20" x2="40" y2="210" stroke="rgba(28, 37, 48, 0.3)" />
                  <line x1="40" y1="210" x2="490" y2="210" stroke="rgba(28, 37, 48, 0.3)" />

                  {/* Y Axis Labels */}
                  <text x="35" y="44" textAnchor="end" className="text-[9px] font-black text-charcoal/50">10k</text>
                  <text x="35" y="94" textAnchor="end" className="text-[9px] font-black text-charcoal/50">7.5k</text>
                  <text x="35" y="144" textAnchor="end" className="text-[9px] font-black text-charcoal/50">5k</text>
                  <text x="35" y="194" textAnchor="end" className="text-[9px] font-black text-charcoal/50">2.5k</text>
                  
                  {/* X Axis Labels */}
                  <text x="40" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2021</text>
                  <text x="128" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2022</text>
                  <text x="216" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2023</text>
                  <text x="304" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2024</text>
                  <text x="392" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2025</text>
                  <text x="480" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2026</text>

                  {/* Line 1: Jaipur (Indigo) */}
                  {/* points: 2021: 5.5k (y=130), 2022: 6.0k (y=120), 2023: 6.8k (y=104), 2024: 7.2k (y=96), 2025: 8.1k (y=78), 2026: 8.9k (y=62) */}
                  <path d="M 40 130 L 128 120 L 216 104 L 304 96 L 392 78 L 480 62" fill="none" stroke="var(--brand-indigo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Line 2: Udaipur (Terracotta) */}
                  {/* points: 2021: 4.5k (y=150), 2022: 4.9k (y=142), 2023: 5.5k (y=130), 2024: 6.1k (y=118), 2025: 6.8k (y=104), 2026: 7.5k (y=90) */}
                  <path d="M 40 150 L 128 142 L 216 130 L 304 118 L 392 104 L 480 90" fill="none" stroke="var(--brand-terracotta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Line 3: Jodhpur (Gold) */}
                  {/* points: 2021: 3.8k (y=164), 2022: 4.0k (y=160), 2023: 4.4k (y=152), 2024: 5.0k (y=140), 2025: 5.5k (y=130), 2026: 6.1k (y=118) */}
                  <path d="M 40 164 L 128 160 L 216 152 L 304 140 L 392 130 L 480 118" fill="none" stroke="var(--brand-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 flex-wrap text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-indigo block" />
                    <span>Jaipur (Avg. +12.4% y-o-y)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-terracotta block" />
                    <span>Udaipur (Avg. +10.8% y-o-y)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-gold block" />
                    <span>Jodhpur (Avg. +9.6% y-o-y)</span>
                  </div>
                </div>
              </div>

              <div className="bg-sand/20 border border-sand/40 rounded-2xl p-4 text-xs leading-relaxed font-semibold">
                <span className="text-indigo font-black block mb-1">Key Takeaway:</span>
                Due to the massive surge in post-pandemic destination weddings, hospitality groups buying out heritage locations, and active RERA infrastructure development, Udaipur and Jaipur have outpaced national real estate averages by over 4.2%.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. LOCALITY REVIEWS MODAL */}
      <AnimatePresence>
        {showLocalityReviews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocalityReviews(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button suppressHydrationWarning
                type="button"
                onClick={() => setShowLocalityReviews(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-indigo" />
                <h3 className="font-serif font-black text-xl text-indigo">Locality Index Ratings</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Consolidated live rating reports by independent RERA compliance experts, rating critical lifestyle indices.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  {
                    name: "Fateh Sagar Lake Locality",
                    city: "Udaipur",
                    connectivity: 4.8,
                    safety: 4.9,
                    schools: 4.5,
                    description: "Udaipur's most premium residential lake edge. Extreme security, tourist-friendly, highly walkable, and completely pollution controlled."
                  },
                  {
                    name: "Malviya Nagar",
                    city: "Jaipur",
                    connectivity: 4.9,
                    safety: 4.8,
                    schools: 4.9,
                    description: "High-density retail malls, luxury apartments, and metro-rail access. One of Rajasthan's most premium and active family neighborhoods."
                  },
                  {
                    name: "Mehrangarh Road Haveli District",
                    city: "Jodhpur",
                    connectivity: 4.2,
                    safety: 4.7,
                    schools: 4.0,
                    description: "Steeped in royal history. Historic blue-walled havelis. Moderate vehicle access but highly sought-after for tourism and homestay conversions."
                  }
                ].map((loc, idx) => (
                  <div key={idx} className="bg-sand/15 border border-sand/35 p-5 rounded-2xl text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex flex-col">
                        <h4 className="font-serif font-black text-base text-charcoal">{loc.name}</h4>
                        <span className="text-[9px] font-black text-indigo uppercase">{loc.city}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] font-black text-indigo uppercase tracking-wider bg-white px-3 py-1 rounded-lg border border-sand/30 shadow-sm w-fit shrink-0">
                        <span>Conn: ⭐ {loc.connectivity}</span>
                        <span>Safe: ⭐ {loc.safety}</span>
                        <span>Edu: ⭐ {loc.schools}</span>
                      </div>
                    </div>
                    <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
                      {loc.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 13. BUYER'S GUIDE CHECKLIST MODAL */}
      <AnimatePresence>
        {showBuyersGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyersGuide(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button suppressHydrationWarning
                type="button"
                onClick={() => setShowBuyersGuide(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-gold" />
                <h3 className="font-serif font-black text-xl text-indigo">Property Purchase Compliance Checklist</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Avoid real estate fraud and disputes by ensuring the following document legal milestones are completely checked.
              </p>

              <div className="flex flex-col gap-4 text-left">
                {[
                  {
                    step: "01",
                    title: "RERA Registration Number Check",
                    description: "Verify that the project or property is registered on the Rajasthan Real Estate Regulatory Authority (RERA) website. This guarantees regulatory compliance and delivery security."
                  },
                  {
                    step: "02",
                    title: "Title Deed Verification",
                    description: "Request a clean trace of ownership. Check that there are no pending legal mortgage encumbrances by demanding a 30-year non-encumbrance certificate."
                  },
                  {
                    step: "03",
                    title: "Land Use Conversion Documents",
                    description: "Ensure the plot has correct CLU (Change of Land Use) clearance for residential construction if purchasing agricultural land."
                  },
                  {
                    step: "04",
                    title: "Stamp Duty & Local Registration Details",
                    description: "Make sure stamp duty values are calculated based on Rajasthan circle rates. Pay via government e-GRAS and register at the local Sub-Registrar office."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-sand/40 pb-4 last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-sand/30 text-indigo flex-shrink-0 flex items-center justify-center font-bold text-xs">
                      {item.step}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif font-black text-sm text-charcoal">{item.title}</h4>
                      <p className="text-xs text-charcoal/65 leading-relaxed font-semibold">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
