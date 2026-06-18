"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TierBadge } from "@/components/game/tier-badge";
import { FactionBadge } from "@/components/game/faction-badge";
import { LeaderboardEntry, Faction, Tier } from "@/lib/types";
import {
  isDemoMode,
  demoWorkouts,
  simulatedWorkouts,
  simulatedAthletes,
  DEMO_USER_ID,
} from "@/lib/demo-data";
import { Trophy, RefreshCw, Clock, Sparkles } from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";
import { PublicProfileModal } from "@/components/game/public-profile-modal";

// Helper to determine week offset of a workout relative to the 2026-06-18 ref date (or now)
function getWorkoutWeekOffset(startDateStr: string, isDemo: boolean): number {
  const refDate = isDemo ? new Date("2026-06-18T23:59:59Z") : new Date();
  const startDate = new Date(startDateStr);
  const diffTime = refDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays >= 0 && diffDays < 7) return 0;
  if (diffDays >= 7 && diffDays < 14) return 1;
  if (diffDays >= 14 && diffDays < 21) return 2;
  return -1;
}

// Client-side tier assigner matching the backend algorithm
function getTier(rank: number, totalPlayers: number): Tier {
  if (totalPlayers === 0) return "Bronze";
  const percentile = rank / totalPlayers;
  if (percentile <= 0.05) return "Diamond";
  if (percentile <= 0.20) return "Gold";
  if (percentile <= 0.50) return "Silver";
  return "Bronze";
}

