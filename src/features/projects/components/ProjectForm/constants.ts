import {
  Building2,
  MapPin,
  DollarSign,
  Image,
  CheckCircle2,
  FileText,
  Layers,
} from "lucide-react";

export const PROJECT_CREATE_STEPS = [
  { title: "Basic Info", desc: "Name, role & stage", icon: Building2 },
  { title: "Location & Inventory", desc: "City, types & sizes", icon: MapPin },
  { title: "Pricing & Timeline", desc: "Price range & dates", icon: DollarSign },
  { title: "Amenities", desc: "Project facilities", icon: CheckCircle2 },
  { title: "Media & SEO", desc: "Photos and SEO", icon: Image },
  { title: "Review & Publish", desc: "Verify and submit", icon: FileText },
] as const;

export const LIFECYCLE_OPTIONS = [
  { label: "Upcoming", value: "Upcoming" },
  { label: "Under Construction", value: "Under Construction" },
  { label: "Ready", value: "Ready" },
];

export const OWNERSHIP_OPTIONS = [
  { label: "Owner", value: "Owner" },
  { label: "Builder", value: "Builder" },
  { label: "Marketing Partner", value: "Marketing Partner" },
];

export const labelClassName = "text-[9px] font-black text-charcoal/45 uppercase tracking-widest";
export const selectBtnClass =
  "bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between";

/** Kept for step icon reuse in inventory section headers. */
export { Layers };
