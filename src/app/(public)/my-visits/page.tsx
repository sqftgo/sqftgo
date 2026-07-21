"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Calendar, MapPin, Phone, User, Clock, CheckCircle2, ChevronRight } from "lucide-react";
import { Badge, ConfirmDialog, EmptyState } from "@/components/ui";

interface Visit {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyImage: string;
  locality: string;
  city: string;
  date: string;
  time: string;
  brokerName: string;
  brokerPhone: string;
  status: "Confirmed" | "Pending Approval" | "Completed";
}

export default function MyVisitsPage() {
  const { isLoggedIn } = useApp();
  const [activeTab, setActiveTab] = useState<"upcoming" | "past">("upcoming");
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [pendingCancelId, setPendingCancelId] = useState<string | null>(null);

  // Mock visits list
  const [visits, setVisits] = useState<Visit[]>([
    {
      id: "v-1",
      propertyId: "prop-1",
      propertyTitle: "Ultra Luxury Lake-Facing Villa",
      propertyImage: "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80",
      locality: "Lake Palace Road",
      city: "Udaipur",
      date: "2026-07-26",
      time: "11:00 AM",
      brokerName: "Rajesh Mehta",
      brokerPhone: "+91 98290 12345",
      status: "Confirmed"
    },
    {
      id: "v-2",
      propertyId: "prop-2",
      propertyTitle: "Premium 3 BHK Flat in C-Scheme",
      propertyImage: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80",
      locality: "C-Scheme",
      city: "Jaipur",
      date: "2026-07-30",
      time: "04:30 PM",
      brokerName: "Amit Sharma",
      brokerPhone: "+91 98290 98765",
      status: "Pending Approval"
    },
    {
      id: "v-3",
      propertyId: "prop-3",
      propertyTitle: "Modern 2 BHK Fully Furnished Flat",
      propertyImage: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=600&q=80",
      locality: "Fatehsagar Lake",
      city: "Udaipur",
      date: "2026-07-10",
      time: "10:00 AM",
      brokerName: "Rajesh Mehta",
      brokerPhone: "+91 98290 12345",
      status: "Completed"
    }
  ]);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleCancelVisit = (id: string) => {
    setPendingCancelId(id);
  };

  const confirmCancelVisit = () => {
    if (!pendingCancelId) return;
    setVisits((prev) => prev.filter((v) => v.id !== pendingCancelId));
    setPendingCancelId(null);
    triggerToast("Property visit cancelled successfully.");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-xl">
          <Calendar className="w-14 h-14 text-indigo/30 mx-auto mb-5" />
          <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Sign In Required</h1>
          <p className="text-charcoal/50 text-sm font-semibold mb-6">Please login to view your scheduled visits.</p>
          <Link href="/login" className="block w-full py-3 bg-indigo text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  const upcomingVisits = visits.filter(v => v.status !== "Completed");
  const pastVisits = visits.filter(v => v.status === "Completed");
  const displayVisits = activeTab === "upcoming" ? upcomingVisits : pastVisits;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-indigo text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-indigo/20 z-50 text-xs font-bold">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-serif font-black text-charcoal">My Property Visits</h1>
          <p className="text-charcoal/50 text-sm font-semibold mt-1">Schedule and view your tours with our verified brokers</p>
        </div>
        
        {/* Tab Selector */}
        <div className="flex bg-sand/30 border border-indigo/5 p-1 rounded-2xl self-start sm:self-center">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "upcoming" ? "bg-white text-indigo shadow-sm" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Upcoming Tours
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "past" ? "bg-white text-indigo shadow-sm" : "text-charcoal/50 hover:text-charcoal"
            }`}
          >
            Past Tours
          </button>
        </div>
      </div>

      {displayVisits.length === 0 ? (
        <EmptyState
          title="No scheduled visits found here."
          description="Browse listings to book a property tour with a verified broker."
          icon={<Calendar className="w-12 h-12 text-indigo/25" />}
        >
          <Link
            href="/listings"
            className="inline-block px-6 py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors shadow"
          >
            Browse Properties & Book a Tour
          </Link>
        </EmptyState>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayVisits.map((visit) => (
            <div key={visit.id} className="bg-white border border-indigo/10 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Badge status={visit.status}>{visit.status}</Badge>
                  <div className="flex items-center gap-1.5 text-xs text-charcoal/40 font-bold">
                    <Clock className="w-3.5 h-3.5 text-indigo/50" />
                    <span>{visit.time}</span>
                  </div>
                </div>

                {/* Property Detail Row */}
                <div className="flex gap-4 mb-5">
                  <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-indigo/5">
                    <img src={visit.propertyImage} alt={visit.propertyTitle} className="w-full h-full object-cover" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-charcoal truncate leading-snug">{visit.propertyTitle}</h3>
                    <div className="flex items-center gap-1 mt-1 text-charcoal/50">
                      <MapPin className="w-3 h-3 text-terracotta" />
                      <span className="text-[10px] font-semibold truncate">{visit.locality}, {visit.city}</span>
                    </div>
                  </div>
                </div>

                {/* Visit Logistics Details */}
                <div className="space-y-2.5 bg-sand/20 border border-sand/30 rounded-2xl p-4 mb-4">
                  <div className="flex items-center gap-3 text-xs font-bold text-charcoal/70">
                    <Calendar className="w-4 h-4 text-indigo/50" />
                    <span>Scheduled for: {new Date(visit.date).toLocaleDateString("en-IN", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-charcoal/70">
                    <User className="w-4 h-4 text-indigo/50" />
                    <span>Broker Host: {visit.brokerName}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-charcoal/70">
                    <Phone className="w-4 h-4 text-indigo/50" />
                    <span>Contact: {visit.brokerPhone}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {visit.status !== "Completed" ? (
                <div className="flex gap-3 pt-3 border-t border-indigo/5">
                  <button
                    onClick={() => triggerToast(`Contacted ${visit.brokerName} to request a reschedule.`)}
                    className="flex-1 py-2.5 text-center bg-sand hover:bg-sand/80 text-charcoal text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Reschedule
                  </button>
                  <button
                    onClick={() => handleCancelVisit(visit.id)}
                    className="flex-1 py-2.5 text-center border border-rose-200 text-rose-500 hover:bg-rose-50 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                  >
                    Cancel Tour
                  </button>
                </div>
              ) : (
                <Link
                  href={`/property/${visit.propertyId}`}
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-indigo/5 hover:bg-indigo/10 text-indigo text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                >
                  <span>View Property Again</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={Boolean(pendingCancelId)}
        onClose={() => setPendingCancelId(null)}
        onConfirm={confirmCancelVisit}
        title="Cancel visit?"
        description="Are you sure you want to cancel this scheduled property visit?"
        confirmLabel="Cancel Tour"
        tone="danger"
      />
    </div>
  );
}
