"use client";

import { useState, useEffect, useRef } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Send,
  Plus,
  Eye,
  Users,
  Mail,
  CheckCircle2,
  Star,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Upload,
  Search,
  Trash2,
  FileSpreadsheet,
  Clock,
} from "lucide-react";
import Papa from "papaparse";
import { useDateRange, DateRangeSelector } from "@/components/date-range-selector";

interface Campaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  contactCount: number;
  sentCount: number;
  openedCount: number;
  completedCount: number;
  positiveCount: number;
  negativeCount: number;
  createdAt: string;
  status: string;
}

interface Section {
  id: number;
  title: string;
  questions: { id: number; text: string }[];
}

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  importedAt: string;
  status: string;
}

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sending: { label: "En cours", variant: "default" },
  sent: { label: "Envoyée", variant: "secondary" },
  completed: { label: "Terminée", variant: "default" },
};

const contactStatusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  pending: { label: "En attente", variant: "outline" },
  sent: { label: "Envoyé", variant: "secondary" },
  opened: { label: "Ouvert", variant: "default" },
  completed: { label: "Répondu", variant: "default" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const { preset, setPreset, customStart, setCustomStart, customEnd, setCustomEnd, range } = useDateRange("all");
  const [showNew, setShowNew] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [creating, setCreating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
  const [importPreview, setImportPreview] = useState<Partial<Contact>[]>([]);
  const [contactSearch, setContactSearch] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?",
    body: `Bonjour {prénom},

Nous espérons que le bilan de votre enfant au centre Novadev s'est bien déroulé.

Votre retour est précieux pour nous permettre d'améliorer continuellement la qualité de nos services. Cela ne prend que 2 minutes.

Merci pour votre confiance,
L'équipe Novadev`,
  });

  const fetchContacts = () => {
    fetch("/api/contacts")
      .then((r) => r.ok ? r.json() : [])
      .then((data) => {
        setContacts(
          data.map((c: Contact & { importedAt: string }) => ({
            ...c,
            importedAt: new Date(c.importedAt).toISOString().split("T")[0],
          }))
        );
      })
      .catch(() => {});
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/campaigns").then((r) => r.ok ? r.json() : []),
      fetch("/api/contacts").then((r) => r.ok ? r.json() : []),
      fetch("/api/settings").then((r) => r.ok ? r.json() : {}),
    ]).then(([campaignsData, contactsData, settingsData]) => {
      setCampaigns(campaignsData);
      setContacts(
        contactsData.map((c: Contact & { importedAt: string }) => ({
          ...c,
          importedAt: new Date(c.importedAt).toISOString().split("T")[0],
        }))
      );
      try {
        setSections(JSON.parse((settingsData as { questions?: string }).questions ?? "[]"));
      } catch {
        setSections([]);
      }
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const pendingContacts = contacts.filter((c) => c.status === "pending");

  // Filter campaigns by date range
  const filteredCampaigns = campaigns.filter((c) => {
    const d = c.createdAt.split("T")[0];
    return d >= range.startDate && d <= range.endDate;
  });

  const handleCreate = async () => {
    setCreating(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCampaign),
      });
      const campaign = await res.json();
      setCampaigns([campaign, ...campaigns]);
      setShowNew(false);
      setNewCampaign({
        name: "",
        subject: "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?",
        body: newCampaign.body,
      });
      fetchContacts();
    } finally {
      setCreating(false);
    }
  };

  const handleSend = async (campaignId: string) => {
    setSendingId(campaignId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/send`, { method: "POST" });
      const data = await res.json();
      const updated = await fetch("/api/campaigns").then((r) => r.ok ? r.json() : campaigns);
      setCampaigns(updated);
      fetchContacts();
      if (data.errors?.length) {
        alert(`${data.sentCount} emails envoyés. Erreurs: ${data.errors.join(", ")}`);
      }
    } finally {
      setSendingId(null);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const parsed = (results.data as Record<string, string>[]).map((row) => ({
          firstName: row.prenom || row.firstName || row["Prénom"] || row.Prenom || "",
          lastName: row.nom || row.lastName || row.Nom || "",
          email: row.email || row.Email || row.mail || row.Mail || "",
          phone: row.telephone || row.phone || row["Téléphone"] || row.Phone || "",
        }));
        setImportPreview(parsed.filter((p) => p.email));
      },
    });
  };

  const confirmImport = async () => {
    setImporting(true);
    try {
      await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(importPreview),
      });
      setImportPreview([]);
      setShowImport(false);
      fetchContacts();
    } finally {
      setImporting(false);
    }
  };

  const deleteContact = async (id: string) => {
    await fetch("/api/contacts", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const filteredContacts = contacts.filter(
    (c) =>
      c.firstName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.lastName.toLowerCase().includes(contactSearch.toLowerCase()) ||
      c.email.toLowerCase().includes(contactSearch.toLowerCase())
  );

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
            <p className="text-muted-foreground mt-1">
              Importez vos contacts et lancez des campagnes de collecte d&apos;avis
            </p>
          </div>
          <DateRangeSelector
            preset={preset}
            onPresetChange={setPreset}
            customStart={customStart}
            onCustomStartChange={setCustomStart}
            customEnd={customEnd}
            onCustomEndChange={setCustomEnd}
          />
        </div>

        <Tabs defaultValue="campagnes" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campagnes" className="gap-2">
              <Send className="h-3.5 w-3.5" />
              Campagnes ({filteredCampaigns.length})
            </TabsTrigger>
            <TabsTrigger value="contacts" className="gap-2">
              <Users className="h-3.5 w-3.5" />
              Contacts ({contacts.length})
              {pendingContacts.length > 0 && (
                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                  {pendingContacts.length} en attente
                </Badge>
              )}
            </TabsTrigger>
          </TabsList>

          {/* ── Campagnes Tab ── */}
          <TabsContent value="campagnes" className="space-y-4">
            <div className="flex items-center justify-end gap-2">
              <Dialog open={showPreview} onOpenChange={setShowPreview}>
                <DialogTrigger render={<Button variant="outline" className="gap-2" />}>
                  <Eye className="h-4 w-4" />
                  Aperçu email
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Aperçu de l&apos;email</DialogTitle>
                  </DialogHeader>
                  <div className="border rounded-lg overflow-hidden">
                    <div className="bg-muted/50 px-4 py-3 border-b">
                      <p className="text-xs text-muted-foreground">De : Novadev &lt;contact@novadev.care&gt;</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Objet : {newCampaign.subject}</p>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">N</div>
                        <span className="font-semibold text-sm">Novadev</span>
                      </div>
                      <div className="text-sm whitespace-pre-line text-muted-foreground">
                        {newCampaign.body.replace("{prénom}", "Marie")}
                      </div>
                      <Button className="w-full gap-2 mt-4">
                        <Star className="h-4 w-4" />
                        Donner mon avis
                      </Button>
                      <p className="text-[10px] text-center text-muted-foreground">
                        Centre Novadev — 15 rue Beudant, 75017 Paris
                      </p>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showNew} onOpenChange={setShowNew}>
                <DialogTrigger render={<Button className="gap-2" />}>
                  <Plus className="h-4 w-4" />
                  Nouvelle campagne
                </DialogTrigger>
                <DialogContent className="max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Créer une campagne</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Nom de la campagne</Label>
                      <Input
                        placeholder="Ex: Campagne Avril - Semaine 2"
                        value={newCampaign.name}
                        onChange={(e) => setNewCampaign({ ...newCampaign, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Objet de l&apos;email</Label>
                      <Input
                        value={newCampaign.subject}
                        onChange={(e) => setNewCampaign({ ...newCampaign, subject: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Corps du message</Label>
                      <Textarea
                        rows={8}
                        value={newCampaign.body}
                        onChange={(e) => setNewCampaign({ ...newCampaign, body: e.target.value })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Utilisez {"{prénom}"} pour personnaliser le message
                      </p>
                    </div>

                    <div className="rounded-lg border p-3 bg-muted/30">
                      <p className="text-sm font-medium flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        {pendingContacts.length} contacts en attente seront ciblés
                      </p>
                      {pendingContacts.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Importez des contacts dans l&apos;onglet Contacts avant de créer une campagne
                        </p>
                      )}
                    </div>

                    {sections.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-muted-foreground text-xs">Sections du questionnaire</Label>
                        <div className="space-y-2">
                          {sections.map((s) => (
                            <div key={s.id} className="bg-muted/50 rounded px-3 py-2 space-y-1">
                              <p className="text-xs font-medium">{s.id}. {s.title}</p>
                              {(s.questions ?? []).map((q) => (
                                <p key={q.id} className="text-xs text-muted-foreground pl-3">- {q.text}</p>
                              ))}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" onClick={() => setShowNew(false)}>Annuler</Button>
                      <Button onClick={handleCreate} disabled={!newCampaign.name || pendingContacts.length === 0 || creating} className="gap-2">
                        {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                        Créer la campagne
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {filteredCampaigns.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Mail className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Aucune campagne</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importez des contacts puis créez votre première campagne
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {filteredCampaigns.map((campaign) => {
                  const completionRate = campaign.contactCount > 0
                    ? Math.round((campaign.completedCount / campaign.contactCount) * 100)
                    : 0;
                  const openRate = campaign.sentCount > 0
                    ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
                    : 0;

                  return (
                    <Card key={campaign.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{campaign.name}</h3>
                              <Badge variant={statusConfig[campaign.status]?.variant || "secondary"}>
                                {statusConfig[campaign.status]?.label || campaign.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              Créée le {new Date(campaign.createdAt).toISOString().split("T")[0]} &middot; {campaign.subject}
                            </p>
                          </div>
                          {campaign.status === "draft" && (
                            <Button
                              size="sm"
                              className="gap-2"
                              onClick={() => handleSend(campaign.id)}
                              disabled={sendingId === campaign.id}
                            >
                              {sendingId === campaign.id ? (
                                <Loader2 className="h-3 w-3 animate-spin" />
                              ) : (
                                <Send className="h-3 w-3" />
                              )}
                              Envoyer
                            </Button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <div>
                              <p className="text-lg font-bold">{campaign.contactCount}</p>
                              <p className="text-[11px] text-muted-foreground">Contacts</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4 text-primary" />
                            <div>
                              <p className="text-lg font-bold">{campaign.sentCount}</p>
                              <p className="text-[11px] text-muted-foreground">Envoyés</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Eye className="h-4 w-4 text-violet-500" />
                            <div>
                              <p className="text-lg font-bold">{openRate}%</p>
                              <p className="text-[11px] text-muted-foreground">Taux ouverture</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="text-lg font-bold">{campaign.completedCount}</p>
                              <p className="text-[11px] text-muted-foreground">Réponses</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsUp className="h-4 w-4 text-emerald-500" />
                            <div>
                              <p className="text-lg font-bold">{campaign.positiveCount}</p>
                              <p className="text-[11px] text-muted-foreground">Positifs</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <ThumbsDown className="h-4 w-4 text-red-500" />
                            <div>
                              <p className="text-lg font-bold">{campaign.negativeCount}</p>
                              <p className="text-[11px] text-muted-foreground">Négatifs</p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 flex items-center gap-3">
                          <Progress value={completionRate} className="h-2 flex-1" />
                          <span className="text-sm text-muted-foreground font-medium w-10 text-right">{completionRate}%</span>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* ── Contacts Tab ── */}
          <TabsContent value="contacts" className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="relative w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un contact..."
                  className="pl-9"
                  value={contactSearch}
                  onChange={(e) => setContactSearch(e.target.value)}
                />
              </div>
              <Dialog open={showImport} onOpenChange={setShowImport}>
                <DialogTrigger render={<Button className="gap-2" />}>
                  <Upload className="h-4 w-4" />
                  Importer CSV
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Importer des contacts depuis Doctolib</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {importPreview.length === 0 ? (
                      <div
                        className="border-2 border-dashed rounded-xl p-10 text-center cursor-pointer hover:border-primary/50 hover:bg-muted/50 transition-colors"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                        <p className="font-medium">Glissez votre fichier CSV Doctolib ici</p>
                        <p className="text-sm text-muted-foreground mt-1">ou cliquez pour sélectionner</p>
                        <p className="text-xs text-muted-foreground mt-3">
                          Colonnes attendues : <code className="bg-muted px-1 py-0.5 rounded">prenom</code>, <code className="bg-muted px-1 py-0.5 rounded">nom</code>, <code className="bg-muted px-1 py-0.5 rounded">email</code>, <code className="bg-muted px-1 py-0.5 rounded">telephone</code>
                        </p>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept=".csv"
                          className="hidden"
                          onChange={handleFileUpload}
                        />
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium">{importPreview.length} contacts trouvés</p>
                          <Badge variant="secondary">Aperçu</Badge>
                        </div>
                        <div className="border rounded-lg max-h-64 overflow-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-muted/50 sticky top-0">
                              <tr>
                                <th className="text-left p-3 font-medium">Prénom</th>
                                <th className="text-left p-3 font-medium">Nom</th>
                                <th className="text-left p-3 font-medium">Email</th>
                                <th className="text-left p-3 font-medium">Téléphone</th>
                              </tr>
                            </thead>
                            <tbody>
                              {importPreview.slice(0, 10).map((c, i) => (
                                <tr key={i} className="border-t">
                                  <td className="p-3">{c.firstName}</td>
                                  <td className="p-3">{c.lastName}</td>
                                  <td className="p-3 text-muted-foreground">{c.email}</td>
                                  <td className="p-3 text-muted-foreground">{c.phone || "—"}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {importPreview.length > 10 && (
                            <p className="text-xs text-muted-foreground p-3 text-center border-t">
                              ... et {importPreview.length - 10} autres contacts
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" onClick={() => setImportPreview([])}>Annuler</Button>
                          <Button onClick={confirmImport} disabled={importing} className="gap-2">
                            {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                            Importer {importPreview.length} contacts
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {contacts.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <FileSpreadsheet className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="font-medium">Aucun contact</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Importez vos patients depuis un export CSV Doctolib
                  </p>
                  <Button className="mt-4 gap-2" onClick={() => setShowImport(true)}>
                    <Upload className="h-4 w-4" />
                    Importer CSV
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/50">
                        <tr>
                          <th className="text-left p-3 font-medium">Nom</th>
                          <th className="text-left p-3 font-medium">Email</th>
                          <th className="text-left p-3 font-medium">Téléphone</th>
                          <th className="text-left p-3 font-medium">Importé le</th>
                          <th className="text-left p-3 font-medium">Statut</th>
                          <th className="text-right p-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredContacts.map((contact) => {
                          const status = contactStatusConfig[contact.status] || contactStatusConfig.pending;
                          return (
                            <tr key={contact.id} className="border-t hover:bg-muted/30 transition-colors">
                              <td className="p-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                    {contact.firstName[0]}{contact.lastName[0]}
                                  </div>
                                  <span className="font-medium">{contact.firstName} {contact.lastName}</span>
                                </div>
                              </td>
                              <td className="p-3 text-muted-foreground">{contact.email}</td>
                              <td className="p-3 text-muted-foreground">{contact.phone || "—"}</td>
                              <td className="p-3 text-muted-foreground">{contact.importedAt}</td>
                              <td className="p-3">
                                <Badge variant={status.variant} className="text-[11px]">
                                  {status.label}
                                </Badge>
                              </td>
                              <td className="p-3 text-right">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => deleteContact(contact.id)}
                                  className="text-muted-foreground hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
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
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
