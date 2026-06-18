import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/strava";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  if (error || !code) {
    console.error("Strava OAuth Callback error or missing code:", error);
    return NextResponse.redirect(`${appUrl}/profile?error=Strava authorization denied`);
  }

  try {
    // 1. Exchange OAuth code for athlete tokens
    const tokenResponse = await exchangeCodeForTokens(code);

    // 2. Fetch authenticated Supabase user session
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("Supabase user session missing during Strava callback:", userError);
      return NextResponse.redirect(`${appUrl}/login?error=Session expired`);
    }

    // 3. Save tokens in profiles table (RLS allows users to update their own profiles)
    const { error: dbError } = await supabase
      .from("profiles")
      .update({
        strava_athlete_id: String(tokenResponse.athlete.id),
        strava_access_token: tokenResponse.access_token,
        strava_refresh_token: tokenResponse.refresh_token,
        strava_expires_at: tokenResponse.expires_at,
      })
      .eq("id", user.id);

    if (dbError) {
      throw dbError;
    }

    return NextResponse.redirect(`${appUrl}/profile?success=Strava account connected`);
  } catch (err: any) {
    console.error("Error handling Strava callback:", err);
    return NextResponse.redirect(`${appUrl}/profile?error=Integration failed`);
  }
}
