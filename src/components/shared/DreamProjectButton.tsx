"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, X, ChevronRight, ChevronLeft, Upload, Check, 
  Home, MapPin, Building2, Wallet, CalendarDays, UploadCloud 
} from "lucide-react";
import StepProgress from "@/components/ui/StepProgress";

const STEPS = [
  "Basic Details",
  "Location & Budget",
  "Home Requirements",
  "Amenities & Lifestyle",
  "Dream Description",
  "Inspiration & Submit"
];

const PROPERTY_TYPES = ["Apartment", "Villa", "Independent House", "Farmhouse", "Penthouse", "Plot/Land", "Commercial Space", "Other"];
const WHO_LIVES = ["Just Me", "Couple", "Small Family", "Large Family", "Investment Purpose", "Rental Property"];
const WHEN_BUY = ["Immediately", "Within 3 Months", "Within 6 Months", "Within 1 Year", "Just Exploring"];
const BUDGETS = ["Under ₹50 Lakhs", "₹50 Lakhs – ₹1 Crore", "₹1 Crore – ₹2 Crore", "₹2 Crore – ₹5 Crore", "Above ₹5 Crore", "Not Sure Yet"];
const BEDROOMS = ["1 BHK", "2 BHK", "3 BHK", "4 BHK", "5+ BHK"];
const SIZES = ["Under 800 sq. ft.", "800–1200 sq. ft.", "1200–1800 sq. ft.", "1800–2500 sq. ft.", "Above 2500 sq. ft.", "Not Sure"];
const STYLES = ["Modern", "Luxury", "Minimalist", "Traditional", "Contemporary", "Eco-Friendly", "Not Sure"];
const AMENITIES = ["Swimming Pool", "Gym", "Garden", "Children's Play Area", "Clubhouse", "Walking Track", "Sports Court", "Pet-Friendly Area", "Smart Home Features", "EV Charging", "24×7 Security", "Parking", "Lift", "Power Backup"];
const FEATURES = ["Large Balcony", "Modular Kitchen", "Walk-in Closet", "Home Office", "Study Room", "Private Garden", "Terrace", "Home Theatre", "Smart Home Automation", "Spacious Living Room", "Extra Storage"];
const MATTERS_MOST = ["Location", "Budget", "Safety", "Schools Nearby", "Public Transport", "Investment Value", "Peaceful Neighborhood", "Luxury Lifestyle", "Green Spaces", "Shopping Nearby", "Hospitals Nearby"];

