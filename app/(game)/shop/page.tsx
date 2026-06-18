"use client";

import React, { useEffect, useState } from "react";
import { Coins, Sparkles, Shield, User, Check, Lock, ShoppingBag, Flame } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Profile, Workout } from "@/lib/types";
import { isDemoMode, demoProfile, demoWorkouts } from "@/lib/demo-data";
import { useLanguage } from "@/components/layout/language-provider";

interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: "title" | "border" | "avatar";
  value: string | null;
  rarity: "Commun" | "Rare" | "Épique" | "Légendaire";
  quest?: {
    description: string;
    descriptionEn: string;
    type: "distance" | "time" | "city" | "elevation" | "workoutCount";
    threshold: number;
    activityType?: "Run" | "Ride" | "Walk" | "All";
    hours?: [number, number]; // [start, end]
    city?: string;
  };
}

const SHOP_ITEMS: ShopItem[] = [
  // --- TITLES ---
  {
    id: "title-arpenteur",
    name: "Arpenteur des Sentiers",
    description: "Un aventurier qui a fait ses premiers pas.",
    price: 50,
    type: "title",
    value: "Arpenteur des Sentiers",
    rarity: "Commun",
    quest: {
      description: "Enregistrer au moins 3 activités de tout type.",
      descriptionEn: "Complete at least 3 workouts of any type.",
      type: "workoutCount",
      threshold: 3,
      activityType: "All"
    }
  },
  {
    id: "title-yvelines",
    name: "Le Fléau des Yvelines",
    description: "Un titre pour les conquérants des routes du 78.",
    price: 150,
    type: "title",
    value: "Le Fléau des Yvelines",
    rarity: "Rare",
    quest: {
      description: "Accomplir une sortie vélo (Ride) de plus de 40 km.",
      descriptionEn: "Complete a bike ride (Ride) of more than 40 km.",
      type: "distance",
      threshold: 40,
      activityType: "Ride"
    }
  },
  {
    id: "title-twilight",
    name: "Vagabond du Crépuscule",
    description: "Pour ceux qui arpentent le royaume aux heures dorées.",
    price: 150,
    type: "title",
    value: "Vagabond du Crépuscule",
    rarity: "Rare",
    quest: {
      description: "Marcher ou courir au lever ou coucher du soleil (6h-8h ou 18h-20h).",
      descriptionEn: "Walk or run during sunrise or sunset (6am-8am or 6pm-8pm).",
      type: "distance",
      threshold: 0,
      activityType: "All",
      hours: [6, 8]
    }
  },
  {
    id: "title-malakoff",
    name: "Souverain de Malakoff",
    description: "Déclarez votre suprématie sur les terres de Malakoff.",
    price: 250,
    type: "title",
    value: "Souverain de Malakoff",
    rarity: "Rare",
    quest: {
      description: "Enregistrer au moins une activité à Malakoff.",
      descriptionEn: "Record at least one workout in Malakoff.",
      type: "city",
      threshold: 1,
      city: "Malakoff"
    }
  },
  {
    id: "title-ombre",
    name: "Éclaireur de l'Ombre",
    description: "Pour les coureurs discrets mais redoutables.",
    price: 300,
    type: "title",
    value: "Éclaireur de l'Ombre",
    rarity: "Épique",
    quest: {
      description: "Effectuer une course (Run) de nuit (entre 20h00 et 06h00).",
      descriptionEn: "Complete a night run (Run) (between 8:00 PM and 6:00 AM).",
      type: "time",
      threshold: 1,
      activityType: "Run"
    }
  },
  {
    id: "title-soleil",
    name: "Champion Solaire",
    description: "Brillez au sommet du classement cycliste.",
    price: 300,
    type: "title",
    value: "Champion Solaire",
    rarity: "Épique",
    quest: {
      description: "Réaliser une sortie vélo (Ride) en plein zénith (11h30-13h30).",
      descriptionEn: "Complete a bike ride (Ride) at midday (11:30 AM-1:30 PM).",
      type: "distance",
      threshold: 0,
      activityType: "Ride",
      hours: [11, 13]
    }
  },
  {
    id: "title-lune",
    name: "Nomade Lunaire",
    description: "Pour les marcheurs nocturnes et randonneurs d'élite.",
    price: 300,
    type: "title",
    value: "Nomade Lunaire",
    rarity: "Épique",
    quest: {
      description: "Effectuer une rando/marche (Walk/Hike) nocturne (21h00-05h00).",
      descriptionEn: "Complete a night walk/hike (Walk/Hike) (9:00 PM-5:00 AM).",
      type: "distance",
      threshold: 0,
      activityType: "Walk",
      hours: [21, 5]
    }
  },
  {
    id: "title-denivele",
    name: "Légende du Dénivelé",
    description: "Destiné à ceux qui mangent de la pente au petit-déjeuner.",
    price: 500,
    type: "title",
    value: "Légende du Dénivelé",
    rarity: "Légendaire",
    quest: {
      description: "Accumuler 5 000 m de dénivelé positif cumulé (Démo : 1 000 m).",
      descriptionEn: "Accumulate 5,000 m of total elevation gain (Demo: 1,000 m).",
      type: "elevation",
      threshold: 5000,
      activityType: "All"
    }
  },
  {
    id: "title-titan",
    name: "Titan d'Or",
    description: "Réservé aux guerriers ayant gravi les échelons du pouvoir.",
    price: 1000,
    type: "title",
    value: "Titan d'Or",
    rarity: "Légendaire",
    quest: {
      description: "Atteindre le niveau 15 (Démo : niveau 8).",
      descriptionEn: "Reach level 15 (Demo: level 8).",
      type: "workoutCount",
      threshold: 15
    }
  },
  {
    id: "title-conquete",
    name: "Maître de la Conquête",
    description: "Pour ceux qui ont marqué de leur empreinte plusieurs cités.",
    price: 800,
    type: "title",
    value: "Maître de la Conquête",
    rarity: "Légendaire",
    quest: {
      description: "Enregistrer des entraînements dans 3 villes différentes de France.",
      descriptionEn: "Log workouts in 3 different cities of France.",
      type: "workoutCount",
      threshold: 3
    }
  },
  // --- BORDERS ---
  {
    id: "border-steel",
    name: "Acier Poli",
    description: "Une bordure métallique avec de fins reflets argentés.",
    price: 200,
    type: "border",
    value: "steel-frame",
    rarity: "Rare",
  },
  {
    id: "border-shadow",
    name: "Aura de l'Ombre",
    description: "Une lueur violette mystique autour de votre avatar.",
    price: 400,
    type: "border",
    value: "shadow-glow",
    rarity: "Rare",
  },
  {
    id: "border-solar",
    name: "Aurore Solaire",
    description: "Un halo doré et chaleureux digne des cyclistes solaires.",
    price: 500,
    type: "border",
    value: "solar-glow",
    rarity: "Rare",
  },
  {
    id: "border-lunar",
    name: "Brume Lunaire",
    description: "Une lueur cyan glaciale rappelant l'éclat de la lune.",
    price: 450,
    type: "border",
    value: "lunar-glow",
    rarity: "Rare",
  },
  {
    id: "border-neon",
    name: "Néon Pulsant",
    description: "Une bordure futuriste avec une pulsation violette vibrante.",
    price: 500,
    type: "border",
    value: "neon-glow",
    rarity: "Épique",
  },
  {
    id: "border-fire",
    name: "Feu Sacré",
    description: "Des flammes rouges ardentes crépitent autour de votre avatar.",
    price: 600,
    type: "border",
    value: "fire-glow",
    rarity: "Épique",
  },
  {
    id: "border-void",
    name: "Étoile du Néant",
    description: "Une lueur cosmique sombre violette saupoudrée de petites particules.",
    price: 600,
    type: "border",
    value: "void-glow",
    rarity: "Épique",
  },
  {
    id: "border-gold",
    name: "Cadre de Maître en Or",
    description: "Une bordure dorée scintillante réservée aux vétérans.",
    price: 1000,
    type: "border",
    value: "gold-master-glow",
    rarity: "Légendaire",
  },
  {
    id: "border-rainbow",
    name: "Néon Arc-en-Ciel",
    description: "Un effet multicolore animé qui attire tous les regards.",
    price: 1200,
    type: "border",
    value: "rainbow-glow",
    rarity: "Légendaire",
  },
  {
    id: "border-dragon",
    name: "Dragon Divin",
    description: "Un dragon d'or majestueux enroulé autour de votre avatar.",
    price: 1500,
    type: "border",
    value: "dragon-glow",
    rarity: "Légendaire",
  },
  // --- AVATARS ---
  {
    id: "avatar-mage",
    name: "Mage de l'Ombre",
    description: "Un avatar de mage mystique pour votre Codex.",
    price: 300,
    type: "avatar",
    value: "https://api.dicebear.com/7.x/adventurer/svg?seed=Sophia",
    rarity: "Épique",
  },
  {
    id: "avatar-guerrier",
    name: "Paladin du Soleil",
    description: "Un puissant guerrier en armure étincelante.",
    price: 300,
    type: "avatar",
    value: "https://api.dicebear.com/7.x/adventurer/svg?seed=Jack",
    rarity: "Épique",
  },
  {
    id: "avatar-druide",
    name: "Druide de la Lune",
    description: "Un sage protecteur des sentiers sauvages.",
    price: 300,
    type: "avatar",
    value: "https://api.dicebear.com/7.x/adventurer/svg?seed=Midnight",
    rarity: "Épique",
  },
];

