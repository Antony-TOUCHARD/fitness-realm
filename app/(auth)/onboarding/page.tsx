"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Sun, Moon, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/client";
import { Faction } from "@/lib/types";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";

export default function OnboardingPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const supabase = createClient();

  const [userId, setUserId] = useState<string | null>(null);
  const [username, setUsername] = useState("");
  const [selectedFaction, setSelectedFaction] = useState<Faction | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      setUserId(user.id);

      // Check if profile exists and if they are already onboarded
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (profile && profile.faction !== "Neutral") {
        router.push("/dashboard");
      } else if (profile) {
        setUsername(profile.username || "");
      }
      setChecking(false);
    }
    checkUser();
  }, [router, supabase]);

  const factions = [
    {
      name: "Shadow Runners" as Faction,
      displayName: t("shadowRunners"),
      icon: Zap,
      description: t("shadowDesc"),
      color: "violet",
      colorClass: "border-violet-900/40 hover:border-violet-500/80 bg-violet-950/5 hover:bg-violet-950/20 text-violet-400",
      glowColor: "violet" as const,
    },
    {
      name: "Solar Cyclists" as Faction,
      displayName: t("solarCyclists"),
      icon: Sun,
      description: t("solarDesc"),
      color: "amber",
      colorClass: "border-amber-900/40 hover:border-amber-500/80 bg-amber-950/5 hover:bg-amber-950/20 text-amber-400",
      glowColor: "amber" as const,
    },
    {
      name: "Lunar Walkers" as Faction,
      displayName: t("lunarWalkers"),
      icon: Moon,
      description: t("lunarDesc"),
      color: "cyan",
      colorClass: "border-cyan-900/40 hover:border-cyan-500/80 bg-cyan-950/5 hover:bg-cyan-950/20 text-cyan-400",
      glowColor: "cyan" as const,
    },
  ];

  const handleOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    if (!username.trim() || username.length < 3) {
      setError(t("usernameError"));
      return;
    }
    if (!selectedFaction) {
      setError(t("factionError"));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          username,
          faction: selectedFaction,
          level: 1,
          xp: 0,
          gold: 100, // Starting gold
        })
        .eq("id", userId);

      if (updateError) throw updateError;
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-background-dark text-slate-200 flex items-center justify-center">
        <div className="font-orbitron font-extrabold text-sm tracking-widest text-slate-500 animate-pulse">
          {t("loading")}
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-dark text-slate-200 flex items-center justify-center p-6 overflow-y-auto">
      {/* Floating Language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageToggle />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,26,62,0.15),transparent_60%)] pointer-events-none" />

      <Card glowColor="cyan" className="w-full max-w-3xl border-slate-900 bg-[#111128]/80 p-8 shadow-2xl relative z-10 my-8">
        <CardHeader className="flex flex-col items-center gap-2 mb-8 text-center">
          <div className="p-3 bg-slate-950 border border-slate-800 text-cyan-400 rounded-2xl shadow-[0_0_12px_rgba(6,182,212,0.3)] mb-2">
            <Sparkles className="h-8 w-8 filter drop-shadow-[0_0_4px_currentColor]" />
          </div>
          <CardTitle className="text-2xl font-orbitron font-black uppercase tracking-widest text-slate-100">
            {t("onboardingTitle")}
          </CardTitle>
          <p className="text-xs text-slate-500 font-orbitron uppercase tracking-wider">
            {t("onboardingSubtitle")}
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleOnboarding} className="space-y-8">
            {/* Username Selection */}
            <div className="space-y-2 max-w-md mx-auto">
              <label className="block font-orbitron text-xs font-black text-slate-300 tracking-widest uppercase text-center mb-2">
                {t("characterNickname")}
              </label>
              <input
                type="text"
                required
                minLength={3}
                maxLength={20}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder={t("nicknamePlaceholder")}
                className="w-full text-center px-4 py-3 bg-slate-950/80 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 rounded-lg text-slate-200 text-sm font-semibold placeholder-slate-650 transition-all duration-200"
              />
            </div>

            {/* Faction Selection */}
            <div className="space-y-4">
              <label className="block font-orbitron text-xs font-black text-slate-300 tracking-widest uppercase text-center">
                {t("chooseGuild")}
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {factions.map((fac) => {
                  const Icon = fac.icon;
                  const isSelected = selectedFaction === fac.name;
                  return (
                    <div
                      key={fac.name}
                      onClick={() => setSelectedFaction(fac.name)}
                      className={`cursor-pointer rounded-xl p-5 border text-center transition-all duration-300 flex flex-col items-center justify-between ${
                        fac.colorClass
                      } ${
                        isSelected
                          ? `border-${fac.color}-500/80 bg-${fac.color}-950/15 shadow-[0_0_15px_rgba(${
                              fac.color === "violet" ? "139,92,246" : fac.color === "amber" ? "245,158,11" : "6,182,212"
                            },0.25)] ring-1 ring-${fac.color}-500/50 scale-[1.02]`
                          : "opacity-70 hover:opacity-100"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <div className="p-3 bg-slate-950 border border-slate-900 rounded-xl mb-3 shadow-inner">
                          <Icon className="h-6 w-6 filter drop-shadow-[0_0_2px_currentColor]" />
                        </div>
                        <h4 className="font-orbitron font-extrabold tracking-wider text-sm text-slate-100 mb-2 uppercase">
                          {fac.displayName}
                        </h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed">
                          {fac.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs font-semibold text-rose-450 tracking-wide text-center">
                {error}
              </div>
            )}

            {/* Confirm button */}
            <div className="flex justify-center">
              <Button
                type="submit"
                loading={loading}
                variant="secondary"
                size="lg"
                icon={<ArrowRight className="h-4.5 w-4.5" />}
              >
                {t("createCharacter")}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