export default function DreamProjectButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  // Form State
  const [formData, setFormData] = useState({
    propertyType: "",
    whoWillLive: "",
    whenPlanning: "",
    alreadyOwn: "",
    needFinancing: "",
    country: "India",
    city: "",
    area: "",
    landmarks: "",
    budget: "",
    bedrooms: "",
    size: "",
    style: "",
    amenities: [] as string[],
    features: [] as string[],
    mattersMost: [] as string[],
    description: "",
    files: [] as File[],
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  const updateForm = (key: string, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const toggleArrayItem = (key: 'amenities' | 'features' | 'mattersMost', value: string, max?: number) => {
    setFormData(prev => {
      const current = prev[key];
      if (current.includes(value)) {
        return { ...prev, [key]: current.filter(item => item !== value) };
      } else {
        if (max && current.length >= max) return prev;
        return { ...prev, [key]: [...current, value] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < STEPS.length - 1) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (currentStep > 0) setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Dream Project Submitted! We will contact you soon.");
    setIsOpen(false);
  };

  if (!mounted) return null;

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 sm:bottom-8 sm:right-8">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo hover:bg-[#122849] text-white rounded-full shadow-[0_8px_30px_rgba(27,56,100,0.3)] hover:shadow-[0_8px_40px_rgba(27,56,100,0.4)] border border-white/10 hover:-translate-y-1 transition-all duration-300 group flex items-center gap-3 py-3.5 px-6"
          aria-label="Plan Dream Project"
        >
          <Building2 className="w-4 h-4 text-gold group-hover:scale-110 transition-transform duration-300" />
          <span className="font-sans font-bold text-sm tracking-wide">
            Plan Your Dream
          </span>
        </button>
      </div>

      {/* Swipe-up Modal / Bottom Sheet */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex justify-start p-0">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Side Drawer Content */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-full sm:w-[450px] md:w-[600px] lg:w-[700px] h-full overflow-y-auto bg-cream shadow-2xl flex flex-col"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 z-10 rounded-full bg-black/5 hover:bg-black/10 transition-colors text-charcoal/70"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Decorative Backgrounds */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-[250px] h-[250px] bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="p-6 sm:p-8 flex-1 flex flex-col relative z-10">
                
                {/* Header */}
                <div className="mb-8">
                  <div className="flex items-center gap-2 px-2.5 py-1 rounded-md bg-terracotta/10 border border-terracotta/20 text-terracotta text-[9px] font-extrabold tracking-widest uppercase mb-3 w-fit">
                    <Sparkles className="w-3 h-3" />
                    <span>Vision Board</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-indigo mb-2 flex items-center gap-2 font-serif">
                    Your Dream Project
                  </h2>
                  <p className="text-charcoal/70 text-xs sm:text-sm">
                    Tell us what you&apos;re looking for, and our experts will help you find or build the perfect property.
                  </p>
                </div>

                {/* Stepper Component */}
                <div className="mb-6 -mx-2">
                  <StepProgress currentStep={currentStep} steps={STEPS} />
                </div>

                {/* Form Content Area */}
                <div className="flex-1 flex flex-col">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="flex-1"
                    >
                      {/* --- STEP 1: Basic Details --- */}
                      {currentStep === 0 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <Home className="w-5 h-5 text-terracotta" />
                            Basic Details
                          </h3>
                          
                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">1. What type of property are you dreaming of?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {PROPERTY_TYPES.map(type => (
                                <button
                                  key={type}
                                  onClick={() => updateForm('propertyType', type)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.propertyType === type 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {type}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">2. Who will live in this property?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {WHO_LIVES.map(who => (
                                <button
                                  key={who}
                                  onClick={() => updateForm('whoWillLive', who)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.whoWillLive === who 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {who}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">3. When are you planning to buy?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {WHEN_BUY.map(when => (
                                <button
                                  key={when}
                                  onClick={() => updateForm('whenPlanning', when)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.whenPlanning === when 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {when}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2">
                            <div className="space-y-3">
                              <label className="text-xs sm:text-sm font-bold text-charcoal block">4. Do you already own a property?</label>
                              <div className="flex gap-4">
                                {['Yes', 'No'].map(opt => (
                                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="alreadyOwn" 
                                      checked={formData.alreadyOwn === opt}
                                      onChange={() => updateForm('alreadyOwn', opt)}
                                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta focus:ring-terracotta border-sand" 
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-charcoal/80">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                            <div className="space-y-3">
                              <label className="text-xs sm:text-sm font-bold text-charcoal block">5. Do you need help with financing?</label>
                              <div className="flex gap-4">
                                {['Yes', 'No', 'Maybe Later'].map(opt => (
                                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                                    <input 
                                      type="radio" 
                                      name="needFinancing" 
                                      checked={formData.needFinancing === opt}
                                      onChange={() => updateForm('needFinancing', opt)}
                                      className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-terracotta focus:ring-terracotta border-sand" 
                                    />
                                    <span className="text-xs sm:text-sm font-semibold text-charcoal/80">{opt}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 2: Location & Budget --- */}
                      {currentStep === 1 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-terracotta" />
                            Location & Budget
                          </h3>

                          <div className="space-y-4">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">Where would you like your dream property to be?</label>
                            <div className="grid grid-cols-1 gap-4">
                              <div className="flex gap-4">
                                <input 
                                  type="text" 
                                  placeholder="Country" 
                                  value={formData.country}
                                  onChange={(e) => updateForm('country', e.target.value)}
                                  className="w-1/3 px-3 py-2.5 rounded-xl bg-white border border-sand focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all text-sm font-medium"
                                />
                                <input 
                                  type="text" 
                                  placeholder="Preferred City" 
                                  value={formData.city}
                                  onChange={(e) => updateForm('city', e.target.value)}
                                  className="w-2/3 px-3 py-2.5 rounded-xl bg-white border border-sand focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all text-sm font-medium"
                                />
                              </div>
                              <input 
                                type="text" 
                                placeholder="Preferred Area or Locality" 
                                value={formData.area}
                                onChange={(e) => updateForm('area', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-sand focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all text-sm font-medium"
                              />
                              <input 
                                type="text" 
                                placeholder="Nearby landmarks or preferences" 
                                value={formData.landmarks}
                                onChange={(e) => updateForm('landmarks', e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl bg-white border border-sand focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all text-sm font-medium"
                              />
                            </div>
                          </div>

                          <div className="space-y-4 pt-4">
                            <label className="text-xs sm:text-sm font-bold text-charcoal flex items-center gap-2">
                              <Wallet className="w-4 h-4 text-terracotta" />
                              What is your budget?
                            </label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {BUDGETS.map(budget => (
                                <button
                                  key={budget}
                                  onClick={() => updateForm('budget', budget)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.budget === budget 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {budget}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 3: Home Requirements --- */}
                      {currentStep === 2 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <Building2 className="w-5 h-5 text-terracotta" />
                            Home Requirements
                          </h3>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">How many bedrooms do you need?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {BEDROOMS.map(bed => (
                                <button
                                  key={bed}
                                  onClick={() => updateForm('bedrooms', bed)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.bedrooms === bed 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {bed}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">What size are you looking for?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {SIZES.map(size => (
                                <button
                                  key={size}
                                  onClick={() => updateForm('size', size)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.size === size 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {size}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">Which style do you prefer?</label>
                            <div className="flex flex-wrap gap-2 sm:gap-3">
                              {STYLES.map(style => (
                                <button
                                  key={style}
                                  onClick={() => updateForm('style', style)}
                                  className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
                                    formData.style === style 
                                      ? "bg-terracotta text-white border-terracotta shadow-md" 
                                      : "bg-sand/30 text-charcoal/70 border-sand hover:border-terracotta/50"
                                  }`}
                                >
                                  {style}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 4: Amenities & Lifestyle --- */}
                      {currentStep === 3 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-terracotta" />
                            Amenities & Lifestyle
                          </h3>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">
                              Which amenities are important to you? <span className="text-charcoal/50 font-medium ml-1">(Select all that apply)</span>
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {AMENITIES.map(amenity => (
                                <label key={amenity} className={`flex items-center gap-2 p-2.5 rounded-xl border cursor-pointer transition-all ${
                                  formData.amenities.includes(amenity) ? "bg-terracotta/5 border-terracotta text-indigo" : "bg-white border-sand hover:border-terracotta/30 text-charcoal/70"
                                }`}>
                                  <div className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center transition-colors ${
                                    formData.amenities.includes(amenity) ? "bg-terracotta border-terracotta" : "border-sand/80 bg-sand/20"
                                  }`}>
                                    {formData.amenities.includes(amenity) && <Check className="w-2.5 h-2.5 text-white" />}
                                  </div>
                                  <span className="text-[10px] sm:text-[11px] font-semibold select-none leading-tight">{amenity}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">
                              What features would you love inside your home?
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {FEATURES.map(feature => (
                                <button
                                  key={feature}
                                  onClick={() => toggleArrayItem('features', feature)}
                                  className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all border ${
                                    formData.features.includes(feature) 
                                      ? "bg-indigo text-white border-indigo" 
                                      : "bg-white text-charcoal/70 border-sand hover:border-indigo/30"
                                  }`}
                                >
                                  {formData.features.includes(feature) ? "✓ " : "+ "}{feature}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">
                              What matters most when choosing a property? <span className="text-terracotta ml-1">(Choose up to 3)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                              {MATTERS_MOST.map(matter => {
                                const isSelected = formData.mattersMost.includes(matter);
                                const isMaxReached = !isSelected && formData.mattersMost.length >= 3;
                                return (
                                  <button
                                    key={matter}
                                    onClick={() => toggleArrayItem('mattersMost', matter, 3)}
                                    disabled={isMaxReached}
                                    className={`px-2.5 py-1 rounded-full text-[10px] sm:text-[11px] font-semibold transition-all border ${
                                      isSelected 
                                        ? "bg-terracotta text-white border-terracotta shadow-sm" 
                                        : isMaxReached 
                                          ? "bg-sand/20 text-charcoal/30 border-sand/50 cursor-not-allowed"
                                          : "bg-white text-charcoal/70 border-sand hover:border-terracotta/30"
                                    }`}
                                  >
                                    {isSelected ? "★ " : ""}{matter}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* --- STEP 5: Dream Description --- */}
                      {currentStep === 4 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <CalendarDays className="w-5 h-5 text-terracotta" />
                            Tell us about your dream home
                          </h3>

                          <div className="space-y-3">
                            <label className="text-xs sm:text-sm font-bold text-charcoal block">
                              In your own words, what does your perfect property look like?
                            </label>
                            <textarea
                              rows={8}
                              value={formData.description}
                              onChange={(e) => updateForm('description', e.target.value)}
                              placeholder='Example: "I want a modern 3 BHK villa with a large garden, lots of natural light, a home office, and a peaceful neighborhood close to good schools..."'
                              className="w-full px-4 py-3 rounded-2xl bg-white border border-sand focus:ring-2 focus:ring-terracotta/50 focus:border-terracotta outline-none transition-all text-xs sm:text-sm font-medium resize-none shadow-sm"
                            />
                          </div>
                        </div>
                      )}

                      {/* --- STEP 6: Inspiration & Submit --- */}
                      {currentStep === 5 && (
                        <div className="space-y-6">
                          <h3 className="text-xl font-serif font-black text-indigo flex items-center gap-2">
                            <UploadCloud className="w-5 h-5 text-terracotta" />
                            Upload Inspiration <span className="text-xs sm:text-sm font-sans font-medium text-charcoal/50">(Optional)</span>
                          </h3>

                          <p className="text-xs sm:text-sm font-medium text-charcoal/70">
                            Have photos, floor plans, or Pinterest boards? Upload them here to give us a better idea of your style.
                          </p>

                          <div className="w-full h-40 border-2 border-dashed border-sand hover:border-terracotta/50 bg-sand/10 rounded-2xl flex flex-col items-center justify-center gap-2.5 transition-colors cursor-pointer group">
                            <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                              <Upload className="w-4 h-4 text-terracotta" />
                            </div>
                            <div className="text-center">
                              <span className="text-xs sm:text-sm font-bold text-indigo block">Click to upload or drag and drop</span>
                              <span className="text-[10px] sm:text-xs text-charcoal/50 font-medium">SVG, PNG, JPG or PDF (max. 10MB)</span>
                            </div>
                          </div>

                          <div className="bg-terracotta/5 border border-terracotta/20 rounded-2xl p-4 mt-4">
                            <h4 className="font-bold text-xs sm:text-sm text-indigo mb-1">Ready to submit?</h4>
                            <p className="text-[11px] sm:text-xs text-charcoal/70">
                              Our concierge team will review your requirements and reach out within 24 hours with curated property matches.
                            </p>
                          </div>
                        </div>
                      )}

                    </motion.div>
                  </AnimatePresence>
                </div>

                {/* Footer / Controls */}
                <div className="pt-6 mt-6 border-t border-sand flex items-center justify-between">
                  <button
                    onClick={prevStep}
                    className={`flex items-center gap-1.5 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                      currentStep === 0 
                        ? "opacity-0 pointer-events-none" 
                        : "bg-white border border-sand text-charcoal hover:bg-sand/30 hover:border-terracotta/30"
                    }`}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </button>

                  {currentStep < STEPS.length - 1 ? (
                    <button
                      onClick={nextStep}
                      className="flex items-center gap-1.5 px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Next Step
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={handleSubmit}
                      className="flex items-center gap-1.5 px-5 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-indigo hover:bg-[#122849] text-white font-bold text-xs sm:text-sm shadow-md transition-all hover:shadow-lg hover:-translate-y-0.5"
                    >
                      Submit
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  )}
                </div>

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
