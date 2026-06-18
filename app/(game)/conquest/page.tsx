"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FactionBadge } from "@/components/game/faction-badge";
import { Button } from "@/components/ui/button";
import { Territory, Faction, Department, City, Workout } from "@/lib/types";
import {
  isDemoMode,
  demoTerritories,
  demoUserInfluence,
  demoWorkouts,
  demoDepartments,
  demoCities,
  simulatedWorkouts,
  simulatedAthletes,
  DEMO_USER_ID,
} from "@/lib/demo-data";
import {
  Map,
  Shield,
  RefreshCw,
  Milestone,
  Users,
  Compass,
  Award,
  Building,
  Landmark,
  Zap,
  ChevronRight,
  Trophy,
  MapPin,
  Sparkles,
  TrendingUp,
  Activity,
  ArrowLeft,
  X,
  HelpCircle
} from "lucide-react";
import { useLanguage } from "@/components/layout/language-provider";
import { PublicProfileModal } from "@/components/game/public-profile-modal";

export default function ConquestPage() {
  const { t, language } = useLanguage();
  const [territories, setTerritories] = useState<Territory[]>([]);
  const [userInfluence, setUserInfluence] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  // Filters state
  const [selectedSport, setSelectedSport] = useState<"Run" | "Ride" | "Walk">("Run");
  const [selectedWeekOffset, setSelectedWeekOffset] = useState<number>(0);
  const [rankingSport, setRankingSport] = useState<"Run" | "Ride" | "Walk">("Run");
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);
  const [selectedAthleteId, setSelectedAthleteId] = useState<string | null>(null);

  // Sync rankingSport with selectedSport by default
  useEffect(() => {
    setRankingSport(selectedSport);
  }, [selectedSport]);

  // Drill-down geographical databases
  const [departments, setDepartments] = useState<Department[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Selection states for list drill-down
  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [selectedCityId, setSelectedCityId] = useState<string | null>(null);

  // Faction mapping details
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [profile, setProfile] = useState<any>(null);
  const [userFactionMap, setUserFactionMap] = useState<Record<string, Faction>>({});
  const [userNamesMap, setUserNamesMap] = useState<Record<string, string>>({});
  const [factionCounts, setFactionCounts] = useState<Record<Faction, number>>({
    Neutral: 1,
    "Shadow Runners": 12,
    "Solar Cyclists": 4,
    "Lunar Walkers": 8,
  });
  const [weeklyWorkouts, setWeeklyWorkouts] = useState<Workout[]>([]);

  const isDemo = isDemoMode();

  // Helper to determine week offset of a workout relative to the 2026-06-18 ref date (or now)
  const getWorkoutWeekOffset = (startDateStr: string, isDemoModeFlag: boolean) => {
    const refDate = isDemoModeFlag ? new Date("2026-06-18T23:59:59Z") : new Date();
    const startDate = new Date(startDateStr);
    const diffTime = refDate.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays >= 0 && diffDays < 7) return 0;
    if (diffDays >= 7 && diffDays < 14) return 1;
    if (diffDays >= 14 && diffDays < 21) return 2;
    return -1;
  };

  useEffect(() => {
    async function loadConquestData() {
      let activeUserId = "";
      let activeProfile = null;
      let activeTerritories: Territory[] = [];
      let activeInfluence: Record<string, number> = {};
      let activeDepts: Department[] = [];
      let activeCities: City[] = [];
      let activeWorkouts: Workout[] = [];
      
      const counts: Record<Faction, number> = {
        Neutral: 1,
        "Shadow Runners": 12,
        "Solar Cyclists": 4,
        "Lunar Walkers": 8,
      };
      const map: Record<string, Faction> = {};
      const names: Record<string, string> = {};

      if (isDemo) {
        activeUserId = DEMO_USER_ID;
        activeProfile = { id: DEMO_USER_ID, username: "ShadowBlade", faction: "Shadow Runners" as Faction };
        activeTerritories = [...demoTerritories];
        activeInfluence = { ...demoUserInfluence };
        activeDepts = [...demoDepartments];
        activeCities = [...demoCities];
        activeWorkouts = [
          ...demoWorkouts,
          ...simulatedWorkouts,
        ];

        simulatedAthletes.forEach((a) => {
          counts[a.faction] = (counts[a.faction] || 0) + 1;
          map[a.id] = a.faction;
          names[a.id] = a.username;
        });
        map[DEMO_USER_ID] = "Shadow Runners";
        names[DEMO_USER_ID] = "ShadowBlade";

      } else {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            activeUserId = user.id;
            
            // Get user profile
            const { data: profileData } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", user.id)
              .single();
            
            if (profileData) {
              activeProfile = profileData;
            }

            // Get territories
            const { data: territoriesData } = await supabase
              .from("territories")
              .select("*")
              .order("name", { ascending: true });
            if (territoriesData) activeTerritories = territoriesData;

            // Get influence
            const { data: influenceData } = await supabase
              .from("territory_influence")
              .select("territory_id, influence_points")
              .eq("user_id", user.id);
            if (influenceData) {
              influenceData.forEach((row: any) => {
                activeInfluence[row.territory_id] = Number(row.influence_points);
              });
            }

            // Load extra tables
            try {
              const { data: dbDepts } = await supabase.from("departments").select("*");
              if (dbDepts && dbDepts.length > 0) {
                activeDepts = dbDepts;
              } else {
                activeDepts = demoDepartments;
              }
            } catch (e) {
              activeDepts = demoDepartments;
            }

            try {
              const { data: dbCities } = await supabase.from("cities").select("*");
              if (dbCities && dbCities.length > 0) {
                activeCities = dbCities;
              } else {
                activeCities = demoCities;
              }
            } catch (e) {
              activeCities = demoCities;
            }

            // Load workouts (last 21 days for 3 weeks history)
            const twentyOneDaysAgo = new Date();
            twentyOneDaysAgo.setDate(twentyOneDaysAgo.getDate() - 21);
            
            const { data: dbWorkouts } = await supabase
              .from("workouts")
              .select("user_id, distance, territory_id, start_date, xp_gained, city_id, activity_type")
              .gte("start_date", twentyOneDaysAgo.toISOString());

            const workoutsList = (dbWorkouts || []).map((w: any) => ({
              ...w,
              activity_type: w.activity_type || ("Run" as const),
              id: w.id || Math.random().toString(),
              processed_at: w.processed_at || new Date().toISOString(),
              anti_cheat_status: "Verified" as const,
              gold_gained: Math.round(w.distance * 10),
            }));

            activeWorkouts = [...workoutsList, ...simulatedWorkouts];

            // Get profiles mapping
            const { data: profilesData } = await supabase.from("profiles").select("id, username, faction");
            if (profilesData) {
              profilesData.forEach((p) => {
                const f = (p.faction || "Neutral") as Faction;
                counts[f] = (counts[f] || 0) + 1;
                map[p.id] = f;
                names[p.id] = p.username || "Warrior";
              });
            }
          }
        } catch (err) {
          console.error("Error fetching live conquest data:", err);
          // Fallback to demo data on database connection issues
          activeUserId = DEMO_USER_ID;
          activeProfile = { id: DEMO_USER_ID, username: "ShadowBlade", faction: "Shadow Runners" as Faction };
          activeTerritories = [...demoTerritories];
          activeInfluence = { ...demoUserInfluence };
          activeDepts = [...demoDepartments];
          activeCities = [...demoCities];
          activeWorkouts = [...demoWorkouts, ...simulatedWorkouts];
        }
      }

      // Merge local storage overrides for profile
      if (activeProfile) {
        const fallbackKey = `fitness-realm-profile-fallback-${activeProfile.id}`;
        const fallbackRaw = localStorage.getItem(fallbackKey);
        if (fallbackRaw) {
          try {
            const fallback = JSON.parse(fallbackRaw);
            activeProfile = { ...activeProfile, ...fallback };
          } catch {}
        }
        // Override local profile in maps
        map[activeUserId] = activeProfile.faction || "Neutral";
        names[activeUserId] = activeProfile.username || "Vous";
      }

      // Mix in simulated athletes to the counts
      simulatedAthletes.forEach((a) => {
        counts[a.faction] = (counts[a.faction] || 0) + 1;
        map[a.id] = a.faction;
        names[a.id] = a.username;
      });

      setProfile(activeProfile);
      setCurrentUserId(activeUserId);
      setTerritories(activeTerritories);
      setUserInfluence(activeInfluence);
      setDepartments(activeDepts);
      setCities(activeCities);
      setWeeklyWorkouts(activeWorkouts);
      setFactionCounts(counts);
      setUserFactionMap(map);
      setUserNamesMap(names);
      setLoading(false);
    }

    loadConquestData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- Dynamic Influence Calculator per Scale ---
  const getDynamicControl = (
    workoutsList: Workout[],
    fallbackFaction: Faction,
    fallbackPoints: number
  ) => {
    if (workoutsList.length === 0) {
      return { faction: fallbackFaction, points: fallbackPoints };
    }

    const factionDist: Record<Faction, number> = {
      Neutral: 0,
      "Shadow Runners": 0,
      "Solar Cyclists": 0,
      "Lunar Walkers": 0,
    };

    workoutsList.forEach((w) => {
      const f = userFactionMap[w.user_id] || "Neutral";
      factionDist[f] += Number(w.distance);
    });

    let dominant: Faction = "Neutral";
    let maxDist = 0;
    Object.entries(factionDist).forEach(([fac, d]) => {
      if (fac !== "Neutral" && d > maxDist) {
        maxDist = d;
        dominant = fac as Faction;
      }
    });

    if (dominant === "Neutral") {
      return { faction: fallbackFaction, points: fallbackPoints };
    }

    const members = factionCounts[dominant] || 1;
    const balancedPoints = factionDist[dominant] / members;

    return {
      faction: dominant,
      points: Math.round(balancedPoints * 10) / 10 + 10,
    };
  };

  // --- Geographic Drill-down Computations ---

  // Filtered workouts based on selectedSport and selectedWeekOffset
  const currentWorkouts = React.useMemo(() => {
    return weeklyWorkouts.filter((w) => {
      // 1. Week Filter
      const offset = getWorkoutWeekOffset(w.start_date, isDemo);
      if (offset !== selectedWeekOffset) return false;

      // 2. Sport Filter
      if (selectedSport === "Run") {
        return w.activity_type === "Run";
      } else if (selectedSport === "Ride") {
        return w.activity_type === "Ride";
      } else {
        return w.activity_type === "Walk" || w.activity_type === "Hike";
      }
    });
  }, [weeklyWorkouts, selectedWeekOffset, selectedSport, isDemo]);

  // --- Geographic Drill-down Computations ---

  // Calculated Regions (Level 1)
  const calculatedRegions = React.useMemo(() => {
    return territories
      .map((t) => {
        const regionWorkouts = currentWorkouts.filter((w) => w.territory_id === t.id);
        const control = getDynamicControl(regionWorkouts, t.controlling_faction, t.total_influence_points);
        return {
          ...t,
          controlling_faction: control.faction,
          total_influence_points: control.points,
        };
      })
      .sort((a, b) => b.total_influence_points - a.total_influence_points);
  }, [territories, currentWorkouts, userFactionMap, factionCounts]);

  // Calculated Departments (Level 2)
  const calculatedDepartments = React.useMemo(() => {
    return departments
      .map((d) => {
        const deptWorkouts = currentWorkouts.filter((w) => {
          if (w.city_id) {
            const cityObj = cities.find((c) => c.id === w.city_id);
            return cityObj?.department_id === d.id;
          }
          return false;
        });

        const control = getDynamicControl(deptWorkouts, d.controlling_faction, d.total_influence_points);
        return {
          ...d,
          controlling_faction: control.faction,
          total_influence_points: control.points,
        };
      })
      .sort((a, b) => b.total_influence_points - a.total_influence_points);
  }, [departments, currentWorkouts, cities, userFactionMap, factionCounts]);

  // Calculated Cities (Level 3)
  const calculatedCities = React.useMemo(() => {
    return cities
      .map((c) => {
        const cityWorkouts = currentWorkouts.filter((w) => w.city_id === c.id);
        const control = getDynamicControl(cityWorkouts, c.controlling_faction, c.total_influence_points);
        return {
          ...c,
          controlling_faction: control.faction,
          total_influence_points: control.points,
        };
      })
      .sort((a, b) => b.total_influence_points - a.total_influence_points);
  }, [cities, currentWorkouts, userFactionMap, factionCounts]);

  // Display Filters
  const displayedDepartments = React.useMemo(() => {
    if (!selectedRegionId) return [];
    return calculatedDepartments.filter((d) => d.region_id === selectedRegionId);
  }, [calculatedDepartments, selectedRegionId]);

  const displayedCities = React.useMemo(() => {
    if (!selectedDepartmentId) return [];
    return calculatedCities.filter((c) => c.department_id === selectedDepartmentId);
  }, [calculatedCities, selectedDepartmentId]);

  // Selected Entities
  const selectedRegion = calculatedRegions.find((r) => r.id === selectedRegionId);
  const selectedDept = calculatedDepartments.find((d) => d.id === selectedDepartmentId);
  const selectedCity = calculatedCities.find((c) => c.id === selectedCityId);

  // --- Dynamic Faction Breakdown at Selected Level ---
  const currentFactionBreakdown = React.useMemo(() => {
    const workouts = currentWorkouts.filter((w) => {
      if (selectedCityId) return w.city_id === selectedCityId;
      if (selectedDepartmentId) {
        const cObj = cities.find((c) => c.id === w.city_id);
        return cObj?.department_id === selectedDepartmentId;
      }
      if (selectedRegionId) return w.territory_id === selectedRegionId;
      return true;
    });

    const dist: Record<Faction, number> = {
      Neutral: 0,
      "Shadow Runners": 0,
      "Solar Cyclists": 0,
      "Lunar Walkers": 0,
    };

    workouts.forEach((w) => {
      const f = userFactionMap[w.user_id] || "Neutral";
      dist[f] += Number(w.distance);
    });

    const total = Object.values(dist).reduce((sum, d) => sum + d, 0);

    return {
      total: Math.round(total * 10) / 10,
      percentages: {
        Neutral: total > 0 ? Math.round((dist.Neutral / total) * 100) : 0,
        "Shadow Runners": total > 0 ? Math.round((dist["Shadow Runners"] / total) * 100) : 0,
        "Solar Cyclists": total > 0 ? Math.round((dist["Solar Cyclists"] / total) * 100) : 0,
        "Lunar Walkers": total > 0 ? Math.round((dist["Lunar Walkers"] / total) * 100) : 0,
      },
    };
  }, [currentWorkouts, selectedRegionId, selectedDepartmentId, selectedCityId, cities, userFactionMap]);

  // --- Dynamic Leaderboard at Selected Level ---
  const currentLeaderboard = React.useMemo(() => {
    const workouts = weeklyWorkouts.filter((w) => {
      // 1. Week Filter
      const offset = getWorkoutWeekOffset(w.start_date, isDemo);
      if (offset !== selectedWeekOffset) return false;

      // 2. Sport Filter (rankingSport)
      if (rankingSport === "Run") {
        if (w.activity_type !== "Run") return false;
      } else if (rankingSport === "Ride") {
        if (w.activity_type !== "Ride") return false;
      } else {
        if (w.activity_type !== "Walk" && w.activity_type !== "Hike") return false;
      }

      // 3. Geographical Filter
      if (selectedCityId) return w.city_id === selectedCityId;
      if (selectedDepartmentId) {
        const cObj = cities.find((c) => c.id === w.city_id);
        return cObj?.department_id === selectedDepartmentId;
      }
      if (selectedRegionId) return w.territory_id === selectedRegionId;
      return true;
    });

    const userAgg: Record<string, { username: string; faction: Faction; distance: number; xp: number }> = {};

    workouts.forEach((w) => {
      const uId = w.user_id;
      if (!userAgg[uId]) {
        let name = "Warrior";
        let fac: Faction = "Neutral";
        
        if (uId === currentUserId) {
          name = profile?.username || "Vous";
          fac = profile?.faction || "Neutral";
        } else {
          const sim = simulatedAthletes.find((a) => a.id === uId);
          if (sim) {
            name = sim.username;
            fac = sim.faction;
          } else {
            name = userNamesMap[uId] || "Warrior";
            fac = userFactionMap[uId] || "Neutral";
          }
        }

        userAgg[uId] = {
          username: name,
          faction: fac,
          distance: 0,
          xp: 0,
        };
      }

      userAgg[uId].distance += Number(w.distance);
      userAgg[uId].xp += Number(w.xp_gained || w.distance * 100);
    });

    return Object.entries(userAgg)
      .map(([userId, data]) => ({
        userId,
        ...data,
        distance: Math.round(data.distance * 10) / 10,
      }))
      .sort((a, b) => b.distance - a.distance)
      .map((entry, idx) => ({
        rank: idx + 1,
        ...entry,
      }));
  }, [weeklyWorkouts, rankingSport, selectedWeekOffset, selectedRegionId, selectedDepartmentId, selectedCityId, cities, currentUserId, profile, userNamesMap, userFactionMap, isDemo]);

  // --- Personal Workouts in current level ---
  const userWorkoutsInZone = React.useMemo(() => {
    return currentWorkouts.filter((w) => {
      if (w.user_id !== currentUserId) return false;
      if (selectedCityId) return w.city_id === selectedCityId;
      if (selectedDepartmentId) {
        const cObj = cities.find((c) => c.id === w.city_id);
        return cObj?.department_id === selectedDepartmentId;
      }
      if (selectedRegionId) return w.territory_id === selectedRegionId;
      return true;
    });
  }, [currentWorkouts, selectedRegionId, selectedDepartmentId, selectedCityId, cities, currentUserId]);

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

  // Back button helper
  const navigateBack = () => {
    if (selectedCityId) {
      setSelectedCityId(null);
    } else if (selectedDepartmentId) {
      setSelectedDepartmentId(null);
    } else if (selectedRegionId) {
      setSelectedRegionId(null);
    }
  };

  const currentLevelName = selectedCity
    ? selectedCity.name
    : selectedDept
    ? `${selectedDept.name} (${selectedDept.id})`
    : selectedRegion
    ? selectedRegion.name
    : language === "fr" ? "Toute la France" : "National (France)";

  // Check if player's faction has control of the selected city
  const isCityControlledByPlayerFaction = selectedCity && profile && selectedCity.controlling_faction === profile.faction;

  return (
    <div className="space-y-6">
      {/* Title & Navigation Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-5">
        <div>
          <h2 className="font-orbitron font-extrabold text-2xl text-slate-100 uppercase tracking-widest flex items-center gap-2">
            <Compass className="h-6 w-6 text-violet-500" />
            <span>{language === "fr" ? "Console de Conquête RPG" : "RPG Conquest Console"}</span>
          </h2>
          <p className="text-xs text-slate-455 mt-1 leading-relaxed max-w-2xl">
            {language === "fr"
              ? "Naviguez à travers l'échelle géographique nationale, régionale et communale. Dominez les classements de course à pied et capturez des villes pour accumuler de l'XP passive."
              : "Explore the national, regional, and municipal conquest scales. Lead the running leaderboards and capture cities to generate passive XP."}
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHelpModal(true)}
            className="flex items-center gap-1.5 border-slate-800 text-slate-350 hover:text-white"
          >
            <HelpCircle className="h-4 w-4 text-violet-400" />
            <span>{language === "fr" ? "Règles" : "Rules"}</span>
          </Button>

          {/* Breadcrumb Indicators */}
          <div className="flex items-center gap-1.5 text-[10px] font-orbitron font-bold uppercase tracking-wider text-slate-500">
            <span
              className={`cursor-pointer hover:text-slate-300 transition ${!selectedRegionId ? "text-violet-400" : ""}`}
              onClick={() => {
                setSelectedRegionId(null);
                setSelectedDepartmentId(null);
                setSelectedCityId(null);
              }}
            >
              FRANCE
            </span>
            {selectedRegionId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-700" />
                <span
                  className={`cursor-pointer hover:text-slate-300 transition ${
                    selectedRegionId && !selectedDepartmentId ? "text-violet-400" : ""
                  }`}
                  onClick={() => {
                    setSelectedDepartmentId(null);
                    setSelectedCityId(null);
                  }}
                >
                  {selectedRegionId}
                </span>
              </>
            )}
            {selectedDepartmentId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-700" />
                <span
                  className={`cursor-pointer hover:text-slate-300 transition ${
                    selectedDepartmentId && !selectedCityId ? "text-violet-400" : ""
                  }`}
                  onClick={() => {
                    setSelectedCityId(null);
                  }}
                >
                  DEP {selectedDepartmentId}
                </span>
              </>
            )}
            {selectedCityId && (
              <>
                <ChevronRight className="h-3 w-3 text-slate-700" />
                <span className="text-violet-400">{selectedCity?.name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Filters HUD */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center p-4 bg-slate-950/45 border border-slate-900 rounded-xl">
        {/* Sport Selection */}
        <div className="space-y-1.5 w-full md:w-auto">
          <span className="block text-[8px] font-orbitron font-extrabold text-slate-500 uppercase tracking-widest">
            {language === "fr" ? "Discipline Sportive" : "Discipline"}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant={selectedSport === "Run" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Run")}
              className="flex items-center gap-1.5"
            >
              <span>🏃</span>
              <span>{language === "fr" ? "Course" : "Run"}</span>
            </Button>
            <Button
              variant={selectedSport === "Ride" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Ride")}
              className="flex items-center gap-1.5"
            >
              <span>🚴</span>
              <span>{language === "fr" ? "Vélo" : "Ride"}</span>
            </Button>
            <Button
              variant={selectedSport === "Walk" ? "primary" : "ghost"}
              size="sm"
              onClick={() => setSelectedSport("Walk")}
              className="flex items-center gap-1.5"
            >
              <span>🚶</span>
              <span>{language === "fr" ? "Marche" : "Walk"}</span>
            </Button>
          </div>
        </div>

        {/* Week Selection */}
        <div className="space-y-1.5 w-full md:w-auto">
          <span className="block text-[8px] font-orbitron font-extrabold text-slate-500 uppercase tracking-widest">
            {language === "fr" ? "Période Historique" : "Timeframe"}
          </span>
          <div className="flex gap-1.5">
            <Button
              variant={selectedWeekOffset === 0 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(0)}
            >
              {language === "fr" ? "Cette semaine" : "This Week"}
            </Button>
            <Button
              variant={selectedWeekOffset === 1 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(1)}
            >
              {language === "fr" ? "Semaine dernière" : "Last Week"}
            </Button>
            <Button
              variant={selectedWeekOffset === 2 ? "accent" : "ghost"}
              size="sm"
              onClick={() => setSelectedWeekOffset(2)}
            >
              {language === "fr" ? "Il y a 2 semaines" : "2 Weeks Ago"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Explorer List (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card glowColor="violet" className="bg-[#111128]/60 border-slate-900">
            <CardHeader className="flex flex-row items-center justify-between border-b border-slate-900/60 pb-4">
              <CardTitle className="text-sm font-orbitron font-bold uppercase tracking-widest flex items-center gap-2">
                <Map className="h-4 w-4 text-violet-400" />
                <span>
                  {!selectedRegionId
                    ? language === "fr" ? "Régions de France" : "Regions of France"
                    : !selectedDepartmentId
                    ? `${language === "fr" ? "Départements de" : "Departments in"} ${selectedRegion?.name}`
                    : `${language === "fr" ? "Villes de" : "Cities in"} ${selectedDept?.name}`}
                </span>
              </CardTitle>

              {(selectedRegionId || selectedDepartmentId || selectedCityId) && (
                <Button
                  variant="outline"
                  size="sm"
                  className="py-1 px-3 flex items-center gap-1 border-slate-800 text-slate-400 hover:text-slate-200"
                  onClick={navigateBack}
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>{language === "fr" ? "Retour" : "Back"}</span>
                </Button>
              )}
            </CardHeader>
            <CardContent className="p-0 max-h-[500px] overflow-y-auto divide-y divide-slate-950/40">
              {/* LEVEL 1: Regions */}
              {!selectedRegionId &&
                calculatedRegions.map((region, index) => {
                  const rank = index + 1;
                  return (
                    <div
                      key={region.id}
                      className="p-4 hover:bg-slate-900/35 flex items-center justify-between cursor-pointer transition duration-200 group"
                      onClick={() => setSelectedRegionId(region.id)}
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-orbitron font-black text-xs text-slate-500 w-6 text-center shrink-0">
                          {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                        </span>
                        <div className="space-y-1">
                          <span className="font-orbitron font-extrabold text-sm text-slate-200 group-hover:text-violet-400 transition">
                            {region.name}
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 font-bold uppercase font-orbitron">
                              Code: {region.id}
                            </span>
                            <span className="text-[10px] text-slate-650">•</span>
                            <span className="text-[10px] text-slate-400 font-semibold font-orbitron">
                              {region.total_influence_points} PI
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <FactionBadge faction={region.controlling_faction} />
                        <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-violet-500 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })}

              {/* LEVEL 2: Departments */}
              {selectedRegionId && !selectedDepartmentId && displayedDepartments.map((dept, index) => {
                const rank = index + 1;
                return (
                  <div
                    key={dept.id}
                    className="p-4 hover:bg-slate-900/35 flex items-center justify-between cursor-pointer transition duration-200 group"
                    onClick={() => setSelectedDepartmentId(dept.id)}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-orbitron font-black text-xs text-slate-500 w-6 text-center shrink-0">
                        {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                      </span>
                      <div className="space-y-1">
                        <span className="font-orbitron font-extrabold text-sm text-slate-200 group-hover:text-violet-400 transition">
                          {dept.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-bold uppercase font-orbitron">
                            Dept {dept.id}
                          </span>
                          <span className="text-[10px] text-slate-650">•</span>
                          <span className="text-[10px] text-slate-400 font-semibold font-orbitron">
                            {dept.total_influence_points} PI
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <FactionBadge faction={dept.controlling_faction} />
                      <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-violet-500 group-hover:translate-x-0.5 transition" />
                    </div>
                  </div>
                );
              })}

              {/* LEVEL 3: Cities */}
              {selectedDepartmentId && !selectedCityId && (
                displayedCities.length > 0 ? (
                  displayedCities.map((city, index) => {
                    const rank = index + 1;
                    return (
                      <div
                        key={city.id}
                        className="p-4 hover:bg-slate-900/35 flex items-center justify-between cursor-pointer transition duration-200 group"
                        onClick={() => setSelectedCityId(city.id)}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-orbitron font-black text-xs text-slate-500 w-6 text-center shrink-0">
                            {rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : `#${rank}`}
                          </span>
                          <div className="space-y-1">
                            <span className="font-orbitron font-extrabold text-sm text-slate-200 group-hover:text-violet-400 transition">
                              {city.name}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-slate-500 font-bold uppercase font-orbitron">
                                {language === "fr" ? "Zone de Capture" : "Capture Zone"}
                              </span>
                              <span className="text-[10px] text-slate-650">•</span>
                              <span className="text-[10px] text-slate-400 font-semibold font-orbitron">
                                {city.total_influence_points} PI
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FactionBadge faction={city.controlling_faction} />
                          <ChevronRight className="h-4 w-4 text-slate-700 group-hover:text-violet-500 group-hover:translate-x-0.5 transition" />
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-8 text-center text-xs text-slate-500 font-orbitron uppercase tracking-wider">
                    {language === "fr" ? "Aucune ville enregistrée dans ce département." : "No cities registered in this department."}
                  </div>
                )
              )}

              {/* LEVEL 4: Selected City Details Block */}
              {selectedCityId && selectedCity && (
                <div className="p-6 space-y-6">
                  <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-900">
                      <div>
                        <span className="text-[9px] font-orbitron font-extrabold text-slate-550 uppercase tracking-widest block">
                          {language === "fr" ? "Zone Finale Capturable" : "Final Capturable Zone"}
                        </span>
                        <h4 className="font-orbitron font-black text-xl text-slate-200 uppercase tracking-wider mt-0.5">
                          {selectedCity.name}
                        </h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs text-slate-400 font-bold uppercase font-orbitron">Contrôle :</span>
                        <FactionBadge faction={selectedCity.controlling_faction} />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div className="p-3 bg-slate-900/40 border border-slate-900/60 rounded-lg">
                        <span className="block text-[8px] font-orbitron text-slate-500 font-extrabold uppercase tracking-widest">
                          {language === "fr" ? "XP PASSIVE HORAIRE" : "HOURLY PASSIVE XP"}
                        </span>
                        <span className="block font-orbitron text-md font-black text-emerald-400 mt-1">
                          +15 XP/h
                        </span>
                      </div>

                      <div className="p-3 bg-slate-900/40 border border-slate-900/60 rounded-lg">
                        <span className="block text-[8px] font-orbitron text-slate-500 font-extrabold uppercase tracking-widest">
                          {language === "fr" ? "INFLUENCE FACTIONNELLE" : "FACTION INFLUENCE"}
                        </span>
                        <span className="block font-orbitron text-md font-black text-violet-400 mt-1">
                          {selectedCity.total_influence_points} PI
                        </span>
                      </div>
                    </div>

                    {/* Passive XP Gain Status Alert */}
                    {isCityControlledByPlayerFaction ? (
                      <div className="p-3 bg-emerald-950/15 border border-emerald-900/30 rounded-lg flex items-center gap-2.5 text-xs text-emerald-450 leading-relaxed font-semibold">
                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <span>
                          {language === "fr"
                            ? "Votre Faction contrôle cette ville ! Vous collectez +15 XP/h passifs."
                            : "Your Faction controls this city! You are gathering +15 passive XP/h."}
                        </span>
                      </div>
                    ) : (
                      <div className="p-3 bg-slate-900/30 border border-slate-900/50 rounded-lg flex items-center gap-2.5 text-xs text-slate-455 leading-relaxed">
                        <span className="h-2 w-2 rounded-full bg-rose-500 shrink-0" />
                        <span>
                          {language === "fr"
                            ? `Contrôlé par les ${selectedCity.controlling_faction}. Capturez cette ville pour votre faction pour activer le gain d'XP.`
                            : `Controlled by the ${selectedCity.controlling_faction}. Seize this city for your faction to trigger the XP gains.`}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User's Workouts inside selected zone */}
          <Card glowColor="none" className="bg-[#111128]/60 border-slate-900">
            <CardHeader className="border-b border-slate-900/60 pb-4">
              <CardTitle className="text-sm font-orbitron font-bold uppercase tracking-widest flex items-center gap-2">
                <Activity className="h-4 w-4 text-violet-400" />
                <span>
                  {language === "fr"
                    ? `Vos Quêtes cette semaine - ${currentLevelName}`
                    : `Your Quests this week - ${currentLevelName}`}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="max-h-[350px] overflow-y-auto divide-y divide-slate-950/40 p-0">
              {userWorkoutsInZone.length > 0 ? (
                userWorkoutsInZone.map((w) => (
                  <div key={w.id} className="p-4 flex items-center justify-between text-xs hover:bg-slate-900/20">
                    <div className="space-y-1">
                      <span className="font-orbitron font-extrabold text-slate-200 block">{w.name}</span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase font-orbitron">
                        <span>
                          {w.activity_type === "Ride" ? "🚴" : w.activity_type === "Walk" || w.activity_type === "Hike" ? "🚶" : "🏃"}{" "}
                          {w.activity_type === "Ride"
                            ? (language === "fr" ? "Vélo" : "Ride")
                            : w.activity_type === "Walk" || w.activity_type === "Hike"
                            ? (language === "fr" ? "Marche" : "Walk")
                            : (language === "fr" ? "Course" : "Run")}
                        </span>
                        <span>•</span>
                        <span>{w.distance.toFixed(1)} km</span>
                        <span>•</span>
                        <span>{new Date(w.start_date).toLocaleDateString(language === "fr" ? "fr-FR" : "en-US")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right font-orbitron font-extrabold text-[11px]">
                        <span className="text-violet-400 block">+{w.xp_gained} XP</span>
                        <span className="text-amber-500 block">+{Math.round(w.distance * 10)} Or</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-550 font-orbitron uppercase tracking-wider">
                  {language === "fr"
                    ? "Aucun effort enregistré dans cette zone cette semaine."
                    : "No logged workouts in this zone this week."}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Weekly Rankings & Faction Balance (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Level Stats Card */}
          <Card glowColor="none" className="bg-[#111128]/60 border-slate-900 p-5">
            <h3 className="font-orbitron font-black text-sm text-slate-100 uppercase tracking-widest mb-4 border-b border-slate-900 pb-2 flex items-center justify-between">
              <span>{currentLevelName}</span>
              <Badge variant="neutral" className="border-violet-500/20 text-violet-400 font-orbitron text-[9px]">
                {selectedCityId ? "COMMUNE" : selectedDepartmentId ? "DEPT" : selectedRegionId ? "REGION" : "FRANCE"}
              </Badge>
            </h3>

            {/* Faction Ratios */}
            <div className="space-y-4">
              <span className="block font-orbitron text-[9px] font-extrabold text-slate-550 uppercase tracking-widest">
                {language === "fr" ? "Équilibre Factionnel Hebdo" : "Weekly Faction Balance"}
              </span>

              <div className="space-y-3">
                {/* Shadow Runners */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-orbitron font-bold">
                    <span className="text-violet-400">Shadow Runners</span>
                    <span className="text-slate-300">{currentFactionBreakdown.percentages["Shadow Runners"]}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-violet-600 rounded shadow-[0_0_10px_rgba(139,92,246,0.5)] transition-all duration-500"
                      style={{ width: `${currentFactionBreakdown.percentages["Shadow Runners"]}%` }}
                    />
                  </div>
                </div>

                {/* Solar Cyclists */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-orbitron font-bold">
                    <span className="text-amber-500">Solar Cyclists</span>
                    <span className="text-slate-300">{currentFactionBreakdown.percentages["Solar Cyclists"]}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-amber-500 rounded shadow-[0_0_10px_rgba(245,158,11,0.5)] transition-all duration-500"
                      style={{ width: `${currentFactionBreakdown.percentages["Solar Cyclists"]}%` }}
                    />
                  </div>
                </div>

                {/* Lunar Walkers */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-orbitron font-bold">
                    <span className="text-cyan-400">Lunar Walkers</span>
                    <span className="text-slate-300">{currentFactionBreakdown.percentages["Lunar Walkers"]}%</span>
                  </div>
                  <div className="w-full h-2 rounded bg-slate-950 border border-slate-900/60 overflow-hidden relative">
                    <div
                      className="h-full bg-cyan-500 rounded shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500"
                      style={{ width: `${currentFactionBreakdown.percentages["Lunar Walkers"]}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-semibold text-slate-555 font-orbitron text-right pt-2 border-t border-slate-950/60">
                {language === "fr" ? "Effort Total :" : "Total effort :"} {currentFactionBreakdown.total} km
              </div>
            </div>
          </Card>

          {/* Weekly Leaderboards at Selected Scale */}
          <Card glowColor="violet" className="bg-[#111128]/60 border-slate-900">
            <CardHeader className="border-b border-slate-900/60 pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <CardTitle className="text-xs font-orbitron font-black uppercase tracking-widest flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  <span>{language === "fr" ? "Classement de la Semaine" : "Weekly Leaderboard"}</span>
                </CardTitle>

                {/* Category tabs inside leaderboard card */}
                <div className="flex gap-1 bg-slate-950/65 p-0.5 rounded-lg border border-slate-900 shrink-0">
                  <button
                    onClick={() => setRankingSport("Run")}
                    className={`px-2 py-1 text-[10px] font-orbitron font-bold rounded transition ${
                      rankingSport === "Run"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                        : "text-slate-400 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    🏃 Run
                  </button>
                  <button
                    onClick={() => setRankingSport("Ride")}
                    className={`px-2 py-1 text-[10px] font-orbitron font-bold rounded transition ${
                      rankingSport === "Ride"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                        : "text-slate-400 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    🚴 Ride
                  </button>
                  <button
                    onClick={() => setRankingSport("Walk")}
                    className={`px-2 py-1 text-[10px] font-orbitron font-bold rounded transition ${
                      rankingSport === "Walk"
                        ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(139,92,246,0.4)]"
                        : "text-slate-400 hover:text-slate-200 cursor-pointer"
                    }`}
                  >
                    🚶 Walk
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="max-h-[400px] overflow-y-auto">
                {currentLeaderboard.length > 0 ? (
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-950/20 border-b border-slate-900 font-orbitron font-bold uppercase text-[9px] text-slate-500">
                        <th className="py-2.5 px-4 text-center w-10">#</th>
                        <th className="py-2.5 px-2">{language === "fr" ? "Coureur" : "Warrior"}</th>
                        <th className="py-2.5 px-2 text-right pr-4">Distance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-950/40">
                      {currentLeaderboard.map((entry) => {
                        const isSelf = entry.userId === currentUserId;
                        return (
                          <tr
                            key={entry.userId}
                            className={`transition hover:bg-slate-900/20 cursor-pointer ${
                              isSelf ? "bg-violet-950/10 font-bold border-l-2 border-l-violet-500" : ""
                            }`}
                            onClick={() => setSelectedAthleteId(entry.userId)}
                          >
                            <td className="py-3 px-4 text-center font-orbitron text-slate-400">
                              {entry.rank === 1 ? (
                                <span className="text-amber-500 font-black">🥇</span>
                              ) : entry.rank === 2 ? (
                                <span className="text-slate-400 font-black">🥈</span>
                              ) : entry.rank === 3 ? (
                                <span className="text-amber-700 font-black">🥉</span>
                              ) : (
                                entry.rank
                              )}
                            </td>
                            <td className="py-3 px-2">
                              <div className="flex items-center gap-2">
                                <span className="font-orbitron text-slate-200">
                                  {entry.username}
                                  {isSelf && (
                                    <span className="ml-1.5 text-[8px] bg-violet-600/25 border border-violet-500/20 text-violet-400 px-1 py-0.5 rounded font-black">
                                      {language === "fr" ? "VOUS" : "YOU"}
                                    </span>
                                  )}
                                </span>
                              </div>
                              <div className="mt-1 shrink-0 scale-90 origin-left">
                                <FactionBadge faction={entry.faction} />
                              </div>
                            </td>
                            <td className="py-3 px-2 text-right pr-4 font-orbitron font-black text-slate-300">
                              {entry.distance.toFixed(1)} <span className="text-[9px] text-slate-555">KM</span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                ) : (
                  <div className="p-8 text-center text-xs text-slate-555 font-orbitron uppercase tracking-wider">
                    {language === "fr"
                      ? "Aucun effort enregistré à cette échelle cette semaine."
                      : "No efforts registered at this scale this week."}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Help Modal */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200 font-sans">
          <Card glowColor="violet" className="w-full max-w-lg bg-[#111128]/95 border-slate-800 shadow-2xl relative overflow-hidden">
            <button
              onClick={() => setShowHelpModal(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-slate-400 hover:text-slate-100 hover:bg-slate-900/60 transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
            <CardHeader className="border-b border-slate-900 pb-4">
              <CardTitle className="font-orbitron font-extrabold text-md uppercase tracking-wider text-slate-150 flex items-center gap-2">
                <Compass className="h-5 w-5 text-violet-500" />
                <span>
                  {language === "fr" ? "Règles de Conquête Fitness" : "Fitness Conquest Rules"}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4 text-xs text-slate-350 leading-relaxed font-sans max-h-[70vh] overflow-y-auto">
              <div className="space-y-2">
                <h4 className="font-orbitron font-bold text-slate-200 uppercase tracking-wide">
                  {language === "fr" ? "1. Points d'Influence (PI)" : "1. Influence Points (IP)"}
                </h4>
                <p>
                  {language === "fr"
                    ? "Chaque kilomètre parcouru lors de vos séances d'entraînement génère des Points d'Influence (1 km = 1 PI). Les activités sont comptabilisées dans la zone (Ville, Département, Région) où elles ont été enregistrées sur le GPS."
                    : "Every kilometer completed during your workouts generates Influence Points (1 km = 1 IP). Activities are counted in the zone (City, Department, Region) where they were recorded via GPS."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-orbitron font-bold text-slate-200 uppercase tracking-wide">
                  {language === "fr" ? "2. Contrôle des Villes & Zones" : "2. Controlling Cities & Zones"}
                </h4>
                <p>
                  {language === "fr"
                    ? "La faction ayant accumulé le plus de points d'influence cumulés par ses membres prend le contrôle de la zone pour la semaine. Les classements sont réinitialisés chaque dimanche à minuit UTC."
                    : "The faction that has accumulated the most influence points from its members takes control of the zone for the week. Rankings reset every Sunday at midnight UTC."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-orbitron font-bold text-emerald-400 uppercase tracking-wide">
                  {language === "fr" ? "3. Récompense : XP Passive" : "3. Reward: Passive XP"}
                </h4>
                <p>
                  {language === "fr"
                    ? "Si votre faction contrôle une ville, vous recevez un bonus passif de +15 XP par heure (+360 XP/jour) pour chaque ville contrôlée ! Les gains d'XP passive sont versés à tous les membres de la faction dominante."
                    : "If your faction controls a city, you receive a passive bonus of +15 XP per hour (+360 XP/day) for each controlled city! Passive XP gains are distributed to all members of the dominant faction."}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-orbitron font-bold text-slate-200 uppercase tracking-wide">
                  {language === "fr" ? "4. Factions du Royaume" : "4. Kingdom Factions"}
                </h4>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    <strong className="text-violet-400">Shadow Runners</strong> :{" "}
                    {language === "fr" ? "Dédiés à la course à pied (Run)" : "Dedicated to running (Run)"}
                  </li>
                  <li>
                    <strong className="text-amber-500">Solar Cyclists</strong> :{" "}
                    {language === "fr" ? "Dédiés au cyclisme (Ride)" : "Dedicated to cycling (Ride)"}
                  </li>
                  <li>
                    <strong className="text-cyan-400">Lunar Walkers</strong> :{" "}
                    {language === "fr" ? "Dédiés à la marche et randonnée (Walk)" : "Dedicated to walking and hiking (Walk)"}
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-900 flex justify-end">
                <Button variant="primary" size="sm" onClick={() => setShowHelpModal(false)}>
                  {language === "fr" ? "Compris !" : "Understood!"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Public Profile Inspector Modal */}
      <PublicProfileModal
        userId={selectedAthleteId}
        isOpen={selectedAthleteId !== null}
        onClose={() => setSelectedAthleteId(null)}
      />
    </div>
  );
}
