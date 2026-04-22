import { fetchAnalyticsData, fetchWeeklyTraffic } from "@/lib/google-analytics";
import { isAuthenticated } from "@/lib/google-auth";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const authenticated = await isAuthenticated();
    if (!authenticated) {
      return Response.json({ error: "Non connecté à Google" }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("mode"); // "week" or "range"

    if (mode === "week") {
      // Fetch total sessions for a specific week
      const weekStart = searchParams.get("weekStart");
      if (!weekStart) {
        return Response.json({ error: "weekStart requis" }, { status: 400 });
      }
      const sessions = await fetchWeeklyTraffic(weekStart);
      return Response.json({ sessions });
    }

    // Default: fetch date range
    const startDate = searchParams.get("startDate") || getDefaultStartDate();
    const endDate = searchParams.get("endDate") || new Date().toISOString().split("T")[0];

    const data = await fetchAnalyticsData(startDate, endDate);
    return Response.json(data);
  } catch (e) {
    console.error("Analytics API error:", e);
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}
