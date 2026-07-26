export const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner",
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar",
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand",
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

export const PROPERTY_TYPES = [
  { label: "All Types", value: "any" },
  { label: "Home", value: "Home" },
  { label: "Villa", value: "Villa" },
  { label: "Apartment", value: "Apartment" },
  { label: "Plots / Land", value: "Industrial Plot" },
  { label: "Commercial Space", value: "Commercial Space" },
  { label: "Office Space", value: "Office Space" },
];

export const BUDGET_OPTIONS_BUY = [
  { label: "Any Price", value: "any" },
  { label: "Under ₹50 Lakh", value: "0-5000000" },
  { label: "₹50L - ₹1 Crore", value: "5000000-10000000" },
  { label: "₹1Cr - ₹3 Crore", value: "10000000-30000000" },
  { label: "Above ₹3 Crore", value: "30000000-999999999" },
];

export const BUDGET_OPTIONS_RENT = [
  { label: "Any Rent", value: "any" },
  { label: "Under ₹15,000", value: "0-15000" },
  { label: "₹15,000 - ₹30,000", value: "15000-30000" },
  { label: "₹30,000 - ₹50,000", value: "30000-50000" },
  { label: "Above ₹50,000", value: "50000-999999" },
];

/** Preserved from the original home page (currently unused in JSX). */
export const BROWSE_CITIES = [
  { name: "Udaipur", count: 240, desc: "Lake & Restoration Villas", image: "https://content.jdmagicbox.com/comp/udaipur-rajasthan/h6/9999px294.x294.190109172305.s8h6/catalogue/archi-s-galaxy-udaipur-rajasthan-th9b6z57si.jpg" },
  { name: "Jaipur", count: 480, desc: "Elite Penthouses & Apartments", image: "https://www.jaipurpropertyhouse.in/wp-content/uploads/2022/12/arihant-avana-mansarovar-jaipur.jpg" },
  { name: "Jodhpur", count: 180, desc: "Sun City Heritage Haveli Estates", image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.2700,73.0100" },
  { name: "Jaisalmer", count: 110, desc: "Sandstone Havelis & Thar Plots", image: "https://maps.google.com/cbk?output=thumbnail&w=600&h=400&ll=26.9124,70.9127" },
];

export const MOCK_PROJECTS = [
  {
    id: "proj-1",
    name: "SqftGo Royal Vista",
    developer: "Mewar Builders & Developers",
    price: "₹75 Lakh - ₹1.8 Crore",
    location: "Fateh Sagar, Udaipur",
    bhk: "2, 3 & 4 BHK Luxury Apartments",
    image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=24.5764,73.6836"
  },
  {
    id: "proj-2",
    name: "Aravali Ridge Residency",
    developer: "Jaipur Heritage Housing",
    price: "₹85 Lakh - ₹2.5 Crore",
    location: "Malviya Nagar, Jaipur",
    bhk: "3 & 4 BHK Premium Apartments",
    image: "https://www.jaipurpropertyhouse.in/wp-content/uploads/2022/12/arihant-avana-mansarovar-jaipur.jpg"
  },
  {
    id: "proj-3",
    name: "Fort View Meadows",
    developer: "Marwar Palace Homes",
    price: "₹1.2 Crore - ₹3.7 Crore",
    location: "Mehrangarh Road, Jodhpur",
    bhk: "Independent Heritage Villas",
    image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.2700,73.0100"
  },
  {
    id: "proj-4",
    name: "Chambal Heights",
    developer: "Riverfront Builders Group",
    price: "₹38 Lakh - ₹85 Lakh",
    location: "Kunhari, Kota",
    bhk: "1, 2 & 3 BHK Flats & Penthouses",
    image: "https://maps.google.com/cbk?output=thumbnail&w=600&h=400&ll=25.1800,75.8300"
  }
];
