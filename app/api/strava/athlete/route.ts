import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { refreshAccessToken } from "@/lib/strava";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    let accessToken = profile.strava_access_token;
    if (!accessToken) {
      return NextResponse.json({ error: "Strava not connected" }, { status: 400 });
    }

    const expiresAt = profile.strava_expires_at;
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt && expiresAt < now && profile.strava_refresh_token) {
      try {
        const refreshResponse = await refreshAccessToken(profile.strava_refresh_token);
        accessToken = refreshResponse.access_token;

        await supabase
          .from("profiles")
          .update({
            strava_access_token: refreshResponse.access_token,
            strava_refresh_token: refreshResponse.refresh_token,
            strava_expires_at: refreshResponse.expires_at,
          })
          .eq("id", user.id);
      } catch (refreshErr) {
        console.error("Failed to refresh token:", refreshErr);
        return NextResponse.json({ error: "Strava token expired, please reconnect" }, { status: 401 });
      }
    }

    const athleteRes = await fetch("https://www.strava.com/api/v3/athlete", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!athleteRes.ok) {
      const errText = await athleteRes.text();
      return NextResponse.json({ error: `Strava API returned error: ${errText}` }, { status: athleteRes.status });
    }

    const athleteData = await athleteRes.json();
    return NextResponse.json(athleteData);
  } catch (error: any) {
    console.error("Strava athlete endpoint error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
