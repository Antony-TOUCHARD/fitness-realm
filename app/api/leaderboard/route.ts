import { NextRequest, NextResponse } from "next/server";
import { getWeeklyLeaderboard } from "@/lib/leaderboard";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sport = searchParams.get("sport") as "Run" | "Ride" | "Walk" | null;
    const week = parseInt(searchParams.get("week") || "0", 10);

    const leaderboard = await getWeeklyLeaderboard(sport || undefined, week);
    return NextResponse.json({ leaderboard });
  } catch (error: any) {
    console.error("Leaderboard API error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load leaderboard data." },
      { status: 500 }
    );
  }
}
