import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/admin";
import { getActivity, refreshAccessToken } from "@/lib/strava";
import { validateActivity } from "@/lib/anti-cheat";
import { processWorkout, processLevelUp } from "@/lib/rpg-engine";
import { calculateInfluence, getRegionFromCoords, updateTerritoryControl } from "@/lib/territory";
import { ActivityType } from "@/lib/types";

// 1. GET: Webhook validation (handshake)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const VERIFY_TOKEN = process.env.STRAVA_VERIFY_TOKEN || "fitness-realm-webhook-verify-token";

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("Strava webhook validated successfully!");
    // Respond with challenge payload exactly as expected by Strava
    return new NextResponse(JSON.stringify({ "hub.challenge": challenge }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    });
  }

  console.error("Strava webhook validation failed.");
  return new NextResponse("Forbidden", { status: 403 });
}

// 2. POST: Webhook event callback
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log("Received Strava webhook event:", body);

    const { object_type, aspect_type, object_id, owner_id } = body;

    // We only process activity creations
    if (object_type === "activity" && aspect_type === "create") {
      // Find user profile linked to this Strava Athlete ID
      // Bypasses RLS since this is a server webhook calling admin client
      const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("*")
        .eq("strava_athlete_id", String(owner_id))
        .single();

      if (profileError || !profile) {
        console.error(`User profile not found for Strava athlete ${owner_id}`);
        // Return 200 to acknowledge receipt and prevent Strava from retrying
        return NextResponse.json({ status: "ignored_unregistered_athlete" });
      }

      // Check access token and refresh if expired
      let accessToken = profile.strava_access_token;
      const isExpired = profile.strava_expires_at 
        ? profile.strava_expires_at < Math.floor(Date.now() / 1000) + 60
        : true;

      if (isExpired) {
        try {
          const refreshResult = await refreshAccessToken(profile.strava_refresh_token);
          
          await supabaseAdmin
            .from("profiles")
            .update({
              strava_access_token: refreshResult.access_token,
              strava_refresh_token: refreshResult.refresh_token,
              strava_expires_at: refreshResult.expires_at,
            })
            .eq("id", profile.id);

          accessToken = refreshResult.access_token;
        } catch (refreshErr) {
          console.error(`Failed refreshing Strava credentials for user ${profile.id}:`, refreshErr);
          return NextResponse.json({ status: "ignored_credential_expired" });
        }
      }

      if (!accessToken) {
        return NextResponse.json({ status: "ignored_no_token" });
      }

      // Fetch the full activity parameters from Strava API
      const activity = await getActivity(accessToken, object_id);
      
      // Parse activity type
      let type: ActivityType = "Walk";
      if (activity.type === "Run" || activity.sport_type === "Run") type = "Run";
      else if (activity.type === "Ride" || activity.sport_type === "Cycling") type = "Ride";
      else if (activity.type === "Hike") type = "Hike";
      else if (activity.type === "Swim") type = "Swim";

      // Double check duplicates
      const { data: exists } = await supabaseAdmin
        .from("workouts")
        .select("id")
        .eq("strava_activity_id", String(activity.id))
        .maybeSingle();

      if (exists) {
        return NextResponse.json({ status: "ignored_duplicate" });
      }

      const distanceKm = activity.distance / 1000;
      const elevationM = activity.total_elevation_gain || 0;

      // Validate anti-cheat constraints
      const validation = validateActivity(type, distanceKm, activity.moving_time);
      const isFlagged = !validation.valid;

      let xpGained = 0;
      let goldGained = 0;
      let currentLevel = profile.level;
      let currentXP = profile.xp;
      let currentGold = profile.gold;

      if (!isFlagged) {
        // Compute RPG rewards
        const rewards = processWorkout(
          distanceKm,
          elevationM,
          activity.average_heartrate,
          profile.level,
          profile.xp,
          profile.gold
        );

        xpGained = rewards.xp;
        goldGained = rewards.gold;

        // Process level ups
        const levelResult = processLevelUp(profile.level, profile.xp, xpGained);
        currentLevel = levelResult.newLevel;
        currentXP = levelResult.remainingXP;
        currentGold += goldGained;
      }

      const lat = activity.start_latlng ? activity.start_latlng[0] : 48.8566;
      const lng = activity.start_latlng ? activity.start_latlng[1] : 2.3522;
      const territoryId = getRegionFromCoords(lat, lng);

      // Insert workout entry
      let dbError = null;

      try {
        const res = await supabaseAdmin
          .from("workouts")
          .insert({
            user_id: profile.id,
            strava_activity_id: String(activity.id),
            name: activity.name || "Completed Quest",
            activity_type: type,
            distance: distanceKm,
            elevation_gain: elevationM,
            avg_heartrate: activity.average_heartrate,
            xp_gained: xpGained,
            gold_gained: goldGained,
            anti_cheat_status: isFlagged ? "Flagged" : "Verified",
            start_date: activity.start_date,
            territory_id: territoryId,
            summary_polyline: activity.map?.summary_polyline || null,
          });
        dbError = res.error;

        // If PostgreSQL error code 42703 (undefined_column), retry without new columns
        if (dbError && (dbError.code === "42703" || dbError.message?.includes("column"))) {
          console.warn("New columns don't exist on live DB, falling back in webhook...");
          const fallbackRes = await supabaseAdmin
            .from("workouts")
            .insert({
              user_id: profile.id,
              strava_activity_id: String(activity.id),
              name: activity.name || "Completed Quest",
              activity_type: type,
              distance: distanceKm,
              elevation_gain: elevationM,
              avg_heartrate: activity.average_heartrate,
              xp_gained: xpGained,
              gold_gained: goldGained,
              anti_cheat_status: isFlagged ? "Flagged" : "Verified",
              start_date: activity.start_date,
            });
          dbError = fallbackRes.error;
        }
      } catch (err) {
        console.error("Failed to insert webhook workout with territory_id and summary_polyline:", err);
      }

      if (dbError) throw dbError;

      // Update user levels, XP, and gold holdings
      await supabaseAdmin
        .from("profiles")
        .update({
          level: currentLevel,
          xp: currentXP,
          gold: currentGold,
        })
        .eq("id", profile.id);

      // Record territory influence and update controls
      if (!isFlagged) {
        const influencePoints = calculateInfluence(distanceKm);

        const { data: currentInfluence } = await supabaseAdmin
          .from("territory_influence")
          .select("influence_points")
          .eq("user_id", profile.id)
          .eq("territory_id", territoryId)
          .maybeSingle();

        if (currentInfluence) {
          const newIP = Number(currentInfluence.influence_points) + influencePoints;
          await supabaseAdmin
            .from("territory_influence")
            .update({ influence_points: newIP })
            .eq("user_id", profile.id)
            .eq("territory_id", territoryId);
        } else {
          await supabaseAdmin
            .from("territory_influence")
            .insert({
              user_id: profile.id,
              territory_id: territoryId,
              influence_points: influencePoints,
            });
        }

        // Recalculate territory dominant faction
        await updateTerritoryControl(territoryId);
      }
    }

    // Always respond with 200 OK to Strava webhook events
    return NextResponse.json({ status: "success" });
  } catch (error: any) {
    console.error("Strava Webhook POST error:", error);
    return NextResponse.json(
      { error: "Internal processing error." },
      { status: 500 }
    );
  }
}
