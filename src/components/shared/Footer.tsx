"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin, Clock, ArrowRight } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { usePublicPlatformSettings } from "@/hooks/usePublicPlatformSettings";


export const Footer: React.FC = () => {
  const pathname = usePathname();
  const settings = usePublicPlatformSettings();
  const supportEmail = settings.supportEmail || "contact@sqftgo.com";
  const supportPhone = settings.supportPhone || "+91 98765 43210";
  const phoneHref = `tel:${supportPhone.replace(/\s+/g, "")}`;

  // Hide Footer on dashboard and auth pages
  if (
    pathname === "/login" || pathname === "/signup" || pathname === "/register" ||
    pathname === "/forgot-password" || pathname === "/update-password" || pathname === "/dealer/register" || 
    pathname === "/admin/login" ||
    pathname.startsWith("/dealer/dashboard") || pathname.startsWith("/admin")
  ) {
    return null;
  }
  
  const socials = [
    { name: "Instagram", icon: faInstagram, href: "https://instagram.com/sqftgo" },
    { name: "Facebook", icon: faFacebookF, href: "https://facebook.com/sqftgo" },
    { name: "YouTube", icon: faYoutube, href: "https://youtube.com/sqftgo" },
    { name: "WhatsApp", icon: faWhatsapp, href: "https://wa.me/919876543210" },
  ];

  return (
    <footer className="relative z-10 bg-sand/50 text-charcoal/80 pt-20 pb-10 border-t border-sand/40 overflow-hidden select-none">
      
      {/* Background Watermark 1: Elegant Palace Silhouette at bottom right */}
      <div className="absolute bottom-[-10px] right-[-10px] w-[95%] sm:w-[60%] md:w-[45%] lg:w-[35%] max-w-[500px] aspect-[1.3/1] opacity-[0.05] text-terracotta pointer-events-none z-0">
        <svg viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
          <path
            d="
              M 0 500 
              L 0 420 
              Q 10 420 20 400 
              L 20 340 
              L 50 340 
              L 50 280 
              L 40 280 
              L 40 260 
              C 40 240, 50 210, 65 210 
              C 80 210, 90 240, 90 260 
              L 90 280 
              L 80 280 
              L 80 340 
              L 120 340 
              L 120 300 
              Q 135 285 150 300 
              L 150 340 
              L 190 340 
              L 190 210 
              L 170 210 
              L 170 190 
              C 170 160, 195 130, 215 130 
              C 235 130, 260 160, 260 190 
              L 260 210 
              L 240 210 
              L 240 340 
              L 280 340 
              L 280 290 
              C 280 260, 310 260, 310 290 
              L 310 340 
              L 360 340 
              L 360 140 
              L 330 140 
              L 330 100 
              C 330 80, 340 50, 365 50 
              C 390 50, 400 80, 400 100 
              L 400 140 
              L 370 140 
              L 370 340 
              L 420 340 
              L 420 230 
              L 400 230 
              L 400 210 
              C 400 180, 420 150, 440 150 
              C 460 150, 480 180, 480 210 
              L 480 230 
              L 460 230 
              L 460 340 
              L 500 340 
              L 500 310 
              Q 515 295 530 310 
              L 530 340 
              Q 560 340 580 360 
              L 580 500 
              Z
            "
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M 200 240 H 230 M 200 270 H 230 M 215 240 V 290" stroke="currentColor" strokeWidth="1" />
          <path d="M 370 180 H 390 M 370 210 H 390 M 380 180 V 240" stroke="currentColor" strokeWidth="1" />
          <path d="M 60 300 Q 65 290 70 300 V 320 H 60 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 435 260 Q 440 250 445 260 V 280 H 435 Z" stroke="currentColor" strokeWidth="1.2" />
          <path d="M 20 350 H 580 M 20 360 H 580" stroke="currentColor" strokeWidth="1" />
          <path d="M 30 350 V 360 M 60 350 V 360 M 90 350 V 360 M 120 350 V 360 M 150 350 V 360 M 180 350 V 360 M 210 350 V 360 M 240 350 V 360 M 270 350 V 360 M 300 350 V 360 M 330 350 V 360 M 360 350 V 360 M 390 350 V 360 M 420 350 V 360 M 450 350 V 360 M 480 350 V 360 M 510 350 V 360 M 540 350 V 360 M 570 350 V 360" stroke="currentColor" strokeWidth="0.8" />
        </svg>
      </div>

      {/* Background Watermark 2: Large "SQFTGO" centered text watermark behind content */}
      <div className="absolute bottom-[45px] inset-x-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[12vw] font-sans font-black tracking-[0.2em] text-sand/30 dark:text-white/5 select-none leading-none">
          SQFTGO
        </span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-14 items-start mb-16">
          
          {/* Column 1: Brand & Bios (span 4) */}
          <div className="lg:col-span-4 flex flex-col gap-5 text-left">
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex flex-col">
                <span className="font-logo text-2xl leading-none text-indigo group-hover:text-indigo-hover transition-colors">
                  {settings.siteName}
                </span>
                <span className="text-[10px] text-terracotta font-extrabold tracking-widest uppercase mt-1">
                  {settings.tagline || "Real Estate"}
                </span>
              </div>
            </Link>

            <p className="text-charcoal/70 text-xs font-semibold leading-relaxed max-w-sm">
              Serving the luxury heritage real estate needs in India since 2008. Curating boutique residential, commercial, and agricultural properties across Rajasthan&apos;s historic locations.
            </p>

            {/* Social Icons Inline */}
            <div className="flex items-center gap-3 mt-2">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.name}
                  className="w-9 h-9 rounded-full border border-terracotta/20 text-terracotta hover:border-terracotta hover:bg-terracotta/5 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <FontAwesomeIcon icon={social.icon} className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Discover Links (span 2) */}
          <div className="lg:col-span-2 flex flex-col gap-5 text-left">
            <h4 className="text-indigo font-serif font-black text-sm uppercase tracking-wider">
              Discover
            </h4>
            <ul className="flex flex-col gap-3 text-xs font-bold text-charcoal/70">
              <li>
                <Link href="/listings" className="hover:text-terracotta hover:translate-x-0.5 transition-all duration-200 inline-block">
                  Property Listings
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="hover:text-terracotta hover:translate-x-0.5 transition-all duration-200 inline-block">
                  Destinations
                </Link>
              </li>
              <li>
                <Link href="/favorites" className="hover:text-terracotta hover:translate-x-0.5 transition-all duration-200 inline-block">
                  Favorites Stays
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contacts & Hours (span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-5 text-left">
            <h4 className="text-indigo font-serif font-black text-sm uppercase tracking-wider">
              Contact Details
            </h4>
            
            <div className="flex flex-col gap-4 text-xs font-bold text-charcoal/70">
              <a href={phoneHref} className="flex items-center gap-3 hover:text-terracotta transition-colors duration-200">
                <Phone className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>{supportPhone}</span>
              </a>
              
              <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 hover:text-terracotta transition-colors duration-200">
                <Mail className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>{supportEmail}</span>
              </a>

              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-terracotta flex-shrink-0 mt-0.5" />
                <span className="leading-relaxed">Lake Palace Road, Udaipur, Rajasthan, 313001</span>
              </div>

              <div className="flex items-center gap-3 border-t border-sand/30 pt-3 mt-1">
                <Clock className="w-4 h-4 text-terracotta flex-shrink-0" />
                <span>Office: 10:00 AM – 7:00 PM IST</span>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter Subscription (span 3) */}
          <div className="lg:col-span-3 flex flex-col gap-5 text-left">
            <h4 className="text-indigo font-serif font-black text-sm uppercase tracking-wider">
              Heritage Club
            </h4>
            
            <p className="text-charcoal/70 text-xs font-semibold leading-relaxed">
              Subscribe to receive exclusive heritage property briefs and private investment opportunities directly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Thank you for subscribing to SqftGo Heritage Club!");
                (e.target as HTMLFormElement).reset();
              }}
              className="flex flex-col sm:flex-row gap-2 mt-1 w-full"
            >
              <input
                type="email"
                placeholder="Email address"
                required
                className="bg-white border border-sand rounded-xl px-3 py-2 text-xs font-medium focus:outline-none focus:border-terracotta text-charcoal placeholder-charcoal/30 flex-1 min-w-0"
                suppressHydrationWarning
              />
              <button
                type="submit"
                className="bg-indigo hover:bg-indigo-hover text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5 active:scale-[0.98]"
                suppressHydrationWarning
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

        </div>

        {/* Divider Line */}
        <div className="h-px bg-sand/40 w-full mb-6" />

        {/* Footer Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-[11px] font-bold text-charcoal/50 relative z-10">
          <p>© {new Date().getFullYear()} {settings.siteName} Real Estate Private Limited (SQFTGO.COM). All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-xs">
            <Link href="/dealer/dashboard" className="hover:text-terracotta text-indigo transition-colors font-bold">Dealers Portal</Link>
            <span className="text-sand">|</span>
            <Link href="/admin" className="hover:text-terracotta transition-colors">Admin Console</Link>
            <span className="text-sand">|</span>
            <Link href="/services" className="hover:text-terracotta transition-colors">Services Directory</Link>
            <span className="text-sand">|</span>
            <Link href="/privacy" className="hover:text-terracotta transition-colors">Privacy Policy</Link>
            <span className="text-sand">|</span>
            <Link href="/terms" className="hover:text-terracotta transition-colors">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
