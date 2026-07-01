"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Property {
  id: string;
  title: string;
  price: number; // in Rupees
  type: "Home" | "Villa" | "Hotel" | "Agricultural Land" | "Apartment" | "Office Space" | "Commercial Space" | "Shop" | "Industrial Plot";
  purpose: "buy" | "sell" | "rent" | "lease";
  bhk?: number;
  city: string;
  locality: string;
  size: number; // in sq.ft.
  furnished: "Furnished" | "Semi-Furnished" | "Unfurnished";
  description: string;
  amenities: string[];
  images: string[];
  ownerName: string;
  ownerPhone: string;
  inquiryCount: number;
  status: "Active" | "Pending Review" | "Sold" | "Rented";
  featured?: boolean;
  reraApproved?: boolean;
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
  address: string;
  email: string;
  website: string;
  mobile: string;
  description: string;
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
  addProperty: (property: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone">) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const mockImages = {
  villas: [
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=24.5764,73.6836",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=24.5925,73.6791",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=24.6000,73.6800",
  ],
  apartments: [
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.9239,75.8267",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.8530,75.7600",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.9100,75.8000",
  ],
  houses: [
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.2700,73.0100",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=25.1800,75.8300",
    "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.4500,74.6300",
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
    inquiryCount: 12,
    status: "Active",
    featured: true,
    reraApproved: true,
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
    inquiryCount: 9,
    status: "Active",
    featured: true,
    reraApproved: true,
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
    images: ["https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=28.0229,73.3119"],
    ownerName: "Vikram Chauhan",
    ownerPhone: "+91 98281 12233",
    inquiryCount: 2,
    status: "Active",
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
    images: ["https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=23.0258,72.5074"],
    ownerName: "Parth Patel",
    ownerPhone: "+91 99112 99112",
    inquiryCount: 5,
    status: "Active",
    featured: true,
    reraApproved: true,
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
    images: ["https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=21.2089,72.8634"],
    ownerName: "Harshil Mehta",
    ownerPhone: "+91 98112 98112",
    inquiryCount: 8,
    status: "Active",
    featured: true,
    reraApproved: true,
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
  },
  {
    id: "prop-12",
    title: "Heritage Orchard Villa on Hills",
    price: 45000, // 45k/mo
    type: "Villa",
    purpose: "rent",
    bhk: 3,
    city: "Mount Abu",
    locality: "Nakki Lake Circle",
    size: 3200,
    furnished: "Furnished",
    description: "Nestled in the scenic hill station retreat of Nakki Lake Circle, Mount Abu, this 3 BHK modern villa overlooks a private landscaped garden. Peaceful surroundings, stone fireplace, modern bathrooms, and wrap-around wooden deck.",
    amenities: ["Private Garden", "Power Backup", "Parking", "Security"],
    images: [mockImages.houses[2], mockImages.houses[0]],
    ownerName: "Vijay Sood",
    ownerPhone: "+91 94180 94180",
    inquiryCount: 6,
    status: "Active",
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
      "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.8981,70.5015",
      "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.8985,70.5020"
    ],
    ownerName: "Sumer Singh Bhati",
    ownerPhone: "+91 98292 22222",
    inquiryCount: 14,
    status: "Active",
    featured: true,
    reraApproved: true,
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
    images: ["https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=22.2573,70.7388"],
    ownerName: "Ketan Bhai Patel",
    ownerPhone: "+91 98251 44444",
    inquiryCount: 3,
    status: "Active",
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
    images: ["https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=25.0715,73.8824"],
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
      address: "C-Scheme, Jaipur",
      email: "kriti@royaljaipurinteriors.com",
      website: "www.royaljaipurinteriors.com",
      mobile: "+91 94140 33333",
      description: "Premium interior decorators blend modern luxury with Rajasthan's traditional color palettes, block prints, and handcrafted furniture.",
    }
  ]);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");

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

  const addProperty = (prop: Omit<Property, "id" | "inquiryCount" | "status" | "ownerName" | "ownerPhone">) => {
    const newProperty: Property = {
      ...prop,
      id: `prop-${Date.now()}`,
      inquiryCount: 0,
      status: "Pending Review",
      ownerName: "Owner User",
      ownerPhone: "+91 99000 99000",
    };
    setProperties((prev) => [newProperty, ...prev]);
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
