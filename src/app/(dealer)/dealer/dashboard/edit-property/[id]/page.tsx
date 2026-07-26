"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { propertyService } from "@/services";
import { PropertyForm, type PropertyFormSubmitData } from "@/components/property";
import { isOwnProperty } from "@/lib/ownership";
import { GlobalLoading } from "@/components/ui";
import type { Property } from "@/types";

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { userEmail, userProfile, updateProperty, addLog } = useApp();
  const [prop, setProp] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      setAccessDenied(false);
      try {
        const fetched = await propertyService.getById(id);
        if (cancelled) return;
        if (!fetched || !isOwnProperty(fetched, userProfile?.id, userEmail)) {
          setAccessDenied(true);
          setProp(null);
        } else {
          setProp(fetched);
        }
      } catch {
        if (!cancelled) setAccessDenied(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, userProfile?.id, userEmail]);

  if (loading) {
    return <GlobalLoading label="Loading property…" />;
  }

  if (accessDenied || !prop) {
    return (
      <div className="p-8 text-center bg-[#faf8f5] min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white/80 border border-sand rounded-3xl p-8 max-w-sm w-full">
          <p className="text-charcoal/50 font-bold text-sm">Property not found or access denied.</p>
          <button
            onClick={() => router.back()}
            className="mt-4 w-full py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer"
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (data: PropertyFormSubmitData) => {
    await updateProperty(prop.id, {
      title: data.title,
      type: data.type,
      purpose: data.purpose,
      description: data.description,
      city: data.city,
      state: data.state,
      locality: data.locality,
      size: data.size || prop.size,
      bhk: data.bhk,
      bathrooms: data.bathrooms,
      parking: data.parking,
      yearBuilt: data.yearBuilt,
      furnished: data.furnished,
      price: data.price || prop.price,
      status: data.status,
      amenities: data.amenities,
      images: data.images,
      seoTitle: data.seoTitle,
      seoDescription: data.seoDescription,
      reraId: data.reraId,
    });
    addLog({
      action: "Property Updated",
      performedBy: userEmail,
      role: "Dealer",
      target: data.title,
    });
  };

  return <PropertyForm mode="edit" initialProperty={prop} onSubmit={handleSubmit} />;
}
