"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Scale,
  FileText,
  CheckCircle,
  HelpCircle,
  ArrowLeft,
  ShieldAlert,
  Ban,
  Gavel,
  RefreshCw,
  Mail,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

const SECTIONS = [
  { id: "scope", label: "Scope & Use of Platform", icon: FileText, number: "01" },
  { id: "rera-compliance", label: "RERA Compliance & Listings", icon: ShieldAlert, number: "02" },
  { id: "broker-terms", label: "Broker & Partner Terms", icon: CheckCircle, number: "03" },
  { id: "user-conduct", label: "User Conduct", icon: Ban, number: "04" },
  { id: "liability", label: "Liability & Indemnity", icon: HelpCircle, number: "05" },
  { id: "governing-law", label: "Governing Law", icon: Gavel, number: "06" },
  { id: "changes", label: "Changes to Terms", icon: RefreshCw, number: "07" },
  { id: "contact", label: "Contact & Disputes", icon: Mail, number: "08" },
];

export default function TermsPage() {
  const [activeId, setActiveId] = useState("scope");

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
              <Scale className="w-7 h-7 text-white" />
            </div>
            <div>
              <p className="text-terracotta text-[10px] font-black uppercase tracking-widest mb-2">Legal Document</p>
              <h1 className="text-4xl md:text-5xl font-serif font-black text-white leading-tight">
                Terms of Service
              </h1>
              <p className="text-white/45 text-xs font-bold uppercase tracking-widest mt-3">
                Effective Date: July 7, 2026 &nbsp;·&nbsp; SqftGo Real Estate Marketplace
              </p>
            </div>
          </div>

          {/* Quick stat chips */}
          <div className="flex flex-wrap gap-3 mt-10">
            {["RERA Regulated", "Rajasthan Jurisdiction", "Bilateral Agreements", "Zero Liability on Disputes"].map((chip) => (
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
                href="/privacy"
                className="flex items-center gap-2 text-xs font-bold text-indigo hover:text-terracotta transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                Privacy Policy →
              </Link>
            </div>
          </aside>

          {/* ── Main Content ── */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">

            {/* Intro notice */}
            <div className="bg-indigo/5 border border-indigo/15 rounded-3xl p-6 text-sm text-indigo font-semibold leading-relaxed">
              <strong className="font-black">Please read these Terms carefully.</strong> By accessing or using SqftGo (SQFTGO.COM), you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree, please discontinue use immediately.
            </div>

            {/* 01 */}
            <Section id="scope" number="01" title="Scope & Use of Platform" icon={FileText}>
              <p className="text-charcoal/70 leading-relaxed">
                Welcome to SqftGo (SQFTGO.COM). These Terms of Service govern your access to and use of our property marketplace, regional directories, and relocation concierge services. By browsing our verified listings or submitting enquiries, you agree to comply with these terms and conditions in their entirety.
              </p>
              <p className="text-charcoal/70 leading-relaxed mt-4">
                SqftGo operates exclusively as a property listing and connection platform. We do not act as a real estate agent, broker, legal advisor, or financial institution in any transaction.
              </p>
            </Section>

            {/* 02 */}
            <Section id="rera-compliance" number="02" title="RERA Compliance & Listings Vetting" icon={ShieldAlert}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                SqftGo acts as a vetted regional property directory. While we execute structural checks, title deed inspections, and require RERA certification numbers for listing brokers and developers:
              </p>
              <ul className="flex flex-col gap-3">
                {[
                  "Users are legally obligated to execute complete independent verification of RERA details and title documents before signing lease tokens or sale deeds.",
                  "SqftGo does not charge or handle advance lease tokens for listings unless facilitated under official escrow partner accounts.",
                  "We hold the right to pull listings or purge dealer accounts immediately upon receiving warnings of RERA licensing issues or deed title discrepancy alerts.",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-charcoal/70 font-medium">
                    <span className="mt-0.5 w-5 h-5 rounded-full bg-indigo/10 border border-indigo/20 flex items-center justify-center shrink-0 text-[10px] font-black text-indigo">
                      {i + 1}
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </Section>

            {/* 03 */}
            <Section id="broker-terms" number="03" title="Broker & Service Partner Terms" icon={CheckCircle}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                Directory partners, including architects, agents, decorators, and vastu consultants, must submit accurate firm registration coordinates and agree to prompt audits of their credentials.
              </p>
              <div className="bg-rose-50 border border-rose-200/70 rounded-2xl p-4 text-xs text-rose-900 font-semibold leading-relaxed flex items-start gap-3">
                <Ban className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  <strong>Zero Tolerance:</strong> False representation, RERA check spoofing, or user complaint spikes will result in <strong>immediate permanent listing termination</strong> without token refunds.
                </span>
              </div>
            </Section>

            {/* 04 */}
            <Section id="user-conduct" number="04" title="User Conduct" icon={Ban}>
              <p className="text-charcoal/70 leading-relaxed mb-5">
                All users of the platform agree not to engage in any of the following prohibited activities:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  "Submitting fraudulent inquiry or lead data",
                  "Scraping or bulk-downloading listing data",
                  "Misrepresenting identity or credentials",
                  "Harassing agents, owners or SqftGo staff",
                  "Posting misleading property specifications",
                  "Bypassing authentication or security controls",
                ].map((conduct) => (
                  <div key={conduct} className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-sand text-xs font-semibold text-charcoal/70">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta shrink-0" />
                    {conduct}
                  </div>
                ))}
              </div>
            </Section>

            {/* 05 */}
            <Section id="liability" number="05" title="Liability & Indemnity" icon={HelpCircle}>
              <p className="text-charcoal/70 leading-relaxed mb-4">
                SqftGo (SQFTGO.COM), its parent corporations, and officers hold no liability for transactions, title disputes, construction delays, or service quality concerns arising between listing buyers / tenants and verified brokers / builders. Agreements are strictly bilateral.
              </p>
              <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 text-xs text-amber-900 font-semibold leading-relaxed flex items-start gap-3">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Disclaimer:</strong> SqftGo provides the platform &ldquo;as-is&rdquo; with no warranty of fitness for a particular purpose or non-infringement. Users act at their own risk when transacting.
                </span>
              </div>
            </Section>

            {/* 06 */}
            <Section id="governing-law" number="06" title="Governing Law" icon={Gavel}>
              <p className="text-charcoal/70 leading-relaxed">
                These Terms are governed by and construed in accordance with the laws of India and the state of Rajasthan. Any disputes arising from or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Udaipur, Rajasthan, India.
              </p>
            </Section>

            {/* 07 */}
            <Section id="changes" number="07" title="Changes to Terms" icon={RefreshCw}>
              <p className="text-charcoal/70 leading-relaxed">
                SqftGo reserves the right to modify these Terms of Service at any time. Material changes will be communicated via email to registered users at least 14 days prior to the effective date. Continued use of the platform after a revision constitutes acceptance of the updated Terms. We encourage you to review this page periodically.
              </p>
            </Section>

            {/* 08 */}
            <Section id="contact" number="08" title="Contact & Disputes" icon={Mail}>
              <p className="text-charcoal/70 leading-relaxed mb-6">
                For any legal queries, disputes, or partnership compliance concerns, please reach out to our legal department directly:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { label: "Legal Department", value: "SQFTGO Legal & Compliance", icon: Gavel },
                  { label: "Email", value: "legal@sqftgo.com", icon: Mail },
                  { label: "Phone", value: "+91 98290 55555", icon: Scale },
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
