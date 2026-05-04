import { prisma } from "@/lib/db";
import { fetchWeeklyTraffic } from "@/lib/google-analytics";
import { isAuthenticated } from "@/lib/google-auth";
import { type NextRequest } from "next/server";

/**
 * POST /api/kpi/sync
 * Re-sync auto data (Webflow messages + GA traffic) for a specific week.
 * Body: { id: string, weekStart: string }
 */

async function fetchWebflowCount(weekStart: string): Promise<number | null> {
  const token = process.env.WEBFLOW_API_TOKEN;
  const siteId = process.env.WEBFLOW_SITE_ID;
  if (!token || !siteId) return null;

  const start = new Date(weekStart);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    const formsRes = await fetch(`https://api.webflow.com/v2/sites/${siteId}/forms`, {
      headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
      signal: AbortSignal.timeout(10000),
    });
    if (!formsRes.ok) return null;

    const formsData = await formsRes.json();
    const forms: { id: string }[] = formsData.forms ?? [];
    let count = 0;

    for (const form of forms) {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(`https://api.webflow.com/v2/forms/${form.id}/submissions`);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("offset", String(offset));

        const res = await fetch(url.toString(), {
          headers: { Authorization: `Bearer ${token}`, accept: "application/json" },
          signal: AbortSignal.timeout(10000),
        });
        if (!res.ok) break;

        const data = await res.json();
        const submissions: { dateSubmitted?: string }[] = data.formSubmissions ?? [];
        if (submissions.length === 0) { hasMore = false; break; }

        for (const sub of submissions) {
          if (!sub.dateSubmitted) continue;
          const d = new Date(sub.dateSubmitted);
          if (d >= start && d < end) count++;
          if (d < start) { hasMore = false; break; }
        }

        if (hasMore && submissions.length === limit) offset += limit;
        else hasMore = false;
      }
    }
    return count;
  } catch {
    return null;
  }
}

async function fetchTraffic(weekStart: string): Promise<number | null> {
  try {
    const authed = await isAuthenticated();
    if (!authed) return null;
    return await fetchWeeklyTraffic(weekStart);
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { id, weekStart } = await request.json();
    if (!id || !weekStart) {
      return Response.json({ error: "id and weekStart required" }, { status: 400 });
    }

    const [webflowCount, trafficCount] = await Promise.all([
      fetchWebflowCount(weekStart),
      fetchTraffic(weekStart),
    ]);

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (webflowCount !== null) updates.messagesWebflow = webflowCount;
    if (trafficCount !== null) updates.traficSite = trafficCount;

    const kpi = await prisma.weeklyKpi.update({
      where: { id },
      data: updates,
    });

    return Response.json(kpi);
  } catch (e) {
    console.error("KPI sync error:", e);
    return Response.json({ error: "Erreur sync" }, { status: 500 });
  }
}
