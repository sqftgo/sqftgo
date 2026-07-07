import React from "react";
import { Filter } from "lucide-react";

interface DestinationsFilterProps {
  tags: string[];
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
  tagStats: { [key: string]: { cities: number; listings: number } };
}

export default function DestinationsFilter({
  tags,
  activeFilter,
  setActiveFilter,
  tagStats
}: DestinationsFilterProps) {
  return (
    <div className="flex flex-col items-center gap-3 mb-12 relative z-30">
      <div className="flex items-center gap-2 overflow-x-auto max-w-full no-scrollbar px-4 bg-white/70 backdrop-blur-md rounded-full shadow-sm border border-sand p-1.5">
        <Filter className="w-3.5 h-3.5 text-indigo ml-2 flex-shrink-0" />
        {tags.map(tag => {
          const isActive = activeFilter === tag;
          const stats = tagStats[tag];
          return (
            <button
              key={tag}
              onClick={() => setActiveFilter(tag)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${isActive
                  ? "bg-indigo text-white shadow-md shadow-indigo/25"
                  : "text-charcoal/70 hover:text-indigo hover:bg-sand/30"
                }`}
            >
              <span>{tag}</span>
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${isActive ? "bg-white/20 text-white" : "bg-sand text-charcoal/50"
                }`}>
                {stats ? stats.cities : 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
