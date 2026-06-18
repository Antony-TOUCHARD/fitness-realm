"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, User, Swords, Map, Trophy } from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";

export function MobileNav() {
  const pathname = usePathname();
  const { t, language } = useLanguage();

  const navItems = [
    { name: language === "fr" ? "Base" : "Dash", href: "/dashboard", icon: LayoutDashboard },
    { name: language === "fr" ? "Profil" : "Codex", href: "/profile", icon: User },
    { name: language === "fr" ? "Quêtes" : "Quests", href: "/workouts", icon: Swords },
    { name: language === "fr" ? "Conquête" : "Conquest", href: "/conquest", icon: Map },
    { name: language === "fr" ? "Ligue" : "League", href: "/leaderboard", icon: Trophy },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#111128]/95 backdrop-blur-lg border-t border-slate-900/80 px-2 py-1.5 shadow-[0_-5px_15px_rgba(0,0,0,0.4)]">
      <div className="flex justify-around items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1.5 px-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? "text-violet-400 bg-violet-950/15"
                  : "text-slate-500 hover:text-slate-350"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isActive ? "text-violet-400 filter drop-shadow-[0_0_3px_rgba(139,92,246,0.6)]" : "text-slate-500"
                }`}
              />
              <span className="font-orbitron text-[9px] font-bold tracking-wider uppercase">
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
