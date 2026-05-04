"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useDateRange, DateRangeSelector } from "@/components/date-range-selector";
import {
  Users,
  Send,
  Star,
  TrendingUp,
  Minus,
  ArrowRight,
  Mail,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  MessageSquare,
  Phone,
  CalendarCheck,
  Globe,
  BarChart3,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
  Search,
  MousePointerClick,
  Eye,
  Hash,
  FileText,
  UserPlus,
  MailOpen,
  LinkIcon,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

// ─── Types ───────────────────────────────────────────────

interface KpiData {
  id: string;
  weekStart: string;
  week: string;
  messagesWebflow: number;
  appelsCentre: number;
  rdvDoctolib: number;
  messagesDoctolib: number;
  traficSite: number;
}

interface DashboardData {
  contactCount: number;
  avgScore: number;
  positiveCount: number;
  totalResponses: number;
  redirectedCount: number;
  campaigns: Array<{
    id: string;
    name: string;
    status: string;
    contactCount: number;
    sentCount: number;
    openedCount: number;
    completedCount: number;
    positiveCount: number;
    negativeCount: number;
    createdAt: string;
  }>;
  recentResponses: Array<{
    id: string;
    contactName: string;
    averageScore: number;
    isPositive: boolean;
    redirectedToGoogle: boolean;
    completedAt: string;
  }>;
  latestKpi: {
    weekStart: string;
    messagesWebflow: number;
    appelsCentre: number;
    rdvDoctolib: number;
    traficSite: number;
  } | null;
  previousKpi: {
    messagesWebflow: number;
    appelsCentre: number;
    rdvDoctolib: number;
    traficSite: number;
  } | null;
}

interface AnalyticsData {
  rows: Array<{ date: string; sessions: number; users: number; pageviews: number; newUsers: number }>;
  totalSessions: number;
  totalUsers: number;
  totalPageviews: number;
  totalNewUsers: number;
}

interface SeoData {
  rows: Array<{ keys: string[]; clicks: number; impressions: number; ctr: number; position: number }>;
  totalClicks: number;
  totalImpressions: number;
  averageCtr: number;
  averagePosition: number;
}

interface GoogleReviewsData {
  reviews: Array<{
    reviewId: string;
    reviewer: { displayName: string };
    starRating: string;
    comment?: string;
    createTime: string;
    reviewReply?: { comment: string };
  }>;
  totalReviewCount: number;
  averageRating: number;
  locationName: string;
}

interface MailTracking {
  id: string;
  emailSent: boolean;
  emailOpened: boolean;
  contactStatus: string;
}

// ─── Helpers ──────────────────────────────────────────────────

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; dot: string }> = {
  draft: { label: "Brouillon", variant: "outline", dot: "bg-gray-400" },
  sending: { label: "En cours", variant: "default", dot: "bg-blue-500" },
  sent: { label: "Envoyee", variant: "secondary", dot: "bg-amber-500" },
  completed: { label: "Terminee", variant: "secondary", dot: "bg-emerald-500" },
};

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

function formatWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const endOfWeek = new Date(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(date)} - ${fmt(endOfWeek)}`;
}

function formatRelativeDate(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Hier";
  if (diffDays < 7) return `Il y a ${diffDays} jours`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

const STAR_MAP: Record<string, number> = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };

// ─── Custom tooltip ──────────────────────────────────────────

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-medium text-gray-700 mb-1">Semaine du {label}</p>
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: entry.color }} />
          <span className="text-gray-500">{entry.name} :</span>
          <span className="font-semibold">{entry.value.toLocaleString("fr-FR")}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Evolution badge ──────────────────────────────────────────

function EvolutionBadge({ current, previous }: { current: number; previous: number }) {
  const pct = pctChange(current, previous);
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${isUp ? "text-emerald-700 bg-emerald-50" : isDown ? "text-red-700 bg-red-50" : "text-gray-500 bg-gray-50"}`}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : isDown ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {isUp ? "+" : ""}{pct}%
    </span>
  );
}

// ─── Mini area chart ─────────────────────────────────────────

