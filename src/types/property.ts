export interface PropertyInquiry {
  id?: string;
  name: string;
  email: string;
  phone: string;
  message: string;
  date: string;
  status?: "new" | "read" | "archived";
}

export interface Property {
  id: string;
  title: string;
  price: number;
  type: "Home" | "Villa" | "Hotel" | "Agricultural Land" | "Apartment" | "Office Space" | "Commercial Space" | "Shop" | "Industrial Plot";
  purpose: "buy" | "sell" | "rent" | "lease";
  bhk?: number;
  bathrooms?: number;
  parking?: number;
  yearBuilt?: number;
  city: string;
  state?: string;
  country?: string;
  locality: string;
  size: number;
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished";
  description: string;
  amenities: string[];
  images: string[];
  videoUrl?: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  /** Auth/profiles id of the listing owner. */
  ownerId?: string;
  inquiryCount: number;
  status: "Active" | "Pending Review" | "Sold" | "Rented" | "Draft" | "Rejected";
  featured?: boolean;
  reraApproved?: boolean;
  reraId?: string;
  verifiedDate?: string;
  seoTitle?: string;
  seoDescription?: string;
  verificationChecks?: {
    titleDeed: boolean;
    taxClearance: boolean;
    utilitiesCheck: boolean;
    physicalVerification: boolean;
    structuralVetted: boolean;
  };
  priceBreakdown?: {
    basePrice: number;
    securityDeposit?: number;
    maintenance: number;
    registrationFees?: number;
    gst?: number;
  };
}
