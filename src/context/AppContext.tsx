"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

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
  inquiryCount: number;
  status: "Active" | "Pending Review" | "Sold" | "Rented" | "Draft";
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

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  role: "user" | "broker" | "admin";
  joinedDate: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  read: boolean;
  date: string;
  forRole: "user" | "broker" | "admin" | "all";
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  count: number;
  active: boolean;
}

export interface Location {
  id: string;
  city: string;
  state: string;
  country: string;
  active: boolean;
  propertyCount: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  performedBy: string;
  role: string;
  target: string;
  timestamp: string;
}

export interface MockUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "broker" | "admin";
  status: "active" | "suspended";
  joinedDate: string;
  inquiriesCount: number;
}

export interface AssistanceRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: string;
  areas: string[];
  bhk: string;
  familySize: number;
  moveInDate: string;
  notes: string;
  status: "Received" | "Assigned to Agent" | "Properties Suggested";
}

export interface GeneralEnquiry {
  id: string;
  name: string;
  city: string;
  propertyType: string;
  budget: string;
  email: string;
  mobile: string;
  remarks: string;
  message?: string;
  date: string;
}

export interface CustomerReview {
  id: string;
  name: string;
  feedback: string;
  rating: number;
  date: string;
}

export interface DirectoryProfile {
  id: string;
  firmName: string;
  ownerName: string;
  category: "Agent & Broker" | "Builder & Developer" | "Interior Decorator" | "Architect" | "Building Contractor" | "Property Consultant" | "Vastu Consultant" | "Home Valuation/Inspection" | "Home Shifting/Deep Cleaning";
  city: string;
  address: string;
  email: string;
  website: string;
  mobile: string;
  description: string;
  reraId?: string;
  experience?: string;
  specialties?: string[];
  teamSize?: number;
  listingsCount?: number;
}


