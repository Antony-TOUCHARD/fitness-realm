"use client";

import React, { useState } from "react";
import franceMap from "@svg-maps/france.regions";
import { Territory, Faction } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";

interface MapLocation {
  name: string;
  id: string;
  path: string;
}

const locations = franceMap.locations as MapLocation[];

interface FranceMapProps {
  territories: Territory[];
  selectedRegionId: string | null;
  onSelectRegion: (id: string) => void;
}

export function FranceMap({ territories, selectedRegionId, onSelectRegion }: FranceMapProps) {
  const { t } = useLanguage();
  const [hoveredRegion, setHoveredRegion] = useState<{
    id: string;
    name: string;
    faction: Faction;
    ip: number;
    x: number;
    y: number;
  } | null>(null);

  // Map database uppercase IDs to territories for fast lookup
  const territoryMap = React.useMemo(() => {
    const map: Record<string, Territory> = {};
    territories.forEach((t) => {
      map[t.id.toUpperCase()] = t;
    });
    return map;
  }, [territories]);

  const handleMouseMove = (e: React.MouseEvent<SVGPathElement>, loc: MapLocation) => {
    const dbId = loc.id.toUpperCase();
    const territory = territoryMap[dbId];
    
    // Get cursor offset relative to map container
    const rect = e.currentTarget.parentElement?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setHoveredRegion({
      id: dbId,
      name: loc.name,
      faction: territory ? territory.controlling_faction : "Neutral",
      ip: territory ? Number(territory.total_influence_points) : 0,
      x,
      y: y - 85, // Float tooltip above cursor
    });
  };

  const handleMouseLeave = () => {
    setHoveredRegion(null);
  };

  // Color mapping based on faction
  const getFactionColor = (faction: Faction, isHovered: boolean, isSelected: boolean) => {
    switch (faction) {
      case "Shadow Runners":
        if (isSelected) return "fill-violet-550/70 stroke-violet-300 drop-shadow-[0_0_12px_rgba(139,92,246,0.6)]";
        if (isHovered) return "fill-violet-600/60 stroke-violet-400 drop-shadow-[0_0_8px_rgba(139,92,246,0.4)]";
        return "fill-violet-950/35 stroke-violet-850/60 hover:fill-violet-900/50 hover:stroke-violet-700";
      case "Solar Cyclists":
        if (isSelected) return "fill-amber-550/70 stroke-amber-300 drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]";
        if (isHovered) return "fill-amber-600/60 stroke-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]";
        return "fill-amber-950/35 stroke-amber-850/60 hover:fill-amber-900/50 hover:stroke-amber-700";
      case "Lunar Walkers":
        if (isSelected) return "fill-cyan-550/70 stroke-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]";
        if (isHovered) return "fill-cyan-600/60 stroke-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]";
        return "fill-cyan-950/35 stroke-cyan-850/60 hover:fill-cyan-900/50 hover:stroke-cyan-700";
      default:
        if (isSelected) return "fill-slate-700/60 stroke-slate-350 drop-shadow-[0_0_10px_rgba(148,163,184,0.3)]";
        if (isHovered) return "fill-slate-700/50 stroke-slate-450";
        return "fill-slate-800/35 stroke-slate-700/60 hover:fill-slate-750/50 hover:stroke-slate-650";
    }
  };

  return (
    <div className="relative w-full aspect-[600/590] max-h-[480px] bg-[#0c0c1e]/40 border border-slate-900/80 p-4 rounded-xl flex items-center justify-center overflow-hidden shadow-inner select-none">
      <svg
        viewBox={franceMap.viewBox}
        className="w-full h-full max-h-[450px] transition-transform duration-500 ease-out"
      >
        <g className="regions-group">
          {locations.map((loc) => {
            const dbId = loc.id.toUpperCase();
            const territory = territoryMap[dbId];
            const faction = territory ? territory.controlling_faction : "Neutral";
            
            const isSelected = selectedRegionId === dbId;
            const isHovered = hoveredRegion?.id === dbId;

            return (
              <path
                key={loc.id}
                d={loc.path}
                id={loc.id}
                onClick={() => onSelectRegion(dbId)}
                onMouseMove={(e) => handleMouseMove(e, loc)}
                onMouseLeave={handleMouseLeave}
                className={`transition-all duration-200 cursor-pointer stroke-[1.2] outline-none ${getFactionColor(
                  faction,
                  isHovered,
                  isSelected
                )}`}
              />
            );
          })}
        </g>
      </svg>

      {/* Floating Tooltip */}
      {hoveredRegion && (
        <div
          style={{
            left: `${hoveredRegion.x}px`,
            top: `${hoveredRegion.y}px`,
            transform: "translateX(-50%)",
          }}
          className="absolute z-50 pointer-events-none p-3 rounded-lg border border-slate-800/80 bg-[#0e0e22]/95 backdrop-blur-md shadow-2xl flex flex-col gap-1 w-44 transition-all duration-100"
        >
          <span className="font-orbitron font-extrabold text-[10px] text-slate-100 uppercase tracking-widest truncate leading-tight">
            {hoveredRegion.name}
          </span>
          <div className="flex items-center justify-between text-[9px] font-semibold border-t border-slate-900/60 pt-1.5 mt-1">
            <span className="text-slate-500">{t("leadFaction")}</span>
            <span
              className={`font-orbitron font-bold uppercase ${
                hoveredRegion.faction === "Shadow Runners" ? "text-violet-400" :
                hoveredRegion.faction === "Solar Cyclists" ? "text-amber-400" :
                hoveredRegion.faction === "Lunar Walkers" ? "text-cyan-400" : "text-slate-400"
              }`}
            >
              {hoveredRegion.faction === "Shadow Runners" ? t("shadowRunners").substring(0, 10) :
               hoveredRegion.faction === "Solar Cyclists" ? t("solarCyclists").substring(0, 10) :
               hoveredRegion.faction === "Lunar Walkers" ? t("lunarWalkers").substring(0, 10) : t("neutral")}
            </span>
          </div>
          <div className="flex items-center justify-between text-[9px] font-semibold">
            <span className="text-slate-500">Influence</span>
            <span className="font-orbitron font-bold text-slate-200">
              {hoveredRegion.ip} IP
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
