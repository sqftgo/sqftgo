"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { MessageSquare, MapPin, ArrowRight } from "lucide-react";

export default function MyInquiriesPage() {
  const { isLoggedIn, userEmail, properties, inquiries } = useApp();

  const myInquiries = useMemo(() =>
    properties.flatMap(p =>
      (inquiries[p.id] || [])
        .filter(i => i.email === userEmail)
        .map(i => ({ ...i, propertyTitle: p.title, propertyImage: p.images?.[0], propId: p.id, locality: p.locality, city: p.city }))
    ).sort((a, b) => b.date.localeCompare(a.date)),
    [properties, inquiries, userEmail]
  );

  if (!isLoggedIn) return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center p-8">
        <MessageSquare className="w-14 h-14 text-indigo/20 mx-auto mb-4" />
        <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Sign In Required</h1>
        <Link href="/login" className="inline-block mt-3 px-6 py-3 bg-indigo text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors">Sign In</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-black text-charcoal mb-2">My Inquiries</h1>
      <p className="text-charcoal/50 text-sm font-semibold mb-8">{myInquiries.length} messages sent to dealers</p>
      {myInquiries.length === 0 ? (
        <div className="text-center py-16">
          <MessageSquare className="w-12 h-12 text-indigo/20 mx-auto mb-4" />
          <p className="text-charcoal/50 font-semibold">No inquiries sent yet.</p>
          <Link href="/listings" className="inline-block mt-4 text-indigo text-sm font-bold hover:underline">Browse Properties →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {myInquiries.map((inq, i) => (
            <div key={i} className="bg-white/80 border border-indigo/10 rounded-2xl p-5 shadow hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 shrink-0">
                  <img src={inq.propertyImage} alt="" className="w-full h-full object-cover" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between flex-wrap gap-2">
                    <div>
                      <p className="text-[10px] font-black text-indigo/60 uppercase tracking-wider">Property Inquiry</p>
                      <p className="text-sm font-bold text-charcoal mt-0.5">{inq.propertyTitle}</p>
                      <div className="flex items-center gap-1 mt-0.5"><MapPin className="w-3 h-3 text-charcoal/30" /><p className="text-[10px] text-charcoal/50">{inq.locality}, {inq.city}</p></div>
                    </div>
                    <span className="text-[9px] text-charcoal/30 font-semibold">{inq.date}</span>
                  </div>
                  <div className="bg-sand/30 rounded-xl p-3 mt-3">
                    <p className="text-xs text-charcoal/70 font-semibold leading-relaxed">"{inq.message}"</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex justify-end">
                <Link href={`/property/${inq.propId}`} className="flex items-center gap-1.5 text-xs text-indigo font-bold hover:underline">View Property <ArrowRight className="w-3 h-3" /></Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
