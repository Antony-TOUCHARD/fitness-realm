"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Shield, Zap, Sun, Moon, Swords, Trophy, Map, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { isDemoMode, demoWorkouts, demoTerritories } from "@/lib/demo-data";

export default function LandingPage() {
  const { t, language } = useLanguage();
  const [stats, setStats] = useState({
    activeHeroes: 10482,
    xpEarned: 2400000,
    kmTraveled: 41920,
    territoriesHeld: 512,
  });

  useEffect(() => {
    let supabaseClient: any = null;
    let profilesChannel: any = null;
    let workoutsChannel: any = null;
    let territoriesChannel: any = null;

    async function fetchAndSetStats(supabase: any) {
      try {
        const { data, error } = await supabase.rpc("get_global_stats");
        if (error) throw error;

        if (data && data[0]) {
          const row = data[0];
          setStats({
            activeHeroes: Number(row.active_heroes || 0),
            xpEarned: Number(row.xp_earned || 0),
            kmTraveled: Math.round(Number(row.km_traveled || 0) * 10) / 10,
            territoriesHeld: Number(row.territories_held || 0),
          });
        }
      } catch (err) {
        console.error("Error fetching stats update:", err);
      }
    }

    async function loadStats() {
      const isDemo = isDemoMode();
      if (isDemo) {
        // In demo mode, show aggregated demo data
        const demoTotalDist = demoWorkouts.reduce((sum, w) => sum + Number(w.distance), 0);
        const demoTotalXP = demoWorkouts.reduce((sum, w) => sum + Number(w.xp_gained), 0);
        const demoTerrsCount = demoTerritories.filter(t => t.controlling_faction !== "Neutral").length;
        
        setStats({
          activeHeroes: 5,
          xpEarned: demoTotalXP,
          kmTraveled: Math.round(demoTotalDist * 10) / 10,
          territoriesHeld: demoTerrsCount,
        });
        return;
      }

      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        supabaseClient = supabase;

        // Fetch initial values
        await fetchAndSetStats(supabase);

        // Subscribe to real-time changes on profiles (active heroes count)
        profilesChannel = supabase
          .channel("realtime-profiles")
          .on("postgres_changes", { event: "*", schema: "public", table: "profiles" }, () => {
            fetchAndSetStats(supabase);
          })
          .subscribe();

        // Subscribe to real-time changes on workouts (XP and distance sums)
        workoutsChannel = supabase
          .channel("realtime-workouts")
          .on("postgres_changes", { event: "*", schema: "public", table: "workouts" }, () => {
            fetchAndSetStats(supabase);
          })
          .subscribe();

        // Subscribe to real-time changes on territories (territories held count)
        territoriesChannel = supabase
          .channel("realtime-territories")
          .on("postgres_changes", { event: "*", schema: "public", table: "territories" }, () => {
            fetchAndSetStats(supabase);
          })
          .subscribe();

      } catch (err) {
        console.error("Error loading landing page stats:", err);
      }
    }
    loadStats();

    return () => {
      if (supabaseClient) {
        if (profilesChannel) supabaseClient.removeChannel(profilesChannel);
        if (workoutsChannel) supabaseClient.removeChannel(workoutsChannel);
        if (territoriesChannel) supabaseClient.removeChannel(territoriesChannel);
      }
    };
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat(language === "fr" ? "fr-FR" : "en-US").format(num);
  };

  const formatXP = (xp: number) => {
    if (xp >= 1000000) {
      return `${(xp / 1000000).toFixed(1)}M`;
    }
    if (xp >= 1000) {
      return `${(xp / 1000).toFixed(1)}k`;
    }
    return xp.toString();
  };

  const factions = [
    {
      name: t("shadowRunners"),
      icon: Zap,
      description: t("shadowDesc"),
      color: "violet" as const,
      colorClass: "text-violet-400 border-violet-950/40 bg-violet-950/5",
      iconClass: "text-violet-400",
    },
    {
      name: t("solarCyclists"),
      icon: Sun,
      description: t("solarDesc"),
      color: "amber" as const,
      colorClass: "text-amber-400 border-amber-950/40 bg-amber-950/5",
      iconClass: "text-amber-400",
    },
    {
      name: t("lunarWalkers"),
      icon: Moon,
      description: t("lunarDesc"),
      color: "cyan" as const,
      colorClass: "text-cyan-400 border-cyan-950/40 bg-cyan-950/5",
      iconClass: "text-cyan-400",
    },
  ];

  const highlights = [
    {
      icon: Swords,
      title: t("rpgConversion"),
      text: t("rpgConversionDesc"),
    },
    {
      icon: Map,
      title: t("territoryControl"),
      text: t("territoryControlDesc"),
    },
    {
      icon: Trophy,
      title: t("weeklyLeagues"),
      text: t("weeklyLeaguesDesc"),
    },
  ];

  return (
    <div className="relative min-h-screen bg-background-dark text-slate-200 flex flex-col justify-between overflow-hidden">
      {/* Decorative Grid Overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,26,62,0.15),transparent_60%)] pointer-events-none" />

      {/* Navigation Header */}
      <header className="w-full max-w-7xl mx-auto px-6 py-5 flex items-center justify-between z-10">
        <div className="flex items-center gap-2 select-none">
          <Shield className="h-8 w-8 text-violet-500 fill-violet-950/30 filter drop-shadow-[0_0_5px_rgba(139,92,246,0.6)]" />
          <span className="font-orbitron font-extrabold text-sm tracking-widest bg-gradient-to-r from-slate-100 to-slate-350 bg-clip-text text-transparent">
            {t("title")}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <LanguageToggle />
          <Link href="/login">
            <Button variant="outline" size="sm">
              {t("enterRealm")}
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center justify-center text-center gap-12 z-10">
        <div className="space-y-6 max-w-3xl">
          <Badge variant="primary" className="px-3.5 py-1 text-[10px] tracking-widest select-none">
            Gamified Strava Integration
          </Badge>
          
          <h1 className="font-orbitron font-black text-4xl sm:text-6xl md:text-7xl tracking-wider leading-none text-slate-100 uppercase select-none">
            THE FITNESS <br />
            <span className="bg-gradient-to-r from-violet-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent filter drop-shadow-[0_0_20px_rgba(139,92,246,0.35)]">
              REALM
            </span>
          </h1>

          <p className="max-w-xl mx-auto text-sm sm:text-base md:text-lg text-slate-400 font-medium leading-relaxed">
            {t("landingSubtitle")} {t("landingDesc")}
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" variant="primary" icon={<ArrowRight className="h-4 w-4" />}>
                {t("beginQuest")}
              </Button>
            </Link>
            <Link href="#factions">
              <Button size="lg" variant="ghost">
                {t("exploreFactions")}
              </Button>
            </Link>
          </div>
        </div>

        {/* Global Statistics Counters */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 w-full max-w-4xl pt-8 border-y border-slate-900/60 py-8 px-4 bg-slate-950/10 backdrop-blur-sm rounded-2xl">
          <div>
            <span className="block font-orbitron font-black text-2xl sm:text-3xl text-slate-100 tracking-wider">
              {stats.activeHeroes}
            </span>
            <span className="block text-[10px] font-orbitron font-bold text-slate-500 tracking-wider uppercase mt-1">
              {t("activeHeroes")}
            </span>
          </div>
          <div>
            <span className="block font-orbitron font-black text-2xl sm:text-3xl text-violet-400 tracking-wider filter drop-shadow-[0_0_4px_rgba(139,92,246,0.2)]">
              {formatXP(stats.xpEarned)}
            </span>
            <span className="block text-[10px] font-orbitron font-bold text-slate-500 tracking-wider uppercase mt-1">
              {t("xpEarned")}
            </span>
          </div>
          <div>
            <span className="block font-orbitron font-black text-2xl sm:text-3xl text-cyan-400 tracking-wider filter drop-shadow-[0_0_4px_rgba(6,182,212,0.2)]">
              {formatNumber(stats.kmTraveled)}
            </span>
            <span className="block text-[10px] font-orbitron font-bold text-slate-500 tracking-wider uppercase mt-1">
              {t("kmTraveled")}
            </span>
          </div>
          <div>
            <span className="block font-orbitron font-black text-2xl sm:text-3xl text-amber-400 tracking-wider filter drop-shadow-[0_0_4px_rgba(245,158,11,0.2)]">
              {stats.territoriesHeld}
            </span>
            <span className="block text-[10px] font-orbitron font-bold text-slate-500 tracking-wider uppercase mt-1">
              {t("territoriesHeld")}
            </span>
          </div>
        </div>

        {/* Core Game Mechanics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl pt-10">
          {highlights.map((item, index) => {
            const Icon = item.icon;
            return (
              <Card key={index} glowColor="none" className="flex flex-col items-center p-6 text-center border-slate-900 bg-slate-950/15">
                <div className="p-3 bg-slate-950 border border-slate-800 text-violet-400 rounded-xl mb-4 shadow-[0_0_10px_rgba(139,92,246,0.1)]">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="font-orbitron font-bold text-slate-200 mb-2 tracking-wider">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
                  {item.text}
                </p>
              </Card>
            );
          })}
        </div>

        {/* Faction Previews */}
        <div id="factions" className="w-full max-w-5xl py-12 scroll-mt-6">
          <div className="text-center mb-10 space-y-2">
            <h2 className="font-orbitron font-extrabold text-2xl tracking-wider uppercase text-slate-100">
              {t("chooseAlignment")}
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              {t("factionDesc")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {factions.map((faction, index) => {
              const Icon = faction.icon;
              return (
                <Card
                  key={index}
                  glowColor={faction.color}
                  className={`flex flex-col items-center p-6 text-center border ${faction.colorClass} border-opacity-30`}
                >
                  <div className={`p-4 bg-slate-950 border border-slate-850 rounded-2xl mb-4 ${faction.iconClass} shadow-[0_0_12px_currentColor]/10`}>
                    <Icon className="h-8 w-8 filter drop-shadow-[0_0_4px_currentColor]" />
                  </div>
                  <h3 className="font-orbitron font-black text-slate-100 text-base tracking-widest mb-3 uppercase">
                    {faction.name}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {faction.description}
                  </p>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-950 py-6 text-center z-10 bg-[#070714]">
        <p className="font-orbitron text-[9px] font-bold tracking-widest text-slate-650 uppercase">
          {t("footerRights")}
        </p>
      </footer>
    </div>
  );
}
