// Google Analytics 4 Data API — fetches traffic metrics
import { getAccessToken } from "./google-auth";

function getPropertyId() {
  return process.env.GOOGLE_ANALYTICS_PROPERTY_ID || "";
}

export interface AnalyticsRow {
  date: string; // YYYYMMDD
  sessions: number;
  users: number;
  pageviews: number;
  newUsers: number;
}

export interface AnalyticsSummary {
  rows: AnalyticsRow[];
  totalSessions: number;
  totalUsers: number;
  totalPageviews: number;
  totalNewUsers: number;
}

/**
 * Fetch GA4 traffic data for a given date range.
 * Uses the GA4 Data API v1beta (runReport).
 */
export async function fetchAnalyticsData(
  startDate: string,  // YYYY-MM-DD
  endDate: string     // YYYY-MM-DD
): Promise<AnalyticsSummary> {
  const propertyId = getPropertyId();
  if (!propertyId) throw new Error("GOOGLE_ANALYTICS_PROPERTY_ID non configuré");

  const token = await getAccessToken();

  const res = await fetch(
    `https://analyticsdata.googleapis.com/v1beta/properties/${propertyId}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        dateRanges: [{ startDate, endDate }],
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "sessions" },
          { name: "totalUsers" },
          { name: "screenPageViews" },
          { name: "newUsers" },
        ],
        orderBys: [{ dimension: { dimensionName: "date" }, desc: false }],
      }),
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const rows: AnalyticsRow[] = (data.rows || []).map(
    (row: { dimensionValues: { value: string }[]; metricValues: { value: string }[] }) => ({
      date: row.dimensionValues[0].value,
      sessions: parseInt(row.metricValues[0].value) || 0,
      users: parseInt(row.metricValues[1].value) || 0,
      pageviews: parseInt(row.metricValues[2].value) || 0,
      newUsers: parseInt(row.metricValues[3].value) || 0,
    })
  );

  const totals = rows.reduce(
    (acc, r) => ({
      totalSessions: acc.totalSessions + r.sessions,
      totalUsers: acc.totalUsers + r.users,
      totalPageviews: acc.totalPageviews + r.pageviews,
      totalNewUsers: acc.totalNewUsers + r.newUsers,
    }),
    { totalSessions: 0, totalUsers: 0, totalPageviews: 0, totalNewUsers: 0 }
  );

  return { rows, ...totals };
}

/**
 * Fetch weekly traffic (sessions) for the current week (Monday to Sunday).
 */
export async function fetchWeeklyTraffic(weekStart: string): Promise<number> {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  const fmt = (d: Date) => d.toISOString().split("T")[0];
  const data = await fetchAnalyticsData(fmt(start), fmt(end));
  return data.totalSessions;
}
