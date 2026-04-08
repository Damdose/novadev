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
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { mockCampaigns, mockContacts, mockResponses } from "@/lib/mock-data";

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sending: { label: "En cours", variant: "default" },
  sent: { label: "Envoyée", variant: "secondary" },
  completed: { label: "Terminée", variant: "default" },
};

export default function DashboardPage() {
  const positiveCount = mockResponses.filter((r) => r.isPositive).length;
  const redirectedCount = mockResponses.filter((r) => r.redirectedToGoogle).length;
  const avgScore = mockResponses.length > 0
    ? mockResponses.reduce((sum, r) => sum + r.averageScore, 0) / mockResponses.length
    : 0;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Envoyez des enquêtes de satisfaction et récoltez des avis Google
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Contacts</p>
                  <p className="text-2xl font-bold mt-1">{mockContacts.length}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    +8 ce mois
                  </p>
                </div>
                <div className="rounded-xl p-3 text-primary bg-primary/10">
                  <Users className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Score moyen</p>
                  <p className="text-2xl font-bold mt-1">{avgScore.toFixed(1)}/5</p>
                  <div className="flex items-center gap-0.5 mt-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={`h-3 w-3 ${s <= Math.round(avgScore) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                </div>
                <div className="rounded-xl p-3 text-amber-600 bg-amber-50">
                  <Star className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avis positifs</p>
                  <p className="text-2xl font-bold mt-1">{positiveCount}/{mockResponses.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {mockResponses.length > 0 ? Math.round((positiveCount / mockResponses.length) * 100) : 0}% positifs
                  </p>
                </div>
                <div className="rounded-xl p-3 text-emerald-600 bg-emerald-50">
                  <ThumbsUp className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Redirigés Google</p>
                  <p className="text-2xl font-bold mt-1">{redirectedCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Avis Google générés
                  </p>
                </div>
                <div className="rounded-xl p-3 text-blue-600 bg-blue-50">
                  <ExternalLink className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
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
                  <div key={campaign.id} className="flex items-center gap-4 rounded-lg border p-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-sm truncate">{campaign.name}</p>
                        <Badge variant={statusConfig[campaign.status].variant}>
                          {statusConfig[campaign.status].label}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {campaign.contactCount} contacts &middot; {campaign.completedCount} réponses
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <Progress value={completionRate} className="h-1.5 flex-1" />
                        <span className="text-xs text-muted-foreground font-medium">{completionRate}%</span>
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
              {mockResponses.slice(0, 5).map((response) => (
                <div key={response.id} className="flex items-center gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {response.contactName.split(" ").map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{response.contactName}</p>
                    <p className="text-xs text-muted-foreground">{response.completedAt}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-semibold">{response.averageScore}</span>
                    </div>
                    {response.isPositive ? (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600 text-[11px]">Positif</Badge>
                    ) : (
                      <Badge variant="destructive" className="text-[11px]">Négatif</Badge>
                    )}
                    {response.redirectedToGoogle && (
                      <Badge variant="outline" className="text-[10px] gap-1">
                        <ExternalLink className="h-3 w-3" />
                        Google
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
                    Envoyez un questionnaire de satisfaction — les bonnes notes sont redirigées vers votre fiche Google
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
