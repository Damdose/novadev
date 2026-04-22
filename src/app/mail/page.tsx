"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Mail,
  Send,
  Eye,
  Save,
  Star,
  CheckCircle2,
  Clock,
  MailOpen,
  FileText,
  Loader2,
  Search,
  Users,
  ExternalLink,
} from "lucide-react";

interface Settings {
  senderName: string;
  senderEmail: string;
  positiveTitle: string;
  positiveMessage: string;
  buttonText: string;
}

interface TrackingEntry {
  id: string;
  campaignId: string;
  campaignName: string;
  contactId: string;
  firstName: string;
  lastName: string;
  email: string;
  emailSent: boolean;
  emailOpened: boolean;
  sentAt: string | null;
  openedAt: string | null;
  contactStatus: string;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  pending: { label: "En attente", icon: <Clock className="h-3.5 w-3.5" />, color: "text-muted-foreground" },
  sent: { label: "Envoyé", icon: <Send className="h-3.5 w-3.5" />, color: "text-blue-600" },
  opened: { label: "Ouvert", icon: <MailOpen className="h-3.5 w-3.5" />, color: "text-violet-600" },
  completed: { label: "Répondu", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-emerald-600" },
};

export default function MailPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<Settings>({ senderName: "", senderEmail: "", positiveTitle: "", positiveMessage: "", buttonText: "" });
  const [tracking, setTracking] = useState<TrackingEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterCampaign, setFilterCampaign] = useState<string>("all");

  // Email template state
  const [subject, setSubject] = useState(
    "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?"
  );
  const [body, setBody] = useState(
    `Bonjour {prénom},

Nous espérons que le bilan de votre enfant au centre Novadev s'est bien déroulé.

Votre retour est précieux pour nous permettre d'améliorer continuellement la qualité de nos services. Cela ne prend que 2 minutes.

Merci pour votre confiance,
L'équipe Novadev`
  );

  useEffect(() => {
    Promise.all([
      fetch("/api/settings").then((r) => r.ok ? r.json() : {}),
      fetch("/api/mail/tracking").then((r) => r.ok ? r.json() : []),
    ]).then(([settingsData, trackingData]: [Record<string, string>, TrackingEntry[]]) => {
      setSettings({
        senderName: settingsData.senderName || "Novadev",
        senderEmail: settingsData.senderEmail || "contact@novadev.care",
        positiveTitle: settingsData.positiveTitle || "Votre expérience a été positive !",
        positiveMessage: settingsData.positiveMessage || "Partagez votre avis sur Google pour aider d'autres familles",
        buttonText: settingsData.buttonText || "Laisser un avis Google",
      });
      setTracking(trackingData);
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleSaveTemplate = async () => {
    setSaving(true);
    try {
      await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ defaultSubject: subject, defaultBody: body }),
      });
    } finally {
      setSaving(false);
    }
  };

  // Filters
  const campaigns = Array.from(new Set(tracking.map((t) => t.campaignName)));

  const filtered = tracking.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      `${entry.firstName} ${entry.lastName} ${entry.email}`
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesStatus =
      filterStatus === "all" || entry.contactStatus === filterStatus;

    const matchesCampaign =
      filterCampaign === "all" || entry.campaignName === filterCampaign;

    return matchesSearch && matchesStatus && matchesCampaign;
  });

  // Stats
  const totalSent = tracking.filter((t) => t.emailSent).length;
  const totalOpened = tracking.filter((t) => t.emailOpened).length;
  const totalCompleted = tracking.filter((t) => t.contactStatus === "completed").length;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Mail</h1>
          <p className="text-muted-foreground mt-1">
            Éditez le template d&apos;email et suivez les envois
          </p>
        </div>

        <Tabs defaultValue="editor">
          <TabsList>
            <TabsTrigger value="editor" className="gap-2">
              <Mail className="h-4 w-4" />
              Éditeur
            </TabsTrigger>
            <TabsTrigger value="tracking" className="gap-2">
              <Users className="h-4 w-4" />
              Suivi des envois
              {tracking.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {tracking.length}
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* Email Editor Tab */}
          <TabsContent value="editor" className="mt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Editor */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Template de l&apos;email
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label>Objet</Label>
                      <Input
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        placeholder="Objet de l'email..."
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Corps du message</Label>
                      <Textarea
                        rows={10}
                        value={body}
                        onChange={(e) => setBody(e.target.value)}
                        placeholder="Rédigez votre message..."
                      />
                      <p className="text-xs text-muted-foreground">
                        Utilisez <code className="bg-muted px-1 py-0.5 rounded">{"{prénom}"}</code> pour
                        personnaliser le message. Le lien vers la LP satisfaction est ajouté automatiquement
                        via le bouton CTA.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Expéditeur</Label>
                        <p className="text-sm">{settings.senderName}</p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Email</Label>
                        <p className="text-sm text-muted-foreground">{settings.senderEmail}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      Aperçu
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden">
                      <div className="bg-muted/50 px-4 py-3 border-b space-y-0.5">
                        <p className="text-xs text-muted-foreground">
                          De : {settings.senderName} &lt;{settings.senderEmail}&gt;
                        </p>
                        <p className="text-xs text-muted-foreground">Objet : {subject}</p>
                      </div>
                      <div className="p-6 space-y-4 bg-white">
                        <div className="flex items-center gap-2 mb-4">
                          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            N
                          </div>
                          <span className="font-semibold text-sm">Novadev</span>
                        </div>
                        <div className="text-sm whitespace-pre-line text-muted-foreground">
                          {body.replace("{prénom}", "Marie")}
                        </div>
                        <div className="text-center pt-2">
                          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-semibold">
                            <Star className="h-4 w-4" />
                            Donner mon avis
                          </div>
                        </div>
                        <p className="text-[10px] text-center text-muted-foreground pt-2 border-t">
                          Centre Novadev — 15 rue Beudant, 75017 Paris
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Le bouton redirige vers <code className="bg-muted px-1 py-0.5 rounded">/satisfaction?cid=...&uid=...</code>
                    </p>
                  </CardContent>
                </Card>

                {/* Google Redirect Preview */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      Aperçu — Redirection Google (retour positif)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white">
                      <div className="p-6">
                        <div className="flex items-center justify-center gap-2 mb-6">
                          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                            N
                          </div>
                          <span className="font-semibold text-sm">Novadev</span>
                        </div>

                        <div className="max-w-xs mx-auto text-center space-y-4">
                          <div className="flex justify-center">
                            <div className="rounded-full bg-emerald-50 p-3">
                              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <h3 className="text-lg font-bold tracking-tight">
                              {settings.positiveTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              Vos réponses nous aident à améliorer la qualité de nos services pour mieux accompagner les familles.
                            </p>
                          </div>

                          <div className="rounded-lg border bg-amber-50/50 border-amber-200/50 p-3 space-y-1.5">
                            <div className="flex items-center justify-center gap-0.5">
                              {[1, 2, 3, 4, 5].map((i) => (
                                <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                              ))}
                            </div>
                            <p className="text-xs font-medium">Votre expérience a été positive !</p>
                            <p className="text-xs text-muted-foreground">{settings.positiveMessage}</p>
                          </div>

                          <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2 rounded-lg text-sm font-semibold">
                            <Star className="h-3.5 w-3.5" />
                            {settings.buttonText}
                            <ExternalLink className="h-3 w-3" />
                          </div>

                          <p className="text-[10px] text-muted-foreground">
                            Cela ne prend que 30 secondes et aide beaucoup d&apos;autres familles
                          </p>
                        </div>

                        <p className="text-[10px] text-center text-muted-foreground pt-4 mt-4 border-t">
                          Centre Novadev — 15 rue Beudant, 75017 Paris
                        </p>
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-3">
                      Page affichée après une enquête positive. Le bouton redirige vers votre fiche Google.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Tracking Tab */}
          <TabsContent value="tracking" className="mt-6">
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-muted p-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{tracking.length}</p>
                        <p className="text-xs text-muted-foreground">Total</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-blue-50 p-2">
                        <Send className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalSent}</p>
                        <p className="text-xs text-muted-foreground">Envoyés</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-violet-50 p-2">
                        <MailOpen className="h-4 w-4 text-violet-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalOpened}</p>
                        <p className="text-xs text-muted-foreground">Ouverts</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-emerald-50 p-2">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      </div>
                      <div>
                        <p className="text-2xl font-bold">{totalCompleted}</p>
                        <p className="text-xs text-muted-foreground">Répondu</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="pt-4 pb-4">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un contact..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="pending">En attente</option>
                      <option value="sent">Envoyé</option>
                      <option value="opened">Ouvert</option>
                      <option value="completed">Répondu</option>
                    </select>
                    {campaigns.length > 1 && (
                      <select
                        value={filterCampaign}
                        onChange={(e) => setFilterCampaign(e.target.value)}
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      >
                        <option value="all">Toutes les campagnes</option>
                        {campaigns.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Table */}
              {filtered.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                    <p className="font-medium">Aucun envoi</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {tracking.length === 0
                        ? "Créez une campagne et envoyez des emails pour voir le suivi ici"
                        : "Aucun résultat ne correspond à vos filtres"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="p-0">
                    <div className="overflow-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b bg-muted/50">
                            <th className="text-left p-3 font-medium">Contact</th>
                            <th className="text-left p-3 font-medium">Email</th>
                            <th className="text-left p-3 font-medium">Campagne</th>
                            <th className="text-left p-3 font-medium">Statut</th>
                            <th className="text-left p-3 font-medium">Envoyé le</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filtered.map((entry) => {
                            const status = statusConfig[entry.contactStatus] || statusConfig.pending;
                            return (
                              <tr key={entry.id} className="border-b last:border-0 hover:bg-muted/30">
                                <td className="p-3 font-medium">
                                  {entry.firstName} {entry.lastName}
                                </td>
                                <td className="p-3 text-muted-foreground">{entry.email}</td>
                                <td className="p-3">
                                  <Badge variant="outline" className="text-xs font-normal">
                                    {entry.campaignName}
                                  </Badge>
                                </td>
                                <td className="p-3">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${status.color}`}>
                                    {status.icon}
                                    {status.label}
                                  </span>
                                </td>
                                <td className="p-3 text-muted-foreground text-xs">
                                  {entry.sentAt
                                    ? new Date(entry.sentAt).toLocaleDateString("fr-FR", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })
                                    : "—"}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