interface AppContextType {
  selectedCity: string;
  setSelectedCity: (city: string) => void;
  properties: Property[];
  setProperties: React.Dispatch<React.SetStateAction<Property[]>>;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  assistanceRequests: AssistanceRequest[];
  setAssistanceRequests: React.Dispatch<React.SetStateAction<AssistanceRequest[]>>;
  addAssistanceRequest: (req: Omit<AssistanceRequest, "id" | "status">) => void;
  addProperty: (property: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & { status?: Property["status"] }) => void;
  updateProperty: (propertyId: string, updates: Partial<Property>) => void;
  deleteProperty: (propertyId: string) => void;
  deleteInquiry: (propertyId: string, index: number) => void;
  inquiries: { [key: string]: { name: string; email: string; phone: string; message: string; date: string }[] };
  submitInquiry: (propertyId: string, inquiry: { name: string; email: string; phone: string; message: string }) => void;
  enquiries: GeneralEnquiry[];
  setEnquiries: React.Dispatch<React.SetStateAction<GeneralEnquiry[]>>;
  addGeneralEnquiry: (enquiry: Omit<GeneralEnquiry, "id" | "date">) => void;
  reviews: CustomerReview[];
  addReview: (review: Omit<CustomerReview, "id" | "date">) => void;
  directoryProfiles: DirectoryProfile[];
  setDirectoryProfiles: React.Dispatch<React.SetStateAction<DirectoryProfile[]>>;
  addDirectoryProfile: (profile: Omit<DirectoryProfile, "id">) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  userEmail: string;
  setUserEmail: (email: string) => void;
  userRole: "user" | "broker" | "admin" | null;
  setUserRole: (role: "user" | "broker" | "admin" | null) => void;
  userName: string;
  setUserName: (name: string) => void;
  userProfile: UserProfile | null;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  notifications: Notification[];
  setNotifications: React.Dispatch<React.SetStateAction<Notification[]>>;
  markNotificationRead: (id: string) => void;
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
  locations: Location[];
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  activityLogs: ActivityLog[];
  addLog: (log: Omit<ActivityLog, "id" | "timestamp">) => void;
  mockUsers: MockUser[];
  setMockUsers: React.Dispatch<React.SetStateAction<MockUser[]>>;
  compareList: string[];
  setCompareList: React.Dispatch<React.SetStateAction<string[]>>;
  toggleCompare: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockImages = {
  villas: [
    "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
  ],
  apartments: [
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
  ],
  houses: [
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=80",
  ],
};

const initialProperties: Property[] = [
  {
    id: "prop-1",
    title: "Ultra Luxury Lake-Facing Villa",
    price: 37500000, // 3.75 Crores
    type: "Villa",
    purpose: "buy",
    bhk: 4,
    city: "Udaipur",
    locality: "Lake Palace Road",
    size: 4200,
    furnished: "Furnished",
    description: "Nestled along the iconic Lake Palace Road in Udaipur, this 4 BHK luxury villa offers breathtaking Pichola Lake views, a private infinity pool, a lush landscaped terrace garden, and bespoke Mewari marble arches. Experience absolute royalty with high-tech automated climate controls and personal elevators.",
    amenities: ["Swimming Pool", "Private Garden", "Lake View", "Power Backup", "Gym", "Security", "Parking"],
    images: [mockImages.villas[0], mockImages.villas[1], mockImages.villas[2]],
    ownerName: "Rajendra Singh Mewar",
    ownerPhone: "+91 98765 43210",
    ownerEmail: "broker@svrepl.com",
    inquiryCount: 12,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2023/1204",
    verifiedDate: "2026-06-25",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 37500000,
      maintenance: 12000,
      registrationFees: 2250000,
      gst: 1875000,
    },
  },
  {
    id: "prop-2",
    title: "Premium 3 BHK Flat in C-Scheme",
    price: 8500000, // 85 Lakhs
    type: "Apartment",
    purpose: "buy",
    bhk: 3,
    city: "Jaipur",
    locality: "C-Scheme",
    size: 1850,
    furnished: "Semi-Furnished",
    description: "A gorgeous, modern 3 BHK apartment located in the prime area of C-Scheme, Jaipur. Comes with dynamic false ceilings, high-end teakwood modular kitchen, spacious balconies overlooking the garden skyline, and complete security. Perfect for families looking for proximity to leading business hubs, cafes, and schools.",
    amenities: ["Gym", "Security", "Clubhouse", "Children Play Area", "Parking", "Power Backup"],
    images: [mockImages.apartments[0], mockImages.apartments[1], mockImages.apartments[2]],
    ownerName: "Anil Sharma",
    ownerPhone: "+91 94140 12345",
    inquiryCount: 4,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2024/0932",
    verifiedDate: "2026-06-28",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 8500000,
      maintenance: 3500,
      registrationFees: 510000,
      gst: 425000,
    },
  },
  {
    id: "prop-3",
    title: "Modern 2 BHK Fully Furnished Flat",
    price: 22000, // 22,000 per month
    type: "Apartment",
    purpose: "rent",
    bhk: 2,
    city: "Udaipur",
    locality: "Fatehsagar Lake",
    size: 1200,
    furnished: "Furnished",
    description: "Tastefully furnished 2 BHK apartment near Fatehsagar Lake, Udaipur's most sought-after residential hub. Rent includes high-speed Wi-Fi, modern appliances, smart TV, double-door refrigerator, modular kitchen, and double beds. Features close proximity to top restaurants and hospitals.",
    amenities: ["Elevator", "Security", "Modular Kitchen", "Power Backup", "Parking"],
    images: [mockImages.apartments[2], mockImages.apartments[1]],
    ownerName: "Meenakshi Vyas",
    ownerPhone: "+91 98290 87654",
    ownerEmail: "broker@svrepl.com",
    inquiryCount: 9,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2023/0481",
    verifiedDate: "2026-06-29",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 22000,
      securityDeposit: 44000,
      maintenance: 2000,
    },
  },
  {
    id: "prop-4",
    title: "Heritage 5 BHK Bungalow",
    price: 85000000, // 8.5 Crores
    type: "Home",
    purpose: "buy",
    bhk: 5,
    city: "Jodhpur",
    locality: "Ratanada",
    size: 5500,
    furnished: "Furnished",
    description: "Live the royal lifestyle in this meticulously restored heritage Bungalow. Located in the diplomatic heart of Ratanada in Jodhpur. This property displays majestic stone jharokhas, a central open courtyard, detailed frescos, and a rooftop lounge that gives a 360-degree view of the city skyline.",
    amenities: ["Heritage Courtyard", "Rooftop Lounge", "Fort View", "Security", "Private Parking"],
    images: [mockImages.houses[0], mockImages.villas[2], mockImages.houses[2]],
    ownerName: "Gajendra Singh Rathore",
    ownerPhone: "+91 99887 76655",
    inquiryCount: 18,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2022/1199",
    verifiedDate: "2026-06-18",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 85000000,
      maintenance: 25000,
      registrationFees: 5100000,
      gst: 4250000,
    },
  },
  {
    id: "prop-5",
    title: "Cozy 3 BHK House in Vaishali Nagar",
    price: 32000, // 32k/month
    type: "Home",
    purpose: "rent",
    bhk: 3,
    city: "Jaipur",
    locality: "Vaishali Nagar",
    size: 2000,
    furnished: "Semi-Furnished",
    description: "Spacious 3 BHK home with a small front lawn and secure car parking. Ideally situated in Vaishali Nagar, Jaipur, near major universities and shopping malls. Highly recommended for families looking for peaceful, independent housing.",
    amenities: ["Private Lawn", "Parking", "Water Reservoir", "Power Backup"],
    images: [mockImages.houses[1], mockImages.houses[2]],
    ownerName: "Dr. K. K. Verma",
    ownerPhone: "+91 94142 54321",
    inquiryCount: 3,
    status: "Active",
    verifiedDate: "2026-07-02",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: false,
    },
    priceBreakdown: {
      basePrice: 32000,
      securityDeposit: 64000,
      maintenance: 1500,
    },
  },
  {
    id: "prop-6",
    title: "Premium Commercial Plot near Fort Road",
    price: 4500000, // 45 Lakhs
    type: "Industrial Plot",
    purpose: "sell",
    city: "Bikaner",
    locality: "Sadul Ganj",
    size: 2400,
    furnished: "Unfurnished",
    description: "East-facing commercial plot measuring 40x60 in the upscale Sadul Ganj expansion, Bikaner. Features 40ft wide internal tar roads, underground electricity grid, municipal water connections, and a green park boundary. Ready for immediate construction.",
    amenities: ["Park view", "Corner Plot", "Water Supply", "Gated Boundary"],
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"],
    ownerName: "Vikram Chauhan",
    ownerPhone: "+91 98281 12233",
    inquiryCount: 2,
    status: "Active",
    verifiedDate: "2026-06-20",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: false,
    },
    priceBreakdown: {
      basePrice: 4500000,
      maintenance: 0,
      registrationFees: 270000,
      gst: 225000,
    },
  },
  {
    id: "prop-7",
    title: "Chic 1 BHK Studio Apartment",
    price: 12000, // 12,000 per month
    type: "Apartment",
    purpose: "lease",
    bhk: 1,
    city: "Jaipur",
    locality: "Malviya Nagar",
    size: 650,
    furnished: "Furnished",
    description: "A compact, modern, fully-furnished studio apartment, perfect for solo professionals or couples. Equipped with split AC, double bed, smart TV, modular kitchenette, wardrobe, and balcony. Located in a secure gated community in Malviya Nagar, Jaipur.",
    amenities: ["Security", "Elevator", "Parking", "Gym"],
    images: [mockImages.apartments[1]],
    ownerName: "Rahul Sharma",
    ownerPhone: "+91 99999 88888",
    inquiryCount: 7,
    status: "Active",
    reraApproved: true,
    reraId: "RAJ/RERA/P/2024/1608",
    verifiedDate: "2026-07-04",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 12000,
      securityDeposit: 36000,
      maintenance: 1000,
    },
  },
  {
    id: "prop-8",
    title: "Luxury 4 BHK Penthouse",
    price: 18000000, // 1.8 Crore
    type: "Apartment",
    purpose: "sell",
    bhk: 4,
    city: "Kota",
    locality: "Talwandi",
    size: 3600,
    furnished: "Furnished",
    description: "Magnificent 4 BHK Penthouse in Talwandi, the most upscale neighborhood of Kota. Spread across two floors, it offers panoramic river valley vistas, a massive private terrace with deck seating, a fully-loaded personal gym area, home theater room, and premium Italian marble flooring.",
    amenities: ["Private Terrace", "Home Theater", "Gym", "Power Backup", "Security", "Swimming Pool"],
    images: [mockImages.villas[2], mockImages.apartments[0]],
    ownerName: "Devendra Jindal",
    ownerPhone: "+91 98888 77777",
    inquiryCount: 15,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2023/0744",
    verifiedDate: "2026-06-11",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 18000000,
      maintenance: 6500,
      registrationFees: 1080000,
      gst: 900000,
    },
  },
  {
    id: "prop-9",
    title: "Sleek Corporate Office Space",
    price: 75000, // 75k / month
    type: "Office Space",
    purpose: "lease",
    city: "Ahmedabad",
    locality: "SG Highway",
    size: 2500,
    furnished: "Semi-Furnished",
    description: "Modern, ready-to-move corporate office space on SG Highway, Ahmedabad. Features 25 workstations, 2 private cabins, a conference room, and server room infrastructure. Located in a premium grade-A business park.",
    amenities: ["Security", "Power Backup", "Elevator", "Parking", "Gym"],
    images: ["https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80"],
    ownerName: "Parth Patel",
    ownerPhone: "+91 99112 99112",
    ownerEmail: "broker@svrepl.com",
    inquiryCount: 5,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "GJ/RERA/AHD/2024/2904",
    verifiedDate: "2026-06-30",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 75000,
      securityDeposit: 225000,
      maintenance: 8000,
    },
  },
  {
    id: "prop-10",
    title: "Premium Retail Shop in Surat",
    price: 6500000, // 65 Lakhs
    type: "Shop",
    purpose: "buy",
    city: "Surat",
    locality: "Vesu",
    size: 800,
    furnished: "Furnished",
    description: "An outstanding retail opportunity with a double-height glass frontage in one of Surat's highest footfall commercial markets in Vesu. Best suited for fashion apparel, electronics, or premium jewelry brands.",
    amenities: ["Security", "Parking", "Modular Kitchen"],
    images: ["https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80"],
    ownerName: "Harshil Mehta",
    ownerPhone: "+91 98112 98112",
    inquiryCount: 8,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "GJ/RERA/SUR/2023/1109",
    verifiedDate: "2026-06-25",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 6500000,
      maintenance: 2500,
      registrationFees: 390000,
      gst: 325000,
    },
  },
  {
    id: "prop-11",
    title: "High-Yield Boutique Hotel in Sector 8",
    price: 120000000, // 12 Crores
    type: "Hotel",
    purpose: "sell",
    city: "Chandigarh",
    locality: "Sector 8",
    size: 12000,
    furnished: "Furnished",
    description: "Stunning 15-room boutique hotel operational with high monthly occupancy. Styled with classic North Indian design architecture, rooftop restaurant terrace, fine dining lounge, and fully equipped banquet hall. Secure your stake in Chandigarh's premium Sector 8 commercial zone.",
    amenities: ["Swimming Pool", "Private Garden", "Power Backup", "Gym", "Security", "Parking"],
    images: [mockImages.villas[1], mockImages.villas[2]],
    ownerName: "Sardar Harpal Singh",
    ownerPhone: "+91 97777 97777",
    inquiryCount: 22,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "CH/RERA/CHD/2022/0831",
    verifiedDate: "2026-05-15",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 120000000,
      maintenance: 85000,
      registrationFees: 7200000,
      gst: 6000000,
    },
  },
  {
    id: "prop-12",
    title: "Heritage Orchard Villa on Hills",
    price: 45000, // 45k/mo
    type: "Villa",
    purpose: "rent",
    bhk: 3,
    city: "Shimla",
    locality: "The Mall Road",
    size: 3200,
    furnished: "Furnished",
    description: "Nestled in the scenic hill station retreat of Shimla, this 3 BHK modern villa overlooks a private landscaped garden. Peaceful surroundings, stone fireplace, modern bathrooms, and wrap-around wooden deck.",
    amenities: ["Private Garden", "Power Backup", "Parking", "Security"],
    images: [mockImages.houses[2], mockImages.houses[0]],
    ownerName: "Vijay Sood",
    ownerPhone: "+91 94180 94180",
    inquiryCount: 6,
    status: "Active",
    verifiedDate: "2026-07-01",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: false,
    },
    priceBreakdown: {
      basePrice: 45000,
      securityDeposit: 90000,
      maintenance: 3000,
    },
  },
  {
    id: "prop-13",
    title: "Luxury Desert Resort and Spa",
    price: 85000000, // 8.5 Crore
    type: "Hotel",
    purpose: "sell",
    city: "Jaisalmer",
    locality: "Sam Sand Dunes",
    size: 15000,
    furnished: "Furnished",
    description: "Operational premium luxury resort near Sam Sand Dunes, Jaisalmer. Features 20 premium cottages, central dining courtyard, swimming pool, event stage, and corporate retreat packages. Excellent high-yield commercial hotspot.",
    amenities: ["Heritage Courtyard", "Private Garden", "Power Backup", "Security", "Parking"],
    images: [
      "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"
    ],
    ownerName: "Sumer Singh Bhati",
    ownerPhone: "+91 98292 22222",
    inquiryCount: 14,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "RAJ/RERA/P/2024/0489",
    verifiedDate: "2026-06-05",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 85000000,
      maintenance: 50000,
      registrationFees: 5100000,
      gst: 4250000,
    },
  },
  {
    id: "prop-14",
    title: "Lakeview Guest House",
    price: 18000, // 18k/mo
    type: "Home",
    purpose: "rent",
    bhk: 2,
    city: "Pushkar",
    locality: "Pushkar Lake",
    size: 1100,
    furnished: "Furnished",
    description: "Fully furnished 2 BHK guest house overlooking the beautiful Pushkar Lake. Features traditional architectural carvings, rooftop restaurant access, high-speed internet, and a peaceful environment. Ideal for staycations and digital nomads.",
    amenities: ["Rooftop Lounge", "Lake View", "Power Backup", "Security", "Parking"],
    images: [mockImages.houses[0], mockImages.houses[1]],
    ownerName: "Pandit Ram Sharma",
    ownerPhone: "+91 94143 33333",
    inquiryCount: 5,
    status: "Active",
    verifiedDate: "2026-07-02",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: false,
    },
    priceBreakdown: {
      basePrice: 18000,
      securityDeposit: 36000,
      maintenance: 1200,
    },
  },
  {
    id: "prop-15",
    title: "Prime Industrial Plot in Rajkot",
    price: 12500000, // 1.25 Crore
    type: "Industrial Plot",
    purpose: "sell",
    city: "Rajkot",
    locality: "Kalawad Road",
    size: 5000,
    furnished: "Unfurnished",
    description: "Premium industrial plot measuring 5000 sq ft situated in the busy Kalawad Road zone in Rajkot. Equipped with high-power industrial grid connections, municipal water channels, and direct container truck accessibility.",
    amenities: ["Water Supply", "Power Backup", "Gated Boundary"],
    images: ["https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"],
    ownerName: "Ketan Bhai Patel",
    ownerPhone: "+91 98251 44444",
    inquiryCount: 3,
    status: "Active",
    verifiedDate: "2026-06-25",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: false,
    },
    priceBreakdown: {
      basePrice: 12500000,
      maintenance: 0,
      registrationFees: 750000,
      gst: 625000,
    },
  },
  {
    id: "prop-16",
    title: "Modern Flat with River & City Views",
    price: 9500000, // 95 Lakhs
    type: "Apartment",
    purpose: "buy",
    bhk: 3,
    city: "Chandigarh",
    locality: "Sector 9",
    size: 1950,
    furnished: "Semi-Furnished",
    description: "Elegant 3 BHK apartment in Chandigarh in Sector 9. Offers panoramic, unobstructed view lines of the gardens and the city skyline from the master bedroom and living room balcony. Equipped with high-speed elevator, modular kitchen, and power backup.",
    amenities: ["Power Backup", "Security", "Clubhouse", "Elevator", "Parking"],
    images: [mockImages.apartments[1], mockImages.apartments[2]],
    ownerName: "Rajesh Kumar",
    ownerPhone: "+91 99112 55555",
    inquiryCount: 8,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "CH/RERA/CHD/2024/1210",
    verifiedDate: "2026-06-29",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 9500000,
      maintenance: 3800,
      registrationFees: 570000,
      gst: 475000,
    },
  },
  {
    id: "prop-17",
    title: "Hilltop Yoga & Wellness Penthouse",
    price: 32000000, // 3.2 Crore
    type: "Villa",
    purpose: "buy",
    bhk: 4,
    city: "Dharamshala",
    locality: "McLeod Ganj",
    size: 3800,
    furnished: "Furnished",
    description: "Breathtaking 4 BHK hilltop villa located in McLeod Ganj, Dharamshala, overlooking the green belts. Features a dedicated glass-enclosed yoga studio, wood-paneled fireplace lounge, solar power grid, and organic gardens.",
    amenities: ["Private Garden", "Power Backup", "Security", "Gym", "Parking"],
    images: [mockImages.villas[2], mockImages.houses[2]],
    ownerName: "Tenzin Gyatso",
    ownerPhone: "+91 94181 66666",
    inquiryCount: 11,
    status: "Active",
    featured: true,
    reraApproved: true,
    reraId: "HP/RERA/DHM/2023/0388",
    verifiedDate: "2026-06-15",
    verificationChecks: {
      titleDeed: true,
      taxClearance: true,
      utilitiesCheck: true,
      physicalVerification: true,
      structuralVetted: true,
    },
    priceBreakdown: {
      basePrice: 32000000,
      maintenance: 15000,
      registrationFees: 1920000,
      gst: 1600000,
    },
  },
  {
    id: "prop-18",
    title: "Lakeside Residential Farm Land",
    price: 21500000, // 2.15 Crore
    type: "Agricultural Land",
    purpose: "sell",
    city: "Rajsamand",
    locality: "Kankroli",
    size: 12000,
    furnished: "Unfurnished",
    description: "Scenic premium residential farm land in Rajsamand near Kankroli. Features fertile soil, close proximity to Rajsamand Lake, municipal irrigation pipelines, and direct road connectivity. Best suited for organic farming or building a private leisure farmhouse.",
    amenities: ["Water Supply", "Private Garden", "Lake View"],
    images: ["https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80"],
    ownerName: "Devendra Singh Gohil",
    ownerPhone: "+91 98293 77777",
    inquiryCount: 6,
    status: "Active",
  },
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCity, setSelectedCity] = useState("Udaipur");
  const [properties, setProperties] = useState<Property[]>(initialProperties);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [assistanceRequests, setAssistanceRequests] = useState<AssistanceRequest[]>([
    {
      id: "req-1",
      name: "Rohan Verma",
      email: "rohan@example.com",
      phone: "+91 98765 12345",
      budget: "₹25,000 - ₹35,000 / month",
      areas: ["Shobhagpura", "Panchwati"],
      bhk: "3 BHK",
      familySize: 4,
      moveInDate: "2026-07-01",
      notes: "Looking for an apartment near DPS school with park view and security.",
      status: "Assigned to Agent",
    }
  ]);
  const [inquiries, setInquiries] = useState<{ [key: string]: { name: string; email: string; phone: string; message: string; date: string }[] }>({
    "prop-1": [
      {
        name: "Suresh Patidar",
        email: "suresh@patidar.com",
        phone: "+91 94141 99999",
        message: "Hi, I am interested in viewing this lakeview villa this Sunday. Is it available for a visit?",
        date: "2026-06-14",
      }
    ],
    "prop-3": [
      {
        name: "Aishwarya Sen",
        email: "aishwarya@sen.com",
        phone: "+91 98888 12345",
        message: "Is the rent negotiable? I am looking to move in by next month.",
        date: "2026-07-12",
      }
    ],
    "prop-9": [
      {
        name: "Ramesh Kumar",
        email: "ramesh@kumar.com",
        phone: "+91 91234 56789",
        message: "We want to schedule a visit for our team of 15 people. Please let us know when is convenient.",
        date: "2026-07-15",
      }
    ]
  });

  const [enquiries, setEnquiries] = useState<GeneralEnquiry[]>([
    {
      id: "enq-1",
      name: "Aditya Vardhan",
      city: "Udaipur",
      propertyType: "Villa",
      budget: "₹3 Crore - ₹5 Crore",
      email: "aditya@vardhan.com",
      mobile: "+91 98290 11111",
      remarks: "Looking for a heritage-style lakefront property with a clean title.",
      date: "2026-06-15",
    }
  ]);

  const [reviews, setReviews] = useState<CustomerReview[]>([
    {
      id: "rev-1",
      name: "Priyanjali Rathore",
      feedback: "Khamagani Sa! The service provided by Sun Valley when relocating from Mumbai to Jaipur was outstanding. They verified all haveli deeds thoroughly.",
      rating: 5,
      date: "2026-06-12",
    },
    {
      id: "rev-2",
      name: "Mehul Patel",
      feedback: "Found an excellent commercial office space in SG Highway Ahmedabad. The lease process was smooth and entirely handled by the brokerage team.",
      rating: 5,
      date: "2026-06-14",
    }
  ]);

  const [directoryProfiles, setDirectoryProfiles] = useState<DirectoryProfile[]>([
    {
      id: "dir-1",
      firmName: "Mewar Heritage Architects",
      ownerName: "Abhinav Vyas",
      category: "Architect",
      city: "Udaipur",
      address: "Lake Palace Road, Udaipur",
      email: "info@mewararchitects.in",
      website: "www.mewararchitects.in",
      mobile: "+91 98290 22222",
      description: "Specializing in the preservation and restoration of historic Mewari havelis and designing royal, heritage-style lakefront properties.",
    },
    {
      id: "dir-2",
      firmName: "Royal Jaipur Interiors",
      ownerName: "Kriti Sharma",
      category: "Interior Decorator",
      city: "Jaipur",
      address: "C-Scheme, Jaipur",
      email: "kriti@royaljaipurinteriors.com",
      website: "www.royaljaipurinteriors.com",
      mobile: "+91 94140 33333",
      description: "Premium interior decorators blend modern luxury with Rajasthan's traditional color palettes, block prints, and handcrafted furniture.",
    },
    {
      id: "dir-3",
      firmName: "Marwar Elite Builders",
      ownerName: "Gajendra Rathore",
      category: "Builder & Developer",
      city: "Jodhpur",
      address: "Ratanada, Jodhpur",
      email: "contact@marwarbuilders.in",
      website: "www.marwarbuilders.in",
      mobile: "+91 98888 77777",
      description: "Developing modern villa townships and luxury apartment complexes keeping Jodhpur's signature blue accents and red sandstone aesthetics.",
    },
    {
      id: "dir-4",
      firmName: "Desert Vastu Foundations",
      ownerName: "Sumer Singh Bhati",
      category: "Vastu Consultant",
      city: "Jaisalmer",
      address: "Sam Sand Dunes Road, Jaisalmer",
      email: "bhati@desertvastu.com",
      website: "www.desertvastu.com",
      mobile: "+91 98292 22222",
      description: "Providing expert Vedic layout consulting for residential structures in extreme climates, ensuring peace, prosperity, and ecological harmony.",
    },
    {
      id: "dir-5",
      firmName: "Udaipur Packers & Shifters",
      ownerName: "Rajendra Joshi",
      category: "Home Shifting/Deep Cleaning",
      city: "Udaipur",
      address: "Hiran Magri Sector 4, Udaipur",
      email: "joshishifting@gmail.com",
      website: "www.udaipurpackers.com",
      mobile: "+91 94142 54321",
      description: "Local and interstate relocation assistance, deep heritage haveli sanitation, pest control, and elite art handling logistics.",
    },
    {
      id: "dir-6",
      firmName: "Sabarmati Tech Architects",
      ownerName: "Parth Patel",
      category: "Architect",
      city: "Ahmedabad",
      address: "SG Highway, Ahmedabad",
      email: "parth@sabarmatiarchs.com",
      website: "www.sabarmatiarchs.com",
      mobile: "+91 99112 99112",
      description: "Sustainable urban blueprints, LEED certification consultants, and grade-A commercial architecture on SG Highway.",
    },
    {
      id: "dir-7",
      firmName: "Surat Diamond Decorators",
      ownerName: "Harshil Mehta",
      category: "Interior Decorator",
      city: "Surat",
      address: "Vesu, Surat",
      email: "mehta@suratdecor.in",
      website: "www.suratdecor.in",
      mobile: "+91 98112 98112",
      description: "Stunning glassmorphic offices, upscale diamond merchant lounges, and state-of-the-art modular kitchen installations.",
    },
    {
      id: "dir-dealer-1",
      firmName: "Lake City Brokerage",
      ownerName: "Rajesh Mehta",
      category: "Agent & Broker",
      city: "Udaipur",
      address: "Panchwati, Udaipur",
      email: "broker@svrepl.com",
      website: "www.lakecitybrokerage.com",
      mobile: "+91 98290 12345",
      description: "Trusted broker specializing in lakefront villas, luxury apartments, and commercial lease verification in Shobhagpura & Panchwati.",
      reraId: "RAJ/A/UDZ/2021/0492",
      experience: "8+ Years",
      specialties: ["Heritage Havelis", "Lakefront Villas", "Agricultural Lands"],
      teamSize: 5,
      listingsCount: 12,
    },
    {
      id: "dir-dealer-2",
      firmName: "Mewar Property Consultants",
      ownerName: "Vikram Singh Rathore",
      category: "Property Consultant",
      city: "Udaipur",
      address: "Shobhagpura Circle, Udaipur",
      email: "vikram@mewarproperty.in",
      website: "www.mewarproperty.in",
      mobile: "+91 94141 56789",
      description: "Professional property consultant for heritage land title checks, agricultural conversions, and Udaipur RERA verification services.",
      reraId: "RAJ/A/UDZ/2023/1188",
      experience: "5+ Years",
      specialties: ["RERA Clearances", "Commercial Leases", "Title Checks"],
      teamSize: 3,
      listingsCount: 8,
    },
    {
      id: "dir-dealer-3",
      firmName: "Pink City Realty",
      ownerName: "Amit Sharma",
      category: "Agent & Broker",
      city: "Jaipur",
      address: "Malviya Nagar, Jaipur",
      email: "amit@pinkcityrealty.com",
      website: "www.pinkcityrealty.com",
      mobile: "+91 98290 98765",
      description: "Leading agent for high-end residential deals in C-Scheme, Vaishali Nagar, and Malviya Nagar.",
      reraId: "RAJ/A/JPR/2019/0082",
      experience: "12+ Years",
      specialties: ["Luxury Apartments", "Heritage Hotels", "Bungalows"],
      teamSize: 8,
      listingsCount: 24,
    },
    {
      id: "dir-dealer-4",
      firmName: "Marwar Property Hub",
      ownerName: "Sunil Bhati",
      category: "Property Consultant",
      city: "Jodhpur",
      address: "Shastri Nagar, Jodhpur",
      email: "sunil@marwarproperty.com",
      website: "www.marwarproperty.com",
      mobile: "+91 98291 11122",
      description: "Expert consultant in Jodhpur for sandstone havelis, heritage hotel leaseholds, and RERA property acquisition.",
      reraId: "RAJ/A/JDH/2022/0744",
      experience: "6+ Years",
      specialties: ["Haveli Restoration Projects", "Plots & Land", "Office Leases"],
      teamSize: 4,
      listingsCount: 15,
    },
    {
      id: "dir-dealer-5",
      firmName: "Thar Desert Brokers",
      ownerName: "Karan Singh",
      category: "Agent & Broker",
      city: "Jaisalmer",
      address: "Fort Road, Jaisalmer",
      email: "karan@thardesertbrokers.com",
      website: "www.thardesertbrokers.com",
      mobile: "+91 99887 65432",
      description: "Specialized brokers for resort land plots, sandstone villa listings, and heritage homestay rentals around Jaisalmer Fort.",
      reraId: "RAJ/A/JSM/2024/1820",
      experience: "4+ Years",
      specialties: ["Desert Camps & Resort Plots", "Sandstone Havelis", "Homestay Renting"],
      teamSize: 2,
      listingsCount: 6,
    }
  ]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userRole, setUserRole] = useState<"user" | "broker" | "admin" | null>(null);
  const [userName, setUserName] = useState("");
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: "notif-1", title: "Welcome to Sun Valley", message: "Your account has been set up successfully.", type: "success", read: false, date: "2026-07-16", forRole: "all" },
    { id: "notif-2", title: "New Inquiry Received", message: "Suresh Mehta submitted an inquiry on Ultra Luxury Lake-Facing Villa.", type: "info", read: false, date: "2026-07-15", forRole: "broker" },
    { id: "notif-3", title: "Property Approved", message: "Your listing 'Luxury Haveli in Jodhpur' has been approved by the admin.", type: "success", read: true, date: "2026-07-14", forRole: "broker" },
    { id: "notif-4", title: "Pending Approval", message: "2 properties are waiting for admin review.", type: "warning", read: false, date: "2026-07-16", forRole: "admin" },
  ]);

  const [categories, setCategories] = useState<Category[]>([
    { id: "cat-1", name: "Villa", icon: "🏡", count: 0, active: true },
    { id: "cat-2", name: "Apartment", icon: "🏢", count: 0, active: true },
    { id: "cat-3", name: "Home", icon: "🏠", count: 0, active: true },
    { id: "cat-4", name: "Office Space", icon: "🏗️", count: 0, active: true },
    { id: "cat-5", name: "Shop", icon: "🏪", count: 0, active: true },
    { id: "cat-6", name: "Agricultural Land", icon: "🌾", count: 0, active: true },
    { id: "cat-7", name: "Hotel", icon: "🏨", count: 0, active: true },
    { id: "cat-8", name: "Industrial Plot", icon: "🏭", count: 0, active: false },
  ]);

  const [locations, setLocations] = useState<Location[]>([
    { id: "loc-1", city: "Udaipur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-2", city: "Jaipur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-3", city: "Jodhpur", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-4", city: "Jaisalmer", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-5", city: "Kota", state: "Rajasthan", country: "India", active: true, propertyCount: 0 },
    { id: "loc-6", city: "Ahmedabad", state: "Gujarat", country: "India", active: true, propertyCount: 0 },
    { id: "loc-7", city: "Surat", state: "Gujarat", country: "India", active: true, propertyCount: 0 },
    { id: "loc-8", city: "Shimla", state: "Himachal Pradesh", country: "India", active: false, propertyCount: 0 },
  ]);

  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([
    { id: "log-1", action: "Property Approved", performedBy: "admin@svrepl.com", role: "Admin", target: "prop-1 — Ultra Luxury Lake-Facing Villa", timestamp: "2026-07-16 14:32:00" },
    { id: "log-2", action: "User Role Changed", performedBy: "admin@svrepl.com", role: "Admin", target: "broker@svrepl.com → broker", timestamp: "2026-07-15 10:15:00" },
    { id: "log-3", action: "New Dealer Registered", performedBy: "vikram@mewarproperty.in", role: "Broker", target: "Mewar Property Consultants", timestamp: "2026-07-14 09:45:00" },
    { id: "log-4", action: "Property Deleted", performedBy: "admin@svrepl.com", role: "Admin", target: "prop-draft-001", timestamp: "2026-07-13 16:22:00" },
    { id: "log-5", action: "Inquiry Submitted", performedBy: "user@svrepl.com", role: "User", target: "prop-2 — Premium 3 BHK Flat in C-Scheme", timestamp: "2026-07-12 11:05:00" },
  ]);

  const [compareList, setCompareList] = useState<string[]>([]);

  const toggleCompare = (id: string) => {
    setCompareList(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length >= 4
          ? [...prev.slice(1), id]
          : [...prev, id]
    );
  };

  const [mockUsers, setMockUsers] = useState<MockUser[]>([
    { id: "usr-1", name: "Arjun Sharma", email: "user@svrepl.com", role: "user", status: "active", joinedDate: "2026-01-15", inquiriesCount: 4 },
    { id: "usr-2", name: "Priya Nair", email: "priya@gmail.com", role: "user", status: "active", joinedDate: "2026-02-20", inquiriesCount: 2 },
    { id: "usr-3", name: "Sanjay Gupta", email: "sanjay@outlook.com", role: "user", status: "suspended", joinedDate: "2026-03-05", inquiriesCount: 0 },
    { id: "usr-4", name: "Rajesh Mehta", email: "broker@svrepl.com", role: "broker", status: "active", joinedDate: "2025-11-10", inquiriesCount: 0 },
    { id: "usr-5", name: "Vikram Singh", email: "vikram@mewarproperty.in", role: "broker", status: "active", joinedDate: "2025-09-01", inquiriesCount: 0 },
    { id: "usr-6", name: "Admin User", email: "admin@svrepl.com", role: "admin", status: "active", joinedDate: "2025-06-01", inquiriesCount: 0 },
  ]);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const addAssistanceRequest = (req: Omit<AssistanceRequest, "id" | "status">) => {
    const newRequest: AssistanceRequest = {
      ...req,
      id: `req-${Date.now()}`,
      status: "Received",
    };
    setAssistanceRequests((prev) => [newRequest, ...prev]);
  };

  const addProperty = (prop: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone" | "ownerEmail"> & { status?: Property["status"] }) => {
    const matchingProfile = isLoggedIn && userRole === "broker"
      ? directoryProfiles.find(dp => dp.email.toLowerCase() === userEmail.toLowerCase())
      : null;

    const newProperty: Property = {
      ...prop,
      id: `prop-${Date.now()}`,
      inquiryCount: 0,
      status: prop.status || "Pending Review",
      ownerName: matchingProfile ? matchingProfile.ownerName : "Owner User",
      ownerPhone: matchingProfile ? matchingProfile.mobile : "+91 99000 99000",
      ownerEmail: isLoggedIn ? userEmail : "owner@example.com",
    };
    setProperties((prev) => [newProperty, ...prev]);
  };

  const updateProperty = (propertyId: string, updates: Partial<Property>) => {
    setProperties((prev) =>
      prev.map((prop) => (prop.id === propertyId ? { ...prop, ...updates } : prop))
    );
  };

  const deleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((prop) => prop.id !== propertyId));
  };

  const deleteInquiry = (propertyId: string, index: number) => {
    setInquiries((prev) => {
      const existing = prev[propertyId] || [];
      const updated = existing.filter((_, idx) => idx !== index);
      
      setProperties((pPrev) =>
        pPrev.map((prop) =>
          prop.id === propertyId
            ? { ...prop, inquiryCount: Math.max(0, prop.inquiryCount - 1) }
            : prop
        )
      );

      return {
        ...prev,
        [propertyId]: updated,
      };
    });
  };

  const submitInquiry = (propertyId: string, inquiry: { name: string; email: string; phone: string; message: string }) => {
    const newInquiry = {
      ...inquiry,
      date: new Date().toISOString().split("T")[0],
    };

    setInquiries((prev) => {
      const existing = prev[propertyId] || [];
      return {
        ...prev,
        [propertyId]: [...existing, newInquiry],
      };
    });

    setProperties((prev) =>
      prev.map((prop) =>
        prop.id === propertyId ? { ...prop, inquiryCount: prop.inquiryCount + 1 } : prop
      )
    );
  };

  const addGeneralEnquiry = (enq: Omit<GeneralEnquiry, "id" | "date">) => {
    const newEnquiry: GeneralEnquiry = {
      ...enq,
      id: `enq-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setEnquiries((prev) => [newEnquiry, ...prev]);
  };

  const addReview = (rev: Omit<CustomerReview, "id" | "date">) => {
    const newReview: CustomerReview = {
      ...rev,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [newReview, ...prev]);
  };

  const addDirectoryProfile = (prof: Omit<DirectoryProfile, "id">) => {
    const newProfile: DirectoryProfile = {
      ...prof,
      id: `dir-${Date.now()}`,
    };
    setDirectoryProfiles((prev) => [newProfile, ...prev]);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const addLog = (log: Omit<ActivityLog, "id" | "timestamp">) => {
    const newLog: ActivityLog = {
      ...log,
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString("en-IN"),
    };
    setActivityLogs((prev) => [newLog, ...prev]);
  };

  return (
    <AppContext.Provider
      value={{
        selectedCity,
        setSelectedCity,
        properties,
        setProperties,
        favorites,
        toggleFavorite,
        assistanceRequests,
        setAssistanceRequests,
        addAssistanceRequest,
        addProperty,
        updateProperty,
        deleteProperty,
        deleteInquiry,
        inquiries,
        submitInquiry,
        enquiries,
        setEnquiries,
        addGeneralEnquiry,
        reviews,
        addReview,
        directoryProfiles,
        setDirectoryProfiles,
        addDirectoryProfile,
        isLoggedIn,
        setIsLoggedIn,
        userEmail,
        setUserEmail,
        userRole,
        setUserRole,
        userName,
        setUserName,
        userProfile,
        setUserProfile,
        notifications,
        setNotifications,
        markNotificationRead,
        categories,
        setCategories,
        locations,
        setLocations,
        activityLogs,
        addLog,
        mockUsers,
        setMockUsers,
        compareList,
        setCompareList,
        toggleCompare,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
