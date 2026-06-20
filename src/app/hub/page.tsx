"use client";

import React from "react";
import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { ArrowRight, Home, Users, MapPin, Search, Sparkles } from "lucide-react";

export default function HubPage() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6">
      <div className="max-w-5xl mx-auto w-full">
        
        {/* Header */}
        <div className="text-center mb-16 relative z-10">
          <h1 className="text-4xl md:text-5xl font-serif font-black text-charcoal tracking-tight mb-4">
            Explore & Connect
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto font-medium text-lg">
            Your centralized hub for posting properties, discovering top dealers, finding dream destinations, and matching your specific requirements.
          </p>
        </div>

        {/* 2x2 Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 md:grid-cols-2 gap-8"
        >
          {/* Card 1: Post Property */}
          <motion.div variants={itemVariants}>
            <Link href="/admin/post-property" className="group block relative h-full bg-white rounded-3xl border border-sand shadow-sm hover:shadow-xl hover:border-terracotta/40 transition-all duration-300 overflow-hidden p-8 flex flex-col justify-center text-center">
              <div className="absolute top-4 right-4">
                <div className="bg-terracotta/10 text-terracotta border border-terracotta/20 text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  Free
                </div>
              </div>
              <div className="w-16 h-16 rounded-2xl bg-indigo/5 text-indigo mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-indigo group-hover:text-white transition-all duration-300">
                <Home className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-serif font-black text-charcoal mb-2">
                Post / List <br/> Your Property
              </h2>
              <p className="text-terracotta font-black uppercase tracking-widest text-sm mt-2">
                Sell / Rent
              </p>
            </Link>
          </motion.div>

          {/* Card 2: Dealers */}
          <motion.div variants={itemVariants}>
            <div className="group relative h-full bg-white rounded-3xl border border-sand shadow-sm hover:shadow-xl hover:border-indigo/40 transition-all duration-300 overflow-hidden p-8 flex flex-col justify-between items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-terracotta/5 text-terracotta mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-terracotta group-hover:text-white transition-all duration-300">
                <Users className="w-8 h-8" />
              </div>
              <div className="flex-1 flex flex-col justify-center mb-8">
                <h2 className="text-2xl font-serif font-black text-charcoal leading-tight">
                  Top Real Estate <br/> Dealers in India
                </h2>
              </div>
              <Link href="/dealers" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-indigo text-indigo font-bold rounded-xl group-hover:bg-indigo group-hover:text-white transition-colors duration-300 w-full sm:w-auto">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 3: Tourist / Wedding Places */}
          <motion.div variants={itemVariants}>
            <div className="group relative h-full bg-white rounded-3xl border border-sand shadow-sm hover:shadow-xl hover:border-gold/40 transition-all duration-300 overflow-hidden p-8 flex flex-col justify-between items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-gold/10 text-gold mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-gold group-hover:text-white transition-all duration-300">
                <MapPin className="w-8 h-8" />
              </div>
              <div className="flex-1 flex flex-col justify-center mb-8">
                <h2 className="text-2xl font-serif font-black text-charcoal leading-tight">
                  Top Tourist Destination <br/> and Wedding Places <br/> in India
                </h2>
              </div>
              <Link href="/destinations" className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border-2 border-gold text-gold font-bold rounded-xl group-hover:bg-gold group-hover:border-gold group-hover:text-white transition-colors duration-300 w-full sm:w-auto">
                <span>Explore</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </motion.div>

          {/* Card 4: Post Requirement */}
          <motion.div variants={itemVariants}>
            <Link href="/get-assistance" className="group block relative h-full bg-indigo rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden p-8 flex flex-col justify-center items-center text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo to-indigo-hover opacity-90"></div>
              
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 text-white backdrop-blur-sm border border-white/20 mx-auto flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-white group-hover:text-indigo transition-all duration-300">
                <Search className="w-8 h-8" />
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col justify-center">
                <h2 className="text-2xl font-serif font-black text-white mb-2 leading-tight">
                  Find your <br/> Dream Project
                </h2>
                <div className="w-12 h-1 bg-terracotta mx-auto my-4 rounded-full"></div>
                <p className="text-white/90 font-black uppercase tracking-widest text-sm">
                  Post your Requirement
                </p>
              </div>
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </main>
  );
}
