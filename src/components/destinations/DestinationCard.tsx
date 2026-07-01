import React from "react";
import { Building, TrendingUp, Info, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Destination } from "@/data/destinations";

interface DestinationCardProps {
  dest: Destination;
  propertyCount: number;
  onSelect: (dest: Destination) => void;
}

export default function DestinationCard({ dest, propertyCount, onSelect }: DestinationCardProps) {
  return (
    <motion.div 
      layout
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.3 }}
      className="group relative flex flex-col rounded-[2rem] overflow-hidden bg-white border border-sand shadow-sm hover:shadow-2xl transition-all duration-500 h-[480px]"
    >
      {/* Cover Photo */}
      <div className="absolute inset-0 z-0 bg-sand overflow-hidden">
        <img 
          src={dest.image} 
          alt={dest.name} 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent opacity-90 transition-opacity duration-500" />
      </div>
      
      {/* Top Region Tag */}
      <div className="absolute top-5 left-5 z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.25em] px-3.5 py-1.5 rounded-xl shadow-inner">
        {dest.tag}
      </div>

      {/* Top Right Listings count */}
      <div className="absolute top-5 right-5 z-10 bg-indigo/90 backdrop-blur-sm border border-indigo/20 text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
        <Building className="w-3 h-3 text-gold" />
        <span>{propertyCount} {propertyCount === 1 ? "Listing" : "Listings"}</span>
      </div>
      
      {/* Bottom Details Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-7">
        <div className="transform transition-transform duration-500 group-hover:-translate-y-1">
          <div className="flex items-baseline gap-2 mb-0.5">
            <h3 className="text-3xl font-serif font-black text-white leading-none tracking-tight">{dest.name}</h3>
            <span className="text-[10px] font-black text-amber-200 bg-white/10 px-2 py-0.5 rounded-lg border border-white/10 uppercase tracking-widest leading-none">
              {dest.vibe}
            </span>
          </div>
          <p className="text-[10px] text-gold font-bold uppercase tracking-widest mb-3.5">{dest.title}</p>
          
          <p className="text-xs text-white/70 font-semibold leading-relaxed mb-6 line-clamp-3">
            {dest.desc}
          </p>

          <div className="grid grid-cols-2 gap-2 mb-4 bg-white/5 border border-white/10 rounded-2xl p-3 backdrop-blur-sm text-[10px] font-bold text-white/90">
            <div className="flex flex-col gap-0.5 border-r border-white/10 pr-2">
              <span className="text-white/40 uppercase tracking-wider text-[8px]">Investment growth</span>
              <span className="text-gold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{dest.investmentIndex} Rating</span>
              </span>
            </div>
            <div className="flex flex-col gap-0.5 pl-2">
              <span className="text-white/40 uppercase tracking-wider text-[8px]">Avg Property Price</span>
              <span className="truncate">{dest.averagePrice}</span>
            </div>
          </div>
          
          <button
            onClick={() => onSelect(dest)}
            className="flex items-center justify-between w-full p-3.5 rounded-xl bg-white text-indigo hover:bg-indigo hover:text-white font-extrabold text-xs tracking-wider uppercase transition-all duration-300 shadow-md cursor-pointer group/btn"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4" />
              <span>Explore Details</span>
            </div>
            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
