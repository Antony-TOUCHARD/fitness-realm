"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  Coins,
  Shield,
  Sparkles,
  RefreshCw,
  Milestone,
  TrendingUp,
  Calendar,
  Heart,
  Award,
  Edit2,
  Save,
  X,
  User,
  Image as ImageIcon,
  MapPin,
  Copy,
  ChevronRight,
  Flame,
  Check,
  Activity,
  ChevronLeft
} from "lucide-react";
import { XPBar } from "@/components/game/xp-bar";
import { FactionBadge } from "@/components/game/faction-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Profile, Workout, CoachingAnswers, CoachingProgram, PlannedWorkout, CoachingWeek } from "@/lib/types";
import { isDemoMode, demoProfile, demoWorkouts, demoCities } from "@/lib/demo-data";
import { useLanguage } from "@/components/layout/language-provider";

const PRESET_AVATARS = [
  { name: "Shadow Runner", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Buster" },
  { name: "Solar Cyclist", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Felix" },
  { name: "Lunar Walker", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Aneka" },
  { name: "Shadow Rogue", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack" },
  { name: "Solar Cleric", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Lily" },
  { name: "Lunar Paladin", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sassy" },
];

const RUN_PACES = [
  { id: "7:30", label: "Débutant / Très tranquille (7:30 min/km)", emoji: "🐢" },
  { id: "7:00", label: "Tranquille / Footing très doux (7:00 min/km)", emoji: "🌱" },
  { id: "6:30", label: "Modéré / Jogging intermédiaire (6:30 min/km)", emoji: "🦊" },
  { id: "6:00", label: "Régulier / Footing actif (6:00 min/km)", emoji: "🐰" },
  { id: "5:30", label: "Rythmé / Coureur régulier (5:30 min/km)", emoji: "🦌" },
  { id: "5:00", label: "Rapide / Coureur avancé (5:00 min/km)", emoji: "🐆" },
  { id: "4:30", label: "Athlétique / Compétition (4:30 min/km)", emoji: "🦅" }
];

const RIDE_SPEEDS = [
  { id: "15 km/h", label: "Loisir / Débutant (15 km/h)", emoji: "🚲" },
  { id: "18 km/h", label: "Modéré / Sortie tranquille (18 km/h)", emoji: "🌳" },
  { id: "22 km/h", label: "Régulier / Cycliste actif (22 km/h)", emoji: "🚴" },
  { id: "26 km/h", label: "Rapide / Cycliste entraîné (26 km/h)", emoji: "⚡" },
  { id: "30 km/h", label: "Sportif / Sortie rythmée (30 km/h)", emoji: "🔥" }
];

const WALK_SPEEDS = [
  { id: "4.0 km/h", label: "Balade / Promenade (4.0 km/h)", emoji: "🚶" },
  { id: "4.5 km/h", label: "Modéré / Marche habituelle (4.5 km/h)", emoji: "🌳" },
  { id: "5.0 km/h", label: "Actif / Marche rythmée (5.0 km/h)", emoji: "👣" },
  { id: "5.5 km/h", label: "Rapide / Marche sportive (5.5 km/h)", emoji: "⚡" },
  { id: "6.0 km/h", label: "Très rapide / Randonnée active (6.0 km/h)", emoji: "⛰️" }
];

export default function ProfilePage() {
  const { t, language } = useLanguage();

  const getCoachingWeekDateRange = (startedAtStr: string, weekNumber: number) => {
    const startedAt = new Date(startedAtStr);
    const startDayOfWeek = startedAt.getUTCDay(); // 0 = Sunday, 1 = Monday, ...
    
    // We want the end of the first week to be the first Monday 00:00:00 UTC after startedAt.
    // If startedAt is Monday (1), days until next Monday (1) is 7 days.
    // If startedAt is Sunday (0), days until next Monday (1) is 1 day.
    // If startedAt is Wednesday (3), days until next Monday (1) is 5 days (8 - 3).
    const daysUntilFirstMonday = startDayOfWeek === 0 ? 1 : 8 - startDayOfWeek;
    
    const firstMonday = new Date(startedAt);
    firstMonday.setUTCDate(startedAt.getUTCDate() + daysUntilFirstMonday);
    firstMonday.setUTCHours(0, 0, 0, 0);

    if (weekNumber === 1) {
      return {
        start: startedAt,
        end: firstMonday,
      };
    } else {
      const weekStart = new Date(firstMonday);
      weekStart.setUTCDate(firstMonday.getUTCDate() + (weekNumber - 2) * 7);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setUTCDate(weekStart.getUTCDate() + 7);
      
      return {
        start: weekStart,
        end: weekEnd,
      };
    }
  };

  const autoCloseWeekIfNeeded = (program: CoachingProgram, userId: string) => {
    if (!program || !Array.isArray(program.weeks)) return null;

    let currentProgram = { ...program };
    let hasChanges = false;
    const now = new Date();

    while (true) {
      const startedAtVal = currentProgram.startedAt || new Date().toISOString();
      const currentWeekNum = currentProgram.currentWeekIndex + 1;
      
      const range = getCoachingWeekDateRange(startedAtVal, currentWeekNum);

      if (now > range.end) {
        const currentWeek = currentProgram.weeks[currentProgram.currentWeekIndex];
        
        // If the week index is already pointing to a week that has already been closed/processed
        // (i.e. status !== 'pending'), we just advance the index without re-running adaptation logic.
        if (currentWeek.status !== 'pending') {
          const isLastWeek = currentProgram.currentWeekIndex === currentProgram.weeks.length - 1;
          if (!isLastWeek) {
            currentProgram = {
              ...currentProgram,
              currentWeekIndex: currentProgram.currentWeekIndex + 1,
              claimed: false,
            };
            hasChanges = true;
            continue; // evaluate next week
          }
          break; // reached end of program
        }

        // If status is pending, we close it based on completion rate
        const totalWorkouts = currentWeek.workouts.length;
        const completedWorkouts = currentWeek.workouts.filter((w) => w.completed).length;
        const completionRate = completedWorkouts / totalWorkouts;

        let weekStatus: 'completed' | 'partial' | 'failed' = 'partial';
        let report = "";

        if (completionRate === 1.0) {
          weekStatus = 'completed';
          report = language === "fr"
            ? "Clôture automatique : Semaine complétée à 100%. Surcharge progressive appliquée : volume augmenté de +10% pour la semaine suivante."
            : "Auto-close: Week completed at 100%. Progressive overload applied: volume increased by +10% for the next week.";
        } else if (completionRate >= 0.5) {
          weekStatus = 'partial';
          report = language === "fr"
            ? "Clôture automatique : Semaine partiellement complétée. Volume stabilisé pour la semaine suivante."
            : "Auto-close: Week partially completed. Volume stabilized for the next week.";
        } else {
          weekStatus = 'failed';
          report = language === "fr"
            ? "Clôture automatique : Semaine incomplète. Volume de la semaine suivante réduit de -10% pour récupération et entraînements non complétés reportés."
            : "Auto-close: Week incomplete. Next week volume reduced by -10% for recovery, and incomplete sessions rolled over.";
        }

        const updatedWeeks = currentProgram.weeks.map((week, idx) => {
          if (idx === currentProgram.currentWeekIndex) {
            return {
              ...week,
              status: weekStatus,
              adaptationReport: report,
            };
          }
          
          // Apply negative adaptation (failed week: -10% target volume + rollover incomplete workouts)
          if (weekStatus === 'failed' && idx === currentProgram.currentWeekIndex + 1) {
            const incompleteWorkouts = currentWeek.workouts
              .filter((w) => !w.completed)
              .map((w) => ({
                ...w,
                id: `${w.id}-rollover`,
                name: `${w.name} (Reporté)`,
                completed: false,
                associatedWorkoutId: null,
                paceAccuracy: null,
              }));

            const adaptedNextWorkouts = week.workouts.map((w) => {
              return {
                ...w,
                targetDistance: w.targetDistance ? Math.round(w.targetDistance * 0.9 * 10) / 10 : null,
                targetDuration: w.targetDuration ? Math.round(w.targetDuration * 0.9) : null,
              };
            });

            return {
              ...week,
              workouts: [...adaptedNextWorkouts, ...incompleteWorkouts],
            };
          }

          // Apply positive adaptation (completed week: +10% target volume)
          if (weekStatus === 'completed' && idx === currentProgram.currentWeekIndex + 1) {
            const adaptedNextWorkouts = week.workouts.map((w) => {
              return {
                ...w,
                targetDistance: w.targetDistance ? Math.round(w.targetDistance * 1.1 * 10) / 10 : null,
                targetDuration: w.targetDuration ? Math.round(w.targetDuration * 1.1) : null,
              };
            });
            return {
              ...week,
              workouts: adaptedNextWorkouts,
            };
          }

          return week;
        });

        const isLastWeek = currentProgram.currentWeekIndex === currentProgram.weeks.length - 1;
        const nextWeekIndex = isLastWeek ? currentProgram.currentWeekIndex : currentProgram.currentWeekIndex + 1;

        currentProgram = {
          ...currentProgram,
          currentWeekIndex: nextWeekIndex,
          weeks: updatedWeeks,
          claimed: false,
        };
        hasChanges = true;

        if (isLastWeek) break;
      } else {
        break; // Current week deadline not yet passed
      }
    }

    return hasChanges ? currentProgram : null;
  };

  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editUsername, setEditUsername] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editAge, setEditAge] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [saving, setSaving] = useState(false);
  const [dbWarning, setDbWarning] = useState(false);
  const [importingStrava, setImportingStrava] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [apiSuggestions, setApiSuggestions] = useState<{ name: string; department_id: string }[]>([]);
  const [apiLoading, setApiLoading] = useState(false);

  // Equipped cosmetics state
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [equippedBorder, setEquippedBorder] = useState<string | null>(null);
  const [equippedCompanion, setEquippedCompanion] = useState<string | null>(null);
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [customizerTab, setCustomizerTab] = useState<"titles" | "borders" | "companions">("titles");

  // Coaching & Streak state
  const [coachingProgram, setCoachingProgram] = useState<CoachingProgram | null>(null);
  const [coachingStep, setCoachingStep] = useState<number>(0); // 0 = idle/active program, 1-4 = questionnaire steps
  const [coachingAnswers, setCoachingAnswers] = useState<Partial<CoachingAnswers>>({});
  const [bonusExpires, setBonusExpires] = useState<number | null>(null);
  const [remainingBonusTime, setRemainingBonusTime] = useState<string>("");
  const [remainingWeekTime, setRemainingWeekTime] = useState<string>("");
  const [activeWeekTab, setActiveWeekTab] = useState<number>(1);
  const [workoutToAssociate, setWorkoutToAssociate] = useState<PlannedWorkout | null>(null);
  const [showAssociateModal, setShowAssociateModal] = useState<boolean>(false);
  const [coachingHours, setCoachingHours] = useState<number>(0);
  const [coachingMinutes, setCoachingMinutes] = useState<number>(30);
  const [coachingSeconds, setCoachingSeconds] = useState<number>(0);

  // Cosmetics lists with unlocking conditions and limited editions
  const titlesList = [
    { id: "title-recruit", name: "Recrue", value: "Recrue", isDefault: true, limited: false },
    { id: "title-adventurer", name: "Aventurier", value: "Aventurier", isDefault: true, limited: false },
    { id: "title-yvelines", name: "Le Fléau des Yvelines", value: "Le Fléau des Yvelines", isDefault: false, limited: false },
    { id: "title-malakoff", name: "Souverain de Malakoff", value: "Souverain de Malakoff", isDefault: false, limited: false },
    { id: "title-denivele", name: "Légende du Dénivelé", value: "Légende du Dénivelé", isDefault: false, limited: true },
    { id: "title-ombre", name: "Éclaireur de l'Ombre", value: "Éclaireur de l'Ombre", isDefault: false, limited: false },
    { id: "title-soleil", name: "Champion Solaire", value: "Champion Solaire", isDefault: false, limited: false },
    { id: "title-lune", name: "Nomade Lunaire", value: "Nomade Lunaire", isDefault: false, limited: false }
  ];

  const bordersList = [
    { id: "border-none", name: "Sans Cadre", value: null, isDefault: true, limited: false },
    { id: "border-rookie-iron", name: "Cadre en Fer", value: "rookie-iron", isDefault: true, limited: false },
    { id: "border-shadow", name: "Aura de l'Ombre", value: "shadow-glow", isDefault: false, limited: false, faction: "Shadow Runners" },
    { id: "border-solar", name: "Aurore Solaire", value: "solar-glow", isDefault: false, limited: false, faction: "Solar Cyclists" },
    { id: "border-lunar", name: "Brume Lunaire", value: "lunar-glow", isDefault: false, limited: false, faction: "Lunar Walkers" },
    { id: "border-rainbow", name: "Néon Arc-en-Ciel", value: "rainbow-glow", isDefault: false, limited: true },
    { id: "border-gold", name: "Cadre de Maître", value: "gold-master-glow", isDefault: false, limited: true }
  ];

  const companionsList = [
    { id: "companion-none", name: "Aucun", value: null, isDefault: true, limited: false },
    { id: "companion-golem", name: "Mini-Golem", value: "Mini-Golem", isDefault: false, levelRequired: 3, limited: false },
    { id: "companion-wolf", name: "Loup de l'Ombre", value: "Loup de l'Ombre", isDefault: false, faction: "Shadow Runners", limited: false },
    { id: "companion-phoenix", name: "Phénix Solaire", value: "Phénix Solaire", isDefault: false, faction: "Solar Cyclists", limited: false },
    { id: "companion-owl", name: "Chouette Lunaire", value: "Chouette Lunaire", isDefault: false, faction: "Lunar Walkers", limited: false },
    { id: "companion-dragon", name: "Dragon Cosmique", value: "Dragon Cosmique", isDefault: false, levelRequired: 8, limited: true }
  ];

  const handleEquipCosmetic = (type: "title" | "border" | "companion", value: string | null) => {
    if (!profile) return;
    const profileId = profile.id;

    let itemId: string | null = null;
    if (value) {
      if (type === "title") {
        const item = titlesList.find((t) => t.value === value);
        if (item) itemId = item.id;
      } else if (type === "border") {
        const item = bordersList.find((b) => b.value === value);
        if (item) itemId = item.id;
      } else if (type === "companion") {
        const item = companionsList.find((c) => c.value === value);
        if (item) itemId = item.id;
      }
    }

    if (type === "title") {
      setEquippedTitle(value);
    } else if (type === "border") {
      setEquippedBorder(value);
    } else if (type === "companion") {
      setEquippedCompanion(value);
    }

    if (isDemo) {
      if (type === "title") {
        if (value) localStorage.setItem(`fitness-realm-equipped-title-${profileId}`, value);
        else localStorage.removeItem(`fitness-realm-equipped-title-${profileId}`);
      } else if (type === "border") {
        if (value) localStorage.setItem(`fitness-realm-equipped-border-${profileId}`, value);
        else localStorage.removeItem(`fitness-realm-equipped-border-${profileId}`);
      } else if (type === "companion") {
        if (value) localStorage.setItem(`fitness-realm-equipped-companion-${profileId}`, value);
        else localStorage.removeItem(`fitness-realm-equipped-companion-${profileId}`);
      }
    } else {
      async function updateDBCosmetics() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const prefix = type === "title" ? "title-%" : type === "border" ? "border-%" : "companion-%";
          
          await supabase
            .from("unlocked_cosmetics")
            .update({ equipped: false })
            .eq("user_id", profileId)
            .like("item_id", prefix);

          if (itemId) {
            await supabase
              .from("unlocked_cosmetics")
              .update({ equipped: true })
              .eq("user_id", profileId)
              .eq("item_id", itemId);
          }
        } catch (err) {
          console.error("Failed to update database equipped cosmetic:", err);
        }
      }
      updateDBCosmetics();
    }

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  // Search cities via French Government API (or local fallback)
  useEffect(() => {
    const query = editCity.trim();
    if (query.length < 2) {
      setApiSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setApiLoading(true);
      try {
        const res = await fetch(`https://geo.api.gouv.fr/communes?nom=${encodeURIComponent(query)}&limit=10&fields=nom,codeDepartement`);
        if (res.ok) {
          const data = await res.json();
          if (data && data.length > 0) {
            const formatted = data.map((item: any) => ({
              name: item.nom,
              department_id: item.codeDepartement,
            }));
            setApiSuggestions(formatted);
            setApiLoading(false);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching French cities from API:", err);
      }

      // Fallback: search local demoCities if API fails or returns nothing
      const lowercaseQuery = query.toLowerCase();
      const localFiltered = demoCities
        .filter((c) => c.name.toLowerCase().includes(lowercaseQuery))
        .map((c) => ({
          name: c.name,
          department_id: c.department_id,
        }));
      setApiSuggestions(localFiltered);
      setApiLoading(false);
    }, 300); // 300ms debounce

    return () => clearTimeout(delayDebounceFn);
  }, [editCity]);

  const { runMastery, rideMastery, walkMastery } = React.useMemo(() => {
    let runXP = 0;
    let rideXP = 0;
    let walkXP = 0;

    workouts.forEach((w) => {
      const xp = Number(w.xp_gained || w.distance * 100);
      if (w.activity_type === "Run") {
        runXP += xp;
      } else if (w.activity_type === "Ride") {
        rideXP += xp;
      } else if (w.activity_type === "Walk" || w.activity_type === "Hike") {
        walkXP += xp;
      }
    });

    const getMastery = (xp: number) => {
      let lvl = 1;
      let req = 1000;
      let temp = xp;
      while (temp >= req) {
        temp -= req;
        lvl++;
        req = lvl * 1000;
      }
      return { level: lvl, currentXP: temp, xpRequired: req };
    };

    return {
      runMastery: getMastery(runXP),
      rideMastery: getMastery(rideXP),
      walkMastery: getMastery(walkXP),
    };
  }, [workouts]);

  const isDemo = isDemoMode();

  useEffect(() => {
    async function getProfileData() {
      let activeProfile: Profile | null = null;
      let activeWorkouts: Workout[] = [];
      let dbUnlocked: string[] = [];
      let dbEquippedTitle: string | null = null;
      let dbEquippedBorder: string | null = null;
      let dbEquippedCompanion: string | null = null;
      let dbCoaching: CoachingProgram | null = null;
      let dbBonusExpires: number | null = null;

      if (isDemo) {
        activeProfile = { ...demoProfile };
        activeWorkouts = [...demoWorkouts];
      } else {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            if (profileData) activeProfile = profileData;

            const { data: workoutsData } = await supabase
              .from("workouts")
              .select("*")
              .eq("user_id", user.id);
            if (workoutsData) activeWorkouts = workoutsData;

            const { data: cosmeticsData } = await supabase
              .from("unlocked_cosmetics")
              .select("item_id, equipped")
              .eq("user_id", user.id);
            
            if (cosmeticsData) {
              dbUnlocked = cosmeticsData.map(c => c.item_id);
              
              const eqTitleItem = cosmeticsData.find(c => c.equipped && c.item_id.startsWith("title-"));
              if (eqTitleItem) {
                const titleObj = titlesList.find(t => t.id === eqTitleItem.item_id);
                if (titleObj) dbEquippedTitle = titleObj.value;
              }

              const eqBorderItem = cosmeticsData.find(c => c.equipped && c.item_id.startsWith("border-"));
              if (eqBorderItem) {
                const borderObj = bordersList.find(b => b.id === eqBorderItem.item_id);
                if (borderObj) dbEquippedBorder = borderObj.value;
              }

              const eqCompanionItem = cosmeticsData.find(c => c.equipped && c.item_id.startsWith("companion-"));
              if (eqCompanionItem) {
                const companionObj = companionsList.find(c => c.id === eqCompanionItem.item_id);
                if (companionObj) dbEquippedCompanion = companionObj.value;
              }
            }

            const { data: coachingData } = await supabase
              .from("coaching_programs")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (coachingData) {
              const programLoaded: CoachingProgram = {
                name: coachingData.name,
                sport: coachingData.sport as any,
                planType: coachingData.plan_type,
                currentWeekIndex: coachingData.current_week_index,
                targetPaces: coachingData.target_paces as any,
                weeks: coachingData.weeks_data as any,
                claimed: coachingData.claimed,
                startedAt: coachingData.created_at,
              };

              const autoClosed = autoCloseWeekIfNeeded(programLoaded, user.id);
              if (autoClosed) {
                dbCoaching = autoClosed;
                supabase
                  .from("coaching_programs")
                  .update({
                    current_week_index: autoClosed.currentWeekIndex,
                    weeks_data: autoClosed.weeks,
                    claimed: autoClosed.claimed,
                  })
                  .eq("user_id", user.id)
                  .then(({ error }) => {
                    if (error) console.error("Error saving auto-closed program to DB:", error);
                  });
              } else {
                dbCoaching = programLoaded;
              }
            }

            const { data: boostData } = await supabase
              .from("active_boosts")
              .select("*")
              .eq("user_id", user.id)
              .maybeSingle();
            
            if (boostData) {
              const exp = new Date(boostData.expires_at).getTime();
              if (exp > Date.now()) {
                dbBonusExpires = exp;
              } else {
                await supabase.from("active_boosts").delete().eq("user_id", user.id);
              }
            }
          }
        } catch (err) {
          console.error("Error fetching live profile:", err);
        }
      }

      if (activeProfile) {
        const fallbackKey = `fitness-realm-profile-fallback-${activeProfile.id}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            activeProfile = {
              ...activeProfile,
              username: fallback.username || activeProfile.username,
              avatar_url: fallback.avatar_url !== undefined ? fallback.avatar_url : activeProfile.avatar_url,
              city: fallback.city !== undefined ? fallback.city : activeProfile.city,
              age: fallback.age !== undefined ? fallback.age : activeProfile.age,
              gold: fallback.gold !== undefined ? fallback.gold : activeProfile.gold,
            };
          } catch {}
        }
      }

      if (activeProfile) {
        if (isDemo) {
          setEquippedTitle(localStorage.getItem(`fitness-realm-equipped-title-${activeProfile.id}`) || null);
          setEquippedBorder(localStorage.getItem(`fitness-realm-equipped-border-${activeProfile.id}`) || null);
          setEquippedCompanion(localStorage.getItem(`fitness-realm-equipped-companion-${activeProfile.id}`) || null);

          const unlockedKey = `fitness-realm-unlocked-${activeProfile.id}`;
          const unlockedRaw = localStorage.getItem(unlockedKey);
          if (unlockedRaw) {
            try {
              setUnlockedItems(JSON.parse(unlockedRaw));
            } catch {}
          } else {
            const defaultUnlocked = ["title-recruit"];
            localStorage.setItem(unlockedKey, JSON.stringify(defaultUnlocked));
            setUnlockedItems(defaultUnlocked);
          }

          const programKey = `fitness-realm-coaching-program-${activeProfile.id}`;
          const programRaw = localStorage.getItem(programKey);
          if (programRaw) {
            try {
              const parsed = JSON.parse(programRaw);
              const autoClosed = autoCloseWeekIfNeeded(parsed, activeProfile.id);
              if (autoClosed) {
                setCoachingProgram(autoClosed);
                setActiveWeekTab(autoClosed.currentWeekIndex + 1);
                localStorage.setItem(programKey, JSON.stringify(autoClosed));
              } else {
                setCoachingProgram(parsed);
                setActiveWeekTab(parsed.currentWeekIndex + 1);
              }
            } catch {}
          } else {
            setCoachingProgram(null);
          }

          const bonusKey = `fitness-realm-coaching-bonus-expires-${activeProfile.id}`;
          const bonusRaw = localStorage.getItem(bonusKey);
          if (bonusRaw) {
            const exp = Number(bonusRaw);
            if (exp > Date.now()) {
              setBonusExpires(exp);
            } else {
              localStorage.removeItem(bonusKey);
              setBonusExpires(null);
            }
          } else {
            setBonusExpires(null);
          }
        } else {
          setEquippedTitle(dbEquippedTitle);
          setEquippedBorder(dbEquippedBorder);
          setEquippedCompanion(dbEquippedCompanion);
          setUnlockedItems(dbUnlocked.length > 0 ? dbUnlocked : ["title-recruit"]);
          setCoachingProgram(dbCoaching);
          if (dbCoaching) {
            setActiveWeekTab(dbCoaching.currentWeekIndex + 1);
          }
          setBonusExpires(dbBonusExpires);
        }
      }

      if (activeProfile) setProfile(activeProfile);
      setWorkouts(activeWorkouts);
      setLoading(false);
    }
    
    getProfileData();

    const handleProfileUpdate = () => {
      getProfileData();
    };

    window.addEventListener("fitness-realm-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("fitness-realm-profile-updated", handleProfileUpdate);
    };
  }, []);

  useEffect(() => {
    if (!bonusExpires) {
      setRemainingBonusTime("");
      return;
    }

    const updateTime = () => {
      const diff = bonusExpires - Date.now();
      if (diff <= 0) {
        setBonusExpires(null);
        setRemainingBonusTime("");
        window.dispatchEvent(new Event("fitness-realm-profile-updated"));
      } else {
        const hrs = Math.floor(diff / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingBonusTime(`${hrs}h ${mins}m ${secs}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [bonusExpires]);

  useEffect(() => {
    if (!coachingProgram || !coachingProgram.weeks) {
      setRemainingWeekTime("");
      return;
    }

    const updateWeekTime = () => {
      const range = getCoachingWeekDateRange(
        coachingProgram.startedAt || new Date().toISOString(),
        coachingProgram.currentWeekIndex + 1
      );
      const diff = range.end.getTime() - Date.now();
      if (diff <= 0) {
        setRemainingWeekTime(language === "fr" ? "Semaine Expirée" : "Week Expired");
        
        // Trigger auto rollover check!
        if (profile) {
          const autoClosed = autoCloseWeekIfNeeded(coachingProgram, profile.id);
          if (autoClosed) {
            setCoachingProgram(autoClosed);
            setActiveWeekTab(autoClosed.currentWeekIndex + 1);
            const programKey = `fitness-realm-coaching-program-${profile.id}`;
            localStorage.setItem(programKey, JSON.stringify(autoClosed));
            // Trigger database update if not in demo mode
            if (!isDemo) {
              import("@/lib/supabase/client").then(({ createClient }) => {
                const supabase = createClient();
                supabase
                  .from("coaching_programs")
                  .update({
                    current_week_index: autoClosed.currentWeekIndex,
                    weeks_data: autoClosed.weeks,
                    claimed: autoClosed.claimed,
                  })
                  .eq("user_id", profile.id)
                  .then(({ error }) => {
                    if (error) console.error("Error saving auto-closed program to DB:", error);
                  });
              });
            }
          }
        }
      } else {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const secs = Math.floor((diff % (1000 * 60)) / 1000);
        if (days > 0) {
          setRemainingWeekTime(language === "fr" ? `${days}j ${hrs}h ${mins}m` : `${days}d ${hrs}h ${mins}m`);
        } else {
          setRemainingWeekTime(`${hrs}h ${mins}m ${secs}s`);
        }
      }
    };

    updateWeekTime();
    const interval = setInterval(updateWeekTime, 1000);
    return () => clearInterval(interval);
  }, [coachingProgram, profile, language, isDemo]);

  const getWorkoutWeekOffset = React.useCallback((startDateStr: string) => {
    const refDate = isDemo ? new Date("2026-06-18T23:59:59Z") : new Date();
    const startDate = new Date(startDateStr);
    const diffTime = refDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) return 0;
    return -1;
  }, [isDemo]);

  const activeCoachingProgram = coachingProgram && Array.isArray(coachingProgram.weeks) ? coachingProgram : null;

  const handleSubmitQuestionnaire = () => {
    if (!profile) return;
    const profileId = profile.id;
    const { sport, planType, currentCapacity, targetGoal, frequency, weeksCount, referencePace } = coachingAnswers;
    if (!sport || !planType || !currentCapacity || !targetGoal || !frequency || !weeksCount) return;

    // Pace calculations (min/km)
    let easyPace = "6:30";
    let tempoPace = "5:45";
    let intervalsPace = "5:15";

    if (sport === "Run") {
      if (referencePace) {
        easyPace = referencePace;
        const easySec = parsePaceToSeconds(easyPace, "Run");
        tempoPace = formatSecondsToPace(easySec - 45, "Run");
        intervalsPace = formatSecondsToPace(easySec - 90, "Run");
      } else {
        if (currentCapacity === "none" || currentCapacity === "1km") {
          easyPace = "7:30";
          tempoPace = "6:45";
          intervalsPace = "6:15";
        } else if (currentCapacity === "5km") {
          easyPace = "6:15";
          tempoPace = "5:30";
          intervalsPace = "5:00";
        } else if (currentCapacity === "10km") {
          easyPace = "5:30";
          tempoPace = "4:45";
          intervalsPace = "4:15";
        } else {
          easyPace = "4:45";
          tempoPace = "4:00";
          intervalsPace = "3:30";
        }
      }

      // If performance goal, speed up by 15s/km
      if (targetGoal === "time_performance") {
        const speedUpPace = (paceStr: string): string => {
          const parts = paceStr.split(":");
          let min = parseInt(parts[0]);
          let sec = parseInt(parts[1]);
          sec -= 15;
          if (sec < 0) {
            sec += 60;
            min -= 1;
          }
          return `${min}:${sec.toString().padStart(2, "0")}`;
        };
        easyPace = speedUpPace(easyPace);
        tempoPace = speedUpPace(tempoPace);
        intervalsPace = speedUpPace(intervalsPace);
      }
    } else if (sport === "Ride") {
      if (referencePace) {
        easyPace = referencePace;
        const easyVal = parseInt(easyPace);
        tempoPace = `${easyVal + 4} km/h`;
        intervalsPace = `${easyVal + 8} km/h`;
      } else {
        if (currentCapacity === "none" || currentCapacity === "1km") {
          easyPace = "18 km/h";
          tempoPace = "22 km/h";
          intervalsPace = "26 km/h";
        } else if (currentCapacity === "5km") {
          easyPace = "22 km/h";
          tempoPace = "26 km/h";
          intervalsPace = "30 km/h";
        } else {
          easyPace = "26 km/h";
          tempoPace = "30 km/h";
          intervalsPace = "35 km/h";
        }
      }
      if (targetGoal === "time_performance") {
        easyPace = `${parseInt(easyPace) + 2} km/h`;
        tempoPace = `${parseInt(tempoPace) + 3} km/h`;
        intervalsPace = `${parseInt(intervalsPace) + 4} km/h`;
      }
    } else {
      // Walking speed in km/h
      if (referencePace) {
        easyPace = referencePace;
        const easyVal = parseFloat(referencePace);
        tempoPace = `${(easyVal + 1.0).toFixed(1)} km/h`;
        intervalsPace = `${(easyVal + 2.0).toFixed(1)} km/h`;
      } else {
        easyPace = "4.5 km/h";
        tempoPace = "5.5 km/h";
        intervalsPace = "6.5 km/h";
      }
      if (targetGoal === "time_performance") {
        easyPace = `${(parseFloat(easyPace) + 0.5).toFixed(1)} km/h`;
        tempoPace = `${(parseFloat(tempoPace) + 0.5).toFixed(1)} km/h`;
        intervalsPace = `${(parseFloat(intervalsPace) + 0.5).toFixed(1)} km/h`;
      }
    }

    const weeks: CoachingWeek[] = [];

    for (let w = 1; w <= weeksCount; w++) {
      const workoutsList: PlannedWorkout[] = [];

      // 1. Intervals workout
      workoutsList.push({
        id: `planned-${w}-1`,
        name: language === "fr" ? `Semaine ${w} - Intervalles Vitesse` : `Week ${w} - Speed Intervals`,
        type: "Intervals",
        description: language === "fr" 
          ? `Développer la VMA par des répétitions d'intervalles.`
          : `Develop raw pacing and cardiorespiratory power.`,
        structure: language === "fr"
          ? [
              "10 min Échauffement progressif",
              `${4 + w}x 400m à Allure Intervalles (Cible: ${intervalsPace})`,
              "90s de récupération active (marche/trot)",
              "10 min Retour au calme"
            ]
          : [
              "10 min progressive Warm-up",
              `${4 + w}x 400m at Interval Pace (Target: ${intervalsPace})`,
              "90s active jog/walk recovery",
              "10 min Cool-down"
            ],
        targetPace: intervalsPace,
        targetDistance: Math.round((2.0 + (4 + w) * 0.4 + 2.0) * 10) / 10,
        targetDuration: null,
        completed: false,
        associatedWorkoutId: null,
        paceAccuracy: null,
        xpReward: 150,
        goldReward: 50,
      });

      // 2. Tempo workout
      workoutsList.push({
        id: `planned-${w}-2`,
        name: language === "fr" ? `Semaine ${w} - Seuil Lactique` : `Week ${w} - Lactate Threshold`,
        type: "Tempo",
        description: language === "fr"
          ? `Améliorer la capacité aérobie à allure seuil stable.`
          : `Improve aerobic capacity and run longer at high speed.`,
        structure: language === "fr"
          ? [
              "10 min Échauffement",
              `${10 + w * 2} min à Allure Seuil (Cible: ${tempoPace})`,
              "10 min Retour au calme"
            ]
          : [
              "10 min Warm-up",
              `${10 + w * 2} min at Tempo Pace (Target: ${tempoPace})`,
              "10 min Cool-down"
            ],
        targetPace: tempoPace,
        targetDistance: null,
        targetDuration: 20 + w * 2,
        completed: false,
        associatedWorkoutId: null,
        paceAccuracy: null,
        xpReward: 180,
        goldReward: 60,
      });

      // 3. Long workout
      workoutsList.push({
        id: `planned-${w}-3`,
        name: language === "fr" ? `Semaine ${w} - Sortie Longue` : `Week ${w} - Long Endurance Run`,
        type: "Long",
        description: language === "fr"
          ? `Développer l'endurance fondamentale sur la distance.`
          : `Develop base mileage and mental endurance.`,
        structure: language === "fr"
          ? [`${35 + w * 5} min à Allure Endurance (Cible: ${easyPace})`]
          : [`${35 + w * 5} min at Easy Pace (Target: ${easyPace})`],
        targetPace: easyPace,
        targetDistance: Math.round((((35 + w * 5) / 6) * (sport === "Ride" ? 3 : 1)) * 10) / 10,
        targetDuration: 35 + w * 5,
        completed: false,
        associatedWorkoutId: null,
        paceAccuracy: null,
        xpReward: 250,
        goldReward: 80,
      });

      // 4. If frequency >= 4, add Easy Run
      if (frequency >= 4) {
        workoutsList.push({
          id: `planned-${w}-4`,
          name: language === "fr" ? `Semaine ${w} - Endurance Fondamentale` : `Week ${w} - Base Aerobic Run`,
          type: "Easy",
          description: language === "fr"
            ? `Course de soutien pour accumuler du volume aérobie.`
            : `Support run to build weekly volume safely.`,
          structure: language === "fr"
            ? [`30 min en Endurance Fondamentale (Cible: ${easyPace})`]
            : [`30 min Easy Pace (Target: ${easyPace})`],
          targetPace: easyPace,
          targetDistance: sport === "Ride" ? 15.0 : 5.0,
          targetDuration: 30,
          completed: false,
          associatedWorkoutId: null,
          paceAccuracy: null,
          xpReward: 120,
          goldReward: 40,
        });
      }

      // 5. If frequency === 5, add Recovery Run
      if (frequency === 5) {
        workoutsList.push({
          id: `planned-${w}-5`,
          name: language === "fr" ? `Semaine ${w} - Récupération Active` : `Week ${w} - Recovery Run`,
          type: "Recovery",
          description: language === "fr"
            ? `Récupération active très facile pour éliminer les toxines.`
            : `Very easy recovery run to clean muscles and feel active.`,
          structure: language === "fr"
            ? [`20 min Trot léger en récupération active (Cible: ${easyPace})`]
            : [`20 min Easy recovery trot (Target: ${easyPace})`],
          targetPace: easyPace,
          targetDistance: sport === "Ride" ? 10.0 : 3.0,
          targetDuration: 20,
          completed: false,
          associatedWorkoutId: null,
          paceAccuracy: null,
          xpReward: 100,
          goldReward: 30,
        });
      }

      weeks.push({
        weekNumber: w,
        workouts: workoutsList,
        status: "pending",
        adaptationReport: null,
      });
    }

    const newProgram: CoachingProgram = {
      name: language === "fr"
        ? `Plan ${planType.toUpperCase()} (${weeksCount} Semaines)`
        : `${planType.toUpperCase()} Plan (${weeksCount} Weeks)`,
      sport,
      planType,
      currentWeekIndex: 0,
      targetPaces: {
        easy: easyPace,
        tempo: tempoPace,
        intervals: intervalsPace,
      },
      weeks,
      claimed: false,
      startedAt: new Date().toISOString(),
    };

    const programKey = `fitness-realm-coaching-program-${profileId}`;
    setCoachingProgram(newProgram);
    setCoachingStep(0);
    setActiveWeekTab(1);

    if (!isDemo) {
      async function saveProgramToDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("coaching_programs")
            .upsert({
              user_id: profileId,
              name: newProgram.name,
              sport: newProgram.sport,
              plan_type: newProgram.planType,
              current_week_index: newProgram.currentWeekIndex,
              target_paces: newProgram.targetPaces,
              weeks_data: newProgram.weeks,
              claimed: newProgram.claimed,
            });
        } catch (err) {
          console.error("Failed to save coaching program to database:", err);
        }
      }
      saveProgramToDB();
    } else {
      localStorage.setItem(programKey, JSON.stringify(newProgram));
    }
  };


  const handleClaimCoachingBonus = () => {
    if (!profile || !coachingProgram) return;
    const profileId = profile.id;

    const expiresAt = Date.now() + 72 * 60 * 60 * 1000;
    const bonusKey = `fitness-realm-coaching-bonus-expires-${profileId}`;
    const programKey = `fitness-realm-coaching-program-${profileId}`;
    const updatedProgram = {
      ...coachingProgram,
      claimed: true,
    };
    setBonusExpires(expiresAt);
    setCoachingProgram(updatedProgram);

    if (!isDemo) {
      async function saveClaimToDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("active_boosts")
            .upsert({
              user_id: profileId,
              expires_at: new Date(expiresAt).toISOString(),
            });
          await supabase
            .from("coaching_programs")
            .update({ claimed: true })
            .eq("user_id", profileId);
        } catch (err) {
          console.error("Failed to save claim to database:", err);
        }
      }
      saveClaimToDB();
    } else {
      localStorage.setItem(bonusKey, String(expiresAt));
      localStorage.setItem(programKey, JSON.stringify(updatedProgram));
    }

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  const handleResetCoaching = () => {
    if (!profile) return;
    const profileId = profile.id;
    const confirmReset = window.confirm(
      language === "fr"
        ? "Voulez-vous vraiment réinitialiser votre programme de coaching ?"
        : "Are you sure you want to reset your coaching program?"
    );
    if (!confirmReset) return;

    const programKey = `fitness-realm-coaching-program-${profileId}`;
    if (!isDemo) {
      async function resetCoachingInDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("coaching_programs")
            .delete()
            .eq("user_id", profileId);
        } catch (err) {
          console.error("Failed to reset coaching program in database:", err);
        }
      }
      resetCoachingInDB();
    } else {
      localStorage.removeItem(programKey);
    }
    setCoachingProgram(null);
    setCoachingStep(1);
    setCoachingAnswers({});
  };

  // Helper to parse a pace string to seconds per km
  const parsePaceToSeconds = (paceStr: string, sport: string): number => {
    if (!paceStr) return 360; // fallback to 6:00 min/km
    if (sport === "Run") {
      const parts = paceStr.split(":");
      const minutes = parseInt(parts[0], 10) || 0;
      const seconds = parseInt(parts[1], 10) || 0;
      return minutes * 60 + seconds;
    } else {
      // Ride or Walk (speed in km/h)
      const speed = parseFloat(paceStr.replace(/[^\d.]/g, "")) || 10.0;
      return speed > 0 ? 3600 / speed : 360;
    }
  };

  // Helper to format seconds per km back to the sport's pace/speed string
  const formatSecondsToPace = (seconds: number, sport: string): string => {
    if (sport === "Run") {
      const minutes = Math.floor(seconds / 60);
      const secs = Math.round(seconds % 60);
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    } else {
      // Ride or Walk (speed in km/h)
      const speed = seconds > 0 ? 3600 / seconds : 10.0;
      const formattedSpeed = Math.round(speed * 10) / 10;
      return `${formattedSpeed} km/h`;
    }
  };

  // Helper to adjust a pace string by a multiplier (e.g. 1.1 for 10% slower, 0.9 for 10% faster)
  const adjustPaceString = (paceStr: string, multiplier: number, sport: string): string => {
    const seconds = parsePaceToSeconds(paceStr, sport);
    const adjustedSeconds = seconds * multiplier;
    return formatSecondsToPace(adjustedSeconds, sport);
  };

  const getReferenceDistance = (capacity: string, sport: string): number => {
    if (sport === "Run") {
      switch (capacity) {
        case "none": return 1;
        case "1km": return 2;
        case "5km": return 5;
        case "10km": return 10;
        case "20km+": return 15;
        default: return 5;
      }
    } else if (sport === "Ride") {
      switch (capacity) {
        case "none": return 5;
        case "1km": return 10;
        case "5km": return 20;
        case "10km": return 40;
        case "20km+": return 80;
        default: return 20;
      }
    } else {
      // Walk
      switch (capacity) {
        case "none": return 1;
        case "1km": return 2;
        case "5km": return 5;
        case "10km": return 10;
        case "20km+": return 15;
        default: return 5;
      }
    }
  };

  const getDefaultDuration = (distance: number, sport: string): { h: number; m: number; s: number } => {
    if (sport === "Run") {
      switch (distance) {
        case 1: return { h: 0, m: 7, s: 0 };
        case 2: return { h: 0, m: 14, s: 0 };
        case 5: return { h: 0, m: 35, s: 0 };
        case 10: return { h: 1, m: 10, s: 0 };
        case 15: return { h: 1, m: 50, s: 0 };
        default: return { h: 0, m: 35, s: 0 };
      }
    } else if (sport === "Ride") {
      switch (distance) {
        case 5: return { h: 0, m: 15, s: 0 };
        case 10: return { h: 0, m: 30, s: 0 };
        case 20: return { h: 1, m: 0, s: 0 };
        case 40: return { h: 2, m: 0, s: 0 };
        case 80: return { h: 4, m: 0, s: 0 };
        default: return { h: 1, m: 0, s: 0 };
      }
    } else {
      // Walk
      switch (distance) {
        case 1: return { h: 0, m: 12, s: 0 };
        case 2: return { h: 0, m: 25, s: 0 };
        case 5: return { h: 1, m: 0, s: 0 };
        case 10: return { h: 2, m: 0, s: 0 };
        case 15: return { h: 3, m: 0, s: 0 };
        default: return { h: 1, m: 0, s: 0 };
      }
    }
  };

  const calculateReferencePace = (sport: string, distance: number, h: number, m: number, s: number): string => {
    const totalSeconds = h * 3600 + m * 60 + s;
    if (totalSeconds <= 0) return sport === "Run" ? "6:00" : sport === "Ride" ? "20 km/h" : "5 km/h";
    
    if (sport === "Run") {
      const paceSeconds = totalSeconds / distance;
      const minutes = Math.floor(paceSeconds / 60);
      const secs = Math.round(paceSeconds % 60);
      return `${minutes}:${secs.toString().padStart(2, "0")}`;
    } else {
      // Ride or Walk
      const calcSpeed = (distance * 3600) / totalSeconds;
      return `${calcSpeed.toFixed(1)} km/h`;
    }
  };

  const handleDisassociateWorkout = (plannedWorkoutId: string) => {
    if (!profile || !coachingProgram) return;
    const profileId = profile.id;

    const confirmDisassociate = window.confirm(
      language === "fr"
        ? "Voulez-vous vraiment dissocier cette séance ?"
        : "Are you sure you want to disassociate this workout?"
    );
    if (!confirmDisassociate) return;

    // Find the planned workout to get rewards
    let plannedWorkout: PlannedWorkout | undefined;
    for (const week of coachingProgram.weeks) {
      const found = week.workouts.find((w) => w.id === plannedWorkoutId);
      if (found) {
        plannedWorkout = found;
        break;
      }
    }
    if (!plannedWorkout) return;

    const xpReward = plannedWorkout.xpReward || 150;
    const goldReward = plannedWorkout.goldReward || 50;

    let currentLevel = profile.level;
    let currentXP = profile.xp;
    let currentGold = profile.gold;

    let totalXP = currentXP - xpReward;
    while (totalXP < 0 && currentLevel > 1) {
      currentLevel -= 1;
      totalXP += 1000 * currentLevel;
    }
    currentXP = Math.max(0, totalXP);
    currentGold = Math.max(0, currentGold - goldReward);

    const updatedProfile = {
      ...profile,
      level: currentLevel,
      xp: currentXP,
      gold: currentGold,
    };

    setProfile(updatedProfile);
    const fallbackKey = `fitness-realm-profile-fallback-${profile.id}`;
    localStorage.setItem(fallbackKey, JSON.stringify(updatedProfile));

    const updatedWeeks = coachingProgram.weeks.map((week) => {
      const updatedWorkouts = week.workouts.map((w) => {
        if (w.id === plannedWorkoutId) {
          return {
            ...w,
            completed: false,
            associatedWorkoutId: null,
            paceAccuracy: null,
            actualDistance: null,
            actualDuration: null,
            actualPace: null,
            coachFeedback: null,
            elevationGain: null,
            avgHeartrate: null,
          };
        }
        return w;
      });
      return { ...week, workouts: updatedWorkouts };
    });

    const updatedProgram = {
      ...coachingProgram,
      weeks: updatedWeeks,
    };

    setCoachingProgram(updatedProgram);

    const programKey = `fitness-realm-coaching-program-${profileId}`;
    if (!isDemo) {
      async function saveToDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("coaching_programs")
            .update({ weeks_data: updatedWeeks as any })
            .eq("user_id", profileId);

          await supabase
            .from("profiles")
            .update({
              level: currentLevel,
              xp: currentXP,
              gold: currentGold,
            })
            .eq("id", profileId);
        } catch (err) {
          console.error("Failed to update database on disassociation:", err);
        }
      }
      saveToDB();
    } else {
      localStorage.setItem(programKey, JSON.stringify(updatedProgram));
    }

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  const handleAssociateWorkout = (plannedWorkoutId: string, loggedWorkoutId: string) => {
    if (!profile || !coachingProgram) return;
    const profileId = profile.id;

    const loggedWorkout = workouts.find((w) => w.id === loggedWorkoutId);
    if (!loggedWorkout) return;

    // 1. Find the planned workout to get targets
    let targetPaceStr = coachingProgram.targetPaces.easy;
    let targetDistVal = 5.0;
    let plannedWorkout: PlannedWorkout | undefined;

    for (const week of coachingProgram.weeks) {
      const found = week.workouts.find((w) => w.id === plannedWorkoutId);
      if (found) {
        plannedWorkout = found;
        break;
      }
    }

    if (!plannedWorkout) return;

    if (plannedWorkout.targetPace) {
      targetPaceStr = plannedWorkout.targetPace;
    }
    const targetPaceSeconds = parsePaceToSeconds(targetPaceStr, coachingProgram.sport);

    if (plannedWorkout.targetDistance) {
      targetDistVal = plannedWorkout.targetDistance;
    } else if (plannedWorkout.targetDuration) {
      // If targetDistance is null, estimate target distance using target duration in minutes:
      // (duration in seconds) / (pace in seconds/km)
      targetDistVal = (plannedWorkout.targetDuration * 60) / targetPaceSeconds;
    }

    // 2. Calculate actual values
    const actualDistance = loggedWorkout.distance; // in km
    let actualDuration = loggedWorkout.duration || 0;

    if (actualDuration <= 0) {
      // Fallback: estimate actual duration based on actual distance and target pace
      actualDuration = Math.round(actualDistance * targetPaceSeconds);
    }

    const actualPaceSeconds = actualDuration / actualDistance;
    const formattedActualPace = formatSecondsToPace(actualPaceSeconds, coachingProgram.sport);

    // 3. Perform comparison & classification (incorporating elevation gain / Grade Adjusted Pace)
    const elevationGain = loggedWorkout.elevation_gain || 0;
    
    // Grade Adjusted Distance (GAP equivalent distance)
    // 1m of climb is worth 10m of flat running/walking/cycling effort
    const adjustedDistance = actualDistance + (elevationGain / 100);
    const gradeAdjustedPaceSeconds = actualDuration / adjustedDistance;

    const distanceRatio = actualDistance / targetDistVal;
    let classification: 'too_hard' | 'too_easy' | 'perfect' = 'perfect';

    if (coachingProgram.sport === "Run") {
      // Too Hard: distance < 80% or pace > 1 min/km slower
      if (distanceRatio < 0.8 || gradeAdjustedPaceSeconds > targetPaceSeconds + 60) {
        classification = 'too_hard';
      }
      // Too Easy: distance > 120% or pace < 45s/km faster
      else if (distanceRatio > 1.2 || gradeAdjustedPaceSeconds < targetPaceSeconds - 45) {
        classification = 'too_easy';
      }
    } else if (coachingProgram.sport === "Ride") {
      const targetSpeed = 3600 / targetPaceSeconds;
      const actualSpeed = 3600 / gradeAdjustedPaceSeconds; // effort-adjusted speed
      // Too Hard: distance < 80% or speed > 5 km/h slower
      if (distanceRatio < 0.8 || actualSpeed < targetSpeed - 5) {
        classification = 'too_hard';
      }
      // Too Easy: distance > 120% or speed > 4 km/h faster
      else if (distanceRatio > 1.2 || actualSpeed > targetSpeed + 4) {
        classification = 'too_easy';
      }
    } else {
      // Walk
      const targetSpeed = 3600 / targetPaceSeconds;
      const actualSpeed = 3600 / gradeAdjustedPaceSeconds; // effort-adjusted speed
      // Too Hard: distance < 80% or speed > 1 km/h slower
      if (distanceRatio < 0.8 || actualSpeed < targetSpeed - 1) {
        classification = 'too_hard';
      }
      // Too Easy: distance > 120% or speed > 1 km/h faster
      else if (distanceRatio > 1.2 || actualSpeed > targetSpeed + 1) {
        classification = 'too_easy';
      }
    }

    // 4. Compute accuracy (using effort-adjusted pace accuracy)
    const distanceAccuracy = Math.min(actualDistance / targetDistVal, targetDistVal / actualDistance);
    const paceAccuracyRatio = Math.min(gradeAdjustedPaceSeconds / targetPaceSeconds, targetPaceSeconds / gradeAdjustedPaceSeconds);
    const computedPaceAccuracy = Math.max(50, Math.min(100, Math.round(((distanceAccuracy + paceAccuracyRatio) / 2) * 100)));

    // 5. Generate Coach Feedback (including GAP details if elevation is present)
    const formattedGap = formatSecondsToPace(gradeAdjustedPaceSeconds, coachingProgram.sport);
    let elevationReport = "";
    if (elevationGain >= 15) {
      if (coachingProgram.sport === "Run" || coachingProgram.sport === "Walk") {
        elevationReport = language === "fr"
          ? ` (Allure ajustée à plat : ${formattedGap} compte tenu des +${Math.round(elevationGain)}m de dénivelé)`
          : ` (Flat-adjusted pace: ${formattedGap} considering the +${Math.round(elevationGain)}m of elevation gain)`;
      } else {
        elevationReport = language === "fr"
          ? ` (Vitesse ajustée à plat : ${formattedGap} compte tenu des +${Math.round(elevationGain)}m de dénivelé)`
          : ` (Flat-adjusted speed: ${formattedGap} considering the +${Math.round(elevationGain)}m of elevation gain)`;
      }
    }

    let feedbackMessage = "";
    if (classification === "too_hard") {
      feedbackMessage = language === "fr"
        ? `Cet entraînement était trop difficile${elevationReport}. Ne vous inquiétez pas, j'ai adapté la suite de votre programme : les distances futures sont réduites de 10% et les allures cibles sont ralenties pour vous permettre de récupérer et de progresser à votre rythme.`
        : `This workout was too hard${elevationReport}. No worries, I have adjusted the rest of your program: future distances are reduced by 10% and target paces/speeds are scaled down to help you recover and progress at your own pace.`;
    } else if (classification === "too_easy") {
      feedbackMessage = language === "fr"
        ? `Super travail ! Cet entraînement a été réalisé très facilement${elevationReport}. J'ai ajusté votre programme pour stimuler votre progression : les distances futures sont augmentées de 10% et les allures cibles sont légèrement accélérées.`
        : `Great job! This workout felt too easy${elevationReport}. I have adjusted your program to boost your progress: future distances are increased by 10% and target paces/speeds are slightly accelerated.`;
    } else {
      feedbackMessage = language === "fr"
        ? `Excellent respect des consignes ! Votre allure ajustée et votre distance correspondent très bien aux cibles du programme${elevationReport}. Continuez ainsi !`
        : `Excellent consistency! Your adjusted pace and distance match the program targets very well${elevationReport}. Keep up the great work!`;
    }

    // 6. Update coaching program: adjust current and future week workouts
    const currentWeekNumber = coachingProgram.weeks[coachingProgram.currentWeekIndex].weekNumber;

    const updatedWeeks = coachingProgram.weeks.map((week) => {
      // Adjust uncompleted workouts in current or future weeks
      if (week.weekNumber >= currentWeekNumber) {
        const updatedWorkouts = week.workouts.map((w) => {
          // If this is the workout currently being associated
          if (w.id === plannedWorkoutId) {
            return {
              ...w,
              completed: true,
              associatedWorkoutId: loggedWorkoutId,
              paceAccuracy: computedPaceAccuracy,
              actualDistance,
              actualDuration,
              actualPace: formattedActualPace,
              coachFeedback: feedbackMessage,
              elevationGain: loggedWorkout.elevation_gain || 0,
              avgHeartrate: loggedWorkout.avg_heartrate || null,
            };
          }

          // If this is an uncompleted workout in current/future weeks, adjust targets!
          if (!w.completed) {
            let newDistance = w.targetDistance;
            let newDuration = w.targetDuration;
            let newPace = w.targetPace;

            if (classification === "too_hard") {
              newDistance = w.targetDistance ? Math.round(w.targetDistance * 0.9 * 10) / 10 : null;
              newDuration = w.targetDuration ? Math.round(w.targetDuration * 0.9) : null;
              newPace = w.targetPace ? adjustPaceString(w.targetPace, 1.1, coachingProgram.sport) : null;
            } else if (classification === "too_easy") {
              newDistance = w.targetDistance ? Math.round(w.targetDistance * 1.1 * 10) / 10 : null;
              newDuration = w.targetDuration ? Math.round(w.targetDuration * 1.1) : null;
              newPace = w.targetPace ? adjustPaceString(w.targetPace, 0.9, coachingProgram.sport) : null;
            }

            // Also reconstruct structure/description if they contain the target pace
            let newStructure = w.structure;
            let newDescription = w.description;
            if (w.targetPace && newPace) {
              const oldPaceEscaped = w.targetPace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
              const regex = new RegExp(oldPaceEscaped, 'g');
              newStructure = w.structure.map(s => s.replace(regex, newPace!));
              newDescription = w.description.replace(regex, newPace);
            }

            return {
              ...w,
              targetDistance: newDistance,
              targetDuration: newDuration,
              targetPace: newPace,
              structure: newStructure,
              description: newDescription,
            };
          }

          return w;
        });

        return { ...week, workouts: updatedWorkouts };
      }

      return week;
    });

    // 7. Update global target paces
    let newGlobalTargetPaces = { ...coachingProgram.targetPaces };
    if (classification === "too_hard") {
      newGlobalTargetPaces = {
        easy: adjustPaceString(coachingProgram.targetPaces.easy, 1.1, coachingProgram.sport),
        tempo: adjustPaceString(coachingProgram.targetPaces.tempo, 1.1, coachingProgram.sport),
        intervals: adjustPaceString(coachingProgram.targetPaces.intervals, 1.1, coachingProgram.sport),
      };
    } else if (classification === "too_easy") {
      newGlobalTargetPaces = {
        easy: adjustPaceString(coachingProgram.targetPaces.easy, 0.9, coachingProgram.sport),
        tempo: adjustPaceString(coachingProgram.targetPaces.tempo, 0.9, coachingProgram.sport),
        intervals: adjustPaceString(coachingProgram.targetPaces.intervals, 0.9, coachingProgram.sport),
      };
    }

    // 8. Update user profile details (XP, Gold, level up)
    const xpReward = plannedWorkout.xpReward || 150;
    const goldReward = plannedWorkout.goldReward || 50;

    let currentLevel = profile.level;
    let currentXP = profile.xp;
    let currentGold = profile.gold;

    let totalXP = currentXP + xpReward;
    while (totalXP >= 1000 * currentLevel) {
      totalXP -= 1000 * currentLevel;
      currentLevel += 1;
    }
    currentXP = totalXP;
    currentGold += goldReward;

    const updatedProfile = {
      ...profile,
      level: currentLevel,
      xp: currentXP,
      gold: currentGold,
    };

    setProfile(updatedProfile);
    const fallbackKey = `fitness-realm-profile-fallback-${profile.id}`;
    localStorage.setItem(fallbackKey, JSON.stringify(updatedProfile));

    // 9. Construct final updated coaching program
    const updatedProgram: CoachingProgram = {
      ...coachingProgram,
      targetPaces: newGlobalTargetPaces,
      weeks: updatedWeeks,
    };

    const programKey = `fitness-realm-coaching-program-${profileId}`;
    setCoachingProgram(updatedProgram);

    // 10. Save to database or localStorage
    if (!isDemo) {
      async function saveAssociationToDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("coaching_programs")
            .update({ 
              target_paces: newGlobalTargetPaces,
              weeks_data: updatedWeeks 
            })
            .eq("user_id", profileId);

          await supabase
            .from("profiles")
            .update({
              level: currentLevel,
              xp: currentXP,
              gold: currentGold,
            })
            .eq("id", profileId);
        } catch (err) {
          console.error("Failed to save association to database:", err);
        }
      }
      saveAssociationToDB();
    } else {
      localStorage.setItem(programKey, JSON.stringify(updatedProgram));
    }

    setWorkoutToAssociate(null);
    setShowAssociateModal(false);

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));

    alert(
      language === "fr"
        ? `🎉 Entraînement associé ! +${xpReward} XP et +${goldReward} Or gagnés !\n\nAnalyse du coach : ${feedbackMessage}`
        : `🎉 Workout associated! +${xpReward} XP and +${goldReward} Gold earned!\n\nCoach feedback: ${feedbackMessage}`
    );
  };

  const handleCloseWeek = () => {
    if (!profile || !coachingProgram) return;
    const profileId = profile.id;

    const currentWeek = coachingProgram.weeks[coachingProgram.currentWeekIndex];
    const totalWorkouts = currentWeek.workouts.length;
    const completedWorkouts = currentWeek.workouts.filter((w) => w.completed).length;

    const completionRate = completedWorkouts / totalWorkouts;

    let weekStatus: 'completed' | 'partial' | 'failed' = 'partial';
    let report = "";

    if (completionRate === 1.0) {
      weekStatus = 'completed';
      report = language === "fr"
        ? "Félicitations ! Semaine complétée à 100%. Surcharge progressive appliquée : volume augmenté de +10% pour la semaine suivante."
        : "Congratulations! Week completed at 100%. Progressive overload applied: volume increased by +10% for the next week.";
    } else if (completionRate >= 0.5) {
      weekStatus = 'partial';
      report = language === "fr"
        ? "Bon travail. Semaine partiellement complétée. Volume stabilisé pour la semaine suivante."
        : "Good job. Week partially completed. Volume stabilized for the next week.";
    } else {
      weekStatus = 'failed';
      report = language === "fr"
        ? "Semaine incomplète. Volume de la semaine suivante réduit de -10% pour récupération et entraînements non complétés reportés."
        : "Week incomplete. Next week volume reduced by -10% for recovery, and incomplete sessions rolled over.";
    }

    const updatedWeeks = coachingProgram.weeks.map((week, idx) => {
      if (idx === coachingProgram.currentWeekIndex) {
        return {
          ...week,
          status: weekStatus,
          adaptationReport: report,
        };
      }
      if (weekStatus === 'failed' && idx === coachingProgram.currentWeekIndex + 1) {
        const incompleteWorkouts = currentWeek.workouts
          .filter((w) => !w.completed)
          .map((w) => ({
            ...w,
            id: `${w.id}-rollover`,
            name: `${w.name} (Reporté)`,
            completed: false,
            associatedWorkoutId: null,
            paceAccuracy: null,
          }));

        const adaptedNextWorkouts = week.workouts.map((w) => {
          return {
            ...w,
            targetDistance: w.targetDistance ? Math.round(w.targetDistance * 0.9 * 10) / 10 : null,
            targetDuration: w.targetDuration ? Math.round(w.targetDuration * 0.9) : null,
          };
        });

        return {
          ...week,
          workouts: [...adaptedNextWorkouts, ...incompleteWorkouts],
        };
      }

      if (weekStatus === 'completed' && idx === coachingProgram.currentWeekIndex + 1) {
        const adaptedNextWorkouts = week.workouts.map((w) => {
          return {
            ...w,
            targetDistance: w.targetDistance ? Math.round(w.targetDistance * 1.1 * 10) / 10 : null,
            targetDuration: w.targetDuration ? Math.round(w.targetDuration * 1.1) : null,
          };
        });
        return {
          ...week,
          workouts: adaptedNextWorkouts,
        };
      }

      return week;
    });

    const isLastWeek = coachingProgram.currentWeekIndex === coachingProgram.weeks.length - 1;
    const nextWeekIndex = isLastWeek ? coachingProgram.currentWeekIndex : coachingProgram.currentWeekIndex + 1;

    const updatedProgram: CoachingProgram = {
      ...coachingProgram,
      currentWeekIndex: nextWeekIndex,
      weeks: updatedWeeks,
      claimed: false,
    };

    const programKey = `fitness-realm-coaching-program-${profileId}`;
    setCoachingProgram(updatedProgram);
    setActiveWeekTab(nextWeekIndex + 1);

    if (!isDemo) {
      async function saveCloseWeekToDB() {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("coaching_programs")
            .update({
              current_week_index: updatedProgram.currentWeekIndex,
              weeks_data: updatedProgram.weeks,
              claimed: updatedProgram.claimed,
            })
            .eq("user_id", profileId);
        } catch (err) {
          console.error("Failed to save closed week to database:", err);
        }
      }
      saveCloseWeekToDB();
    } else {
      localStorage.setItem(programKey, JSON.stringify(updatedProgram));
    }

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));

    alert(
      language === "fr"
        ? `Semaine clôturée avec succès !\nStatut : ${weekStatus === 'completed' ? '🏆 Complétée' : weekStatus === 'partial' ? '⚡ Partielle' : '⚠️ Échouée'}\n${report}`
        : `Week closed successfully!\nStatus: ${weekStatus === 'completed' ? '🏆 Completed' : weekStatus === 'partial' ? '⚡ Partial' : '⚠️ Failed'}\n${report}`
    );
  };

  const handleConnectStrava = () => {
    if (isDemo) {
      alert(
        language === "fr"
          ? "Mode Démo — La connexion Strava nécessite un vrai backend Supabase."
          : "Demo Mode — Strava connection requires a real Supabase backend."
      );
      return;
    }
    window.location.href = "/api/strava/connect";
  };

  const handleDisconnectStrava = async () => {
    if (!profile) return;
    if (isDemo) {
      setProfile((prev) =>
        prev
          ? { ...prev, strava_athlete_id: null, strava_access_token: null, strava_refresh_token: null, strava_expires_at: null }
          : null
      );
      return;
    }

    setLoading(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase
        .from("profiles")
        .update({
          strava_athlete_id: null,
          strava_access_token: null,
          strava_refresh_token: null,
          strava_expires_at: null,
        })
        .eq("id", profile.id);

      if (error) throw error;
      setProfile((prev) =>
        prev
          ? {
              ...prev,
              strava_athlete_id: null,
              strava_access_token: null,
              strava_refresh_token: null,
              strava_expires_at: null,
            }
          : null
      );
    } catch (err) {
      console.error("Error disconnecting Strava:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleImportStravaProfile = async () => {
    if (isDemo) {
      setEditUsername("Warrior_Strava");
      setEditCity("Paris");
      setEditAvatar("https://api.dicebear.com/7.x/adventurer/svg?seed=Buster");
      alert(
        language === "fr"
          ? "Mode Démo — Profil simulé importé depuis Strava !"
          : "Demo Mode — Simulated profile imported from Strava!"
      );
      return;
    }

    setImportingStrava(true);
    try {
      const res = await fetch("/api/strava/athlete");
      if (!res.ok) {
        throw new Error("Strava endpoint error");
      }
      const data = await res.json();
      if (data) {
        if (data.firstname || data.lastname) {
          setEditUsername(`${data.firstname || ""}${data.lastname ? "_" + data.lastname.substring(0, 1) : ""}`);
        }
        if (data.city) {
          setEditCity(data.city);
        }
        if (data.profile) {
          setEditAvatar(data.profile);
        }
      }
    } catch (err) {
      console.error("Error importing Strava profile details:", err);
      alert(
        language === "fr"
          ? "Impossible d'importer. Assurez-vous que Strava est connecté et que votre connexion internet est active."
          : "Could not import. Make sure Strava is connected and your internet connection is active."
      );
    } finally {
      setImportingStrava(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const updates = {
      username: editUsername.trim() || profile.username,
      city: editCity.trim() || null,
      age: editAge.trim() ? parseInt(editAge) : null,
      avatar_url: editAvatar.trim() || null,
    };

    // Save to LocalStorage as a fallback mirror
    const fallbackKey = `fitness-realm-profile-fallback-${profile.id}`;
    localStorage.setItem(fallbackKey, JSON.stringify(updates));

    if (isDemo) {
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      setIsEditOpen(false);
      return;
    }

    setSaving(true);
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      
      const { error } = await supabase
        .from("profiles")
        .update({
          username: updates.username,
          avatar_url: updates.avatar_url,
          city: updates.city,
          age: updates.age,
        })
        .eq("id", profile.id);

      if (error) {
        console.warn("Supabase update error (columns likely missing):", error);
        // Show SQL warning card and store warning state in LocalStorage
        setDbWarning(true);
        localStorage.setItem(`fitness-realm-db-warned-${profile.id}`, "true");
      } else {
        setDbWarning(false);
        localStorage.removeItem(`fitness-realm-db-warned-${profile.id}`);
      }

      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      setIsEditOpen(false);
    } catch (err) {
      console.error("Error saving profile details:", err);
      setDbWarning(true);
      localStorage.setItem(`fitness-realm-db-warned-${profile.id}`, "true");
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      setIsEditOpen(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="font-orbitron text-xs tracking-widest text-slate-500 uppercase">
          {t("loading")}
        </span>
      </div>
    );
  }

  // Aggregate stats
  const totalQuests = workouts.length;
  const totalDist = workouts.reduce((sum, w) => sum + Number(w.distance), 0);
  const totalElev = workouts.reduce((sum, w) => sum + Number(w.elevation_gain), 0);
  const avgHR = workouts.filter((w) => w.avg_heartrate).length 
    ? workouts.reduce((sum, w) => sum + Number(w.avg_heartrate || 0), 0) / workouts.filter((w) => w.avg_heartrate).length
    : 0;

  const joinDate = profile
    ? new Date(profile.created_at).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", {
        month: "long",
        year: "numeric",
      })
    : "";

  // Calculate eligible workouts for association if modal is active
  const dateRangeForModal = showAssociateModal && workoutToAssociate && coachingProgram
    ? getCoachingWeekDateRange(
        coachingProgram.startedAt || new Date().toISOString(),
        coachingProgram.currentWeekIndex + 1
      )
    : null;

  const eligibleWorkoutsForModal = showAssociateModal && workoutToAssociate && coachingProgram && dateRangeForModal
    ? (() => {
        const alreadyAssociatedIds = new Set<string>();
        coachingProgram.weeks.forEach(week => {
          week.workouts.forEach(w => {
            if (w.associatedWorkoutId) {
              alreadyAssociatedIds.add(w.associatedWorkoutId);
            }
          });
        });

        return workouts.filter(w => {
          if (alreadyAssociatedIds.has(w.id)) return false;
          const sport = coachingProgram.sport;
          let sportMatch = false;
          if (sport === "Run") sportMatch = w.activity_type === "Run";
          else if (sport === "Ride") sportMatch = w.activity_type === "Ride";
          else if (sport === "Walk") sportMatch = w.activity_type === "Walk" || w.activity_type === "Hike";
          if (!sportMatch) return false;

          const activityDate = new Date(w.start_date);
          return activityDate >= dateRangeForModal.start && activityDate < dateRangeForModal.end;
        });
      })()
    : [];

  return (
    <div className="space-y-6">
      {/* DB Migration warning if columns are missing */}
      {dbWarning && (
        <Card glowColor="rose" className="border-rose-900/50 bg-rose-950/10 p-5 border-l-4 border-l-rose-500">
          <div className="flex flex-col md:flex-row md:items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-rose-950/50 border border-rose-800 flex items-center justify-center text-rose-500 shrink-0 font-bold text-lg">
              ⚠️
            </div>
            <div className="space-y-3 flex-1">
              <div>
                <h4 className="font-orbitron font-extrabold text-sm text-rose-400 uppercase tracking-widest">
                  {language === "fr" ? "BASE DE DONNÉES INCOMPLÈTE" : "DATABASE SCHEMA INCOMPLETE"}
                </h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {language === "fr"
                    ? "Les colonnes 'city' et 'age' sont manquantes dans votre table 'public.profiles'. Vos modifications sont enregistrées localement dans votre navigateur (LocalStorage), mais pour qu'elles se synchronisent sur le serveur, veuillez exécuter ce script SQL dans l'éditeur de requêtes Supabase :"
                    : "The 'city' and 'age' columns are missing in your 'public.profiles' table. Your changes are saved locally in your browser (LocalStorage), but to synchronize them to the cloud, please run this SQL script in your Supabase SQL editor:"}
                </p>
              </div>
              
              <div className="relative bg-slate-950/80 rounded-lg p-3 border border-slate-900 font-mono text-[11px] text-slate-300 select-all max-w-full overflow-x-auto">
                <pre>{`ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;`}</pre>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(
                      "ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;\nALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;"
                    );
                    alert(language === "fr" ? "SQL Copié dans le presse-papiers !" : "SQL Copied to clipboard!");
                  }}
                  className="absolute right-2 top-2 p-1.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition flex items-center gap-1 text-[10px] font-orbitron"
                  title="Copy to clipboard"
                >
                  <Copy className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "COPIER" : "COPY"}</span>
                </button>
              </div>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Avatar Panel & Cosmetics Customizer */}
        <div className="space-y-6">
          <Card glowColor="violet" className="flex flex-col items-center text-center p-6 border-slate-900 bg-[#111128]/60">
          <div className="relative mb-5 mt-4">
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
              {profile?.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.username || "Warrior"}
                  className="h-24 w-24 rounded-2xl object-cover shadow-inner"
                  onError={(e) => {
                    // Fallback on image error
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              ) : null}
              {!profile?.avatar_url ? (
                <div className="h-24 w-24 rounded-2xl bg-slate-900 flex items-center justify-center font-orbitron text-3xl font-black text-slate-355 shadow-inner relative overflow-hidden">
                  {profile?.username?.substring(0, 2).toUpperCase() || "W"}
                </div>
              ) : null}
            </div>
            <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-violet-600 border-2 border-[#111128] flex items-center justify-center font-orbitron text-xs font-black text-slate-100 shadow-lg">
              {profile?.level}
            </div>
          </div>

          <h2 className="font-orbitron font-extrabold text-xl text-slate-100 uppercase tracking-widest mb-0.5">
            {profile?.username || "Warrior"}
          </h2>

          {equippedTitle && (
            <div className="text-[11px] font-orbitron font-bold text-violet-400 tracking-wider mb-2 uppercase animate-pulse">
              🛡️ {equippedTitle}
            </div>
          )}
          
          <div className="mb-2">
            {profile && <FactionBadge faction={profile.faction} />}
          </div>

          {equippedCompanion && (
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 mb-2 bg-slate-900 border border-slate-850 rounded-full text-[9px] font-bold text-amber-455 font-orbitron uppercase tracking-wider">
              🐾 {equippedCompanion}
            </div>
          )}

          {/* City & Age Badges */}
          <div className="space-y-1.5 my-3 flex flex-col items-center font-orbitron tracking-wider text-[11px] font-semibold text-slate-350">
            {profile?.city && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 rounded-full border border-slate-900/50">
                <MapPin className="h-3 w-3 text-cyan-400" />
                <span>{profile.city}</span>
              </div>
            )}
            {profile?.age && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-950/40 rounded-full border border-slate-900/50">
                <span>🎂 {profile.age} {language === "fr" ? "ans" : "y/o"}</span>
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-500 mb-4 font-orbitron font-semibold uppercase tracking-wider">
            <Calendar className="h-3.5 w-3.5 text-slate-650" />
            <span>{t("joinedDate", { date: joinDate })}</span>
          </div>

          {/* Edit Profile Button */}
          <Button
            variant="outline"
            size="sm"
            className="w-full mb-3 flex items-center justify-center gap-2 border-violet-500/30 text-violet-400 hover:bg-violet-950/20"
            onClick={() => {
              setEditUsername(profile?.username || "");
              setEditCity(profile?.city || "");
              setEditAge(profile?.age ? String(profile.age) : "");
              setEditAvatar(profile?.avatar_url || "");
              setIsEditOpen(true);
            }}
          >
            <Edit2 className="h-3.5 w-3.5" />
            <span>{language === "fr" ? "Modifier le Profil" : "Edit Profile"}</span>
          </Button>

          {/* Shop and Faction Pass Links */}
          <div className="grid grid-cols-2 gap-2 w-full mb-6">
            <Link href="/shop" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-1.5 border-amber-500/30 text-amber-400 hover:bg-amber-950/20 text-[10px] py-2 font-orbitron"
              >
                <Coins className="h-3.5 w-3.5" />
                <span>{language === "fr" ? "Boutique" : "Shop"}</span>
              </Button>
            </Link>
            <Link href="/faction-pass" className="w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-full flex items-center justify-center gap-1.5 border-cyan-500/30 text-cyan-400 hover:bg-cyan-950/20 text-[10px] py-2 font-orbitron"
              >
                <Flame className="h-3.5 w-3.5 animate-pulse" />
                <span>{language === "fr" ? "Pass Faction" : "Pass"}</span>
              </Button>
            </Link>
          </div>

          {/* Strava Integration Block */}
          <div className="w-full pt-6 border-t border-slate-900/60 space-y-4">
            <span className="block font-orbitron text-[10px] font-bold text-slate-500 tracking-widest uppercase">
              {t("stravaConnection")}
            </span>
            
            {profile?.strava_athlete_id ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-950/15 border border-emerald-900/30 rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-2 text-left">
                    <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <span className="block text-xs font-semibold text-emerald-400">{t("connected")}</span>
                      <span className="block text-[10px] text-slate-500">ID: {profile.strava_athlete_id}</span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-rose-450 hover:bg-rose-950/10 hover:border-rose-950/30"
                  onClick={handleDisconnectStrava}
                >
                  {t("disconnectStrava")}
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-slate-455 leading-relaxed">
                  {t("connectStravaDesc")}
                </p>
                <Button variant="accent" className="w-full py-2.5" onClick={handleConnectStrava}>
                  {t("connectStrava")}
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Appearance Inventory Customizer */}
        {profile && (
          <Card glowColor="none" className="border-slate-900 bg-[#111128]/60 p-5 space-y-4">
            <CardHeader className="p-0 border-b border-slate-900/40 pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-orbitron font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="h-4.5 w-4.5 text-violet-400 animate-pulse" />
                <span>{language === "fr" ? "Inventaire d'Apparence" : "Appearance Inventory"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 space-y-4 pt-1">
              {/* Tabs */}
              <div className="flex gap-1 border-b border-slate-950 pb-2">
                <button
                  type="button"
                  onClick={() => setCustomizerTab("titles")}
                  className={`flex-1 py-1.5 font-orbitron text-[9px] font-bold tracking-wider uppercase border-b-2 transition-all ${
                    customizerTab === "titles"
                      ? "text-violet-400 border-violet-500"
                      : "text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  🏆 {language === "fr" ? "Titres" : "Titles"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab("borders")}
                  className={`flex-1 py-1.5 font-orbitron text-[9px] font-bold tracking-wider uppercase border-b-2 transition-all ${
                    customizerTab === "borders"
                      ? "text-violet-400 border-violet-500"
                      : "text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  ✨ {language === "fr" ? "Bordures" : "Borders"}
                </button>
                <button
                  type="button"
                  onClick={() => setCustomizerTab("companions")}
                  className={`flex-1 py-1.5 font-orbitron text-[9px] font-bold tracking-wider uppercase border-b-2 transition-all ${
                    customizerTab === "companions"
                      ? "text-violet-400 border-violet-500"
                      : "text-slate-500 border-transparent hover:text-slate-350"
                  }`}
                >
                  🐾 {language === "fr" ? "Compagnons" : "Pets"}
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {customizerTab === "titles" &&
                  titlesList.map((item) => {
                    const isUnlocked = item.isDefault || unlockedItems.includes(item.id);
                    const isEquipped = equippedTitle === item.value;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isEquipped
                            ? "bg-violet-950/15 border-violet-500/40"
                            : isUnlocked
                            ? "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                            : "bg-slate-950/20 border-slate-950 opacity-60"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-orbitron font-bold text-[11px] text-slate-200">
                              {item.name}
                            </span>
                            {item.limited && (
                              <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                {language === "fr" ? "Éd. Limitée" : "Ltd Ed."}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium font-orbitron uppercase">
                            {isUnlocked ? (language === "fr" ? "Débloqué" : "Unlocked") : (language === "fr" ? "Verrouillé (Boutique)" : "Locked (Shop)")}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <Button
                            type="button"
                            variant={isEquipped ? "outline" : "primary"}
                            size="sm"
                            className="text-[10px] px-2.5 py-1 font-orbitron font-bold"
                            onClick={() => handleEquipCosmetic("title", isEquipped ? null : item.value)}
                          >
                            {isEquipped ? (language === "fr" ? "Déséquiper" : "Unequip") : (language === "fr" ? "Équiper" : "Equip")}
                          </Button>
                        ) : (
                          <Link href="/shop">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-[10px] px-2.5 py-1 border-slate-800 text-slate-500 hover:text-slate-350 font-orbitron font-bold"
                            >
                              {language === "fr" ? "Acheter" : "Buy"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}

                {customizerTab === "borders" &&
                  bordersList.map((item) => {
                    const isUnlocked =
                      item.isDefault ||
                      unlockedItems.includes(item.id) ||
                      (item.faction && profile.faction === item.faction);

                    const isEquipped = equippedBorder === item.value;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isEquipped
                            ? "bg-violet-950/15 border-violet-500/40"
                            : isUnlocked
                            ? "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                            : "bg-slate-950/20 border-slate-950 opacity-60"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-orbitron font-bold text-[11px] text-slate-200">
                              {item.name}
                            </span>
                            {item.limited && (
                              <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                {language === "fr" ? "Éd. Limitée" : "Ltd Ed."}
                              </span>
                            )}
                            {item.faction && (
                              <span className="bg-violet-500/10 border border-violet-500/25 text-violet-400 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                {language === "fr" ? "Faction" : "Faction"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium font-orbitron uppercase">
                            {isUnlocked
                              ? (language === "fr" ? "Débloqué" : "Unlocked")
                              : item.faction
                              ? `${language === "fr" ? "Rejoindre" : "Join"} ${item.faction}`
                              : (language === "fr" ? "Verrouillé (Boutique)" : "Locked (Shop)")}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <Button
                            type="button"
                            variant={isEquipped ? "outline" : "primary"}
                            size="sm"
                            className="text-[10px] px-2.5 py-1 font-orbitron font-bold"
                            onClick={() => handleEquipCosmetic("border", isEquipped ? null : item.value)}
                          >
                            {isEquipped ? (language === "fr" ? "Déséquiper" : "Unequip") : (language === "fr" ? "Équiper" : "Equip")}
                          </Button>
                        ) : item.faction ? (
                          <span className="text-[10px] font-orbitron font-bold text-slate-650 uppercase pr-2">
                            🔒 {language === "fr" ? "Faction" : "Faction"}
                          </span>
                        ) : (
                          <Link href="/shop">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="text-[10px] px-2.5 py-1 border-slate-800 text-slate-550 hover:text-slate-300 font-orbitron font-bold"
                            >
                              {language === "fr" ? "Acheter" : "Buy"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    );
                  })}

                {customizerTab === "companions" &&
                  companionsList.map((item) => {
                    const meetsLevel = !item.levelRequired || profile.level >= item.levelRequired;
                    const meetsFaction = !item.faction || profile.faction === item.faction;
                    const isUnlocked = item.isDefault || (meetsLevel && meetsFaction) || unlockedItems.includes(item.id);
                    const isEquipped = equippedCompanion === item.value;

                    return (
                      <div
                        key={item.id}
                        className={`p-2.5 rounded-lg border text-xs flex items-center justify-between transition ${
                          isEquipped
                            ? "bg-violet-950/15 border-violet-500/40"
                            : isUnlocked
                            ? "bg-slate-950/40 border-slate-900 hover:border-slate-800"
                            : "bg-slate-950/20 border-slate-950 opacity-60"
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-orbitron font-bold text-[11px] text-slate-200">
                              {item.name}
                            </span>
                            {item.limited && (
                              <span className="bg-amber-500/10 border border-amber-500/25 text-amber-500 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                {language === "fr" ? "Éd. Limitée" : "Ltd Ed."}
                              </span>
                            )}
                            {item.levelRequired && (
                              <span className="bg-cyan-500/10 border border-cyan-500/25 text-cyan-400 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                Niv. {item.levelRequired}+
                              </span>
                            )}
                            {item.faction && (
                              <span className="bg-violet-500/10 border border-violet-500/25 text-violet-400 text-[8px] font-orbitron font-extrabold px-1 rounded uppercase tracking-wider scale-90">
                                {language === "fr" ? "Faction" : "Faction"}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-500 font-medium font-orbitron uppercase">
                            {isUnlocked
                              ? (language === "fr" ? "Débloqué" : "Unlocked")
                              : item.levelRequired && profile.level < item.levelRequired
                              ? `${language === "fr" ? "Niveau requis" : "Requires Lvl"} ${item.levelRequired}`
                              : `${language === "fr" ? "Rejoindre" : "Join"} ${item.faction}`}
                          </span>
                        </div>

                        {isUnlocked ? (
                          <Button
                            type="button"
                            variant={isEquipped ? "outline" : "primary"}
                            size="sm"
                            className="text-[10px] px-2.5 py-1 font-orbitron font-bold"
                            onClick={() => handleEquipCosmetic("companion", isEquipped ? null : item.value)}
                          >
                            {isEquipped ? (language === "fr" ? "Déséquiper" : "Unequip") : (language === "fr" ? "Équiper" : "Equip")}
                          </Button>
                        ) : (
                          <span className="text-[10px] font-orbitron font-bold text-slate-650 uppercase pr-2">
                            🔒 {language === "fr" ? "Verrouillé" : "Locked"}
                          </span>
                        )}
                      </div>
                    );
                  })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Right Side: Hero stats detail */}
        <div className="lg:col-span-2 space-y-6">
          {/* XP Bar */}
          {profile && (
            <XPBar
              level={profile.level}
              currentXP={profile.xp}
              xpRequired={profile.level * 1000}
            />
          )}

          {/* Personal Coaching Quest Card */}
          {profile && (
            <Card glowColor={bonusExpires ? "amber" : "violet"} className="border-slate-900 bg-[#111128]/60 p-5 space-y-4">
              <CardHeader className="p-0 border-b border-slate-900/40 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-orbitron font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4.5 w-4.5 text-violet-400" />
                  <span>{language === "fr" ? "Coaching & Programme Hebdomadaire" : "Coaching & Weekly Program"}</span>
                </CardTitle>
                {bonusExpires && (
                  <div className="flex items-center gap-1 text-[10px] text-orange-400 bg-orange-950/20 border border-orange-500/30 px-2.5 py-0.5 rounded-full font-orbitron font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.3)]">
                    <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20" />
                    <span>+{language === "fr" ? "BOOST ACTIF" : "BOOST ACTIVE"} ({remainingBonusTime})</span>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-0 pt-2">
                {/* 1. Start / Info screen */}
                {coachingStep === 0 && !activeCoachingProgram && (
                  <div className="text-center p-6 space-y-4">
                    <div className="h-12 w-12 rounded-full bg-violet-950/30 border border-violet-850/50 flex items-center justify-center mx-auto text-violet-400 text-xl">
                      🎯
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-orbitron font-extrabold text-sm text-slate-200 uppercase tracking-widest">
                        {language === "fr" ? "PROGRAMME D'ASSIDUITÉ ET COACHING" : "ASSIDUITY & COACHING PROGRAM"}
                      </h4>
                      <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                        {language === "fr"
                          ? "Générez un plan d'entraînement structuré sur-mesure (type Runna). Complétez les séances hebdomadaires à 100% pour obtenir le boost de +50% XP et pièces d'Or ! Le plan s'adaptera automatiquement à votre rythme de semaine en semaine."
                          : "Generate a custom structured training plan (Runna-style). Complete all weekly sessions at 100% to trigger a 72-hour +50% XP & Gold multiplier streak bonus! The plan will dynamically adapt week-to-week."}
                      </p>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => setCoachingStep(1)}
                      className="font-orbitron font-bold text-xs py-2 px-6 uppercase mt-2 cursor-pointer"
                    >
                      🏁 {language === "fr" ? "Démarrer le Questionnaire" : "Start Questionnaire"}
                    </Button>
                  </div>
                )}

                {/* 2. Questionnaire Step 1: Sport */}
                {coachingStep === 1 && (
                  <div className="space-y-4">
                    <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                      {language === "fr" ? "1. Choisissez votre sport principal :" : "1. Choose your primary sport:"}
                    </h4>
                    <div className="grid grid-cols-3 gap-3">
                      {(["Run", "Ride", "Walk"] as const).map((sport) => (
                        <button
                          key={sport}
                          type="button"
                          onClick={() => {
                            setCoachingAnswers((prev) => ({ ...prev, sport }));
                            setCoachingStep(2);
                          }}
                          className={`p-4 rounded-xl border text-center font-orbitron font-bold text-xs transition-all cursor-pointer ${
                            coachingAnswers.sport === sport
                              ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <div className="text-2xl mb-1.5">{sport === "Run" ? "🏃" : sport === "Ride" ? "🚴" : "🚶"}</div>
                          <div className="uppercase tracking-widest text-[10px]">
                            {sport === "Run" ? (language === "fr" ? "Course" : "Run") : sport === "Ride" ? (language === "fr" ? "Vélo" : "Ride") : (language === "fr" ? "Marche" : "Walk")}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 3. Questionnaire Step 2: Plan Type */}
                {coachingStep === 2 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(1)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                        {language === "fr" ? "2. Quel plan d'entraînement ?" : "2. Choose your training plan:"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "base", label: "Base Fitness", emoji: "⚡" },
                        { id: "5k", label: "Objectif 5 km", emoji: "🏁" },
                        { id: "10k", label: "Objectif 10 km", emoji: "🏆" },
                        { id: "half", label: "Semi-Marathon", emoji: "🦁" },
                        { id: "marathon", label: "Marathon", emoji: "👑" },
                        { id: "trail", label: "Trail / Dénivelé", emoji: "⛰️" }
                      ].map((plan) => (
                        <button
                          key={plan.id}
                          type="button"
                          onClick={() => {
                            setCoachingAnswers((prev) => ({ ...prev, planType: plan.id as any }));
                            setCoachingStep(3);
                          }}
                          className={`p-3 rounded-xl border text-center font-orbitron font-bold text-xs transition-all cursor-pointer ${
                            coachingAnswers.planType === plan.id
                              ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <div className="text-xl mb-1">{plan.emoji}</div>
                          <div className="uppercase tracking-wider text-[9px]">{plan.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 4. Questionnaire Step 3: Current Capacity */}
                {coachingStep === 3 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(2)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                        {coachingAnswers.sport === "Run"
                          ? (language === "fr" ? "3. Combien pouvez-vous courir actuellement sans vous arrêter ?" : "3. What is your current running capacity?")
                          : coachingAnswers.sport === "Ride"
                          ? (language === "fr" ? "3. Quelle distance pouvez-vous rouler actuellement sans vous arrêter ?" : "3. What is your current cycling capacity?")
                          : (language === "fr" ? "3. Quelle distance pouvez-vous marcher actuellement sans vous arrêter ?" : "3. What is your current walking capacity?")
                        }
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {(() => {
                        const capOptions = coachingAnswers.sport === "Run"
                          ? [
                              { id: "none", label: language === "fr" ? "Débutant (Moins de 1km)" : "Beginner (Less than 1km)", emoji: "🐢" },
                              { id: "1km", label: language === "fr" ? "1 à 2 km" : "1 to 2 km", emoji: "🐰" },
                              { id: "5km", label: "5 km", emoji: "🦊" },
                              { id: "10km", label: "10 km", emoji: "🦌" },
                              { id: "20km+", label: language === "fr" ? "Plus de 15 km" : "More than 15 km", emoji: "🦅" }
                            ]
                          : coachingAnswers.sport === "Ride"
                          ? [
                              { id: "none", label: language === "fr" ? "Débutant (Moins de 5km)" : "Beginner (Less than 5km)", emoji: "🚲" },
                              { id: "1km", label: "10 km", emoji: "🌳" },
                              { id: "5km", label: "20 km", emoji: "🚴" },
                              { id: "10km", label: "40 km", emoji: "⚡" },
                              { id: "20km+", label: language === "fr" ? "Plus de 60 km" : "More than 60 km", emoji: "🔥" }
                            ]
                          : [ // Walk
                              { id: "none", label: language === "fr" ? "Débutant (Moins de 1km)" : "Beginner (Less than 1km)", emoji: "🚶" },
                              { id: "1km", label: "2 km", emoji: "🌳" },
                              { id: "5km", label: "5 km", emoji: "👣" },
                              { id: "10km", label: "10 km", emoji: "⚡" },
                              { id: "20km+", label: language === "fr" ? "Plus de 15 km" : "More than 15 km", emoji: "⛰️" }
                            ];
                        return capOptions.map((cap) => (
                          <button
                            key={cap.id}
                            type="button"
                            onClick={() => {
                              setCoachingAnswers((prev) => ({ ...prev, currentCapacity: cap.id as any }));
                              const dist = getReferenceDistance(cap.id, coachingAnswers.sport || "Run");
                              const def = getDefaultDuration(dist, coachingAnswers.sport || "Run");
                              setCoachingHours(def.h);
                              setCoachingMinutes(def.m);
                              setCoachingSeconds(def.s);
                              setCoachingStep(4);
                            }}
                            className={`p-3 rounded-xl border text-left font-orbitron font-bold text-xs transition-all cursor-pointer ${
                              coachingAnswers.currentCapacity === cap.id
                                ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                                : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{cap.emoji}</span>
                              <span className="uppercase tracking-wider text-[8px]">{cap.label}</span>
                            </div>
                          </button>
                        ));
                      })()}
                    </div>
                  </div>
                )}

                {/* 5. Questionnaire Step 3b (4): Reference Pace / Speed */}
                {coachingStep === 4 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(3)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      {(() => {
                        const refDistance = coachingAnswers.currentCapacity
                          ? getReferenceDistance(coachingAnswers.currentCapacity, coachingAnswers.sport || "Run")
                          : 5;
                        return (
                          <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                            {coachingAnswers.sport === "Run"
                              ? (language === "fr" 
                                  ? `4. En combien de temps pouvez-vous courir ${refDistance} km ?` 
                                  : `4. In how much time can you run ${refDistance} km?`)
                              : coachingAnswers.sport === "Ride"
                              ? (language === "fr" 
                                  ? `4. En combien de temps pouvez-vous rouler ${refDistance} km ?` 
                                  : `4. In how much time can you ride ${refDistance} km?`)
                              : (language === "fr" 
                                  ? `4. En combien de temps pouvez-vous marcher ${refDistance} km ?` 
                                  : `4. In how much time can you walk ${refDistance} km?`)
                            }
                          </h4>
                        );
                      })()}
                    </div>
                    {(() => {
                      const refDistance = coachingAnswers.currentCapacity
                        ? getReferenceDistance(coachingAnswers.currentCapacity, coachingAnswers.sport || "Run")
                        : 5;

                      const calculatedPace = calculateReferencePace(
                        coachingAnswers.sport || "Run",
                        refDistance,
                        coachingHours,
                        coachingMinutes,
                        coachingSeconds
                      );

                      let calculatedEasy = "6:30";
                      let calculatedTempo = "5:45";
                      let calculatedIntervals = "5:15";

                      if (coachingAnswers.sport === "Run") {
                        calculatedEasy = calculatedPace;
                        const easySec = parsePaceToSeconds(calculatedEasy, "Run");
                        calculatedTempo = formatSecondsToPace(easySec - 45, "Run");
                        calculatedIntervals = formatSecondsToPace(easySec - 90, "Run");
                      } else if (coachingAnswers.sport === "Ride") {
                        calculatedEasy = calculatedPace;
                        const easyVal = parseInt(calculatedEasy) || 20;
                        calculatedTempo = `${easyVal + 4} km/h`;
                        calculatedIntervals = `${easyVal + 8} km/h`;
                      } else {
                        // Walk
                        calculatedEasy = calculatedPace;
                        const easyVal = parseFloat(calculatedEasy) || 5.0;
                        calculatedTempo = `${(easyVal + 1.0).toFixed(1)} km/h`;
                        calculatedIntervals = `${(easyVal + 2.0).toFixed(1)} km/h`;
                      }

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-center gap-3 bg-slate-950/60 p-4 rounded-xl border border-slate-900">
                            {/* Hours */}
                            <div className="flex flex-col items-center">
                              <label className="text-[9px] font-orbitron font-bold text-slate-550 uppercase tracking-wider mb-1">
                                {language === "fr" ? "Heures" : "Hours"}
                              </label>
                              <select
                                value={coachingHours}
                                onChange={(e) => setCoachingHours(parseInt(e.target.value))}
                                className="bg-[#111128] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-205 font-orbitron font-bold focus:outline-none focus:border-violet-500"
                              >
                                {Array.from({ length: 10 }, (_, i) => (
                                  <option key={i} value={i}>{i}h</option>
                                ))}
                              </select>
                            </div>
                            <div className="text-slate-650 font-bold self-end mb-1.5">:</div>
                            {/* Minutes */}
                            <div className="flex flex-col items-center">
                              <label className="text-[9px] font-orbitron font-bold text-slate-555 uppercase tracking-wider mb-1">
                                {language === "fr" ? "Minutes" : "Minutes"}
                              </label>
                              <select
                                value={coachingMinutes}
                                onChange={(e) => setCoachingMinutes(parseInt(e.target.value))}
                                className="bg-[#111128] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-205 font-orbitron font-bold focus:outline-none focus:border-violet-500"
                              >
                                {Array.from({ length: 60 }, (_, i) => (
                                  <option key={i} value={i}>{i.toString().padStart(2, "0")}m</option>
                                ))}
                              </select>
                            </div>
                            <div className="text-slate-650 font-bold self-end mb-1.5">:</div>
                            {/* Seconds */}
                            <div className="flex flex-col items-center">
                              <label className="text-[9px] font-orbitron font-bold text-slate-555 uppercase tracking-wider mb-1">
                                {language === "fr" ? "Secondes" : "Seconds"}
                              </label>
                              <select
                                value={coachingSeconds}
                                onChange={(e) => setCoachingSeconds(parseInt(e.target.value))}
                                className="bg-[#111128] border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-205 font-orbitron font-bold focus:outline-none focus:border-violet-500"
                              >
                                {Array.from({ length: 60 }, (_, i) => (
                                  <option key={i} value={i}>{i.toString().padStart(2, "0")}s</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          {/* Pace Preview Card */}
                          <div className="bg-violet-950/10 border border-violet-900/30 rounded-xl p-3.5 space-y-2">
                            <div className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                              <span>
                                {coachingAnswers.sport === "Run"
                                  ? (language === "fr" ? "Allure moyenne estimée :" : "Estimated average pace:")
                                  : (language === "fr" ? "Vitesse moyenne estimée :" : "Estimated average speed:")
                                }
                              </span>
                              <span className="text-violet-405 text-xs font-extrabold font-orbitron">
                                {calculatedPace}
                              </span>
                            </div>
                            
                            <div className="border-t border-slate-900/40 my-1.5" />
                            
                            <div className="grid grid-cols-3 gap-2 text-center">
                              <div className="bg-slate-950/30 p-1.5 rounded border border-slate-900/50">
                                <div className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Easy</div>
                                <div className="text-[10px] text-cyan-400 font-orbitron font-bold mt-0.5">{calculatedEasy}</div>
                              </div>
                              <div className="bg-slate-950/30 p-1.5 rounded border border-slate-900/50">
                                <div className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Tempo</div>
                                <div className="text-[10px] text-amber-500 font-orbitron font-bold mt-0.5">{calculatedTempo}</div>
                              </div>
                              <div className="bg-slate-950/30 p-1.5 rounded border border-slate-900/50">
                                <div className="text-[8px] text-slate-500 uppercase tracking-wider font-bold">Intervals</div>
                                <div className="text-[10px] text-violet-400 font-orbitron font-bold mt-0.5">{calculatedIntervals}</div>
                              </div>
                            </div>
                          </div>

                          <Button
                            variant="primary"
                            onClick={() => {
                              setCoachingAnswers((prev) => ({ ...prev, referencePace: calculatedPace }));
                              setCoachingStep(5);
                            }}
                            className="w-full py-2 font-orbitron font-bold text-xs uppercase cursor-pointer"
                          >
                            {language === "fr" ? "Continuer" : "Continue"}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                )}

                {/* 6. Questionnaire Step 4 (5): Target Goal Type */}
                {coachingStep === 5 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(4)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                        {language === "fr" ? "5. Quel est votre but de performance ?" : "5. What is your goal type?"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { id: "finish", label: "Finir la distance", desc: "Se concentrer sur l'endurance pure", emoji: "🏁" },
                        { id: "time_performance", label: "Performance Chrono", desc: "Viser des allures plus rapides", emoji: "⚡" }
                      ].map((goal) => (
                        <button
                          key={goal.id}
                          type="button"
                          onClick={() => {
                            setCoachingAnswers((prev) => ({ ...prev, targetGoal: goal.id as any }));
                            setCoachingStep(6);
                          }}
                          className={`p-3 rounded-xl border text-center font-orbitron font-bold text-xs transition-all cursor-pointer ${
                            coachingAnswers.targetGoal === goal.id
                              ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          <div className="text-xl mb-1">{goal.emoji}</div>
                          <div className="uppercase tracking-widest text-[9px] font-black">{goal.label}</div>
                          <div className="text-[8px] text-slate-500 font-normal mt-0.5">{goal.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 7. Questionnaire Step 5 (6): Frequency */}
                {coachingStep === 6 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(5)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                        {language === "fr" ? "6. Combien de séances par semaine ?" : "6. How many workouts per week?"}
                      </h4>
                    </div>
                    <div className="grid grid-cols-4 gap-3">
                      {([2, 3, 4, 5] as const).map((freq) => (
                        <button
                          key={freq}
                          type="button"
                          onClick={() => {
                            setCoachingAnswers((prev) => ({ ...prev, frequency: freq }));
                            setCoachingStep(7);
                          }}
                          className={`p-3 rounded-xl border text-center font-orbitron font-black text-sm transition-all cursor-pointer ${
                            coachingAnswers.frequency === freq
                              ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                              : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                          }`}
                        >
                          {freq}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 8. Questionnaire Step 6 (7): Weeks count */}
                {coachingStep === 7 && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setCoachingStep(6)}
                        className="p-1 hover:bg-slate-900 rounded text-slate-400 cursor-pointer"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <h4 className="text-xs font-orbitron font-extrabold text-slate-300 uppercase tracking-wider">
                        {language === "fr" ? "7. Quelle durée de programme ?" : "7. Choose plan duration:"}
                      </h4>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="grid grid-cols-3 gap-3">
                        {([4, 8, 12] as const).map((wCount) => (
                          <button
                            key={wCount}
                            type="button"
                            onClick={() => setCoachingAnswers((prev) => ({ ...prev, weeksCount: wCount }))}
                            className={`p-4 rounded-xl border text-center font-orbitron font-bold text-xs transition-all cursor-pointer ${
                              coachingAnswers.weeksCount === wCount
                                ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_10px_rgba(139,92,246,0.2)]"
                                : "bg-slate-950/40 border-slate-900 text-slate-400 hover:border-slate-800"
                            }`}
                          >
                            {wCount} {language === "fr" ? "Semaines" : "Weeks"}
                          </button>
                        ))}
                      </div>
 
                      {coachingAnswers.weeksCount && (
                        <Button
                          variant="accent"
                          onClick={handleSubmitQuestionnaire}
                          className="w-full py-2.5 font-orbitron font-extrabold text-xs uppercase mt-2 cursor-pointer"
                        >
                          🚀 {language === "fr" ? "GÉNÉRER LE PLAN AVANCÉ" : "GENERATE ADVANCED PLAN"}
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* 8. Active coaching program tracking */}
                {activeCoachingProgram && (
                  <div className="space-y-4">
                    {/* Header Details */}
                    <div className="flex items-center justify-between border-b border-slate-900 pb-2 flex-wrap gap-2">
                      <div>
                        <h5 className="font-orbitron font-extrabold text-xs text-slate-200 uppercase tracking-widest">
                          {activeCoachingProgram.name}
                        </h5>
                         <div className="flex items-center gap-2 mt-1 flex-wrap text-[9px] font-orbitron font-bold uppercase tracking-wider">
                          <span className="text-slate-550">🎯 {language === "fr" ? "Allures :" : "Paces:"}</span>
                          <span className="text-cyan-400">Easy: {activeCoachingProgram.targetPaces?.easy || "N/A"}</span>
                          <span className="text-amber-500">Tempo: {activeCoachingProgram.targetPaces?.tempo || "N/A"}</span>
                          <span className="text-violet-400">Speed: {activeCoachingProgram.targetPaces?.intervals || "N/A"}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetCoaching}
                        className="text-[9px] font-orbitron font-bold text-rose-450 hover:text-rose-350 transition uppercase cursor-pointer"
                      >
                        🗑️ {language === "fr" ? "Réinitialiser" : "Reset Plan"}
                      </button>
                    </div>

                    {/* Weeks selector */}
                    <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-slate-900/40 max-w-full">
                      {activeCoachingProgram.weeks.map((week, idx) => {
                        const isCurrent = idx === activeCoachingProgram.currentWeekIndex;
                        const isActiveTab = activeWeekTab === week.weekNumber;
                        
                        let weekBadge = "";
                        if (week.status === 'completed') weekBadge = "🏆";
                        else if (week.status === 'partial') weekBadge = "⚡";
                        else if (week.status === 'failed') weekBadge = "⚠️";

                        return (
                          <button
                            key={week.weekNumber}
                            type="button"
                            onClick={() => setActiveWeekTab(week.weekNumber)}
                            className={`px-3 py-1.5 rounded-lg border font-orbitron font-bold text-[9px] uppercase tracking-wider shrink-0 transition cursor-pointer ${
                              isActiveTab
                                ? "bg-violet-950/30 border-violet-500 text-violet-400 shadow-[0_0_8px_rgba(139,92,246,0.15)]"
                                : isCurrent
                                ? "bg-slate-950 border-cyan-500/50 text-cyan-400"
                                : "bg-slate-950/50 border-slate-900 text-slate-550 hover:text-slate-400"
                            }`}
                          >
                            S{week.weekNumber} {weekBadge}
                          </button>
                        );
                      })}
                    </div>

                    {/* Display selected week workouts */}
                    {(() => {
                      const selectedWeek = activeCoachingProgram.weeks.find((w) => w.weekNumber === activeWeekTab);
                      if (!selectedWeek) return null;

                      const isCurrentWeek = (activeWeekTab - 1) === activeCoachingProgram.currentWeekIndex;
                      const completedCount = selectedWeek.workouts.filter((w) => w.completed).length;
                      const totalCount = selectedWeek.workouts.length;
                      const compPct = totalCount > 0 ? (completedCount / totalCount) : 0;

                      const dateRange = getCoachingWeekDateRange(
                        activeCoachingProgram.startedAt || new Date().toISOString(),
                        activeWeekTab
                      );
                      const startStr = dateRange.start.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" });
                      const endStr = dateRange.end.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" });

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-slate-400 bg-slate-950/20 p-2.5 rounded-lg border border-slate-900/60 flex-wrap gap-2 shadow-[0_0_8px_rgba(6,182,212,0.03)]">
                            <span className="flex items-center gap-1">
                              <span className="text-slate-500">📅</span>
                              <span className="text-slate-300">{language === "fr" ? "Semaine du :" : "Week range:"}</span>
                              <span className="text-violet-400">{startStr}</span>
                              <span className="text-slate-550">{language === "fr" ? "au" : "to"}</span>
                              <span className="text-violet-400">{endStr}</span>
                            </span>
                            {isCurrentWeek && remainingWeekTime && (
                              <span className="text-cyan-400 font-black animate-pulse flex items-center gap-1">
                                <span>⏳</span>
                                <span>{remainingWeekTime}</span>
                              </span>
                            )}
                          </div>

                          {selectedWeek.adaptationReport && (
                            <div className="p-2.5 bg-slate-950/30 border border-slate-900 rounded-lg text-[10px] text-slate-400 font-semibold leading-relaxed">
                              📢 <strong>{language === "fr" ? "Adaptation :" : "Adaptation:"}</strong> {selectedWeek.adaptationReport}
                            </div>
                          )}

                          <div className="space-y-3">
                            {selectedWeek.workouts.map((w) => (
                              <div
                                key={w.id}
                                className={`p-3.5 rounded-xl border transition-all ${
                                  w.completed
                                    ? "bg-emerald-950/10 border-emerald-900/30 shadow-[0_0_8px_rgba(16,185,129,0.05)]"
                                    : isCurrentWeek
                                    ? "bg-slate-950/40 border-slate-900/80 hover:border-slate-800"
                                    : "bg-slate-950/20 border-slate-950 opacity-60"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <span className="font-orbitron font-extrabold text-xs text-slate-100 uppercase tracking-widest">
                                        {w.name}
                                      </span>
                                      <Badge
                                        variant={
                                          w.type === "Intervals" ? "primary" : w.type === "Tempo" ? "accent" : "secondary"
                                        }
                                        className="scale-90"
                                      >
                                        {w.type}
                                      </Badge>
                                    </div>
                                    <p className="text-[10px] text-slate-500">{w.description}</p>
                                  </div>

                                  <div className="flex items-center gap-2 shrink-0">
                                    {w.targetDistance && (
                                      <div className="text-[10px] bg-slate-950 border border-slate-900 font-orbitron font-bold text-slate-350 px-2 py-0.5 rounded uppercase">
                                        {w.targetDistance} km
                                      </div>
                                    )}
                                    {w.targetDuration && (
                                      <div className="text-[10px] bg-slate-950 border border-slate-900 font-orbitron font-bold text-slate-350 px-2 py-0.5 rounded uppercase">
                                        {w.targetDuration} min
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Segments structures */}
                                <div className="mt-3 bg-slate-950/50 rounded-lg p-2.5 border border-slate-900/50 space-y-1.5 animate-fade-in">
                                  {w.structure.map((seg, sidx) => {
                                    const isWarmup = seg.toLowerCase().includes("échauffement") || seg.toLowerCase().includes("warm-up");
                                    const isCooldown = seg.toLowerCase().includes("retour au calme") || seg.toLowerCase().includes("cool-down");

                                    if (isWarmup) {
                                      return (
                                        <details key={sidx} className="group transition-all duration-305">
                                          <summary className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium cursor-pointer hover:text-violet-400 select-none list-none outline-none">
                                            <span className="text-violet-400">•</span>
                                            <span className="border-b border-dotted border-slate-600 hover:border-violet-500">{seg}</span>
                                            <span className="text-[7px] bg-violet-950/30 border border-violet-900/40 text-violet-400 font-bold px-1 rounded-sm tracking-wider group-open:bg-violet-900/40">INFO</span>
                                          </summary>
                                          <div className="mt-1.5 ml-3 p-2.5 bg-[#141432] border border-violet-900/20 rounded-lg text-[9px] text-slate-400 leading-relaxed max-w-sm shadow-md">
                                            💡 <strong>{language === "fr" ? "Échauffement :" : "Warm-up:"}</strong>{" "}
                                            {language === "fr"
                                              ? "Cette phase prépare le cœur, les muscles et les articulations à l'effort. Commencez par un trot ou pas léger très facile, puis augmentez progressivement le rythme."
                                              : "Prepares your heart, muscles, and joints for the effort. Start with a very easy jog/trot or walk, then gradually build up the intensity."}
                                          </div>
                                        </details>
                                      );
                                    }

                                    if (isCooldown) {
                                      return (
                                        <details key={sidx} className="group transition-all duration-305">
                                          <summary className="flex items-center gap-1.5 text-[10px] text-slate-400 font-medium cursor-pointer hover:text-violet-400 select-none list-none outline-none">
                                            <span className="text-violet-400">•</span>
                                            <span className="border-b border-dotted border-slate-600 hover:border-violet-500">{seg}</span>
                                            <span className="text-[7px] bg-violet-950/30 border border-violet-900/40 text-violet-400 font-bold px-1 rounded-sm tracking-wider group-open:bg-violet-900/40">INFO</span>
                                          </summary>
                                          <div className="mt-1.5 ml-3 p-2.5 bg-[#141432] border border-violet-900/20 rounded-lg text-[9px] text-slate-400 leading-relaxed max-w-sm shadow-md">
                                            💡 <strong>{language === "fr" ? "Retour au calme :" : "Cool-down:"}</strong>{" "}
                                            {language === "fr"
                                              ? "Permet de faire redescendre progressivement le rythme cardiaque et d'éliminer les toxines. Terminez par 5-10 min de trot très lent ou de marche de récupération."
                                              : "Gradually lowers your heart rate and helps flush metabolic waste. Finish with 5-10 min of very light jogging or easy recovery walking."}
                                          </div>
                                        </details>
                                      );
                                    }

                                    return (
                                      <div key={sidx} className="flex items-start gap-1.5 text-[10px] text-slate-400 font-medium">
                                        <span className="text-violet-400 select-none">•</span>
                                        <span>{seg}</span>
                                      </div>
                                    );
                                  })}
                                </div>

                                {/* post-run analysis debrief report */}
                                {w.completed && (w.actualDistance != null || w.actualPace != null) && (() => {
                                  const logged = workouts.find((lw) => lw.id === w.associatedWorkoutId);
                                  const elevation = logged ? logged.elevation_gain : (w.elevationGain || 0);
                                  const durationVal = w.actualDuration || (logged ? (logged.duration || 0) : 0);
                                  const bpmVal = w.avgHeartrate || (logged ? logged.avg_heartrate : null);
                                  
                                  let gapStr = "";
                                  if (elevation >= 15 && w.actualDistance && durationVal) {
                                    const adjDist = w.actualDistance + (elevation / 100);
                                    const gapSec = durationVal / adjDist;
                                    gapStr = formatSecondsToPace(gapSec, activeCoachingProgram.sport);
                                  }

                                  const formatDuration = (totalSeconds: number): string => {
                                    const hrs = Math.floor(totalSeconds / 3600);
                                    const mins = Math.floor((totalSeconds % 3600) / 60);
                                    const secs = totalSeconds % 60;
                                    if (hrs > 0) {
                                      return `${hrs}h ${mins.toString().padStart(2, "0")}m ${secs.toString().padStart(2, "0")}s`;
                                    }
                                    return `${mins}:${secs.toString().padStart(2, "0")}`;
                                  };

                                  const isRunningOrWalking = activeCoachingProgram.sport === "Run" || activeCoachingProgram.sport === "Walk";
                                  const paceLabel = isRunningOrWalking
                                    ? (language === "fr" ? "Allure" : "Pace")
                                    : (language === "fr" ? "Vitesse" : "Speed");

                                  return (
                                    <div className="mt-3 p-3 bg-emerald-950/15 border border-emerald-800/30 rounded-xl space-y-3 animate-fade-in shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                                      <span className="block text-[9px] font-orbitron font-extrabold text-emerald-400 tracking-widest uppercase flex items-center gap-1.5">
                                        <span className="animate-pulse">📊</span>
                                        <span>{language === "fr" ? "Rapport d'Analyse (Compte-rendu)" : "Workout Analysis Report"}</span>
                                      </span>
                                      
                                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-[10px] font-orbitron">
                                        {/* Column 1: Distance */}
                                        <div className="space-y-0.5 bg-slate-950/30 border border-slate-900/60 p-2 rounded-lg">
                                          <span className="block text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                                            Distance:
                                          </span>
                                          <span className="font-extrabold text-slate-200 block text-xs">
                                            {w.actualDistance?.toFixed(2)} km
                                          </span>
                                          {w.targetDistance && (
                                            <span className="block text-[8px] text-slate-500">
                                              {language === "fr" ? "Cible :" : "Target:"} {w.targetDistance} km
                                            </span>
                                          )}
                                        </div>

                                        {/* Column 2: Duration */}
                                        <div className="space-y-0.5 bg-slate-950/30 border border-slate-900/60 p-2 rounded-lg">
                                          <span className="block text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                                            {language === "fr" ? "Durée :" : "Duration:"}
                                          </span>
                                          <span className="font-extrabold text-slate-200 block text-xs">
                                            {formatDuration(durationVal)}
                                          </span>
                                          {w.targetDuration && (
                                            <span className="block text-[8px] text-slate-500">
                                              {language === "fr" ? "Cible :" : "Target:"} {w.targetDuration} min
                                            </span>
                                          )}
                                        </div>

                                        {/* Column 3: Pace/Speed + GAP */}
                                        <div className="space-y-0.5 bg-slate-950/30 border border-slate-900/60 p-2 rounded-lg col-span-1">
                                          <span className="block text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                                            {paceLabel} :
                                          </span>
                                          <span className="font-extrabold text-slate-200 block text-xs">
                                            {w.actualPace}
                                          </span>
                                          {w.targetPace ? (
                                            <span className="block text-[8px] text-slate-500">
                                              {language === "fr" ? "Cible :" : "Target:"} {w.targetPace}
                                            </span>
                                          ) : (
                                            <span className="block text-[8px] text-slate-500">-</span>
                                          )}
                                          {gapStr && (
                                            <div className="mt-1 pt-1 border-t border-slate-900/60">
                                              <span className="block text-[7px] text-cyan-500 uppercase font-black">
                                                {language === "fr" ? "GAP (Ajustée) :" : "GAP (Adjusted):"}
                                              </span>
                                              <span className="text-[9px] text-cyan-400 font-black tracking-wide flex items-center gap-0.5 animate-pulse">
                                                ⚡ {gapStr}
                                              </span>
                                            </div>
                                          )}
                                        </div>

                                        {/* Column 4: Heart Rate / BPM */}
                                        <div className="space-y-0.5 bg-slate-950/30 border border-slate-900/60 p-2 rounded-lg">
                                          <span className="block text-slate-500 font-bold uppercase tracking-wider text-[8px]">
                                            {language === "fr" ? "Fréq. Cardiaque :" : "Heart Rate:"}
                                          </span>
                                          {bpmVal ? (
                                            <span className="font-extrabold text-slate-200 block text-xs flex items-center gap-1">
                                              <span className="text-pink-500">❤️</span>
                                              <span>{Math.round(bpmVal)} bpm</span>
                                            </span>
                                          ) : (
                                            <span className="text-slate-550 block text-[9px] italic">
                                              {language === "fr" ? "Non disponible" : "Not available"}
                                            </span>
                                          )}
                                          {elevation > 0 && (
                                            <span className="block text-[8px] text-rose-400 font-medium">
                                              ⛰️ +{Math.round(elevation)}m
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                      
                                      {w.coachFeedback && (
                                        <div className="text-[10px] text-slate-400 leading-relaxed pt-2.5 border-t border-slate-900/60 font-medium flex items-start gap-1.5">
                                          <span className="text-base leading-none select-none">💬</span>
                                          <span className="italic">{w.coachFeedback}</span>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}

                                {/* Association Controls */}
                                <div className="mt-3 pt-2.5 border-t border-slate-900/40 flex items-center justify-between flex-wrap gap-2">
                                  <div className="flex items-center gap-1.5 text-[10px] font-orbitron font-bold">
                                    <span className="text-slate-550">{language === "fr" ? "Gain :" : "Rewards:"}</span>
                                    <span className="text-violet-400">+{w.xpReward} XP</span>
                                    <span className="text-amber-500">+{w.goldReward} Or</span>
                                  </div>

                                  {w.completed ? (
                                    <div className="flex items-center gap-1.5 text-[10px] font-orbitron font-bold">
                                      <span className="text-emerald-400">✓ {language === "fr" ? "Complété" : "Completed"}</span>
                                      {w.paceAccuracy && (
                                        <span className="bg-emerald-950/30 border border-emerald-900/40 px-1.5 py-0.5 rounded uppercase tracking-wider text-[8px] text-emerald-400">
                                          Acc: {w.paceAccuracy}%
                                        </span>
                                      )}
                                      {isCurrentWeek && (
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          className="py-0 px-2 text-[8px] font-orbitron font-bold h-6 uppercase cursor-pointer border-rose-900/50 hover:border-rose-700 text-rose-450 hover:bg-rose-950/20"
                                          onClick={() => handleDisassociateWorkout(w.id)}
                                        >
                                          {language === "fr" ? "Dissocier" : "Disassociate"}
                                        </Button>
                                      )}
                                    </div>
                                  ) : isCurrentWeek ? (
                                    <Button
                                      variant="primary"
                                      size="sm"
                                      className="py-1 px-3 text-[9px] font-orbitron font-bold h-7 uppercase cursor-pointer"
                                      onClick={() => {
                                        setWorkoutToAssociate(w);
                                        setShowAssociateModal(true);
                                      }}
                                    >
                                      🔗 {language === "fr" ? "Associer Strava" : "Link Strava"}
                                    </Button>
                                  ) : (
                                    <span className="text-[10px] font-orbitron font-bold text-slate-650 uppercase">
                                      🔒 {language === "fr" ? "Semaine inactive" : "Inactive week"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Close week controls */}
                          {isCurrentWeek && (
                            <div className="pt-4 border-t border-slate-900/50 flex flex-col gap-3">
                              <div className="flex items-center justify-between text-xs font-orbitron font-bold text-slate-400">
                                <span>{language === "fr" ? "Progression Semaine :" : "Weekly Progress:"}</span>
                                <span>
                                  {completedCount} / {totalCount} {language === "fr" ? "Séances" : "Workouts"} ({Math.round(compPct * 100)}%)
                                </span>
                              </div>
                              <div className="h-2 w-full bg-slate-950 border border-slate-900 rounded-full overflow-hidden p-0.5">
                                <div
                                  style={{ width: `${compPct * 100}%` }}
                                  className="h-full bg-gradient-to-r from-violet-600 to-emerald-400 rounded-full"
                                />
                              </div>

                              {compPct === 1.0 && !activeCoachingProgram.claimed && (
                                <Button
                                  variant="accent"
                                  onClick={handleClaimCoachingBonus}
                                  className="w-full py-3 font-orbitron font-black text-xs uppercase animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.5)] border border-amber-500 cursor-pointer"
                                >
                                  🔥 {language === "fr" ? "Réclamer le Boost d'Assiduité (72h)" : "Claim Assiduity Streak Boost (72h)"}
                                </Button>
                              )}

                              {compPct === 1.0 && activeCoachingProgram.claimed && (
                                <div className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg text-center text-xs text-emerald-400 font-orbitron font-bold flex items-center justify-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                                  <Check className="h-4 w-4" />
                                  <span>{language === "fr" ? "Boost d'assiduité actif !" : "Streak boost active!"}</span>
                                </div>
                              )}

                              <Button
                                variant="outline"
                                onClick={handleCloseWeek}
                                className="w-full py-2.5 font-orbitron font-bold text-xs uppercase border-slate-850 hover:bg-slate-950 cursor-pointer"
                              >
                                🏁 {language === "fr" ? "Clôturer la Semaine active" : "Close active week"}
                              </Button>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Mastery Levels Card */}
          {profile && (
            <Card glowColor="violet" className="border-slate-900 bg-[#111128]/60 p-5 space-y-4">
              <CardHeader className="p-0 border-b border-slate-900/40 pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-orbitron font-extrabold text-slate-100 uppercase tracking-widest flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-violet-400" />
                  <span>{language === "fr" ? "Maîtrise des Disciplines" : "Discipline Masteries"}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0 space-y-5 pt-3">
                {/* 1. Run Mastery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-orbitron font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🏃</span>
                      <span className="text-slate-200">{language === "fr" ? "Course à pied" : "Running"}</span>
                      <Badge variant="neutral" className="text-[8px] px-1.5 py-0 border-violet-500/20 text-violet-400 font-extrabold">
                        {runMastery.level >= 10 ? (language === "fr" ? "MAÎTRE" : "MASTER") : runMastery.level >= 5 ? (language === "fr" ? "VÉTÉRAN" : "VETERAN") : (language === "fr" ? "NOVICE" : "NOVICE")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 font-orbitron">
                      <span className="text-[10px] bg-slate-950 border border-slate-900 text-slate-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Niv. {runMastery.level}
                      </span>
                      <span className="text-[10px] text-violet-400 font-black">
                        {Math.round(runMastery.currentXP)}
                      </span>
                      <span className="text-[9px] text-slate-550 font-medium">
                        / {runMastery.xpRequired} XP
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-violet-600 rounded shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500"
                      style={{ width: `${(runMastery.currentXP / runMastery.xpRequired) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 2. Ride Mastery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-orbitron font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚴</span>
                      <span className="text-slate-200">{language === "fr" ? "Cyclisme" : "Cycling"}</span>
                      <Badge variant="neutral" className="text-[8px] px-1.5 py-0 border-amber-500/20 text-amber-500 font-extrabold">
                        {rideMastery.level >= 10 ? (language === "fr" ? "MAÎTRE" : "MASTER") : rideMastery.level >= 5 ? (language === "fr" ? "VÉTÉRAN" : "VETERAN") : (language === "fr" ? "NOVICE" : "NOVICE")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 font-orbitron">
                      <span className="text-[10px] bg-slate-950 border border-slate-900 text-slate-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Niv. {rideMastery.level}
                      </span>
                      <span className="text-[10px] text-amber-550 font-black">
                        {Math.round(rideMastery.currentXP)}
                      </span>
                      <span className="text-[9px] text-slate-550 font-medium">
                        / {rideMastery.xpRequired} XP
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-amber-500 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                      style={{ width: `${(rideMastery.currentXP / rideMastery.xpRequired) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 3. Walk Mastery */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-orbitron font-bold">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">🚶</span>
                      <span className="text-slate-200">{language === "fr" ? "Marche & Rando" : "Walking & Hiking"}</span>
                      <Badge variant="neutral" className="text-[8px] px-1.5 py-0 border-cyan-500/20 text-cyan-400 font-extrabold">
                        {walkMastery.level >= 10 ? (language === "fr" ? "MAÎTRE" : "MASTER") : walkMastery.level >= 5 ? (language === "fr" ? "VÉTÉRAN" : "VETERAN") : (language === "fr" ? "NOVICE" : "NOVICE")}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-1.5 font-orbitron">
                      <span className="text-[10px] bg-slate-950 border border-slate-900 text-slate-300 px-1.5 py-0.5 rounded font-extrabold uppercase">
                        Niv. {walkMastery.level}
                      </span>
                      <span className="text-[10px] text-cyan-450 font-black">
                        {Math.round(walkMastery.currentXP)}
                      </span>
                      <span className="text-[9px] text-slate-550 font-medium">
                        / {walkMastery.xpRequired} XP
                      </span>
                    </div>
                  </div>
                  <div className="w-full h-2.5 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-cyan-500 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                      style={{ width: `${(walkMastery.currentXP / walkMastery.xpRequired) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Statistics */}
          <Card glowColor="none" className="border-slate-900 bg-[#111128]/60 p-6">
            <CardHeader className="mb-6">
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-violet-500" />
                <span>{t("heroStatistics")}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {/* Stat item */}
                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-550 tracking-wider uppercase">
                    {t("questsCompleted")}
                  </span>
                  <span className="block font-orbitron font-black text-xl text-slate-200">
                    {totalQuests}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-555 tracking-wider uppercase">
                    {t("totalDistance")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="block font-orbitron font-black text-xl text-slate-200">
                      {totalDist.toFixed(1)}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase font-orbitron">KM</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-555 tracking-wider uppercase">
                    {t("totalElevation")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="block font-orbitron font-black text-xl text-slate-200">
                      {totalElev}
                    </span>
                    <span className="text-xs text-slate-500 font-bold uppercase font-orbitron">M</span>
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-555 tracking-wider uppercase">
                    {t("avgHeartRate")}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="block font-orbitron font-black text-xl text-slate-200">
                      {avgHR > 0 ? Math.round(avgHR) : "N/A"}
                    </span>
                    {avgHR > 0 && <span className="text-xs text-slate-500 font-bold uppercase font-orbitron">BPM</span>}
                  </div>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-555 tracking-wider uppercase">
                    {t("xpPerQuest")}
                  </span>
                  <span className="block font-orbitron font-black text-xl text-slate-200">
                    {totalQuests > 0 ? Math.round(profile!.xp / totalQuests) : 0}
                  </span>
                </div>

                <div className="p-4 bg-slate-950/40 border border-slate-900/60 rounded-xl space-y-1">
                  <span className="block text-[10px] font-orbitron font-bold text-slate-555 tracking-wider uppercase">
                    {t("goldPerQuest")}
                  </span>
                  <span className="block font-orbitron font-black text-xl text-slate-200">
                    {totalQuests > 0 ? Math.round((profile!.gold - 100) / totalQuests) : 0}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            glowColor="violet"
            className="w-full max-w-lg bg-[#111128] border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-900">
              <h3 className="font-orbitron font-extrabold text-sm tracking-widest text-slate-100 uppercase flex items-center gap-2">
                <User className="h-4 w-4 text-violet-500" />
                <span>{language === "fr" ? "MODIFIER LE HÉROS" : "EDIT HERO PROFILE"}</span>
              </h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-250 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Strava Quick Import */}
              {profile?.strava_athlete_id && (
                <div className="p-4 bg-cyan-950/10 border border-cyan-900/30 rounded-xl flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="block font-orbitron font-bold text-[10px] text-cyan-400 tracking-wider uppercase">
                      {language === "fr" ? "Synchronisation Strava" : "Strava Sync"}
                    </span>
                    <span className="block text-xs text-slate-400">
                      {language === "fr" 
                        ? "Remplir automatiquement via vos données Strava." 
                        : "Autofill profile details from your Strava account."}
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    className="shrink-0 flex items-center gap-1.5"
                    onClick={handleImportStravaProfile}
                    loading={importingStrava}
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>{language === "fr" ? "Importer" : "Import"}</span>
                  </Button>
                </div>
              )}

              {/* Character Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {language === "fr" ? "Pseudo du Héros" : "Hero Pseudo"}
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-650" />
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      placeholder="e.g. ShadowRunner"
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-600 transition"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {language === "fr" ? "Ville" : "City"}
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-slate-650" />
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => {
                        setEditCity(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() => {
                        // Delay closing suggestions so click handlers can run first
                        setTimeout(() => setShowSuggestions(false), 200);
                      }}
                      placeholder="e.g. Paris"
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-600 transition"
                    />
                    
                    {showSuggestions && (apiLoading || apiSuggestions.length > 0) && (
                      <div className="absolute left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-[#111128] border border-slate-800 rounded-lg shadow-xl z-50 divide-y divide-slate-950/40">
                        {apiLoading ? (
                          <div className="p-3 text-center text-xs text-slate-500 font-orbitron uppercase tracking-widest flex items-center justify-center gap-2">
                            <RefreshCw className="h-3 w-3 animate-spin text-violet-500" />
                            <span>Recherche...</span>
                          </div>
                        ) : (
                          apiSuggestions.map((city, idx) => (
                            <button
                              key={`${city.name}-${city.department_id}-${idx}`}
                              type="button"
                              className="w-full text-left px-4 py-2.5 hover:bg-slate-900/60 text-xs font-orbitron font-semibold text-slate-250 transition flex items-center justify-between"
                              onClick={() => {
                                setEditCity(city.name);
                                setShowSuggestions(false);
                              }}
                            >
                              <span className="text-slate-200">{city.name}</span>
                              <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded uppercase">
                                Dep {city.department_id}
                              </span>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {language === "fr" ? "Âge" : "Age"}
                  </label>
                  <input
                    type="number"
                    value={editAge}
                    onChange={(e) => setEditAge(e.target.value)}
                    placeholder="e.g. 28"
                    min="1"
                    max="120"
                    className="w-full bg-slate-950 border border-slate-900 rounded-lg py-2.5 px-4 text-sm text-slate-200 placeholder-slate-700 focus:outline-none focus:border-violet-600 transition"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                    {language === "fr" ? "URL de l'Avatar" : "Avatar Image URL"}
                  </label>
                  <div className="relative">
                    <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-slate-650" />
                    <input
                      type="text"
                      value={editAvatar}
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="https://..."
                      className="w-full bg-slate-950 border border-slate-900 rounded-lg py-2.5 pl-10 pr-4 text-sm text-slate-250 placeholder-slate-700 focus:outline-none focus:border-violet-600 transition"
                    />
                  </div>
                </div>
              </div>

              {/* Preset Avatars Selection */}
              <div className="space-y-3">
                <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase">
                  {language === "fr" ? "Choisir un avatar RPG prédéfini" : "Choose an RPG Preset Avatar"}
                </label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {PRESET_AVATARS.map((avatar) => {
                    const isSelected = editAvatar === avatar.url;
                    return (
                      <button
                        key={avatar.name}
                        type="button"
                        className={`relative rounded-xl border p-1 bg-slate-950/60 overflow-hidden group hover:border-violet-500/50 transition duration-300 ${
                          isSelected ? "border-violet-500 ring-2 ring-violet-500/20" : "border-slate-900"
                        }`}
                        onClick={() => setEditAvatar(avatar.url)}
                      >
                        <img
                          src={avatar.url}
                          alt={avatar.name}
                          className="w-full h-12 md:h-14 object-cover rounded-lg group-hover:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-[8px] font-orbitron font-bold text-violet-400 tracking-wider text-center p-0.5 uppercase transition">
                          {avatar.name.split(" ")[0]}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-900/60">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="px-4 border-slate-800 text-slate-400 hover:text-slate-200"
                  onClick={() => setIsEditOpen(false)}
                >
                  {language === "fr" ? "Annuler" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  size="sm"
                  className="px-5 flex items-center gap-1.5"
                  loading={saving}
                >
                  <Save className="h-4 w-4" />
                  <span>{language === "fr" ? "Enregistrer" : "Save Changes"}</span>
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Associate Workout Modal */}
      {showAssociateModal && workoutToAssociate && coachingProgram && dateRangeForModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card
            glowColor="cyan"
            className="w-full max-w-lg bg-[#111128]/95 border-slate-800 shadow-2xl relative overflow-hidden flex flex-col max-h-[80vh]"
          >
            <div className="flex items-center justify-between p-5 border-b border-slate-900">
              <h3 className="font-orbitron font-extrabold text-sm tracking-widest text-slate-100 uppercase flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-cyan-400" />
                <span>
                  {language === "fr" ? "ASSOCIER UNE ACTIVITÉ" : "ASSOCIATE ACTIVITY"}
                </span>
              </h3>
              <button
                onClick={() => {
                  setShowAssociateModal(false);
                  setWorkoutToAssociate(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-slate-250 transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-4">
              <div className="p-4 bg-slate-950/60 rounded-xl border border-slate-900 space-y-2">
                <span className="block text-[10px] font-orbitron font-bold text-violet-400 uppercase tracking-widest">
                  {language === "fr" ? "Séance Programmée :" : "Planned Workout:"}
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-orbitron font-extrabold text-xs text-slate-200">
                    {workoutToAssociate.name}
                  </span>
                  <div className="text-[10px] bg-slate-900 border border-slate-800 font-orbitron font-bold text-slate-400 px-2.5 py-0.5 rounded uppercase">
                    {workoutToAssociate.targetDistance
                      ? `${workoutToAssociate.targetDistance} km`
                      : `${workoutToAssociate.targetDuration} min`}
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 font-semibold font-orbitron uppercase flex items-center gap-2">
                  <span>🎯 {language === "fr" ? "Allure cible :" : "Target pace:"} {workoutToAssociate.targetPace}</span>
                  <span>•</span>
                  <span>💎 +{workoutToAssociate.xpReward} XP</span>
                  <span>•</span>
                  <span>🪙 +{workoutToAssociate.goldReward} Or</span>
                </div>
                <div className="text-[9px] text-cyan-400/80 font-extrabold font-orbitron uppercase pt-1.5 border-t border-slate-900/40">
                  📅 {language === "fr" ? "Séances admissibles du :" : "Eligible sessions from :"}{" "}
                  {dateRangeForModal.start.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" })}{" "}
                  {language === "fr" ? "au" : "to"}{" "}
                  {dateRangeForModal.end.toLocaleDateString(language === "fr" ? "fr-FR" : "en-US", { month: "short", day: "numeric" })}
                </div>
              </div>

              <div className="space-y-2.5">
                <h4 className="text-[10px] font-orbitron font-bold text-slate-400 uppercase tracking-widest">
                  {language === "fr" ? "Sélectionnez votre séance Strava sync :" : "Select your synchronized Strava workout:"}
                </h4>

                {eligibleWorkoutsForModal.length === 0 ? (
                  <div className="text-center p-8 bg-slate-950/20 border border-slate-900/40 rounded-xl space-y-2">
                    <span className="text-2xl block">🚲</span>
                    <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
                      {language === "fr"
                        ? `Aucune séance de type "${coachingProgram.sport}" disponible pour l'association. Synchronisez d'abord vos activités Strava depuis votre tableau de bord.`
                        : `No logged workouts of type "${coachingProgram.sport}" available. Sync your Strava activities from the dashboard first.`}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {eligibleWorkoutsForModal.map((logged) => {
                      const date = new Date(logged.start_date).toLocaleDateString(
                        language === "fr" ? "fr-FR" : "en-US",
                        { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }
                      );

                      return (
                        <div
                          key={logged.id}
                          className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl hover:border-cyan-500/35 transition flex items-center justify-between gap-3"
                        >
                          <div className="space-y-0.5">
                            <span className="block font-orbitron font-extrabold text-[11px] text-slate-200 uppercase tracking-wide">
                              {logged.name}
                            </span>
                            <div className="flex items-center gap-2 text-[9px] text-slate-550 font-semibold font-orbitron">
                              <span>📅 {date}</span>
                              <span>•</span>
                              <span className="text-cyan-400">{logged.distance} km</span>
                              {logged.elevation_gain > 0 && (
                                <>
                                  <span>•</span>
                                  <span className="text-rose-400">+{logged.elevation_gain}m</span>
                                </>
                              )}
                            </div>
                          </div>

                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            className="text-[9px] px-3 font-orbitron font-bold h-7 uppercase"
                            onClick={() => handleAssociateWorkout(workoutToAssociate.id, logged.id)}
                          >
                            {language === "fr" ? "Choisir" : "Choose"}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-950/20 border-t border-slate-900/60 flex items-center justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="px-4 border-slate-800 text-slate-400 hover:text-slate-255"
                onClick={() => {
                  setShowAssociateModal(false);
                  setWorkoutToAssociate(null);
                }}
              >
                {language === "fr" ? "Annuler" : "Cancel"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

