"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Property, DirectoryProfile } from "@/context/AppContext";
import { 
  Building2, 
  Plus, 
  Sliders, 
  Mail, 
  Phone, 
  Globe, 
  MapPin, 
  BadgeCheck, 
  CheckCircle2, 
  MessageSquare, 
  Star, 
  Trash2, 
  Edit2, 
  ExternalLink, 
  RefreshCw, 
  X, 
  ChevronRight, 
  Send, 
  User, 
  ShieldAlert, 
  Award,
  Calendar,
  Sparkles,
  Inbox,
  LogOut,
  Search,
  Filter,
  Eye,
  EyeOff,
  Menu,
  BookOpen,
  HelpCircle,
  Map
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

const CATEGORIES = [
  "Agent & Broker",
  "Property Consultant",
  "Builder & Developer",
  "Interior Decorator",
  "Architect",
  "Building Contractor"
];

const SPECIALTIES_LIST = [
  "Heritage Havelis",
  "Lakefront Villas",
  "Agricultural Lands",
  "RERA Clearances",
  "Commercial Leases",
  "Title Checks",
  "Luxury Apartments",
  "Bungalows",
  "Plots & Land"
];

export default function DealersDashboard() {
  const router = useRouter();
  const { 
    isLoggedIn, 
    setIsLoggedIn,
    userEmail, 
    setUserEmail,
    userRole, 
    setUserRole,
    properties, 
    updateProperty,
    deleteProperty,
    inquiries, 
    deleteInquiry,
    directoryProfiles, 
    setDirectoryProfiles,
    addDirectoryProfile
  } = useApp();

  const [activeTab, setActiveTab] = useState<"dashboard" | "inbox" | "settings">("dashboard");
  const [mounted, setMounted] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Property Filters State (Mockup Style)
  const [searchQuery, setSearchQuery] = useState("");
  const [purposeFilter, setPurposeFilter] = useState<"all" | "buy" | "sell" | "rent" | "lease">("all");
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [bedsFilter, setBedsFilter] = useState<string>("All");
  const [showMapView, setShowMapView] = useState(false);

  // Onboarding Form State
  const [firmName, setFirmName] = useState("");
  const [ownerName, setOwnerName] = useState("");
  const [category, setCategory] = useState("Agent & Broker");
  const [city, setCity] = useState("Udaipur");
  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [website, setWebsite] = useState("");
  const [reraId, setReraId] = useState("");
  const [specialties, setSpecialties] = useState<string[]>([]);
  const [description, setDescription] = useState("");
  const [onboardingSuccess, setOnboardingSuccess] = useState(false);

  // Inline Editing Form State
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<Property["status"]>("Active");

  // Simulated Inquiry Reply Modal State
  const [replyingInquiry, setReplyingInquiry] = useState<{
    propId: string;
    propTitle: string;
    inquirerName: string;
    inquirerEmail: string;
    index: number;
  } | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [replySentSuccess, setReplySentSuccess] = useState(false);

  // Profile Settings Form State
  const [profileFirmName, setProfileFirmName] = useState("");
  const [profileOwnerName, setProfileOwnerName] = useState("");
  const [profileCategory, setProfileCategory] = useState("");
  const [profileAddress, setProfileAddress] = useState("");
  const [profileMobile, setProfileMobile] = useState("");
  const [profileWebsite, setProfileWebsite] = useState("");
  const [profileReraId, setProfileReraId] = useState("");
  const [profileDescription, setProfileDescription] = useState("");
  const [profileSpecialties, setProfileSpecialties] = useState<string[]>([]);
  const [profileSavedSuccess, setProfileSavedSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch the broker's directory profile
  const brokerProfile = React.useMemo(() => {
    if (!isLoggedIn || userRole !== "broker") return null;
    return directoryProfiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase()) || null;
  }, [directoryProfiles, isLoggedIn, userRole, userEmail]);

  // Sync profile editing inputs when broker profile loads
  useEffect(() => {
    if (brokerProfile) {
      setProfileFirmName(brokerProfile.firmName);
      setProfileOwnerName(brokerProfile.ownerName);
      setProfileCategory(brokerProfile.category);
      setProfileAddress(brokerProfile.address);
      setProfileMobile(brokerProfile.mobile);
      setProfileWebsite(brokerProfile.website || "");
      setProfileReraId(brokerProfile.reraId || "");
      setProfileDescription(brokerProfile.description);
      setProfileSpecialties(brokerProfile.specialties || []);
    }
  }, [brokerProfile]);

  // Filter properties belonging to this broker
  const brokerProperties = React.useMemo(() => {
    if (!isLoggedIn || !userEmail) return [];
    return properties.filter(
      p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase()
    );
  }, [properties, isLoggedIn, userEmail]);

  // Apply filters to broker properties
  const filteredProperties = React.useMemo(() => {
    return brokerProperties.filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            p.locality.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesPurpose = purposeFilter === "all" || p.purpose === purposeFilter;
      
      const matchesType = typeFilter === "All" || p.type === typeFilter;
      
      let matchesBeds = true;
      if (bedsFilter !== "All") {
        if (bedsFilter === "1 BHK") matchesBeds = p.bhk === 1;
        else if (bedsFilter === "2 BHK") matchesBeds = p.bhk === 2;
        else if (bedsFilter === "3 BHK") matchesBeds = p.bhk === 3;
        else if (bedsFilter === "4+ BHK") matchesBeds = (p.bhk || 0) >= 4;
      }
      
      return matchesSearch && matchesPurpose && matchesType && matchesBeds;
    });
  }, [brokerProperties, searchQuery, purposeFilter, typeFilter, bedsFilter]);

  // Consolidate inquiries received for this broker's properties
  const brokerInquiries = React.useMemo(() => {
    if (!isLoggedIn || brokerProperties.length === 0) return [];
    
    const list: {
      propertyId: string;
      propertyTitle: string;
      name: string;
      email: string;
      phone: string;
      message: string;
      date: string;
      index: number;
    }[] = [];

    brokerProperties.forEach(prop => {
      const propInqs = inquiries[prop.id] || [];
      propInqs.forEach((inq, idx) => {
        list.push({
          propertyId: prop.id,
          propertyTitle: prop.title,
          ...inq,
          index: idx
        });
      });
    });

    // Sort by date descending
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [inquiries, brokerProperties, isLoggedIn]);

  const handleLogoutClick = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    if (setUserRole) setUserRole(null);
    router.push("/");
  };

  if (!mounted) return null;

  // 1. Access Denied State (Not logged in)
  if (!isLoggedIn) {
    return (
      <main className="min-h-screen bg-cream pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white border border-sand rounded-[2rem] p-8 md:p-10 shadow-xl text-center"
        >
          <div className="w-16 h-16 bg-terracotta/10 rounded-2xl flex items-center justify-center text-terracotta mx-auto mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-serif font-black text-charcoal mb-3">Sign In Required</h1>
          <p className="text-charcoal/60 text-sm font-semibold mb-8 leading-relaxed">
            Please log in with your verified broker credentials to access your listings and enquiries dashboard.
          </p>
          <Link 
            href="/login?redirect=/dealers/dashboard"
            className="block w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors shadow-md shadow-indigo/20 mb-3"
          >
            Go to Login
          </Link>
          <Link 
            href="/"
            className="block w-full py-3.5 bg-white border border-sand text-charcoal/70 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-sand/20 transition-all"
          >
            Back to Home
          </Link>
        </motion.div>
      </main>
    );
  }

  // 2. Client-to-Broker Onboarding Form State (Logged in as user, not broker)
  if (userRole !== "broker" && userRole !== "admin") {
    const handleOnboardingSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!firmName || !ownerName || !address || !mobile || !description) {
        alert("Please fill in all required fields marked with *");
        return;
      }

      // Add profile
      addDirectoryProfile({
        firmName,
        ownerName,
        category: category as DirectoryProfile["category"],
        city,
        address,
        email: userEmail,
        website,
        mobile,
        description,
        reraId: reraId || undefined,
        specialties: specialties.length > 0 ? specialties : undefined,
        experience: "1+ Years",
        teamSize: 1,
        listingsCount: 0
      });

      setOnboardingSuccess(true);
      setTimeout(() => {
        setUserRole("broker");
        setOnboardingSuccess(false);
      }, 1500);
    };

    const handleSpecialtyToggle = (spec: string) => {
      setSpecialties(prev =>
        prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
      );
    };

    return (
      <main className="min-h-screen bg-cream pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="max-w-2xl w-full">
          <AnimatePresence mode="wait">
            {onboardingSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="bg-white border border-sand rounded-[2rem] p-12 text-center shadow-xl"
              >
                <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-emerald-100 animate-bounce">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-serif font-black text-charcoal mb-3">Onboarding Complete!</h2>
                <p className="text-charcoal/60 text-sm font-semibold max-w-md mx-auto">
                  Your business directory profile has been verified and registered. Setting up your custom broker dashboard command hub...
                </p>
                <div className="mt-8 flex justify-center">
                  <RefreshCw className="w-6 h-6 text-indigo animate-spin" />
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-sand rounded-[2.5rem] p-8 md:p-12 shadow-xl"
              >
                <div className="flex items-center gap-3.5 mb-6">
                  <div className="w-12 h-12 bg-indigo/5 border border-indigo/10 rounded-2xl flex items-center justify-center text-indigo">
                    <Building2 className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] text-terracotta font-black uppercase tracking-wider">Become a Partner</span>
                    <h1 className="text-2xl md:text-3xl font-serif font-black text-charcoal leading-tight">Activate Dealer Account</h1>
                  </div>
                </div>
                
                <p className="text-charcoal/65 text-xs font-semibold mb-8 leading-relaxed">
                  List and manage your property directory, respond directly to regional buyers, and verify RERA credentials on SVREPL. Complete your agency registration below.
                </p>

                <form onSubmit={handleOnboardingSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Firm Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Mewar Property Consultants" 
                      value={firmName}
                      onChange={(e) => setFirmName(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Principal Owner Name *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Vikram Singh Rathore" 
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Primary Category *</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Operations City *</label>
                    <select 
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    >
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Contact Mobile *</label>
                    <input 
                      type="tel" 
                      placeholder="e.g. +91 98290 XXXXX" 
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Office Address *</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Shobhagpura Circle, Udaipur, Rajasthan" 
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Website URL (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. www.mewarproperty.in" 
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">RERA Registration ID (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. RAJ/A/UDZ/2023/1188" 
                      value={reraId}
                      onChange={(e) => setReraId(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Specialties & Core Focus</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {SPECIALTIES_LIST.map(spec => {
                        const isSelected = specialties.includes(spec);
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => handleSpecialtyToggle(spec)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? "bg-indigo text-white border-indigo" 
                                : "bg-white text-charcoal/70 border-sand hover:border-indigo/35"
                            }`}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Agency Description *</label>
                    <textarea 
                      rows={4}
                      placeholder="Describe your services, local coverage, RERA details, history, and focus areas..." 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-cream/40 border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="col-span-2 mt-4">
                    <button
                      type="submit"
                      className="w-full py-4 bg-indigo hover:bg-indigo-hover text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo/20 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Register & Open Dashboard</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    );
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(val);
  };

  const handleEditClick = (property: Property) => {
    setEditingProperty(property);
    setEditTitle(property.title);
    setEditPrice(property.price.toString());
    setEditDescription(property.description);
    setEditStatus(property.status);
  };

  const handleEditSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProperty) return;

    updateProperty(editingProperty.id, {
      title: editTitle,
      price: parseInt(editPrice) || editingProperty.price,
      description: editDescription,
      status: editStatus
    });

    setEditingProperty(null);
  };

  const handleQuickStatusChange = (propertyId: string, newStatus: Property["status"]) => {
    updateProperty(propertyId, { status: newStatus });
  };

  const handleReplyClick = (inq: any) => {
    setReplyingInquiry({
      propId: inq.propertyId,
      propTitle: inq.propertyTitle,
      inquirerName: inq.name,
      inquirerEmail: inq.email,
      index: inq.index
    });
    setReplyMessage("");
    setReplySentSuccess(false);
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyingInquiry || !replyMessage) return;

    setReplySentSuccess(true);
    setTimeout(() => {
      deleteInquiry(replyingInquiry.propId, replyingInquiry.index);
      setReplyingInquiry(null);
      setReplySentSuccess(false);
    }, 1500);
  };

  const handleSettingsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    setDirectoryProfiles(prev =>
      prev.map(p => 
        p.email.toLowerCase() === userEmail.toLowerCase()
          ? {
              ...p,
              firmName: profileFirmName,
              ownerName: profileOwnerName,
              category: profileCategory as DirectoryProfile["category"],
              address: profileAddress,
              mobile: profileMobile,
              website: profileWebsite,
              reraId: profileReraId || undefined,
              specialties: profileSpecialties,
              description: profileDescription
            }
          : p
      )
    );

    setProfileSavedSuccess(true);
    setTimeout(() => {
      setProfileSavedSuccess(false);
    }, 2000);
  };

  const handleProfileSpecialtyToggle = (spec: string) => {
    setProfileSpecialties(prev =>
      prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec]
    );
  };

  // Sender initials / placeholder avatar mapping
  const getMockAvatar = (name: string) => {
    const letters = name.split(" ").map(w => w.charAt(0)).join("").toUpperCase().slice(0, 2);
    // Unsplash faces linked to mock senders
    if (name.includes("Suresh")) return "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80";
    if (name.includes("Aishwarya")) return "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80";
    if (name.includes("Ramesh")) return "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80";
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6851f5&color=fff&bold=true`;
  };

  return (
    <div className="min-h-screen bg-[#f8f9fa] flex flex-col lg:flex-row select-none text-charcoal">
      
      {/* MOBILE HEADER BAR */}
      <div className="lg:hidden w-full bg-[#161618] px-5 py-4 flex items-center justify-between text-white border-b border-white/5 z-20">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-logo text-lg leading-none text-indigo">Sun Valley</span>
        </Link>
        <button 
          onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          className="p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
        >
          <Menu className="w-5.5 h-5.5" />
        </button>
      </div>

      {/* LEFT DARK SIDEBAR - Mockup Design */}
      <aside className={`fixed inset-y-0 left-0 w-64 xl:w-72 bg-[#161618] text-white flex flex-col py-8 z-30 transition-transform duration-300 lg:translate-x-0 ${
        isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      }`}>
        {/* Mobile Close Button */}
        <button 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 p-1 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-4.5 h-4.5" />
        </button>

        {/* Dealer Profile Information */}
        <div className="flex flex-col items-center px-6 mb-10 text-center shrink-0">
          <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-indigo/25 mb-4 relative shadow-lg">
            <img 
              src="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=256&h=256&q=80" 
              alt="Dealer Representative Profile"
              className="w-full h-full object-cover"
            />
          </div>
          <h3 className="font-serif font-black text-base tracking-tight leading-snug">
            {brokerProfile?.ownerName || "Rajesh Mehta"}
          </h3>
          <span className="text-[10px] text-white/50 font-bold uppercase tracking-wider mt-1 block">
            {brokerProfile?.firmName || "Lake City Brokerage"}
          </span>
          <span className="text-[9px] text-[#5741e0] bg-[#5741e0]/10 border border-[#5741e0]/20 px-2 py-0.5 rounded mt-2 uppercase font-black tracking-widest">
            {brokerProfile?.category || "Verified Broker"}
          </span>
        </div>

        {/* Sidebar Nav Links */}
        <nav className="flex-1 px-4 flex flex-col gap-1 overflow-y-auto no-scrollbar">
          <button
            onClick={() => { setActiveTab("dashboard"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dashboard"
                ? "bg-[#252528] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Sliders className={`w-4 h-4 ${activeTab === "dashboard" ? "text-indigo" : "text-white/40"}`} />
              <span>Dashboard</span>
            </div>
            {activeTab === "dashboard" && (
              <span className="w-1.5 h-1.5 bg-[#5741e0] rounded-full" />
            )}
          </button>

          <button
            onClick={() => { setActiveTab("inbox"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "inbox"
                ? "bg-[#252528] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <Mail className={`w-4 h-4 ${activeTab === "inbox" ? "text-indigo" : "text-white/40"}`} />
              <span>Inbox</span>
            </div>
            {brokerInquiries.length > 0 ? (
              <span className="bg-terracotta text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center shrink-0">
                {brokerInquiries.length}
              </span>
            ) : activeTab === "inbox" ? (
              <span className="w-1.5 h-1.5 bg-[#5741e0] rounded-full" />
            ) : null}
          </button>

          <button
            onClick={() => { setActiveTab("settings"); setIsMobileSidebarOpen(false); }}
            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#252528] text-white"
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <User className={`w-4 h-4 ${activeTab === "settings" ? "text-indigo" : "text-white/40"}`} />
              <span>Settings</span>
            </div>
            {activeTab === "settings" && (
              <span className="w-1.5 h-1.5 bg-[#5741e0] rounded-full" />
            )}
          </button>

          {/* Help & Support option */}
          <button
            onClick={() => alert("Sun Valley Broker Support Line is active at support@svrepl.com")}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-bold text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer mt-auto"
          >
            <HelpCircle className="w-4 h-4 text-white/40" />
            <span>Help & Support</span>
          </button>
        </nav>

        {/* Logout Section */}
        <div className="px-4 mt-4 shrink-0">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-xs font-extrabold text-rose-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all cursor-pointer text-left"
          >
            <LogOut className="w-4 h-4 text-rose-500/80" />
            <span>Log Out</span>
          </button>
        </div>
      </aside>

      {/* Backdrop overlay for mobile sidebar */}
      {isMobileSidebarOpen && (
        <div 
          onClick={() => setIsMobileSidebarOpen(false)}
          className="lg:hidden fixed inset-0 bg-charcoal/50 backdrop-blur-xs z-25"
        />
      )}

      {/* MAIN RIGHT PANEL */}
      <main className="flex-1 lg:pl-64 xl:pl-72 flex flex-col min-h-screen">
        
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6">
          
          {/* HEADER ROW - Purpose Tabs & Map View Toggle */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-b border-sand pb-4">
            
            {/* Segmented Controller (Buy / Sell / Rent / Lease) */}
            <div className="flex gap-2 bg-[#f1f1e9]/60 p-1.5 rounded-2xl border border-sand/40 max-w-full overflow-x-auto no-scrollbar">
              <button
                onClick={() => setPurposeFilter("all")}
                className={`px-5 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  purposeFilter === "all"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-charcoal/60 hover:text-indigo hover:bg-[#faf8f5]/40"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setPurposeFilter("buy")}
                className={`px-5 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  purposeFilter === "buy"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-charcoal/60 hover:text-indigo hover:bg-[#faf8f5]/40"
                }`}
              >
                Buy (Sale)
              </button>
              <button
                onClick={() => setPurposeFilter("rent")}
                className={`px-5 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  purposeFilter === "rent"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-charcoal/60 hover:text-indigo hover:bg-[#faf8f5]/40"
                }`}
              >
                Rent
              </button>
              <button
                onClick={() => setPurposeFilter("lease")}
                className={`px-5 py-2 text-xs font-black rounded-xl uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
                  purposeFilter === "lease"
                    ? "bg-indigo text-white shadow-sm"
                    : "text-charcoal/60 hover:text-indigo hover:bg-[#faf8f5]/40"
                }`}
              >
                Lease
              </button>
            </div>

            {/* Map View Toggle Switch */}
            <div className="flex items-center gap-3 shrink-0 self-end sm:self-auto select-none">
              <span className="text-xs font-bold text-charcoal/60">Map View</span>
              <button
                onClick={() => setShowMapView(!showMapView)}
                className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none cursor-pointer ${
                  showMapView ? "bg-indigo" : "bg-sand"
                }`}
              >
                <motion.div
                  layout
                  className="absolute left-0.5 top-0.5 bg-white w-5 h-5 rounded-full shadow-sm"
                  animate={{ x: showMapView ? 20 : 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            
            {/* VIEW TAB 1: MAIN DASHBOARD HUB */}
            {activeTab === "dashboard" && (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                {/* FILTER ROW & SEARCH BAR */}
                <div className="flex flex-col xl:flex-row gap-4 justify-between items-stretch xl:items-center">
                  
                  {/* Results Count Summary */}
                  <div className="flex items-baseline gap-2 shrink-0">
                    <span className="text-2xl font-serif font-black text-charcoal">
                      {filteredProperties.length} Results
                    </span>
                    <span className="text-xs text-charcoal/50 font-bold uppercase tracking-wider">
                      (out of {brokerProperties.length} total)
                    </span>
                  </div>

                  {/* Filter and Search controls */}
                  <div className="flex flex-wrap xl:flex-nowrap gap-3 items-center flex-1 max-w-full justify-end">
                    
                    {/* Search Bar */}
                    <div className="relative flex-1 min-w-[200px] max-w-md">
                      <input
                        type="text"
                        placeholder="Search listings..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-sand focus:border-indigo px-4 py-2.5 pl-10 rounded-xl text-xs font-semibold focus:outline-none shadow-sm"
                      />
                      <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-charcoal/30" />
                    </div>

                    {/* Beds Filter Segment */}
                    <select
                      value={bedsFilter}
                      onChange={(e) => setBedsFilter(e.target.value)}
                      className="bg-white border border-sand focus:border-indigo px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none shadow-sm cursor-pointer"
                    >
                      <option value="All">Beds: All</option>
                      <option value="1 BHK">1 BHK</option>
                      <option value="2 BHK">2 BHK</option>
                      <option value="3 BHK">3 BHK</option>
                      <option value="4+ BHK">4+ BHK</option>
                    </select>

                    {/* Property Type Filter Segment */}
                    <select
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="bg-white border border-sand focus:border-indigo px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none shadow-sm cursor-pointer"
                    >
                      <option value="All">Type: All</option>
                      <option value="Villa">Villas</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Home">Homes</option>
                      <option value="Office Space">Offices</option>
                      <option value="Shop">Shops</option>
                      <option value="Agricultural Land">Lands</option>
                    </select>

                    {/* Orange List Property Action */}
                    <Link
                      href="/post-property"
                      className="px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white font-extrabold text-xs uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo/25 flex items-center justify-center gap-2 shrink-0"
                    >
                      <Plus className="w-4 h-4 text-white" />
                      <span>List Property</span>
                    </Link>
                  </div>
                </div>

                {/* DOUBLE COLUMN GRID: GRID LISTINGS (LEFT) & RECENT MESSAGES/MAP (RIGHT) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left listings list (7 lg cols or 12 full cols if map toggled) */}
                  <div className={`flex flex-col gap-6 ${showMapView ? "lg:col-span-6" : "lg:col-span-8"}`}>
                    
                    {filteredProperties.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {filteredProperties.map(prop => (
                          <motion.div
                            key={prop.id}
                            layoutId={prop.id}
                            className="bg-white rounded-3xl border border-sand hover:border-indigo/20 shadow-sm overflow-hidden flex flex-col group relative"
                          >
                            {/* Card Image Area */}
                            <div className="aspect-[4/3] bg-sand overflow-hidden relative border-b border-sand">
                              <img
                                src={prop.images?.[0] || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80"}
                                alt={prop.title}
                                className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-500"
                              />
                              
                              {/* Purpose Tag */}
                              <span className="absolute top-3 left-3 bg-[#161618]/80 backdrop-blur-xs text-white text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md">
                                {prop.purpose === "buy" || prop.purpose === "sell" ? "For Sale" : prop.purpose === "rent" ? "For Rent" : "For Lease"}
                              </span>

                              {/* Quick Edit Overlay Actions */}
                              <div className="absolute inset-0 bg-[#161618]/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                <Link
                                  href={`/property/${prop.id}`}
                                  target="_blank"
                                  className="p-3 bg-white hover:bg-indigo hover:text-white rounded-full text-charcoal shadow-lg transition-colors cursor-pointer"
                                  title="View on site"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Link>
                                <button
                                  onClick={() => handleEditClick(prop)}
                                  className="p-3 bg-white hover:bg-indigo hover:text-white rounded-full text-charcoal shadow-lg transition-colors cursor-pointer"
                                  title="Edit listing"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (confirm("Are you sure you want to delete this property listing?")) {
                                      deleteProperty(prop.id);
                                    }
                                  }}
                                  className="p-3 bg-white hover:bg-rose-500 hover:text-white rounded-full text-charcoal shadow-lg transition-colors cursor-pointer"
                                  title="Delete listing"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Card Details Area */}
                            <div className="p-5 flex flex-col flex-1">
                              
                              {/* Price */}
                              <div className="text-indigo font-serif font-black text-lg mb-1 flex items-baseline justify-between">
                                <span>{formatCurrency(prop.price)}</span>
                                {prop.purpose === "rent" && <span className="text-[10px] font-bold text-charcoal/40 font-sans">/ month</span>}
                              </div>

                              {/* Title */}
                              <h3 className="font-serif font-black text-charcoal text-sm line-clamp-1 mb-2">
                                {prop.title}
                              </h3>

                              {/* Address */}
                              <div className="flex items-start gap-1.5 text-[11px] font-bold text-charcoal/50 mb-4 mt-auto">
                                <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                                <span className="line-clamp-1">{prop.locality}, {prop.city}</span>
                              </div>

                              {/* Status Quick Switcher footer */}
                              <div className="border-t border-sand/55 pt-3.5 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase text-charcoal/30 tracking-widest">
                                  Status
                                </span>
                                
                                <select
                                  value={prop.status}
                                  onChange={(e) => handleQuickStatusChange(prop.id, e.target.value as Property["status"])}
                                  className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-md border focus:outline-none bg-white cursor-pointer ${
                                    prop.status === "Active" 
                                      ? "text-emerald-700 border-emerald-200 bg-emerald-50/50" 
                                      : prop.status === "Pending Review" 
                                      ? "text-amber-700 border-amber-200 bg-amber-50/50" 
                                      : "text-indigo border-indigo/20 bg-indigo/5"
                                  }`}
                                >
                                  <option value="Active">Active</option>
                                  <option value="Pending Review">Pending Review</option>
                                  <option value="Sold">Sold</option>
                                  <option value="Rented">Rented</option>
                                </select>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-white border border-sand rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-charcoal/30 mx-auto mb-4 border border-sand/40">
                          <Building2 className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-serif font-black text-charcoal mb-1">No Matching Listings</h3>
                        <p className="text-charcoal/50 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                          Try adjusting your filters, beds settings, or search query to find your listings.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right Widgets: Map (if toggled) and Recent Messages */}
                  <div className={`flex flex-col gap-6 ${
                    showMapView 
                      ? "lg:col-span-6" 
                      : "lg:col-span-4"
                  }`}>
                    
                    {/* Simulated Map View Card (mockup style) */}
                    {showMapView && (
                      <div className="bg-white border border-sand rounded-3xl p-5 shadow-sm overflow-hidden flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-black uppercase tracking-wider text-charcoal/40">Map Grid Preview</span>
                          <span className="text-[10px] font-black text-indigo uppercase">{filteredProperties.length} Plotted</span>
                        </div>
                        
                        {/* Stylized custom SVG map */}
                        <div className="aspect-[4/3] bg-sand/30 rounded-2xl border border-sand/40 overflow-hidden relative">
                          <div className="absolute inset-0 bg-[#e5e9f0]/40 pointer-events-none" />
                          
                          {/* Custom grid roads */}
                          <svg className="absolute inset-0 w-full h-full text-white" stroke="currentColor" strokeWidth="3">
                            <line x1="0" y1="50" x2="400" y2="50" />
                            <line x1="0" y1="120" x2="400" y2="120" />
                            <line x1="0" y1="220" x2="400" y2="220" />
                            <line x1="100" y1="0" x2="100" y2="300" />
                            <line x1="280" y1="0" x2="280" y2="300" />
                          </svg>

                          {/* Plotted property pins */}
                          {filteredProperties.map((prop, idx) => {
                            // Pseudo-random coordinates based on ID
                            const xVal = 30 + ((prop.id.charCodeAt(prop.id.length - 1) * 7) % 70);
                            const yVal = 30 + ((prop.id.charCodeAt(prop.id.length - 2) * 5) % 65);
                            return (
                              <motion.div
                                key={`pin-${prop.id}`}
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: idx * 0.05 }}
                                className="absolute w-5.5 h-5.5 -ml-2.5 -mt-2.5 cursor-pointer z-10 flex items-center justify-center group"
                                style={{ left: `${xVal}%`, top: `${yVal}%` }}
                                title={prop.title}
                              >
                                <div className="absolute w-3 h-3 bg-indigo/30 rounded-full animate-ping" />
                                <MapPin className="w-5 h-5 text-indigo filter drop-shadow-md group-hover:scale-120 transition-transform" />
                                
                                {/* Hover tooltip */}
                                <div className="absolute bottom-6 bg-[#161618] text-white text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded shadow-md hidden group-hover:block whitespace-nowrap">
                                  {prop.locality} • {formatCurrency(prop.price)}
                                </div>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Recent Messages Widget (matches mockup exactly) */}
                    <div className="bg-white border border-sand rounded-3xl p-5 shadow-sm flex flex-col gap-4">
                      <div className="flex justify-between items-center">
                        <h3 className="font-serif font-black text-sm text-charcoal">Recent Messages</h3>
                        <span className="bg-terracotta/10 text-terracotta text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">
                          {brokerInquiries.length} New
                        </span>
                      </div>
                      
                      {brokerInquiries.length > 0 ? (
                        <div className="flex flex-col gap-3.5">
                          {brokerInquiries.slice(0, 5).map((inq, index) => (
                            <div 
                              key={`${inq.propertyId}-${index}`}
                              onClick={() => handleReplyClick(inq)}
                              className="flex gap-3.5 items-start p-2 rounded-2xl hover:bg-cream/30 border border-transparent hover:border-sand/40 cursor-pointer transition-all duration-200"
                            >
                              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 relative border border-sand">
                                <img 
                                  src={getMockAvatar(inq.name)} 
                                  alt={inq.name} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0 text-left">
                                <div className="flex justify-between items-center mb-0.5">
                                  <span className="text-xs font-extrabold text-charcoal truncate">
                                    {inq.name}
                                  </span>
                                  <span className="text-[8px] font-bold text-charcoal/40">
                                    {inq.date}
                                  </span>
                                </div>
                                <p className="text-[10px] font-semibold text-charcoal/45 uppercase tracking-wide truncate mb-1">
                                  Ref: {inq.propertyTitle}
                                </p>
                                <p className="text-xs font-semibold text-charcoal/70 line-clamp-1">
                                  {inq.message}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-6 text-center text-xs font-semibold text-charcoal/40">
                          No messages received.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* VIEW TAB 2: INBOX OVERVIEW */}
            {activeTab === "inbox" && (
              <motion.div
                key="inbox-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-6"
              >
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-serif font-black text-charcoal">Messages Inbox</h2>
                  <span className="bg-terracotta text-white font-black text-[9px] w-5 h-5 rounded-full flex items-center justify-center">
                    {brokerInquiries.length}
                  </span>
                </div>

                {brokerInquiries.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {brokerInquiries.map((inq, index) => (
                      <div
                        key={`${inq.propertyId}-${index}`}
                        className="bg-white border border-sand rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden text-left"
                      >
                        <div className="absolute top-0 left-0 w-1 h-full bg-indigo" />
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center mb-4">
                          <div className="flex gap-3.5 items-center">
                            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-sand">
                              <img src={getMockAvatar(inq.name)} alt={inq.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                              <h4 className="text-sm font-extrabold text-charcoal">{inq.name}</h4>
                              <div className="flex flex-wrap gap-x-3 text-[10px] font-bold text-charcoal/50 mt-0.5">
                                <span>{inq.email}</span>
                                <span>•</span>
                                <span>{inq.phone}</span>
                              </div>
                            </div>
                          </div>

                          <span className="text-[10px] font-bold text-charcoal/40 bg-[#faf8f5] border border-sand/40 px-2.5 py-1 rounded-xl">
                            {inq.date}
                          </span>
                        </div>

                        <div className="bg-[#faf8f5] p-4 rounded-xl border border-sand/45 mb-4 text-xs">
                          <span className="text-[8px] font-black text-indigo uppercase tracking-wider block mb-1">Listing Reference</span>
                          <span className="font-extrabold text-charcoal block mb-2">{inq.propertyTitle}</span>
                          <p className="text-charcoal/80 font-semibold leading-relaxed">"{inq.message}"</p>
                        </div>

                        <div className="flex justify-end gap-3 pt-3 border-t border-sand/30">
                          <button
                            onClick={() => {
                              if (confirm("Are you sure you want to dismiss this inquiry?")) {
                                deleteInquiry(inq.propertyId, inq.index);
                              }
                            }}
                            className="px-4 py-2 text-xs font-bold text-charcoal/50 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            Dismiss
                          </button>
                          <button
                            onClick={() => handleReplyClick(inq)}
                            className="px-5 py-2 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Reply</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white border border-sand rounded-3xl p-16 text-center shadow-sm">
                    <div className="w-16 h-16 bg-sand rounded-2xl flex items-center justify-center text-charcoal/30 mx-auto mb-4 border border-sand/40">
                      <Inbox className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-serif font-black text-charcoal mb-1">No Messages</h3>
                    <p className="text-charcoal/50 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                      All caught up! Customer inquiries submitted for your property listings will arrive here.
                    </p>
                  </div>
                )}
              </motion.div>
            )}

            {/* VIEW TAB 3: PROFILE SETTINGS */}
            {activeTab === "settings" && (
              <motion.div
                key="settings-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-sand rounded-3xl p-6 sm:p-8 shadow-sm text-left"
              >
                <h2 className="text-lg font-serif font-black text-indigo mb-6">
                  Directory Profile & settings
                </h2>

                <form onSubmit={handleSettingsSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {profileSavedSuccess && (
                    <div className="col-span-2 bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-3.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your profile settings were saved successfully!</span>
                    </div>
                  )}

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Firm Name *</label>
                    <input 
                      type="text" 
                      value={profileFirmName}
                      onChange={(e) => setProfileFirmName(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Principal Agent/Owner *</label>
                    <input 
                      type="text" 
                      value={profileOwnerName}
                      onChange={(e) => setProfileOwnerName(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Primary Category *</label>
                    <select 
                      value={profileCategory}
                      onChange={(e) => setProfileCategory(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none cursor-pointer"
                    >
                      {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Mobile Contact *</label>
                    <input 
                      type="tel" 
                      value={profileMobile}
                      onChange={(e) => setProfileMobile(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">RERA Registration ID</label>
                    <input 
                      type="text" 
                      value={profileReraId}
                      onChange={(e) => setProfileReraId(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Office Address *</label>
                    <input 
                      type="text" 
                      value={profileAddress}
                      onChange={(e) => setProfileAddress(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Website URL</label>
                    <input 
                      type="text" 
                      value={profileWebsite}
                      onChange={(e) => setProfileWebsite(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    />
                  </div>

                  <div className="flex flex-col gap-2.5 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">Core Specialties</label>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {SPECIALTIES_LIST.map(spec => {
                        const isSelected = profileSpecialties.includes(spec);
                        return (
                          <button
                            key={spec}
                            type="button"
                            onClick={() => handleProfileSpecialtyToggle(spec)}
                            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all border ${
                              isSelected 
                                ? "bg-indigo text-white border-indigo shadow-sm" 
                                : "bg-white text-charcoal/70 border-sand hover:border-indigo/35"
                            }`}
                          >
                            {spec}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 col-span-2">
                    <label className="text-xs font-extrabold text-indigo uppercase">About the Firm *</label>
                    <textarea 
                      rows={4}
                      value={profileDescription}
                      onChange={(e) => setProfileDescription(e.target.value)}
                      className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-3 rounded-xl text-sm font-semibold text-charcoal focus:outline-none resize-none"
                      required
                    />
                  </div>

                  <div className="col-span-2 mt-4 text-right">
                    <button
                      type="submit"
                      className="px-8 py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo/20 cursor-pointer"
                    >
                      Save Settings
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* EDIT LISTING INLINE MODAL OVERLAY */}
      <AnimatePresence>
        {editingProperty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditingProperty(null)}
              className="absolute inset-0 bg-[#161618]/45 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-sand shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-left"
            >
              <button 
                onClick={() => setEditingProperty(null)}
                className="absolute top-4 right-4 p-2 text-charcoal/40 hover:text-charcoal hover:bg-sand/35 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-serif font-black text-indigo mb-5 flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-terracotta" />
                <span>Edit Property Listing</span>
              </h3>

              <form onSubmit={handleEditSave} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo tracking-wider">Property Title</label>
                  <input 
                    type="text" 
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo tracking-wider">Price (Rupees)</label>
                  <input 
                    type="number" 
                    value={editPrice}
                    onChange={(e) => setEditPrice(e.target.value)}
                    className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo tracking-wider">Listing Status</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as Property["status"])}
                    className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal focus:outline-none cursor-pointer"
                  >
                    <option value="Active">Active</option>
                    <option value="Pending Review">Pending Review</option>
                    <option value="Sold">Sold</option>
                    <option value="Rented">Rented</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black uppercase text-indigo tracking-wider">Description</label>
                  <textarea 
                    rows={4}
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal focus:outline-none resize-none"
                    required
                  />
                </div>

                <div className="flex gap-3 justify-end mt-4">
                  <button
                    type="button"
                    onClick={() => setEditingProperty(null)}
                    className="px-4 py-2.5 text-xs font-bold text-charcoal/50 hover:bg-sand/35 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-md shadow-indigo/10 cursor-pointer"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* SIMULATED REPLY MODAL OVERLAY */}
      <AnimatePresence>
        {replyingInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setReplyingInquiry(null)}
              className="absolute inset-0 bg-[#161618]/45 backdrop-blur-xs"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg bg-white rounded-3xl border border-sand shadow-2xl p-6 sm:p-8 overflow-hidden z-10 text-left"
            >
              <button 
                onClick={() => setReplyingInquiry(null)}
                className="absolute top-4 right-4 p-2 text-charcoal/40 hover:text-charcoal hover:bg-sand/35 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-xl font-serif font-black text-indigo mb-1 flex items-center gap-2">
                <Mail className="w-5 h-5 text-terracotta" />
                <span>Simulate Inquiry Reply</span>
              </h3>
              <p className="text-[10px] text-charcoal/50 font-bold tracking-widest uppercase mb-6">
                Draft message to {replyingInquiry.inquirerName}
              </p>

              <form onSubmit={handleSendReply} className="flex flex-col gap-4">
                {replySentSuccess ? (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-5 rounded-2xl text-center flex flex-col items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-8 h-8 text-emerald-600" />
                    <span className="text-xs font-bold">Reply Sent Successfully!</span>
                    <span className="text-[10px] opacity-75">Marking inquiry as resolved. Closing window...</span>
                  </motion.div>
                ) : (
                  <>
                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-[9px] font-black text-indigo uppercase">Recipient</span>
                      <span className="font-bold text-charcoal">{replyingInquiry.inquirerName} ({replyingInquiry.inquirerEmail})</span>
                    </div>

                    <div className="flex flex-col gap-1 text-xs">
                      <span className="text-[9px] font-black text-indigo uppercase">Subject</span>
                      <span className="font-bold text-charcoal">Re: Inquiry about "{replyingInquiry.propTitle}"</span>
                    </div>

                    <div className="flex flex-col gap-1.5 mt-2">
                      <label className="text-[9px] font-black uppercase text-indigo tracking-wider">Reply message</label>
                      <textarea 
                        rows={5}
                        placeholder={`Dear ${replyingInquiry.inquirerName},\n\nThank you for contacting Sun Valley Real Estate regarding our villa on Lake Palace Road. I would be happy to host you for a viewing this Sunday...`}
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        className="bg-[#f8f9fa] border border-sand focus:border-indigo px-4 py-2.5 rounded-xl text-sm font-semibold text-charcoal focus:outline-none resize-none"
                        required
                      />
                    </div>

                    <div className="flex gap-3 justify-end mt-4">
                      <button
                        type="button"
                        onClick={() => setReplyingInquiry(null)}
                        className="px-4 py-2.5 text-xs font-bold text-charcoal/50 hover:bg-sand/35 rounded-xl transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-extrabold uppercase tracking-widest rounded-xl transition-all shadow-md shadow-indigo/10 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send Reply</span>
                      </button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
