"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, Lock, Eye, FileText, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
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
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-serif font-black text-charcoal mb-2">
                Privacy Policy
              </h1>
              <p className="text-xs text-charcoal/50 font-black uppercase tracking-widest">
                Last Updated: July 7, 2026 • SqftGo Real Estate Marketplace
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="bg-white rounded-3xl border border-sand p-8 md:p-12 shadow-sm flex flex-col gap-8 text-charcoal/80 text-sm leading-relaxed font-semibold">
          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <Eye className="w-5 h-5 text-terracotta" />
              <span>1. Information We Collect</span>
            </h2>
            <p className="mb-4 font-semibold text-charcoal/70">
              At SqftGo, we collect information to provide better services to all our users. The types of personal information we collect include:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 font-medium text-charcoal/60">
              <li><strong>Personal Identifiers:</strong> Name, email address, phone number, and account login credentials when you sign up or submit assistance enquiries.</li>
              <li><strong>Usage Details:</strong> Information about your interactions with our listings, favorite saves, searches, and relocation forms.</li>
              <li><strong>Professional Details:</strong> License details, firm name, website, and office address for verified brokers and partners listed in our directory.</li>
            </ul>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-terracotta" />
              <span>2. How We Protect Your Data</span>
            </h2>
            <p className="mb-4 font-semibold text-charcoal/70">
              Your security is our priority. We implement modern, high-grade technical and organizational safeguards to ensure data safety:
            </p>
            <ul className="list-disc pl-5 flex flex-col gap-2 font-medium text-charcoal/60">
              <li>All search logs, database endpoints, and profile data transmissions are secured under encrypted SSL/TLS channels.</li>
              <li>Escrow tokens and verified title deed documents are stored in secure cloud containers accessible only to authorized RERA vetting coordinators.</li>
              <li>We never sell or distribute your private search budget profiles or relocation details to third-party advertising networks.</li>
            </ul>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-terracotta" />
              <span>3. Data Sharing and Vetting</span>
            </h2>
            <p className="font-semibold text-charcoal/70">
              When you submit a contact request to an Agent, Broker, or Builder in our Directory, we share your submitted name, phone number, and email address with that partner to facilitate the transaction. We vet all listed partners and ensure they adhere to strict RERA compliance guidelines, but recommend checking direct credential profiles before signing deeds.
            </p>
          </section>

          <div className="h-px bg-sand/60 w-full" />

          <section>
            <h2 className="text-xl font-serif font-black text-indigo mb-4">
              4. Contact Privacy Officer
            </h2>
            <p className="mb-4 font-semibold text-charcoal/70">
              For any questions regarding your data logs, cookies management, or requests to purge your profile records from our databases, please contact our data safety coordinators:
            </p>
            <div className="bg-[#faf8f5]/60 border border-sand p-5 rounded-2xl flex flex-col gap-2 font-bold text-xs text-charcoal/70">
              <p><strong>Department:</strong> SQFTGO Privacy & Security Desk</p>
              <p><strong>Email:</strong> privacy@sqftgo.com</p>
              <p><strong>Phone:</strong> +91 98290 55555</p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
