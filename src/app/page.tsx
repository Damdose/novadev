"use client";

import { useState, useEffect } from "react";
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
  MapPin,
  MessageSquare,
  RefreshCw,
  Loader2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  ExternalLink,
} from "lucide-react";
import Link from "next/link";
import { mockCampaigns, mockContacts, mockResponses } from "@/lib/mock-data";

interface GoogleReview {
  reviewId: string;
  reviewer: { displayName: string };
  starRating: string;
  comment?: string;
  createTime: string;
  reviewReply?: { comment: string };
}

const STAR_MAP: Record<string, number> = {
  ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5,
};

const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  draft: { label: "Brouillon", variant: "outline" },
  sending: { label: "En cours", variant: "default" },
  sent: { label: "Envoyée", variant: "secondary" },
  completed: { label: "Terminée", variant: "default" },
};

export default function DashboardPage() {
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleAvg, setGoogleAvg] = useState(0);
  const [googleTotal, setGoogleTotal] = useState(0);
  const [googleLocation, setGoogleLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetch("/api/google/status")
      .then((r) => r.json())
      .then((d) => {
        setGoogleConnected(d.authenticated);
        if (d.authenticated) loadGoogleData();
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const loadGoogleData = async () => {
    try {
      const res = await fetch("/api/google/reviews");
      const data = await res.json();
      if (!data.error) {
        setGoogleReviews(data.reviews || []);
        setGoogleAvg(data.averageRating || 0);
        setGoogleTotal(data.totalReviewCount || 0);
        setGoogleLocation(data.locationName || "");
      }
    } finally {
      setLoading(false);
    }
  };

  const forceSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/google/sync", { method: "POST" });
      const data = await res.json();
      if (!data.error) {
        setGoogleReviews(data.reviews || []);
        setGoogleAvg(data.averageRating || 0);
        setGoogleTotal(data.totalReviewCount || 0);
        setGoogleLocation(data.location?.title || "");
      }
    } finally {
      setSyncing(false);
    }
  };

  const googlePositive = googleReviews.filter((r) => STAR_MAP[r.starRating] >= 4);
  const googleUnreplied = googleReviews.filter((r) => !r.reviewReply);

  const formatDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    } catch {
      return d;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Vue d&apos;ensemble de votre fiche Google et campagnes de satisfaction
            </p>
          </div>
          {googleConnected && (
            <Button variant="outline" className="gap-2" onClick={forceSync} disabled={syncing}>
              {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Synchroniser
            </Button>
          )}
        </div>

        {/* Google My Business Section */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold">Google My Business</h2>
            {googleLocation && (
              <Badge variant="outline" className="ml-2">{googleLocation}</Badge>
            )}
          </div>

          {!googleConnected ? (
            <Card>
              <CardContent className="py-8 text-center">
                <MapPin className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium">Connectez votre fiche Google My Business</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">
                  Synchronisez vos avis Google, répondez-y directement et suivez vos statistiques.
                </p>
                <Link href="/parametres">
                  <Button className="gap-2">
                    <MapPin className="h-4 w-4" />
                    Connecter Google
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avis Google</p>
                      <p className="text-2xl font-bold mt-1">{googleTotal}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        {googlePositive.length} positifs
                      </p>
                    </div>
                    <div className="rounded-xl p-3 text-blue-600 bg-blue-50">
                      <MapPin className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Note moyenne</p>
                      <p className="text-2xl font-bold mt-1">{googleAvg ? googleAvg.toFixed(1) : "—"}/5</p>
                      <div className="flex items-center gap-0.5 mt-1">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= Math.round(googleAvg) ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
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
                      <p className="text-sm text-muted-foreground">Taux positif</p>
                      <p className="text-2xl font-bold mt-1">
                        {googleReviews.length > 0 ? Math.round((googlePositive.length / googleReviews.length) * 100) : 0}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">4-5 étoiles</p>
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
                      <p className="text-sm text-muted-foreground">Sans réponse</p>
                      <p className="text-2xl font-bold mt-1">{googleUnreplied.length}</p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        À traiter
                      </p>
                    </div>
                    <div className="rounded-xl p-3 text-red-600 bg-red-50">
                      <MessageSquare className="h-5 w-5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Derniers avis Google */}
        {googleConnected && googleReviews.length > 0 && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Derniers avis Google
              </CardTitle>
              <Link href="/avis">
                <Button variant="ghost" size="sm" className="gap-1">
                  Voir tout <ArrowRight className="h-3 w-3" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {googleReviews.slice(0, 5).map((review) => {
                const stars = STAR_MAP[review.starRating] || 0;
                return (
                  <div key={review.reviewId} className="flex items-center gap-3 rounded-lg border p-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                      {review.reviewer.displayName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{review.reviewer.displayName}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {review.comment ? `"${review.comment.slice(0, 60)}${review.comment.length > 60 ? "..." : ""}"` : "Pas de commentaire"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star key={s} className={`h-3 w-3 ${s <= stars ? "fill-amber-400 text-amber-400" : "text-gray-200"}`} />
                        ))}
                      </div>
                      {review.reviewReply ? (
                        <Badge variant="outline" className="text-[10px] gap-1">
                          <CheckCircle2 className="h-3 w-3" />
                          Répondu
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px] gap-1">
                          <Clock className="h-3 w-3" />
                          En attente
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Campagnes de satisfaction */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Send className="h-5 w-5 text-violet-600" />
            <h2 className="text-lg font-semibold">Campagnes de satisfaction</h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
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
                    <p className="text-sm text-muted-foreground">Campagnes</p>
                    <p className="text-2xl font-bold mt-1">{mockCampaigns.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">2 actives</p>
                  </div>
                  <div className="rounded-xl p-3 text-violet-600 bg-violet-50">
                    <Send className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Réponses</p>
                    <p className="text-2xl font-bold mt-1">{mockResponses.length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Taux: 47%</p>
                  </div>
                  <div className="rounded-xl p-3 text-emerald-600 bg-emerald-50">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Score moyen</p>
                    <p className="text-2xl font-bold mt-1">
                      {(mockResponses.reduce((sum, r) => sum + r.averageScore, 0) / mockResponses.length).toFixed(1)}/5
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">80% positifs</p>
                  </div>
                  <div className="rounded-xl p-3 text-amber-600 bg-amber-50">
                    <Star className="h-5 w-5" />
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
                <CardTitle className="text-base">Dernières réponses enquête</CardTitle>
                <Link href="/resultats">
                  <Button variant="ghost" size="sm" className="gap-1">
                    Voir tout <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockResponses.slice(0, 4).map((response) => (
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
                        <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600 text-[11px]">Positif</Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[11px]">Négatif</Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
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
