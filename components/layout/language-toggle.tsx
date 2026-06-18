"use client";

import React from "react";
import { useLanguage } from "./language-provider";
import { Globe } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-1 bg-slate-950/60 border border-slate-850 p-0.5 rounded-lg font-orbitron text-[9px] font-bold tracking-widest shrink-0 shadow-inner">
      <button
        onClick={() => setLanguage("fr")}
        className={`px-2 py-1 rounded transition-all duration-200 uppercase ${
          language === "fr"
            ? "bg-violet-950/45 text-violet-400 border border-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
            : "text-slate-500 hover:text-slate-350 border border-transparent"
        }`}
      >
        FR
      </button>
      <button
        onClick={() => setLanguage("en")}
        className={`px-2 py-1 rounded transition-all duration-200 uppercase ${
          language === "en"
            ? "bg-violet-950/45 text-violet-400 border border-violet-500/20 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
            : "text-slate-500 hover:text-slate-350 border border-transparent"
        }`}
      >
        EN
      </button>
    </div>
  );
}
