"use client";

import React from "react";
import type { Property } from "@/types";
import { PropertyDetailHeader } from "./PropertyDetailHeader";
import { PropertyDetailGallery } from "./PropertyDetailGallery";
import { PropertyDetailInfo } from "./PropertyDetailInfo";
import {
  PropertyDetailSidebar,
  PropertyDetailMobileContact,
} from "./PropertyDetailSidebar";

interface PropertyDetailViewProps {
  property: Property;
  isSaved: boolean;
  onToggleFavorite: (id: string) => void;
  similarProperties: Property[];
}

export function PropertyDetailView({
  property,
  isSaved,
  onToggleFavorite,
  similarProperties,
}: PropertyDetailViewProps) {
  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-24 lg:pb-20 pt-6">
      <PropertyDetailHeader
        property={property}
        isSaved={isSaved}
        onToggleFavorite={onToggleFavorite}
        variant="nav"
      />
      <PropertyDetailGallery property={property} />
      <PropertyDetailHeader
        property={property}
        isSaved={isSaved}
        onToggleFavorite={onToggleFavorite}
        variant="price"
      />
      {/* Main Grid: Detail Info & Sidebar Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        <PropertyDetailInfo
          property={property}
          similarProperties={similarProperties}
        />
        <PropertyDetailSidebar property={property} />
      </div>
      <PropertyDetailMobileContact property={property} />
    </div>
  );
}
