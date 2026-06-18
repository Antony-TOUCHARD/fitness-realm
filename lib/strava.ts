import type {
  StravaActivity,
  StravaTokenResponse,
  StravaRefreshResponse,
} from '@/lib/types'

// ============================================
// THE FITNESS REALM — Strava API Utilities
// ============================================

const STRAVA_API_BASE = 'https://www.strava.com/api/v3'
const STRAVA_OAUTH_BASE = 'https://www.strava.com/oauth'

/**
 * Build the Strava OAuth authorization URL.
 * Redirects user to Strava for consent.
 */
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: process.env.STRAVA_CLIENT_ID!,
    redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/strava/callback`,
    response_type: 'code',
    approval_prompt: 'auto',
    scope: 'read,activity:read_all',
  })

  return `${STRAVA_OAUTH_BASE}/authorize?${params.toString()}`
}

/**
 * Exchange the authorization code for access + refresh tokens.
 */
export async function exchangeCodeForTokens(
  code: string
): Promise<StravaTokenResponse> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      code,
      grant_type: 'authorization_code',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Strava token exchange failed: ${error}`)
  }

  return response.json() as Promise<StravaTokenResponse>
}

/**
 * Refresh an expired access token using the refresh token.
 */
export async function refreshAccessToken(
  refreshToken: string
): Promise<StravaRefreshResponse> {
  const response = await fetch(`${STRAVA_OAUTH_BASE}/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.STRAVA_CLIENT_ID!,
      client_secret: process.env.STRAVA_CLIENT_SECRET!,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Strava token refresh failed: ${error}`)
  }

  return response.json() as Promise<StravaRefreshResponse>
}

/**
 * Fetch the athlete's recent activities.
 * @param after — Optional epoch timestamp to only fetch activities after this date.
 */
export async function getActivities(
  accessToken: string,
  after?: number
): Promise<StravaActivity[]> {
  const params = new URLSearchParams({ per_page: '50' })
  if (after != null) {
    params.set('after', after.toString())
  }

  const response = await fetch(
    `${STRAVA_API_BASE}/athlete/activities?${params.toString()}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Strava getActivities failed: ${error}`)
  }

  return response.json() as Promise<StravaActivity[]>
}

/**
 * Fetch a single activity by its Strava ID.
 */
export async function getActivity(
  accessToken: string,
  activityId: number
): Promise<StravaActivity> {
  const response = await fetch(
    `${STRAVA_API_BASE}/activities/${activityId}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    }
  )

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Strava getActivity failed: ${error}`)
  }

  return response.json() as Promise<StravaActivity>
}
