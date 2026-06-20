"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Swords, Map, Trophy, Coins, Shield, LogOut, ShoppingBag, Flame } from "lucide-react";
import { FactionBadge } from "@/components/game/faction-badge";
import { Profile } from "@/lib/types";
import { isDemoMode, demoProfile } from "@/lib/demo-data";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";

export function Sidebar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);

  const isDemo = isDemoMode();

  useEffect(() => {
    let supabaseChannel: import("@supabase/supabase-js").RealtimeChannel | null = null;

    async function fetchProfile() {
      if (isDemo) {
        let activeProfile = { ...demoProfile };
        const fallbackKey = `fitness-realm-profile-fallback-${demoProfile.id}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            activeProfile = { ...activeProfile, ...fallback };
          } catch {}
        }
        setProfile(activeProfile);
        return;
      }

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
          let activeProfile = data;
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
        .channel("sidebar-profile")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "profiles" },
          (payload) => {
            let activeProfile = payload.new as Profile;
            const fallbackKey = `fitness-realm-profile-fallback-${activeProfile.id}`;
            const fallbackRaw = localStorage.getItem(fallbackKey);
            if (fallbackRaw) {
              try {
                const fallback = JSON.parse(fallbackRaw);
                activeProfile = { ...activeProfile, ...fallback };
              } catch {}
            }
            setProfile(activeProfile);
          }
        )
        .subscribe();
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

  const navItems = [
    { name: t("dashboard"), href: "/dashboard", icon: LayoutDashboard },
    { name: t("profile"), href: "/profile", icon: User },
    { name: t("workouts"), href: "/workouts", icon: Swords },
    { name: t("conquest"), href: "/conquest", icon: Map },
    { name: t("leaderboard"), href: "/leaderboard", icon: Trophy },
    { name: t("shop"), href: "/shop", icon: ShoppingBag },
    { name: t("factionPass"), href: "/faction-pass", icon: Flame },
  ];

  const handleLogout = async () => {
    if (isDemo) {
      window.location.href = "/login";
      return;
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-[#111128]/80 backdrop-blur-md border-r border-slate-800/80 h-screen fixed left-0 top-0 z-30 p-5 justify-between">
      {/* Top Section: Branding & Lang switcher */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <Link href="/dashboard" className="flex items-center gap-2 select-none">
            <Shield className="h-7 w-7 text-violet-500 fill-violet-950/30 filter drop-shadow-[0_0_5px_rgba(139,92,246,0.6)]" />
            <span className="font-orbitron font-extrabold text-[10px] tracking-widest bg-gradient-to-r from-slate-100 to-slate-300 bg-clip-text text-transparent">
              FITNESS REALM
            </span>
          </Link>
          <LanguageToggle />
        </div>

        {/* Navigation items */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-orbitron text-xs font-bold tracking-wider transition-all duration-200 group ${
                  isActive
                    ? "bg-violet-950/30 border border-violet-500/30 text-violet-400 shadow-[0_0_12px_rgba(139,92,246,0.15)]"
                    : "text-slate-400 hover:bg-slate-900/40 hover:text-slate-200 border border-transparent"
                }`}
              >
                <Icon className={`h-4.5 w-4.5 transition-transform duration-250 group-hover:scale-110 ${isActive ? "text-violet-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Hero Status & Action */}
      <div className="space-y-4">
        {profile ? (
          <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl space-y-2.5">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-orbitron text-xs font-bold text-slate-300">
                {profile.username?.substring(0, 2).toUpperCase() || "H"}
              </div>
              <div className="min-w-0">
                <span className="block font-orbitron font-bold text-xs text-slate-200 truncate leading-tight">
                  {profile.username || "Warrior"}
                </span>
                <span className="block text-[10px] text-slate-550 font-semibold leading-none mt-0.5">
                  {t("level")} {profile.level}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-slate-900/60 pt-2 text-xs">
              <div className="flex items-center gap-1 font-orbitron font-bold text-amber-400">
                <Coins className="h-3.5 w-3.5" />
                <span>{profile.gold}</span>
              </div>
              <FactionBadge faction={profile.faction} glow={false} />
            </div>
          </div>
        ) : (
          <div className="p-3 bg-slate-950/40 border border-slate-850/60 rounded-xl h-16 animate-pulse" />
        )}

        <button
          onClick={handleLogout}
          className="flex w-full items-center justify-between px-4 py-2.5 rounded-lg font-orbitron text-xs font-bold tracking-wider text-rose-450 hover:bg-rose-950/10 hover:text-rose-350 border border-transparent hover:border-rose-950/30 transition-all duration-200"
        >
          <span className="flex items-center gap-2.5">
            <LogOut className="h-4 w-4" />
            <span>{t("logout")}</span>
          </span>
        </button>
      </div>
    </aside>
  );
}
