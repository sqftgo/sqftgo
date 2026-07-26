"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { EmptyState } from "@/components/ui";
import { PropertyCard } from "@/features/properties";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

export default function FavoritesPage() {
  const router = useRouter();
  const { properties, favorites } = useApp();

  // Filter listings to shortlisted ones
  const shortlistedProperties = properties.filter((p) => favorites.includes(p.id));

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-20 pt-6 flex-1 flex flex-col">
      {/* Header */}
      <div className="flex flex-col gap-1.5 text-left mb-8 border-b border-sand pb-5">
        <div className="flex items-center gap-2.5 text-terracotta">
          <Heart className="w-5 h-5 fill-current" />
          <span className="text-[10px] font-extrabold uppercase tracking-widest font-sans">
            Saved Listings
          </span>
        </div>
        <h1 className="text-3xl font-serif font-black text-indigo tracking-tight">
          Your Shortlist
        </h1>
        <p className="text-sm text-charcoal/65 mt-1 font-sans">
          Browse and manage your saved heritage havelis, luxury lakeview villas, and premium commercial plots.
        </p>
      </div>

      {shortlistedProperties.length === 0 ? (
        <div className="flex-1 flex items-center justify-center py-10">
          <EmptyState
            title="No Shortlisted Properties"
            description="Start exploring Rajasthan and Gujarat properties and click the heart icon on any listing card to save it here."
            actionLabel="Browse Listings"
            onAction={() => router.push("/listings")}
            icon={<Heart className="w-8 h-8 text-terracotta/40" />}
          />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {shortlistedProperties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </motion.div>
      )}
    </div>
  );
}
