"use client";

import Link from "next/link";
import { X } from "lucide-react";

interface SignupPromptProps {
  nextPath: string;
  title?: string;
  body?: string;
  onClose?: () => void;
}

export function SignupPrompt({
  nextPath,
  title = "Sign up to see the full listing",
  body = "Create a free account to view complete property details, photos, and how to reach SqftGo.",
  onClose,
}: SignupPromptProps) {
  const next = encodeURIComponent(nextPath);

  return (
    <div className="fixed inset-0 z-[80] flex items-end sm:items-center justify-center p-4 bg-charcoal/55 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white border border-sand shadow-2xl p-6 text-left relative">
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="absolute top-4 right-4 p-1.5 rounded-full text-charcoal/50 hover:bg-sand/40"
          >
            <X className="w-4 h-4" />
          </button>
        ) : null}
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-terracotta">SqftGo account</p>
        <h2 className="mt-2 font-serif font-black text-2xl text-indigo">{title}</h2>
        <p className="mt-2 text-sm font-semibold text-charcoal/70 leading-relaxed">{body}</p>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href={`/login?tab=signup&next=${next}`}
            className="w-full py-3 rounded-xl bg-terracotta text-white text-center text-sm font-black"
          >
            Create a free account
          </Link>
          <Link
            href={`/login?next=${next}`}
            className="w-full py-3 rounded-xl border border-sand text-indigo text-center text-sm font-bold"
          >
            I already have an account
          </Link>
        </div>
      </div>
    </div>
  );
}
