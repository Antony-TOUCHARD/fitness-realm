"use client";

import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Footprints, Bike, Heart, TrendingUp, Sparkles, Coins, Calendar, ShieldCheck, ShieldAlert } from "lucide-react";
import { Workout } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";

interface WorkoutCardProps {
  workout: Workout;
  onClick?: () => void;
}

export function WorkoutCard({ workout, onClick }: WorkoutCardProps) {
  const [revealed, setRevealed] = useState(false);
  const { t, language } = useLanguage();

  const effectiveDuration = workout.duration && workout.duration > 0 ? workout.duration : null;

  const formatDuration = (seconds: number | null): string => {
    if (seconds === null) return "--";
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, "0")}m`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const formatSpeedOrPace = (w: Workout, durationSec: number | null): string => {
    if (durationSec === null || !w.distance || w.distance <= 0) {
      return "--";
    }
    if (w.activity_type === "Run") {
      const secondsPerKm = durationSec / w.distance;
      const mins = Math.floor(secondsPerKm / 60);
      const secs = Math.round(secondsPerKm % 60);
      return `${mins}:${secs.toString().padStart(2, "0")} min/km`;
    } else {
      const speedKmh = w.distance / (durationSec / 3600);
      return `${speedKmh.toFixed(1)} km/h`;
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setRevealed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const typeConfig = {
    Run: {
      icon: Footprints,
      badgeVariant: "primary" as const,
      glowColor: "violet" as const,
      bg: "from-violet-950/20 to-transparent",
      border: "border-violet-950/40",
      accentText: "text-violet-400",
    },
    Ride: {
      icon: Bike,
      badgeVariant: "accent" as const,
      glowColor: "amber" as const,
      bg: "from-amber-950/20 to-transparent",
      border: "border-amber-950/40",
      accentText: "text-amber-400",
    },
    Walk: {
      icon: Footprints,
      badgeVariant: "secondary" as const,
      glowColor: "cyan" as const,
      bg: "from-cyan-950/20 to-transparent",
      border: "border-cyan-950/40",
      accentText: "text-cyan-400",
    },
  };

  const config = typeConfig[workout.activity_type as keyof typeof typeConfig] || {
    icon: Footprints,
    badgeVariant: "neutral" as const,
    glowColor: "none" as const,
    bg: "from-slate-900/40 to-transparent",
    border: "border-slate-800",
    accentText: "text-slate-400",
  };

  const IconComponent = config.icon;

  const dateFormatted = new Date(workout.start_date).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const getTranslatedType = (type: string) => {
    if (language === "fr") {
      if (type === "Run") return "Course";
      if (type === "Ride") return "Vélo";
      if (type === "Walk") return "Marche";
      if (type === "Hike") return "Rando";
      if (type === "Swim") return "Natation";
    }
    return type;
  };

  return (
    <Card
      glowColor={config.glowColor}
      onClick={onClick}
      className={`relative overflow-hidden border ${config.border} bg-gradient-to-br ${config.bg} p-5 ${
        onClick ? "cursor-pointer hover:border-slate-650/80 transition-all duration-200" : ""
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Left Side: Icon & Title */}
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-xl bg-slate-950/70 border border-slate-800 shrink-0 ${config.accentText}`}>
            <IconComponent className="h-6 w-6 filter drop-shadow-[0_0_4px_currentColor]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-orbitron font-extrabold text-sm text-slate-100 tracking-wider">
                {workout.name}
              </span>
              <Badge variant={config.badgeVariant} glow={false}>
                {getTranslatedType(workout.activity_type)}
              </Badge>
              {workout.anti_cheat_status === "Flagged" && (
                <Badge variant="danger" className="gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "Suspect" : "Flagged"}</span>
                </Badge>
              )}
              {workout.anti_cheat_status === "Verified" && (
                <Badge variant="secondary" className="gap-1 !text-teal-400 !bg-teal-950/20 !border-teal-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "Vérifié" : "Verified"}</span>
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span>{dateFormatted}</span>
            </div>
          </div>
        </div>

        {/* Right Side: Stats details */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-1">
            <span className="text-slate-500">{language === "fr" ? "Dist :" : "Dist:"}</span>
            <span className="font-semibold text-slate-200">{workout.distance.toFixed(2)} km</span>
          </div>
          {effectiveDuration && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">{language === "fr" ? "Durée :" : "Time:"}</span>
              <span className="font-semibold text-slate-200">{formatDuration(effectiveDuration)}</span>
            </div>
          )}
          {effectiveDuration && (
            <div className="flex items-center gap-1">
              <span className="text-slate-500">{workout.activity_type === "Run" ? (language === "fr" ? "Allure :" : "Pace:") : (language === "fr" ? "Vit :" : "Speed:")}</span>
              <span className="font-semibold text-slate-200">{formatSpeedOrPace(workout, effectiveDuration)}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <TrendingUp className="h-4 w-4 text-rose-500" />
            <span className="font-semibold text-slate-200">{workout.elevation_gain} m</span>
          </div>
          {workout.avg_heartrate && (
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4 text-pink-500 fill-pink-500/20" />
              <span className="font-semibold text-slate-200">{Math.round(workout.avg_heartrate)} bpm</span>
            </div>
          )}
        </div>
      </div>

      {/* Rewards Row with fade-in reveal */}
      <div
        className={`mt-4 pt-4 border-t border-slate-900/60 flex items-center justify-start gap-4 transition-all duration-700 ease-out ${
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
        }`}
      >
        <span className="font-orbitron text-[10px] font-black text-slate-500 tracking-wider">
          {language === "fr" ? "RÉCOMPENSES DE QUÊTE :" : "QUEST REWARDS:"}
        </span>
        
        <div className="flex items-center gap-1.5 bg-violet-950/20 border border-violet-850/40 px-3 py-1 rounded-lg text-violet-400 font-orbitron text-xs font-bold shadow-[0_0_8px_rgba(139,92,246,0.1)]">
          <Sparkles className="h-3.5 w-3.5 filter drop-shadow-[0_0_2px_currentColor]" />
          <span>+{workout.xp_gained} XP</span>
        </div>

        <div className="flex items-center gap-1.5 bg-amber-950/20 border border-amber-850/40 px-3 py-1 rounded-lg text-amber-400 font-orbitron text-xs font-bold shadow-[0_0_8px_rgba(245,158,11,0.1)]">
          <Coins className="h-3.5 w-3.5 filter drop-shadow-[0_0_2px_currentColor]" />
          <span>+{workout.gold_gained} {language === "fr" ? "OR" : "GOLD"}</span>
        </div>
      </div>
    </Card>
  );
}
