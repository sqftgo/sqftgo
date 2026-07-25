import type { Property } from "@/types";
import type { PropertyRow, PropertyStatusDb } from "@/types/database";

const UI_TO_DB_STATUS: Record<Property["status"], PropertyStatusDb> = {
  Draft: "draft",
  "Pending Review": "pending_review",
  Active: "active",
  Sold: "sold",
  Rented: "rented",
};

const DB_TO_UI_STATUS: Record<PropertyStatusDb, Property["status"]> = {
  draft: "Draft",
  pending_review: "Pending Review",
  active: "Active",
  sold: "Sold",
  rented: "Rented",
};

export function toDbStatus(status: Property["status"]): PropertyStatusDb {
  return UI_TO_DB_STATUS[status];
}

export function toUiStatus(status: PropertyStatusDb): Property["status"] {
  return DB_TO_UI_STATUS[status];
}

function num(value: number | string): number {
  return typeof value === "number" ? value : Number(value);
}

export function mapPropertyRow(row: PropertyRow): Property {
  return {
    id: row.id,
    title: row.title,
    price: num(row.price),
    type: row.type,
    purpose: row.purpose,
    bhk: row.bhk ?? undefined,
    bathrooms: row.bathrooms ?? undefined,
    parking: row.parking ?? undefined,
    yearBuilt: row.year_built ?? undefined,
    city: row.city,
    state: row.state ?? undefined,
    country: row.country ?? undefined,
    locality: row.locality,
    size: num(row.size),
    furnished: row.furnished,
    description: row.description,
    amenities: row.amenities ?? [],
    images: row.images ?? [],
    videoUrl: row.video_url ?? undefined,
    ownerName: row.owner_name,
    ownerPhone: row.owner_phone,
    ownerEmail: row.owner_email ?? undefined,
    inquiryCount: row.inquiry_count,
    status: toUiStatus(row.status),
    featured: row.featured,
    reraApproved: row.rera_approved,
    reraId: row.rera_id ?? undefined,
    verifiedDate: row.verified_date ?? undefined,
    seoTitle: row.seo_title ?? undefined,
    seoDescription: row.seo_description ?? undefined,
    verificationChecks: (row.verification_checks as Property["verificationChecks"]) ?? undefined,
    priceBreakdown: (row.price_breakdown as Property["priceBreakdown"]) ?? undefined,
  };
}

export function mapCreateToInsert(input: {
  ownerId: string;
  title: string;
  price: number;
  type: Property["type"];
  purpose: Property["purpose"];
  bhk?: number;
  bathrooms?: number;
  parking?: number;
  yearBuilt?: number;
  city: string;
  state?: string;
  country?: string;
  locality: string;
  size: number;
  furnished: Property["furnished"];
  description: string;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  status: Property["status"];
  featured: boolean;
  reraApproved?: boolean;
  reraId?: string;
  verifiedDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  verificationChecks?: Property["verificationChecks"];
  priceBreakdown?: Property["priceBreakdown"];
}) {
  return {
    owner_id: input.ownerId,
    title: input.title,
    price: input.price,
    type: input.type,
    purpose: input.purpose,
    bhk: input.bhk ?? null,
    bathrooms: input.bathrooms ?? null,
    parking: input.parking ?? null,
    year_built: input.yearBuilt ?? null,
    city: input.city,
    state: input.state ?? null,
    country: input.country ?? "India",
    locality: input.locality,
    size: input.size,
    furnished: input.furnished,
    description: input.description,
    amenities: input.amenities,
    images: input.images,
    video_url: input.videoUrl ?? null,
    owner_name: input.ownerName,
    owner_phone: input.ownerPhone,
    owner_email: input.ownerEmail ?? null,
    status: toDbStatus(input.status),
    featured: input.featured,
    rera_approved: input.reraApproved ?? false,
    rera_id: input.reraId ?? null,
    verified_date: input.verifiedDate ?? null,
    seo_title: input.seoTitle ?? null,
    seo_description: input.seoDescription ?? null,
    verification_checks: input.verificationChecks ?? null,
    price_breakdown: input.priceBreakdown ?? null,
  };
}

export function mapUpdateToPatch(updates: Partial<Property>) {
  const patch: Record<string, unknown> = {};
  if (updates.title !== undefined) patch.title = updates.title;
  if (updates.price !== undefined) patch.price = updates.price;
  if (updates.type !== undefined) patch.type = updates.type;
  if (updates.purpose !== undefined) patch.purpose = updates.purpose;
  if (updates.bhk !== undefined) patch.bhk = updates.bhk;
  if (updates.bathrooms !== undefined) patch.bathrooms = updates.bathrooms;
  if (updates.parking !== undefined) patch.parking = updates.parking;
  if (updates.yearBuilt !== undefined) patch.year_built = updates.yearBuilt;
  if (updates.city !== undefined) patch.city = updates.city;
  if (updates.state !== undefined) patch.state = updates.state;
  if (updates.country !== undefined) patch.country = updates.country;
  if (updates.locality !== undefined) patch.locality = updates.locality;
  if (updates.size !== undefined) patch.size = updates.size;
  if (updates.furnished !== undefined) patch.furnished = updates.furnished;
  if (updates.description !== undefined) patch.description = updates.description;
  if (updates.amenities !== undefined) patch.amenities = updates.amenities;
  if (updates.images !== undefined) patch.images = updates.images;
  if (updates.videoUrl !== undefined) patch.video_url = updates.videoUrl;
  if (updates.ownerName !== undefined) patch.owner_name = updates.ownerName;
  if (updates.ownerPhone !== undefined) patch.owner_phone = updates.ownerPhone;
  if (updates.ownerEmail !== undefined) patch.owner_email = updates.ownerEmail;
  if (updates.inquiryCount !== undefined) patch.inquiry_count = updates.inquiryCount;
  if (updates.status !== undefined) patch.status = toDbStatus(updates.status);
  if (updates.featured !== undefined) patch.featured = updates.featured;
  if (updates.reraApproved !== undefined) patch.rera_approved = updates.reraApproved;
  if (updates.reraId !== undefined) patch.rera_id = updates.reraId;
  if (updates.verifiedDate !== undefined) patch.verified_date = updates.verifiedDate;
  if (updates.seoTitle !== undefined) patch.seo_title = updates.seoTitle;
  if (updates.seoDescription !== undefined) patch.seo_description = updates.seoDescription;
  if (updates.verificationChecks !== undefined) {
    patch.verification_checks = updates.verificationChecks;
  }
  if (updates.priceBreakdown !== undefined) patch.price_breakdown = updates.priceBreakdown;
  return patch;
}
