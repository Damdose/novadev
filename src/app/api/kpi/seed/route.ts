import { prisma } from "@/lib/db";
import { fetchWeeklyTraffic } from "@/lib/google-analytics";
import { isAuthenticated } from "@/lib/google-auth";

/**
 * POST /api/kpi/seed
 * Auto-creates missing WeeklyKpi rows since April 13 2026.
 * For each row with 0 messages/trafic, tries to auto-fill from Webflow & GA.
 */

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

function getMondaysSince(startDate: string): Date[] {
  const mondays: Date[] = [];
  const now = new Date();
  const current = getMonday(now);
  const start = getMonday(new Date(startDate));

  const d = new Date(start);
  while (d <= current) {
    mondays.push(new Date(d));
    d.setDate(d.getDate() + 7);
  }
  return mondays;
}

// ── Webflow: direct API call ────────────────────────────

async function fetchWebflowCountDirect(weekStart: string): Promise<number | null> {
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

// ── GA: direct function call ────────────────────────────

async function fetchTrafficDirect(weekStart: string): Promise<number | null> {
  try {
    const authed = await isAuthenticated();
    if (!authed) return null;
    return await fetchWeeklyTraffic(weekStart);
  } catch {
    return null;
  }
}

// ── Route handler ───────────────────────────────────────

export async function POST() {
  try {
    const START_DATE = "2026-04-13";
    const mondays = getMondaysSince(START_DATE);

    // Get all existing KPIs
    const existing = await prisma.weeklyKpi.findMany({
      where: { weekStart: { in: mondays } },
    });
    const existingMap = new Map(
      existing.map((k) => [k.weekStart.toISOString().split("T")[0], k])
    );

    const created: string[] = [];
    const updated: string[] = [];

    for (const monday of mondays) {
      const key = monday.toISOString().split("T")[0];
      const ex = existingMap.get(key);

      if (!ex) {
        // New week — create with auto data
        const [webflowCount, trafficCount] = await Promise.all([
          fetchWebflowCountDirect(key),
          fetchTrafficDirect(key),
        ]);

        await prisma.weeklyKpi.create({
          data: {
            weekStart: monday,
            messagesWebflow: webflowCount ?? 0,
            traficSite: trafficCount ?? 0,
            appelsCentre: 0,
            rdvDoctolib: 0,
            messagesDoctolib: 0,
          },
        });
        created.push(key);
      } else if (ex.messagesWebflow === 0 || ex.traficSite === 0) {
        // Existing week with missing auto data — try to fill
        const updates: Record<string, number> = {};

        if (ex.messagesWebflow === 0) {
          const count = await fetchWebflowCountDirect(key);
          if (count !== null && count > 0) updates.messagesWebflow = count;
        }
        if (ex.traficSite === 0) {
          const sessions = await fetchTrafficDirect(key);
          if (sessions !== null && sessions > 0) updates.traficSite = sessions;
        }

        if (Object.keys(updates).length > 0) {
          await prisma.weeklyKpi.update({
            where: { id: ex.id },
            data: { ...updates, updatedAt: new Date() },
          });
          updated.push(key);
        }
      }
    }

    // Return all KPIs
    const kpis = await prisma.weeklyKpi.findMany({
      orderBy: { weekStart: "desc" },
      take: 52,
    });

    return Response.json({ kpis, created, updated });
  } catch (e) {
    console.error("KPI seed error:", e);
    return Response.json({ error: "Erreur lors du seed" }, { status: 500 });
  }
}
