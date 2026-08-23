"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { propertyService } from "@/services";
import { PropertyForm, type PropertyFormSubmitData } from "@/features/properties";
import { isOwnProperty } from "@/lib/ownership";
import { GlobalLoading, Button } from "@/components/ui";
import type { Property } from "@/types";
import { ROUTES } from "@/constants/routes";

export default function EditMyListingPage() {
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
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-8">
        <p className="text-charcoal/50 font-bold text-sm">Property not found or access denied.</p>
        <Link href={ROUTES.myListings} className="mt-4">
          <Button>Back to my listings</Button>
        </Link>
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
      nearbyHospital: data.nearbyHospital,
      nearbySchool: data.nearbySchool,
      nearbyTransportation: data.nearbyTransportation,
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
      role: "User",
      target: data.title,
    });
    router.push(ROUTES.myListings);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <PropertyForm mode="edit" initialProperty={prop} onSubmit={handleSubmit} />
    </div>
  );
}
