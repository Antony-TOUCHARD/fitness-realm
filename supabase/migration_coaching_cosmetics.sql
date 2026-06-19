-- ============================================
-- THE FITNESS REALM — Database Schema Migration
-- Run this script in your Supabase SQL Editor.
-- ============================================

-- 1. Add missing columns to workouts table if not present
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS summary_polyline TEXT;
ALTER TABLE public.workouts ADD COLUMN IF NOT EXISTS duration INTEGER;

-- 2. Create coaching_programs table
CREATE TABLE IF NOT EXISTS public.coaching_programs (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  sport TEXT NOT NULL,
  plan_type TEXT NOT NULL,
  current_week_index INTEGER DEFAULT 0,
  target_paces JSONB NOT NULL,
  weeks_data JSONB NOT NULL,
  claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.coaching_programs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own coaching program" ON public.coaching_programs;
DROP POLICY IF EXISTS "Users can insert their own coaching program" ON public.coaching_programs;
DROP POLICY IF EXISTS "Users can update their own coaching program" ON public.coaching_programs;
DROP POLICY IF EXISTS "Users can delete their own coaching program" ON public.coaching_programs;

-- Recreate policies
CREATE POLICY "Users can view their own coaching program"
  ON public.coaching_programs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own coaching program"
  ON public.coaching_programs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own coaching program"
  ON public.coaching_programs FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own coaching program"
  ON public.coaching_programs FOR DELETE
  USING (auth.uid() = user_id);

-- 3. Create unlocked_cosmetics table
CREATE TABLE IF NOT EXISTS public.unlocked_cosmetics (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  equipped BOOLEAN DEFAULT false,
  PRIMARY KEY (user_id, item_id)
);

-- Enable RLS
ALTER TABLE public.unlocked_cosmetics ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own unlocked cosmetics" ON public.unlocked_cosmetics;
DROP POLICY IF EXISTS "Users can insert their own unlocked cosmetics" ON public.unlocked_cosmetics;
DROP POLICY IF EXISTS "Users can update their own unlocked cosmetics" ON public.unlocked_cosmetics;

-- Recreate policies
CREATE POLICY "Users can view their own unlocked cosmetics"
  ON public.unlocked_cosmetics FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own unlocked cosmetics"
  ON public.unlocked_cosmetics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own unlocked cosmetics"
  ON public.unlocked_cosmetics FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 4. Create active_boosts table
CREATE TABLE IF NOT EXISTS public.active_boosts (
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE PRIMARY KEY,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL
);

-- Enable RLS
ALTER TABLE public.active_boosts ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view their own active boosts" ON public.active_boosts;
DROP POLICY IF EXISTS "Users can insert/update their own active boosts" ON public.active_boosts;
DROP POLICY IF EXISTS "Users can update their own active boosts" ON public.active_boosts;

-- Recreate policies
CREATE POLICY "Users can view their own active boosts"
  ON public.active_boosts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert/update their own active boosts"
  ON public.active_boosts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own active boosts"
  ON public.active_boosts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 5. Create high-performance aggregation function for home page stats
CREATE OR REPLACE FUNCTION public.get_global_stats()
RETURNS TABLE (
  active_heroes BIGINT,
  xp_earned NUMERIC,
  km_traveled NUMERIC,
  territories_held BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM public.profiles) AS active_heroes,
    COALESCE((SELECT SUM(xp_gained) FROM public.workouts), 0)::NUMERIC AS xp_earned,
    COALESCE((SELECT SUM(distance) FROM public.workouts), 0)::NUMERIC AS km_traveled,
    (SELECT COUNT(*) FROM public.territories WHERE controlling_faction != 'Neutral') AS territories_held;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