export default function LeaderboardPage() {
  const { t, language } = useLanguage();
  const [selectedSport, setSelectedSport] = useState<"Run" | "Ride" | "Walk">("Run");
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);
  const [profile, setProfile] = useState<any>(null);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);
  
  const [dbEntries, setDbEntries] = useState<LeaderboardEntry[]>([]);
  const [timeLeft, setTimeLeft] = useState("");
  const [loading, setLoading] = useState(true);

  const isDemo = isDemoMode();

  // Load user details
  useEffect(() => {
    async function loadUser() {
      if (isDemo) {
        setCurrentUserId(DEMO_USER_ID);
        let activeProfile = { id: DEMO_USER_ID, username: "ShadowBlade", faction: "Shadow Runners" as Faction };
        const fallbackKey = `fitness-realm-profile-fallback-${DEMO_USER_ID}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            activeProfile = { ...activeProfile, ...fallback };
          } catch {}
        }
        setProfile(activeProfile);
        setLoading(false);
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);
          const { data: p } = await supabase.from("profiles").select("*").eq("id", user.id).single();
          if (p) {
            let activeProfile = p;
            const fallbackKey = `fitness-realm-profile-fallback-${p.id}`;
            const fallbackRaw = localStorage.getItem(fallbackKey);
            if (fallbackRaw) {
              try {
                const fallback = JSON.parse(fallbackRaw);
                activeProfile = { ...activeProfile, ...fallback };
              } catch {}
            }
            setProfile(activeProfile);
          }
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }
    loadUser();
  }, [isDemo]);

  // Fetch live leaderboard data when filters change
  useEffect(() => {
    if (isDemo) return;

    const fetchLiveLeaderboard = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/leaderboard?sport=${selectedSport}&week=${selectedWeekOffset}`);
        const data = await response.json();
        if (data.leaderboard) {
          setDbEntries(data.leaderboard);
        }
      } catch (err) {
        console.error("Error loading live leaderboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLiveLeaderboard();
  }, [selectedSport, selectedWeekOffset, isDemo]);

  // Compute leaderboard dynamically for demo mode
  const currentLeaderboard = React.useMemo(() => {
    if (!isDemo) {
      return dbEntries.map((entry) => {
        if (entry.user_id === currentUserId && profile) {
          return {
            ...entry,
            username: profile.username || entry.username,
            avatar_url: profile.avatar_url !== undefined ? profile.avatar_url : entry.avatar_url,
            faction: profile.faction || entry.faction,
          };
        }
        return entry;
      });
    }

    // 1. Gather all workouts matching selected week and sport
    const allWorkouts = [...demoWorkouts, ...simulatedWorkouts];
    const filtered = allWorkouts.filter((w) => {
      const offset = getWorkoutWeekOffset(w.start_date, true);
      if (offset !== selectedWeekOffset) return false;

      if (selectedSport === "Run") {
        return w.activity_type === "Run";
      } else if (selectedSport === "Ride") {
        return w.activity_type === "Ride";
      } else {
        return w.activity_type === "Walk" || w.activity_type === "Hike";
      }
    });

    // 2. Aggregate XP per user
    const xpByUser: Record<string, number> = {};
    filtered.forEach((w) => {
      xpByUser[w.user_id] = (xpByUser[w.user_id] ?? 0) + (w.xp_gained ?? 0);
    });

    // Ensure our user is in the list
    const targetUserId = isDemo ? DEMO_USER_ID : currentUserId;
    if (targetUserId && !xpByUser[targetUserId]) {
      xpByUser[targetUserId] = 0;
    }

    // 3. Sort entries by XP descending
    const sortedEntries = Object.entries(xpByUser)
      .map(([userId, totalXp]) => {
        let username = "Warrior";
        let faction: Faction = "Neutral";

        if (userId === targetUserId) {
          username = profile?.username || "Warrior";
          faction = profile?.faction || "Neutral";
        } else {
          const athlete = simulatedAthletes.find((a) => a.id === userId);
          if (athlete) {
            username = athlete.username;
            faction = athlete.faction;
          }
        }

        return {
          user_id: userId,
          username,
          faction,
          total_xp: totalXp,
        };
      })
      .sort((a, b) => b.total_xp - a.total_xp);

    const total = sortedEntries.length;

    // 4. Assign ranks & tiers
    return sortedEntries.map((entry, index) => {
      const rank = index + 1;
      return {
        ...entry,
        rank,
        tier: getTier(rank, total),
      };
    });
  }, [isDemo, dbEntries, selectedSport, selectedWeekOffset, profile]);

  // Find current user's position
  const currentUserRank = React.useMemo(() => {
    return currentLeaderboard.find((e) => e.user_id === currentUserId) || null;
  }, [currentLeaderboard, currentUserId]);

  // Live countdown timer to Sunday midnight UTC
  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const dayOfWeek = now.getUTCDay(); // 0 = Sunday
      const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek;
      const sunday = new Date(now);
      sunday.setUTCDate(now.getUTCDate() + daysUntilSunday);
      sunday.setUTCHours(0, 0, 0, 0);

      const diff = sunday.getTime() - now.getTime();
      if (diff <= 0) {
        setTimeLeft(language === "fr" ? "Réinitialisation..." : "Resetting...");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      setTimeLeft(
        language === "fr"
          ? `${days}j ${hours}h ${minutes}m ${seconds}s`
          : `${days}d ${hours}h ${minutes}m ${seconds}s`
      );
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [language]);

  if (loading && currentLeaderboard.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="font-orbitron text-xs tracking-widest text-slate-500 uppercase">
          {t("loading")}
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HUD Info Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 glass-card border-slate-900 bg-[#111128]/60 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-xl shrink-0">
            <Clock className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <span className="block font-orbitron text-[9px] font-bold text-slate-500 tracking-widest uppercase">
              {t("weeklyReset")}
            </span>
            <span className="block font-orbitron font-extrabold text-sm text-slate-200 tracking-wide">
              {timeLeft}
            </span>
          </div>
        </div>

        {currentUserRank && (
          <div className="flex items-center gap-4 text-xs font-orbitron">
            <div className="text-right">
              <span className="block text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                {t("currentRank")}
              </span>
              <span className="block font-black text-slate-100">
                {t("rankNum", { rank: currentUserRank.rank })}
              </span>
            </div>
            <TierBadge tier={currentUserRank.tier} />
          </div>
        )}
      </div>

      {/* Filters HUD */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-slate-950/45 border border-slate-900 rounded-xl">
        {/* Sport Selection */}
        <div className="space-y-1.5 w-full md:w-auto">
          <span className="block text-[8px] font-orbitron font-extrabold text-slate-500 uppercase tracking-widest">
            {language === "fr" ? "Discipline Sportive" : "Discipline"}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant={selectedSport === "Run" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Run")}
              className="flex items-center gap-1.5"
            >
              <span>🏃</span>
              <span>{language === "fr" ? "Course" : "Run"}</span>
            </Button>
            <Button
              variant={selectedSport === "Ride" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Ride")}
              className="flex items-center gap-1.5"
            >
              <span>🚴</span>
              <span>{language === "fr" ? "Vélo" : "Ride"}</span>
            </Button>
            <Button
              variant={selectedSport === "Walk" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Walk")}
              className="flex items-center gap-1.5"
            >
              <span>🚶</span>
              <span>{language === "fr" ? "Marche" : "Walk"}</span>
            </Button>
          </div>
        </div>

        {/* Week Selection */}
        <div className="space-y-1.5 w-full md:w-auto">
          <span className="block text-[8px] font-orbitron font-extrabold text-slate-500 uppercase tracking-widest">
            {language === "fr" ? "Période Historique" : "Timeframe"}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant={selectedWeekOffset === 0 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(0)}
            >
              {language === "fr" ? "Cette semaine" : "This Week"}
            </Button>
            <Button
              variant={selectedWeekOffset === 1 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(1)}
            >
              {language === "fr" ? "Semaine dernière" : "Last Week"}
            </Button>
            <Button
              variant={selectedWeekOffset === 2 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(2)}
            >
              {language === "fr" ? "Il y a 2 semaines" : "2 Weeks Ago"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <Card glowColor="none" className="border-slate-900 bg-[#111128]/60 overflow-hidden">
        <CardHeader className="p-5 border-b border-slate-900/60 flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-500" />
            <span>{t("weeklyRankings")}</span>
          </CardTitle>
          {loading && <RefreshCw className="h-4 w-4 text-violet-500 animate-spin" />}
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs md:text-sm">
              <thead>
                <tr className="border-b border-slate-900/60 font-orbitron text-[9px] font-bold text-slate-500 tracking-widest uppercase">
                  <th className="py-4 px-6 text-center w-16">{t("thRank")}</th>
                  <th className="py-4 px-6">{t("thWarrior")}</th>
                  <th className="py-4 px-6 text-center">{t("thFaction")}</th>
                  <th className="py-4 px-6 text-center">{t("thWeeklyXP")}</th>
                  <th className="py-4 px-6 text-right">{t("thLeagueTier")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-950/40">
                {currentLeaderboard.length > 0 ? (
                  currentLeaderboard.map((entry) => {
                    const isSelf = currentUserId === entry.user_id;

                    const rowGlowClass =
                      entry.rank === 1
                        ? "bg-amber-950/5 hover:bg-amber-950/10"
                        : entry.rank === 2
                        ? "bg-slate-900/10 hover:bg-slate-900/20"
                        : entry.rank === 3
                        ? "bg-orange-950/5 hover:bg-orange-950/10"
                        : isSelf
                        ? "bg-violet-950/10 hover:bg-violet-950/15"
                        : "hover:bg-slate-900/10";

                    const rankColorClass =
                      entry.rank === 1
                        ? "text-yellow-400 font-extrabold text-glow-amber"
                        : entry.rank === 2
                        ? "text-slate-300 font-extrabold"
                        : entry.rank === 3
                        ? "text-amber-600 font-extrabold"
                        : "text-slate-450";

                    return (
                      <tr
                        key={entry.user_id}
                        onClick={() => setSelectedAthleteId(entry.user_id)}
                        className={`transition-colors duration-150 cursor-pointer ${rowGlowClass}`}
                      >
                        {/* Rank */}
                        <td className={`py-4 px-6 text-center font-orbitron text-sm ${rankColorClass}`}>
                          {entry.rank === 1 ? (
                            <span className="text-amber-500 font-black">🥇</span>
                          ) : entry.rank === 2 ? (
                            <span className="text-slate-400 font-black">🥈</span>
                          ) : entry.rank === 3 ? (
                            <span className="text-amber-700 font-black">🥉</span>
                          ) : (
                            entry.rank
                          )}
                        </td>

                        {/* Username */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span
                              className={`font-orbitron font-extrabold text-xs tracking-wider ${
                                isSelf ? "text-violet-400" : "text-slate-200"
                              }`}
                            >
                              {entry.username}
                            </span>
                            {isSelf && (
                              <Badge variant="primary" glow={false} className="text-[9px] px-2 py-0.5">
                                {t("youBadge")}
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Faction */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex justify-center">
                            <FactionBadge faction={entry.faction} glow={false} />
                          </div>
                        </td>

                        {/* Weekly XP */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1 font-orbitron font-bold text-violet-400">
                            <Sparkles className="h-3.5 w-3.5" />
                            <span>{entry.total_xp}</span>
                          </div>
                        </td>

                        {/* Tier */}
                        <td className="py-4 px-6 text-right">
                          <TierBadge tier={entry.tier} />
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-500 font-orbitron text-xs">
                      {t("noWarriors")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <PublicProfileModal
        userId={selectedAthleteId}
        isOpen={selectedAthleteId !== null}
        onClose={() => setSelectedAthleteId(null)}
      />
    </div>
  );
}
