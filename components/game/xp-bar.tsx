"use client";

import React from "react";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Shield } from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";

interface XPBarProps {
  level: number;
  currentXP: number;
  xpRequired: number;
  animate?: boolean;
}

export function XPBar({
  level,
  currentXP,
  xpRequired,
  animate = true,
}: XPBarProps) {
  const { language } = useLanguage();

  return (
    <div className="flex items-center gap-4 w-full glass-card p-4 rounded-xl border border-violet-950/40 shadow-[0_0_15px_rgba(139,92,246,0.05)] bg-[#111128]/40">
      <div className="relative flex items-center justify-center h-14 w-14 shrink-0">
        <Shield className="h-14 w-14 text-violet-500 fill-violet-950/40 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]" />
        <div className="absolute flex flex-col items-center justify-center font-orbitron">
          <span className="text-[10px] text-violet-400 font-bold uppercase leading-none">LVL</span>
          <span className="text-lg font-black text-slate-100 leading-none">{level}</span>
        </div>
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-end mb-1">
          <span className="font-orbitron font-bold text-xs text-slate-350 tracking-wider">
            {language === "fr" ? "PROGRESSION DU HÉROS" : "HERO PROGRESSION"}
          </span>
          <span className="font-orbitron text-[11px] font-semibold text-violet-350">
            {currentXP} / {xpRequired} XP
          </span>
        </div>
        <ProgressBar
          value={currentXP}
          max={xpRequired}
          color="violet"
          animate={animate}
        />
      </div>
    </div>
  );
}