function MiniAreaChart({ data, dataKey, color }: { data: KpiData[]; dataKey: string; color: string }) {
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.05} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fill={`url(#gradient-${dataKey})`} dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: color }} />
        <Tooltip content={({ active, payload }) => {
          if (!active || !payload?.length) return null;
          return <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs font-semibold">{payload[0].value?.toLocaleString("fr-FR")}</div>;
        }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Section header ──────────────────────────────────────────

function SectionHeader({ icon: Icon, title, href, linkText }: { icon: React.ElementType; title: string; href: string; linkText: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</h2>
      </div>
      <Link href={href}>
        <Button variant="ghost" size="sm" className="gap-1 text-xs">{linkText} <ArrowRight className="h-3 w-3" /></Button>
      </Link>
    </div>
  );
}

// ─── Stat card ───────────────────────────────────────────────

function StatCard({ label, value, suffix, icon: Icon, colorClass, bg }: { label: string; value: string | number; suffix?: string; icon: React.ElementType; colorClass: string; bg: string }) {
  const formatted = typeof value === "number" ? value.toLocaleString("fr-FR") : value;
  return (
    <Card>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums">
              {formatted}
              {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
            </p>
          </div>
          <div className={`rounded-xl p-2.5 ${colorClass} ${bg}`}>
            <Icon className="h-4 w-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Empty placeholder for a section ─────────────────────────

function EmptySection({ icon: Icon, message, linkHref, linkText }: { icon: React.ElementType; message: string; linkHref: string; linkText: string }) {
  return (
    <Card className="border-dashed">
      <CardContent className="py-8 text-center">
        <Icon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">{message}</p>
        <Link href={linkHref}>
          <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
            {linkText} <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [kpiHistory, setKpiHistory] = useState<KpiData[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [seo, setSeo] = useState<SeoData | null>(null);
  const [googleReviews, setGoogleReviews] = useState<GoogleReviewsData | null>(null);
  const [mailTracking, setMailTracking] = useState<MailTracking[]>([]);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, range } = useDateRange(30);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiRes, dashRes, statusRes, trackingRes] = await Promise.all([
          fetch("/api/kpi"),
          fetch("/api/dashboard"),
          fetch("/api/google/status"),
          fetch("/api/mail/tracking").catch(() => null),
        ]);
        const kpiData = await kpiRes.json();
        const dashData = await dashRes.json();
        const statusData = await statusRes.json();

        if (trackingRes?.ok) {
          const tData = await trackingRes.json();
          if (Array.isArray(tData)) setMailTracking(tData);
        }

        const formattedKpis = (Array.isArray(kpiData) ? kpiData : [])
          .reverse()
          .map((k: KpiData) => ({
            ...k,
            week: new Date(k.weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
          }));

        setKpiHistory(formattedKpis);
        setDashboard(dashData.error ? null : dashData);
        setGoogleConnected(statusData.authenticated === true);

        if (statusData.authenticated) {
          const [analyticsRes, seoRes, reviewsRes] = await Promise.all([
            fetch(`/api/google/analytics?startDate=${range.startDate}&endDate=${range.endDate}`).catch(() => null),
            fetch(`/api/google/search-console?startDate=${range.startDate}&endDate=${range.endDate}`).catch(() => null),
            fetch("/api/google/reviews").catch(() => null),
          ]);
          if (analyticsRes?.ok) { const d = await analyticsRes.json(); if (!d.error) setAnalytics(d); }
          if (seoRes?.ok) { const d = await seoRes.json(); if (!d.error) setSeo(d); }
          if (reviewsRes?.ok) { const d = await reviewsRes.json(); if (!d.error) setGoogleReviews(d); }
        }
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [range.startDate, range.endDate]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  // Filter KPI history by date range
  const filteredKpiHistory = kpiHistory.filter((k) => {
    const ws = k.weekStart.split("T")[0];
    return ws >= range.startDate && ws <= range.endDate;
  });

  const latestKpi = dashboard?.latestKpi;
  const previousKpi = dashboard?.previousKpi;
  const campaigns = dashboard?.campaigns || [];
  const allResponses = dashboard?.recentResponses || [];
  const responses = allResponses.filter((r) => {
    const d = r.completedAt.split("T")[0];
    return d >= range.startDate && d <= range.endDate;
  });
  const totalResponses = dashboard?.totalResponses || 0;
  const positiveCount = dashboard?.positiveCount || 0;
  const negativeCount = totalResponses - positiveCount;
  const avgScore = dashboard?.avgScore || 0;
  const redirectedCount = dashboard?.redirectedCount || 0;
  const contactCount = dashboard?.contactCount || 0;
  const positiveRate = totalResponses > 0 ? Math.round((positiveCount / totalResponses) * 100) : 0;
  const hasKpiData = kpiHistory.length > 0 && latestKpi;

  const kpiCards = [
    { label: "Messages Webflow", value: latestKpi?.messagesWebflow ?? 0, previous: previousKpi?.messagesWebflow ?? 0, dataKey: "messagesWebflow", icon: MessageSquare, color: "#3b82f6", colorClass: "text-blue-600", bg: "bg-blue-50" },
    { label: "Appels centre", value: latestKpi?.appelsCentre ?? 0, previous: previousKpi?.appelsCentre ?? 0, dataKey: "appelsCentre", icon: Phone, color: "#8b5cf6", colorClass: "text-violet-600", bg: "bg-violet-50" },
    { label: "RDV Doctolib", value: latestKpi?.rdvDoctolib ?? 0, previous: previousKpi?.rdvDoctolib ?? 0, dataKey: "rdvDoctolib", icon: CalendarCheck, color: "#10b981", colorClass: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Trafic site", value: latestKpi?.traficSite ?? 0, previous: previousKpi?.traficSite ?? 0, dataKey: "traficSite", icon: Globe, color: "#f59e0b", colorClass: "text-amber-600", bg: "bg-amber-50" },
  ];

  const activeCampaign = campaigns.find((c) => c.status === "sending");

  const satisfactionPieData = [
    { name: "Positifs", value: positiveCount, fill: "#10b981" },
    { name: "Negatifs", value: negativeCount, fill: "#ef4444" },
  ];

  const funnelData = activeCampaign
    ? [
        { name: "Envoyes", value: activeCampaign.sentCount, fill: "#6366f1" },
        { name: "Ouverts", value: activeCampaign.openedCount, fill: "#3b82f6" },
        { name: "Repondus", value: activeCampaign.completedCount, fill: "#10b981" },
        { name: "Positifs", value: activeCampaign.positiveCount, fill: "#f59e0b" },
      ]
    : [];

  const starDistribution = googleReviews?.reviews
    ? [5, 4, 3, 2, 1].map((stars) => ({
        stars,
        count: googleReviews.reviews.filter((r) => STAR_MAP[r.starRating] === stars).length,
      }))
    : [];

  // Mail tracking stats
  const mailSent = mailTracking.filter((t) => t.emailSent).length;
  const mailOpened = mailTracking.filter((t) => t.emailOpened).length;
  const mailCompleted = mailTracking.filter((t) => t.contactStatus === "completed").length;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              Vue d'ensemble de toutes vos metriques
              {latestKpi && <span className="ml-1">— Semaine du {formatWeek(latestKpi.weekStart)}</span>}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DateRangeSelector
              preset={preset}
              onPresetChange={setPreset}
              customStart={customStart}
              onCustomStartChange={setCustomStart}
              customEnd={customEnd}
              onCustomEndChange={setCustomEnd}
            />
            {activeCampaign && (
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Campagne active
              </Badge>
            )}
            {googleConnected ? (
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-blue-600 border-blue-200">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                Google connecte
              </Badge>
            ) : (
              <Link href="/parametres">
                <Badge variant="outline" className="gap-1.5 py-1 px-2.5 text-amber-600 border-amber-200 cursor-pointer hover:bg-amber-50">
                  <LinkIcon className="h-3 w-3" />
                  Connecter Google
                </Badge>
              </Link>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 1 : KPI Acquisition
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={BarChart3} title="KPI Acquisition" href="/suivi" linkText="Historique complet" />

          {hasKpiData ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {kpiCards.map((stat) => (
                  <Card key={stat.label} className="relative overflow-hidden">
                    <CardContent className="pt-5 pb-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">{stat.label}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString("fr-FR")}</p>
                            {previousKpi && <EvolutionBadge current={stat.value} previous={stat.previous} />}
                          </div>
                        </div>
                        <div className={`rounded-xl p-2.5 ${stat.colorClass} ${stat.bg}`}>
                          <stat.icon className="h-4 w-4" />
                        </div>
                      </div>
                      {kpiHistory.length > 1 && (
                        <div className="mt-2 -mx-2">
                          <MiniAreaChart data={kpiHistory} dataKey={stat.dataKey} color={stat.color} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Tendances graphique */}
              {kpiHistory.length > 1 && (
                <Card className="mt-4">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Tendances d'acquisition</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Contacts entrants par canal sur les {kpiHistory.length} dernieres semaines
                      </p>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={260}>
                      <AreaChart data={kpiHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad-webflow" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="grad-appels" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                          </linearGradient>
                          <linearGradient id="grad-rdv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#10b981" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }} />
                        <Area type="monotone" dataKey="appelsCentre" name="Appels centre" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad-appels)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="rdvDoctolib" name="RDV Doctolib" stroke="#10b981" strokeWidth={2} fill="url(#grad-rdv)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                        <Area type="monotone" dataKey="messagesWebflow" name="Messages Webflow" stroke="#3b82f6" strokeWidth={2} fill="url(#grad-webflow)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptySection icon={BarChart3} message="Aucune donnee KPI — Ajoutez vos metriques hebdomadaires" linkHref="/suivi" linkText="Ajouter des KPI" />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 2 : Trafic du site (Google Analytics)
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={Activity} title="Trafic du site" href="/trafic" linkText="Voir le detail" />

          {analytics ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Sessions" value={analytics.totalSessions} icon={Activity} colorClass="text-indigo-600" bg="bg-indigo-50" />
                <StatCard label="Utilisateurs" value={analytics.totalUsers} icon={Users} colorClass="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Pages vues" value={analytics.totalPageviews} icon={FileText} colorClass="text-cyan-600" bg="bg-cyan-50" />
                <StatCard label="Nouveaux utilisateurs" value={analytics.totalNewUsers} icon={UserPlus} colorClass="text-teal-600" bg="bg-teal-50" />
              </div>
              {analytics.rows.length > 1 && (
                <Card className="mt-4">
                  <CardContent className="pt-4 pb-2">
                    <ResponsiveContainer width="100%" height={160}>
                      <AreaChart data={analytics.rows.map((r) => ({ ...r, dateLabel: `${r.date.slice(6, 8)}/${r.date.slice(4, 6)}` }))} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="grad-sessions" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity={0.2} />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="dateLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={35} />
                        <Tooltip content={({ active, payload, label }) => {
                          if (!active || !payload?.length) return null;
                          return (
                            <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                              <p className="font-medium text-gray-700 mb-1">{label}</p>
                              <p className="text-indigo-600 font-semibold">{payload[0].value?.toLocaleString("fr-FR")} sessions</p>
                            </div>
                          );
                        }} />
                        <Area type="monotone" dataKey="sessions" stroke="#6366f1" strokeWidth={2} fill="url(#grad-sessions)" dot={false} activeDot={{ r: 3, strokeWidth: 0, fill: "#6366f1" }} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptySection icon={Activity} message={googleConnected ? "Donnees Analytics indisponibles" : "Connectez Google pour voir le trafic du site"} linkHref={googleConnected ? "/trafic" : "/parametres"} linkText={googleConnected ? "Voir le trafic" : "Connecter Google"} />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 3 : SEO (Search Console)
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={Search} title="SEO - Search Console" href="/seo" linkText="Voir le detail" />

          {seo ? (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Clics" value={seo.totalClicks} icon={MousePointerClick} colorClass="text-blue-600" bg="bg-blue-50" />
                <StatCard label="Impressions" value={seo.totalImpressions} icon={Eye} colorClass="text-purple-600" bg="bg-purple-50" />
                <StatCard label="CTR moyen" value={`${(seo.averageCtr * 100).toFixed(1)}%`} icon={TrendingUp} colorClass="text-emerald-600" bg="bg-emerald-50" />
                <StatCard label="Position moyenne" value={seo.averagePosition.toFixed(1)} icon={Hash} colorClass="text-amber-600" bg="bg-amber-50" />
              </div>
              {seo.rows.length > 0 && (
                <Card className="mt-4">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Top requetes de recherche</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {seo.rows.slice(0, 5).map((row, i) => (
                        <div key={i} className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-xs text-muted-foreground font-mono w-4 text-right shrink-0">{i + 1}</span>
                            <span className="truncate">{row.keys[0]}</span>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                            <span><strong className="text-foreground">{row.clicks}</strong> clics</span>
                            <span><strong className="text-foreground">{row.impressions.toLocaleString("fr-FR")}</strong> imp.</span>
                            <span className="w-12 text-right"><strong className="text-foreground">{(row.ctr * 100).toFixed(1)}%</strong></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <EmptySection icon={Search} message={googleConnected ? "Donnees Search Console indisponibles" : "Connectez Google pour voir les metriques SEO"} linkHref={googleConnected ? "/seo" : "/parametres"} linkText={googleConnected ? "Voir le SEO" : "Connecter Google"} />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 4 : Avis Google
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={Star} title="Avis Google" href="/avis" linkText="Gerer les avis" />

          {googleReviews ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card>
                <CardContent className="pt-5 pb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold">{googleReviews.averageRating.toFixed(1)}</p>
                    <div className="flex items-center justify-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`h-4 w-4 ${s <= Math.round(googleReviews.averageRating) ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{googleReviews.totalReviewCount} avis au total</p>
                    {googleReviews.locationName && <p className="text-xs text-muted-foreground mt-0.5">{googleReviews.locationName}</p>}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Repartition des notes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {starDistribution.map(({ stars, count }) => {
                      const pct = googleReviews.reviews.length > 0 ? Math.round((count / googleReviews.reviews.length) * 100) : 0;
                      return (
                        <div key={stars} className="flex items-center gap-2 text-sm">
                          <span className="w-3 text-right text-xs text-muted-foreground">{stars}</span>
                          <Star className="h-3 w-3 text-amber-400 fill-amber-400" />
                          <div className="flex-1">
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground w-8 text-right">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Derniers avis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {googleReviews.reviews.length > 0 ? googleReviews.reviews.slice(0, 4).map((review) => (
                    <div key={review.reviewId} className="text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{review.reviewer.displayName}</span>
                        <div className="flex gap-0.5">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star key={s} className={`h-2.5 w-2.5 ${s <= STAR_MAP[review.starRating] ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                          ))}
                        </div>
                      </div>
                      {review.comment && <p className="text-muted-foreground mt-0.5 line-clamp-2">{review.comment}</p>}
                    </div>
                  )) : <p className="text-xs text-muted-foreground">Aucun avis</p>}
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptySection icon={Star} message={googleConnected ? "Donnees Google Avis indisponibles" : "Connectez Google pour voir vos avis"} linkHref={googleConnected ? "/avis" : "/parametres"} linkText={googleConnected ? "Voir les avis" : "Connecter Google"} />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 5 : Satisfaction (enquetes)
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={ThumbsUp} title="Satisfaction" href="/resultats" linkText="Voir les resultats" />

          {totalResponses > 0 ? (
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Satisfaction globale</CardTitle>
                  <p className="text-xs text-muted-foreground">{totalResponses} reponses totales</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{avgScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Score /4</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{positiveCount}</p>
                      <p className="text-xs text-muted-foreground">Positifs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-red-500">{negativeCount}</p>
                      <p className="text-xs text-muted-foreground">Negatifs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{redirectedCount}</p>
                      <p className="text-xs text-muted-foreground">Rediriges Google</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="flex flex-col items-center pt-5 pb-4">
                  <ResponsiveContainer width="100%" height={120}>
                    <PieChart>
                      <Pie data={satisfactionPieData} cx="50%" cy="50%" innerRadius={36} outerRadius={55} paddingAngle={3} dataKey="value" strokeWidth={0}>
                        {satisfactionPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const d = payload[0];
                        return <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs"><span className="font-semibold">{d.name} : {String(d.value)}</span></div>;
                      }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <p className="text-2xl font-bold -mt-1">{positiveRate}%</p>
                  <p className="text-xs text-muted-foreground">de satisfaction</p>
                  <div className="flex gap-5 mt-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground">Positifs</span>
                      <span className="font-semibold">{positiveCount}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                      <span className="text-muted-foreground">Negatifs</span>
                      <span className="font-semibold">{negativeCount}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <EmptySection icon={ThumbsUp} message="Aucune reponse de satisfaction — Lancez une campagne pour collecter des avis" linkHref="/campagnes" linkText="Lancer une campagne" />
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 6 : Emails & Contacts
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={Mail} title="Emails & Contacts" href="/mail" linkText="Voir le suivi" />

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Contacts" value={contactCount} icon={Users} colorClass="text-gray-600" bg="bg-gray-50" />
            <StatCard label="Emails envoyes" value={mailSent} icon={Send} colorClass="text-blue-600" bg="bg-blue-50" />
            <StatCard label="Emails ouverts" value={mailOpened} icon={MailOpen} colorClass="text-violet-600" bg="bg-violet-50" />
            <StatCard label="Enquetes completees" value={mailCompleted} icon={CheckCircle2} colorClass="text-emerald-600" bg="bg-emerald-50" />
            <StatCard label="Taux d'ouverture" value={mailSent > 0 ? `${Math.round((mailOpened / mailSent) * 100)}%` : "—"} icon={Eye} colorClass="text-amber-600" bg="bg-amber-50" />
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            SECTION 7 : Campagnes & Dernieres reponses
        ════════════════════════════════════════════════════════ */}
        <div>
          <SectionHeader icon={Send} title="Campagnes" href="/campagnes" linkText="Gerer" />

          <div className="grid gap-4 lg:grid-cols-2">
            {/* Active campaign funnel OR recent campaigns */}
            <div className="space-y-3">
              {activeCampaign ? (
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="text-base">Campagne en cours</CardTitle>
                      <p className="text-xs text-muted-foreground mt-0.5">{activeCampaign.name}</p>
                    </div>
                    <Badge variant="default" className="gap-1.5 text-[11px]">
                      <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                      En cours
                    </Badge>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={180}>
                      <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={75} />
                        <Tooltip content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          return <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs font-semibold">{payload[0].payload.name} : {String(payload[0].value)}</div>;
                        }} />
                        <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                          {funnelData.map((entry, index) => (
                            <Cell key={index} fill={entry.fill} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              ) : campaigns.length > 0 ? (
                campaigns.slice(0, 3).map((campaign) => {
                  const cRate = campaign.contactCount > 0 ? Math.round((campaign.completedCount / campaign.contactCount) * 100) : 0;
                  const pRate = campaign.completedCount > 0 ? Math.round((campaign.positiveCount / campaign.completedCount) * 100) : 0;
                  const cfg = statusConfig[campaign.status] || statusConfig.draft;
                  return (
                    <Card key={campaign.id}>
                      <CardContent className="pt-4 pb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <p className="font-medium text-sm">{campaign.name}</p>
                            <Badge variant={cfg.variant} className="gap-1.5 text-[11px]">
                              <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                              {cfg.label}
                            </Badge>
                          </div>
                          <span className="text-xs text-muted-foreground">{new Date(campaign.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}</span>
                        </div>
                        <div className="flex items-center gap-6 text-xs">
                          <div><span className="text-muted-foreground">Contacts </span><span className="font-semibold">{campaign.contactCount}</span></div>
                          <div><span className="text-muted-foreground">Completion </span><span className="font-semibold">{cRate}%</span></div>
                          <div><span className="text-muted-foreground">Positif </span><span className="font-semibold">{pRate}%</span></div>
                          <div className="flex-1"><Progress value={cRate} className="h-1.5" /></div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              ) : (
                <Card className="border-dashed">
                  <CardContent className="py-8 text-center">
                    <Send className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune campagne</p>
                    <Link href="/campagnes">
                      <Button variant="outline" size="sm" className="mt-3 gap-1.5 text-xs">
                        Creer une campagne <ArrowRight className="h-3 w-3" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Dernieres reponses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Dernieres reponses</CardTitle>
                <Link href="/resultats">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">Tout voir <ArrowRight className="h-3 w-3" /></Button>
                </Link>
              </CardHeader>
              <CardContent>
                {responses.length > 0 ? (
                  <div className="space-y-2">
                    {responses.slice(0, 5).map((response) => (
                      <div key={response.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${response.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
                          {response.contactName.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{response.contactName}</p>
                          <p className="text-[11px] text-muted-foreground">{formatRelativeDate(response.completedAt)}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-sm font-semibold tabular-nums">{response.averageScore.toFixed(1)}</span>
                          {response.isPositive ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <AlertCircle className="h-4 w-4 text-red-400" />}
                          {response.redirectedToGoogle && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    <MessageSquare className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune reponse pour le moment</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* ── CTA ── */}
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lancer une nouvelle campagne</p>
                  <p className="text-sm text-muted-foreground">Collectez de nouveaux avis et boostez votre fiche Google</p>
                </div>
              </div>
              <Link href="/campagnes">
                <Button className="gap-2">
                  <Send className="h-4 w-4" />
                  Nouvelle campagne
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
