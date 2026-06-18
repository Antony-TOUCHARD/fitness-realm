import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "primary" | "secondary" | "accent" | "danger" | "neutral" | "shadow" | "solar" | "lunar";
  glow?: boolean;
}

export function Badge({
  children,
  variant = "neutral",
  glow = true,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles = "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wider font-orbitron border uppercase transition-all duration-300";
  
  const variants = {
    primary: "bg-primary/10 border-primary/40 text-violet-400",
    secondary: "bg-secondary/10 border-secondary/40 text-cyan-400",
    accent: "bg-accent/10 border-accent/40 text-amber-400",
    danger: "bg-danger/10 border-danger/40 text-pink-400",
    neutral: "bg-slate-800/40 border-slate-700 text-slate-350",
    
    // Factions
    shadow: "bg-violet-950/30 border-violet-500/30 text-violet-400",
    solar: "bg-amber-950/30 border-amber-500/30 text-amber-400",
    lunar: "bg-cyan-950/30 border-cyan-500/30 text-cyan-400",
  };

  const glows = {
    primary: "shadow-[0_0_8px_rgba(139,92,246,0.15)]",
    secondary: "shadow-[0_0_8px_rgba(6,182,212,0.15)]",
    accent: "shadow-[0_0_8px_rgba(245,158,11,0.15)]",
    danger: "shadow-[0_0_8px_rgba(236,72,153,0.15)]",
    neutral: "",
    shadow: "shadow-[0_0_8px_rgba(139,92,246,0.2)]",
    solar: "shadow-[0_0_8px_rgba(245,158,11,0.2)]",
    lunar: "shadow-[0_0_8px_rgba(6,182,212,0.2)]",
  };

  return (
    <span
      className={`${baseStyles} ${variants[variant]} ${glow ? glows[variant] : ""} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
