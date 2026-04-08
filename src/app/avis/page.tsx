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
  Star,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Send,
  Search,
  Bot,
  Mail,
  Clock,
  CheckCircle2,
  Zap,
  Save,
  Reply,
  RefreshCw,
  Loader2,
  MapPin,
  AlertCircle,
} from "lucide-react";
import { mockResponses } from "@/lib/mock-data";
import { SURVEY_QUESTIONS, POSITIVE_THRESHOLD, SurveyResponse } from "@/lib/types";

interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

const STAR_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

interface ReviewReply {
  responseId: string;
  message: string;
  sentAt: string;
  auto: boolean;
}

export default function AvisPage() {
  const [tab, setTab] = useState("google");
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<ReviewReply[]>([]);

  // Google reviews state
  const [googleReviews, setGoogleReviews] = useState<GoogleReview[]>([]);
  const [googleLoading, setGoogleLoading] = useState(true);
  const [googleError, setGoogleError] = useState<string | null>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [googleTotalCount, setGoogleTotalCount] = useState(0);
  const [googleAvgRating, setGoogleAvgRating] = useState(0);
  const [googleLocationName, setGoogleLocationName] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [replyingToGoogle, setReplyingToGoogle] = useState<string | null>(null);
  const [googleReplyText, setGoogleReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Auto-reply settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyPositive, setAutoReplyPositive] = useState(
    "Merci beaucoup pour votre retour positif ! Votre satisfaction est notre priorité. N'hésitez pas à nous recommander auprès d'autres familles."
  );
  const [autoReplyNegative, setAutoReplyNegative] = useState(
    "Merci d'avoir pris le temps de nous faire part de votre retour. Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Notre équipe va examiner vos remarques et vous recontactera."
  );

  // Fetch Google reviews on mount
  useEffect(() => {
    fetch("/api/google/status")
      .then((res) => res.json())
      .then((data) => {
        setGoogleConnected(data.authenticated);
        if (data.authenticated) {
          fetchGoogleReviews();
        } else {
          setGoogleLoading(false);
        }
      })
      .catch(() => setGoogleLoading(false));
  }, []);

  const fetchGoogleReviews = async () => {
    setGoogleLoading(true);
    setGoogleError(null);
    try {
      const res = await fetch("/api/google/reviews");
      const data = await res.json();
      if (data.error) {
        setGoogleError(data.error);
      } else {
        setGoogleReviews(data.reviews || []);
        setGoogleTotalCount(data.totalReviewCount || 0);
        setGoogleAvgRating(data.averageRating || 0);
        setGoogleLocationName(data.locationName || "");
      }
    } catch {
      setGoogleError("Impossible de charger les avis Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const forceSync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/google/sync", { method: "POST" });
      const data = await res.json();
      if (!data.error) {
        setGoogleReviews(data.reviews || []);
        setGoogleTotalCount(data.totalReviewCount || 0);
        setGoogleAvgRating(data.averageRating || 0);
        setGoogleLocationName(data.location?.title || "");
      }
    } finally {
      setSyncing(false);
    }
  };

  const sendGoogleReply = async (reviewName: string) => {
    if (!googleReplyText.trim()) return;
    setSendingReply(true);
    try {
      const res = await fetch("/api/google/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewName, comment: googleReplyText }),
      });
      const data = await res.json();
      if (data.success) {
        setReplyingToGoogle(null);
        setGoogleReplyText("");
        await fetchGoogleReviews();
      }
    } finally {
      setSendingReply(false);
    }
  };

  // Survey responses (internal)
  const positiveResponses = mockResponses.filter((r) => r.isPositive);
  const negativeResponses = mockResponses.filter((r) => !r.isPositive);

  const filteredSurveyResponses = mockResponses
    .filter((r) => {
      if (tab === "survey-positive") return r.isPositive;
      if (tab === "survey-negative") return !r.isPositive;
      if (tab === "survey-unreplied") return !replies.some((rep) => rep.responseId === r.id);
      return true;
    })
    .filter(
      (r) =>
        r.contactName.toLowerCase().includes(search.toLowerCase()) ||
        r.contactEmail.toLowerCase().includes(search.toLowerCase())
    );

  const unrepliedCount = mockResponses.filter(
    (r) => !replies.some((rep) => rep.responseId === r.id)
  ).length;

  // Google reviews filtering
  const googlePositive = googleReviews.filter(
    (r) => STAR_MAP[r.starRating] >= 4
  );
  const googleNegative = googleReviews.filter(
    (r) => STAR_MAP[r.starRating] < 4
  );
  const googleUnreplied = googleReviews.filter((r) => !r.reviewReply);

  const filteredGoogleReviews = googleReviews
    .filter((r) => {
      if (tab === "google-positive") return STAR_MAP[r.starRating] >= 4;
      if (tab === "google-negative") return STAR_MAP[r.starRating] < 4;
      if (tab === "google-unreplied") return !r.reviewReply;
      return true;
    })
    .filter((r) =>
      r.reviewer.displayName.toLowerCase().includes(search.toLowerCase()) ||
      (r.comment || "").toLowerCase().includes(search.toLowerCase())
    );

  const sendReply = (responseId: string) => {
    if (!replyText.trim()) return;
    setReplies([
      ...replies,
      {
        responseId,
        message: replyText,
        sentAt: new Date().toISOString().split("T")[0],
        auto: false,
      },
    ]);
    setReplyText("");
    setReplyingTo(null);
  };

  const sendAutoReply = (response: SurveyResponse) => {
    const message = response.isPositive ? autoReplyPositive : autoReplyNegative;
    setReplies([
      ...replies,
      {
        responseId: response.id,
        message,
        sentAt: new Date().toISOString().split("T")[0],
        auto: true,
      },
    ]);
  };

  const sendAllAutoReplies = () => {
    const newReplies = mockResponses
      .filter((r) => !replies.some((rep) => rep.responseId === r.id))
      .map((r) => ({
        responseId: r.id,
        message: r.isPositive ? autoReplyPositive : autoReplyNegative,
        sentAt: new Date().toISOString().split("T")[0],
        auto: true,
      }));
    setReplies([...replies, ...newReplies]);
  };

  const getReply = (responseId: string) =>
    replies.find((r) => r.responseId === responseId);

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avis</h1>
            <p className="text-muted-foreground mt-1">
              Avis Google My Business et retours de satisfaction internes
            </p>
          </div>
          <div className="flex gap-2">
            {googleConnected && (
              <Button
                variant="outline"
                className="gap-2"
                onClick={forceSync}
                disabled={syncing}
              >
                {syncing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Synchroniser
              </Button>
            )}
          </div>
        </div>

        {/* Stats Google */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{googleTotalCount}</p>
                  <p className="text-xs text-muted-foreground">Avis Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {googleAvgRating ? googleAvgRating.toFixed(1) : "—"}/5
                  </p>
                  <p className="text-xs text-muted-foreground">Note moyenne Google</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-3">
                  <ThumbsUp className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{googlePositive.length}</p>
                  <p className="text-xs text-muted-foreground">Positifs (4-5 étoiles)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-3">
                  <Clock className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{googleUnreplied.length}</p>
                  <p className="text-xs text-muted-foreground">Sans réponse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="google" className="gap-2">
              <MapPin className="h-4 w-4" />
              Google ({googleReviews.length})
            </TabsTrigger>
            <TabsTrigger value="google-unreplied" className="gap-2">
              Sans réponse ({googleUnreplied.length})
            </TabsTrigger>
            <TabsTrigger value="survey" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Enquêtes ({mockResponses.length})
            </TabsTrigger>
            <TabsTrigger value="auto-config" className="gap-2">
              <Bot className="h-4 w-4" />
              Réponse auto
            </TabsTrigger>
          </TabsList>

          {/* Config réponse automatique */}
          <TabsContent value="auto-config" className="mt-6">
            <div className="max-w-2xl space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bot className="h-4 w-4" />
                    Configuration des réponses automatiques
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Réponse automatique</p>
                      <p className="text-xs text-muted-foreground">
                        Envoyer automatiquement une réponse après chaque avis
                      </p>
                    </div>
                    <Button
                      variant={autoReplyEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setAutoReplyEnabled(!autoReplyEnabled)}
                      className="gap-2"
                    >
                      <Zap className="h-4 w-4" />
                      {autoReplyEnabled ? "Activé" : "Désactivé"}
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-emerald-600" />
                      <Label className="font-medium">
                        Réponse pour les avis positifs (4-5 étoiles)
                      </Label>
                    </div>
                    <Textarea
                      value={autoReplyPositive}
                      onChange={(e) => setAutoReplyPositive(e.target.value)}
                      rows={4}
                      placeholder="Message envoyé pour les avis positifs..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <Label className="font-medium">
                        Réponse pour les avis négatifs (1-3 étoiles)
                      </Label>
                    </div>
                    <Textarea
                      value={autoReplyNegative}
                      onChange={(e) => setAutoReplyNegative(e.target.value)}
                      rows={4}
                      placeholder="Message envoyé pour les avis négatifs..."
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button className="gap-2">
                      <Save className="h-4 w-4" />
                      Enregistrer les modèles
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Avis Google */}
          {["google", "google-positive", "google-negative", "google-unreplied"].map(
            (tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un avis Google..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    {googleLocationName && (
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {googleLocationName}
                      </Badge>
                    )}
                  </div>

                  {!googleConnected ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                        <p className="font-medium">Google My Business non connecté</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          Connectez votre compte Google dans les paramètres pour voir vos avis.
                        </p>
                        <Button
                          onClick={() => (window.location.href = "/parametres?tab=google")}
                          className="gap-2"
                        >
                          <MapPin className="h-4 w-4" />
                          Aller dans les paramètres
                        </Button>
                      </CardContent>
                    </Card>
                  ) : googleLoading ? (
                    <div className="text-center py-12">
                      <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Chargement des avis Google...
                      </p>
                    </div>
                  ) : googleError ? (
                    <Card>
                      <CardContent className="py-12 text-center">
                        <AlertCircle className="h-10 w-10 mx-auto mb-3 text-red-400" />
                        <p className="font-medium text-red-600">Erreur de synchronisation</p>
                        <p className="text-sm text-muted-foreground mt-1 mb-4">
                          {googleError}
                        </p>
                        <Button variant="outline" onClick={forceSync} className="gap-2">
                          <RefreshCw className="h-4 w-4" />
                          Réessayer
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-3">
                      {filteredGoogleReviews.map((review) => {
                        const stars = STAR_MAP[review.starRating] || 0;
                        const isPositive = stars >= 4;
                        const isReplying = replyingToGoogle === review.reviewId;

                        return (
                          <Card key={review.reviewId} className="overflow-hidden">
                            <CardContent className="pt-5 pb-4">
                              {/* Header */}
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3">
                                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                    {review.reviewer.displayName
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")
                                      .slice(0, 2)}
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">
                                      {review.reviewer.displayName}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                      {formatDate(review.createTime)}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <div className="flex items-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-4 w-4 ${
                                          s <= stars
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                  {isPositive ? (
                                    <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                      Positif
                                    </Badge>
                                  ) : (
                                    <Badge variant="destructive">Négatif</Badge>
                                  )}
                                  <Badge variant="outline" className="gap-1">
                                    <MapPin className="h-3 w-3" />
                                    Google
                                  </Badge>
                                </div>
                              </div>

                              {/* Comment */}
                              {review.comment && (
                                <p className="text-sm text-muted-foreground mb-3 bg-muted/30 rounded-lg p-3">
                                  &ldquo;{review.comment}&rdquo;
                                </p>
                              )}

                              {/* Existing reply */}
                              {review.reviewReply && (
                                <div className="rounded-lg border bg-primary/5 p-3 mb-3">
                                  <div className="flex items-center gap-2 mb-1">
                                    <Reply className="h-3 w-3 text-primary" />
                                    <span className="text-xs font-medium text-primary">
                                      Votre réponse
                                    </span>
                                    <span className="text-[10px] text-muted-foreground ml-auto">
                                      {formatDate(review.reviewReply.updateTime)}
                                    </span>
                                  </div>
                                  <p className="text-sm text-muted-foreground">
                                    {review.reviewReply.comment}
                                  </p>
                                </div>
                              )}

                              {/* Reply actions */}
                              {!review.reviewReply && !isReplying && (
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => {
                                      setReplyingToGoogle(review.reviewId);
                                      setGoogleReplyText("");
                                    }}
                                  >
                                    <Mail className="h-3 w-3" />
                                    Répondre sur Google
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="gap-2 text-muted-foreground"
                                    onClick={() => {
                                      setReplyingToGoogle(review.reviewId);
                                      setGoogleReplyText(
                                        isPositive ? autoReplyPositive : autoReplyNegative
                                      );
                                    }}
                                  >
                                    <Bot className="h-3 w-3" />
                                    Réponse auto
                                  </Button>
                                </div>
                              )}

                              {/* Reply form */}
                              {isReplying && (
                                <div className="space-y-3 pt-2 border-t">
                                  <Textarea
                                    value={googleReplyText}
                                    onChange={(e) => setGoogleReplyText(e.target.value)}
                                    placeholder="Votre réponse sera publiée sur Google..."
                                    rows={3}
                                    autoFocus
                                  />
                                  <div className="flex gap-2 justify-end">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => setReplyingToGoogle(null)}
                                    >
                                      Annuler
                                    </Button>
                                    <Button
                                      size="sm"
                                      className="gap-2"
                                      onClick={() =>
                                        sendGoogleReply(
                                          `${review.reviewId}`
                                        )
                                      }
                                      disabled={!googleReplyText.trim() || sendingReply}
                                    >
                                      {sendingReply ? (
                                        <Loader2 className="h-3 w-3 animate-spin" />
                                      ) : (
                                        <Send className="h-3 w-3" />
                                      )}
                                      Publier sur Google
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        );
                      })}

                      {filteredGoogleReviews.length === 0 && (
                        <div className="text-center py-12 text-muted-foreground">
                          <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                          <p className="text-sm">Aucun avis Google trouvé</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </TabsContent>
            )
          )}

          {/* Enquêtes internes */}
          {["survey", "survey-positive", "survey-negative", "survey-unreplied"].map(
            (tabValue) => (
              <TabsContent key={tabValue} value={tabValue} className="mt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-between">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher un avis..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                      />
                    </div>
                    <Button
                      variant="outline"
                      className="gap-2"
                      onClick={sendAllAutoReplies}
                      disabled={unrepliedCount === 0}
                    >
                      <Zap className="h-4 w-4" />
                      Répondre auto ({unrepliedCount})
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {filteredSurveyResponses.map((response) => {
                      const reply = getReply(response.id);
                      const isReplying = replyingTo === response.id;

                      return (
                        <Card key={response.id} className="overflow-hidden">
                          <CardContent className="pt-5 pb-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-medium">
                                  {response.contactName
                                    .split(" ")
                                    .map((n) => n[0])
                                    .join("")}
                                </div>
                                <div>
                                  <p className="text-sm font-medium">
                                    {response.contactName}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {response.contactEmail} &middot;{" "}
                                    {response.completedAt}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1">
                                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                  <span className="text-sm font-semibold">
                                    {response.averageScore}
                                  </span>
                                </div>
                                {response.isPositive ? (
                                  <Badge className="bg-emerald-500 hover:bg-emerald-600">
                                    Positif
                                  </Badge>
                                ) : (
                                  <Badge variant="destructive">Négatif</Badge>
                                )}
                                <Badge variant="outline" className="gap-1">
                                  <MessageSquare className="h-3 w-3" />
                                  Enquête
                                </Badge>
                                {reply && (
                                  <Badge variant="outline" className="gap-1">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Répondu
                                  </Badge>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-5 gap-2 mb-4">
                              {SURVEY_QUESTIONS.map((q, i) => (
                                <div
                                  key={q.id}
                                  className="rounded-lg bg-muted/50 px-2 py-2 text-center"
                                >
                                  <p className="text-[10px] text-muted-foreground truncate mb-0.5">
                                    Q{q.id}
                                  </p>
                                  <div className="flex items-center justify-center gap-0.5">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                      <Star
                                        key={s}
                                        className={`h-2.5 w-2.5 ${
                                          s <= response.answers[i]
                                            ? "fill-amber-400 text-amber-400"
                                            : "text-gray-200"
                                        }`}
                                      />
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>

                            {reply && (
                              <div className="rounded-lg border bg-primary/5 p-3 mb-3">
                                <div className="flex items-center gap-2 mb-1">
                                  <Reply className="h-3 w-3 text-primary" />
                                  <span className="text-xs font-medium text-primary">
                                    Votre réponse
                                    {reply.auto && (
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 text-[10px] py-0"
                                      >
                                        <Bot className="h-3 w-3 mr-1" />
                                        Auto
                                      </Badge>
                                    )}
                                  </span>
                                  <span className="text-[10px] text-muted-foreground ml-auto">
                                    {reply.sentAt}
                                  </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {reply.message}
                                </p>
                              </div>
                            )}

                            {!reply && !isReplying && (
                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="gap-2"
                                  onClick={() => {
                                    setReplyingTo(response.id);
                                    setReplyText("");
                                  }}
                                >
                                  <Mail className="h-3 w-3" />
                                  Répondre
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="gap-2 text-muted-foreground"
                                  onClick={() => sendAutoReply(response)}
                                >
                                  <Bot className="h-3 w-3" />
                                  Réponse auto
                                </Button>
                              </div>
                            )}

                            {isReplying && (
                              <div className="space-y-3 pt-2 border-t">
                                <Textarea
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Écrivez votre réponse..."
                                  rows={3}
                                  autoFocus
                                />
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setReplyingTo(null)}
                                  >
                                    Annuler
                                  </Button>
                                  <Button
                                    size="sm"
                                    className="gap-2"
                                    onClick={() => sendReply(response.id)}
                                    disabled={!replyText.trim()}
                                  >
                                    <Send className="h-3 w-3" />
                                    Envoyer
                                  </Button>
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      );
                    })}

                    {filteredSurveyResponses.length === 0 && (
                      <div className="text-center py-12 text-muted-foreground">
                        <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                        <p className="text-sm">Aucun avis trouvé</p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            )
          )}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
