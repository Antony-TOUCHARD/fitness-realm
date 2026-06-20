"use client";

import React, { useEffect, useState } from "react";

interface ProgressBarProps {
  value: number;
  max: number;
  color?: "violet" | "cyan" | "amber" | "rose";
  showLabel?: boolean;
  label?: string;
  animate?: boolean;
}

export function ProgressBar({
  value,
  max,
  color = "violet",
  showLabel = false,
  label,
  animate = true,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    if (animate) {
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 100);
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setWidth(percentage);
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [percentage, animate]);

  const colors = {
    violet: "bg-gradient-to-r from-violet-600 to-purple-500 shadow-[0_0_10px_rgba(139,92,246,0.5)]",
    cyan: "bg-gradient-to-r from-cyan-500 to-teal-400 shadow-[0_0_10px_rgba(6,182,212,0.5)]",
    amber: "bg-gradient-to-r from-amber-500 to-orange-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]",
    rose: "bg-gradient-to-r from-rose-500 to-pink-400 shadow-[0_0_10px_rgba(236,72,153,0.5)]",
  };

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-1.5 text-xs font-semibold font-orbitron tracking-wider">
          <span className="text-slate-300">{label}</span>
          <span className="text-slate-400">
            {value} / {max} ({Math.round(percentage)}%)
          </span>
        </div>
      )}
      <div className="h-3.5 w-full bg-slate-950/80 border border-slate-800 rounded-full overflow-hidden p-0.5">
        <div
          style={{ width: `${width}%` }}
          className={`h-full rounded-full transition-all duration-1000 ease-out shimmer-effect ${colors[color]}`}
        />
      </div>
    </div>
  );
}
