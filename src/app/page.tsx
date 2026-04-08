"use client";

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
  ArrowRight,
  CheckCircle2,
  Mail,
} from "lucide-react";
import Link from "next/link";
import { mockCampaigns, mockContacts, mockResponses } from "@/lib/mock-data";

const stats = [
  {
    label: "Contacts",
    value: mockContacts.length,
    icon: Users,
    change: "+8 ce mois",
    color: "text-primary bg-primary/10",
  },
  {
    label: "Campagnes envoyées",
    value: mockCampaigns.length,
    icon: Send,
    change: "2 actives",
    color: "text-violet-600 bg-violet-50",
  },
  {
    label: "Réponses collectées",
    value: mockResponses.length,
    icon: CheckCircle2,
    change: "Taux: 47%",
    color: "text-emerald-600 bg-emerald-50",
  },
  {
    label: "Score moyen",
    value:
      (
        mockResponses.reduce((sum, r) => sum + r.averageScore, 0) /
        mockResponses.length
      ).toFixed(1) + "/5",
    icon: Star,
    change: "80% positifs",
    color: "text-amber-600 bg-amber-50",
  },
];

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sending: { label: "En cours", variant: "default" },
  sent: { label: "Envoyée", variant: "secondary" },
  completed: { label: "Terminée", variant: "default" },
};

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Vue d&apos;ensemble de votre collecte d&apos;avis
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className="text-2xl font-bold mt-1">{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {stat.change}
                    </p>
                  </div>
                  <div className={`rounded-xl p-3 ${stat.color}`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Campagnes récentes</CardTitle>
              <Link href="/campagnes">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockCampaigns.map((campaign) => {
                const completionRate = campaign.contactCount > 0
                  ? Math.round((campaign.completedCount / campaign.contactCount) * 100)
                  : 0;
                return (
                  <div
                    key={campaign.id}
                    className="flex items-center gap-4 rounded-lg border p-4"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">
                          {campaign.name}
                        </p>
                        <Badge variant={statusConfig[campaign.status].variant}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {campaign.contactCount} contacts &middot;{" "}
                        {campaign.completedCount} réponses
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={completionRate} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground font-medium">
                          {completionRate}%
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Dernières réponses</CardTitle>
              <Link href="/resultats">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {mockResponses.slice(0, 4).map((response) => (
                <div
                  key={response.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                >
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {response.contactName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {response.contactName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {response.completedAt}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">
                        {response.averageScore}
                      </span>
                    </div>
                    {response.isPositive ? (
                      <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[11px]">
                        Positif
                      </Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[11px]">
                        Négatif
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Lancer une nouvelle campagne</p>
                  <p className="text-sm text-muted-foreground">
                    Envoyez un questionnaire de satisfaction à vos patients
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
