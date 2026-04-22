"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Search,
  MousePointerClick,
  Eye,
  TrendingUp,
  Hash,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  FileText,
  Database,
  ExternalLink,
} from "lucide-react";
import { DateRangeSelector, useDateRange } from "@/components/date-range-selector";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

// ─── Types ───────────────────────────────────────────────

interface SearchConsoleRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

interface SearchConsoleData {
  rows: SearchConsoleRow[];
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

// ─── Helpers ─────────────────────────────────────────────

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatScDate(d: string): string {
  return `${d.slice(8, 10)}/${d.slice(5, 7)}`;
}

// ─── Small components ────────────────────────────────────

function MetricCard({
  label,
  value,
  icon: Icon,
  color,
  bg,
  suffix,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  bg: string;
  suffix?: string;
}) {
  const formatted = typeof value === "number" ? value.toLocaleString("fr-FR") : value;
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatted}{suffix}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${color} ${bg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ────────────────────────────────────────────────

interface PageRow {
  keys: string[];
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
}

export default function SeoPage() {
  const [searchConsole, setSearchConsole] = useState<SearchConsoleData | null>(null);
  const [topQueries, setTopQueries] = useState<SearchConsoleRow[]>([]);
  const [topPages, setTopPages] = useState<PageRow[]>([]);
  const [isStatic, setIsStatic] = useState(false);
  const [loading, setLoading] = useState(false);
  const dateRange = useDateRange(90);

  const fetchSearchConsole = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange.range;
      const [perfRes, queriesRes, pagesRes] = await Promise.all([
        fetch(`/api/google/search-console?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/google/search-console?mode=queries&limit=20&startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/google/search-console?mode=pages&limit=20&startDate=${startDate}&endDate=${endDate}`),
      ]);
      const perfData = await perfRes.json();
      const queriesData = await queriesRes.json();
      const pagesData = await pagesRes.json();
      if (!perfData.error) {
        setSearchConsole(perfData);
        setIsStatic(!!perfData.static);
      }
      if (!queriesData.error) setTopQueries(queriesData.queries || []);
      if (!pagesData.error) setTopPages(pagesData.pages || []);
    } catch (e) {
      console.error("Failed to fetch Search Console:", e);
    } finally {
      setLoading(false);
    }
  }, [dateRange.range.startDate, dateRange.range.endDate]);

  useEffect(() => {
    fetchSearchConsole();
  }, [fetchSearchConsole]);

  const chartData = useMemo(() => {
    if (!searchConsole) return [];
    return searchConsole.rows.map((r) => ({
      date: formatScDate(r.keys[0]),
      Clics: r.clicks,
      Impressions: r.impressions,
    }));
  }, [searchConsole]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SEO</h1>
            <p className="text-muted-foreground mt-1">
              Google Search Console — clics, impressions et requêtes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeSelector
              preset={dateRange.preset}
              onPresetChange={dateRange.setPreset}
              customStart={dateRange.customStart}
              onCustomStartChange={dateRange.setCustomStart}
              customEnd={dateRange.customEnd}
              onCustomEndChange={dateRange.setCustomEnd}
            />
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={fetchSearchConsole}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Actualiser
            </Button>
          </div>
        </div>

        {/* Bandeau données statiques */}
        {isStatic && (
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800">
            <Database className="h-4 w-4 shrink-0" />
            <span>
              Données statiques (export GSC du 22/04/2026) — la connexion API Search Console n&apos;est pas encore active.
            </span>
          </div>
        )}

        {searchConsole ? (
          <>
            {/* Metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Clics" value={searchConsole.totalClicks} icon={MousePointerClick} color="text-violet-600" bg="bg-violet-50" />
              <MetricCard label="Impressions" value={searchConsole.totalImpressions} icon={Eye} color="text-sky-600" bg="bg-sky-50" />
              <MetricCard label="CTR moyen" value={(searchConsole.averageCtr * 100).toFixed(1)} icon={TrendingUp} color="text-emerald-600" bg="bg-emerald-50" suffix="%" />
              <MetricCard label="Position moyenne" value={searchConsole.averagePosition.toFixed(1)} icon={Hash} color="text-amber-600" bg="bg-amber-50" />
            </div>

            {/* Chart + Top queries */}
            <div className="grid gap-4 lg:grid-cols-5">
              <Card className="lg:col-span-3">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clics et impressions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[350px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id="scClics" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="scImpressions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                        <YAxis tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
                        <Area type="monotone" dataKey="Clics" stroke="#8b5cf6" fill="url(#scClics)" strokeWidth={2} />
                        <Area type="monotone" dataKey="Impressions" stroke="#0ea5e9" fill="url(#scImpressions)" strokeWidth={1.5} strokeDasharray="4 2" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 max-h-[450px] overflow-y-auto">
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Search className="h-4 w-4" />
                    Top requêtes Google
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topQueries.length > 0 ? (
                    <div className="space-y-2.5">
                      {topQueries.map((q, i) => {
                        const maxClicks = topQueries[0]?.clicks || 1;
                        return (
                          <div key={i} className="space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span className="truncate pr-2">{q.keys[0]}</span>
                              <div className="flex items-center gap-2 shrink-0 text-xs">
                                <span className="font-semibold tabular-nums text-violet-600">{q.clicks} clics</span>
                                <span className="text-muted-foreground tabular-nums">{q.impressions} imp.</span>
                              </div>
                            </div>
                            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                              <div
                                className="h-full rounded-full bg-violet-500 transition-all"
                                style={{ width: `${(q.clicks / maxClicks) * 100}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground py-4 text-center">Aucune donnée disponible</p>
                  )}
                </CardContent>
              </Card>
            </div>
            {/* Top pages */}
            {topPages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Top pages
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 pr-4 font-medium">Page</th>
                          <th className="pb-2 px-3 font-medium text-right">Clics</th>
                          <th className="pb-2 px-3 font-medium text-right">Impressions</th>
                          <th className="pb-2 px-3 font-medium text-right">CTR</th>
                          <th className="pb-2 pl-3 font-medium text-right">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topPages.map((p, i) => {
                          const path = p.keys[0].replace("https://novadev.care", "");
                          return (
                            <tr key={i} className="border-b border-muted/50 last:border-0">
                              <td className="py-2.5 pr-4">
                                <span className="text-xs text-muted-foreground truncate max-w-[400px] block">
                                  {path || "/"}
                                </span>
                              </td>
                              <td className="py-2.5 px-3 text-right font-semibold tabular-nums text-violet-600">{p.clicks}</td>
                              <td className="py-2.5 px-3 text-right tabular-nums text-muted-foreground">{p.impressions}</td>
                              <td className="py-2.5 px-3 text-right tabular-nums">{(p.ctr * 100).toFixed(1)}%</td>
                              <td className="py-2.5 pl-3 text-right tabular-nums">{p.position.toFixed(1)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des données Search Console...
                </div>
              ) : (
                "Aucune donnée Search Console disponible"
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
