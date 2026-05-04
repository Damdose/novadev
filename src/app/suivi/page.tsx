"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  MessageSquare,
  Phone,
  CalendarCheck,
  MessageCircle,
  Globe,
  Minus,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Loader2,
  Check,
  Zap,
} from "lucide-react";
import { useDateRange, DateRangeSelector } from "@/components/date-range-selector";
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

function isCurrentWeek(dateStr: string): boolean {
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
  monday.setHours(0, 0, 0, 0);
  const ws = new Date(dateStr);
  ws.setHours(0, 0, 0, 0);
  return ws.getTime() === monday.getTime();
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

// ─── Inline editable cell ───────────────────────────────

function EditableCell({
  kpiId,
  field,
  value,
  previous,
  onSave,
}: {
  kpiId: string;
  field: string;
  value: number;
  previous?: number;
  onSave: (id: string, field: string, value: number) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [inputValue, setInputValue] = useState(String(value));
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = async () => {
    const newVal = parseInt(inputValue) || 0;
    if (newVal !== value) {
      setSaving(true);
      await onSave(kpiId, field, newVal);
      setSaving(false);
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center justify-end gap-1">
        <Input
          ref={inputRef}
          type="number"
          min={0}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleSave}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSave();
            if (e.key === "Escape") { setInputValue(String(value)); setEditing(false); }
          }}
          className="h-7 w-16 text-right text-sm tabular-nums px-1.5"
        />
        {saving && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
      </div>
    );
  }

  const pct = previous !== undefined ? pctChange(value, previous) : 0;
  const isUp = pct > 0;
  const isDown = pct < 0;

  return (
    <button
      onClick={() => setEditing(true)}
      className="flex items-center justify-end gap-1.5 w-full cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5 -mx-1 transition-colors group"
      title="Cliquer pour modifier"
    >
      <span className="tabular-nums font-medium">{value}</span>
      {previous !== undefined && (
        <>
          {isUp && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
          {isDown && <ArrowDownRight className="h-3 w-3 text-red-500" />}
          {!isUp && !isDown && <Minus className="h-3 w-3 text-muted-foreground" />}
        </>
      )}
    </button>
  );
}

// ─── Auto cell (read-only) ──────────────────────────────

function AutoCell({ value, previous }: { value: number; previous?: number }) {
  const pct = previous !== undefined ? pctChange(value, previous) : 0;
  const isUp = pct > 0;
  const isDown = pct < 0;
  return (
    <div className="flex items-center justify-end gap-1.5">
      <span className="tabular-nums font-medium">{value.toLocaleString("fr-FR")}</span>
      {previous !== undefined && (
        <>
          {isUp && <ArrowUpRight className="h-3 w-3 text-emerald-500" />}
          {isDown && <ArrowDownRight className="h-3 w-3 text-red-500" />}
          {!isUp && !isDown && <Minus className="h-3 w-3 text-muted-foreground" />}
        </>
      )}
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────

export default function SuiviPage() {
  const [kpis, setKpis] = useState<WeeklyKpi[]>([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);
  const [syncing, setSyncing] = useState<string | null>(null);
  const { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, range } = useDateRange("all");

  const fetchKpis = useCallback(async () => {
    try {
      const res = await fetch("/api/kpi");
      const data = await res.json();
      setKpis(
        (Array.isArray(data) ? data : []).map((k: WeeklyKpi & { weekStart: string }) => ({
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

  // Auto-seed last 8 weeks on mount
  const seedWeeks = useCallback(async () => {
    setSeeding(true);
    try {
      const res = await fetch("/api/kpi/seed", { method: "POST" });
      const data = await res.json();
      if (data.kpis) {
        setKpis(
          data.kpis.map((k: WeeklyKpi & { weekStart: string }) => ({
            ...k,
            weekStart: k.weekStart.split("T")[0],
          }))
        );
      }
    } catch (e) {
      console.error("Failed to seed KPIs:", e);
      await fetchKpis();
    } finally {
      setSeeding(false);
      setLoading(false);
    }
  }, [fetchKpis]);

  useEffect(() => {
    seedWeeks();
  }, [seedWeeks]);

  // Inline save handler
  const handleInlineSave = async (id: string, field: string, value: number) => {
    try {
      const res = await fetch("/api/kpi", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, field, value }),
      });
      if (res.ok) {
        setKpis((prev) =>
          prev.map((k) => (k.id === id ? { ...k, [field]: value } : k))
        );
      }
    } catch (e) {
      console.error("Failed to save:", e);
    }
  };

  // Sync auto data for a specific week via server-side route
  const syncAutoData = async (kpi: WeeklyKpi) => {
    setSyncing(kpi.id);
    try {
      const res = await fetch("/api/kpi/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: kpi.id, weekStart: kpi.weekStart }),
      });
      if (res.ok) {
        const updated = await res.json();
        setKpis((prev) =>
          prev.map((k) =>
            k.id === kpi.id
              ? { ...k, messagesWebflow: updated.messagesWebflow, traficSite: updated.traficSite }
              : k
          )
        );
      }
    } catch (e) {
      console.error("Sync error:", e);
    } finally {
      setSyncing(null);
    }
  };

  // Filter KPIs by date range
  const filteredKpis = useMemo(() => {
    return kpis.filter((k) => {
      const ws = k.weekStart.split("T")[0];
      return ws >= range.startDate && ws <= range.endDate;
    });
  }, [kpis, range.startDate, range.endDate]);

  const latestKpi = filteredKpis[0];
  const previousKpi = filteredKpis[1];

  const totals = useMemo(() => {
    return filteredKpis.reduce(
      (acc, kpi) => ({
        messagesWebflow: acc.messagesWebflow + kpi.messagesWebflow,
        appelsCentre: acc.appelsCentre + kpi.appelsCentre,
        rdvDoctolib: acc.rdvDoctolib + kpi.rdvDoctolib,
        messagesDoctolib: acc.messagesDoctolib + kpi.messagesDoctolib,
        traficSite: acc.traficSite + kpi.traficSite,
      }),
      { messagesWebflow: 0, appelsCentre: 0, rdvDoctolib: 0, messagesDoctolib: 0, traficSite: 0 }
    );
  }, [filteredKpis]);

  const averages = useMemo(() => {
    const n = filteredKpis.length || 1;
    return {
      messagesWebflow: Math.round(totals.messagesWebflow / n),
      appelsCentre: Math.round(totals.appelsCentre / n),
      rdvDoctolib: Math.round(totals.rdvDoctolib / n),
      messagesDoctolib: Math.round(totals.messagesDoctolib / n),
      traficSite: Math.round(totals.traficSite / n),
    };
  }, [filteredKpis, totals]);

  // Chart data
  const chartData = useMemo(() => {
    return [...filteredKpis].reverse().map((k) => ({
      week: shortWeek(k.weekStart),
      "Messages Webflow": k.messagesWebflow,
      "Appels centre": k.appelsCentre,
      "RDV Doctolib": k.rdvDoctolib,
      "Messages Doctolib": k.messagesDoctolib,
      "Trafic site": k.traficSite,
    }));
  }, [filteredKpis]);

  const trendCharts = [
    { key: "Messages Webflow" as const, color: "#3b82f6", label: "Messages Webflow", icon: MessageSquare, value: latestKpi?.messagesWebflow ?? 0, previous: previousKpi?.messagesWebflow ?? 0, total: totals.messagesWebflow, avg: averages.messagesWebflow },
    { key: "Appels centre" as const, color: "#8b5cf6", label: "Appels centre", icon: Phone, value: latestKpi?.appelsCentre ?? 0, previous: previousKpi?.appelsCentre ?? 0, total: totals.appelsCentre, avg: averages.appelsCentre },
    { key: "RDV Doctolib" as const, color: "#10b981", label: "RDV Doctolib", icon: CalendarCheck, value: latestKpi?.rdvDoctolib ?? 0, previous: previousKpi?.rdvDoctolib ?? 0, total: totals.rdvDoctolib, avg: averages.rdvDoctolib },
    { key: "Messages Doctolib" as const, color: "#14b8a6", label: "Messages Doctolib", icon: MessageCircle, value: latestKpi?.messagesDoctolib ?? 0, previous: previousKpi?.messagesDoctolib ?? 0, total: totals.messagesDoctolib, avg: averages.messagesDoctolib },
    { key: "Trafic site" as const, color: "#f59e0b", label: "Trafic site", icon: Globe, value: latestKpi?.traficSite ?? 0, previous: previousKpi?.traficSite ?? 0, total: totals.traficSite, avg: averages.traficSite },
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
            <p className="text-sm text-muted-foreground">
              {seeding ? "Génération des semaines..." : "Chargement..."}
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Metrics</h1>
            <p className="text-muted-foreground mt-1">
              Messages et trafic auto-synchronisés — appels, RDV et messages Doctolib à saisir manuellement
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
            <Badge variant="outline" className="text-xs">{filteredKpis.length} semaines</Badge>
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

        {/* Table with inline editing */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-base">Détail par semaine</CardTitle>
                <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                  <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-blue-500" />Auto</span>
                  <span className="flex items-center gap-1"><Minus className="h-3 w-3" />Cliquer pour modifier</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semaine</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <MessageSquare className="h-3 w-3 text-blue-500" />Messages
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-blue-600">Auto</Badge>
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Globe className="h-3 w-3 text-amber-500" />Trafic
                      <Badge variant="outline" className="text-[9px] py-0 px-1 text-amber-600">Auto</Badge>
                    </div>
                  </TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><Phone className="h-3 w-3 text-violet-500" />Appels</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><CalendarCheck className="h-3 w-3 text-emerald-500" />RDV</div></TableHead>
                  <TableHead className="text-right"><div className="flex items-center justify-end gap-1.5"><MessageCircle className="h-3 w-3 text-teal-500" />Msg Doctolib</div></TableHead>
                  <TableHead className="text-right w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredKpis.map((kpi, i) => {
                  const prev = filteredKpis[i + 1];
                  const isCurrent = isCurrentWeek(kpi.weekStart);
                  const isSyncing = syncing === kpi.id;
                  return (
                    <TableRow key={kpi.id} className={isCurrent ? "bg-muted/30" : ""}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{formatWeek(kpi.weekStart)}</span>
                          {isCurrent && <Badge variant="outline" className="text-[10px] py-0">En cours</Badge>}
                        </div>
                      </TableCell>
                      {/* Auto columns (read-only) */}
                      <TableCell className="text-right">
                        <AutoCell value={kpi.messagesWebflow} previous={prev?.messagesWebflow} />
                      </TableCell>
                      <TableCell className="text-right">
                        <AutoCell value={kpi.traficSite} previous={prev?.traficSite} />
                      </TableCell>
                      {/* Manual columns (editable) */}
                      <TableCell className="text-right">
                        <EditableCell kpiId={kpi.id} field="appelsCentre" value={kpi.appelsCentre} previous={prev?.appelsCentre} onSave={handleInlineSave} />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableCell kpiId={kpi.id} field="rdvDoctolib" value={kpi.rdvDoctolib} previous={prev?.rdvDoctolib} onSave={handleInlineSave} />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableCell kpiId={kpi.id} field="messagesDoctolib" value={kpi.messagesDoctolib} previous={prev?.messagesDoctolib} onSave={handleInlineSave} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => syncAutoData(kpi)}
                          disabled={isSyncing}
                          title="Re-synchroniser messages et trafic"
                        >
                          {isSyncing ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <TableRow className="border-t-2 font-semibold bg-muted/20">
                  <TableCell>Total ({filteredKpis.length} sem.)</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesWebflow}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.traficSite.toLocaleString("fr-FR")}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.appelsCentre}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.rdvDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesDoctolib}</TableCell>
                  <TableCell />
                </TableRow>
                <TableRow className="text-muted-foreground bg-muted/10">
                  <TableCell>Moyenne / sem.</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.messagesWebflow}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.traficSite.toLocaleString("fr-FR")}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.appelsCentre}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.rdvDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{averages.messagesDoctolib}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
