"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, UserPlus, LogIn, Gamepad2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { isDemoMode } from "@/lib/demo-data";
import { useLanguage } from "@/components/layout/language-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const isDemo = isDemoMode();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (isDemo) {
      router.push("/dashboard");
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();

      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (!profile) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();

          if (!profile) {
            router.push("/onboarding");
          } else {
            router.push("/dashboard");
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoEntry = () => {
    setDemoLoading(true);
    router.push("/dashboard");
  };

  return (
    <div className="relative min-h-screen bg-background-dark text-slate-200 flex items-center justify-center p-6 overflow-hidden">
      {/* Language Switcher Float */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageToggle />
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(26,26,62,0.15),transparent_60%)] pointer-events-none" />

      <Card glowColor="violet" className="w-full max-w-md border-violet-950/40 bg-[#111128]/80 p-8 shadow-2xl relative z-10">
        <CardHeader className="flex flex-col items-center justify-center gap-2 mb-6">
          <div className="p-3 bg-slate-950 border border-slate-800 text-violet-400 rounded-2xl shadow-[0_0_12px_rgba(139,92,246,0.3)] mb-2">
            <Shield className="h-8 w-8 filter drop-shadow-[0_0_4px_currentColor]" />
          </div>
          <CardTitle className="text-xl font-orbitron font-black text-center tracking-widest uppercase">
            {isSignUp ? t("loginTitleSignUp") : t("loginTitleSignIn")}
          </CardTitle>
          <p className="text-xs text-slate-500 font-orbitron uppercase tracking-wider text-center">
            {isSignUp ? t("loginSubtitleSignUp") : t("loginSubtitleSignIn")}
          </p>
        </CardHeader>

        <CardContent>
          {/* DEMO MODE - Big prominent entry button */}
          {isDemo && (
            <div className="mb-6 space-y-4">
              <Button
                onClick={handleDemoEntry}
                loading={demoLoading}
                variant="accent"
                size="lg"
                className="w-full py-4 text-base"
                icon={<Gamepad2 className="h-5 w-5" />}
              >
                {t("enterDemo")}
              </Button>
              <div className="text-center">
                <p className="text-[10px] text-slate-550 font-orbitron uppercase tracking-wider">
                  {t("demoHint")}
                </p>
              </div>
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-3 bg-[#111128] text-slate-500 font-orbitron text-[9px] uppercase tracking-wider">
                    {t("orSignInWith")}
                  </span>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleAuth} className="space-y-4">
            {/* Email field */}
            <div className="space-y-1.5">
              <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {t("emailLabel")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  type="email"
                  required={!isDemo}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hero@example.com"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg text-slate-200 text-sm placeholder-slate-650 transition-all duration-200"
                />
              </div>
            </div>

            {/* Password field */}
            <div className="space-y-1.5">
              <label className="block font-orbitron text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                {t("passwordLabel")}
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  type="password"
                  required={!isDemo}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 rounded-lg text-slate-200 text-sm placeholder-slate-650 transition-all duration-200"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg text-xs font-semibold text-rose-450 tracking-wide">
                {error}
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              variant={isSignUp ? "secondary" : "primary"}
              className="w-full py-3 mt-2"
              icon={isSignUp ? <UserPlus className="h-4.5 w-4.5" /> : <LogIn className="h-4.5 w-4.5" />}
            >
              {isSignUp ? t("registerHero") : t("enterRealmBtn")}
            </Button>
          </form>

          {/* Toggle auth mode */}
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-450">
              {isSignUp ? t("alreadyRegistered") : t("newToRealm")}{" "}
            </span>
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
              }}
              className="font-orbitron font-bold tracking-wider text-violet-400 hover:text-violet-350 transition-colors uppercase ml-1"
            >
              {isSignUp ? t("loginHere") : t("signUpHere")}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
