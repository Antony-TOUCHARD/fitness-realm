"use client";

import React, { useEffect, useState } from "react";
import { WorkoutCard } from "@/components/game/workout-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Workout } from "@/lib/types";
import { isDemoMode, demoWorkouts } from "@/lib/demo-data";
import { RefreshCw, Compass } from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";
import { WorkoutDetailModal } from "@/components/game/workout-detail-modal";

export default function WorkoutsPage() {
  const { t, language } = useLanguage();
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [filteredWorkouts, setFilteredWorkouts] = useState<Workout[]>([]);
  const [activeFilter, setActiveFilter] = useState<"All" | "Run" | "Ride" | "Walk">("All");
  const [loading, setLoading] = useState(true);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null);

  const isDemo = isDemoMode();

  useEffect(() => {
    async function fetchWorkouts() {
      if (isDemo) {
        setWorkouts(demoWorkouts);
        setFilteredWorkouts(demoWorkouts);
        setLoading(false);
        return;
      }

      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("workouts")
        .select("*")
        .eq("user_id", user.id)
        .order("processed_at", { ascending: false });

      if (data) {
        setWorkouts(data);
        setFilteredWorkouts(data);
      }
      setLoading(false);
    }
    fetchWorkouts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeFilter === "All") {
      setFilteredWorkouts(workouts);
    } else {
      setFilteredWorkouts(workouts.filter((w) => w.activity_type === activeFilter));
    }
  }, [activeFilter, workouts]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <RefreshCw className="h-8 w-8 text-violet-500 animate-spin" />
        <span className="font-orbitron text-xs tracking-widest text-slate-500 uppercase">
          {t("loading")}
        </span>
      </div>
    );
  }

  const filters: ("All" | "Run" | "Ride" | "Walk")[] = ["All", "Run", "Ride", "Walk"];

  const getFilterLabel = (filter: string) => {
    if (filter === "All") return t("allActions");
    if (language === "fr") {
      if (filter === "Run") return "COURSES";
      if (filter === "Ride") return "SORTIES VÉLO";
      if (filter === "Walk") return "MARCHES";
    } else {
      if (filter === "Run") return "RUNS";
      if (filter === "Ride") return "RIDES";
      if (filter === "Walk") return "WALKS";
    }
    return filter.toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Page Header and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs text-slate-500 font-orbitron uppercase tracking-widest">
            {t("chronologyEffort")}
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filters.map((filter) => (
            <Button
              key={filter}
              variant={activeFilter === filter ? "primary" : "ghost"}
              size="sm"
              onClick={() => setActiveFilter(filter)}
            >
              {getFilterLabel(filter)}
            </Button>
          ))}
        </div>
      </div>

      {/* Quest list */}
      <div className="space-y-4">
        {filteredWorkouts.length > 0 ? (
          filteredWorkouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onClick={() => setSelectedWorkout(workout)}
            />
          ))
        ) : (
          <Card className="p-12 text-center border-slate-900 bg-slate-950/10 flex flex-col items-center gap-4">
            <Compass className="h-12 w-12 text-slate-650" />
            <div className="space-y-1">
              <h4 className="font-orbitron font-extrabold text-slate-350 text-base tracking-widest uppercase">
                {t("noCompletedQuests")}
              </h4>
              <p className="text-xs text-slate-550 max-w-xs mx-auto">
                {t("noCompletedQuestsDesc")}
              </p>
            </div>
          </Card>
        )}
      </div>

      <WorkoutDetailModal
        workout={selectedWorkout}
        isOpen={selectedWorkout !== null}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  );
}
