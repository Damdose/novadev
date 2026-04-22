"use client";

import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Send,
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  ArrowRight,
  Mail,
  ThumbsUp,
  ExternalLink,
  MessageSquare,
  Phone,
  CalendarCheck,
  MessageCircle,
  Globe,
  MapPin,
  BarChart3,
  Activity,
  Target,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
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
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium px-1.5 py-0.5 rounded-md ${
        isUp ? "text-emerald-700 bg-emerald-50" : isDown ? "text-red-700 bg-red-50" : "text-gray-500 bg-gray-50"
      }`}
    >
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : isDown ? <ArrowDownRight className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
      {isUp ? "+" : ""}
      {pct}%
    </span>
  );
}

// ─── Mini area chart for KPI cards ───────────────────────────

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
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
          dot={false}
          activeDot={{ r: 3, strokeWidth: 0, fill: color }}
        />
        <Tooltip
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null;
            return (
              <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs font-semibold">
                {payload[0].value?.toLocaleString("fr-FR")}
              </div>
            );
          }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── Page ─────────────────────────────────────────────────────

export default function DashboardPage() {
  const [kpiHistory, setKpiHistory] = useState<KpiData[]>([]);
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [kpiRes, dashRes] = await Promise.all([
          fetch("/api/kpi"),
          fetch("/api/dashboard"),
        ]);
        const kpiData = await kpiRes.json();
        const dashData = await dashRes.json();

        // Format KPI history (reverse to chronological order)
        const formattedKpis = (Array.isArray(kpiData) ? kpiData : [])
          .reverse()
          .map((k: KpiData) => ({
            ...k,
            week: new Date(k.weekStart).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
          }));

        setKpiHistory(formattedKpis);
        setDashboard(dashData.error ? null : dashData);
      } catch (e) {
        console.error("Failed to fetch dashboard data:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-muted-foreground">Chargement...</div>
        </div>
      </DashboardLayout>
    );
  }

  const latestKpi = dashboard?.latestKpi;
  const previousKpi = dashboard?.previousKpi;
  const campaigns = dashboard?.campaigns || [];
  const responses = dashboard?.recentResponses || [];
  const totalResponses = dashboard?.totalResponses || 0;
  const positiveCount = dashboard?.positiveCount || 0;
  const negativeCount = totalResponses - positiveCount;
  const avgScore = dashboard?.avgScore || 0;
  const redirectedCount = dashboard?.redirectedCount || 0;
  const positiveRate = totalResponses > 0 ? Math.round((positiveCount / totalResponses) * 100) : 0;

  const hasKpiData = kpiHistory.length > 0 && latestKpi;

  const kpiCards = [
    {
      label: "Messages Webflow",
      value: latestKpi?.messagesWebflow ?? 0,
      previous: previousKpi?.messagesWebflow ?? 0,
      dataKey: "messagesWebflow",
      icon: MessageSquare,
      color: "#3b82f6",
      colorClass: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "Appels centre",
      value: latestKpi?.appelsCentre ?? 0,
      previous: previousKpi?.appelsCentre ?? 0,
      dataKey: "appelsCentre",
      icon: Phone,
      color: "#8b5cf6",
      colorClass: "text-violet-600",
      bg: "bg-violet-50",
    },
    {
      label: "RDV Doctolib",
      value: latestKpi?.rdvDoctolib ?? 0,
      previous: previousKpi?.rdvDoctolib ?? 0,
      dataKey: "rdvDoctolib",
      icon: CalendarCheck,
      color: "#10b981",
      colorClass: "text-emerald-600",
      bg: "bg-emerald-50",
    },
    {
      label: "Trafic site",
      value: latestKpi?.traficSite ?? 0,
      previous: previousKpi?.traficSite ?? 0,
      dataKey: "traficSite",
      icon: Globe,
      color: "#f59e0b",
      colorClass: "text-amber-600",
      bg: "bg-amber-50",
    },
  ];

  const activeCampaign = campaigns.find((c) => c.status === "sending");
  const openRate = activeCampaign ? Math.round((activeCampaign.openedCount / activeCampaign.sentCount) * 100) : 0;
  const completionRate = activeCampaign ? Math.round((activeCampaign.completedCount / activeCampaign.contactCount) * 100) : 0;

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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* ── Header ── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
            <p className="text-muted-foreground mt-1">
              {latestKpi ? `Semaine du ${formatWeek(latestKpi.weekStart)}` : "Aucune donnee KPI"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {activeCampaign && (
              <Badge variant="outline" className="gap-1.5 py-1 px-2.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Campagne active
              </Badge>
            )}
          </div>
        </div>

        {/* ── Empty state if no data ── */}
        {!hasKpiData && (
          <Card className="bg-muted/30">
            <CardContent className="pt-8 pb-8 text-center">
              <BarChart3 className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg">Aucune donnee KPI</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Commencez par ajouter vos KPI hebdomadaires
              </p>
              <Link href="/suivi">
                <Button className="gap-2">
                  <ArrowRight className="h-4 w-4" />
                  Ajouter des KPI
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* ── KPI Cards avec mini area charts ── */}
        {hasKpiData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  KPI Acquisition
                </h2>
              </div>
              <Link href="/suivi">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Historique complet <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

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
          </div>
        )}

        {/* ── Grand graphique acquisition ── */}
        {kpiHistory.length > 1 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Tendances d'acquisition</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Contacts entrants par canal sur les {kpiHistory.length} dernieres semaines
                </p>
              </div>
              <Link href="/suivi">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Details <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
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
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: "12px", paddingTop: "12px" }}
                  />
                  <Area type="monotone" dataKey="appelsCentre" name="Appels centre" stroke="#8b5cf6" strokeWidth={2} fill="url(#grad-appels)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="rdvDoctolib" name="RDV Doctolib" stroke="#10b981" strokeWidth={2} fill="url(#grad-rdv)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                  <Area type="monotone" dataKey="messagesWebflow" name="Messages Webflow" stroke="#3b82f6" strokeWidth={2} fill="url(#grad-webflow)" dot={false} activeDot={{ r: 4, strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Trafic site ── */}
        {kpiHistory.length > 1 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="text-base">Trafic du site</CardTitle>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Visiteurs hebdomadaires sur novadev.care
                </p>
              </div>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={kpiHistory} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad-trafic" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="week" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} width={45} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2 text-xs">
                          <p className="font-medium text-gray-700 mb-1">Semaine du {label}</p>
                          <p className="font-semibold text-amber-600">{payload[0].value?.toLocaleString("fr-FR")} visiteurs</p>
                        </div>
                      );
                    }}
                  />
                  <Area type="monotone" dataKey="traficSite" stroke="#f59e0b" strokeWidth={2.5} fill="url(#grad-trafic)" dot={{ r: 3, fill: "#f59e0b", strokeWidth: 0 }} activeDot={{ r: 5, strokeWidth: 0, fill: "#f59e0b" }} />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* ── Satisfaction & Avis ── */}
        {totalResponses > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Satisfaction & Avis
                </h2>
              </div>
              <Link href="/resultats">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Voir les resultats <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {/* Satisfaction summary */}
              <Card className="lg:col-span-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Satisfaction globale</CardTitle>
                  <p className="text-xs text-muted-foreground">{totalResponses} reponses totales</p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center">
                      <p className="text-3xl font-bold">{avgScore.toFixed(1)}</p>
                      <p className="text-xs text-muted-foreground">Score moyen /4</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold text-emerald-600">{positiveCount}</p>
                      <p className="text-xs text-muted-foreground">Positifs</p>
                    </div>
                    <div className="text-center">
                      <p className="text-3xl font-bold">{redirectedCount}</p>
                      <p className="text-xs text-muted-foreground">Rediriges Google</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Pie chart */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Repartition</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie
                        data={satisfactionPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={0}
                      >
                        {satisfactionPieData.map((entry, index) => (
                          <Cell key={index} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0];
                          return (
                            <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs">
                              <span className="font-semibold">{d.name} : {String(d.value)}</span>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center -mt-2">
                    <p className="text-3xl font-bold">{positiveRate}%</p>
                    <p className="text-xs text-muted-foreground">de satisfaction</p>
                  </div>
                  <div className="flex gap-6 mt-4 text-xs">
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
          </div>
        )}

        {/* ── Campagne active + Dernieres reponses ── */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Active campaign funnel */}
          {activeCampaign && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                  <CardTitle className="text-base">Campagne en cours</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">{activeCampaign.name}</p>
                </div>
                <Link href="/campagnes">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Voir <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} axisLine={false} tickLine={false} width={75} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border border-gray-200 rounded-md shadow-md px-2 py-1 text-xs font-semibold">
                            {payload[0].payload.name} : {String(payload[0].value)}
                          </div>
                        );
                      }}
                    />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={24}>
                      {funnelData.map((entry, index) => (
                        <Cell key={index} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Dernieres reponses */}
          {responses.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Dernieres reponses</CardTitle>
                <Link href="/resultats">
                  <Button variant="ghost" size="sm" className="gap-1 text-xs">
                    Tout voir <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-2">
                {responses.slice(0, 5).map((response) => (
                  <div key={response.id} className="flex items-center gap-3 rounded-lg border p-2.5">
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-semibold ${
                        response.isPositive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                      }`}
                    >
                      {response.contactName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{response.contactName}</p>
                      <p className="text-[11px] text-muted-foreground">{formatRelativeDate(response.completedAt)}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-sm font-semibold tabular-nums">{response.averageScore.toFixed(1)}</span>
                      {response.isPositive ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertCircle className="h-4 w-4 text-red-400" />
                      )}
                      {response.redirectedToGoogle && <ExternalLink className="h-3 w-3 text-muted-foreground" />}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        {/* ── Campagnes recentes ── */}
        {campaigns.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Send className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Campagnes recentes
                </h2>
              </div>
              <Link href="/campagnes">
                <Button variant="ghost" size="sm" className="gap-1 text-xs">
                  Gerer <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {campaigns.slice(0, 3).map((campaign) => {
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
                        <div>
                          <span className="text-muted-foreground">Contacts </span>
                          <span className="font-semibold">{campaign.contactCount}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Completion </span>
                          <span className="font-semibold">{cRate}%</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Positif </span>
                          <span className="font-semibold">{pRate}%</span>
                        </div>
                        <div className="flex-1">
                          <Progress value={cRate} className="h-1.5" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

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
                  <p className="text-sm text-muted-foreground">
                    Collectez de nouveaux avis et boostez votre fiche Google
                  </p>
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
