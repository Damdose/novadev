"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  MessageSquare,
  Phone,
  CalendarCheck,
  MessageCircle,
  Globe,
  Plus,
  Minus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
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

interface WeeklyKpi {
  id: string;
  weekStart: string;
  messagesWebflow: number;
  appelsCentre: number;
  rdvDoctolib: number;
  messagesDoctolib: number;
  traficSite: number;
}

// ─── Helpers ─────────────────────────────────────────────

function getMonday(d: Date): Date {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  date.setDate(diff);
  date.setHours(0, 0, 0, 0);
  return date;
}

function formatWeek(dateStr: string): string {
  const date = new Date(dateStr);
  const endOfWeek = new Date(date);
  endOfWeek.setDate(endOfWeek.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  return `${fmt(date)} - ${fmt(endOfWeek)}`;
}

function shortWeek(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
}

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

// ─── Small components ────────────────────────────────────

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

function CellTrend({ current, previous }: { current: number; previous?: number }) {
  if (previous === undefined) return <span className="tabular-nums">{current}</span>;
  const pct = pctChange(current, previous);
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="tabular-nums font-medium">{current}</span>
      {isUp && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
      {isDown && <ArrowDownRight className="h-3 w-3 text-red-500" />}
      {!isUp && !isDown && <Minus className="h-3 w-3 text-muted-foreground" />}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function SuiviPage() {
  const [kpis, setKpis] = useState<WeeklyKpi[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyKpi | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Sync states
  const [syncingWebflow, setSyncingWebflow] = useState(false);
  const [syncingTraffic, setSyncingTraffic] = useState(false);
  const [analyticsConnected, setAnalyticsConnected] = useState(false);

  const fetchKpis = useCallback(async () => {
    try {
      const res = await fetch("/api/kpi");
      const data = await res.json();
      setKpis(
        data.map((k: WeeklyKpi & { weekStart: string }) => ({
          ...k,
          weekStart: k.weekStart.split("T")[0],
        }))
      );
    } catch (e) {
      console.error("Failed to fetch KPIs:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const checkAnalytics = useCallback(async () => {
    try {
      const res = await fetch("/api/google/analytics");
      setAnalyticsConnected(res.status !== 401 && res.ok);
    } catch {
      setAnalyticsConnected(false);
    }
  }, []);

  useEffect(() => {
    fetchKpis();
    checkAnalytics();
  }, [fetchKpis, checkAnalytics]);

  // Auto-fetch Webflow count for a given week
  const autoSyncWebflow = async (weekStart: string) => {
    setSyncingWebflow(true);
    try {
      const res = await fetch(`/api/webflow?weekStart=${weekStart}`);
      if (res.ok) {
        const data = await res.json();
        if (data.count !== undefined) {
          setForm((prev) => ({ ...prev, messagesWebflow: data.count }));
        }
      }
    } catch (e) {
      console.error("Failed to sync Webflow:", e);
    } finally {
      setSyncingWebflow(false);
    }
  };

  const syncWeekTraffic = async (weekStart: string) => {
    setSyncingTraffic(true);
    try {
      const res = await fetch(`/api/google/analytics?mode=week&weekStart=${weekStart}`);
      const data = await res.json();
      if (data.sessions !== undefined) {
        setForm((prev) => ({ ...prev, traficSite: data.sessions }));
      }
    } catch (e) {
      console.error("Failed to sync traffic:", e);
    } finally {
      setSyncingTraffic(false);
    }
  };

  // KPI form
  const [form, setForm] = useState({
    weekStart: getMonday(new Date()).toISOString().split("T")[0],
    messagesWebflow: 0,
    appelsCentre: 0,
    rdvDoctolib: 0,
    messagesDoctolib: 0,
    traficSite: 0,
  });

  const latestKpi = kpis[0];
  const previousKpi = kpis[1];

  const totals = useMemo(() => {
    return kpis.reduce(
      (acc, kpi) => ({
        messagesWebflow: acc.messagesWebflow + kpi.messagesWebflow,
        appelsCentre: acc.appelsCentre + kpi.appelsCentre,
        rdvDoctolib: acc.rdvDoctolib + kpi.rdvDoctolib,
        messagesDoctolib: acc.messagesDoctolib + kpi.messagesDoctolib,
        traficSite: acc.traficSite + kpi.traficSite,
      }),
      { messagesWebflow: 0, appelsCentre: 0, rdvDoctolib: 0, messagesDoctolib: 0, traficSite: 0 }
    );
  }, [kpis]);

  const averages = useMemo(() => {
    const n = kpis.length || 1;
    return {
      messagesWebflow: Math.round(totals.messagesWebflow / n),
      appelsCentre: Math.round(totals.appelsCentre / n),
      rdvDoctolib: Math.round(totals.rdvDoctolib / n),
      messagesDoctolib: Math.round(totals.messagesDoctolib / n),
      traficSite: Math.round(totals.traficSite / n),
    };
  }, [kpis, totals]);

  // Chart data (reversed so oldest is first)
  const chartData = useMemo(() => {
    return [...kpis].reverse().map((k) => ({
      week: shortWeek(k.weekStart),
      "Messages Webflow": k.messagesWebflow,
      "Appels centre": k.appelsCentre,
      "RDV Doctolib": k.rdvDoctolib,
      "Messages Doctolib": k.messagesDoctolib,
      "Trafic site": k.traficSite,
    }));
  }, [kpis]);

  const openNew = () => {
    const weekStart = getMonday(new Date()).toISOString().split("T")[0];
    setEditing(null);
    setForm({
      weekStart,
      messagesWebflow: 0,
      appelsCentre: 0,
      rdvDoctolib: 0,
      messagesDoctolib: 0,
      traficSite: 0,
    });
    setDialogOpen(true);
    autoSyncWebflow(weekStart);
  };

  const openEdit = (kpi: WeeklyKpi) => {
    const weekStart = new Date(kpi.weekStart).toISOString().split("T")[0];
    setEditing(kpi);
    setForm({
      weekStart,
      messagesWebflow: kpi.messagesWebflow,
      appelsCentre: kpi.appelsCentre,
      rdvDoctolib: kpi.rdvDoctolib,
      messagesDoctolib: kpi.messagesDoctolib,
      traficSite: kpi.traficSite,
    });
    setDialogOpen(true);
    // Re-sync Webflow to get latest count
    autoSyncWebflow(weekStart);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/kpi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      await fetchKpis();
    } catch (e) {
      console.error("Failed to save KPI:", e);
    }
    setSaving(false);
    setDialogOpen(false);
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/kpi?id=${id}`, { method: "DELETE" });
      setKpis((prev) => prev.filter((k) => k.id !== id));
    } catch (e) {
      console.error("Failed to delete KPI:", e);
    }
  };

  const trendCharts = [
    { key: "Messages Webflow" as const, color: "#3b82f6", label: "Messages Webflow", icon: MessageSquare, value: latestKpi?.messagesWebflow ?? 0, previous: previousKpi?.messagesWebflow ?? 0, total: totals.messagesWebflow, avg: averages.messagesWebflow },
    { key: "Appels centre" as const, color: "#8b5cf6", label: "Appels centre", icon: Phone, value: latestKpi?.appelsCentre ?? 0, previous: previousKpi?.appelsCentre ?? 0, total: totals.appelsCentre, avg: averages.appelsCentre },
    { key: "RDV Doctolib" as const, color: "#10b981", label: "RDV Doctolib", icon: CalendarCheck, value: latestKpi?.rdvDoctolib ?? 0, previous: previousKpi?.rdvDoctolib ?? 0, total: totals.rdvDoctolib, avg: averages.rdvDoctolib },
    { key: "Messages Doctolib" as const, color: "#14b8a6", label: "Messages Doctolib", icon: MessageCircle, value: latestKpi?.messagesDoctolib ?? 0, previous: previousKpi?.messagesDoctolib ?? 0, total: totals.messagesDoctolib, avg: averages.messagesDoctolib },
    { key: "Trafic site" as const, color: "#f59e0b", label: "Trafic site", icon: Globe, value: latestKpi?.traficSite ?? 0, previous: previousKpi?.traficSite ?? 0, total: totals.traficSite, avg: averages.traficSite },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
            <p className="text-muted-foreground mt-1">
              Messages, appels et rendez-vous semaine par semaine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">{kpis.length} semaines</Badge>
            <Button onClick={openNew} className="gap-2" size="sm">
              <Plus className="h-4 w-4" />
              Ajouter une semaine
            </Button>
          </div>
        </div>

        {/* Trend charts */}
        {chartData.length > 1 && (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {trendCharts.map((chart) => (
              <Card key={chart.key}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <chart.icon className="h-4 w-4" style={{ color: chart.color }} />
                      <CardTitle className="text-sm font-medium">{chart.label}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold tabular-nums">{chart.value}</span>
                      <TrendBadge current={chart.value} previous={chart.previous} />
                    </div>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>Moy. {chart.avg}/sem</span>
                    <span>Total {chart.total.toLocaleString("fr-FR")}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`grad-${chart.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                        <XAxis dataKey="week" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} width={30} />
                        <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid hsl(var(--border))" }} />
                        <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={`url(#grad-${chart.key})`} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Table */}
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semaine</TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><MessageSquare className="h-3 w-3 text-blue-500" />Messages</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><Phone className="h-3 w-3 text-violet-500" />Appels</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><CalendarCheck className="h-3 w-3 text-emerald-500" />RDV</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><MessageCircle className="h-3 w-3 text-teal-500" />Msg Doctolib</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><Globe className="h-3 w-3 text-amber-500" />Trafic</div></TableHead>
                  <TableHead className="text-right w-[80px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {kpis.map((kpi, i) => {
                  const prev = kpis[i + 1];
                  const isLatest = i === 0;
                  return (
                    <TableRow key={kpi.id} className={isLatest ? "bg-muted/30" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatWeek(kpi.weekStart)}</span>
                          {isLatest && <Badge variant="outline" className="text-[10px] py-0">En cours</Badge>}
                        </div>
                      </TableCell>
                      <TableCell className="text-right"><CellTrend current={kpi.messagesWebflow} previous={prev?.messagesWebflow} /></TableCell>
                      <TableCell className="text-right"><CellTrend current={kpi.appelsCentre} previous={prev?.appelsCentre} /></TableCell>
                      <TableCell className="text-right"><CellTrend current={kpi.rdvDoctolib} previous={prev?.rdvDoctolib} /></TableCell>
                      <TableCell className="text-right"><CellTrend current={kpi.messagesDoctolib} previous={prev?.messagesDoctolib} /></TableCell>
                      <TableCell className="text-right"><CellTrend current={kpi.traficSite} previous={prev?.traficSite} /></TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(kpi)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(kpi.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 font-semibold bg-muted/20">
                  <TableCell>Total ({kpis.length} sem.)</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesWebflow}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.appelsCentre}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.rdvDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.traficSite.toLocaleString("fr-FR")}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow className="text-muted-foreground bg-muted/10">
                  <TableCell>Moyenne / sem.</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.messagesWebflow}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.appelsCentre}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.rdvDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.messagesDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.traficSite.toLocaleString("fr-FR")}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Dialog KPI */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Modifier les KPI" : "Ajouter les KPI de la semaine"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weekStart">Semaine du (lundi)</Label>
              <Input
                id="weekStart"
                type="date"
                value={form.weekStart}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({ ...prev, weekStart: val }));
                  autoSyncWebflow(val);
                }}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {/* Webflow — auto-synced, read-only */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="messagesWebflow">Messages Webflow</Label>
                  {syncingWebflow && <Loader2 className="h-3 w-3 animate-spin text-blue-500" />}
                  {!syncingWebflow && <Badge variant="outline" className="text-[10px] py-0 text-blue-600">Auto</Badge>}
                </div>
                <Input id="messagesWebflow" type="number" min={0} value={form.messagesWebflow} readOnly className="bg-muted/50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appelsCentre">Appels centre</Label>
                <Input id="appelsCentre" type="number" min={0} value={form.appelsCentre} onChange={(e) => setForm({ ...form, appelsCentre: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rdvDoctolib">RDV Doctolib</Label>
                <Input id="rdvDoctolib" type="number" min={0} value={form.rdvDoctolib} onChange={(e) => setForm({ ...form, rdvDoctolib: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messagesDoctolib">Messages Doctolib</Label>
                <Input id="messagesDoctolib" type="number" min={0} value={form.messagesDoctolib} onChange={(e) => setForm({ ...form, messagesDoctolib: parseInt(e.target.value) || 0 })} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="traficSite">Trafic site</Label>
                  {analyticsConnected && (
                    <Button type="button" variant="ghost" size="sm" className="h-6 text-xs gap-1 text-amber-600 hover:text-amber-700" onClick={() => syncWeekTraffic(form.weekStart)} disabled={syncingTraffic}>
                      {syncingTraffic ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                      Sync GA
                    </Button>
                  )}
                </div>
                <Input id="traficSite" type="number" min={0} value={form.traficSite} onChange={(e) => setForm({ ...form, traficSite: parseInt(e.target.value) || 0 })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={saving}>{editing ? "Modifier" : "Enregistrer"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
