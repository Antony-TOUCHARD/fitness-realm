-- ============================================
-- THE FITNESS REALM — Database Schema
-- Supabase PostgreSQL with Row Level Security
-- ============================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================
-- 1. PROFILES TABLE (Linked to Supabase Auth)
-- ============================================
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  avatar_url TEXT,
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  gold INTEGER DEFAULT 100,
  faction TEXT DEFAULT 'Neutral' CHECK (faction IN ('Neutral', 'Shadow Runners', 'Solar Cyclists', 'Lunar Walkers')),
  strava_access_token TEXT,
  strava_refresh_token TEXT,
  strava_athlete_id TEXT,
  strava_expires_at INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- RLS: Users can read all profiles, but only update their own
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. WORKOUTS TABLE
-- ============================================
CREATE TABLE public.workouts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  strava_activity_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  activity_type TEXT NOT NULL CHECK (activity_type IN ('Run', 'Ride', 'Walk', 'Hike', 'Swim')),
  distance NUMERIC NOT NULL,          -- in km
  elevation_gain NUMERIC NOT NULL,    -- in meters
  avg_heartrate NUMERIC,              -- in bpm (nullable)
  xp_gained INTEGER NOT NULL,
  gold_gained INTEGER NOT NULL,
  anti_cheat_status TEXT DEFAULT 'Verified' CHECK (anti_cheat_status IN ('Verified', 'Flagged')) NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  territory_id TEXT REFERENCES public.territories(id),
  summary_polyline TEXT
);

-- RLS: Users can read all workouts, but only insert/update their own
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Workouts are viewable by everyone"
  ON public.workouts FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own workouts"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own workouts"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TERRITORIES TABLE
-- ============================================
CREATE TABLE public.territories (
  id TEXT PRIMARY KEY,                    -- e.g., "IDF", "PACA", "ARA"
  name TEXT NOT NULL,
  controlling_faction TEXT DEFAULT 'Neutral',
  controlling_user_id UUID REFERENCES public.profiles(id),
  total_influence_points NUMERIC DEFAULT 0
);

-- RLS: Everyone can read, only service role can update
ALTER TABLE public.territories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Territories are viewable by everyone"
  ON public.territories FOR SELECT
  USING (true);

-- ============================================
-- 4. TERRITORY INFLUENCE TABLE
-- ============================================
CREATE TABLE public.territory_influence (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  territory_id TEXT REFERENCES public.territories(id) ON DELETE CASCADE,
  influence_points NUMERIC DEFAULT 0,
  PRIMARY KEY (user_id, territory_id)
);

-- RLS: Everyone can read, users can manage their own
ALTER TABLE public.territory_influence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Territory influence is viewable by everyone"
  ON public.territory_influence FOR SELECT
  USING (true);

CREATE POLICY "Users can insert their own influence"
  ON public.territory_influence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own influence"
  ON public.territory_influence FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- 5. SEED DATA — French Regions as Territories
-- ============================================
INSERT INTO public.territories (id, name) VALUES
  ('IDF', 'Île-de-France'),
  ('ARA', 'Auvergne-Rhône-Alpes'),
  ('NAQ', 'Nouvelle-Aquitaine'),
  ('OCC', 'Occitanie'),
  ('PAC', 'Provence-Alpes-Côte d''Azur'),
  ('PDL', 'Pays de la Loire'),
  ('BRE', 'Bretagne'),
  ('NOR', 'Normandie'),
  ('HDF', 'Hauts-de-France'),
  ('GES', 'Grand Est'),
  ('BFC', 'Bourgogne-Franche-Comté'),
  ('CVL', 'Centre-Val de Loire'),
  ('COR', 'Corse')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. HELPER FUNCTION — Auto-create profile on signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'username', 'Adventurer_' || LEFT(NEW.id::text, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: auto-create profile when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 7. INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_workouts_user_id ON public.workouts(user_id);
CREATE INDEX IF NOT EXISTS idx_workouts_processed_at ON public.workouts(processed_at);
CREATE INDEX IF NOT EXISTS idx_territory_influence_territory ON public.territory_influence(territory_id);

-- ============================================
-- 8. MIGRATION FOR EXTRA FIELDS (City & Age)
-- Run this block in the Supabase SQL editor if your table is already created
-- ============================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS city TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS age INTEGER;
