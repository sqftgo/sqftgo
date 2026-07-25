import {
  Building2,
  MapPin,
  DollarSign,
  Image,
  CheckCircle2,
  FileText,
} from "lucide-react";

export const CREATE_STEPS = [
  { title: "Basic Info", desc: "Title, type & purpose", icon: Building2 },
  { title: "Location & Details", desc: "Dimensions & specifications", icon: MapPin },
  { title: "Pricing & Costing", desc: "Rent or selling details", icon: DollarSign },
  { title: "Amenities Selection", desc: "Fixtures and features", icon: CheckCircle2 },
  { title: "Media & SEO Config", desc: "Images and SEO options", icon: Image },
  { title: "Review & Publish", desc: "Verify details and submit", icon: FileText },
];

export const PURPOSES = [
  { value: "buy", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "For Lease" },
];

export const STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Pending Review", label: "Pending Review" },
  { value: "Sold", label: "Sold" },
  { value: "Rented", label: "Rented" },
  { value: "Draft", label: "Draft" },
];

export const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
];

export const labelClassName = "text-[9px] font-black text-charcoal/45 uppercase tracking-widest";
export const selectBtnClass =
  "bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between";
