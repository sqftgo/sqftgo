"use client";

import React, { useState } from "react";
import type { Property } from "@/types";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyDetailGalleryProps {
  property: Property;
}

export function PropertyDetailGallery({ property }: PropertyDetailGalleryProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  const imageCount = property.images?.length || 0;

  return (
    <>
      {/* Luxury Photo Gallery Collage (Desktop) and Swiper (Mobile) */}
      <div className="mb-8">
        {/* Desktop Collage/Slider Grid */}
        {imageCount > 0 ? (
          <div className="hidden lg:grid grid-cols-12 gap-3 h-[520px] w-full rounded-3xl overflow-hidden bg-white border border-sand/40 p-2.5 shadow-md">
            {/* Left Main View (col-span-10) */}
            <div className="col-span-10 h-full relative rounded-2xl overflow-hidden group">
              <img
                src={property.images[activeImageIdx]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 animate-fade-in"
              />
              
              {/* Left / Right arrows inside Left Main View */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-charcoal/50 hover:bg-charcoal/75 text-white flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95 shadow-md"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev + 1) % property.images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-charcoal/50 hover:bg-charcoal/75 text-white flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95 shadow-md"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Counter Badge (Bottom Left) */}
              <div className="absolute bottom-4 left-4 bg-charcoal/70 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 select-none z-10 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>{activeImageIdx + 1} / {property.images.length}</span>
              </div>
            </div>

            {/* Right Stacked Column (col-span-2) */}
            <div className="col-span-2 flex flex-col gap-2 h-full">
              {property.images.slice(0, 6).map((img, idx) => {
                const isActive = activeImageIdx === idx || (idx === 5 && activeImageIdx >= 5);
                const isLast = idx === 5 && property.images.length > 6;
                const remainingCount = property.images.length - 6;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isLast) {
                        openLightbox(5);
                      } else {
                        setActiveImageIdx(idx);
                      }
                    }}
                    className={`flex-1 rounded-xl overflow-hidden cursor-pointer relative transition-all border-2 ${
                      isActive 
                        ? "border-indigo scale-98 shadow-sm" 
                        : "border-transparent opacity-75 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                    
                    {isLast && (
                      <div className="absolute inset-0 bg-charcoal/65 flex flex-col items-center justify-center text-white backdrop-blur-[1px] text-center p-1">
                        <span className="font-serif font-black text-sm">+{remainingCount} More</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">View all photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex w-full h-[400px] rounded-3xl bg-sand/20 border border-sand items-center justify-center text-charcoal/40 text-sm font-bold">
            No Images Available
          </div>
        )}

        {/* Mobile/Tablet Swipe Carousel */}
        <div className="lg:hidden relative aspect-video w-full rounded-2xl overflow-hidden bg-sand/20 border border-sand/40 shadow-md">
          <img
            src={property.images?.length > 0 ? property.images[activeImageIdx] : "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.5764,73.6836"}
            alt={property.title}
            className="w-full h-full object-cover animate-fade-in"
            onClick={() => openLightbox(activeImageIdx)}
          />
          
          {/* Slider Controls */}
          {property.images?.length > 1 && (
            <>
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                  className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-charcoal border border-sand/50 transition-all pointer-events-auto shadow-md active:scale-90"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % property.images.length)}
                  className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-charcoal border border-sand/50 transition-all pointer-events-auto shadow-md active:scale-90"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
              
              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 bg-charcoal/75 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
                {activeImageIdx + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Lightbox / Fullscreen Gallery Modal Portal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 transition-all duration-300"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
              <div className="flex flex-col text-left">
                <h4 className="font-serif font-black text-sm md:text-base text-brand-sand">{property.title}</h4>
                <span className="text-[10px] md:text-xs text-white/55">{property.locality}, {property.city}</span>
              </div>
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Large Image View */}
            <div className="relative flex-1 flex items-center justify-center my-6 max-h-[70vh] w-full max-w-4xl mx-auto font-sans">
              <img
                src={property.images[lightboxIndex]}
                alt={`${property.title} large slide ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-2 md:left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-2 md:right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector */}
            <div className="flex flex-col gap-3">
              <div className="text-center text-white/50 text-[10px] font-black uppercase tracking-wider">
                Photo {lightboxIndex + 1} of {property.images.length}
              </div>
              <div className="flex gap-2.5 justify-center overflow-x-auto py-2 no-scrollbar max-w-3xl mx-auto">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      lightboxIndex === idx ? "border-terracotta scale-95 opacity-100" : "border-transparent opacity-45 hover:opacity-85"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
