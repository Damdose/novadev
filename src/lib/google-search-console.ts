// Google Search Console API — fetches search performance data
import { getAccessToken } from "./google-auth";

function getSiteUrl() {
  return process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL || "";
}

export interface SearchConsoleRow {
  keys: string[]; // [date] or [date, query] depending on dimensions
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export interface SearchConsoleSummary {
  rows: SearchConsoleRow[];
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

/**
 * Fetch search performance data for a given date range.
 */
export async function fetchSearchPerformance(
  startDate: string,
  endDate: string,
  dimensions: string[] = ["date"]
): Promise<SearchConsoleSummary> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) throw new Error("GOOGLE_SEARCH_CONSOLE_SITE_URL non configuré");

  const token = await getAccessToken();
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        rowLimit: 1000,
      }),
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  const rows: SearchConsoleRow[] = (data.rows || []).map(
    (row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
      keys: row.keys,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })
  );

  const totalClicks = rows.reduce((sum, r) => sum + r.clicks, 0);
  const totalImpressions = rows.reduce((sum, r) => sum + r.impressions, 0);
  const averageCtr = totalImpressions > 0 ? totalClicks / totalImpressions : 0;
  const averagePosition =
    rows.length > 0 ? rows.reduce((sum, r) => sum + r.position, 0) / rows.length : 0;

  return { rows, totalClicks, totalImpressions, averageCtr, averagePosition };
}

/**
 * Fetch top queries for a date range.
 */
export async function fetchTopQueries(
  startDate: string,
  endDate: string,
  limit = 10
): Promise<SearchConsoleRow[]> {
  const siteUrl = getSiteUrl();
  if (!siteUrl) throw new Error("GOOGLE_SEARCH_CONSOLE_SITE_URL non configuré");

  const token = await getAccessToken();
  const encodedSiteUrl = encodeURIComponent(siteUrl);

  const res = await fetch(
    `https://www.googleapis.com/webmasters/v3/sites/${encodedSiteUrl}/searchAnalytics/query`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions: ["query"],
        rowLimit: limit,
      }),
      cache: "no-store",
    }
  );

  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return (data.rows || []).map(
    (row: { keys: string[]; clicks: number; impressions: number; ctr: number; position: number }) => ({
      keys: row.keys,
      clicks: row.clicks,
      impressions: row.impressions,
      ctr: row.ctr,
      position: row.position,
    })
  );
}
