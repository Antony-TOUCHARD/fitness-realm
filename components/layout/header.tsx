"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Coins, Shield, Flame } from "lucide-react";
import { Profile } from "@/lib/types";
import { isDemoMode, demoProfile } from "@/lib/demo-data";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";

export function Header() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [bonusExpires, setBonusExpires] = useState<number | null>(null);

  const isDemo = isDemoMode();

  useEffect(() => {
    let supabaseChannel: any = null;

    async function fetchProfile() {
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
      } else {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (data) {
            activeProfile = data;
            const fallbackKey = `fitness-realm-profile-fallback-${data.id}`;
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

        supabaseChannel = supabase
          .channel("header-profile")
          .on(
            "postgres_changes",
            { event: "UPDATE", schema: "public", table: "profiles" },
            (payload) => {
              let updatedProfile = payload.new as Profile;
              const fallbackKey = `fitness-realm-profile-fallback-${updatedProfile.id}`;
              const fallbackRaw = localStorage.getItem(fallbackKey);
              if (fallbackRaw) {
                try {
                  const fallback = JSON.parse(fallbackRaw);
                  updatedProfile = { ...updatedProfile, ...fallback };
                } catch {}
              }
              setProfile(updatedProfile);

              const bonusKey = `fitness-realm-coaching-bonus-expires-${updatedProfile.id}`;
              const bonusRaw = localStorage.getItem(bonusKey);
              if (bonusRaw) {
                const exp = Number(bonusRaw);
                setBonusExpires(exp > Date.now() ? exp : null);
              }
            }
          )
          .subscribe();
      }

      if (activeProfile) {
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
    }

    fetchProfile();

    const handleProfileUpdate = () => {
      fetchProfile();
    };

    window.addEventListener("fitness-realm-profile-updated", handleProfileUpdate);

    return () => {
      window.removeEventListener("fitness-realm-profile-updated", handleProfileUpdate);
      if (supabaseChannel) {
        supabaseChannel.unsubscribe();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getTitle = () => {
    if (pathname === "/dashboard") return t("dashboard");
    if (pathname === "/profile") return t("profile");
    if (pathname === "/workouts") return t("workouts");
    if (pathname === "/conquest") return t("conquest");
    if (pathname === "/leaderboard") return t("leaderboard");
    return t("title");
  };

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-[#0a0a1a]/40 backdrop-blur-md border-b border-slate-900/60 sticky top-0 z-20 h-16 w-full md:pl-[18rem]">
      {/* Page Title */}
      <h1 className="font-orbitron font-black text-sm tracking-widest text-slate-100 uppercase select-none md:text-base">
        {getTitle()}
      </h1>

      {/* Mini Player HUD & Lang Switcher */}
      <div className="flex items-center gap-3 md:gap-4">
        {/* Language Toggle */}
        <LanguageToggle />

        {bonusExpires && (
          <div className="flex items-center gap-1.5 text-xs text-orange-400 bg-orange-950/20 border border-orange-500/30 px-2.5 py-1.5 rounded-lg font-orbitron font-bold animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.2)] select-none cursor-help" title="Bonus d'assiduité actif: +50% XP et Or !">
            <Flame className="h-3.5 w-3.5 text-orange-500 fill-orange-500/20" />
            <span className="hidden sm:inline">XP/GOLD +50%</span>
          </div>
        )}

        {profile && (
          <div className="flex items-center gap-3">
            {/* Gold display */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950/40 border border-slate-850/60 text-xs font-orbitron font-bold text-amber-400">
              <Coins className="h-3.5 w-3.5" />
              <span>{profile.gold}</span>
            </div>

            {/* Level Shield & Mini XP progress */}
            <div className="flex items-center gap-2">
              <div className="relative flex items-center justify-center h-8 w-8 shrink-0">
                <Shield className="h-8 w-8 text-violet-500 fill-violet-950/20" />
                <span className="absolute font-orbitron text-[10px] font-black text-slate-200">
                  {profile.level}
                </span>
              </div>
              {/* Mini XP bar container (hidden on small screens) */}
              <div className="hidden sm:flex flex-col w-24">
                <div className="h-2 w-full bg-slate-950/80 border border-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${Math.min(
                        Math.max((profile.xp / (profile.level * 1000)) * 100, 0),
                        100
                      )}%`,
                    }}
                    className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full shadow-[0_0_5px_rgba(139,92,246,0.3)]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
