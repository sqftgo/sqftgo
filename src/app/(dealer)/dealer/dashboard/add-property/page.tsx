"use client";

import { useApp } from "@/context/AppContext";
import { PropertyForm, type PropertyFormSubmitData } from "@/components/property";

export default function AddPropertyPage() {
  const { addProperty, addLog, userEmail } = useApp();

  const handleSubmit = (data: PropertyFormSubmitData) => {
    addProperty({
      title: data.title,
      type: data.type,
      purpose: data.purpose,
      description: data.description,
      city: data.city,
      state: data.state,
      country: data.country,
      locality: data.locality,
      size: data.size,
      bhk: data.bhk,
      bathrooms: data.bathrooms,
      parking: data.parking,
      yearBuilt: data.yearBuilt,
      furnished: data.furnished,
      price: data.price,
      amenities: data.amenities,
      images: data.images,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      reraId: data.reraId,
      reraApproved: data.reraApproved,
      status: data.status,
    });
    addLog({
      action: data.status === "Draft" ? "Property Draft Saved" : "Property Added",
      performedBy: userEmail,
      role: "Dealer",
      target: data.title,
    });
  };

  return <PropertyForm mode="create" onSubmit={handleSubmit} />;
}
