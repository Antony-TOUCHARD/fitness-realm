// ============================================
// THE FITNESS REALM — TypeScript Types
// Matches the Supabase SQL schema exactly
// ============================================

// --- Enums & Literals ---

export type Faction =
  | 'Neutral'
  | 'Shadow Runners'
  | 'Solar Cyclists'
  | 'Lunar Walkers'

export type ActivityType = 'Run' | 'Ride' | 'Walk' | 'Hike' | 'Swim'

export type Tier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond'

// --- Database Row Types ---

/** Matches `public.profiles` table */
export type Profile = {
  id: string
  username: string
  avatar_url: string | null
  level: number
  xp: number
  gold: number
  faction: Faction
  strava_access_token: string | null
  strava_refresh_token: string | null
  strava_athlete_id: string | null
  strava_expires_at: number | null
  created_at: string
  city?: string | null
  age?: number | null
}

/** Matches `public.workouts` table */
export type Workout = {
  id: string
  user_id: string
  strava_activity_id: string
  name: string
  activity_type: ActivityType
  distance: number
  elevation_gain: number
  avg_heartrate: number | null
  xp_gained: number
  gold_gained: number
  anti_cheat_status: "Verified" | "Flagged"
  start_date: string
  processed_at: string
  territory_id: string | null
  summary_polyline: string | null
  coordinates?: [number, number][]
  city_id?: string
  neighborhood_id?: string
}

/** Matches `public.territories` table */
export type Territory = {
  id: string
  name: string
  controlling_faction: Faction
  controlling_user_id: string | null
  total_influence_points: number
}

/** Matches `public.territory_influence` table (composite PK) */
export type TerritoryInfluence = {
  user_id: string
  territory_id: string
  influence_points: number
}

// --- Application Types ---

export type LeaderboardEntry = {
  rank: number
  user_id: string
  username: string
  avatar_url: string | null
  faction: Faction
  total_xp: number
  tier: Tier
}

export type RPGRewards = {
  xp: number
  gold: number
  leveledUp: boolean
  newLevel: number
}

/** Result from processLevelUp */
export type LevelUpResult = {
  newLevel: number
  remainingXP: number
  leveledUp: boolean
}

/** Validation result from anti-cheat */
export type ValidationResult = {
  valid: boolean
  reason: string
}

// --- Strava API Types ---

/** Raw activity from Strava REST API (fields we consume) */
export type StravaActivity = {
  id: number
  name: string
  type: string
  sport_type: string
  distance: number           // in meters
  moving_time: number        // in seconds
  elapsed_time: number       // in seconds
  total_elevation_gain: number // in meters
  start_date: string         // ISO 8601
  start_date_local: string   // ISO 8601
  start_latlng: [number, number] | null
  end_latlng: [number, number] | null
  average_heartrate: number | null
  max_heartrate: number | null
  average_speed: number      // in m/s
  max_speed: number          // in m/s
  map: {
    id: string
    summary_polyline: string | null
    resource_state: number
  }
}

/** Strava OAuth token response */
export type StravaTokenResponse = {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
  athlete: {
    id: number
    firstname: string
    lastname: string
    profile: string
  }
}

/** Strava refresh token response */
export type StravaRefreshResponse = {
  token_type: string
  expires_at: number
  expires_in: number
  refresh_token: string
  access_token: string
}

// --- Conquest Drill-Down Types ---

export type Department = {
  id: string
  name: string
  region_id: string
  center: [number, number]
  controlling_faction: Faction
  total_influence_points: number
}

export type City = {
  id: string
  name: string
  department_id: string
  center: [number, number]
  controlling_faction: Faction
  total_influence_points: number
}

export type Neighborhood = {
  id: string
  name: string
  city_id: string
  center: [number, number]
  radius: number // in meters
  controlling_faction: Faction
  controlling_user_id: string | null
  total_influence_points: number
  passive_xp_rate: number // XP/hour
  user_influence: number
  faction_influence: Record<Faction, number>
  polygon?: [number, number][]
}

// --- Coaching Types ---

export type CoachingAnswers = {
  sport: 'Run' | 'Ride' | 'Walk'
  planType: 'base' | '5k' | '10k' | 'half' | 'marathon' | 'trail'
  currentCapacity: '1km' | '5km' | '10km' | '20km+' | 'none'
  targetGoal: 'finish' | 'time_performance'
  frequency: number
  weeksCount: 4 | 8 | 12
}

export type PlannedWorkout = {
  id: string
  name: string
  type: 'Intervals' | 'Easy' | 'Long' | 'Tempo' | 'Recovery'
  description: string
  structure: string[]
  targetPace: string | null
  targetDistance: number | null
  targetDuration: number | null
  completed: boolean
  associatedWorkoutId: string | null
  paceAccuracy: number | null
  xpReward: number
  goldReward: number
}

export type CoachingWeek = {
  weekNumber: number
  workouts: PlannedWorkout[]
  status: 'pending' | 'completed' | 'partial' | 'failed'
  adaptationReport: string | null
}

export type CoachingProgram = {
  name: string
  sport: 'Run' | 'Ride' | 'Walk'
  planType: string
  currentWeekIndex: number
  targetPaces: {
    easy: string
    tempo: string
    intervals: string
  }
  weeks: CoachingWeek[]
  claimed: boolean
}


