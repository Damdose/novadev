"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  FileText,
  UserPlus,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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

interface AnalyticsRow {
  date: string;
  sessions: number;
  users: number;
  pageviews: number;
  newUsers: number;
}

interface AnalyticsData {
  rows: AnalyticsRow[];
  totalSessions: number;
  totalUsers: number;
  totalPageviews: number;
  totalNewUsers: number;
}

// ─── Helpers ─────────────────────────────────────────────

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatGaDate(d: string): string {
  return `${d.slice(6, 8)}/${d.slice(4, 6)}`;
}

// ─── Small components ────────────────────────────────────

function MetricCard({
  label,
  value,
  previousValue,
  icon: Icon,
  color,
  bg,
}: {
  label: string;
  value: number;
  previousValue?: number;
  icon: React.ElementType;
  color: string;
  bg: string;
}) {
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold tabular-nums">
                {value.toLocaleString("fr-FR")}
              </p>
              {previousValue !== undefined && (
                <TrendBadge current={value} previous={previousValue} />
              )}
            </div>
          </div>
          <div className={`rounded-xl p-2.5 ${color} ${bg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrendBadge({ current, previous }: { current: number; previous: number }) {
  const pct = pctChange(current, previous);
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
        isUp ? "text-emerald-700 bg-emerald-50" : isDown ? "text-red-700 bg-red-50" : "text-gray-500 bg-gray-50"
      }`}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : isDown ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {isUp ? "+" : ""}{pct}%
    </span>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function TraficPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [prevAnalytics, setPrevAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const dateRange = useDateRange(30);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const { startDate, endDate } = dateRange.range;

      // Previous period of same length for comparison
      const days = Math.round(
        (new Date(endDate).getTime() - new Date(startDate).getTime()) / 86400000
      );
      const prevEnd = new Date(startDate);
      prevEnd.setDate(prevEnd.getDate() - 1);
      const prevStart = new Date(prevEnd);
      prevStart.setDate(prevStart.getDate() - days);

      const [currentRes, prevRes] = await Promise.all([
        fetch(`/api/google/analytics?startDate=${startDate}&endDate=${endDate}`),
        fetch(`/api/google/analytics?startDate=${prevStart.toISOString().split("T")[0]}&endDate=${prevEnd.toISOString().split("T")[0]}`),
      ]);

      const currentData = await currentRes.json();
      const prevData = await prevRes.json();

      if (!currentData.error) setAnalytics(currentData);
      if (!prevData.error) setPrevAnalytics(prevData);
    } catch (e) {
      console.error("Failed to fetch analytics:", e);
    } finally {
      setLoading(false);
    }
  }, [dateRange.range.startDate, dateRange.range.endDate]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const chartData = useMemo(() => {
    if (!analytics) return [];
    return analytics.rows.map((r) => ({
      date: formatGaDate(r.date),
      Sessions: r.sessions,
      Utilisateurs: r.users,
      "Pages vues": r.pageviews,
    }));
  }, [analytics]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Trafic</h1>
            <p className="text-muted-foreground mt-1">
              Google Analytics — sessions, utilisateurs et pages vues
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
              onClick={fetchAnalytics}
              disabled={loading}
            >
              {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Actualiser
            </Button>
          </div>
        </div>

        {analytics ? (
          <>
            {/* Metric cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricCard label="Sessions" value={analytics.totalSessions} previousValue={prevAnalytics?.totalSessions} icon={Activity} color="text-amber-600" bg="bg-amber-50" />
              <MetricCard label="Utilisateurs" value={analytics.totalUsers} previousValue={prevAnalytics?.totalUsers} icon={Users} color="text-blue-600" bg="bg-blue-50" />
              <MetricCard label="Pages vues" value={analytics.totalPageviews} previousValue={prevAnalytics?.totalPageviews} icon={FileText} color="text-emerald-600" bg="bg-emerald-50" />
              <MetricCard label="Nouveaux utilisateurs" value={analytics.totalNewUsers} previousValue={prevAnalytics?.totalNewUsers} icon={UserPlus} color="text-violet-600" bg="bg-violet-50" />
            </div>

            {/* Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">Sessions et utilisateurs</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="gaSessions" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gaUsers" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(var(--border))" }} />
                      <Area type="monotone" dataKey="Sessions" stroke="#f59e0b" fill="url(#gaSessions)" strokeWidth={2} />
                      <Area type="monotone" dataKey="Utilisateurs" stroke="#3b82f6" fill="url(#gaUsers)" strokeWidth={1.5} strokeDasharray="4 2" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Chargement des données Analytics...
                </div>
              ) : (
                "Aucune donnée Google Analytics disponible"
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
