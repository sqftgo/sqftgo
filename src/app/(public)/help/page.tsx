"use client";

import React, { useState } from "react";
import { HelpCircle, Search, Mail, Phone, MessageSquare, ChevronDown, CheckCircle2, LifeBuoy } from "lucide-react";

interface FaqItem {
  q: string;
  a: string;
  category: "booking" | "verification" | "listings" | "finance";
}

export default function HelpCenterPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<"all" | "booking" | "verification" | "listings">("all");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const faqs: FaqItem[] = [
    {
      category: "booking",
      q: "How do I schedule a physical visit to a heritage villa?",
      a: "Browse any active listing on our platform and click on the 'Book Tour' or 'Submit Enquiry' button. Select a convenient date and time. Our verified brokers will confirm the schedule within 2 hours, and you will receive an SMS and an email confirmation."
    },
    {
      category: "verification",
      q: "What does the 'RERA Approved' badge represent?",
      a: "Every listing displaying the 'RERA Approved' badge has been verified against the Rajasthan Real Estate Regulatory Authority database. This ensures clean titles, structural vetting, and clearance from municipal property taxes."
    },
    {
      category: "listings",
      q: "How do I list my own property on Sun Valley?",
      a: "If you are a builder, developer, or certified broker, you can register a business account. Once registered, navigate to the 'Add Property Listing' form on your dashboard, input RERA registration numbers, attach photographs, and submit. The admin team will review and publish it within 24 hours."
    },
    {
      category: "booking",
      q: "Can I reschedule or cancel a booked site visit?",
      a: "Yes. Navigate to 'My Visits' from your account dropdown, find the scheduled tour card, and click 'Reschedule' or 'Cancel Tour'. There are no cancellation fees."
    },
    {
      category: "verification",
      q: "What documents are required for heritage deed verification?",
      a: "We verify title deeds, ancestral registry logs, tax clearance receipts, and utility connections. Our in-house legal team ensures there are no disputes or pending litigation on listed havelis."
    },
    {
      category: "listings",
      q: "Is listing a property free for individual owners?",
      a: "Yes, individual owners can list up to 2 properties for free. Premium subscriptions are available for agency brokers looking to list multiple projects and access advanced lead analytics."
    }
  ];

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.q.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          faq.a.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-indigo text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-indigo/20 z-50 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hero Header */}
      <div className="text-center py-8 mb-8 bg-indigo/5 rounded-3xl border border-indigo/5 px-6">
        <LifeBuoy className="w-10 h-10 text-indigo mx-auto mb-4 animate-sway-slow" />
        <h1 className="text-3xl font-serif font-black text-charcoal">How can we help you?</h1>
        <p className="text-charcoal/50 text-sm font-semibold mt-1.5">Search our knowledge base or get in touch with our support team</p>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto relative mt-6">
          <Search className="absolute left-4 top-3.5 w-4 h-4 text-charcoal/30" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search FAQs, verification guidelines, booking policies..."
            className="w-full bg-white border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 pl-11 rounded-2xl focus:outline-none shadow-sm transition-all"
          />
        </div>
      </div>

      {/* Contact Channels Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {[
          { icon: Phone, title: "Call Support", desc: "Mon-Sat, 9AM to 7PM", detail: "+91 94140 SVREPL", action: () => triggerToast("Broker hotline is online. Dialling...") },
          { icon: Mail, title: "Email Broker Desk", desc: "Average response: 2 hrs", detail: "desk@svrepl.com", action: () => triggerToast("Opening email client draft to desk@svrepl.com...") },
          { icon: MessageSquare, title: "Chat Broker", desc: "Available 24/7", detail: "Live Chat Agent", action: () => triggerToast("Connecting to live support broker agent...") }
        ].map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={item.action}
              className="bg-white border border-indigo/10 rounded-2xl p-5 text-left hover:shadow-md hover:border-indigo/25 transition-all cursor-pointer flex flex-col items-start"
            >
              <div className="p-2.5 bg-indigo/5 text-indigo rounded-xl mb-3 shrink-0">
                <Icon className="w-4 h-4" />
              </div>
              <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">{item.title}</p>
              <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">{item.desc}</p>
              <p className="text-xs text-indigo font-bold mt-2.5">{item.detail}</p>
            </button>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-indigo/5">
          <h2 className="text-lg font-serif font-black text-charcoal flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo/60" />
            <span>Frequently Asked Questions</span>
          </h2>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: "all", label: "All" },
              { id: "booking", label: "Bookings" },
              { id: "verification", label: "Verification" },
              { id: "listings", label: "Listings" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategory(cat.id as any); setOpenFaqIndex(null); }}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all ${
                  activeCategory === cat.id ? "bg-indigo text-white shadow-sm" : "bg-sand/30 text-charcoal/50 hover:text-charcoal"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredFaqs.length === 0 ? (
          <div className="text-center py-10 bg-white border border-indigo/10 rounded-3xl">
            <HelpCircle className="w-10 h-10 text-indigo/25 mx-auto mb-3" />
            <p className="text-charcoal/50 text-xs font-bold">No questions found matching your search.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white border border-indigo/10 rounded-2xl overflow-hidden shadow-sm transition-all"
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left font-bold text-xs text-charcoal/80 hover:text-indigo transition-all cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-charcoal/30 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-indigo" : ""
                    }`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs font-medium text-charcoal/60 leading-relaxed border-t border-indigo/5 pt-3 bg-sand/5">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
