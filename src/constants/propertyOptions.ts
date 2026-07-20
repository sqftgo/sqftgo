export const PROPERTY_TYPES = [
  "Home", "Villa", "Hotel", "Agricultural Land", "Apartment", 
  "Office Space", "Commercial Space", "Shop", "Industrial Plot"
];

export const BUDGET_BUY_MIN_OPTIONS = [
  { label: "Min Price", value: "" },
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹75 Lakhs", value: "7500000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" }
];

export const BUDGET_BUY_MAX_OPTIONS = [
  { label: "Max Price", value: "" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹75 Lakhs", value: "7500000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" },
  { label: "₹15 Crores", value: "150000000" }
];

export const BUDGET_RENT_MIN_OPTIONS = [
  { label: "Min Rent", value: "" },
  { label: "₹5,000", value: "5000" },
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹1 Lakh", value: "100000" }
];

export const BUDGET_RENT_MAX_OPTIONS = [
  { label: "Max Rent", value: "" },
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹1 Lakh", value: "100000" },
  { label: "₹2 Lakhs", value: "200000" }
];

export const SIZE_MIN_OPTIONS = [
  { label: "Min Size (sq.ft.)", value: "" },
  { label: "500 sq.ft.", value: "500" },
  { label: "1000 sq.ft.", value: "1000" },
  { label: "1500 sq.ft.", value: "1500" },
  { label: "2000 sq.ft.", value: "2000" },
  { label: "3000 sq.ft.", value: "3000" }
];

export const SIZE_MAX_OPTIONS = [
  { label: "Max Size (sq.ft.)", value: "" },
  { label: "1000 sq.ft.", value: "1000" },
  { label: "1500 sq.ft.", value: "1500" },
  { label: "2000 sq.ft.", value: "2000" },
  { label: "3000 sq.ft.", value: "3000" },
  { label: "5000 sq.ft.", value: "5000" }
];

export const BHK_OPTIONS = ["1", "2", "3", "4"] as const;

export const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"] as const;

export const AMENITIES = [
  "Swimming Pool", "Gym", "Garden", "Parking", "EV Charging", "Power Backup", "Security"
];
