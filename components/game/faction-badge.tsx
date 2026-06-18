"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Zap, Sun, Moon, Shield } from "lucide-react";
import { Faction } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";

interface FactionBadgeProps {
  faction: Faction;
  glow?: boolean;
}

export function FactionBadge({
  faction,
  glow = true,
}: FactionBadgeProps) {
  const { t, language } = useLanguage();

  const configs = {
    "Shadow Runners": {
      variant: "shadow" as const,
      icon: Zap,
      label: t("shadowRunners"),
      iconClass: "text-violet-400 h-3 w-3",
    },
    "Solar Cyclists": {
      variant: "solar" as const,
      icon: Sun,
      label: t("solarCyclists"),
      iconClass: "text-amber-400 h-3 w-3",
    },
    "Lunar Walkers": {
      variant: "lunar" as const,
      icon: Moon,
      label: t("lunarWalkers"),
      iconClass: "text-cyan-400 h-3 w-3",
    },
    "Neutral": {
      variant: "neutral" as const,
      icon: Shield,
      label: language === "fr" ? "Vagabond Neutre" : "Neutral Wanderer",
      iconClass: "text-slate-400 h-3 w-3",
    },
  };

  const config = configs[faction] || configs["Neutral"];
  const Icon = config.icon;

  return (
    <Badge variant={config.variant} glow={glow} className="gap-1">
      <Icon className={config.iconClass} />
      <span>{config.label}</span>
    </Badge>
  );
}
