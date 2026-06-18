"use client";

import React from "react";
import { Award, Trophy, Crown, Gem } from "lucide-react";
import { Tier } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";

interface TierBadgeProps {
  tier: Tier;
}

export function TierBadge({ tier }: TierBadgeProps) {
  const { language } = useLanguage();

  const configs = {
    Bronze: {
      label: language === "fr" ? "Ligue Bronze" : "Bronze League",
      icon: Award,
      textClass: "text-amber-600",
      bgClass: "from-amber-900/20 to-amber-700/10 border-amber-800/40",
      glowClass: "shadow-[0_0_8px_rgba(217,119,6,0.15)]",
    },
    Silver: {
      label: language === "fr" ? "Ligue Argent" : "Silver League",
      icon: Trophy,
      textClass: "text-slate-300",
      bgClass: "from-slate-800/30 to-slate-700/10 border-slate-600/40",
      glowClass: "shadow-[0_0_8px_rgba(203,213,225,0.15)]",
    },
    Gold: {
      label: language === "fr" ? "Ligue Or" : "Gold League",
      icon: Crown,
      textClass: "text-yellow-400",
      bgClass: "from-yellow-950/20 to-yellow-700/10 border-yellow-500/30",
      glowClass: "shadow-[0_0_8px_rgba(234,179,8,0.2)]",
    },
    Diamond: {
      label: language === "fr" ? "Ligue Diamant" : "Diamond League",
      icon: Gem,
      textClass: "text-cyan-400 font-bold",
      bgClass: "from-cyan-950/30 to-purple-950/20 border-cyan-500/40 animate-pulse",
      glowClass: "shadow-[0_0_12px_rgba(6,182,212,0.3)]",
    },
  };

  const config = configs[tier] || configs.Bronze;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md border bg-gradient-to-r ${config.bgClass} ${config.glowClass}`}
    >
      <Icon className={`h-4.5 w-4.5 ${config.textClass} filter drop-shadow-[0_0_2px_currentColor]`} />
      <span className={`font-orbitron text-[11px] font-bold uppercase tracking-wider ${config.textClass}`}>
        {config.label}
      </span>
    </div>
  );
}
