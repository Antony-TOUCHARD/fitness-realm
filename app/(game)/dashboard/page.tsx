"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { XPBar } from "@/components/game/xp-bar";
import { StatCard } from "@/components/game/stat-card";
import { WorkoutCard } from "@/components/game/workout-card";
import { FactionBadge } from "@/components/game/faction-badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Profile, Workout, Territory, CoachingProgram, PlannedWorkout } from "@/lib/types";
import { isDemoMode, demoProfile, demoWorkouts, demoTerritories } from "@/lib/demo-data";
import { RefreshCw, Swords, Shield, Trophy, Map, Compass, Flame, Coins, Activity } from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";

export default function Dashboard() {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [coachingProgram, setCoachingProgram] = useState<CoachingProgram | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [bonusExpires, setBonusExpires] = useState<number | null>(null);
  const [remainingBonusTime, setRemainingBonusTime] = useState<string>("");

  const isDemo = isDemoMode();

  const getWorkoutWeekOffset = React.useCallback((startDateStr: string) => {
    const refDate = isDemo ? new Date("2026-06-18T23:59:59Z") : new Date();
    const startDate = new Date(startDateStr);
    const diffTime = refDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) return 0;
    if (diffDays >= 7 && diffDays < 14) return 1;
    if (diffDays >= 14 && diffDays < 21) return 2;
    if (diffDays >= 21 && diffDays < 28) return 3;
    return -1;
  }, [isDemo]);

  const weeklyQuests = React.useMemo(() => {
    // 1. Calculate distances per week and sport
    const runByWeek = [0, 0, 0, 0]; // index 0=current, 1=last week, 2=2 weeks ago, 3=3 weeks ago
    const rideByWeek = [0, 0, 0, 0];
    const walkByWeek = [0, 0, 0, 0];

    workouts.forEach((w) => {
      const offset = getWorkoutWeekOffset(w.start_date);
      if (offset >= 0 && offset < 4) {
        const dist = Number(w.distance);
        if (w.activity_type === "Run") {
          runByWeek[offset] += dist;
        } else if (w.activity_type === "Ride") {
          rideByWeek[offset] += dist;
        } else if (w.activity_type === "Walk" || w.activity_type === "Hike") {
          walkByWeek[offset] += dist;
        }
      }
    });

    // 2. Average of previous 3 weeks
    const prevRunAvg = (runByWeek[1] + runByWeek[2] + runByWeek[3]) / 3;
    const prevRideAvg = (rideByWeek[1] + rideByWeek[2] + rideByWeek[3]) / 3;
    const prevWalkAvg = (walkByWeek[1] + walkByWeek[2] + walkByWeek[3]) / 3;

    // 3. Set adaptive targets (avg + 10% or baseline)
    const runTarget = Math.max(10, Math.round(prevRunAvg * 1.1 * 10) / 10);
    const rideTarget = Math.max(30, Math.round(prevRideAvg * 1.1 * 10) / 10);
    const walkTarget = Math.max(5, Math.round(prevWalkAvg * 1.1 * 10) / 10);

    return [
      {
        id: "quest-run",
        icon: "🏃",
        title: language === "fr" ? "Maître de la Course" : "Run Master Quest",
        desc: language === "fr" 
          ? `Courir ${runTarget} km cette semaine pour conquérir les territoires.`
          : `Run ${runTarget} km this week to conquer territories.`,
        current: Math.round(runByWeek[0] * 10) / 10,
        target: runTarget,
        unit: "KM",
        xpReward: 150,
        goldReward: 50,
        completed: runByWeek[0] >= runTarget,
      },
      {
        id: "quest-ride",
        icon: "🚴",
        title: language === "fr" ? "Vanguard du Vélo" : "Ride Vanguard Quest",
        desc: language === "fr"
          ? `Pédaler ${rideTarget} km cette semaine pour étendre l'influence.`
          : `Ride ${rideTarget} km this week to extend influence.`,
        current: Math.round(rideByWeek[0] * 10) / 10,
        target: rideTarget,
        unit: "KM",
        xpReward: 250,
        goldReward: 100,
        completed: rideByWeek[0] >= rideTarget,
      },
      {
        id: "quest-walk",
        icon: "🚶",
        title: language === "fr" ? "Nomade de la Marche" : "Walk Nomad Quest",
        desc: language === "fr"
          ? `Marcher ou randonner ${walkTarget} km cette semaine.`
          : `Walk or hike ${walkTarget} km this week.`,
        current: Math.round(walkByWeek[0] * 10) / 10,
        target: walkTarget,
        unit: "KM",
        xpReward: 120,
        goldReward: 40,
        completed: walkByWeek[0] >= walkTarget,
      },
    ];
  }, [workouts, language, getWorkoutWeekOffset]);

  const nextWorkout = React.useMemo(() => {
    if (!coachingProgram) return null;
    const currentWeek = coachingProgram.weeks[coachingProgram.currentWeekIndex];
    if (!currentWeek) return null;
    return currentWeek.workouts.find((w) => !w.completed) || null;
  }, [coachingProgram]);

  const fetchData = async () => {
    let activeProfile: Profile | null = null;
    
    if (isDemo) {
      activeProfile = { ...demoProfile };
      const fallbackKey = `fitness-realm-profile-fallback-${demoProfile.id}`;
      const fallbackRaw = localStorage.getItem(fallbackKey);
      if (fallbackRaw) {
        try {
          const fallback = JSON.parse(fallbackRaw);
          activeProfile = { ...activeProfile, ...fallback };
        } catch {}
      }
      setProfile(activeProfile);
      setWorkouts(demoWorkouts);
      setTerritories(demoTerritories);
    } else {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // 1. Fetch Profile
          const { data: profileData } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (profileData) {
            activeProfile = profileData;
            const fallbackKey = `fitness-realm-profile-fallback-${profileData.id}`;
            const fallbackRaw = localStorage.getItem(fallbackKey);
            if (fallbackRaw) {
              try {
                const fallback = JSON.parse(fallbackRaw);
                activeProfile = { ...activeProfile, ...fallback };
              } catch {}
            }
            setProfile(activeProfile);
          }

          // 2. Fetch Workouts (last 50 for calculations)
          const { data: workoutsData } = await supabase
            .from("workouts")
            .select("*")
            .eq("user_id", user.id)
            .order("start_date", { ascending: false })
            .limit(50);
          if (workoutsData) setWorkouts(workoutsData);

          // 3. Fetch Territories controlled
          const { data: territoriesData } = await supabase
            .from("territories")
            .select("*");
          if (territoriesData) setTerritories(territoriesData);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      }
    }

    if (activeProfile) {
      // Load coaching program from LocalStorage
      const programKey = `fitness-realm-coaching-program-${activeProfile.id}`;
      const programRaw = localStorage.getItem(programKey);
      if (programRaw) {
        try {
          const parsed = JSON.parse(programRaw);
          if (parsed && Array.isArray(parsed.weeks)) {
            setCoachingProgram(parsed);
          } else {
            setCoachingProgram(null);
          }
        } catch {
          setCoachingProgram(null);
        }
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
    }
    setLoading(false);
  };

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
        const secsVal = Math.floor((diff % (1000 * 60)) / 1000);
        setRemainingBonusTime(`${hrs}h ${mins}m ${secsVal}s`);
      }
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [bonusExpires]);

  useEffect(() => {
    fetchData();

    const handleProfileUpdate = () => {
      fetchData();
    };

    window.addEventListener("fitness-realm-profile-updated", handleProfileUpdate);
    return () => {
      window.removeEventListener("fitness-realm-profile-updated", handleProfileUpdate);
    };
  }, []);

  const handleSync = async () => {
    if (isDemo) {
      setSyncing(true);
      setSyncResult(null);
      await new Promise((r) => setTimeout(r, 1500));
      setSyncResult(
        language === "fr"
          ? "Synchronisation démo réussie : 3 activités traitées !"
          : "Demo Sync complete: 3 activities processed!"
      );
      setSyncing(false);
      return;
    }

    setSyncing(true);
    setSyncResult(null);
    try {
      const response = await fetch("/api/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hasCoachingBonus: !!bonusExpires }),
      });
      const result = await response.json();
      if (response.ok) {
        setSyncResult(t("syncSuccess", { synced: result.synced }));
        fetchData(); // reload
      } else {
        setSyncResult(result.error || t("syncFailed"));
      }
    } catch (err: any) {
      setSyncResult(t("networkError"));
    } finally {
      setSyncing(false);
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

  // Calculate global summary stats
  const totalDistance = workouts.reduce((sum, w) => sum + Number(w.distance), 0);
  const totalElevation = workouts.reduce((sum, w) => sum + Number(w.elevation_gain), 0);

  // Faction territory count
  const factionControlledCount = territories.filter(
    (t) => t.controlling_faction === profile?.faction
  ).length;

  return (
    <div className="space-y-6">
      {/* Demo Mode Banner */}
      {isDemo && (
        <div className="p-3 bg-amber-950/20 border border-amber-900/40 rounded-lg text-xs font-semibold text-amber-400 tracking-wide flex items-center gap-2">
          <Flame className="h-4 w-4 animate-pulse" />
          <span>{t("demoBanner")}</span>
        </div>
      )}

      {/* Coaching Streak Bonus Banner */}
      {bonusExpires && (
        <div className="p-3 bg-orange-950/25 border border-orange-500/30 rounded-lg text-xs font-semibold text-orange-400 tracking-wide flex items-center justify-between gap-4 animate-pulse shadow-[0_0_15px_rgba(245,158,11,0.2)]">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500 fill-orange-500/20 animate-pulse" />
            <span>
              {language === "fr"
                ? "BOOST D'ASSIDUITÉ ACTIF : +50% XP et pièces d'Or sur vos prochaines activités !"
                : "ASSIDUITY BOOST ACTIVE: +50% XP and Gold on your next workouts!"}
            </span>
          </div>
          <span className="font-orbitron font-bold text-orange-400 bg-orange-950/50 px-2.5 py-0.5 rounded border border-orange-500/30 shrink-0">
            {remainingBonusTime}
          </span>
        </div>
      )}

      {/* HUD Player Overview Card */}
      {profile && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 glass-card border-slate-900 bg-[#111128]/60 rounded-xl relative overflow-hidden">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-orbitron text-xl font-black text-slate-300 shadow-inner shrink-0 relative">
              {profile.username?.substring(0, 2).toUpperCase() || "W"}
              <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-violet-600 border border-slate-900 flex items-center justify-center text-[9px] font-black text-slate-100 font-orbitron">
                {profile.level}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h2 className="font-orbitron font-extrabold text-lg text-slate-100 uppercase tracking-wider">
                  {profile.username || "Warrior"}
                </h2>
                <FactionBadge faction={profile.faction} />
              </div>
              <p className="text-xs text-slate-450 font-medium">
                {t("welcomeBack")}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              loading={syncing}
              onClick={handleSync}
              icon={<RefreshCw className="h-3.5 w-3.5" />}
            >
              {t("syncStrava")}
            </Button>
            
            {/* Show Strava disconnect / connection info */}
            {!profile.strava_athlete_id && (
              <Link href="/profile">
                <Button variant="accent" size="sm">
                  {t("connectStrava")}
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {syncResult && (
        <div className="p-3 bg-violet-950/20 border border-violet-900/40 rounded-lg text-xs font-semibold text-violet-400 tracking-wide">
          {syncResult}
        </div>
      )}

      {/* Main Stats Grid */}
      {profile && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            label={t("totalXP")}
            value={profile.xp}
            type="xp"
            description={t("xpDesc")}
          />
          <StatCard
            label={t("goldBalance")}
            value={`${profile.gold} g`}
            type="gold"
            description={t("goldDesc")}
          />
          <StatCard
            label={t("factionTerritories")}
            value={`${factionControlledCount} / ${territories.length}`}
            type="distance"
            description={t("factionTerritoriesDesc")}
          />
          <StatCard
            label={t("heroLevel")}
            value={`Lvl ${profile.level}`}
            type="elevation"
            description={t("levelDesc", { req: profile.level * 1000 })}
          />
        </div>
      )}

      {/* XP Level Bar */}
      {profile && (
        <XPBar
          level={profile.level}
          currentXP={profile.xp}
          xpRequired={profile.level * 1000}
        />
      )}

      {/* Adventures & Rewards Widgets */}
      {profile && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Faction Pass Widget */}
          <Card glowColor="violet" className="p-5 bg-[#111128]/50 border-slate-900 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400">
                    <Flame className="h-5 w-5 animate-pulse text-violet-500" />
                  </div>
                  <div>
                    <h4 className="font-orbitron font-extrabold text-xs text-slate-100 uppercase tracking-wider">
                      Pass de Faction Saisonnier
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                      Saison 1 — Niveau {Math.min(10, Math.floor(workouts.reduce((sum, w) => sum + Number(w.xp_gained || w.distance * 100), 0) / 1500) + 1)}
                    </span>
                  </div>
                </div>
                {localStorage.getItem(`fitness-realm-pass-premium-${profile.id}`) === "true" && (
                  <Badge variant="accent" className="text-[9px] py-0.5 px-2">PREMIUM</Badge>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] font-orbitron font-bold text-slate-450 uppercase">
                  <span>Progression Pass</span>
                  <span>
                    {workouts.reduce((sum, w) => sum + Number(w.xp_gained || w.distance * 100), 0) % 1500} / 1500 XP
                  </span>
                </div>
                <div className="h-2 w-full bg-slate-950/80 border border-slate-850 rounded-full overflow-hidden p-0.5">
                  <div
                    style={{ width: `${Math.min(100, Math.round(((workouts.reduce((sum, w) => sum + Number(w.xp_gained || w.distance * 100), 0) % 1500) / 1500) * 100))}%` }}
                    className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500 rounded-full"
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900/40 flex justify-end">
              <Link href="/faction-pass">
                <Button variant="outline" size="sm" className="text-[10px] py-1.5 font-orbitron">
                  Consulter le Pass
                </Button>
              </Link>
            </div>
          </Card>

          {/* Shop Widget */}
          <Card glowColor="amber" className="p-5 bg-[#111128]/50 border-slate-900 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-lg bg-amber-950/40 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Coins className="h-5 w-5 animate-pulse text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-orbitron font-extrabold text-xs text-slate-100 uppercase tracking-wider">
                      Boutique de Cosmétiques
                    </h4>
                    <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider block mt-0.5">
                      Titres, Bordures, Avatars RPG
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs font-orbitron font-bold text-amber-400">
                  <span>{profile.gold}</span>
                  <span className="text-[9px] text-slate-500 font-semibold">Or</span>
                </div>
              </div>
              
              <p className="text-[11px] text-slate-455 leading-relaxed">
                Personnalisez votre apparence dans les classements de votre commune, département et au niveau national !
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-900/40 flex justify-end">
              <Link href="/shop">
                <Button variant="outline" size="sm" className="text-[10px] py-1.5 font-orbitron">
                  Visiter la Boutique
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      )}

      {/* Active Coaching Program / Next Workout Card */}
      {coachingProgram && (
        <Card glowColor={nextWorkout ? "violet" : "cyan"} className="p-5 border-slate-900 bg-[#111128]/70">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xl">{coachingProgram.sport === "Run" ? "🏃" : coachingProgram.sport === "Ride" ? "🚴" : "🚶"}</span>
                <div>
                  <span className="block text-[10px] font-orbitron font-bold text-violet-400 uppercase tracking-widest">
                    {language === "fr" ? "Quête d'Entraînement Adaptive active" : "Active Adaptive Training Quest"}
                  </span>
                  <h4 className="font-orbitron font-extrabold text-sm text-slate-100 uppercase tracking-wider">
                    {language === "fr" ? `Semaine ${coachingProgram.currentWeekIndex + 1} : ${coachingProgram.name}` : `Week ${coachingProgram.currentWeekIndex + 1}: ${coachingProgram.name}`}
                  </h4>
                </div>
              </div>

              {nextWorkout ? (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-orbitron font-bold text-xs text-slate-200">
                      {nextWorkout.name}
                    </span>
                    <Badge variant="secondary" className="scale-90">{nextWorkout.type}</Badge>
                    {nextWorkout.targetDistance && (
                      <span className="text-[10px] bg-slate-950 border border-slate-900 font-orbitron font-bold text-slate-350 px-2 py-0.5 rounded">
                        {nextWorkout.targetDistance} km
                      </span>
                    )}
                    {nextWorkout.targetDuration && (
                      <span className="text-[10px] bg-slate-950 border border-slate-900 font-orbitron font-bold text-slate-350 px-2 py-0.5 rounded">
                        {nextWorkout.targetDuration} min
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 italic max-w-xl">{nextWorkout.description}</p>
                  
                  {/* Segment Details */}
                  <div className="bg-slate-950/50 rounded-lg p-3 border border-slate-900/60 max-w-xl space-y-1.5">
                    {nextWorkout.structure.map((seg: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300 font-medium">
                        <span className="text-violet-500 font-bold select-none">•</span>
                        <span>{seg}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-1 pt-2">
                  <span className="block text-xs font-bold text-emerald-400">
                    {language === "fr" 
                      ? "✓ Toutes les séances de la semaine sont complétées !" 
                      : "✓ All workouts for this week are completed!"}
                  </span>
                  <p className="text-xs text-slate-450">
                    {language === "fr"
                      ? "Rendez-vous dans l'onglet Coaching de votre profil pour clôturer cette semaine et générer vos prochaines quêtes d'entraînement."
                      : "Head over to the Coaching section in your Profile to close this week and generate your next training quests."}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-stretch md:items-end gap-3 shrink-0 justify-center min-w-[150px]">
              {nextWorkout ? (
                <>
                  <div className="text-[10px] font-orbitron font-bold text-slate-500 text-left md:text-right uppercase tracking-wider space-y-0.5">
                    <span className="block">🎁 {language === "fr" ? "Récompenses :" : "Rewards:"}</span>
                    <span className="block text-violet-400">+{nextWorkout.xpReward} XP</span>
                    <span className="block text-amber-500">+{nextWorkout.goldReward} Or</span>
                  </div>
                  <Link href="/profile">
                    <Button variant="primary" size="sm" className="w-full font-orbitron uppercase text-[10px]">
                      {language === "fr" ? "Associer sur mon Profil" : "Associate on Profile"}
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/profile">
                  <Button variant="accent" size="sm" className="w-full font-orbitron uppercase text-[10px] shadow-[0_0_10px_rgba(245,158,11,0.2)]">
                    {language === "fr" ? "Clôturer la Semaine" : "Close Week"}
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Recent Quests & Conquest Preview Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Workouts (Completed Quests) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-widest uppercase flex items-center gap-2">
              <Swords className="h-4.5 w-4.5 text-violet-500" />
              <span>{t("recentQuests")}</span>
            </h3>
            <Link href="/workouts" className="text-xs font-orbitron font-bold text-violet-400 hover:text-violet-350 transition-colors uppercase">
              {t("viewJournal")}
            </Link>
          </div>

          <div className="space-y-3">
            {workouts.slice(0, 3).length > 0 ? (
              workouts.slice(0, 3).map((workout) => (
                <WorkoutCard key={workout.id} workout={workout} />
              ))
            ) : (
              <Card className="p-8 text-center border-slate-900 bg-slate-950/10 flex flex-col items-center gap-4">
                <Compass className="h-10 w-10 text-slate-650" />
                <div className="space-y-1">
                  <h4 className="font-orbitron font-bold text-slate-350 text-sm tracking-wide">
                    {t("noQuests")}
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {t("noQuestsDesc")}
                  </p>
                </div>
                {!profile?.strava_athlete_id && (
                  <Link href="/profile">
                    <Button variant="outline" size="sm">
                      {t("setupStrava")}
                    </Button>
                  </Link>
                )}
              </Card>
            )}
          </div>
        </div>

        {/* Right Column: Territory conquests summary */}
        <div className="space-y-6">
          {/* Weekly Quests (Objectifs Adaptatifs) */}
          <div className="space-y-4">
            <h3 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-widest uppercase flex items-center gap-2">
              <Compass className="h-4.5 w-4.5 text-amber-500" />
              <span>{language === "fr" ? "Objectifs Hebdomadaires" : "Weekly Quests"}</span>
            </h3>
            <Card glowColor="amber" className="border-slate-900 bg-[#111128]/60 p-5 space-y-4">
              <div className="space-y-5">
                {weeklyQuests.map((quest) => {
                  const percent = Math.min(100, Math.round((quest.current / quest.target) * 100));
                  return (
                    <div key={quest.id} className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <span className="font-orbitron font-bold text-xs text-slate-200 flex items-center gap-1.5">
                            <span>{quest.icon}</span>
                            <span className={quest.completed ? "line-through text-slate-500" : ""}>{quest.title}</span>
                          </span>
                          <span className="block text-[10px] text-slate-450 leading-normal">
                            {quest.desc}
                          </span>
                        </div>
                        {quest.completed ? (
                          <Badge variant="neutral" className="text-[8px] bg-emerald-950/20 border-emerald-900/30 text-emerald-450 shrink-0 font-extrabold">
                            {language === "fr" ? "RÉUSSI" : "DONE"}
                          </Badge>
                        ) : (
                          <span className="text-[10px] font-orbitron font-black text-slate-400 shrink-0 mt-0.5">
                            {quest.current} / {quest.target} {quest.unit}
                          </span>
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="w-full h-1.5 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                          <div
                            className={`h-full rounded transition-all duration-500 ${
                              quest.completed
                                ? "bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
                                : "bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            }`}
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[9px] font-bold font-orbitron text-slate-500">
                          <span>{percent}%</span>
                          <span className="text-amber-500/80">+{quest.xpReward} XP • +{quest.goldReward} Or</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>

          <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-orbitron font-extrabold text-sm text-slate-100 tracking-widest uppercase flex items-center gap-2">
              <Map className="h-4.5 w-4.5 text-cyan-500" />
              <span>{t("influenceMap")}</span>
            </h3>
            <Link href="/conquest" className="text-xs font-orbitron font-bold text-cyan-400 hover:text-cyan-350 transition-colors uppercase">
              {t("conquest")}
            </Link>
          </div>

          <Card className="border-slate-900 bg-slate-950/15 p-5 space-y-4">
            <div className="text-center pb-3 border-b border-slate-900/60">
              <span className="block font-orbitron text-[9px] font-bold text-slate-400 tracking-widest uppercase mb-1">
                {t("influenceMap")}
              </span>
              <div className="flex justify-center items-end gap-1 font-orbitron font-black text-slate-100">
                <span className="text-2xl">{factionControlledCount}</span>
                <span className="text-xs text-slate-400 pb-0.5">/ {t("regionsHeld", { held: factionControlledCount, total: territories.length }).split(" ")[2] || "Regions"}</span>
              </div>
            </div>

            {/* List top 4 regions */}
            <div className="space-y-3.5">
              {territories.slice(0, 4).map((territory) => {
                const displayName = territory.name;

                return (
                  <div key={territory.id} className="flex items-center justify-between text-xs">
                    <div className="space-y-0.5">
                      <span className="block font-orbitron font-bold text-slate-200">
                        {displayName}
                      </span>
                      <span className="block text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                        {t("totalIP", { ip: territory.total_influence_points })}
                      </span>
                    </div>
                    <Badge variant={
                      territory.controlling_faction === "Shadow Runners" ? "shadow" :
                      territory.controlling_faction === "Solar Cyclists" ? "solar" :
                      territory.controlling_faction === "Lunar Walkers" ? "lunar" : "neutral"
                    } glow={false} className="text-[9px]">
                      {territory.controlling_faction === "Shadow Runners" ? t("shadowRunners") :
                       territory.controlling_faction === "Solar Cyclists" ? t("solarCyclists") :
                       territory.controlling_faction === "Lunar Walkers" ? t("lunarWalkers") : t("neutral")}
                    </Badge>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </div>
    </div>
    </div>
  );
}
