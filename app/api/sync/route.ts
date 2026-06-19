import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActivities, refreshAccessToken } from "@/lib/strava";
import { validateActivity } from "@/lib/anti-cheat";
import { processWorkout, processLevelUp } from "@/lib/rpg-engine";
import { calculateInfluence, getRegionFromCoords, updateTerritoryControl } from "@/lib/territory";
import { ActivityType } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const hasCoachingBonus = !!body.hasCoachingBonus;

    // 1. Authenticate user
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch profile and Strava credentials
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found." }, { status: 404 });
    }

    if (!profile.strava_refresh_token) {
      return NextResponse.json(
        { error: "Strava not connected. Please go to Profile to connect." },
        { status: 400 }
      );
    }

    // 3. Check for token expiration (60s buffer)
    let accessToken = profile.strava_access_token;
    const isExpired = profile.strava_expires_at 
      ? profile.strava_expires_at < Math.floor(Date.now() / 1000) + 60
      : true;

    if (isExpired) {
      try {
        const refreshResult = await refreshAccessToken(profile.strava_refresh_token);
        
        // Save refreshed tokens
        const { error: updateTokenError } = await supabase
          .from("profiles")
          .update({
            strava_access_token: refreshResult.access_token,
            strava_refresh_token: refreshResult.refresh_token,
            strava_expires_at: refreshResult.expires_at,
          })
          .eq("id", user.id);

        if (updateTokenError) throw updateTokenError;
        accessToken = refreshResult.access_token;
      } catch (err) {
        console.error("Failed to refresh Strava token:", err);
        return NextResponse.json(
          { error: "Strava session expired. Please reconnect." },
          { status: 400 }
        );
      }
    }

    if (!accessToken) {
      return NextResponse.json({ error: "Strava access token missing." }, { status: 400 });
    }

    // 4. Retrieve activities from Strava
    // Fetch activities from last 14 days (or since last processed workout, let's query the workouts table for latest processed_at)
    let afterTimestamp: number | undefined;
    const { data: latestWorkout } = await supabase
      .from("workouts")
      .select("start_date")
      .eq("user_id", user.id)
      .order("start_date", { ascending: false })
      .limit(1)
      .single();

    if (latestWorkout) {
      afterTimestamp = Math.floor(new Date(latestWorkout.start_date).getTime() / 1000);
    } else {
      // Fetch last 7 days by default
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      afterTimestamp = Math.floor(sevenDaysAgo.getTime() / 1000);
    }

    const stravaActivities = await getActivities(accessToken, afterTimestamp);
    let newWorkoutsCount = 0;

    // Track accumulative profile updates
    let currentLevel = profile.level;
    let currentXP = profile.xp;
    let currentGold = profile.gold;

    for (const activity of stravaActivities) {
      // Parse activity type
      let type: ActivityType = "Walk";
      if (activity.type === "Run" || activity.sport_type === "Run") type = "Run";
      else if (activity.type === "Ride" || activity.sport_type === "Cycling") type = "Ride";
      else if (activity.type === "Hike") type = "Hike";
      else if (activity.type === "Swim") type = "Swim";

      // Check if already processed
      const { data: exists } = await supabase
        .from("workouts")
        .select("id")
        .eq("strava_activity_id", String(activity.id))
        .maybeSingle();

      if (exists) {
        continue;
      }

      // Convert distance to km
      const distanceKm = activity.distance / 1000;
      const elevationM = activity.total_elevation_gain || 0;

      // 5. Anti-cheat check
      const validation = validateActivity(type, distanceKm, activity.moving_time);
      const isFlagged = !validation.valid;

      let xpGained = 0;
      let goldGained = 0;
      let newLevel = currentLevel;

      if (!isFlagged) {
        // Calculate RPG Rewards
        const rewards = processWorkout(
          distanceKm,
          elevationM,
          activity.average_heartrate,
          currentLevel,
          currentXP,
          currentGold,
          hasCoachingBonus
        );

        xpGained = rewards.xp;
        goldGained = rewards.gold;

        // Process level up
        const levelResult = processLevelUp(currentLevel, currentXP, xpGained);
        currentLevel = levelResult.newLevel;
        currentXP = levelResult.remainingXP;
        currentGold += goldGained;
        newLevel = levelResult.newLevel;
      }

      const lat = activity.start_latlng ? activity.start_latlng[0] : 48.8566; // Fallback to Paris IDF lat
      const lng = activity.start_latlng ? activity.start_latlng[1] : 2.3522;  // Fallback to Paris IDF lng
      const territoryId = getRegionFromCoords(lat, lng);

      // 6. Record Workout in DB
      let insertedWorkout = null;
      let insertError = null;

      try {
        const res = await supabase
          .from("workouts")
          .insert({
            user_id: user.id,
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
            duration: activity.moving_time,
          })
          .select()
          .single();
        insertedWorkout = res.data;
        insertError = res.error;
        
        // If PostgreSQL error code 42703 (undefined_column), retry without new columns
        if (insertError && (insertError.code === "42703" || insertError.message?.includes("column"))) {
          console.warn("New columns don't exist on live DB, trying fallback inserts...");
          
          // Fallback 1: Try without duration (in case duration is the only missing column)
          const fallback1Res = await supabase
            .from("workouts")
            .insert({
              user_id: user.id,
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
            })
            .select()
            .single();

          if (fallback1Res.error && (fallback1Res.error.code === "42703" || fallback1Res.error.message?.includes("column"))) {
            // Fallback 2: Try without duration, summary_polyline, or territory_id (bare minimum)
            console.warn("Summary polyline or territory_id also missing, trying bare minimum fallback...");
            const fallback2Res = await supabase
              .from("workouts")
              .insert({
                user_id: user.id,
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
              })
              .select()
              .single();
            insertedWorkout = fallback2Res.data;
            insertError = fallback2Res.error;
          } else {
            insertedWorkout = fallback1Res.data;
            insertError = fallback1Res.error;
          }
        }
      } catch (err) {
        console.error("Failed to insert workout with territory_id and summary_polyline:", err);
      }

      if (insertError) {
        console.error("Failed to insert workout:", insertError);
        continue; // skip
      }

      newWorkoutsCount++;

      // 7. Update territory influence if verified
      if (!isFlagged) {
        const influencePoints = calculateInfluence(distanceKm);

        // Fetch user's current influence
        const { data: currentInfluence } = await supabase
          .from("territory_influence")
          .select("influence_points")
          .eq("user_id", user.id)
          .eq("territory_id", territoryId)
          .maybeSingle();

        if (currentInfluence) {
          const newIP = Number(currentInfluence.influence_points) + influencePoints;
          await supabase
            .from("territory_influence")
            .update({ influence_points: newIP })
            .eq("user_id", user.id)
            .eq("territory_id", territoryId);
        } else {
          await supabase
            .from("territory_influence")
            .insert({
              user_id: user.id,
              territory_id: territoryId,
              influence_points: influencePoints,
            });
        }

        // Recalculate control (runs on admin server bypass)
        try {
          await updateTerritoryControl(territoryId);
        } catch (territoryErr) {
          console.error(`Failed updating control for ${territoryId}:`, territoryErr);
        }
      }
    }

    // 8. Update user profile if new activities were synced
    if (newWorkoutsCount > 0) {
      await supabase
        .from("profiles")
        .update({
          level: currentLevel,
          xp: currentXP,
          gold: currentGold,
        })
        .eq("id", user.id);
    }

    // Retroactive repair for older workouts lacking duration or polyline data
    try {
      let workoutsToFix = [];
      let durationColumnSupported = true;

      try {
        const { data, error } = await supabase
          .from("workouts")
          .select("id, strava_activity_id")
          .eq("user_id", user.id)
          .or("duration.is.null,summary_polyline.is.null");
        
        if (error) throw error;
        workoutsToFix = data || [];
      } catch (err) {
        console.warn("Failed to query duration column for repair, falling back to checking only summary_polyline:", err);
        durationColumnSupported = false;
        const { data } = await supabase
          .from("workouts")
          .select("id, strava_activity_id")
          .eq("user_id", user.id)
          .is("summary_polyline", null);
        workoutsToFix = data || [];
      }

      if (workoutsToFix && workoutsToFix.length > 0) {
        const { getActivity } = await import("@/lib/strava");
        console.log(`Found ${workoutsToFix.length} old workouts to repair with Strava data...`);
        for (const w of workoutsToFix) {
          try {
            const activityId = Number(w.strava_activity_id);
            if (!isNaN(activityId)) {
              const fullActivity = await getActivity(accessToken, activityId);
              if (fullActivity) {
                if (durationColumnSupported) {
                  try {
                    await supabase
                      .from("workouts")
                      .update({
                        duration: fullActivity.moving_time,
                        summary_polyline: fullActivity.map?.summary_polyline || null,
                      })
                      .eq("id", w.id);
                  } catch (updateErr) {
                    console.warn(`Update failed with duration, trying update without duration for workout ${w.id}:`, updateErr);
                    await supabase
                      .from("workouts")
                      .update({
                        summary_polyline: fullActivity.map?.summary_polyline || null,
                      })
                      .eq("id", w.id);
                  }
                } else {
                  await supabase
                    .from("workouts")
                    .update({
                      summary_polyline: fullActivity.map?.summary_polyline || null,
                    })
                    .eq("id", w.id);
                }
              }
            }
          } catch (err) {
            console.error(`Failed to repair old workout ${w.id} with Strava:`, err);
          }
        }
      }
    } catch (repairErr) {
      console.error("Failed to run retroactive repair check:", repairErr);
    }

    return NextResponse.json({ synced: newWorkoutsCount });
  } catch (error: any) {
    console.error("Manual sync error:", error);
    return NextResponse.json(
      { error: error.message || "Manual sync process failed." },
      { status: 500 }
    );
  }
}
