import type { ValidationResult } from '@/lib/types'

// ============================================
// THE FITNESS REALM — Anti-Cheat / GPS Spoofing Detection
// ============================================

/** Maximum realistic speed per activity type (km/h) */
const MAX_SPEED_KMH: Record<string, number> = {
  Run: 40,
  Ride: 120,
  Walk: 15,
  Hike: 15,
  Swim: 15,
}

/** Minimum duration for any valid activity (seconds) */
const MIN_DURATION_SECONDS = 60

/** Maximum distance for a single session (km) */
const MAX_DISTANCE_KM = 500

/**
 * Validate an activity against anti-cheat rules.
 * Returns { valid, reason } where reason explains rejection.
 */
export function validateActivity(
  type: string,
  distanceKm: number,
  durationSeconds: number
): ValidationResult {
  // Rule 1: Minimum duration
  if (durationSeconds < MIN_DURATION_SECONDS) {
    return {
      valid: false,
      reason: `Activity too short: ${durationSeconds}s (minimum ${MIN_DURATION_SECONDS}s).`,
    }
  }

  // Rule 2: Maximum distance per session
  if (distanceKm > MAX_DISTANCE_KM) {
    return {
      valid: false,
      reason: `Distance too large: ${distanceKm.toFixed(1)} km (maximum ${MAX_DISTANCE_KM} km per session).`,
    }
  }

  // Rule 3: Speed check per activity type
  const maxSpeed = MAX_SPEED_KMH[type]
  if (maxSpeed != null) {
    const durationHours = durationSeconds / 3600
    const avgSpeedKmh = durationHours > 0 ? distanceKm / durationHours : 0

    if (avgSpeedKmh > maxSpeed) {
      return {
        valid: false,
        reason: `Average speed ${avgSpeedKmh.toFixed(1)} km/h exceeds maximum ${maxSpeed} km/h for ${type}.`,
      }
    }
  }

  // Rule 4: Distance must be positive
  if (distanceKm <= 0) {
    return {
      valid: false,
      reason: 'Distance must be greater than 0.',
    }
  }

  return {
    valid: true,
    reason: 'Activity passed all validation checks.',
  }
}
