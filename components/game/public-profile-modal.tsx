"use client";

import React, { useEffect, useState } from "react";
import { X, Calendar, MapPin, Sparkles, RefreshCw, Swords, Shield, Heart, Milestone, Coins } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FactionBadge } from "@/components/game/faction-badge";
import { Profile, Workout, Faction } from "@/lib/types";
import { WorkoutDetailModal } from "@/components/game/workout-detail-modal";
import {
  isDemoMode,
  demoProfile,
  demoWorkouts,
  simulatedAthletes,
  simulatedWorkouts,
  DEMO_USER_ID
} from "@/lib/demo-data";

interface PublicProfileModalProps {
  userId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function PublicProfileModal({ userId, isOpen, onClose }: PublicProfileModalProps) {
  const [profile, setProfile] = useState<any | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);
  
  // Cosmetics loaded locally or simulated
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [equippedBorder, setEquippedBorder] = useState<string | null>(null);
  const [equippedCompanion, setEquippedCompanion] = useState<string | null>(null);

  useEffect(() => {
    if (!userId || !isOpen) return;
    const activeId = userId;

    async function loadPublicData() {
      setLoading(true);
      setProfile(null);
      setWorkouts([]);
      setEquippedTitle(null);
      setEquippedBorder(null);
      setEquippedCompanion(null);

      const isSimulated = activeId.startsWith("sim-athlete-");
      const isDemo = isDemoMode();

      if (isSimulated) {
        // Load simulated athlete
        const athlete = simulatedAthletes.find((a) => a.id === activeId);
        if (athlete) {
          const mockProfile = {
            id: athlete.id,
            username: athlete.username,
            avatar_url: `https://api.dicebear.com/7.x/adventurer/svg?seed=${athlete.username}`,
            level: athlete.level || 1,
            xp: 0,
            gold: 150,
            faction: athlete.faction,
            city: athlete.city || "Paris",
            age: athlete.age || 25,
            created_at: "2026-01-01T00:00:00Z"
          };
          setProfile(mockProfile);

          // Filter simulated workouts
          const athleteWorkouts = simulatedWorkouts.filter((w) => w.user_id === activeId);
          setWorkouts(athleteWorkouts);

          // Simulated cosmetics based on level & faction
          if (athlete.level && athlete.level > 15) {
            setEquippedTitle("Légende du Dénivelé");
            setEquippedBorder("gold-master-glow");
            setEquippedCompanion("Phénix Solaire");
          } else if (athlete.level && athlete.level > 8) {
            setEquippedTitle(athlete.faction === "Shadow Runners" ? "Éclaireur de l'Ombre" : "Champion Solaire");
            setEquippedBorder(athlete.faction === "Shadow Runners" ? "shadow-glow" : "solar-glow");
            setEquippedCompanion("Mini-Golem");
          }
        }
        setLoading(false);
      } else if (isDemo && activeId === DEMO_USER_ID) {
        // Load current demo user with overrides
        let activeProfile = {
          id: DEMO_USER_ID,
          username: "ShadowBlade",
          avatar_url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Buster",
          level: 1,
          xp: 1050,
          gold: 104,
          faction: "Shadow Runners" as Faction,
          created_at: "2026-06-16T12:00:00Z",
          city: "Malakoff",
          age: 28
        };

        const fallbackKey = `fitness-realm-profile-fallback-${DEMO_USER_ID}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            activeProfile = { ...activeProfile, ...fallback };
          } catch {}
        }
        setProfile(activeProfile);
        setWorkouts(demoWorkouts);

        // Load equipped cosmetics from local storage fallbacks
        setEquippedTitle(localStorage.getItem(`fitness-realm-equipped-title-${DEMO_USER_ID}`) || null);
        setEquippedBorder(localStorage.getItem(`fitness-realm-equipped-border-${DEMO_USER_ID}`) || null);
        setEquippedCompanion(localStorage.getItem(`fitness-realm-equipped-companion-${DEMO_USER_ID}`) || null);
        setLoading(false);
      } else {
        // Load live user from Supabase
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          
          const { data: pData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", activeId)
            .single();

          if (pData) {
            let activeProfile = pData;
            const fallbackKey = `fitness-realm-profile-fallback-${pData.id}`;
            const fallbackRaw = localStorage.getItem(fallbackKey);
            if (fallbackRaw) {
              try {
                const fallback = JSON.parse(fallbackRaw);
                activeProfile = { ...activeProfile, ...fallback };
              } catch {}
            }
            setProfile(activeProfile);

            // Fetch equipped cosmetics from LocalStorage if they exist for this user on their device
            setEquippedTitle(localStorage.getItem(`fitness-realm-equipped-title-${pData.id}`) || null);
            setEquippedBorder(localStorage.getItem(`fitness-realm-equipped-border-${pData.id}`) || null);
            setEquippedCompanion(localStorage.getItem(`fitness-realm-equipped-companion-${pData.id}`) || null);
          }

          const { data: wData } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", activeId)
            .order("start_date", { ascending: false });

          if (wData) {
            setWorkouts(wData);
          }
        } catch (err) {
          console.error("Error loading public profile modal details:", err);
        } finally {
          setLoading(false);
        }
      }
    }

    loadPublicData();
  }, [userId, isOpen]);

  if (!isOpen || !userId) return null;

  // Aggregate stats
  const totalQuests = workouts.length;
  const totalDistance = workouts.reduce((sum, w) => sum + Number(w.distance), 0);
  const totalElevation = workouts.reduce((sum, w) => sum + Number(w.elevation_gain), 0);

  const formattedJoinDate = profile
    ? new Date(profile.created_at).toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric"
      })
    : "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-4xl max-h-[90vh] bg-[#111128]/95 border border-slate-800/80 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 p-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-slate-200 transition"
        >
          <X className="h-5 w-5" />
        </button>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 min-h-[50vh] gap-3">
            <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
            <span className="font-orbitron text-xs tracking-widest text-slate-500 uppercase">
              Lecture du Grimoire du Héros...
            </span>
          </div>
        ) : profile ? (
          <div className="flex flex-col md:flex-row overflow-hidden flex-1">
            {/* Left Column: Faction details & Avatar */}
            <div className="w-full md:w-1/3 p-6 border-b md:border-b-0 md:border-r border-slate-900/80 bg-slate-950/15 flex flex-col items-center text-center justify-between">
              <div className="w-full space-y-4 flex flex-col items-center">
                {/* Avatar with equipped border glow */}
                <div className="relative mt-4">
                  <div className={`rounded-3xl p-1 bg-slate-950/60 ${
                    equippedBorder === "shadow-glow"
                      ? "shadow-[0_0_15px_rgba(139,92,246,0.7)] border border-violet-500/50"
                      : equippedBorder === "solar-glow"
                      ? "shadow-[0_0_15px_rgba(245,158,11,0.7)] border border-amber-500/50"
                      : equippedBorder === "lunar-glow"
                      ? "shadow-[0_0_15px_rgba(6,182,212,0.7)] border border-cyan-500/50"
                      : equippedBorder === "rainbow-glow"
                      ? "shadow-[0_0_18px_rgba(236,72,153,0.8)] border border-pink-500/50 animate-pulse"
                      : equippedBorder === "gold-master-glow"
                      ? "shadow-[0_0_15px_rgba(234,179,8,0.8)] border border-yellow-400/70"
                      : equippedBorder === "rookie-iron"
                      ? "border-2 border-slate-500 shadow-[0_0_8px_rgba(148,163,184,0.4)]"
                      : "border border-slate-800"
                  }`}>
                    {profile.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.username}
                        className="h-24 w-24 rounded-2xl object-cover shadow-inner"
                      />
                    ) : (
                      <div className="h-24 w-24 rounded-2xl bg-slate-900 flex items-center justify-center font-orbitron text-3xl font-black text-slate-355 shadow-inner">
                        {profile.username.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-violet-600 border-2 border-[#111128] flex items-center justify-center font-orbitron text-xs font-black text-slate-100 shadow-lg">
                    {profile.level}
                  </div>
                </div>

                {/* Identity */}
                <div>
                  <h3 className="font-orbitron font-extrabold text-lg text-slate-100 uppercase tracking-widest leading-snug">
                    {profile.username}
                  </h3>

                  {equippedTitle && (
                    <div className="text-[10px] font-orbitron font-bold text-violet-400 tracking-wider mt-1 uppercase animate-pulse">
                      🛡️ {equippedTitle}
                    </div>
                  )}

                  {/* Companion (Pet) Display */}
                  {equippedCompanion && (
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 mt-2 bg-slate-900 border border-slate-850 rounded-full text-[9px] font-bold text-amber-400 font-orbitron uppercase">
                      🐾 {equippedCompanion}
                    </div>
                  )}
                </div>

                <div>
                  <FactionBadge faction={profile.faction} />
                </div>

                {/* Stats summary */}
                <div className="w-full grid grid-cols-2 gap-2 mt-4 text-left">
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/60">
                    <span className="block text-[8px] text-slate-500 font-orbitron font-semibold uppercase tracking-wider">
                      Distance
                    </span>
                    <span className="block text-sm font-orbitron font-bold text-slate-200 mt-0.5">
                      {Math.round(totalDistance * 10) / 10} km
                    </span>
                  </div>
                  <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/60">
                    <span className="block text-[8px] text-slate-500 font-orbitron font-semibold uppercase tracking-wider">
                      Dénivelé
                    </span>
                    <span className="block text-sm font-orbitron font-bold text-slate-200 mt-0.5">
                      {totalElevation} m
                    </span>
                  </div>
                </div>
              </div>

              {/* Geographic details */}
              <div className="w-full space-y-2 text-xs font-orbitron font-bold text-slate-400 pt-4 border-t border-slate-900/60">
                {profile.city && (
                  <div className="flex items-center justify-center gap-1.5 text-slate-350">
                    <MapPin className="h-3.5 w-3.5 text-cyan-400" />
                    <span>{profile.city}</span>
                  </div>
                )}
                {profile.age && (
                  <div className="flex items-center justify-center gap-1.5">
                    <span>🎂 {profile.age} ans</span>
                  </div>
                )}
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-500 uppercase">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Rejoint en {formattedJoinDate}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Quest Journal (Workouts) */}
            <div className="flex-1 p-6 flex flex-col overflow-hidden max-h-full">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-900/60 shrink-0">
                <Swords className="h-4.5 w-4.5 text-violet-500" />
                <h4 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-widest uppercase">
                  Journal des Quêtes ({totalQuests})
                </h4>
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                {workouts.length > 0 ? (
                  workouts.map((w) => {
                    const sportIcon =
                      w.activity_type === "Run" ? "🏃" :
                      w.activity_type === "Ride" ? "🚴" :
                      w.activity_type === "Walk" || w.activity_type === "Hike" ? "🚶" : "💪";

                    const sportLabel =
                      w.activity_type === "Run" ? "Course" :
                      w.activity_type === "Ride" ? "Vélo" :
                      w.activity_type === "Walk" || w.activity_type === "Hike" ? "Marche" : "Autre";

                    const wDate = new Date(w.start_date).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "short"
                    });

                    return (
                      <div
                        key={w.id}
                        onClick={() => setSelectedWorkout(w)}
                        className="p-3 bg-[#111128]/40 border border-slate-900/80 rounded-xl hover:border-violet-500/50 hover:bg-[#111128]/70 cursor-pointer transition-all duration-200 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-slate-950/40 border border-slate-850 flex items-center justify-center text-lg shadow-inner shrink-0">
                            {sportIcon}
                          </div>
                          <div>
                            <span className="block font-orbitron font-extrabold text-xs text-slate-200 uppercase leading-snug">
                              {w.name}
                            </span>
                            <span className="block text-[10px] text-slate-500 font-semibold mt-0.5">
                              {sportLabel} • {wDate}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 text-right font-orbitron text-xs">
                          <div>
                            <span className="block text-[10px] text-slate-450 font-bold">
                              {Math.round(Number(w.distance) * 10) / 10} km
                            </span>
                            <span className="block text-[9px] text-slate-500">
                              ▲ {w.elevation_gain} m
                            </span>
                          </div>

                          <div className="shrink-0 space-y-0.5">
                            <span className="flex items-center gap-1 font-bold text-violet-400 leading-none">
                              <Sparkles className="h-3 w-3" />
                              <span>+{w.xp_gained}</span>
                            </span>
                            <span className="flex items-center gap-1 font-bold text-amber-400 leading-none">
                              <Coins className="h-3 w-3" />
                              <span>+{w.gold_gained}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center p-8 text-center text-slate-500 gap-2 h-48">
                    <Milestone className="h-8 w-8 text-slate-700" />
                    <span className="font-orbitron text-xs font-semibold">
                      Aucune quête enregistrée pour ce héros.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-rose-500 font-orbitron text-sm">
            Héros introuvable.
          </div>
        )}
      </div>

      <WorkoutDetailModal
        workout={selectedWorkout}
        isOpen={selectedWorkout !== null}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  );
}
