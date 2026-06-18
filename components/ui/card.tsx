import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  glowColor?: "violet" | "cyan" | "amber" | "rose" | "none";
  hoverEffect?: boolean;
}

export function Card({
  children,
  glowColor = "none",
  hoverEffect = true,
  className = "",
  ...props
}: CardProps) {
  const glowClasses = {
    violet: "glass-card-violet shadow-[0_0_15px_rgba(139,92,246,0.1)]",
    cyan: "glass-card-cyan shadow-[0_0_15px_rgba(6,182,212,0.1)]",
    amber: "glass-card-amber shadow-[0_0_15px_rgba(245,158,11,0.1)]",
    rose: "glass-card-rose shadow-[0_0_15px_rgba(236,72,153,0.1)]",
    none: "border-slate-800 shadow-xl",
  };

  return (
    <div
      className={`glass-card rounded-xl p-5 transition-all duration-300 ${glowClasses[glowColor]} ${
        hoverEffect ? "hover:-translate-y-1 hover:border-opacity-40" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`mb-4 flex items-center justify-between ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={`text-lg font-semibold tracking-wider font-orbitron text-slate-100 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({
  children,
  className = "",
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`text-slate-350 text-sm leading-relaxed ${className}`} {...props}>
      {children}
    </div>
  );
}
