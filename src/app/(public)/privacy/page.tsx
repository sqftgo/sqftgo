"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Lock,
  Eye,
  FileText,
  ArrowLeft,
  Mail,
  Phone,
  Database,
  UserCheck,
  Cookie,
  RefreshCw,
  ChevronRight,
} from "lucide-react";

const SECTIONS = [
  { id: "information-collected", label: "Information We Collect", icon: Eye, number: "01" },
  { id: "data-protection", label: "How We Protect Your Data", icon: Lock, number: "02" },
  { id: "data-sharing", label: "Data Sharing & Vetting", icon: UserCheck, number: "03" },
  { id: "cookies", label: "Cookies & Tracking", icon: Cookie, number: "04" },
  { id: "data-retention", label: "Data Retention", icon: Database, number: "05" },
  { id: "your-rights", label: "Your Rights", icon: RefreshCw, number: "06" },
  { id: "contact", label: "Contact Privacy Officer", icon: Mail, number: "07" },
];

export default function PrivacyPage() {
  const [activeId, setActiveId] = useState("information-collected");

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { rootMargin: "-20% 0px -70% 0px" }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <main className="min-h-screen bg-cream">
      {/* ── Hero Banner ── */}
      <div className="relative bg-indigo overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(210,105,30,0.25)_0%,_transparent_65%)] pointer-events-none" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(255,255,255,0.06)_0%,_transparent_60%)] pointer-events-none" />
        {/* decorative rings */}
        <div className="absolute -right-24 -top-24 w-96 h-96 rounded-full border border-white/5" />
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full border border-white/5" />

        <div className="container mx-auto px-6 md:px-10 max-w-7xl pt-36 pb-16 relative z-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white font-bold text-xs uppercase tracking-widest mb-8 transition-colors group"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Home
          </Link>

          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center shrink-0 shadow-inner backdrop-blur-sm">
              <ShieldCheck className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-terracotta text-[10px] font-black uppercase tracking-widest mb-2">Legal Document</p>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                Privacy Policy
              </h1>
              <p className="text-white/45 text-xs font-bold uppercase tracking-widest mt-3">
                Last Updated: July 7, 2026 &nbsp;·&nbsp; SqftGo Real Estate Marketplace
              </p>
            </div>
          </div>

          {/* Quick stat chips */}
          <div className="flex flex-wrap gap-3 mt-10">
            {["SSL / TLS Encrypted", "RERA Compliant", "No Ad Networks", "Data on Request"].map((chip) => (
              <span
                key={chip}
                className="px-3.5 py-1.5 rounded-full bg-white/8 border border-white/12 text-white/70 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
              >
                {chip}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Body: sidebar + content ── */}
      <div className="container mx-auto px-6 md:px-10 max-w-7xl py-14">
        <div className="flex flex-col lg:flex-row gap-10 items-start">

          {/* ── Sticky Sidebar TOC ── */}
          <aside className="lg:sticky lg:top-28 w-full lg:w-72 shrink-0 flex flex-col gap-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-charcoal/35 mb-2 px-1">On This Page</p>
            {SECTIONS.map(({ id, label, icon: Icon, number }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-left text-xs font-bold transition-all cursor-pointer ${
                  activeId === id
                    ? "bg-indigo text-white shadow-md shadow-indigo/20"
                    : "bg-white border border-sand text-charcoal/70 hover:border-indigo/30 hover:text-indigo hover:bg-indigo/3"
                }`}
              >
                <span className={`text-[10px] font-black tabular-nums w-6 shrink-0 ${activeId === id ? "text-white/50" : "text-terracotta"}`}>
                  {number}
                </span>
                <Icon className={`w-3.5 h-3.5 shrink-0 ${activeId === id ? "text-white/70" : "text-charcoal/40"}`} />
                <span className="truncate">{label}</span>
                {activeId === id && <ChevronRight className="w-3.5 h-3.5 ml-auto shrink-0 text-white/50" />}
              </button>
            ))}

            {/* Companion CTA */}
            <div className="mt-6 bg-white border border-sand rounded-2xl p-5 text-left">
              <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-2">Also Read</p>
              <Link
                href="/terms"
                className="flex items-center gap-2 text-xs font-bold text-indigo hover:text-terracotta transition-colors"
              >
                <FileText className="w-3.5 h-3.5 shrink-0" />
                Terms of Service →
              </Link>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* 01 */}
            <Section id="information-collected" number="01" title="Information We Collect" icon={Eye}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                At SqftGo, we collect information to provide better services to all our users. The types of personal information we collect include:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { title: "Personal Identifiers", desc: "Name, email, phone number and login credentials submitted during sign-up or enquiry forms." },
                  { title: "Usage Details", desc: "Interactions with listings, favourite saves, searches, view history and relocation forms." },
                  { title: "Professional Details", desc: "License numbers, firm name, website and office address for verified brokers in our directory." },
                ].map((item) => (
                  <div key={item.title} className="p-4 rounded-2xl bg-indigo/3 border border-indigo/10 flex flex-col gap-2">
                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo">{item.title}</span>
                    <p className="text-xs text-charcoal/60 leading-relaxed font-medium">{item.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 02 */}
            <Section id="data-protection" number="02" title="How We Protect Your Data" icon={Lock}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                Your security is our priority. We implement modern, high-grade technical and organizational safeguards to ensure data safety:
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "All search logs, database endpoints and profile data transmissions are secured under encrypted SSL / TLS channels.",
                  "Escrow tokens and verified title deed documents are stored in secure cloud containers accessible only to authorized RERA vetting coordinators.",
                  "We never sell or distribute your private search budget profiles or relocation details to third-party advertising networks.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal/70 font-medium">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-600" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 03 */}
            <Section id="data-sharing" number="03" title="Data Sharing & Vetting" icon={UserCheck}>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                When you submit a contact request to an Agent, Broker, or Builder in our Directory, we share your submitted name, phone number, and email address with that partner solely to facilitate the transaction.
              </p>
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 font-semibold leading-relaxed flex items-start gap-3">
                <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Important:</strong> We vet all listed partners and ensure they adhere to strict RERA compliance guidelines, but recommend checking direct credential profiles before signing deeds.
                </span>
              </div>
            </Section>

            {/* 04 */}
            <Section id="cookies" number="04" title="Cookies & Tracking" icon={Cookie}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                We use strictly necessary cookies to maintain session integrity and performance cookies to understand how visitors engage with our listings. We do not use cross-site tracking or fingerprinting technologies.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Essential Cookies", desc: "Required for authentication, session management and security.", badge: "Always Active", color: "emerald" },
                  { label: "Analytics Cookies", desc: "Aggregate page views and listing interaction data. Opt-out available.", badge: "Optional", color: "amber" },
                ].map((c) => (
                  <div key={c.label} className="p-4 rounded-2xl bg-white border border-sand flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-black text-indigo">{c.label}</span>
                      <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        c.color === "emerald" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
                      }`}>{c.badge}</span>
                    </div>
                    <p className="text-[11px] text-charcoal/60 leading-relaxed font-medium">{c.desc}</p>
                  </div>
                ))}
              </div>
            </Section>

            {/* 05 */}
            <Section id="data-retention" number="05" title="Data Retention" icon={Database}>
              <p className="text-charcoal/70 leading-relaxed">
                We retain personal data only for as long as necessary to fulfil the purpose for which it was collected, comply with applicable Indian data protection laws, and resolve disputes or enforce our agreements. Inquiry records are purged after 24 months of inactivity. Dealer accounts are archived for 5 years post-termination in compliance with RERA audit requirements. You may request earlier deletion at any time by contacting our privacy desk.
              </p>
            </Section>

            {/* 06 */}
            <Section id="your-rights" number="06" title="Your Rights" icon={RefreshCw}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                As a user of SqftGo, you retain the following data rights which you may exercise at any time by contacting our privacy officer:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {["Access Your Data", "Correct Inaccuracies", "Request Deletion", "Withdraw Consent", "Data Portability", "Raise a Complaint"].map((right) => (
                  <div key={right} className="flex items-center gap-2 p-3 rounded-xl bg-white border border-sand text-xs font-bold text-charcoal/80 hover:border-terracotta/30 transition-colors">
                    <ChevronRight className="w-3.5 h-3.5 text-terracotta shrink-0" />
                    {right}
                  </div>
                ))}
              </div>
            </Section>

            {/* 07 */}
            <Section id="contact" number="07" title="Contact Privacy Officer" icon={Mail}>
              <p className="text-charcoal/70 leading-relaxed mb-6">
                For any questions regarding your data logs, cookies management, or requests to purge your profile records from our databases, please contact our data safety coordinators:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Department", value: "SQFTGO Privacy & Security Desk", icon: ShieldCheck },
                  { label: "Email", value: "privacy@sqftgo.com", icon: Mail },
                  { label: "Phone", value: "+91 98290 55555", icon: Phone },
                ].map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="flex items-start gap-3 p-4 rounded-2xl bg-white border border-sand">
                      <div className="w-8 h-8 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-indigo" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/40">{item.label}</span>
                        <span className="text-xs font-bold text-indigo truncate">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Section>

          </div>
        </div>
      </div>
    </main>
  );
}

/* ── Reusable Section wrapper ── */
function Section({
  id, number, title, icon: Icon, children,
}: {
  id: string; number: string; title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode;
}) {
  return (
    <div
      id={id}
      className="scroll-mt-28 bg-white rounded-3xl border border-sand shadow-sm p-7 md:p-9 flex flex-col gap-6"
    >
      <div className="flex items-center gap-4 pb-5 border-b border-sand/50">
        <div className="w-10 h-10 rounded-2xl bg-terracotta/8 border border-terracotta/15 flex items-center justify-center shrink-0">
          <Icon className="w-5 h-5 text-terracotta" />
        </div>
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-charcoal/35">Section {number}</span>
          <h2 className="text-lg font-serif font-black text-indigo leading-tight">{title}</h2>
        </div>
      </div>
      <div className="text-sm font-medium">{children}</div>
    </div>
  );
}
