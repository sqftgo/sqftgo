import type { Property } from "@/types";
import { DEFAULT_IMAGES } from "./constants";

export type PropertyFormSubmitData = {
  title: string;
  type: Property["type"];
  purpose: Property["purpose"];
  description: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  nearbyHospital?: string;
  nearbySchool?: string;
  nearbyTransportation?: string;
  size: number;
  bhk?: number;
  bathrooms?: number;
  parking?: number;
  yearBuilt?: number;
  furnished: Property["furnished"];
  price: number;
  amenities: string[];
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
  reraId?: string;
  reraApproved?: boolean;
  status: Property["status"];
};

export type FormState = {
  title: string;
  type: string;
  purpose: string;
  description: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  nearbyHospital: string;
  nearbySchool: string;
  nearbyTransportation: string;
  size: string;
  bhk: string;
  bathrooms: string;
  parking: string;
  yearBuilt: string;
  furnished: string;
  price: string;
  amenities: string[];
  images: string[];
  seoTitle: string;
  seoDescription: string;
  reraId: string;
  status: Property["status"];
};

export type PropertyFormProps = {
  mode: "create" | "edit";
  initialProperty?: Property;
  onSubmit: (data: PropertyFormSubmitData) => void;
};

export type SetFormField = (k: keyof FormState, v: FormState[keyof FormState]) => void;

export function propertyToForm(prop: Property): FormState {
  return {
    title: prop.title,
    type: prop.type,
    purpose: prop.purpose,
    description: prop.description,
    city: prop.city,
    state: prop.state || "Rajasthan",
    country: prop.country || "India",
    locality: prop.locality,
    nearbyHospital: prop.nearbyHospital || "",
    nearbySchool: prop.nearbySchool || "",
    nearbyTransportation: prop.nearbyTransportation || "",
    size: String(prop.size),
    bhk: String(prop.bhk || ""),
    bathrooms: String(prop.bathrooms || ""),
    parking: String(prop.parking || ""),
    yearBuilt: String(prop.yearBuilt || ""),
    furnished: prop.furnished,
    price: String(prop.price),
    amenities: prop.amenities,
    images: prop.images?.length ? [...prop.images] : [...DEFAULT_IMAGES],
    seoTitle: prop.seoTitle || "",
    seoDescription: prop.seoDescription || "",
    reraId: prop.reraId || "",
    status: prop.status,
  };
}

export function emptyForm(): FormState {
  return {
    title: "",
    type: "Villa",
    purpose: "buy",
    description: "",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    locality: "",
    nearbyHospital: "",
    nearbySchool: "",
    nearbyTransportation: "",
    size: "",
    bhk: "",
    bathrooms: "",
    parking: "",
    yearBuilt: "",
    furnished: "Semi-Furnished",
    price: "",
    amenities: [],
    images: [...DEFAULT_IMAGES],
    seoTitle: "",
    seoDescription: "",
    reraId: "",
    status: "Pending Review",
  };
}

export function toSubmitData(form: FormState, status: Property["status"]): PropertyFormSubmitData {
  return {
    title: form.title,
    type: form.type as Property["type"],
    purpose: form.purpose as Property["purpose"],
    description: form.description,
    city: form.city,
    state: form.state,
    country: form.country,
    locality: form.locality,
    nearbyHospital: form.nearbyHospital.trim(),
    nearbySchool: form.nearbySchool.trim(),
    nearbyTransportation: form.nearbyTransportation.trim(),
    size: parseInt(form.size) || 0,
    bhk: parseInt(form.bhk) || undefined,
    bathrooms: parseInt(form.bathrooms) || undefined,
    parking: parseInt(form.parking) || undefined,
    yearBuilt: parseInt(form.yearBuilt) || undefined,
    furnished: form.furnished as Property["furnished"],
    price: parseInt(form.price) || 0,
    amenities: form.amenities,
    images: form.images,
    seoTitle: form.seoTitle || form.title,
    seoDescription: form.seoDescription || form.description.slice(0, 160),
    reraId: form.reraId || undefined,
    reraApproved: !!form.reraId,
    status,
  };
}
