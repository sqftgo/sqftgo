"use client";

import React from "react";
import Link from "next/link";
import { Scale, FileText, CheckCircle, HelpCircle, ArrowLeft, ShieldAlert } from "lucide-react";

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto w-full">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-charcoal/50 hover:text-indigo font-bold text-sm mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-[2rem] border border-sand p-8 md:p-12 shadow-xl mb-12 relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            <div className="w-16 h-16 rounded-2xl bg-indigo/5 text-indigo flex items-center justify-center shrink-0 border border-indigo/10 shadow-inner">
              <Scale className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-charcoal mb-2">
                Terms of Service
              </h1>
              <p className="text-xs text-charcoal/50 font-black uppercase tracking-widest">
                Effective Date: July 7, 2026 • Sun Valley Real Estate Marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-sand p-8 md:p-12 shadow-sm flex flex-col gap-8 text-charcoal/80 text-sm leading-relaxed font-semibold">
          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-terracotta" />
              <span>1. Scope and Use of Platform</span>
            </h2>
            <p className="font-semibold text-charcoal/70">
              Welcome to Sun Valley (SVREPL.COM). These Terms of Service govern your access to and use of our property marketplace, regional directories, and relocation concierge services. By browsing our verified listings or submitting enquiries, you agree to comply with these terms and conditions.
            </p>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-terracotta" />
              <span>2. RERA Compliance & Listings Vetting</span>
            </h2>
            <p className="mb-4 font-semibold text-charcoal/70">
              Sun Valley acts as a vetted regional property directory. While we execute structural checks, title deed inspections, and require RERA certification numbers for listing brokers and developers:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 font-medium text-charcoal/60">
              <li>Users are legally obligated to execute complete independent verification of RERA details and title documents before signing lease tokens or sale deeds.</li>
              <li>Sun Valley does not charge or handle advance lease tokens for listings unless facilitated under official escrow partner accounts.</li>
              <li>We hold the right to pull listings or purge dealer accounts immediately upon receiving warnings of RERA licensing issues or deed title discrepancy alerts.</li>
            </ul>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-terracotta" />
              <span>3. Broker and Service Partner Terms</span>
            </h2>
            <p className="font-semibold text-charcoal/70">
              Directory partners, including architects, agents, decorators, and vastu consultants, must submit accurate firm registration coordinates and agree to prompt audits of their credentials. False representation, RERA check spoofing, or user complaint spikes will result in immediate permanent listing termination without token refunds.
            </p>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-terracotta" />
              <span>4. Liability and Indemnity</span>
            </h2>
            <p className="font-semibold text-charcoal/70">
              Sun Valley (SVREPL.COM), its parent corporations, and officers hold no liability for transactions, title disputes, construction delays, or service quality concerns arising between listing buyers/tenants and verified brokers/builders. Agreements are strictly bilateral.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
