import { fetchSearchPerformance, fetchTopQueries } from "@/lib/google-search-console";
import { isAuthenticated } from "@/lib/google-auth";
import { getStaticPerformanceData, getStaticTopQueries, getStaticTopPages } from "@/lib/gsc-static-data";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const mode = searchParams.get("mode"); // "performance", "queries", or "pages"
    const startDate = searchParams.get("startDate") || getDefaultStartDate();
    const endDate = searchParams.get("endDate") || getDefaultEndDate();

    // Tenter l'API live si authentifié
    const authenticated = await isAuthenticated();
    if (authenticated) {
      try {
        if (mode === "queries") {
          const limit = parseInt(searchParams.get("limit") || "10");
          const queries = await fetchTopQueries(startDate, endDate, limit);
          return Response.json({ queries });
        }
        const data = await fetchSearchPerformance(startDate, endDate);
        return Response.json(data);
      } catch {
        // API live échoue → fallback statique
      }
    }

    // Données statiques (export GSC du 22/04/2026)
    if (mode === "queries") {
      const limit = parseInt(searchParams.get("limit") || "10");
      return Response.json({ queries: getStaticTopQueries(limit), static: true });
    }

    if (mode === "pages") {
      const limit = parseInt(searchParams.get("limit") || "20");
      return Response.json({ pages: getStaticTopPages(limit), static: true });
    }

    const data = getStaticPerformanceData(startDate, endDate);
    return Response.json({ ...data, static: true });
  } catch (e) {
    console.error("Search Console API error:", e);
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}

function getDefaultStartDate(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().split("T")[0];
}

function getDefaultEndDate(): string {
  // Search Console data has ~3 days delay
  const d = new Date();
  d.setDate(d.getDate() - 3);
  return d.toISOString().split("T")[0];
}
