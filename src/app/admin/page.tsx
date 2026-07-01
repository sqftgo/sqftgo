"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp, Property, AssistanceRequest, GeneralEnquiry, DirectoryProfile } from "@/context/AppContext";
import {
  Building,
  Users,
  MessageSquare,
  MapPin,
  Trash2,
  CheckCircle,
  Briefcase,
  Layers,
  Phone,
  Mail,
  Globe,
  Sliders,
  LogOut,
  ShieldAlert,
  ArrowUpRight,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  HelpCircle,
  FileText,
  Plus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { PostPropertyWizard } from "@/components/admin/PostPropertyWizard";

type TabType = "overview" | "properties" | "relocation" | "enquiries" | "directory" | "post-property";

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    properties,
    setProperties,
    assistanceRequests,
    setAssistanceRequests,
    enquiries,
    setEnquiries,
    directoryProfiles,
    setDirectoryProfiles,
    isLoggedIn,
    setIsLoggedIn,
    userEmail,
    setUserEmail
  } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [propertySearch, setPropertySearch] = useState("");
  const [propertyFilterCity, setPropertyFilterCity] = useState("All");

  // Sync activeTab with URL tab parameter if valid
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam && ["overview", "properties", "relocation", "enquiries", "directory", "post-property"].includes(tabParam)) {
      setActiveTab(tabParam as TabType);
    }
  }, [searchParams]);

  const isAdmin = isLoggedIn && userEmail === "admin@svrepl.com";

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserEmail("");
    router.push("/login");
  };

  // Properties handlers
  const handlePropertyStatusChange = (id: string, newStatus: Property["status"]) => {
    setProperties((prev) =>
      prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
    );
  };

  const handleDeleteProperty = (id: string) => {
    if (confirm("Are you sure you want to delete this property listing?")) {
      setProperties((prev) => prev.filter((p) => p.id !== id));
    }
  };

  // Relocation handlers
  const handleRelocationStatusChange = (id: string, newStatus: AssistanceRequest["status"]) => {
    setAssistanceRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const handleDeleteRelocation = (id: string) => {
    if (confirm("Are you sure you want to delete this relocation request?")) {
      setAssistanceRequests((prev) => prev.filter((r) => r.id !== id));
    }
  };

  // Enquiries handlers
  const handleDeleteEnquiry = (id: string) => {
    if (confirm("Are you sure you want to delete this general enquiry?")) {
      setEnquiries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  // Directory handlers
  const handleDeleteProfile = (id: string) => {
    if (confirm("Are you sure you want to delete this directory profile?")) {
      setDirectoryProfiles((prev) => prev.filter((p) => p.id !== id));
    }
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-20 max-w-md text-center">
        <div className="bg-white border border-sand/60 rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-6">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div className="flex flex-col gap-2">
            <h1 className="font-serif font-black text-2xl text-indigo">Access Denied</h1>
            <p className="text-xs text-charcoal/60 leading-relaxed font-semibold">
              You must be authenticated with the special administrator credentials to access the real estate sourcing control panel.
            </p>
          </div>
          <div className="w-full flex flex-col gap-3">
            <Link
              href="/login?tab=login"
              className="py-3 w-full bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
            >
              <span>Authenticate as Admin</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
            <Link
              href="/"
              className="py-3 w-full border border-sand bg-white text-charcoal font-bold text-xs rounded-xl hover:bg-sand/10 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Calculate high-level stats
  const totalInquiries = Object.values(properties).reduce((acc, p) => acc + (p.inquiryCount || 0), 0);
  const pendingPropertiesCount = properties.filter((p) => p.status === "Pending Review").length;

  const filteredProperties = properties.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
                          p.locality.toLowerCase().includes(propertySearch.toLowerCase());
    const matchesCity = propertyFilterCity === "All" || p.city === propertyFilterCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-24 pt-6 text-left">
      
      {/* 1. Header Banner */}
      <div className="w-full rounded-3xl bg-indigo text-white p-6 md:p-8 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        {/* Abstract background shapes */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -left-10 w-[200px] h-[200px] bg-terracotta/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-[#ffd899] bg-white/10 w-fit">
            <span>Special Admin Sourcing Hub</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight leading-none">
            Sun Valley Command Portal
          </h1>
          <p className="text-white/70 text-xs font-semibold">
            Supervise database, update verification statuses, review general enquiries, and process concierge relocations.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/10 text-white font-bold text-xs shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Exit Dashboard</span>
        </button>
      </div>

      {/* 2. Overview Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        
        {/* Properties Stat */}
        <div className="bg-white/90 border border-sand rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-indigo/35 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Properties Listed</span>
            <div className="w-8 h-8 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center">
              <Building className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-indigo">{properties.length}</h3>
            {pendingPropertiesCount > 0 && (
              <span className="text-[9px] text-terracotta font-extrabold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-pulse" />
                <span>{pendingPropertiesCount} Pending Review</span>
              </span>
            )}
          </div>
        </div>

        {/* Relocation Concierge Stat */}
        <div className="bg-white/90 border border-sand rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-terracotta/35 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Relocation Leads</span>
            <div className="w-8 h-8 rounded-lg bg-terracotta/10 text-terracotta flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-indigo">{assistanceRequests.length}</h3>
            <span className="text-[9px] text-charcoal/40 font-bold block mt-1">Assisted Move-in Portal</span>
          </div>
        </div>

        {/* General Enquiries Stat */}
        <div className="bg-white/90 border border-sand rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-gold/50 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Active Broadcasts</span>
            <div className="w-8 h-8 rounded-lg bg-gold/10 text-gold flex items-center justify-center">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-indigo">{enquiries.length}</h3>
            <span className="text-[9px] text-charcoal/40 font-bold block mt-1">Broker Sourcing Feeds</span>
          </div>
        </div>

        {/* Verified Businesses Stat */}
        <div className="bg-white/90 border border-sand rounded-2xl p-5 shadow-sm flex flex-col justify-between h-32 relative overflow-hidden group hover:border-indigo/35 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Service Profiles</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
          </div>
          <div>
            <h3 className="text-2xl font-serif font-black text-indigo">{directoryProfiles.length}</h3>
            <span className="text-[9px] text-charcoal/40 font-bold block mt-1">Contractor Directory</span>
          </div>
        </div>

      </div>

      {/* 3. Tab Navigation Controls */}
      <div className="flex border-b border-sand mb-8 overflow-x-auto whitespace-nowrap">
        {[
          { id: "overview", label: "Overview Hub", icon: Sliders },
          { id: "properties", label: `Properties (${properties.length})`, icon: Building },
          { id: "relocation", label: `Relocation (${assistanceRequests.length})`, icon: Users },
          { id: "enquiries", label: `Enquiries (${enquiries.length})`, icon: MessageSquare },
          { id: "directory", label: `Businesses (${directoryProfiles.length})`, icon: Briefcase },
          { id: "post-property", label: "Add Listing", icon: Plus }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                router.replace(`/admin?tab=${tab.id}`);
              }}
              className={`flex items-center gap-2 px-5 py-3 border-b-2 font-bold text-xs transition-colors cursor-pointer ${
                isActive
                  ? "border-terracotta text-terracotta"
                  : "border-transparent text-charcoal/60 hover:text-charcoal"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. Tab Content Panel */}
      <div className="bg-white/95 border border-sand rounded-3xl p-6 md:p-8 shadow-sm">
        <AnimatePresence mode="wait">
          
          {/* TAB: OVERVIEW */}
          {activeTab === "overview" && (
            <motion.div
              key="overview-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-8"
            >
              {/* Sourcing Overview Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                <div className="lg:col-span-8 bg-sand/20 border border-sand rounded-2xl p-6 flex flex-col justify-between">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-serif font-black text-lg text-indigo">Database Administrative Dashboard</h3>
                    <p className="text-xs text-charcoal/65 leading-relaxed font-semibold">
                      Welcome to the Sun Valley sourcing overview panel. From here, you have root-level control over all dynamic states inside the client-side context. You can change listing status states to update validation visibility immediately.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
                    <div className="bg-white/80 border border-sand p-4 rounded-xl flex flex-col justify-between gap-1">
                      <span className="text-[9px] font-black text-charcoal/40 uppercase">Direct Client Inquiries</span>
                      <span className="text-lg font-serif font-black text-indigo">{totalInquiries} inquiries</span>
                    </div>
                    <div className="bg-white/80 border border-sand p-4 rounded-xl flex flex-col justify-between gap-1">
                      <span className="text-[9px] font-black text-charcoal/40 uppercase">Pending Listings</span>
                      <span className="text-lg font-serif font-black text-terracotta">{pendingPropertiesCount} pending</span>
                    </div>
                    <div className="bg-white/80 border border-sand p-4 rounded-xl flex flex-col justify-between gap-1">
                      <span className="text-[9px] font-black text-charcoal/40 uppercase">Mock Client State</span>
                      <span className="text-lg font-serif font-black text-emerald-600">Dynamic Context</span>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-4 bg-indigo/5 border border-indigo/10 rounded-2xl p-6 flex flex-col justify-between">
                  <h4 className="font-serif font-black text-indigo mb-2">Quick Admin Actions</h4>
                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => setActiveTab("properties")}
                      className="w-full py-2.5 px-4 bg-indigo hover:bg-[#5741e0] text-white text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Manage Listings</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab("relocation")}
                      className="w-full py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold rounded-xl flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <span>Check Relocation Leads</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setActiveTab("enquiries")}
                      className="w-full py-2.5 px-4 border border-sand bg-white text-charcoal text-xs font-bold rounded-xl flex items-center justify-between hover:bg-sand/10 transition-colors cursor-pointer"
                    >
                      <span>Review Broker Broadcasts</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === "properties" && (
            <motion.div
              key="properties-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              {/* Filters / Search */}
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-b border-sand pb-4">
                <div className="relative w-full sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Search properties..."
                    value={propertySearch}
                    onChange={(e) => setPropertySearch(e.target.value)}
                    className="w-full bg-slate-50 border border-sand rounded-xl py-2 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal"
                  />
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal/45" />
                </div>
                
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <Filter className="w-4 h-4 text-charcoal/50" />
                  <select
                    value={propertyFilterCity}
                    onChange={(e) => setPropertyFilterCity(e.target.value)}
                    className="bg-slate-50 border border-sand rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer focus:border-terracotta text-charcoal"
                  >
                    <option value="All">All Cities</option>
                    <option value="Udaipur">Udaipur</option>
                    <option value="Jaipur">Jaipur</option>
                    <option value="Jodhpur">Jodhpur</option>
                    <option value="Kota">Kota</option>
                    <option value="Bikaner">Bikaner</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Surat">Surat</option>
                    <option value="Chandigarh">Chandigarh</option>
                    <option value="Shimla">Shimla</option>
                    <option value="Dharamshala">Dharamshala</option>
                    <option value="Agra">Agra</option>
                  </select>
                </div>
              </div>

              {/* Grid listings */}
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-charcoal/80">
                  <thead className="text-[10px] uppercase bg-sand/20 border-b border-sand font-bold text-indigo">
                    <tr>
                      <th className="px-4 py-3">Property Title</th>
                      <th className="px-4 py-3">City & Locality</th>
                      <th className="px-4 py-3">Price</th>
                      <th className="px-4 py-3">Specifications</th>
                      <th className="px-4 py-3">Verification Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProperties.length > 0 ? (
                      filteredProperties.map((p) => (
                        <tr key={p.id} className="border-b border-sand/50 hover:bg-slate-50/50">
                          <td className="px-4 py-4 font-bold text-indigo max-w-[200px] truncate" title={p.title}>
                            {p.title}
                          </td>
                          <td className="px-4 py-4 font-semibold">
                            <div className="flex flex-col gap-0.5">
                              <span>{p.city}</span>
                              <span className="text-[10px] text-charcoal/40 font-mono">{p.locality}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-extrabold text-terracotta">
                            ₹{p.price.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-4 font-semibold text-charcoal/60">
                            <div className="flex flex-col gap-0.5">
                              <span>{p.bhk ? `${p.bhk} BHK` : "Plot"} | {p.type}</span>
                              <span className="text-[10px] text-indigo font-bold capitalize">{p.purpose}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold">
                            <select
                              value={p.status}
                              onChange={(e) => handlePropertyStatusChange(p.id, e.target.value as Property["status"])}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-bold outline-none cursor-pointer ${
                                p.status === "Active"
                                  ? "bg-emerald-50 border-emerald-300 text-emerald-700"
                                  : p.status === "Pending Review"
                                  ? "bg-amber-50 border-amber-300 text-amber-700"
                                  : "bg-slate-100 border-slate-300 text-slate-700"
                              }`}
                            >
                              <option value="Active">Active</option>
                              <option value="Pending Review">Pending Review</option>
                              <option value="Sold">Sold</option>
                              <option value="Rented">Rented</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteProperty(p.id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:border-red-300 bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Listing"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-charcoal/40 font-bold">
                          No matching properties found in catalog.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: RELOCATION */}
          {activeTab === "relocation" && (
            <motion.div
              key="relocation-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <h3 className="font-serif font-black text-lg text-indigo border-b border-sand pb-3">Assisted Relocation Requests</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-charcoal/80">
                  <thead className="text-[10px] uppercase bg-sand/20 border-b border-sand font-bold text-indigo">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Details</th>
                      <th className="px-4 py-3">Preferences</th>
                      <th className="px-4 py-3">Move Date</th>
                      <th className="px-4 py-3">Pipeline Status</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {assistanceRequests.length > 0 ? (
                      assistanceRequests.map((req) => (
                        <tr key={req.id} className="border-b border-sand/50 hover:bg-slate-50/50">
                          <td className="px-4 py-4 font-bold text-indigo">
                            <div className="flex flex-col gap-0.5">
                              <span>{req.name}</span>
                              <span className="text-[10px] text-charcoal/40 font-mono">{req.phone}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold text-charcoal/60">
                            <div className="flex flex-col gap-0.5">
                              <span>Email: {req.email}</span>
                              <span>Family size: {req.familySize}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold max-w-[250px]">
                            <div className="flex flex-col gap-1">
                              <span>Budget: <span className="text-indigo font-bold">{req.budget}</span></span>
                              <span className="text-[10px] text-charcoal/50 leading-normal">
                                Areas: {req.areas.join(", ")}
                              </span>
                              {req.notes && (
                                <span className="text-[10px] text-terracotta leading-normal italic">
                                  Notes: &ldquo;{req.notes}&rdquo;
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 font-bold font-mono text-indigo">
                            {req.moveInDate}
                          </td>
                          <td className="px-4 py-4 font-bold">
                            <select
                              value={req.status}
                              onChange={(e) => handleRelocationStatusChange(req.id, e.target.value as AssistanceRequest["status"])}
                              className={`rounded-lg border px-2 py-1 text-[11px] font-bold outline-none cursor-pointer ${
                                req.status === "Received"
                                  ? "bg-slate-100 border-slate-300 text-slate-700"
                                  : req.status === "Assigned to Agent"
                                  ? "bg-amber-50 border-amber-300 text-amber-700"
                                  : "bg-emerald-50 border-emerald-300 text-emerald-700"
                              }`}
                            >
                              <option value="Received">Received</option>
                              <option value="Assigned to Agent">Assigned to Agent</option>
                              <option value="Properties Suggested">Properties Suggested</option>
                            </select>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteRelocation(req.id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:border-red-300 bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Lead"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-charcoal/40 font-bold">
                          No relocation concierge requests found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: ENQUIRIES */}
          {activeTab === "enquiries" && (
            <motion.div
              key="enquiries-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <h3 className="font-serif font-black text-lg text-indigo border-b border-sand pb-3">Active Sourcing Broadcasts</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-charcoal/80">
                  <thead className="text-[10px] uppercase bg-sand/20 border-b border-sand font-bold text-indigo">
                    <tr>
                      <th className="px-4 py-3">Client</th>
                      <th className="px-4 py-3">Contact</th>
                      <th className="px-4 py-3">Location & Spec</th>
                      <th className="px-4 py-3">Remarks</th>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {enquiries.length > 0 ? (
                      enquiries.map((enq) => (
                        <tr key={enq.id} className="border-b border-sand/50 hover:bg-slate-50/50">
                          <td className="px-4 py-4 font-bold text-indigo">
                            {enq.name}
                          </td>
                          <td className="px-4 py-4 font-semibold">
                            <div className="flex flex-col gap-0.5">
                              <span>Mobile: {enq.mobile}</span>
                              <span className="text-[10px] text-charcoal/40 font-mono">{enq.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 font-semibold">
                            <div className="flex flex-col gap-0.5">
                              <span>{enq.city}</span>
                              <span className="text-[10px] text-indigo font-bold">{enq.propertyType} | {enq.budget}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-xs font-semibold text-charcoal/70 max-w-[280px]">
                            {enq.remarks}
                          </td>
                          <td className="px-4 py-4 font-bold font-mono text-indigo">
                            {enq.date}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteEnquiry(enq.id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:border-red-300 bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Broadcast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-10 text-charcoal/40 font-bold">
                          No active sourcing enquiries found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: DIRECTORY */}
          {activeTab === "directory" && (
            <motion.div
              key="directory-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <h3 className="font-serif font-black text-lg text-indigo border-b border-sand pb-3">Contractors & Builders Directory</h3>
              
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left text-charcoal/80">
                  <thead className="text-[10px] uppercase bg-sand/20 border-b border-sand font-bold text-indigo">
                    <tr>
                      <th className="px-4 py-3">Business Firm</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Address</th>
                      <th className="px-4 py-3">Communications</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {directoryProfiles.length > 0 ? (
                      directoryProfiles.map((prof) => (
                        <tr key={prof.id} className="border-b border-sand/50 hover:bg-slate-50/50">
                          <td className="px-4 py-4 font-bold text-indigo">
                            <div className="flex flex-col gap-0.5">
                              <span>{prof.firmName}</span>
                              <span className="text-[10px] text-charcoal/45 font-bold">Owner: {prof.ownerName}</span>
                            </div>
                          </td>
                          <td className="px-4 py-4">
                            <span className="text-[10px] font-bold text-terracotta bg-terracotta/5 border border-terracotta/10 px-2 py-0.5 rounded-lg">
                              {prof.category}
                            </span>
                          </td>
                          <td className="px-4 py-4 font-semibold text-charcoal/60 max-w-[200px] truncate" title={prof.address}>
                            {prof.address}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-col gap-1 font-semibold">
                              <span>Phone: {prof.mobile}</span>
                              <span>Email: {prof.email}</span>
                              {prof.website && (
                                <a 
                                  href={`https://${prof.website}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo hover:underline flex items-center gap-1 text-[10px]"
                                >
                                  <span>{prof.website}</span>
                                  <Globe className="w-3 h-3 text-indigo" />
                                </a>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-4 text-right">
                            <button
                              onClick={() => handleDeleteProfile(prof.id)}
                              className="p-1.5 rounded-lg border border-red-100 hover:border-red-300 bg-white text-red-500 hover:bg-red-50 transition-colors cursor-pointer"
                              title="Delete Profile"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center py-10 text-charcoal/40 font-bold">
                          No business service profiles registered.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* TAB: POST PROPERTY */}
          {activeTab === "post-property" && (
            <motion.div
              key="post-property-tab"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col gap-6"
            >
              <PostPropertyWizard onSuccess={() => setActiveTab("properties")} />
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-20 text-center font-bold text-charcoal/50">Loading Admin Dashboard...</div>}>
      <AdminDashboardContent />
    </Suspense>
  );
}
