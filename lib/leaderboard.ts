import { supabaseAdmin } from '@/lib/supabase/admin'
import type { LeaderboardEntry, Tier, Faction } from '@/lib/types'
import { simulatedAthletes, simulatedWorkouts } from '@/lib/demo-data'

// ============================================
// THE FITNESS REALM — Leaderboard Algorithm
// ============================================

/**
 * Get the next Sunday at midnight UTC (end of the current week).
 */
export function getWeekEndDate(): Date {
  const now = new Date()
  const dayOfWeek = now.getUTCDay() // 0 = Sunday
  const daysUntilSunday = dayOfWeek === 0 ? 7 : 7 - dayOfWeek
  const sunday = new Date(now)
  sunday.setUTCDate(now.getUTCDate() + daysUntilSunday)
  sunday.setUTCHours(0, 0, 0, 0)
  return sunday
}

/**
 * Assign tier based on percentile rank.
 *   Top 5%  → Diamond
 *   Top 20% → Gold
 *   Top 50% → Silver
 *   Rest    → Bronze
 */
export function getTier(rank: number, totalPlayers: number): Tier {
  if (totalPlayers === 0) return 'Bronze'

  const percentile = rank / totalPlayers

  if (percentile <= 0.05) return 'Diamond'
  if (percentile <= 0.20) return 'Gold'
  if (percentile <= 0.50) return 'Silver'
  return 'Bronze'
}

function getWorkoutWeekOffset(startDateStr: string): number {
  const refDate = new Date("2026-06-18T23:59:59Z")
  const startDate = new Date(startDateStr)
  const diffTime = refDate.getTime() - startDate.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  if (diffDays >= 0 && diffDays < 7) return 0
  if (diffDays >= 7 && diffDays < 14) return 1
  if (diffDays >= 14 && diffDays < 21) return 2
  return -1
}

/**
 * Query workouts from the last 7 days, rank users by total XP gained.
 * Mixes in simulated athletes to guarantee a populated competitive board.
 */
export async function getWeeklyLeaderboard(
  activityType?: 'Run' | 'Ride' | 'Walk',
  weekOffset: number = 0
): Promise<LeaderboardEntry[]> {
  const refDate = new Date()
  const start = new Date(refDate)
  start.setUTCDate(refDate.getUTCDate() - (weekOffset + 1) * 7)
  const end = new Date(refDate)
  end.setUTCDate(refDate.getUTCDate() - weekOffset * 7)

  let query = supabaseAdmin
    .from('workouts')
    .select('user_id, xp_gained')
    .gte('processed_at', start.toISOString())
    .lt('processed_at', end.toISOString())

  if (activityType) {
    if (activityType === 'Walk') {
      query = query.in('activity_type', ['Walk', 'Hike'])
    } else {
      query = query.eq('activity_type', activityType)
    }
  }

  // Fetch all workouts in the date range
  const { data: workouts, error: workoutsError } = await query

  if (workoutsError) {
    throw new Error(`Failed to fetch weekly workouts: ${workoutsError.message}`)
  }

  // Aggregate XP per user (combining DB + simulated)
  const xpByUser: Record<string, number> = {}
  
  if (workouts) {
    for (const w of workouts) {
      xpByUser[w.user_id] = (xpByUser[w.user_id] ?? 0) + w.xp_gained
    }
  }

  // Filter and aggregate simulated workouts matching parameters
  const filteredSim = simulatedWorkouts.filter((w) => {
    const offset = getWorkoutWeekOffset(w.start_date)
    if (offset !== weekOffset) return false

    if (activityType) {
      if (activityType === 'Walk') {
        return w.activity_type === 'Walk' || w.activity_type === 'Hike'
      } else {
        return w.activity_type === activityType
      }
    }
    return true
  })

  for (const w of filteredSim) {
    xpByUser[w.user_id] = (xpByUser[w.user_id] ?? 0) + w.xp_gained
  }

  // Sort users by total XP descending
  const sortedUserIds = Object.entries(xpByUser)
    .sort(([, a], [, b]) => b - a)
    .map(([userId]) => userId)

  const totalPlayers = sortedUserIds.length

  // Fetch profiles for all ranked real users
  const realUserIds = sortedUserIds.filter(id => !id.startsWith('sim-athlete-'))

  let profiles: any[] = []
  if (realUserIds.length > 0) {
    const { data, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, username, avatar_url, faction')
      .in('id', realUserIds)

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`)
    }
    if (data) {
      profiles = data
    }
  }

  const profileMap = new Map(
    profiles.map((p) => [p.id, p])
  )

  // Build leaderboard entries
  const leaderboard: LeaderboardEntry[] = sortedUserIds.map(
    (userId, index) => {
      const rank = index + 1
      let username = 'Unknown'
      let avatarUrl: string | null = null;
      let faction: Faction = 'Neutral'

      if (userId.startsWith('sim-athlete-')) {
        const athlete = simulatedAthletes.find((a) => a.id === userId)
        if (athlete) {
          username = athlete.username
          faction = athlete.faction
          avatarUrl = `https://api.dicebear.com/7.x/adventurer/svg?seed=${athlete.username}`
        }
      } else {
        const profile = profileMap.get(userId)
        if (profile) {
          username = profile.username ?? 'Unknown'
          avatarUrl = profile.avatar_url ?? null
          faction = (profile.faction as Faction) ?? 'Neutral'
        }
      }

      return {
        rank,
        user_id: userId,
        username,
        avatar_url: avatarUrl,
        faction,
        total_xp: xpByUser[userId],
        tier: getTier(rank, totalPlayers),
      }
    }
  )

  return leaderboard
}
