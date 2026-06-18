import React from "react";
import { Card } from "@/components/ui/card";
import { Sparkles, Coins, Milestone, TrendingUp } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  type: "xp" | "gold" | "distance" | "elevation";
  description?: string;
}

export function StatCard({
  label,
  value,
  type,
  description,
}: StatCardProps) {
  const configs = {
    xp: {
      icon: Sparkles,
      colorClass: "text-violet-400",
      glowColor: "violet" as const,
      borderClass: "border-violet-950/40",
      bgClass: "from-violet-950/10 to-transparent",
    },
    gold: {
      icon: Coins,
      colorClass: "text-amber-400",
      glowColor: "amber" as const,
      borderClass: "border-amber-950/40",
      bgClass: "from-amber-950/10 to-transparent",
    },
    distance: {
      icon: Milestone,
      colorClass: "text-cyan-400",
      glowColor: "cyan" as const,
      borderClass: "border-cyan-950/40",
      bgClass: "from-cyan-950/10 to-transparent",
    },
    elevation: {
      icon: TrendingUp,
      colorClass: "text-rose-400",
      glowColor: "rose" as const,
      borderClass: "border-rose-950/40",
      bgClass: "from-rose-950/10 to-transparent",
    },
  };

  const config = configs[type];
  const Icon = config.icon;

  return (
    <Card
      glowColor={config.glowColor}
      className={`relative overflow-hidden bg-gradient-to-br ${config.bgClass} ${config.borderClass} border p-4 flex items-center justify-between`}
    >
      <div className="flex-1 min-w-0">
        <span className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-widest uppercase mb-1">
          {label}
        </span>
        <span className="block font-orbitron text-2xl font-black text-slate-100 tracking-wide">
          {value}
        </span>
        {description && (
          <span className="block text-xs text-slate-400 mt-1">
            {description}
          </span>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-slate-950/60 border border-slate-800 ${config.colorClass}`}>
        <Icon className="h-6 w-6 filter drop-shadow-[0_0_4px_currentColor]" />
      </div>
    </Card>
  );
}
