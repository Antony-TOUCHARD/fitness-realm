import { supabaseAdmin } from '@/lib/supabase/admin'
import type { Faction } from '@/lib/types'

// ============================================
// THE FITNESS REALM — Territory Conquest Logic
// ============================================

/**
 * 1 km = 1 influence point
 */
export function calculateInfluence(distanceKm: number): number {
  return Math.round(distanceKm)
}

/**
 * Rough bounding-box mapping of GPS coordinates to French region codes.
 * Returns the closest matching region or 'IDF' as fallback (Île-de-France).
 */
export function getRegionFromCoords(lat: number, lng: number): string {
  // Approximate bounding boxes for French metropolitan regions
  const regions: { id: string; minLat: number; maxLat: number; minLng: number; maxLng: number }[] = [
    { id: 'COR', minLat: 41.3, maxLat: 43.1, minLng: 8.5,  maxLng: 9.7  },
    { id: 'PAC', minLat: 43.0, maxLat: 44.5, minLng: 4.2,  maxLng: 7.7  },
    { id: 'OCC', minLat: 42.3, maxLat: 44.9, minLng: -0.4, maxLng: 4.9  },
    { id: 'ARA', minLat: 44.1, maxLat: 46.6, minLng: 3.0,  maxLng: 7.2  },
    { id: 'NAQ', minLat: 43.0, maxLat: 46.5, minLng: -1.8, maxLng: 2.6  },
    { id: 'CVL', minLat: 46.3, maxLat: 48.5, minLng: 0.0,  maxLng: 3.2  },
    { id: 'BFC', minLat: 46.0, maxLat: 48.4, minLng: 2.8,  maxLng: 7.2  },
    { id: 'PDL', minLat: 46.2, maxLat: 48.1, minLng: -2.6, maxLng: 0.1  },
    { id: 'BRE', minLat: 47.2, maxLat: 48.9, minLng: -5.2, maxLng: -1.0 },
    { id: 'NOR', minLat: 48.1, maxLat: 49.8, minLng: -2.0, maxLng: 1.8  },
    { id: 'IDF', minLat: 48.1, maxLat: 49.3, minLng: 1.4,  maxLng: 3.6  },
    { id: 'HDF', minLat: 49.0, maxLat: 51.1, minLng: 1.3,  maxLng: 4.3  },
    { id: 'GES', minLat: 47.4, maxLat: 50.2, minLng: 3.4,  maxLng: 8.3  },
  ]

  for (const region of regions) {
    if (
      lat >= region.minLat &&
      lat <= region.maxLat &&
      lng >= region.minLng &&
      lng <= region.maxLng
    ) {
      return region.id
    }
  }

  // Fallback to Île-de-France if no bounding box matches
  return 'IDF'
}

/**
 * Recalculate territory control based on total influence per faction.
 * Uses the admin client (bypasses RLS) to query and update.
 */
export async function updateTerritoryControl(
  territoryId: string
): Promise<void> {
  // 1. Get all influence records for this territory, joined with profiles
  const { data: influenceRows, error: fetchError } = await supabaseAdmin
    .from('territory_influence')
    .select('influence_points, user_id, profiles!inner(faction)')
    .eq('territory_id', territoryId)

  if (fetchError) {
    throw new Error(`Failed to fetch territory influence: ${fetchError.message}`)
  }

  if (!influenceRows || influenceRows.length === 0) {
    // No influence recorded — reset to Neutral
    await supabaseAdmin
      .from('territories')
      .update({
        controlling_faction: 'Neutral' as Faction,
        controlling_user_id: null,
        total_influence_points: 0,
      })
      .eq('id', territoryId)
    return
  }

  // 2. Aggregate influence by faction
  const factionInfluence: Record<string, number> = {}
  let topUser: { userId: string; points: number } = { userId: '', points: 0 }
  let totalPoints = 0

  for (const row of influenceRows) {
    const faction = (row.profiles as unknown as { faction: Faction }).faction
    const points = Number(row.influence_points)
    totalPoints += points

    factionInfluence[faction] = (factionInfluence[faction] ?? 0) + points

    if (points > topUser.points) {
      topUser = { userId: row.user_id, points }
    }
  }

  // 3. Determine controlling faction (highest total influence)
  let controllingFaction: Faction = 'Neutral'
  let maxInfluence = 0

  for (const [faction, influence] of Object.entries(factionInfluence)) {
    if (influence > maxInfluence) {
      maxInfluence = influence
      controllingFaction = faction as Faction
    }
  }

  // 4. Update the territory
  const { error: updateError } = await supabaseAdmin
    .from('territories')
    .update({
      controlling_faction: controllingFaction,
      controlling_user_id: topUser.userId || null,
      total_influence_points: totalPoints,
    })
    .eq('id', territoryId)

  if (updateError) {
    throw new Error(`Failed to update territory: ${updateError.message}`)
  }
}
