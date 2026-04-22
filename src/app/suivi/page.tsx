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
  TrendingUp,
  TrendingDown,
  Minus,
  Pencil,
  Trash2,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
} from "lucide-react";

interface WeeklyKpi {
  id: string;
  weekStart: string;
  messagesWebflow: number;
  appelsCentre: number;
  rdvDoctolib: number;
  messagesDoctolib: number;
  traficSite: number;
}

// ─── Helpers ──────────────────────────────────────────────

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

function pctChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

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
      {isUp ? "+" : ""}{pct}%
    </span>
  );
}

function Sparkline({ data, color }: { data: number[]; color: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  return (
    <div className="flex items-end gap-[3px] h-8">
      {data.map((value, i) => (
        <div
          key={i}
          className={`rounded-sm w-[5px] transition-all ${color} ${i === data.length - 1 ? "opacity-100" : "opacity-40"}`}
          style={{ height: `${Math.max(((value - min) / range) * 100, 12)}%` }}
        />
      ))}
    </div>
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

// ─── Page ─────────────────────────────────────────────────

export default function SuiviPage() {
  const [kpis, setKpis] = useState<WeeklyKpi[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<WeeklyKpi | null>(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchKpis = useCallback(async () => {
    try {
      const res = await fetch("/api/kpi");
      const data = await res.json();
      setKpis(
        data.map((k: { id: string; weekStart: string; messagesWebflow: number; appelsCentre: number; rdvDoctolib: number; messagesDoctolib: number; traficSite: number }) => ({
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

  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

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

  const openNew = () => {
    setEditing(null);
    setForm({
      weekStart: getMonday(new Date()).toISOString().split("T")[0],
      messagesWebflow: 0,
      appelsCentre: 0,
      rdvDoctolib: 0,
      messagesDoctolib: 0,
      traficSite: 0,
    });
    setDialogOpen(true);
  };

  const openEdit = (kpi: WeeklyKpi) => {
    setEditing(kpi);
    setForm({
      weekStart: new Date(kpi.weekStart).toISOString().split("T")[0],
      messagesWebflow: kpi.messagesWebflow,
      appelsCentre: kpi.appelsCentre,
      rdvDoctolib: kpi.rdvDoctolib,
      messagesDoctolib: kpi.messagesDoctolib,
      traficSite: kpi.traficSite,
    });
    setDialogOpen(true);
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

  const statCards = [
    {
      label: "Messages Webflow",
      value: latestKpi?.messagesWebflow ?? 0,
      previous: previousKpi?.messagesWebflow ?? 0,
      total: totals.messagesWebflow,
      avg: averages.messagesWebflow,
      sparkData: [...kpis].reverse().map((k) => k.messagesWebflow),
      icon: MessageSquare,
      color: "text-blue-600",
      bg: "bg-blue-50",
      sparkColor: "bg-blue-500",
    },
    {
      label: "Appels centre",
      value: latestKpi?.appelsCentre ?? 0,
      previous: previousKpi?.appelsCentre ?? 0,
      total: totals.appelsCentre,
      avg: averages.appelsCentre,
      sparkData: [...kpis].reverse().map((k) => k.appelsCentre),
      icon: Phone,
      color: "text-violet-600",
      bg: "bg-violet-50",
      sparkColor: "bg-violet-500",
    },
    {
      label: "RDV Doctolib",
      value: latestKpi?.rdvDoctolib ?? 0,
      previous: previousKpi?.rdvDoctolib ?? 0,
      total: totals.rdvDoctolib,
      avg: averages.rdvDoctolib,
      sparkData: [...kpis].reverse().map((k) => k.rdvDoctolib),
      icon: CalendarCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      sparkColor: "bg-emerald-500",
    },
    {
      label: "Messages Doctolib",
      value: latestKpi?.messagesDoctolib ?? 0,
      previous: previousKpi?.messagesDoctolib ?? 0,
      total: totals.messagesDoctolib,
      avg: averages.messagesDoctolib,
      sparkData: [...kpis].reverse().map((k) => k.messagesDoctolib),
      icon: MessageCircle,
      color: "text-teal-600",
      bg: "bg-teal-50",
      sparkColor: "bg-teal-500",
    },
    {
      label: "Trafic site",
      value: latestKpi?.traficSite ?? 0,
      previous: previousKpi?.traficSite ?? 0,
      total: totals.traficSite,
      avg: averages.traficSite,
      sparkData: [...kpis].reverse().map((k) => k.traficSite),
      icon: Globe,
      color: "text-amber-600",
      bg: "bg-amber-50",
      sparkColor: "bg-amber-500",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Suivi KPI</h1>
            <p className="text-muted-foreground mt-1">
              Suivez vos indicateurs clés semaine par semaine
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {kpis.length} semaines enregistrées
            </Badge>
            <Button onClick={openNew} className="gap-2">
              <Plus className="h-4 w-4" />
              Ajouter une semaine
            </Button>
          </div>
        </div>

        {/* KPI summary cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {statCards.map((stat) => (
            <Card key={stat.label} className="relative overflow-hidden">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold tabular-nums">{stat.value.toLocaleString("fr-FR")}</p>
                      <EvolutionBadge current={stat.value} previous={stat.previous} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>Moy. {stat.avg.toLocaleString("fr-FR")}/sem</span>
                      <span>Total {stat.total.toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                  <div className={`rounded-xl p-2.5 ${stat.color} ${stat.bg}`}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <Sparkline data={stat.sparkData} color={stat.sparkColor} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Table */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Historique hebdomadaire</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Semaine</TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <MessageSquare className="h-3 w-3 text-blue-500" />
                      Messages
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Phone className="h-3 w-3 text-violet-500" />
                      Appels
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <CalendarCheck className="h-3 w-3 text-emerald-500" />
                      RDV
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <MessageCircle className="h-3 w-3 text-teal-500" />
                      Msg Doctolib
                    </div>
                  </TableHead>
                  <TableHead className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Globe className="h-3 w-3 text-amber-500" />
                      Trafic
                    </div>
                  </TableHead>
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
                          {isLatest && (
                            <Badge variant="outline" className="text-[10px] py-0">
                              En cours
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <CellTrend current={kpi.messagesWebflow} previous={prev?.messagesWebflow} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CellTrend current={kpi.appelsCentre} previous={prev?.appelsCentre} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CellTrend current={kpi.rdvDoctolib} previous={prev?.rdvDoctolib} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CellTrend current={kpi.messagesDoctolib} previous={prev?.messagesDoctolib} />
                      </TableCell>
                      <TableCell className="text-right">
                        <CellTrend current={kpi.traficSite} previous={prev?.traficSite} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-0.5">
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => openEdit(kpi)}>
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => handleDelete(kpi.id)}>
                            <Trash2 className="h-3.5 w-3.5 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow className="border-t-2 font-semibold bg-muted/20">
                  <TableCell>Total ({kpis.length} semaines)</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesWebflow}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.appelsCentre}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.rdvDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.messagesDoctolib}</TableCell>
                  <TableCell className="text-right tabular-nums">{totals.traficSite.toLocaleString("fr-FR")}</TableCell>
                  <TableCell />
                </TableRow>
                {/* Average row */}
                <TableRow className="text-muted-foreground bg-muted/10">
                  <TableCell>Moyenne / semaine</TableCell>
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

      {/* Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Modifier les KPI" : "Ajouter les KPI de la semaine"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="weekStart">Semaine du (lundi)</Label>
              <Input
                id="weekStart"
                type="date"
                value={form.weekStart}
                onChange={(e) => setForm({ ...form, weekStart: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="messagesWebflow">Messages Webflow</Label>
                <Input
                  id="messagesWebflow"
                  type="number"
                  min={0}
                  value={form.messagesWebflow}
                  onChange={(e) => setForm({ ...form, messagesWebflow: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="appelsCentre">Appels centre</Label>
                <Input
                  id="appelsCentre"
                  type="number"
                  min={0}
                  value={form.appelsCentre}
                  onChange={(e) => setForm({ ...form, appelsCentre: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rdvDoctolib">RDV Doctolib</Label>
                <Input
                  id="rdvDoctolib"
                  type="number"
                  min={0}
                  value={form.rdvDoctolib}
                  onChange={(e) => setForm({ ...form, rdvDoctolib: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="messagesDoctolib">Messages Doctolib</Label>
                <Input
                  id="messagesDoctolib"
                  type="number"
                  min={0}
                  value={form.messagesDoctolib}
                  onChange={(e) => setForm({ ...form, messagesDoctolib: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="traficSite">Trafic site</Label>
                <Input
                  id="traficSite"
                  type="number"
                  min={0}
                  value={form.traficSite}
                  onChange={(e) => setForm({ ...form, traficSite: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {editing ? "Modifier" : "Enregistrer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
