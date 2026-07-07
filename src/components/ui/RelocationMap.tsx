"use client";

import React, { useState, useEffect } from "react";
import { Shield, Users, Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface RelocationMapProps {
  city: string;
}

interface CityRelocationData {
  coordinates: string;
  office: string;
  agents: string;
  relocations: string;
  duration: string;
  corridor: string;
  landmarks: string[];
  zones: string[];
}

const CITY_RELOCATION_INFO: Record<string, CityRelocationData> = {
  "All India": {
    coordinates: "20° 35′ 52″ N / 78° 57′ 39″ E",
    office: "National Relocation Bureau, Delhi NCR",
    agents: "120+ Active Coordinators",
    relocations: "2,480+ Successful Inter-State Moves",
    duration: "5-10 Days Avg.",
    corridor: "National Golden Quadrilateral Expressway Network",
    landmarks: ["National Highway Grid", "State Border Hubs", "Transit Checkpoints"],
    zones: ["North Zone Sourcing", "West Corridor Transit", "South Connect Hub"]
  },
  Udaipur: {
    coordinates: "24° 35′ 12″ N / 73° 41′ 08″ E",
    office: "Lake City Hub, Panchwati",
    agents: "14 Active Agents",
    relocations: "148 Successful Moves",
    duration: "4-7 Days Avg.",
    corridor: "Mumbai & Gujarat Highway Corridor",
    landmarks: ["Fateh Sagar Lake", "Lake Pichola", "Sajjangarh Hill"],
    zones: ["Panchwati Residential", "Shobhagpura Elite", "Hiran Magri Sector 4"]
  },
  Jaipur: {
    coordinates: "26° 54′ 44″ N / 75° 48′ 18″ E",
    office: "C-Scheme Corporate Center",
    agents: "26 Active Agents",
    relocations: "320 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "Delhi NCR & Northern Expressway Corridor",
    landmarks: ["Central Park", "Walled Pink City", "Amer Fort Ridge"],
    zones: ["C-Scheme Elite Area", "Malviya Nagar Sector", "Mansarovar Commercial"]
  },
  Jodhpur: {
    coordinates: "26° 17′ 38″ N / 73° 01′ 12″ E",
    office: "Mehrangarh Fort Road Hub",
    agents: "11 Active Agents",
    relocations: "92 Successful Moves",
    duration: "5-8 Days Avg.",
    corridor: "Western Transit & Ahmedabad Route",
    landmarks: ["Mehrangarh Fort", "Umaid Bhawan", "Kaylana Lake"],
    zones: ["Sardarpura Historic", "Shastri Nagar Sector", "Ratanada Cantonment"]
  },
  Kota: {
    coordinates: "25° 11′ 00″ N / 75° 50′ 00″ E",
    office: "Chambal Valley Office",
    agents: "8 Active Agents",
    relocations: "64 Successful Moves",
    duration: "4-6 Days Avg.",
    corridor: "Central MP & Delhi Expressway Route",
    landmarks: ["Chambal River", "Seven Wonders Park", "Kota Barrage"],
    zones: ["Talwandi Residential", "Vigyan Nagar", "Kunhari Sourcing Hub"]
  },

  Bikaner: {
    coordinates: "28° 01′ 00″ N / 73° 18′ 00″ E",
    office: "Junagarh Rampuria Sourcing Center",
    agents: "6 Active Agents",
    relocations: "36 Successful Moves",
    duration: "6-9 Days Avg.",
    corridor: "Northern Punjab & Haryana Corridor",
    landmarks: ["Junagarh Fort", "Rampuria Havelis", "Karni Nagar Park"],
    zones: ["Karni Nagar Elite", "Rani Bazar Hub", "Sardul Colony"]
  },
  Jaisalmer: {
    coordinates: "26° 54′ 40″ N / 70° 54′ 46″ E",
    office: "Thar Fort Sourcing Unit",
    agents: "5 Active Agents",
    relocations: "38 Successful Moves",
    duration: "6-8 Days Avg.",
    corridor: "Thar Desert Express Link",
    landmarks: ["Jaisalmer Fort", "Sam Sand Dunes", "Patwon Ki Haveli"],
    zones: ["Fort Road Residential", "Sam Dunes Tourism Zone", "Dedansar Suburbs"]
  },
  Rajsamand: {
    coordinates: "25° 04′ 00″ N / 73° 53′ 00″ E",
    office: "Marble Arch Office, Nathdwara Rd",
    agents: "6 Active Agents",
    relocations: "44 Successful Moves",
    duration: "4-6 Days Avg.",
    corridor: "NH-8 Industrial Route",
    landmarks: ["Rajsamand Lake", "Dwarkadheesh Temple", "Kankroli Hill"],
    zones: ["Kankroli Residential", "Nathdwara Sourcing Corridor", "Jalchakri Extension"]
  },
  Pali: {
    coordinates: "25° 46′ 00″ N / 73° 19′ 00″ E",
    office: "Industrial Transit Bureau",
    agents: "5 Active Agents",
    relocations: "29 Successful Moves",
    duration: "5-7 Days Avg.",
    corridor: "Jodhpur-Pali-Marwar Bypass Route",
    landmarks: ["Lakhotiya Lake", "Bangur Museum", "Pali Fort Ridge"],
    zones: ["Industrial Area Housing", "Suraj Pole Sourcing", "Marwar Junction Area"]
  },
  Pushkar: {
    coordinates: "26° 29′ 20″ N / 74° 33′ 22″ E",
    office: "Pushkar Ghats Sourcing Center",
    agents: "4 Active Agents",
    relocations: "31 Successful Moves",
    duration: "4-6 Days Avg.",
    corridor: "Ajmer-Pushkar Hill Pass Route",
    landmarks: ["Brahma Temple", "Pushkar Lake Ghats", "Savitri Temple Hill"],
    zones: ["Pushkar Lake Circle", "Choti Basti", "Budha Pushkar Dev. Area"]
  },
  Alwar: {
    coordinates: "27° 34′ 00″ N / 76° 36′ 00″ E",
    office: "Sariska Gateway Hub",
    agents: "8 Active Agents",
    relocations: "58 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "Delhi-Jaipur Expressway Corridor",
    landmarks: ["Bala Quila", "Sariska National Park", "Siliserh Lake"],
    zones: ["Manu Marg Housing", "NEB Housing Board", "Shivaji Park Elite"]
  },
  Ahmedabad: {
    coordinates: "23° 01′ 28″ N / 72° 34′ 57″ E",
    office: "SG Highway Hub, Bodakdev",
    agents: "22 Active Agents",
    relocations: "274 Successful Moves",
    duration: "3-6 Days Avg.",
    corridor: "Mumbai-Gujarat Industrial Corridor",
    landmarks: ["Sabarmati Riverfront", "Kankaria Lake", "Science City"],
    zones: ["Bodakdev Elite", "Satellite Sector", "Ghatlodia Residential"]
  },
  Surat: {
    coordinates: "21° 10′ 12″ N / 72° 49′ 48″ E",
    office: "Ring Road Textile Plaza",
    agents: "15 Active Agents",
    relocations: "196 Successful Moves",
    duration: "4-6 Days Avg.",
    corridor: "Mumbai Transit & Coastal Link",
    landmarks: ["Tapi Riverfront", "Dumas Beach", "Sarthana Nature Park"],
    zones: ["Adajan Residential", "Vesu Elite Housing", "Varachha Commercial"]
  },
  Gandhinagar: {
    coordinates: "23° 13′ 00″ N / 72° 41′ 00″ E",
    office: "Capital City Sourcing Plaza",
    agents: "11 Active Agents",
    relocations: "95 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "Ahmedabad-Gandhinagar Expressway",
    landmarks: ["Akshardham Temple", "Sarita Udyan", "Gift City Tower"],
    zones: ["Sector 21 Residential", "Gift City Special Zone", "Sector 30 Housing"]
  },
  Kutch: {
    coordinates: "23° 15′ 00″ N / 69° 40′ 00″ E",
    office: "Rann Gateway Bureau, Bhuj",
    agents: "6 Active Agents",
    relocations: "41 Successful Moves",
    duration: "6-9 Days Avg.",
    corridor: "West Gujarat Coastal Expressway",
    landmarks: ["Rann of Kutch", "Aina Mahal Bhuj", "Mandvi Beach"],
    zones: ["Bhuj Residential", "Mandvi Port Area", "Anjar Housing Sector"]
  },
  Anand: {
    coordinates: "22° 34′ 00″ N / 72° 57′ 00″ E",
    office: "Milk Capital Office, Amul Dairy Rd",
    agents: "7 Active Agents",
    relocations: "53 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "NE-1 Vadodara-Ahmedabad Link",
    landmarks: ["Amul Dairy Museum", "Shastri Ground", "Sardar Patel Memorial"],
    zones: ["Vallabh Vidyanagar Housing", "Amul Dairy Road", "Karamsad Residential"]
  },

  Rajkot: {
    coordinates: "22° 18′ 00″ N / 70° 48′ 00″ E",
    office: "Kalawad Road Sourcing Center",
    agents: "10 Active Agents",
    relocations: "84 Successful Moves",
    duration: "5-7 Days Avg.",
    corridor: "Saurashtra Highway Expressway",
    landmarks: ["Watson Museum", "Nyari Dam", "Pradyuman Park"],
    zones: ["Kalawad Road Elite", "Yagnik Road Hub", "Moti Nagar Residential"]
  },
  Chandigarh: {
    coordinates: "30° 44′ 10″ N / 76° 47′ 15″ E",
    office: "Sector 17 Corporate Plaza",
    agents: "18 Active Agents",
    relocations: "210 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "Delhi-Amritsar National Highway",
    landmarks: ["Sukhna Lake", "Rock Garden", "Sector 17 Plaza"],
    zones: ["Sector 8 & 9 Elite", "Sector 35 Residential", "Mohali Tech Sector"]
  },

  Shimla: {
    coordinates: "31° 06′ 12″ N / 77° 10′ 20″ E",
    office: "Mall Road Heritage Center",
    agents: "9 Active Agents",
    relocations: "82 Successful Moves",
    duration: "5-8 Days Avg.",
    corridor: "Himalayan Expressway Route",
    landmarks: ["The Ridge", "Jakhoo Hill", "Kalka-Shimla Railway"],
    zones: ["Chhota Shimla", "Mall Road Sector", "New Shimla Residential"]
  },
  Dharamshala: {
    coordinates: "32° 13′ 00″ N / 76° 19′ 00″ E",
    office: "Dhauladhar Sourcing Station",
    agents: "7 Active Agents",
    relocations: "61 Successful Moves",
    duration: "5-8 Days Avg.",
    corridor: "Pathankot-Kangra Hill Route",
    landmarks: ["McLeod Ganj Monasteries", "HPCA Stadium", "Bhagsunag Waterfall"],
    zones: ["McLeod Ganj Zen Sector", "Dharamkot Meadows", "Sidhbari Elite Area"]
  },
  Agra: {
    coordinates: "27° 11′ 00″ N / 78° 01′ 00″ E",
    office: "Taj Heritage Office",
    agents: "12 Active Agents",
    relocations: "134 Successful Moves",
    duration: "3-5 Days Avg.",
    corridor: "Yamuna Expressway Northern Corridor",
    landmarks: ["Taj Mahal Gate", "Agra Fort", "Sikandra Tomb"],
    zones: ["Taj Ganj Tourist Sector", "Sanjay Place Office Hub", "Dayal Bagh Residential"]
  }
};

export default function RelocationMap({ city }: RelocationMapProps) {
  const [isScanning, setIsScanning] = useState(false);
  const data = CITY_RELOCATION_INFO[city] || CITY_RELOCATION_INFO["Udaipur"];

  // Trigger scanning animation when city changes
  useEffect(() => {
    setIsScanning(true);
    const timer = setTimeout(() => setIsScanning(false), 900);
    return () => clearTimeout(timer);
  }, [city]);

  return (
    <div className="w-full rounded-2xl overflow-hidden border border-sand glassmorphism shadow-md flex flex-col relative">
      
      {/* Map Header Panel */}
      <div className="bg-indigo text-white p-3 px-4 flex items-center justify-between text-xs font-bold border-b border-sand/10 relative z-10">
        <div className="flex items-center gap-1.5">
          <motion.span 
            animate={{ opacity: isScanning ? [0.4, 1, 0.4] : 1 }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className={`w-2 h-2 rounded-full ${isScanning ? "bg-amber-400" : "bg-emerald-500"}`} 
          />
          <span className="font-sans">Relocation Network: {city}</span>
        </div>
        <span className="text-[10px] text-sand/70 uppercase tracking-widest font-sans">
          {isScanning ? "Resolving Route..." : "GPS Secured"}
        </span>
      </div>

      {/* Map Canvas */}
      <div className="h-64 md:h-72 bg-[#faf8f5]/40 relative overflow-hidden border-b border-sand">
        
        {/* Google Maps Embed iframe */}
        <iframe
          title="Google Maps"
          width="100%"
          height="100%"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(`${city}, India`)}&t=m&z=14&ie=UTF8&iwloc=&output=embed`}
          className="w-full h-full border-0 absolute inset-0"
          allowFullScreen
          loading="lazy"
        />

        {/* Radar Scanning Line */}
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ top: 0 }}
              animate={{ top: "100%" }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.9, ease: "linear" }}
              className="absolute left-0 right-0 h-0.5 bg-terracotta/40 shadow-[0_0_10px_var(--color-terracotta)] z-10 pointer-events-none"
            />
          )}
        </AnimatePresence>

        {/* Dynamic Coordinates Grid */}
        <div className="absolute top-2 left-2 text-[8px] font-bold text-charcoal/40 bg-white/95 px-2 py-0.5 rounded border border-sand/50 pointer-events-none font-sans z-10">
          {data.coordinates}
        </div>

        {/* Compass Spinner */}
        <div className="absolute bottom-3 right-3 w-10 h-10 bg-white/95 rounded-full border border-sand shadow-sm flex items-center justify-center z-10 text-indigo opacity-70 pointer-events-none">
          <svg viewBox="0 0 100 100" className="w-6 h-6 animate-spin-slow" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 3" />
            <polygon points="50,18 54,46 50,50 46,46" fill="var(--color-terracotta)" />
            <polygon points="50,82 54,54 50,50 46,54" fill="currentColor" />
            <polygon points="82,50 54,54 50,50 54,46" fill="currentColor" />
            <polygon points="18,50 46,54 50,50 46,46" fill="currentColor" />
          </svg>
        </div>

        {/* Relocation Route Indicator */}
        <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-white/95 border border-sand/70 p-1.5 px-2 rounded-lg text-[8px] font-extrabold text-indigo shadow-sm font-sans z-10 pointer-events-none">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          <span>Active Transit: {data.corridor}</span>
        </div>
      </div>

      {/* Network Stats & Office Info */}
      <div className="bg-cream/95 p-4 flex flex-col gap-3 font-sans relative">
        <div className="flex flex-col gap-0.5 text-left">
          <span className="text-[9px] font-extrabold text-charcoal/40 uppercase tracking-widest">Local Headquarters</span>
          <span className="text-xs font-black text-indigo font-sans">{data.office}</span>
        </div>

        <div className="grid grid-cols-3 gap-2 border-t border-sand pt-3 text-left">
          <div className="flex flex-col">
            <span className="text-[8px] font-extrabold text-charcoal/40 uppercase tracking-widest flex items-center gap-1">
              <Shield className="w-2.5 h-2.5 text-terracotta" />
              <span>Agents</span>
            </span>
            <span className="text-[10px] font-black text-indigo mt-0.5">{data.agents}</span>
          </div>
          <div className="flex flex-col border-l border-sand pl-3">
            <span className="text-[8px] font-extrabold text-charcoal/40 uppercase tracking-widest flex items-center gap-1">
              <Users className="w-2.5 h-2.5 text-emerald-500" />
              <span>Moves</span>
            </span>
            <span className="text-[10px] font-black text-emerald-600 mt-0.5">{data.relocations}</span>
          </div>
          <div className="flex flex-col border-l border-sand pl-3">
            <span className="text-[8px] font-extrabold text-charcoal/40 uppercase tracking-widest flex items-center gap-1">
              <Clock className="w-2.5 h-2.5 text-blue-500" />
              <span>Speed</span>
            </span>
            <span className="text-[10px] font-black text-indigo mt-0.5">{data.duration}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
