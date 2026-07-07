"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Mail, Phone, MapPin } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFacebookF,
  faInstagram,
  faYoutube,
  faWhatsapp,
} from "@fortawesome/free-brands-svg-icons";
import { config } from "@fortawesome/fontawesome-svg-core";
import "@fortawesome/fontawesome-svg-core/styles.css";

// Prevent Font Awesome from dynamically adding its CSS since we imported it above
config.autoAddCss = false;

export const Footer: React.FC = () => {
  const pathname = usePathname();

  // Hide Footer on /login and /signup pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }
  const socials = [
    { name: "INSTAGRAM", icon: faInstagram, href: "https://instagram.com/svrepl" },
    { name: "FACEBOOK", icon: faFacebookF, href: "https://facebook.com/svrepl" },
    { name: "YOUTUBE", icon: faYoutube, href: "https://youtube.com/svrepl" },
    { name: "WHATSAPP", icon: faWhatsapp, href: "https://wa.me/919876543210" },
  ];

  return (
    <footer className="relative z-10 bg-[#fbf7f0] text-charcoal/80 pt-16 pb-10 border-t border-sand/40 overflow-hidden select-none">
      
      {/* Background Watermark 1: Elegant Palace Silhouette at bottom right */}
      <div className="absolute bottom-[-10px] right-[-10px] w-[95%] sm:w-[60%] md:w-[45%] lg:w-[35%] max-w-[500px] aspect-[1.3/1] opacity-[0.06] text-terracotta pointer-events-none z-0">
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

      {/* Background Watermark 2: Large "SVREPL" centered text watermark behind content */}
      <div className="absolute bottom-[45px] inset-x-0 flex items-center justify-center pointer-events-none select-none z-0">
        <span className="text-[12vw] font-sans font-black tracking-[0.2em] text-sand dark:text-white/5 select-none leading-none">
          SVREPL
        </span>
      </div>

      <div className="container mx-auto px-6 lg:px-12 max-w-7xl relative z-10">
        
        {/* Main 2-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-start mb-14">
          
          {/* Left Column: Brand Info + Contacts */}
          <div className="lg:col-span-6 flex flex-col gap-6 text-left">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 group w-fit">
              <div className="flex flex-col">
                <span className="font-serif font-black text-2xl leading-none tracking-tight text-indigo">
                  Sun Valley
                </span>
                <span className="text-[10px] text-terracotta font-extrabold tracking-widest uppercase mt-1">
                  Real Estate
                </span>
              </div>
            </Link>

            {/* Description */}
            <p className="text-charcoal/70 text-sm leading-relaxed max-w-lg font-medium">
              We have been serving the needs of Real Estate in India since 2008. Finding the right residential, commercial, or agricultural property to fit your needs.
            </p>

            {/* Contact Details */}
            <div className="flex flex-col gap-3.5 text-sm font-semibold text-charcoal/80 mt-2">
              <a href="tel:+919876543210" className="flex items-center gap-3.5 hover:text-terracotta transition-colors duration-200">
                <Phone className="w-5 h-5 text-terracotta flex-shrink-0 stroke-[1.8]" />
                <span>+91 98765 43210</span>
              </a>
              <a href="mailto:contact@svrepl.com" className="flex items-center gap-3.5 hover:text-terracotta transition-colors duration-200">
                <Mail className="w-5 h-5 text-terracotta flex-shrink-0 stroke-[1.8]" />
                <span>contact@svrepl.com</span>
              </a>
              <div className="flex items-start gap-3.5">
                <MapPin className="w-5 h-5 text-terracotta flex-shrink-0 stroke-[1.8] mt-0.5" />
                <span>Lake Palace Road, Udaipur, Rajasthan, 313001</span>
              </div>
            </div>
          </div>

          {/* Right Column: Socials */}
          <div className="lg:col-span-6 flex flex-col gap-8">
            
            {/* Follow Us Section */}
            <div className="flex flex-col gap-4 text-left">
              <h4 className="text-indigo font-serif font-black text-lg">Follow Us</h4>
              <div className="flex flex-wrap gap-4 items-center">
                {socials.map((social) => {
                  return (
                    <a
                      key={social.name}
                      href={social.href}
                      className="group flex flex-col items-center gap-2"
                    >
                      {/* Outlined Circle Container */}
                      <div className="w-12 h-12 rounded-full border border-terracotta/40 hover:border-terracotta text-terracotta hover:bg-terracotta/5 flex items-center justify-center transition-all duration-200 shadow-sm">
                        <FontAwesomeIcon icon={social.icon} className="w-5 h-5" />
                      </div>
                      <span className="text-[9px] font-extrabold text-charcoal/50 group-hover:text-terracotta tracking-wider uppercase">
                        {social.name}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>

          </div>

        </div>

        {/* Divider Line */}
        <div className="h-px bg-sand/40 w-full mb-6" />

        {/* Footer Bottom Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-semibold text-charcoal/50 relative z-10">
          <p>© {new Date().getFullYear()} Sun Valley Real Estate Private Limited (SVREPL.COM). All rights reserved.</p>
          
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5">
            <Link href="/services" className="hover:text-terracotta transition-colors">Services Directory</Link>
            <span className="text-sand">|</span>
            <Link href="/get-assistance" className="hover:text-terracotta transition-colors">Requirement Enquiry</Link>
            <span className="text-sand">|</span>
            <a href="#" className="hover:text-terracotta transition-colors">Privacy Policy</a>
            <span className="text-sand">|</span>
            <a href="#" className="hover:text-terracotta transition-colors">Terms of Service</a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
