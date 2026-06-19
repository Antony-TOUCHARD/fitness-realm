"use client";

import React from "react";
import { X, Calendar, Clock, Heart, TrendingUp, Sparkles, Coins, ShieldCheck, ShieldAlert, Navigation } from "lucide-react";
import { Workout } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";
import { Badge } from "@/components/ui/badge";
import dynamic from "next/dynamic";

const WorkoutMap = dynamic(() => import("./workout-map"), { ssr: false });

interface WorkoutDetailModalProps {
  workout: Workout | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WorkoutDetailModal({ workout, isOpen, onClose }: WorkoutDetailModalProps) {
  const { language } = useLanguage();

  if (!isOpen || !workout) return null;

  const dateFormatted = new Date(workout.start_date).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const effectiveDuration = workout.duration || Math.round(
    workout.distance * (workout.activity_type === "Run" ? 330 : workout.activity_type === "Ride" ? 150 : 720)
  );

  const formatDuration = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
    }
    return `${mins}m ${secs.toString().padStart(2, "0")}s`;
  };

  const formatSpeedOrPace = (w: Workout, durationSec: number): string => {
    if (!w.distance || w.distance <= 0) {
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

  const getTranslatedType = (type: string) => {
    if (language === "fr") {
      if (type === "Run") return "Course";
      if (type === "Ride") return "Vélo";
      if (type === "Walk") return "Marche";
      if (type === "Hike") return "Randonnée";
      if (type === "Swim") return "Natation";
    }
    return type;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div 
        className="w-full max-w-3xl bg-[#111128]/95 border border-slate-800 rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden relative max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-20 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Map Column */}
        <div className="w-full md:w-1/2 h-64 md:h-auto min-h-[300px] relative bg-slate-950/40">
          <WorkoutMap polyline={workout.summary_polyline || null} coordinates={workout.coordinates || null} />
        </div>

        {/* Info Column */}
        <div className="w-full md:w-1/2 p-6 flex flex-col justify-between space-y-6 overflow-y-auto">
          {/* Header */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 pr-8">
              <span className="font-orbitron font-extrabold text-base text-slate-100 tracking-wider">
                {workout.name}
              </span>
              <Badge variant={workout.activity_type === "Run" ? "primary" : workout.activity_type === "Ride" ? "accent" : "secondary"}>
                {getTranslatedType(workout.activity_type)}
              </Badge>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="h-3.5 w-3.5 text-slate-500" />
              <span className="capitalize">{dateFormatted}</span>
            </div>

            <div className="flex gap-2 pt-1">
              {workout.anti_cheat_status === "Flagged" ? (
                <Badge variant="danger" className="gap-1">
                  <ShieldAlert className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "Suspect" : "Flagged"}</span>
                </Badge>
              ) : (
                <Badge variant="secondary" className="gap-1 !text-teal-400 !bg-teal-950/20 !border-teal-500/30">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "Vérifié" : "Verified"}</span>
                </Badge>
              )}
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3.5">
            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-1">
              <span className="block text-[8px] text-slate-500 font-orbitron font-bold uppercase tracking-wider">
                Distance
              </span>
              <span className="block text-sm font-orbitron font-black text-slate-200">
                {workout.distance.toFixed(2)} km
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-1">
              <span className="block text-[8px] text-slate-500 font-orbitron font-bold uppercase tracking-wider">
                {language === "fr" ? "Durée" : "Duration"}
              </span>
              <span className="block text-sm font-orbitron font-black text-slate-200">
                {formatDuration(effectiveDuration)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-1">
              <span className="block text-[8px] text-slate-500 font-orbitron font-bold uppercase tracking-wider">
                {workout.activity_type === "Run" ? (language === "fr" ? "Allure Moyenne" : "Avg Pace") : (language === "fr" ? "Vitesse Moyenne" : "Avg Speed")}
              </span>
              <span className="block text-sm font-orbitron font-black text-slate-200">
                {formatSpeedOrPace(workout, effectiveDuration)}
              </span>
            </div>

            <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-1">
              <span className="block text-[8px] text-slate-500 font-orbitron font-bold uppercase tracking-wider">
                {language === "fr" ? "Dénivelé" : "Elevation Gain"}
              </span>
              <span className="block text-sm font-orbitron font-black text-slate-200">
                {workout.elevation_gain} m
              </span>
            </div>

            {workout.avg_heartrate && (
              <div className="p-3 bg-slate-950/40 rounded-xl border border-slate-900/60 space-y-1 col-span-2 flex items-center justify-between">
                <div>
                  <span className="block text-[8px] text-slate-500 font-orbitron font-bold uppercase tracking-wider">
                    {language === "fr" ? "Fréquence Cardiaque" : "Heart Rate"}
                  </span>
                  <span className="block text-sm font-orbitron font-black text-slate-200">
                    {Math.round(workout.avg_heartrate)} bpm
                  </span>
                </div>
                <Heart className="h-6 w-6 text-pink-500 fill-pink-500/20 animate-pulse shrink-0 mr-1" />
              </div>
            )}
          </div>

          {/* Rewards */}
          <div className="bg-slate-950/50 border border-slate-900 rounded-xl p-4 space-y-2.5">
            <span className="block font-orbitron text-[9px] font-black text-slate-500 tracking-wider uppercase">
              {language === "fr" ? "RÉCOMPENSES OBTENUES" : "QUEST REWARDS"}
            </span>
            <div className="flex gap-3">
              <div className="flex-1 flex items-center justify-center gap-1.5 bg-violet-950/20 border border-violet-850/40 py-2 rounded-lg text-violet-400 font-orbitron text-xs font-bold shadow-[0_0_8px_rgba(139,92,246,0.1)]">
                <Sparkles className="h-4 w-4 filter drop-shadow-[0_0_2px_currentColor]" />
                <span>+{workout.xp_gained} XP</span>
              </div>
              <div className="flex-1 flex items-center justify-center gap-1.5 bg-amber-950/20 border border-amber-850/40 py-2 rounded-lg text-amber-400 font-orbitron text-xs font-bold shadow-[0_0_8px_rgba(245,158,11,0.1)]">
                <Coins className="h-4 w-4 filter drop-shadow-[0_0_2px_currentColor]" />
                <span>+{workout.gold_gained} {language === "fr" ? "OR" : "GOLD"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