export default function ShopPage() {
  const { t, language } = useLanguage();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"title" | "border" | "avatar">("title");
  
  // Cosmetic state stored locally
  const [unlockedItems, setUnlockedItems] = useState<string[]>([]);
  const [equippedTitle, setEquippedTitle] = useState<string | null>(null);
  const [equippedBorder, setEquippedBorder] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [discounts, setDiscounts] = useState<string[]>([]);

  const isDemo = isDemoMode();

  const loadProfileAndCosmetics = async () => {
    let activeProfile: Profile | null = null;

    if (isDemo) {
      activeProfile = { ...demoProfile };
    } else {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          if (data) activeProfile = data;
        }
      } catch (err) {
        console.error("Error loading user profile:", err);
      }
    }

    if (activeProfile) {
      const p = activeProfile;
      // Load local storage overrides
      const fallbackKey = `fitness-realm-profile-fallback-${p.id}`;
      const fallbackRaw = localStorage.getItem(fallbackKey);
      let updatedProfile = { ...p };
      if (fallbackRaw) {
        try {
          const fallback = JSON.parse(fallbackRaw);
          updatedProfile = { ...updatedProfile, ...fallback };
        } catch {}
      }

      setProfile(updatedProfile);

      // Load unlocked items from local storage fallbacks
      const unlockedKey = `fitness-realm-unlocked-${p.id}`;
      const unlockedRaw = localStorage.getItem(unlockedKey);
      if (unlockedRaw) {
        try {
          setUnlockedItems(JSON.parse(unlockedRaw));
        } catch {}
      } else {
        // Default unlocked items: nothing initially except basic setups
        const initialUnlocked = ["title-recruit"];
        localStorage.setItem(unlockedKey, JSON.stringify(initialUnlocked));
        setUnlockedItems(initialUnlocked);
      }

      // Load equipped title and border
      setEquippedTitle(updatedProfile.city === undefined ? null : (localStorage.getItem(`fitness-realm-equipped-title-${p.id}`) || null));
      setEquippedBorder(localStorage.getItem(`fitness-realm-equipped-border-${p.id}`) || null);

      // Load validated discounts from LocalStorage
      const discountKey = `fitness-realm-discounts-${p.id}`;
      const discountRaw = localStorage.getItem(discountKey);
      if (discountRaw) {
        try {
          setDiscounts(JSON.parse(discountRaw));
        } catch {}
      }

      // Load workouts
      let activeWorkouts: Workout[] = [];
      if (isDemo) {
        activeWorkouts = [...demoWorkouts];
      } else {
        try {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: wData } = await supabase
              .from("workouts")
              .select("*")
              .eq("user_id", user.id);
            if (wData) activeWorkouts = wData;
          }
        } catch (err) {
          console.error("Error loading workouts for shop quests:", err);
        }
      }
      setWorkouts(activeWorkouts);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadProfileAndCosmetics();
  }, []);

  const getItemPrice = (item: ShopItem): number => {
    if (discounts.includes(item.id)) {
      return Math.round(item.price / 2);
    }
    return item.price;
  };

  const checkQuestProgress = (item: ShopItem): { completed: boolean; text: string; percent: number } => {
    if (!item.quest) return { completed: false, text: "", percent: 0 };
    const q = item.quest;

    const filteredWorkouts = workouts.filter(
      (w) => !q.activityType || q.activityType === "All" || w.activity_type === q.activityType
    );

    if (q.type === "workoutCount") {
      const current = filteredWorkouts.length;
      const threshold = item.id === "title-titan" && isDemo ? 8 : q.threshold;
      const pct = Math.min(100, Math.round((current / threshold) * 100));
      return {
        completed: current >= threshold,
        text: `${current} / ${threshold} ${language === "fr" ? "activités" : "workouts"}`,
        percent: pct,
      };
    }

    if (q.type === "distance") {
      if (q.hours) {
        const matches = filteredWorkouts.filter((w) => {
          const date = new Date(w.start_date);
          const hr = date.getHours();
          return hr >= q.hours![0] && hr <= q.hours![1];
        });
        const completed = matches.length > 0;
        return {
          completed,
          text: completed
            ? (language === "fr" ? "Réalisé !" : "Completed!")
            : (language === "fr" ? "Non réalisé" : "Not completed yet"),
          percent: completed ? 100 : 0,
        };
      }

      const maxDistance = filteredWorkouts.reduce((max, w) => Math.max(max, Number(w.distance)), 0);
      const pct = Math.min(100, Math.round((maxDistance / q.threshold) * 100));
      return {
        completed: maxDistance >= q.threshold,
        text: `${maxDistance.toFixed(1)} / ${q.threshold} km`,
        percent: pct,
      };
    }

    if (q.type === "elevation") {
      const totalElev = filteredWorkouts.reduce((sum, w) => sum + Number(w.elevation_gain || 0), 0);
      const threshold = isDemo && q.threshold === 5000 ? 1000 : q.threshold;
      const pct = Math.min(100, Math.round((totalElev / threshold) * 100));
      return {
        completed: totalElev >= threshold,
        text: `${Math.round(totalElev)} / ${threshold} m`,
        percent: pct,
      };
    }

    if (q.type === "city") {
      const match = filteredWorkouts.some((w) => w.city_id === q.city || w.name.toLowerCase().includes(q.city!.toLowerCase()));
      return {
        completed: match,
        text: match
          ? (language === "fr" ? "Visité !" : "Visited!")
          : (language === "fr" ? "Non visité" : "Not visited yet"),
        percent: match ? 100 : 0,
      };
    }

    if (q.type === "time") {
      const matches = filteredWorkouts.filter((w) => {
        const date = new Date(w.start_date);
        const hr = date.getHours();
        return hr >= 20 || hr <= 6;
      });
      const completed = matches.length > 0;
      return {
        completed,
        text: completed
          ? (language === "fr" ? "Réalisé !" : "Completed!")
          : (language === "fr" ? "Non réalisé" : "Not réalisé"),
        percent: completed ? 100 : 0,
      };
    }

    return { completed: false, text: "", percent: 0 };
  };

  const handleClaimQuestReward = (item: ShopItem) => {
    if (!profile) return;
    const profileId = profile.id;

    if (item.id === "title-denivele" || item.id === "title-titan") {
      const updatedUnlocked = [...unlockedItems, item.id];
      const unlockedKey = `fitness-realm-unlocked-${profileId}`;
      localStorage.setItem(unlockedKey, JSON.stringify(updatedUnlocked));
      setUnlockedItems(updatedUnlocked);

      setMessage({
        text: language === "fr"
          ? `Félicitations ! Vous avez débloqué le titre légendaire "${item.name}" gratuitement !`
          : `Congratulations! You unlocked the legendary title "${item.name}" for free!`,
        type: "success",
      });
    } else {
      const updatedDiscounts = [...discounts, item.id];
      const discountKey = `fitness-realm-discounts-${profileId}`;
      localStorage.setItem(discountKey, JSON.stringify(updatedDiscounts));
      setDiscounts(updatedDiscounts);

      setMessage({
        text: language === "fr"
          ? `Quête validée ! Le titre "${item.name}" est désormais à -50% !`
          : `Quest validated! The title "${item.name}" is now at -50%!`,
        type: "success",
      });
    }

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  const handlePurchase = async (item: ShopItem) => {
    if (!profile) return;
    const price = getItemPrice(item);

    if (profile.gold < price) {
      setMessage({
        text: language === "fr" ? "Or insuffisant pour cet achat !" : "Not enough gold for this purchase!",
        type: "error",
      });
      return;
    }

    const updatedGold = profile.gold - price;
    const updatedUnlocked = [...unlockedItems, item.id];

    const fallbackKey = `fitness-realm-profile-fallback-${profile.id}`;
    const currentFallbackRaw = localStorage.getItem(fallbackKey);
    let currentFallback = {};
    if (currentFallbackRaw) {
      try {
        currentFallback = JSON.parse(currentFallbackRaw);
      } catch {}
    }
    const newFallback = { ...currentFallback, gold: updatedGold };
    localStorage.setItem(fallbackKey, JSON.stringify(newFallback));

    const unlockedKey = `fitness-realm-unlocked-${profile.id}`;
    localStorage.setItem(unlockedKey, JSON.stringify(updatedUnlocked));

    if (!isDemo) {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supabase = createClient();
        await supabase
          .from("profiles")
          .update({ gold: updatedGold })
          .eq("id", profile.id);
      } catch (err) {
        console.warn("DB update failed, using LocalStorage fallback for gold", err);
      }
    }

    setProfile((prev) => prev ? { ...prev, gold: updatedGold } : null);
    setUnlockedItems(updatedUnlocked);
    setMessage({
      text: language === "fr" ? `Achat réussi : ${item.name} !` : `Purchase successful: ${item.name}!`,
      type: "success",
    });

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  const handleEquip = (item: ShopItem) => {
    if (!profile) return;
    const profileId = profile.id;

    if (item.type === "title") {
      const isCurrentlyEquipped = equippedTitle === item.value;
      const newValue = isCurrentlyEquipped ? null : item.value;
      
      if (newValue) {
        localStorage.setItem(`fitness-realm-equipped-title-${profileId}`, newValue);
      } else {
        localStorage.removeItem(`fitness-realm-equipped-title-${profileId}`);
      }
      setEquippedTitle(newValue);
    } else if (item.type === "border") {
      const isCurrentlyEquipped = equippedBorder === item.value;
      const newValue = isCurrentlyEquipped ? null : item.value;

      if (newValue) {
        localStorage.setItem(`fitness-realm-equipped-border-${profileId}`, newValue);
      } else {
        localStorage.removeItem(`fitness-realm-equipped-border-${profileId}`);
      }
      setEquippedBorder(newValue);
    } else if (item.type === "avatar") {
      const fallbackKey = `fitness-realm-profile-fallback-${profileId}`;
      const currentFallbackRaw = localStorage.getItem(fallbackKey);
      let currentFallback = {};
      if (currentFallbackRaw) {
        try {
          currentFallback = JSON.parse(currentFallbackRaw);
        } catch {}
      }
      const newFallback = { ...currentFallback, avatar_url: item.value };
      localStorage.setItem(fallbackKey, JSON.stringify(newFallback));

      if (!isDemo) {
        async function updateDB() {
          const { createClient } = await import("@/lib/supabase/client");
          const supabase = createClient();
          await supabase
            .from("profiles")
            .update({ avatar_url: item.value })
            .eq("id", profileId);
        }
        updateDB();
      }

      setProfile((prev) => prev ? { ...prev, avatar_url: item.value } : null);
    }

    setMessage({
      text: language === "fr" ? "Style équipé avec succès !" : "Cosmetic equipped successfully!",
      type: "success",
    });

    window.dispatchEvent(new Event("fitness-realm-profile-updated"));
  };

  const isUnlocked = (itemId: string) => unlockedItems.includes(itemId);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Sparkles className="h-8 w-8 text-violet-500 animate-pulse" />
        <span className="font-orbitron text-xs tracking-widest text-slate-500 uppercase">
          Ouverture de la Boutique...
        </span>
      </div>
    );
  }

  const filteredItems = SHOP_ITEMS.filter((item) => item.type === activeTab);

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-card border-slate-900 bg-[#111128]/60 rounded-xl relative overflow-hidden">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-violet-950/40 border border-violet-500/30 flex items-center justify-center text-violet-400 shrink-0 filter drop-shadow-[0_0_8px_rgba(139,92,246,0.3)]">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-orbitron font-extrabold text-lg text-slate-100 uppercase tracking-widest">
              {language === "fr" ? "Boutique de Cosmétiques RPG" : "RPG Cosmetics Shop"}
            </h2>
            <p className="text-xs text-slate-455 mt-1 leading-relaxed max-w-xl">
              {language === "fr"
                ? "Dépensez vos pièces d'or durement gagnées en courant, pédalant ou marchant pour acquérir des titres honorifiques, des bordures d'avatar et des styles exclusifs."
                : "Spend your hard-earned gold coins from running, cycling, or walking to acquire honorary titles, glowing avatar borders, and custom styles."}
            </p>
          </div>
        </div>

        {profile && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-slate-950/50 border border-slate-850 rounded-xl self-start md:self-center">
            <Coins className="h-5 w-5 text-amber-400 animate-pulse" />
            <div className="font-orbitron font-bold">
              <span className="text-amber-400 text-sm">{profile.gold}</span>
              <span className="text-[10px] text-slate-550 uppercase tracking-wider ml-1">{t("gold")}</span>
            </div>
          </div>
        )}
      </div>

      {/* Notifications */}
      {message && (
        <div
          className={`p-3 rounded-lg text-xs font-semibold tracking-wide border transition-all duration-300 ${
            message.type === "success"
              ? "bg-emerald-950/20 border-emerald-900/40 text-emerald-400"
              : "bg-rose-950/20 border-rose-900/40 text-rose-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Navigation tabs */}
      <div className="flex gap-2 border-b border-slate-900 pb-2">
        <button
          onClick={() => {
            setActiveTab("title");
            setMessage(null);
          }}
          className={`px-4 py-2 font-orbitron text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "title"
              ? "text-violet-400 border-violet-500"
              : "text-slate-500 border-transparent hover:text-slate-350"
          }`}
        >
          {language === "fr" ? "🏆 Titres" : "🏆 Titles"}
        </button>
        <button
          onClick={() => {
            setActiveTab("border");
            setMessage(null);
          }}
          className={`px-4 py-2 font-orbitron text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "border"
              ? "text-violet-400 border-violet-500"
              : "text-slate-500 border-transparent hover:text-slate-350"
          }`}
        >
          {language === "fr" ? "✨ Bordures" : "✨ Borders"}
        </button>
        <button
          onClick={() => {
            setActiveTab("avatar");
            setMessage(null);
          }}
          className={`px-4 py-2 font-orbitron text-xs font-bold tracking-wider uppercase border-b-2 transition-all ${
            activeTab === "avatar"
              ? "text-violet-400 border-violet-500"
              : "text-slate-500 border-transparent hover:text-slate-350"
          }`}
        >
          {language === "fr" ? "👤 Avatars RPG" : "👤 RPG Avatars"}
        </button>
      </div>

      {/* Grid items */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map((item) => {
          const unlocked = isUnlocked(item.id);
          let isEquipped = false;
          if (item.type === "title") isEquipped = equippedTitle === item.value;
          if (item.type === "border") isEquipped = equippedBorder === item.value;
          if (item.type === "avatar") isEquipped = profile?.avatar_url === item.value;

          const hasDiscount = discounts.includes(item.id);
          const price = getItemPrice(item);

          let rarityGlow: "none" | "violet" | "cyan" | "amber" | "rose" = "none";
          if (unlocked) {
            rarityGlow = isEquipped ? "violet" : "none";
          } else {
            rarityGlow = item.rarity === "Légendaire" ? "amber" : item.rarity === "Épique" ? "violet" : item.rarity === "Rare" ? "cyan" : "none";
          }

          let rarityColors = "";
          if (item.rarity === "Légendaire") rarityColors = "text-amber-500 bg-amber-950/20 border-amber-800/30 font-bold animate-pulse";
          else if (item.rarity === "Épique") rarityColors = "text-violet-400 bg-violet-950/20 border-violet-800/30 font-bold";
          else if (item.rarity === "Rare") rarityColors = "text-cyan-400 bg-cyan-950/20 border-cyan-800/30 font-bold";
          else rarityColors = "text-slate-400 bg-slate-900 border-slate-800 font-semibold";

          return (
            <Card
              key={item.id}
              glowColor={rarityGlow}
              className={`p-5 flex flex-col justify-between border-slate-900 bg-[#111128]/50 transition-all duration-300 ${
                isEquipped ? "ring-1 ring-violet-500/30" : ""
              }`}
            >
              <div className="space-y-3">
                {/* Visual Preview box */}
                <div className="h-28 w-full bg-slate-950/40 rounded-xl border border-slate-900/60 flex items-center justify-center relative overflow-hidden">
                  {item.type === "title" && (
                    <div className="text-center p-3">
                      <span className="block text-[10px] text-slate-500 font-orbitron font-semibold uppercase tracking-wider mb-1">
                        Aperçu Titre
                      </span>
                      <span className="font-orbitron font-extrabold text-sm text-slate-200 truncate block px-2 py-1 bg-slate-950 border border-slate-850/80 rounded-md">
                        {profile?.username || "Warrior"}
                      </span>
                      <span className="text-xs text-violet-400 font-orbitron font-bold tracking-wider block mt-1">
                        {item.value}
                      </span>
                    </div>
                  )}

                  {item.type === "border" && (
                    <div className="flex items-center justify-center p-4">
                      <div className="relative">
                        <div
                          className={`h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center font-orbitron text-lg font-black text-slate-350 shadow-inner ${
                            item.value === "shadow-glow"
                              ? "shadow-[0_0_12px_rgba(139,92,246,0.8)] border-violet-500/80"
                              : item.value === "solar-glow"
                              ? "shadow-[0_0_12px_rgba(245,158,11,0.8)] border-amber-500/80"
                              : item.value === "lunar-glow"
                              ? "shadow-[0_0_12px_rgba(6,182,212,0.8)] border-cyan-500/80"
                              : item.value === "rainbow-glow"
                              ? "animate-pulse border-pink-500/80 shadow-[0_0_15px_rgba(236,72,153,0.8)]"
                              : item.value === "gold-master-glow"
                              ? "shadow-[0_0_12px_rgba(234,179,8,0.9)] border-yellow-400/90"
                              : item.value === "steel-frame"
                              ? "border-2 border-slate-400 shadow-[0_0_8px_rgba(148,163,184,0.4)]"
                              : item.value === "neon-glow"
                              ? "shadow-[0_0_12px_rgba(139,92,246,0.7)] border-violet-450/80 animate-pulse"
                              : item.value === "fire-glow"
                              ? "shadow-[0_0_12px_rgba(239,68,68,0.8)] border-red-500/80 animate-pulse"
                              : item.value === "void-glow"
                              ? "shadow-[0_0_12px_rgba(124,58,237,0.7)] border-indigo-500/80"
                              : item.value === "dragon-glow"
                              ? "shadow-[0_0_15px_rgba(234,179,8,0.9)] border-yellow-500/90"
                              : ""
                          }`}
                        >
                          W
                        </div>
                      </div>
                    </div>
                  )}

                  {item.type === "avatar" && (
                    <div className="flex items-center justify-center p-4">
                      <img
                        src={item.value || ""}
                        alt={item.name}
                        className="h-16 w-16 rounded-2xl bg-slate-900 border border-slate-800"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-orbitron font-extrabold text-xs text-slate-100 uppercase tracking-wider truncate">
                      {item.name}
                    </h3>
                    <span className={`text-[7px] font-orbitron uppercase tracking-widest px-2 py-0.5 rounded-full border shrink-0 ${rarityColors}`}>
                      {item.rarity}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-450 mt-1.5 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {item.quest && !unlocked && (
                  <div className="mt-3 p-3 bg-slate-950/50 rounded-lg border border-slate-900 space-y-2">
                    <span className="block text-[8px] font-orbitron font-extrabold text-slate-550 tracking-widest uppercase flex items-center gap-1">
                      <Flame className="h-3 w-3 text-amber-500" />
                      <span>{language === "fr" ? "DÉFI DE TITRE" : "TITLE CHALLENGE"}</span>
                    </span>
                    <p className="text-[10px] text-slate-350 leading-relaxed">
                      {language === "fr" ? item.quest.description : item.quest.descriptionEn}
                    </p>
                    
                    {(() => {
                      const progress = checkQuestProgress(item);
                      return (
                        <div className="space-y-1.5 pt-1">
                          <div className="flex items-center justify-between text-[9px] font-orbitron font-semibold">
                            <span className={progress.completed ? "text-emerald-400" : "text-slate-400"}>
                              {progress.text}
                            </span>
                            <span className="text-slate-550">{progress.percent}%</span>
                          </div>
                          <div className="w-full h-1 rounded-full bg-slate-900 overflow-hidden">
                            <div
                              className={`h-full transition-all duration-300 ${
                                progress.completed ? "bg-emerald-500" : "bg-violet-600"
                              }`}
                              style={{ width: `${progress.percent}%` }}
                            />
                          </div>
                          
                          {progress.completed && !hasDiscount && (item.id !== "title-denivele" && item.id !== "title-titan") && (
                            <Button
                              variant="primary"
                              size="sm"
                              className="w-full py-1 text-[9px] font-orbitron font-bold h-7 mt-1 cursor-pointer"
                              onClick={() => handleClaimQuestReward(item)}
                            >
                              🎉 {language === "fr" ? "Valider le Défi (-50%)" : "Claim Discount (-50%)"}
                            </Button>
                          )}

                          {progress.completed && (item.id === "title-denivele" || item.id === "title-titan") && (
                            <Button
                              variant="accent"
                              size="sm"
                              className="w-full py-1 text-[9px] font-orbitron font-bold h-7 mt-1 animate-pulse cursor-pointer"
                              onClick={() => handleClaimQuestReward(item)}
                            >
                              🎁 {language === "fr" ? "Débloquer Gratuitement" : "Claim for Free"}
                            </Button>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-slate-900/60 flex items-center justify-between">
                {unlocked ? (
                  <Button
                    variant={isEquipped ? "outline" : "primary"}
                    size="sm"
                    className="w-full text-xs py-2"
                    onClick={() => handleEquip(item)}
                  >
                    {isEquipped ? (
                      <span className="flex items-center justify-center gap-1.5 text-slate-400">
                        <Check className="h-3.5 w-3.5" />
                        {language === "fr" ? "Équipé" : "Equipped"}
                      </span>
                    ) : (
                      <span>{language === "fr" ? "Équiper" : "Equip"}</span>
                    )}
                  </Button>
                ) : (
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="flex items-center gap-1 font-orbitron font-bold text-amber-400 shrink-0">
                      {hasDiscount ? (
                        <div className="flex flex-col text-left">
                          <span className="text-[9px] text-slate-550 line-through leading-none">
                            {item.price}
                          </span>
                          <span className="text-xs text-emerald-400 flex items-center gap-0.5 leading-none mt-1">
                            <Coins className="h-3.5 w-3.5" />
                            <span>{price}</span>
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Coins className="h-4 w-4" />
                          <span className="text-sm">{item.price}</span>
                        </div>
                      )}
                    </div>

                    <Button
                      variant="accent"
                      size="sm"
                      className="flex-1 text-xs py-2"
                      disabled={profile ? profile.gold < price : true}
                      onClick={() => handlePurchase(item)}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <ShoppingBag className="h-3.5 w-3.5" />
                        {language === "fr" ? "Acheter" : "Buy"}
                      </span>
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
