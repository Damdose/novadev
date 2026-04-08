"use client";

import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
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
} from "lucide-react";
import { Campaign } from "@/lib/types";
import { mockCampaigns, mockContacts } from "@/lib/mock-data";
import { SURVEY_QUESTIONS } from "@/lib/types";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sending: { label: "En cours", variant: "default" },
  sent: { label: "Envoyée", variant: "secondary" },
  completed: { label: "Terminée", variant: "default" },
};

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>(mockCampaigns);
  const [showNew, setShowNew] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [newCampaign, setNewCampaign] = useState({
    name: "",
    subject: "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?",
    body: `Bonjour {prénom},

Nous espérons que le bilan de votre enfant au centre Novadev s'est bien déroulé.

Votre retour est précieux pour nous permettre d'améliorer continuellement la qualité de nos services. Cela ne prend que 2 minutes.

Merci pour votre confiance,
L'équipe Novadev`,
  });

  const pendingContacts = mockContacts.filter((c) => c.status === "pending");

  const handleCreate = () => {
    const campaign: Campaign = {
      id: String(campaigns.length + 1),
      name: newCampaign.name,
      subject: newCampaign.subject,
      contactCount: pendingContacts.length,
      sentCount: 0,
      openedCount: 0,
      completedCount: 0,
      positiveCount: 0,
      negativeCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      status: "draft",
    };
    setCampaigns([campaign, ...campaigns]);
    setShowNew(false);
    setNewCampaign({
      name: "",
      subject: "Votre avis compte ! Comment s'est passé le bilan de votre enfant ?",
      body: newCampaign.body,
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campagnes</h1>
            <p className="text-muted-foreground mt-1">
              Créez et gérez vos campagnes de collecte d&apos;avis
            </p>
          </div>
          <div className="flex gap-2">
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
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Objet : {newCampaign.subject}
                    </p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        N
                      </div>
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
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Objet de l&apos;email</Label>
                    <Input
                      value={newCampaign.subject}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, subject: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Corps du message</Label>
                    <Textarea
                      rows={8}
                      value={newCampaign.body}
                      onChange={(e) =>
                        setNewCampaign({ ...newCampaign, body: e.target.value })
                      }
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
                  </div>

                  <div className="space-y-2">
                    <Label className="text-muted-foreground text-xs">
                      Questions du questionnaire
                    </Label>
                    <div className="space-y-1.5">
                      {SURVEY_QUESTIONS.map((q) => (
                        <div
                          key={q.id}
                          className="text-xs text-muted-foreground bg-muted/50 rounded px-3 py-2"
                        >
                          {q.id}. {q.text}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" onClick={() => setShowNew(false)}>
                      Annuler
                    </Button>
                    <Button
                      onClick={handleCreate}
                      disabled={!newCampaign.name}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Créer la campagne
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="space-y-4">
          {campaigns.map((campaign) => {
            const completionRate =
              campaign.contactCount > 0
                ? Math.round((campaign.completedCount / campaign.contactCount) * 100)
                : 0;
            const openRate =
              campaign.sentCount > 0
                ? Math.round((campaign.openedCount / campaign.sentCount) * 100)
                : 0;

            return (
              <Card key={campaign.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{campaign.name}</h3>
                        <Badge variant={statusConfig[campaign.status].variant}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Créée le {campaign.createdAt} &middot; {campaign.subject}
                      </p>
                    </div>
                    {campaign.status === "draft" && (
                      <Button size="sm" className="gap-2">
                        <Send className="h-3 w-3" />
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
                    <span className="text-sm text-muted-foreground font-medium w-10 text-right">
                      {completionRate}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardLayout>
  );
}
