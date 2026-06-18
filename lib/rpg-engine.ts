import type { RPGRewards, LevelUpResult } from '@/lib/types'

// ============================================
// THE FITNESS REALM — RPG Formula Service
// ============================================

/**
 * XP = (D × 100) + (E × 3)
 * D = distance in km, E = elevation gain in meters
 */
export function calculateXP(distanceKm: number, elevationM: number): number {
  return Math.round(distanceKm * 100 + elevationM * 3)
}

/**
 * M_gold = FC_moy / 100
 * Returns 1.0 if no heart rate data available.
 */
export function getGoldMultiplier(avgHeartrate: number | null): number {
  if (avgHeartrate == null || avgHeartrate <= 0) {
    return 1.0
  }
  return avgHeartrate / 100
}

/**
 * G = floor(D × 10 × M_gold)
 */
export function calculateGold(
  distanceKm: number,
  avgHeartrate: number | null
): number {
  const multiplier = getGoldMultiplier(avgHeartrate)
  return Math.floor(distanceKm * 10 * multiplier)
}

/**
 * XP required to reach a given level: XP_req = 1000 × L
 */
export function xpRequiredForLevel(level: number): number {
  return 1000 * level
}

/**
 * Process level-up logic.
 * Accumulates XP and levels up as many times as possible.
 */
export function processLevelUp(
  currentLevel: number,
  currentXP: number,
  xpGained: number
): LevelUpResult {
  let totalXP = currentXP + xpGained
  let level = currentLevel
  let leveledUp = false

  while (totalXP >= xpRequiredForLevel(level)) {
    totalXP -= xpRequiredForLevel(level)
    level += 1
    leveledUp = true
  }

  return {
    newLevel: level,
    remainingXP: totalXP,
    leveledUp,
  }
}

/**
 * Full workout processing — computes XP, gold, and level changes.
 */
export function processWorkout(
  distanceKm: number,
  elevationM: number,
  avgHeartrate: number | null,
  currentLevel: number,
  currentXP: number,
  currentGold: number,
  hasCoachingBonus: boolean = false
): RPGRewards {
  let xp = calculateXP(distanceKm, elevationM)
  let gold = calculateGold(distanceKm, avgHeartrate)

  if (hasCoachingBonus) {
    xp = Math.round(xp * 1.5)
    gold = Math.round(gold * 1.5)
  }

  const { newLevel, remainingXP, leveledUp } = processLevelUp(
    currentLevel,
    currentXP,
    xp
  )

  // Note: remainingXP and new gold total are for the caller to persist.
  // RPGRewards returns the *gained* amounts + resulting level.
  void remainingXP
  void currentGold

  return {
    xp,
    gold,
    leveledUp,
    newLevel,
  }
}
