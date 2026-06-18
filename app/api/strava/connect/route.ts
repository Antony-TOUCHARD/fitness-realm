import { NextResponse } from "next/server";
import { getAuthorizationUrl } from "@/lib/strava";

export async function GET() {
  try {
    const url = getAuthorizationUrl();
    return NextResponse.redirect(url);
  } catch (error: any) {
    console.error("Strava Connect error:", error);
    return NextResponse.json(
      { error: "Failed to initialize Strava connection." },
      { status: 500 }
    );
  }
}
