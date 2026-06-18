// ============================================
// THE FITNESS REALM — Demo Data Store
// Provides realistic data when Supabase is not configured
// ============================================

import type { Profile, Workout, Territory, LeaderboardEntry, Faction, Tier, Department, City, Neighborhood } from '@/lib/types'

// Check if Supabase is configured with real credentials
export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('your-project') || url === 'https://your-project.supabase.co'
}

// --- Demo Profile ---
export const DEMO_USER_ID = 'demo-user-001'

export const demoProfile: Profile = {
  id: DEMO_USER_ID,
  username: 'ShadowBlade',
  avatar_url: null,
  level: 7,
  xp: 4250,
  gold: 1840,
  faction: 'Shadow Runners',
  strava_access_token: null,
  strava_refresh_token: null,
  strava_athlete_id: 'demo-strava-12345',
  strava_expires_at: null,
  created_at: '2025-03-15T10:00:00Z',
}

// --- Demo Workouts ---
export const demoWorkouts: Workout[] = [
  {
    id: 'w-001',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9001',
    name: 'Morning Shadow Sprint',
    activity_type: 'Run',
    distance: 8.5,
    elevation_gain: 120,
    avg_heartrate: 156,
    xp_gained: 1210,
    gold_gained: 132,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-17T06:30:00Z',
    processed_at: '2026-06-17T07:15:00Z',
    territory_id: 'IDF',
    summary_polyline: null,
    city_id: 'paris',
    neighborhood_id: 'le-marais',
    coordinates: [
      [48.8586, 2.3592],
      [48.8595, 2.3620],
      [48.8610, 2.3650],
      [48.8630, 2.3660],
      [48.8650, 2.3610],
      [48.8675, 2.3638],
      [48.8650, 2.3550],
      [48.8586, 2.3592]
    ]
  },
  {
    id: 'w-002',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9002',
    name: 'Twilight Road Raid',
    activity_type: 'Ride',
    distance: 42.3,
    elevation_gain: 580,
    avg_heartrate: 142,
    xp_gained: 5970,
    gold_gained: 600,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-16T17:00:00Z',
    processed_at: '2026-06-16T19:30:00Z',
    territory_id: 'IDF',
    summary_polyline: null,
    coordinates: [
      [48.8566, 2.3522],
      [48.8300, 2.3300],
      [48.8100, 2.3000],
      [48.7800, 2.2500],
      [48.8049, 2.1204]
    ]
  },
  {
    id: 'w-003',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9003',
    name: 'Dawn Forest Trek',
    activity_type: 'Hike',
    distance: 12.1,
    elevation_gain: 450,
    avg_heartrate: 128,
    xp_gained: 2560,
    gold_gained: 154,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-15T08:00:00Z',
    processed_at: '2026-06-15T12:00:00Z',
    territory_id: 'ARA',
    summary_polyline: null,
    coordinates: [
      [45.7640, 4.8357],
      [45.7610, 4.8250],
      [45.7500, 4.8100]
    ]
  },
  {
    id: 'w-004',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9004',
    name: 'Midnight Recovery Walk',
    activity_type: 'Walk',
    distance: 3.2,
    elevation_gain: 15,
    avg_heartrate: 98,
    xp_gained: 365,
    gold_gained: 31,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-14T21:00:00Z',
    processed_at: '2026-06-14T21:45:00Z',
    territory_id: 'IDF',
    summary_polyline: null
  },
  {
    id: 'w-005',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9005',
    name: 'Canyon Ascent Challenge',
    activity_type: 'Run',
    distance: 15.7,
    elevation_gain: 680,
    avg_heartrate: 168,
    xp_gained: 3610,
    gold_gained: 263,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-13T07:00:00Z',
    processed_at: '2026-06-13T09:00:00Z',
    territory_id: 'PAC',
    summary_polyline: null,
    city_id: 'marseille',
    neighborhood_id: 'vieux-port',
    coordinates: [
      [43.2952, 5.3739],
      [43.2982, 5.3678],
      [43.2969, 5.3615],
      [43.2941, 5.3582],
      [43.2915, 5.3650],
      [43.2925, 5.3725],
      [43.2952, 5.3739]
    ]
  },
  {
    id: 'w-006',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9006',
    name: 'Urban Exploration Ride',
    activity_type: 'Ride',
    distance: 28.4,
    elevation_gain: 210,
    avg_heartrate: 135,
    xp_gained: 3470,
    gold_gained: 383,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-12T16:30:00Z',
    processed_at: '2026-06-12T18:00:00Z',
    territory_id: 'NAQ',
    summary_polyline: null
  },
  {
    id: 'w-007',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9007',
    name: 'Storm Runner Session',
    activity_type: 'Run',
    distance: 5.0,
    elevation_gain: 45,
    avg_heartrate: 172,
    xp_gained: 635,
    gold_gained: 86,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-11T18:00:00Z',
    processed_at: '2026-06-11T18:30:00Z',
    territory_id: 'IDF',
    summary_polyline: null,
    city_id: 'paris',
    neighborhood_id: 'montmartre',
    coordinates: [
      [48.8867, 2.3431],
      [48.8895, 2.3480],
      [48.8910, 2.3325],
      [48.8837, 2.3275],
      [48.8822, 2.3372],
      [48.8867, 2.3431]
    ]
  },
  // --- USER WORKOUTS: Week 1 (Last week: June 4 to June 10, 2026) ---
  {
    id: 'w-011',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9011',
    name: 'Dawn Patrol Raid',
    activity_type: 'Run',
    distance: 9.8,
    elevation_gain: 110,
    avg_heartrate: 154,
    xp_gained: 1310,
    gold_gained: 150,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-10T07:00:00Z',
    processed_at: '2026-06-10T08:00:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
  {
    id: 'w-012',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9012',
    name: 'Twilight High Tour',
    activity_type: 'Ride',
    distance: 48.2,
    elevation_gain: 510,
    avg_heartrate: 140,
    xp_gained: 6350,
    gold_gained: 674,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-08T18:00:00Z',
    processed_at: '2026-06-08T20:30:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
  {
    id: 'w-013',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9013',
    name: 'Urban Wanderer Quest',
    activity_type: 'Walk',
    distance: 4.2,
    elevation_gain: 20,
    avg_heartrate: 94,
    xp_gained: 480,
    gold_gained: 39,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-05T10:00:00Z',
    processed_at: '2026-06-05T11:00:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
  // --- USER WORKOUTS: Week 2 (2 weeks ago: May 28 to June 3, 2026) ---
  {
    id: 'w-021',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9021',
    name: 'Forest Quest Run',
    activity_type: 'Run',
    distance: 11.5,
    elevation_gain: 180,
    avg_heartrate: 158,
    xp_gained: 1690,
    gold_gained: 181,
    anti_cheat_status: 'Verified',
    start_date: '2026-06-03T07:30:00Z',
    processed_at: '2026-06-03T08:45:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
  {
    id: 'w-022',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9022',
    name: 'Century Quest Prep Ride',
    activity_type: 'Ride',
    distance: 32.5,
    elevation_gain: 190,
    avg_heartrate: 136,
    xp_gained: 3820,
    gold_gained: 442,
    anti_cheat_status: 'Verified',
    start_date: '2026-05-31T09:00:00Z',
    processed_at: '2026-05-31T11:00:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
  {
    id: 'w-023',
    user_id: DEMO_USER_ID,
    strava_activity_id: 's-9023',
    name: 'Late Recovery Walk',
    activity_type: 'Walk',
    distance: 5.0,
    elevation_gain: 30,
    avg_heartrate: 96,
    xp_gained: 590,
    gold_gained: 48,
    anti_cheat_status: 'Verified',
    start_date: '2026-05-29T20:30:00Z',
    processed_at: '2026-05-29T21:30:00Z',
    territory_id: 'IDF',
    city_id: 'paris',
    summary_polyline: null,
  },
]

// --- Demo Territories (French Regions) ---
export const demoTerritories: Territory[] = [
  {
    id: 'IDF',
    name: 'Île-de-France',
    controlling_faction: 'Shadow Runners',
    controlling_user_id: DEMO_USER_ID,
    total_influence_points: 847,
  },
  {
    id: 'PAC',
    name: 'Provence-Alpes-Côte d\'Azur',
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-other-01',
    total_influence_points: 623,
  },
  {
    id: 'ARA',
    name: 'Auvergne-Rhône-Alpes',
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: 'user-other-02',
    total_influence_points: 1120,
  },
  {
    id: 'NAQ',
    name: 'Nouvelle-Aquitaine',
    controlling_faction: 'Shadow Runners',
    controlling_user_id: 'user-other-03',
    total_influence_points: 415,
  },
  {
    id: 'OCC',
    name: 'Occitanie',
    controlling_faction: 'Neutral',
    controlling_user_id: null,
    total_influence_points: 88,
  },
  {
    id: 'BRE',
    name: 'Bretagne',
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: 'user-other-04',
    total_influence_points: 390,
  },
  {
    id: 'NOR',
    name: 'Normandie',
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-other-05',
    total_influence_points: 275,
  },
  {
    id: 'HDF',
    name: 'Hauts-de-France',
    controlling_faction: 'Shadow Runners',
    controlling_user_id: DEMO_USER_ID,
    total_influence_points: 560,
  },
  {
    id: 'GES',
    name: 'Grand Est',
    controlling_faction: 'Neutral',
    controlling_user_id: null,
    total_influence_points: 42,
  },
  {
    id: 'PDL',
    name: 'Pays de la Loire',
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: 'user-other-06',
    total_influence_points: 310,
  },
  {
    id: 'BFC',
    name: 'Bourgogne-Franche-Comté',
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-other-07',
    total_influence_points: 198,
  },
  {
    id: 'CVL',
    name: 'Centre-Val de Loire',
    controlling_faction: 'Neutral',
    controlling_user_id: null,
    total_influence_points: 55,
  },
  {
    id: 'COR',
    name: 'Corse',
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-other-08',
    total_influence_points: 145,
  },
]

// User influence on territories
export const demoUserInfluence: Record<string, number> = {
  'IDF': 320,
  'HDF': 180,
  'PAC': 45,
  'ARA': 22,
  'NAQ': 95,
}

// --- Demo Leaderboard ---
export const demoLeaderboard: LeaderboardEntry[] = [
  {
    rank: 1,
    user_id: 'user-alpha',
    username: 'PhoenixRider',
    avatar_url: null,
    faction: 'Solar Cyclists',
    total_xp: 18420,
    tier: 'Diamond',
  },
  {
    rank: 2,
    user_id: 'user-beta',
    username: 'LunarStorm',
    avatar_url: null,
    faction: 'Lunar Walkers',
    total_xp: 15780,
    tier: 'Diamond',
  },
  {
    rank: 3,
    user_id: DEMO_USER_ID,
    username: 'ShadowBlade',
    avatar_url: null,
    faction: 'Shadow Runners',
    total_xp: 12850,
    tier: 'Gold',
  },
  {
    rank: 4,
    user_id: 'user-gamma',
    username: 'NightHawk',
    avatar_url: null,
    faction: 'Shadow Runners',
    total_xp: 9640,
    tier: 'Gold',
  },
  {
    rank: 5,
    user_id: 'user-delta',
    username: 'SunChaser',
    avatar_url: null,
    faction: 'Solar Cyclists',
    total_xp: 8210,
    tier: 'Silver',
  },
  {
    rank: 6,
    user_id: 'user-epsilon',
    username: 'MoonWarden',
    avatar_url: null,
    faction: 'Lunar Walkers',
    total_xp: 6550,
    tier: 'Silver',
  },
  {
    rank: 7,
    user_id: 'user-zeta',
    username: 'VoidSprinter',
    avatar_url: null,
    faction: 'Shadow Runners',
    total_xp: 4320,
    tier: 'Bronze',
  },
  {
    rank: 8,
    user_id: 'user-eta',
    username: 'SolarFlare',
    avatar_url: null,
    faction: 'Solar Cyclists',
    total_xp: 3100,
    tier: 'Bronze',
  },
  {
    rank: 9,
    user_id: 'user-theta',
    username: 'FrostRunner',
    avatar_url: null,
    faction: 'Lunar Walkers',
    total_xp: 2450,
    tier: 'Bronze',
  },
  {
    rank: 10,
    user_id: 'user-iota',
    username: 'BlazePath',
    avatar_url: null,
    faction: 'Solar Cyclists',
    total_xp: 1200,
    tier: 'Bronze',
  },
]

export const demoFactionMembers: Record<Faction, number> = {
  'Neutral': 1,
  'Shadow Runners': 12,
  'Solar Cyclists': 4,
  'Lunar Walkers': 8
};

export type DemoWeeklyRun = {
  regionId: string;
  faction: Faction;
  distance: number;
}

export const demoWeeklyRuns: DemoWeeklyRun[] = [
  // IDF: Shadow Runners (12 members) has 120km, Solar Cyclists (4 members) has 60km, Lunar Walkers (8 members) has 72km
  // Shadow Runners: 120 / 12 = 10 km/member
  // Solar Cyclists: 60 / 4 = 15 km/member  <-- WINS IDF!
  // Lunar Walkers: 72 / 8 = 9 km/member
  { regionId: 'IDF', faction: 'Shadow Runners', distance: 120 },
  { regionId: 'IDF', faction: 'Solar Cyclists', distance: 60 },
  { regionId: 'IDF', faction: 'Lunar Walkers', distance: 72 },

  // PAC: Shadow Runners has 24km, Solar Cyclists has 36km, Lunar Walkers has 40km
  // Shadow Runners: 24 / 12 = 2 km/member
  // Solar Cyclists: 36 / 4 = 9 km/member   <-- WINS PAC!
  // Lunar Walkers: 40 / 8 = 5 km/member
  { regionId: 'PAC', faction: 'Shadow Runners', distance: 24 },
  { regionId: 'PAC', faction: 'Solar Cyclists', distance: 36 },
  { regionId: 'PAC', faction: 'Lunar Walkers', distance: 40 },

  // ARA: Shadow Runners has 36km, Solar Cyclists has 8km, Lunar Walkers has 80km
  // Shadow Runners: 36 / 12 = 3 km/member
  // Solar Cyclists: 8 / 4 = 2 km/member
  // Lunar Walkers: 80 / 8 = 10 km/member  <-- WINS ARA!
  { regionId: 'ARA', faction: 'Shadow Runners', distance: 36 },
  { regionId: 'ARA', faction: 'Solar Cyclists', distance: 8 },
  { regionId: 'ARA', faction: 'Lunar Walkers', distance: 80 },

  // NAQ: Shadow Runners has 144km, Solar Cyclists has 12km, Lunar Walkers has 16km
  // Shadow Runners: 144 / 12 = 12 km/member <-- WINS NAQ!
  // Solar Cyclists: 12 / 4 = 3 km/member
  // Lunar Walkers: 16 / 8 = 2 km/member
  { regionId: 'NAQ', faction: 'Shadow Runners', distance: 144 },
  { regionId: 'NAQ', faction: 'Solar Cyclists', distance: 12 },
  { regionId: 'NAQ', faction: 'Lunar Walkers', distance: 16 },

  // BRE: Shadow Runners has 12km, Solar Cyclists has 28km, Lunar Walkers has 32km
  // Shadow Runners: 12 / 12 = 1 km/member
  // Solar Cyclists: 28 / 4 = 7 km/member   <-- WINS BRE!
  // Lunar Walkers: 32 / 8 = 4 km/member
  { regionId: 'BRE', faction: 'Shadow Runners', distance: 12 },
  { regionId: 'BRE', faction: 'Solar Cyclists', distance: 28 },
  { regionId: 'BRE', faction: 'Lunar Walkers', distance: 32 },

  // NOR: Shadow Runners has 60km, Solar Cyclists has 24km, Lunar Walkers has 16km
  // Shadow Runners: 60 / 12 = 5 km/member
  // Solar Cyclists: 24 / 4 = 6 km/member   <-- WINS NOR!
  // Lunar Walkers: 16 / 8 = 2 km/member
  { regionId: 'NOR', faction: 'Shadow Runners', distance: 60 },
  { regionId: 'NOR', faction: 'Solar Cyclists', distance: 24 },
  { regionId: 'NOR', faction: 'Lunar Walkers', distance: 16 },

  // HDF: Shadow Runners has 132km, Solar Cyclists has 16km, Lunar Walkers has 48km
  // Shadow Runners: 132 / 12 = 11 km/member <-- WINS HDF!
  // Solar Cyclists: 16 / 4 = 4 km/member
  // Lunar Walkers: 48 / 8 = 6 km/member
  { regionId: 'HDF', faction: 'Shadow Runners', distance: 132 },
  { regionId: 'HDF', faction: 'Solar Cyclists', distance: 16 },
  { regionId: 'HDF', faction: 'Lunar Walkers', distance: 48 },

  // PDL: Shadow Runners has 48km, Solar Cyclists has 20km, Lunar Walkers has 56km
  // Shadow Runners: 48 / 12 = 4 km/member
  // Solar Cyclists: 20 / 4 = 5 km/member
  // Lunar Walkers: 56 / 8 = 7 km/member   <-- WINS PDL!
  { regionId: 'PDL', faction: 'Shadow Runners', distance: 48 },
  { regionId: 'PDL', faction: 'Solar Cyclists', distance: 20 },
  { regionId: 'PDL', faction: 'Lunar Walkers', distance: 56 },

  // BFC: Shadow Runners has 24km, Solar Cyclists has 24km, Lunar Walkers has 24km
  // Shadow Runners: 24 / 12 = 2 km/member
  // Solar Cyclists: 24 / 4 = 6 km/member   <-- WINS BFC!
  // Lunar Walkers: 24 / 8 = 3 km/member
  { regionId: 'BFC', faction: 'Shadow Runners', distance: 24 },
  { regionId: 'BFC', faction: 'Solar Cyclists', distance: 24 },
  { regionId: 'BFC', faction: 'Lunar Walkers', distance: 24 },

  // COR: Shadow Runners has 12km, Solar Cyclists has 32km, Lunar Walkers has 8km
  // Shadow Runners: 12 / 12 = 1 km/member
  // Solar Cyclists: 32 / 4 = 8 km/member   <-- WINS COR!
  // Lunar Walkers: 8 / 8 = 1 km/member
  { regionId: 'COR', faction: 'Shadow Runners', distance: 12 },
  { regionId: 'COR', faction: 'Solar Cyclists', distance: 32 },
  { regionId: 'COR', faction: 'Lunar Walkers', distance: 8 }
];

export const demoDepartments: Department[] = [
  { id: '75', name: 'Paris', region_id: 'IDF', center: [48.8566, 2.3522], controlling_faction: 'Shadow Runners', total_influence_points: 340 },
  { id: '77', name: 'Seine-et-Marne', region_id: 'IDF', center: [48.5404, 2.6560], controlling_faction: 'Solar Cyclists', total_influence_points: 150 },
  { id: '78', name: 'Yvelines', region_id: 'IDF', center: [48.8049, 2.1204], controlling_faction: 'Lunar Walkers', total_influence_points: 210 },
  { id: '91', name: 'Essonne', region_id: 'IDF', center: [48.6298, 2.4418], controlling_faction: 'Shadow Runners', total_influence_points: 110 },
  { id: '92', name: 'Hauts-de-Seine', region_id: 'IDF', center: [48.8924, 2.2074], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  { id: '93', name: 'Seine-Saint-Denis', region_id: 'IDF', center: [48.9086, 2.4397], controlling_faction: 'Solar Cyclists', total_influence_points: 140 },
  { id: '94', name: 'Val-de-Marne', region_id: 'IDF', center: [48.7772, 2.4531], controlling_faction: 'Shadow Runners', total_influence_points: 95 },
  { id: '95', name: 'Val-d\'Oise', region_id: 'IDF', center: [49.0361, 2.0625], controlling_faction: 'Neutral', total_influence_points: 0 },
  
  { id: '13', name: 'Bouches-du-Rhône', region_id: 'PAC', center: [43.5263, 5.2192], controlling_faction: 'Solar Cyclists', total_influence_points: 420 },
  { id: '06', name: 'Alpes-Maritimes', region_id: 'PAC', center: [43.7013, 7.2681], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  
  { id: '69', name: 'Rhône', region_id: 'ARA', center: [45.7500, 4.8500], controlling_faction: 'Lunar Walkers', total_influence_points: 520 },
  { id: '38', name: 'Isère', region_id: 'ARA', center: [45.1667, 5.7167], controlling_faction: 'Shadow Runners', total_influence_points: 280 },
  
  { id: '33', name: 'Gironde', region_id: 'NAQ', center: [44.8378, -0.5792], controlling_faction: 'Shadow Runners', total_influence_points: 290 },
  { id: '35', name: 'Ille-et-Vilaine', region_id: 'BRE', center: [48.1173, -1.6778], controlling_faction: 'Lunar Walkers', total_influence_points: 220 },
  { id: '14', name: 'Calvados', region_id: 'NOR', center: [49.1828, -0.3707], controlling_faction: 'Solar Cyclists', total_influence_points: 160 },
  { id: '59', name: 'Nord', region_id: 'HDF', center: [50.6292, 3.0573], controlling_faction: 'Shadow Runners', total_influence_points: 380 },
  { id: '67', name: 'Bas-Rhin', region_id: 'GES', center: [48.5833, 7.7500], controlling_faction: 'Neutral', total_influence_points: 40 },
  { id: '44', name: 'Loire-Atlantique', region_id: 'PDL', center: [47.2183, -1.5536], controlling_faction: 'Lunar Walkers', total_influence_points: 190 },
  { id: '21', name: 'Côte-d\'Or', region_id: 'BFC', center: [47.3220, 5.0415], controlling_faction: 'Solar Cyclists', total_influence_points: 110 },
  { id: '45', name: 'Loiret', region_id: 'CVL', center: [47.9028, 1.9038], controlling_faction: 'Neutral', total_influence_points: 30 },
  { id: '2B', name: 'Haute-Corse', region_id: 'COR', center: [42.4500, 9.2833], controlling_faction: 'Solar Cyclists', total_influence_points: 90 },
  { id: '31', name: 'Haute-Garonne', region_id: 'OCC', center: [43.6047, 1.4442], controlling_faction: 'Neutral', total_influence_points: 50 }
];

export const demoCities: City[] = [
  // 75 - Paris (Paris)
  { id: 'paris', name: 'Paris Centre', department_id: '75', center: [48.8566, 2.3522], controlling_faction: 'Shadow Runners', total_influence_points: 340 },
  { id: 'paris-16', name: 'Paris 16e (Passy)', department_id: '75', center: [48.8637, 2.2769], controlling_faction: 'Solar Cyclists', total_influence_points: 150 },
  { id: 'paris-15', name: 'Paris 15e (Vaugirard)', department_id: '75', center: [48.8412, 2.2986], controlling_faction: 'Lunar Walkers', total_influence_points: 210 },
  { id: 'paris-18', name: 'Paris 18e (Montmartre)', department_id: '75', center: [48.8925, 2.3444], controlling_faction: 'Shadow Runners', total_influence_points: 180 },

  // 77 - Seine-et-Marne
  { id: 'melun', name: 'Melun', department_id: '77', center: [48.5404, 2.6560], controlling_faction: 'Solar Cyclists', total_influence_points: 150 },
  { id: 'meaux', name: 'Meaux', department_id: '77', center: [48.9608, 2.8883], controlling_faction: 'Neutral', total_influence_points: 30 },
  { id: 'chelles', name: 'Chelles', department_id: '77', center: [48.8797, 2.5972], controlling_faction: 'Lunar Walkers', total_influence_points: 90 },
  { id: 'pontault-combault', name: 'Pontault-Combault', department_id: '77', center: [48.7961, 2.6083], controlling_faction: 'Shadow Runners', total_influence_points: 80 },

  // 78 - Yvelines
  { id: 'versailles', name: 'Versailles', department_id: '78', center: [48.8049, 2.1204], controlling_faction: 'Lunar Walkers', total_influence_points: 210 },
  { id: 'sartrouville', name: 'Sartrouville', department_id: '78', center: [48.9400, 2.1600], controlling_faction: 'Solar Cyclists', total_influence_points: 40 },
  { id: 'saint-germain-en-laye', name: 'Saint-Germain-en-Laye', department_id: '78', center: [48.8989, 2.0938], controlling_faction: 'Shadow Runners', total_influence_points: 120 },
  { id: 'poissy', name: 'Poissy', department_id: '78', center: [48.9294, 2.0461], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 91 - Essonne
  { id: 'evry', name: 'Évry', department_id: '91', center: [48.6298, 2.4418], controlling_faction: 'Shadow Runners', total_influence_points: 110 },
  { id: 'corbeil-essonnes', name: 'Corbeil-Essonnes', department_id: '91', center: [48.6138, 2.4429], controlling_faction: 'Solar Cyclists', total_influence_points: 70 },
  { id: 'massy', name: 'Massy', department_id: '91', center: [48.7308, 2.2713], controlling_faction: 'Lunar Walkers', total_influence_points: 140 },
  { id: 'savigny-sur-orge', name: 'Savigny-sur-Orge', department_id: '91', center: [48.6796, 2.3517], controlling_faction: 'Neutral', total_influence_points: 10 },

  // 92 - Hauts-de-Seine
  { id: 'nanterre', name: 'Nanterre', department_id: '92', center: [48.8924, 2.2074], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  { id: 'boulogne-billancourt', name: 'Boulogne-Billancourt', department_id: '92', center: [48.8352, 2.2409], controlling_faction: 'Shadow Runners', total_influence_points: 250 },
  { id: 'courbevoie', name: 'Courbevoie', department_id: '92', center: [48.8967, 2.2561], controlling_faction: 'Solar Cyclists', total_influence_points: 190 },
  { id: 'colombes', name: 'Colombes', department_id: '92', center: [48.9227, 2.2543], controlling_faction: 'Lunar Walkers', total_influence_points: 80 },
  { id: 'asnieres-sur-seine', name: 'Asnières-sur-Seine', department_id: '92', center: [48.9106, 2.2892], controlling_faction: 'Shadow Runners', total_influence_points: 120 },
  { id: 'rueil-malmaison', name: 'Rueil-Malmaison', department_id: '92', center: [48.8776, 2.1802], controlling_faction: 'Neutral', total_influence_points: 0 },
  { id: 'malakoff', name: 'Malakoff', department_id: '92', center: [48.8167, 2.3000], controlling_faction: 'Shadow Runners', total_influence_points: 110 },

  // 93 - Seine-Saint-Denis
  { id: 'bobigny', name: 'Bobigny', department_id: '93', center: [48.9086, 2.4397], controlling_faction: 'Solar Cyclists', total_influence_points: 140 },
  { id: 'saint-denis', name: 'Saint-Denis', department_id: '93', center: [48.9362, 2.3574], controlling_faction: 'Shadow Runners', total_influence_points: 310 },
  { id: 'montreuil', name: 'Montreuil', department_id: '93', center: [48.8642, 2.4432], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  { id: 'aubervilliers', name: 'Aubervilliers', department_id: '93', center: [48.9142, 2.3822], controlling_faction: 'Solar Cyclists', total_influence_points: 50 },

  // 94 - Val-de-Marne
  { id: 'creteil', name: 'Créteil', department_id: '94', center: [48.7772, 2.4531], controlling_faction: 'Shadow Runners', total_influence_points: 95 },
  { id: 'vitry-sur-seine', name: 'Vitry-sur-Seine', department_id: '94', center: [48.7875, 2.3922], controlling_faction: 'Solar Cyclists', total_influence_points: 110 },
  { id: 'champigny-sur-marne', name: 'Champigny-sur-Marne', department_id: '94', center: [48.8164, 2.5117], controlling_faction: 'Lunar Walkers', total_influence_points: 130 },
  { id: 'saint-maur-des-fosses', name: 'Saint-Maur-des-Fossés', department_id: '94', center: [48.8025, 2.4853], controlling_faction: 'Neutral', total_influence_points: 20 },

  // 95 - Val-d'Oise
  { id: 'cergy', name: 'Cergy', department_id: '95', center: [49.0361, 2.0625], controlling_faction: 'Neutral', total_influence_points: 0 },
  { id: 'argenteuil', name: 'Argenteuil', department_id: '95', center: [48.9478, 2.2478], controlling_faction: 'Shadow Runners', total_influence_points: 190 },
  { id: 'sarcelles', name: 'Sarcelles', department_id: '95', center: [48.9958, 2.3803], controlling_faction: 'Lunar Walkers', total_influence_points: 80 },
  { id: 'pontoise', name: 'Pontoise', department_id: '95', center: [49.0508, 2.1014], controlling_faction: 'Solar Cyclists', total_influence_points: 75 },

  // 13 - Bouches-du-Rhône
  { id: 'marseille', name: 'Marseille', department_id: '13', center: [43.2965, 5.3698], controlling_faction: 'Solar Cyclists', total_influence_points: 310 },
  { id: 'aix', name: 'Aix-en-Provence', department_id: '13', center: [43.5297, 5.4474], controlling_faction: 'Shadow Runners', total_influence_points: 110 },
  { id: 'arles', name: 'Arles', department_id: '13', center: [43.6766, 4.6278], controlling_faction: 'Lunar Walkers', total_influence_points: 60 },
  { id: 'martigues', name: 'Martigues', department_id: '13', center: [43.4053, 5.0475], controlling_faction: 'Solar Cyclists', total_influence_points: 40 },

  // 06 - Alpes-Maritimes
  { id: 'nice', name: 'Nice', department_id: '06', center: [43.7013, 7.2681], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  { id: 'cannes', name: 'Cannes', department_id: '06', center: [43.5513, 6.9928], controlling_faction: 'Solar Cyclists', total_influence_points: 120 },
  { id: 'antibes', name: 'Antibes', department_id: '06', center: [43.5808, 7.1239], controlling_faction: 'Shadow Runners', total_influence_points: 90 },
  { id: 'grasse', name: 'Grasse', department_id: '06', center: [43.6589, 6.9261], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 69 - Rhône
  { id: 'lyon', name: 'Lyon', department_id: '69', center: [45.7640, 4.8357], controlling_faction: 'Lunar Walkers', total_influence_points: 520 },
  { id: 'villeurbanne', name: 'Villeurbanne', department_id: '69', center: [45.7719, 4.8778], controlling_faction: 'Shadow Runners', total_influence_points: 190 },
  { id: 'venissieux', name: 'Vénissieux', department_id: '69', center: [45.6978, 4.8864], controlling_faction: 'Solar Cyclists', total_influence_points: 80 },
  { id: 'saint-priest', name: 'Saint-Priest', department_id: '69', center: [45.6972, 4.9450], controlling_faction: 'Neutral', total_influence_points: 20 },

  // 38 - Isère
  { id: 'grenoble', name: 'Grenoble', department_id: '38', center: [45.1885, 5.7245], controlling_faction: 'Shadow Runners', total_influence_points: 280 },
  { id: 'saint-martin-d-heres', name: 'Saint-Martin-d\'Hères', department_id: '38', center: [45.1672, 5.7639], controlling_faction: 'Lunar Walkers', total_influence_points: 70 },
  { id: 'echirolles', name: 'Échirolles', department_id: '38', center: [45.1436, 5.7197], controlling_faction: 'Solar Cyclists', total_influence_points: 90 },
  { id: 'vienne', name: 'Vienne', department_id: '38', center: [45.5244, 4.8761], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 33 - Gironde
  { id: 'bordeaux', name: 'Bordeaux', department_id: '33', center: [44.8378, -0.5792], controlling_faction: 'Shadow Runners', total_influence_points: 290 },
  { id: 'merignac', name: 'Mérignac', department_id: '33', center: [44.8417, -0.6472], controlling_faction: 'Solar Cyclists', total_influence_points: 140 },
  { id: 'pessac', name: 'Pessac', department_id: '33', center: [44.8058, -0.6311], controlling_faction: 'Lunar Walkers', total_influence_points: 95 },
  { id: 'libourne', name: 'Libourne', department_id: '33', center: [44.9150, -0.2433], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 35 - Ille-et-Vilaine
  { id: 'rennes', name: 'Rennes', department_id: '35', center: [48.1173, -1.6778], controlling_faction: 'Lunar Walkers', total_influence_points: 220 },
  { id: 'saint-malo', name: 'Saint-Malo', department_id: '35', center: [48.6493, -2.0089], controlling_faction: 'Solar Cyclists', total_influence_points: 110 },
  { id: 'fougeres', name: 'Fougères', department_id: '35', center: [48.3522, -1.2033], controlling_faction: 'Shadow Runners', total_influence_points: 75 },
  { id: 'vitre', name: 'Vitré', department_id: '35', center: [48.1242, -1.2100], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 14 - Calvados
  { id: 'caen', name: 'Caen', department_id: '14', center: [49.1828, -0.3707], controlling_faction: 'Solar Cyclists', total_influence_points: 160 },
  { id: 'herouville-saint-clair', name: 'Hérouville-Saint-Clair', department_id: '14', center: [49.2036, -0.3256], controlling_faction: 'Shadow Runners', total_influence_points: 80 },
  { id: 'lisieux', name: 'Lisieux', department_id: '14', center: [49.1458, 0.2278], controlling_faction: 'Lunar Walkers', total_influence_points: 50 },
  { id: 'bayeux', name: 'Bayeux', department_id: '14', center: [49.2794, -0.7028], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 59 - Nord
  { id: 'lille', name: 'Lille', department_id: '59', center: [50.6292, 3.0573], controlling_faction: 'Shadow Runners', total_influence_points: 380 },
  { id: 'roubaix', name: 'Roubaix', department_id: '59', center: [50.7244, 3.1747], controlling_faction: 'Lunar Walkers', total_influence_points: 180 },
  { id: 'tourcoing', name: 'Tourcoing', department_id: '59', center: [50.7239, 3.1611], controlling_faction: 'Solar Cyclists', total_influence_points: 120 },
  { id: 'dunkerque', name: 'Dunkerque', department_id: '59', center: [51.0344, 2.3767], controlling_faction: 'Neutral', total_influence_points: 40 },

  // 67 - Bas-Rhin
  { id: 'strasbourg', name: 'Strasbourg', department_id: '67', center: [48.5734, 7.7521], controlling_faction: 'Neutral', total_influence_points: 40 },
  { id: 'haguenau', name: 'Haguenau', department_id: '67', center: [48.8167, 7.7833], controlling_faction: 'Solar Cyclists', total_influence_points: 60 },
  { id: 'schiltigheim', name: 'Schiltigheim', department_id: '67', center: [48.6083, 7.7500], controlling_faction: 'Shadow Runners', total_influence_points: 45 },
  { id: 'illkirch-graffenstaden', name: 'Illkirch-Graffenstaden', department_id: '67', center: [48.5286, 7.7125], controlling_faction: 'Lunar Walkers', total_influence_points: 35 },

  // 44 - Loire-Atlantique
  { id: 'nantes', name: 'Nantes', department_id: '44', center: [47.2184, -1.5536], controlling_faction: 'Lunar Walkers', total_influence_points: 190 },
  { id: 'saint-nazaire', name: 'Saint-Nazaire', department_id: '44', center: [47.2731, -2.2139], controlling_faction: 'Shadow Runners', total_influence_points: 110 },
  { id: 'saint-herblain', name: 'Saint-Herblain', department_id: '44', center: [47.2106, -1.6508], controlling_faction: 'Solar Cyclists', total_influence_points: 80 },
  { id: 'reze', name: 'Rezé', department_id: '44', center: [47.1917, -1.5714], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 21 - Côte-d'Or
  { id: 'dijon', name: 'Dijon', department_id: '21', center: [47.3220, 5.0415], controlling_faction: 'Solar Cyclists', total_influence_points: 110 },
  { id: 'beaune', name: 'Beaune', department_id: '21', center: [47.0253, 4.8392], controlling_faction: 'Shadow Runners', total_influence_points: 60 },
  { id: 'chenove', name: 'Chenôve', department_id: '21', center: [47.2917, 5.0139], controlling_faction: 'Lunar Walkers', total_influence_points: 50 },
  { id: 'talant', name: 'Talant', department_id: '21', center: [47.3364, 5.0083], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 45 - Loiret
  { id: 'orleans', name: 'Orléans', department_id: '45', center: [47.9029, 1.9093], controlling_faction: 'Neutral', total_influence_points: 30 },
  { id: 'fleury-les-aubrais', name: 'Fleury-les-Aubrais', department_id: '45', center: [47.9311, 1.9211], controlling_faction: 'Shadow Runners', total_influence_points: 70 },
  { id: 'olivet', name: 'Olivet', department_id: '45', center: [47.8631, 1.8983], controlling_faction: 'Lunar Walkers', total_influence_points: 40 },
  { id: 'saint-jean-de-braye', name: 'Saint-Jean-de-Braye', department_id: '45', center: [47.9125, 1.9708], controlling_faction: 'Solar Cyclists', total_influence_points: 50 },

  // 2B - Haute-Corse
  { id: 'bastia', name: 'Bastia', department_id: '2B', center: [42.6973, 9.4509], controlling_faction: 'Solar Cyclists', total_influence_points: 90 },
  { id: 'corte', name: 'Corte', department_id: '2B', center: [42.3061, 9.1517], controlling_faction: 'Shadow Runners', total_influence_points: 40 },
  { id: 'borgo', name: 'Borgo', department_id: '2B', center: [42.5956, 9.4267], controlling_faction: 'Lunar Walkers', total_influence_points: 30 },
  { id: 'biguglia', name: 'Biguglia', department_id: '2B', center: [42.6289, 9.4167], controlling_faction: 'Neutral', total_influence_points: 0 },

  // 31 - Haute-Garonne
  { id: 'toulouse', name: 'Toulouse', department_id: '31', center: [43.6047, 1.4442], controlling_faction: 'Neutral', total_influence_points: 50 },
  { id: 'colomiers', name: 'Colomiers', department_id: '31', center: [43.6139, 1.3361], controlling_faction: 'Shadow Runners', total_influence_points: 120 },
  { id: 'tournefeuille', name: 'Tournefeuille', department_id: '31', center: [43.5850, 1.3275], controlling_faction: 'Solar Cyclists', total_influence_points: 90 },
  { id: 'muret', name: 'Muret', department_id: '31', center: [43.4611, 1.3267], controlling_faction: 'Lunar Walkers', total_influence_points: 60 }
];

export const demoNeighborhoods: Neighborhood[] = [
  // Paris Neighborhoods
  {
    id: 'champs-elysees',
    name: 'Champs-Élysées',
    city_id: 'paris',
    center: [48.8698, 2.3075],
    radius: 1200,
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-alpha',
    total_influence_points: 150,
    passive_xp_rate: 15,
    user_influence: 20,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 40,
      'Solar Cyclists': 80,
      'Lunar Walkers': 30
    },
    polygon: [
      [48.8738, 2.2950], // Etoile
      [48.8755, 2.3020], // Bd Friedland
      [48.8725, 2.3150], // Bd Haussmann
      [48.8656, 2.3215], // Concorde
      [48.8625, 2.3180], // Seine
      [48.8633, 2.3015], // Seine / Alma
      [48.8680, 2.2970]  // Av Montaigne
    ]
  },
  {
    id: 'le-marais',
    name: 'Le Marais',
    city_id: 'paris',
    center: [48.8586, 2.3592],
    radius: 1000,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: DEMO_USER_ID,
    total_influence_points: 120,
    passive_xp_rate: 10,
    user_influence: 90,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 95,
      'Solar Cyclists': 15,
      'Lunar Walkers': 10
    },
    polygon: [
      [48.8640, 2.3575], // Temple / Bretagne
      [48.8626, 2.3667], // Bretagne / Beaumarchais
      [48.8531, 2.3691], // Bastille
      [48.8528, 2.3545], // Renard / Rivoli / Hôtel de Ville
      [48.8582, 2.3530]  // Temple / Rambuteau
    ]
  },
  {
    id: 'montmartre',
    name: 'Montmartre',
    city_id: 'paris',
    center: [48.8867, 2.3431],
    radius: 900,
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: 'user-beta',
    total_influence_points: 70,
    passive_xp_rate: 12,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 15,
      'Solar Cyclists': 5,
      'Lunar Walkers': 50
    },
    polygon: [
      [48.8837, 2.3275], // Place de Clichy
      [48.8910, 2.3325], // Caulaincourt / Marcadet
      [48.8895, 2.3480], // Barbès / Marcadet
      [48.8828, 2.3444], // Anvers
      [48.8822, 2.3372]  // Pigalle
    ]
  },

  // Melun Neighborhoods
  {
    id: 'melun-centre',
    name: 'Melun Centre',
    city_id: 'melun',
    center: [48.5404, 2.6560],
    radius: 1000,
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: null,
    total_influence_points: 95,
    passive_xp_rate: 8,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 25,
      'Solar Cyclists': 60,
      'Lunar Walkers': 10
    },
    polygon: [
      [48.5450, 2.6500],
      [48.5460, 2.6620],
      [48.5360, 2.6640],
      [48.5350, 2.6520]
    ]
  },
  {
    id: 'melun-nord',
    name: 'Melun Nord',
    city_id: 'melun',
    center: [48.5550, 2.6650],
    radius: 1200,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: null,
    total_influence_points: 80,
    passive_xp_rate: 6,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 55,
      'Solar Cyclists': 15,
      'Lunar Walkers': 10
    },
    polygon: [
      [48.5600, 2.6600],
      [48.5610, 2.6720],
      [48.5510, 2.6740],
      [48.5500, 2.6620]
    ]
  },

  // Versailles Neighborhoods
  {
    id: 'chateau-versailles',
    name: 'Château Versailles',
    city_id: 'versailles',
    center: [48.8049, 2.1204],
    radius: 1300,
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: null,
    total_influence_points: 170,
    passive_xp_rate: 14,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 30,
      'Solar Cyclists': 40,
      'Lunar Walkers': 100
    },
    polygon: [
      [48.8120, 2.1150],
      [48.8130, 2.1280],
      [48.8030, 2.1300],
      [48.8020, 2.1170]
    ]
  },
  {
    id: 'porchefontaine',
    name: 'Porchefontaine',
    city_id: 'versailles',
    center: [48.7960, 2.1490],
    radius: 1000,
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: null,
    total_influence_points: 120,
    passive_xp_rate: 10,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 20,
      'Solar Cyclists': 80,
      'Lunar Walkers': 20
    },
    polygon: [
      [48.7990, 2.1420],
      [48.8000, 2.1550],
      [48.7900, 2.1570],
      [48.7890, 2.1440]
    ]
  },

  // Évry Neighborhood
  {
    id: 'evry-courcouronnes',
    name: 'Évry Courcouronnes',
    city_id: 'evry',
    center: [48.6298, 2.4418],
    radius: 1200,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: null,
    total_influence_points: 80,
    passive_xp_rate: 8,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 50,
      'Solar Cyclists': 20,
      'Lunar Walkers': 10
    },
    polygon: [
      [48.6350, 2.4350],
      [48.6360, 2.4500],
      [48.6250, 2.4520],
      [48.6240, 2.4370]
    ]
  },

  // Nanterre Neighborhood
  {
    id: 'nanterre-prefecture',
    name: 'Nanterre Préfecture',
    city_id: 'nanterre',
    center: [48.8924, 2.2074],
    radius: 1100,
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: null,
    total_influence_points: 90,
    passive_xp_rate: 10,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 20,
      'Solar Cyclists': 20,
      'Lunar Walkers': 50
    },
    polygon: [
      [48.8970, 2.2000],
      [48.8980, 2.2150],
      [48.8870, 2.2180],
      [48.8860, 2.2020]
    ]
  },

  // Bobigny Neighborhood
  {
    id: 'bobigny-centre',
    name: 'Bobigny Centre',
    city_id: 'bobigny',
    center: [48.9086, 2.4397],
    radius: 1000,
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: null,
    total_influence_points: 70,
    passive_xp_rate: 6,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 15,
      'Solar Cyclists': 45,
      'Lunar Walkers': 10
    },
    polygon: [
      [48.9130, 2.4300],
      [48.9140, 2.4480],
      [48.9030, 2.4500],
      [48.9020, 2.4320]
    ]
  },

  // Créteil Neighborhood
  {
    id: 'creteil-lac',
    name: 'Créteil Lac',
    city_id: 'creteil',
    center: [48.7772, 2.4531],
    radius: 1200,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: null,
    total_influence_points: 110,
    passive_xp_rate: 12,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 70,
      'Solar Cyclists': 20,
      'Lunar Walkers': 20
    },
    polygon: [
      [48.7820, 2.4450],
      [48.7830, 2.4600],
      [48.7720, 2.4620],
      [48.7710, 2.4470]
    ]
  },

  // Cergy Neighborhood
  {
    id: 'cergy-prefecture',
    name: 'Cergy Préfecture',
    city_id: 'cergy',
    center: [49.0361, 2.0625],
    radius: 1300,
    controlling_faction: 'Neutral',
    controlling_user_id: null,
    total_influence_points: 0,
    passive_xp_rate: 6,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 0,
      'Solar Cyclists': 0,
      'Lunar Walkers': 0
    },
    polygon: [
      [49.0410, 2.0550],
      [49.0420, 2.0700],
      [49.0310, 2.0720],
      [49.0300, 2.0570]
    ]
  },

  // Lyon Neighborhoods
  {
    id: 'vieux-lyon',
    name: 'Vieux Lyon',
    city_id: 'lyon',
    center: [45.7623, 4.8273],
    radius: 800,
    controlling_faction: 'Lunar Walkers',
    controlling_user_id: 'user-epsilon',
    total_influence_points: 210,
    passive_xp_rate: 8,
    user_influence: 15,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 30,
      'Solar Cyclists': 20,
      'Lunar Walkers': 160
    },
    polygon: [
      [45.7663, 4.8275],
      [45.7602, 4.8278],
      [45.7565, 4.8255],
      [45.7622, 4.8222]
    ]
  },
  {
    id: 'la-part-dieu',
    name: 'La Part-Dieu',
    city_id: 'lyon',
    center: [45.7606, 4.8596],
    radius: 1100,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: DEMO_USER_ID,
    total_influence_points: 310,
    passive_xp_rate: 14,
    user_influence: 230,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 250,
      'Solar Cyclists': 40,
      'Lunar Walkers': 20
    },
    polygon: [
      [45.7640, 4.8520],
      [45.7630, 4.8680],
      [45.7550, 4.8660],
      [45.7560, 4.8500]
    ]
  },

  // Marseille Neighborhoods
  {
    id: 'vieux-port',
    name: 'Le Vieux-Port',
    city_id: 'marseille',
    center: [43.2952, 5.3739],
    radius: 1000,
    controlling_faction: 'Solar Cyclists',
    controlling_user_id: 'user-delta',
    total_influence_points: 180,
    passive_xp_rate: 12,
    user_influence: 10,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 40,
      'Solar Cyclists': 110,
      'Lunar Walkers': 30
    },
    polygon: [
      [43.2969, 5.3615],
      [43.2953, 5.3695],
      [43.2925, 5.3725],
      [43.2941, 5.3582]
    ]
  },
  {
    id: 'le-panier',
    name: 'Le Panier',
    city_id: 'marseille',
    center: [43.2982, 5.3678],
    radius: 700,
    controlling_faction: 'Shadow Runners',
    controlling_user_id: 'user-zeta',
    total_influence_points: 130,
    passive_xp_rate: 6,
    user_influence: 0,
    faction_influence: {
      'Neutral': 0,
      'Shadow Runners': 85,
      'Solar Cyclists': 20,
      'Lunar Walkers': 25
    },
    polygon: [
      [43.2982, 5.3678],
      [43.3030, 5.3660],
      [43.3010, 5.3730],
      [43.2970, 5.3720]
    ]
  }
];

// Generate simulated runners and workouts for all regions over 3 weeks
export const simulatedAthletes: {
  id: string;
  username: string;
  faction: Faction;
  city?: string;
  age?: number;
  level?: number;
  primarySport?: 'Run' | 'Ride' | 'Walk';
}[] = [];

export const simulatedWorkouts: Workout[] = [];

// Helper to get simulated ISO date string for a given weekOffset (0-2) and dayOffset (0-6)
export function getSimulatedDate(weekOffset: number, dayOffset: number): string {
  const refDate = new Date("2026-06-17T12:00:00Z");
  const daysToSubtract = (weekOffset * 7) + (6 - dayOffset);
  refDate.setDate(refDate.getDate() - daysToSubtract);
  return refDate.toISOString();
}

const firstNames = [
  "Antoine", "Sarah", "Lucas", "Emma", "Thomas", "Chloé", "Hugo", "Léa", "Maxime", "Inès",
  "Nathan", "Manon", "Enzo", "Camille", "Louis", "Arthur", "Jade", "Raphaël", "Alice", "Léo",
  "Lina", "Gabriel", "Mila", "Mathis", "Zoé", "Paul", "Juliette", "Clement", "Louise", "Theo",
  "Mathilde", "Julien", "Romain", "Clara", "Alexandre", "Valentin", "Nicolas", "Audrey"
];

const titles = [
  "Runner", "Racer", "Walker", "Stryder", "Shadow", "Sol", "Luna", "Knight", "Hunter", "Ghost",
  "Rider", "Hiker", "Zenith", "Apex", "Vagabond", "Nomad", "Vanguard", "Saber", "Rebel", "Phantom",
  "Pioneer", "Striker", "Storm", "Ranger", "Glider", "Scout", "Keeper", "Sentinel", "Pathfinder"
];

const factionsList: Faction[] = ["Shadow Runners", "Solar Cyclists", "Lunar Walkers"];

// Configure number of simulated athletes per region to keep it non-iso
const regionAthletesConfig: Record<string, number> = {
  IDF: 120, // Île-de-France
  ARA: 60,  // Auvergne-Rhône-Alpes
  PAC: 60,  // Provence-Alpes-Côte d'Azur
  NAQ: 40,  // Nouvelle-Aquitaine
  OCC: 40,  // Occitanie
  BRE: 30,  // Bretagne
  HDF: 40,  // Hauts-de-France
  NOR: 25,  // Normandie
  GES: 25,  // Grand Est
  PDL: 30,  // Pays de la Loire
  BFC: 20,  // Bourgogne-Franche-Comté
  CVL: 15,  // Centre-Val de Loire
  COR: 12   // Corse
};

// Generate simulated data programmatically
let athleteCounter = 1;
let workoutCounter = 1;

Object.entries(regionAthletesConfig).forEach(([regionId, count]) => {
  // Find all departments for this region
  const deptIds = demoDepartments.filter(d => d.region_id === regionId).map(d => d.id);
  // Find all cities in these departments
  const regionCities = demoCities.filter(c => deptIds.includes(c.department_id));
  const fallbackCity = regionCities[0] || demoCities[0];

  for (let i = 0; i < count; i++) {
    const city = regionCities[i % regionCities.length] || fallbackCity;
    const charCodeSum = city.id.split('').reduce((sum, c) => sum + c.charCodeAt(0), 0);
    const firstName = firstNames[(i + charCodeSum) % firstNames.length];
    const title = titles[(i * 3 + charCodeSum) % titles.length];
    const username = `${firstName}_${title}_${10 + (i * 7) % 90}`;
    const faction = factionsList[(i + charCodeSum) % factionsList.length];

    // Align primary sport with faction theme
    const primarySport: 'Run' | 'Ride' | 'Walk' =
      faction === "Shadow Runners" ? "Run" :
      faction === "Solar Cyclists" ? "Ride" :
      "Walk";

    const athleteId = `sim-athlete-${athleteCounter++}`;
    simulatedAthletes.push({
      id: athleteId,
      username,
      faction,
      city: city.name,
      age: 18 + ((i * 13 + charCodeSum) % 45),
      level: 1 + ((i * 3 + charCodeSum) % 20),
      primarySport
    });

    // Generate workouts for 3 weeks (weekOffset 0, 1, 2)
    for (let weekOffset = 0; weekOffset < 3; weekOffset++) {
      // Determine number of workouts this week (e.g. 1 to 4)
      const numWorkouts = 1 + ((i + weekOffset) % 3);

      for (let w = 0; w < numWorkouts; w++) {
        const dayOffset = (i * 2 + weekOffset + w) % 7; // day of the week (0 to 6)
        const workoutId = `sim-w-${workoutCounter++}`;

        let distance = 0;
        let activityType: 'Run' | 'Ride' | 'Walk' | 'Hike' = 'Run';
        let name = "";

        if (primarySport === 'Run') {
          activityType = 'Run';
          distance = 4.0 + ((i + w) % 5) * 2.5 + (dayOffset * 0.8); // 4km to 19.8km
          const names = ["Morning Shadow Sprint", "Solar Interval", "Lunar Jog", "Dawn Speedrun", "Twilight Run"];
          name = names[(i + w) % names.length];
        } else if (primarySport === 'Ride') {
          activityType = 'Ride';
          distance = 15.0 + ((i + w) % 6) * 12.0 + (dayOffset * 2.5); // 15km to 90km
          const names = ["Century Raid", "Solar Tour", "Aerodynamic Cruise", "Lunar Mountain Ride", "Twilight Spin"];
          name = names[(i + w) % names.length];
        } else {
          activityType = ((i + w) % 2 === 0) ? 'Walk' : 'Hike';
          distance = 3.0 + ((i + w) % 4) * 2.2 + (dayOffset * 0.5); // 3km to 12.8km
          const names = ["Forest Expedition", "Valley Nature Quest", "Midnight Walk", "Peak Ascent Trail", "Zen Wander"];
          name = names[(i + w) % names.length];
        }

        distance = Math.round(distance * 10) / 10;
        const elevation = Math.round(distance * (5 + (i % 25))); // randomized elevation
        const hr = primarySport === 'Walk' ? (80 + (i % 25)) : (130 + (i % 35)); // randomized heart rate

        // XP & Gold Formulas
        const xp = Math.round((distance * 100) + (elevation * 3));
        const goldMultiplier = hr / 100;
        const gold = Math.floor(distance * 10 * goldMultiplier);

        const dateStr = getSimulatedDate(weekOffset, dayOffset);

        // Center coordinates near city center
        const center = city.center || [48.8566, 2.3522];
        const latShift = ((i % 7) - 3) * 0.00018 + ((w * 5) - 5) * 0.00012;
        const lngShift = ((i % 5) - 2) * 0.00022 + ((w * 3) - 3) * 0.00015;
        const workoutCoords: [number, number][] = [
          [center[0] + latShift, center[1] + lngShift],
          [center[0] + latShift + 0.003, center[1] + lngShift + 0.003],
          [center[0] + latShift + 0.001, center[1] + lngShift + 0.005],
          [center[0] + latShift, center[1] + lngShift]
        ];

        simulatedWorkouts.push({
          id: workoutId,
          user_id: athleteId,
          strava_activity_id: `sim-strava-${workoutId}`,
          name: `${name} (${city.name})`,
          activity_type: activityType,
          distance,
          elevation_gain: elevation,
          avg_heartrate: hr,
          xp_gained: xp,
          gold_gained: gold,
          anti_cheat_status: "Verified",
          start_date: dateStr,
          processed_at: dateStr,
          territory_id: regionId,
          city_id: city.id,
          summary_polyline: null,
          coordinates: workoutCoords
        });
      }
    }
  }
});



