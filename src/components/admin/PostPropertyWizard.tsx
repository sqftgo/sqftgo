"use client";

import React, { useState } from "react";
import { useApp, Property } from "@/context/AppContext";
import StepProgress from "@/components/ui/StepProgress";
import { 
  Plus, 
  MapPin, 
  IndianRupee, 
  ChevronRight, 
  ChevronLeft,
  Upload,
  X,
  FileCheck,
  CheckCircle2,
  PhoneCall
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];
const PROPERTY_TYPES = [
  "Home", "Villa", "Hotel", "Agricultural Land", "Apartment", 
  "Office Space", "Commercial Space", "Shop", "Industrial Plot"
];
const FURNISHING_OPTIONS = ["Furnished", "Semi-Furnished", "Unfurnished"];
const AMENITIES_LIST = [
  "Swimming Pool", "Gym", "Power Backup", "Security", "Parking", 
  "Elevator", "Private Garden", "Clubhouse", "Modular Kitchen"
];

const STEPS = ["Type & Purpose", "Location", "Specifications", "Photos", "Price & Terms", "Review"];

interface PostPropertyWizardProps {
  onSuccess: () => void;
}

export const PostPropertyWizard: React.FC<PostPropertyWizardProps> = ({ onSuccess }) => {
  const { addProperty } = useApp();

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Form states
  const [purpose, setPurpose] = useState<"buy" | "sell" | "rent" | "lease">("buy");
  const [type, setType] = useState<Property["type"]>("Apartment");
  const [city, setCity] = useState("Udaipur");
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState<string>("3");
  const [size, setSize] = useState<string>("");
  const [furnished, setFurnished] = useState<Property["furnished"]>("Semi-Furnished");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("");
  
  // Mock image upload state
  const [mockUploadedImages, setMockUploadedImages] = useState<string[]>([
    "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=26.2700,73.0100"
  ]);

  const handleAmenityToggle = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleMockUpload = () => {
    const mockUnsplashPics = [
      "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.5764,73.6836",
      "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.5925,73.6791",
      "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.6000,73.6800"
    ];
    const nextPic = mockUnsplashPics[mockUploadedImages.length % mockUnsplashPics.length];
    setMockUploadedImages((prev) => [...prev, nextPic]);
  };

  const handleRemoveImage = (idx: number) => {
    setMockUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateStep = (): boolean => {
    if (currentStep === 1 && !locality) return false;
    if (currentStep === 2 && !size) return false;
    if (currentStep === 4 && !price) return false;
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      alert("Please fill in all required fields before moving forward.");
      return;
    }
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Construct new listing
    addProperty({
      title: `${(type !== "Industrial Plot" && type !== "Agricultural Land") && bhk ? bhk + " BHK " : ""}${type} in ${locality}`,
      price: parseInt(price),
      type,
      purpose,
      bhk: (type !== "Industrial Plot" && type !== "Agricultural Land") ? parseInt(bhk) : undefined,
      city,
      locality,
      size: parseInt(size),
      furnished,
      description: description || `A well-maintained ${bhk ? bhk + " BHK " : ""} ${type} located in the pleasant vicinity of ${locality}, ${city}. Ideal for family residence.`,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : ["Security", "Parking"],
      images: mockUploadedImages.length > 0 ? mockUploadedImages : [
        "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=26.2700,73.0100"
      ],
    });

    setIsSubmitted(true);
  };

  const resetForm = () => {
    setPurpose("buy");
    setType("Apartment");
    setCity("Udaipur");
    setLocality("");
    setBhk("3");
    setSize("");
    setFurnished("Semi-Furnished");
    setDescription("");
    setSelectedAmenities([]);
    setPrice("");
    setMockUploadedImages(["https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=26.2700,73.0100"]);
    setCurrentStep(0);
    setIsSubmitted(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Listing Purpose *</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(["buy", "sell", "rent", "lease"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPurpose(mode)}
                    className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      purpose === mode
                        ? "border-indigo bg-indigo/5 text-indigo font-extrabold"
                        : "border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-350"
                    }`}
                  >
                    <span className="text-sm capitalize">{mode === "buy" ? "For Sale (Buy)" : mode === "sell" ? "For Sale (Sell)" : mode === "rent" ? "For Rent" : "For Lease"}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Property Type *</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as Property["type"])}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      type === t
                        ? "bg-slate-900 border-slate-900 text-white dark:bg-white dark:text-slate-950"
                        : "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-850 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">City *</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm font-semibold outline-none cursor-pointer"
              >
                {CITIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">Locality *</label>
              <input
                type="text"
                required
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Panchwati, Shastri Nagar, Hiran Magri"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 text-sm"
          >
            {(type !== "Industrial Plot" && type !== "Agricultural Land") && (
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-slate-805 dark:text-slate-200">BHK Layout Size</span>
                <div className="flex gap-2">
                  {["1", "2", "3", "4", "5"].map((bhkVal) => (
                    <button
                      key={bhkVal}
                      type="button"
                      onClick={() => setBhk(bhkVal)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                        bhk === bhkVal
                          ? "bg-emerald-500 border-emerald-500 text-white shadow-sm"
                          : "bg-slate-50 border-slate-200 dark:bg-slate-950 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300"
                      }`}
                    >
                      {bhkVal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-850 dark:text-slate-200">Super Area (sq.ft.) *</label>
              <input
                type="number"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 1500"
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
              />
            </div>

            {(type !== "Industrial Plot" && type !== "Agricultural Land") && (
              <div className="flex flex-col gap-1.5">
                <label className="font-extrabold text-slate-850 dark:text-slate-200">Furnishing State</label>
                <select
                  value={furnished}
                  onChange={(e) => setFurnished(e.target.value as Property["furnished"])}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer"
                >
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-slate-850 dark:text-slate-200">Select Amenities</span>
              <div className="grid grid-cols-2 gap-2">
                {AMENITIES_LIST.map((am) => (
                  <label key={am} className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-300 font-semibold text-xs">
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(am)}
                      onChange={() => handleAmenityToggle(am)}
                      className="rounded text-emerald-500 w-4 h-4 cursor-pointer focus:ring-emerald-500"
                    />
                    <span>{am}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-850 dark:text-slate-200">Detailed Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key attractions, surrounding facilities, views..."
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white resize-none"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <span className="font-extrabold text-slate-800 dark:text-slate-200 text-sm">Upload Photos</span>
            
            <div
              onClick={handleMockUpload}
              className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 bg-slate-50/50 dark:bg-slate-950/20"
            >
              <Upload className="w-10 h-10 text-slate-400 mb-3" />
              <span className="text-sm font-bold text-slate-900 dark:text-white">Click to Upload mockup photo</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">Supports PNG, JPG (maximum 5MB)</span>
            </div>

            {mockUploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {mockUploadedImages.map((img, idx) => (
                  <div key={idx} className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0">
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label className="font-extrabold text-slate-850 dark:text-slate-200 text-sm">
                {purpose === "rent" ? "Monthly Rent (Rupees) *" : "Total Price (Rupees) *"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder={purpose === "rent" ? "e.g. 15000" : "e.g. 7500000"}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-emerald-500 text-slate-900 dark:text-white"
                />
                <IndianRupee className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-slate-400" />
              </div>
              <span className="text-[10px] text-slate-500 font-medium italic mt-0.5">
                {price && (
                  <>
                    Formatted Price:{" "}
                    <span className="font-bold text-emerald-500">
                      {purpose === "rent"
                        ? `₹${parseInt(price).toLocaleString("en-IN")} / mo`
                        : parseInt(price) >= 10000000
                        ? `₹${(parseInt(price) / 10000000).toFixed(2)} Crore`
                        : `₹${(parseInt(price) / 100000).toFixed(2)} Lakh`}
                    </span>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 text-sm font-semibold text-slate-700 dark:text-slate-300"
          >
            <h3 className="font-bold text-base text-slate-950 dark:text-white mb-2 uppercase tracking-wide">Recap Details</h3>
            <div className="grid grid-cols-2 gap-4 bg-slate-50 dark:bg-slate-950/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-800/80">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Purpose</span>
                <span className="text-slate-900 dark:text-white font-bold capitalize">{purpose === "rent" ? "For Rent" : "For Sale"}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Property Type</span>
                <span className="text-slate-900 dark:text-white font-bold">{type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Location</span>
                <span className="text-slate-900 dark:text-white font-bold truncate">{locality}, {city}</span>
              </div>
              {(type !== "Industrial Plot" && type !== "Agricultural Land") && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-slate-400 uppercase">BHK Layout</span>
                  <span className="text-slate-900 dark:text-white font-bold">{bhk} BHK</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Super Area</span>
                <span className="text-slate-900 dark:text-white font-bold">{size} sq.ft.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-slate-400 uppercase">Pricing</span>
                <span className="text-emerald-500 font-extrabold">
                  {price && (
                    <>
                      {purpose === "rent" || purpose === "lease"
                        ? `₹${parseInt(price).toLocaleString("en-IN")} / mo`
                        : parseInt(price) >= 10000000
                        ? `₹${(parseInt(price) / 10000000).toFixed(2)} Crore`
                        : `₹${(parseInt(price) / 100000).toFixed(2)} Lakh`}
                    </>
                  )}
                </span>
              </div>
            </div>
            
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed italic mt-2">
              By submitting this property, you certify that all information details are correct. Listing will go live instantly.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <div className="text-left mb-6">
              <h2 className="text-xl font-serif font-black text-indigo">Create New Property Listing</h2>
              <p className="text-xs text-charcoal/50 mt-1">
                Fill in details to post a new listing directly into the active Rajasthan database.
              </p>
            </div>

            <StepProgress currentStep={currentStep} steps={STEPS} />

            <form onSubmit={handleSubmit} className="bg-white border border-sand rounded-3xl p-6 shadow-sm flex flex-col gap-6 mt-4">
              <div className="min-h-[260px]">{renderStepContent()}</div>

              <div className="flex items-center justify-between pt-6 border-t border-sand mt-4">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-5 py-2.5 rounded-xl border border-sand text-charcoal text-xs font-bold hover:bg-sand/10 disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {currentStep === STEPS.length - 1 ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/10 transition-all duration-200 cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Submit & Publish</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo hover:bg-indigo-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-splash"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl bg-cream border border-sand shadow-sm max-w-xl mx-auto"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-6 shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <h2 className="font-serif font-black text-2xl text-indigo mb-2">Property Listed Successfully!</h2>
            <p className="text-xs text-charcoal/65 max-w-sm leading-relaxed mb-8 font-semibold">
              The property has been added directly to the database and is now live.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
              <button
                type="button"
                onClick={onSuccess}
                className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-xs rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                Go to Properties List
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 border border-sand bg-white text-charcoal font-bold text-xs rounded-xl hover:bg-sand/15 transition-colors cursor-pointer"
              >
                Add Another Property
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
