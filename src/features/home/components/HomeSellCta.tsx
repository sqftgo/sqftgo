"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export function HomeSellCta() {
  return (
    <>
      {/* 9. HAVE A PROPERTY TO SELL? CTA BANNER */}
      <section className="relative z-20 pb-20 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-terracotta to-orange-600 text-white p-8 md:p-12 shadow-2xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 gap-8 border-2 border-white/10 group"
        >
          {/* Subtle Back Decor */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            <span className="px-3 py-1 bg-white/20 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded w-fit">
              Owner services
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                Have a property to sell or rent? <br />
                List it with SQFTGO completely free.
              </h2>
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-semibold max-w-xl">
                Connect with genuine RERA-compliant buyers, agents, and brokers in Rajasthan. Reach out to our verified active database of thousands of clients looking for heritage villas and luxury houses.
              </p>
            </div>
            
            <div className="w-fit">
              <Link
                href="/post-property"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-cream text-terracotta hover:text-terracotta-hover font-black text-xs uppercase tracking-widest shadow-lg transition-all duration-200"
              >
                <span>List Property Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stylized Image Column */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative z-10 min-h-[380px]">
            <div className="relative w-[300px] h-[360px]">
              {/* Peach Background Card (Tilted) */}
              <div className="absolute inset-0 bg-[#ffd6cc] rounded-[32px] shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-all duration-500" />
              
              {/* Offset Tilted White Outline Border */}
              <div className="absolute inset-0 border-2 border-white/80 rounded-[32px] transform rotate-3 group-hover:rotate-0 transition-all duration-500 pointer-events-none" />
              
              {/* Image Container (Tilted slightly differently) */}
              <div className="absolute inset-3 rounded-[24px] overflow-hidden bg-white shadow-lg transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                <img
                  src="/services_hero.png"
                  alt="Couple using tablet for listing a property"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>
    </>
  );
}
