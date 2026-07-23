"use client";
import React, { useMemo } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { MessageSquare, MapPin, ArrowRight } from "lucide-react";
import { EmptyState } from "@/components/ui";
import { useRouter } from "next/navigation";

export default function MyInquiriesPage() {
  const router = useRouter();
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
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <EmptyState
        title="Sign In Required"
        description="Sign in to view inquiries you’ve sent to dealers."
        actionLabel="Sign In"
        onAction={() => router.push("/login")}
        icon={<MessageSquare className="w-8 h-8" />}
      />
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-serif font-black text-charcoal mb-2">My Inquiries</h1>
      <p className="text-charcoal/50 text-sm font-semibold mb-8">{myInquiries.length} messages sent to dealers</p>
      {myInquiries.length === 0 ? (
        <EmptyState
          title="No inquiries yet"
          description="Browse listings and message dealers when you find a property you like."
          actionLabel="Browse Properties"
          onAction={() => router.push("/listings")}
          icon={<MessageSquare className="w-8 h-8" />}
        />
      ) : (
        <div className="space-y-4">
          {myInquiries.map((inq, i) => (
            <div key={i} className="bg-white/80 border border-indigo/10 rounded-2xl p-5 shadow hover:shadow-md transition-all">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-sand/30 shrink-0">
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
