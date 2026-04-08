"use client";

import { useState } from "react";
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
} from "lucide-react";
import { mockResponses } from "@/lib/mock-data";
import { SURVEY_QUESTIONS, POSITIVE_THRESHOLD, SurveyResponse } from "@/lib/types";

interface ReviewReply {
  responseId: string;
  message: string;
  sentAt: string;
  auto: boolean;
}

export default function AvisPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replies, setReplies] = useState<ReviewReply[]>([]);

  // Auto-reply settings
  const [autoReplyEnabled, setAutoReplyEnabled] = useState(false);
  const [autoReplyPositive, setAutoReplyPositive] = useState(
    "Merci beaucoup pour votre retour positif ! Votre satisfaction est notre priorité. N'hésitez pas à nous recommander auprès d'autres familles."
  );
  const [autoReplyNegative, setAutoReplyNegative] = useState(
    "Merci d'avoir pris le temps de nous faire part de votre retour. Nous sommes désolés que votre expérience n'ait pas été à la hauteur de vos attentes. Notre équipe va examiner vos remarques et vous recontactera."
  );

  const positiveResponses = mockResponses.filter((r) => r.isPositive);
  const negativeResponses = mockResponses.filter((r) => !r.isPositive);

  const filteredResponses = mockResponses
    .filter((r) => {
      if (tab === "positive") return r.isPositive;
      if (tab === "negative") return !r.isPositive;
      if (tab === "unreplied") return !replies.some((rep) => rep.responseId === r.id);
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

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Avis</h1>
            <p className="text-muted-foreground mt-1">
              Consultez et répondez aux avis de vos patients
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="gap-2"
              onClick={sendAllAutoReplies}
              disabled={unrepliedCount === 0}
            >
              <Zap className="h-4 w-4" />
              Répondre automatiquement ({unrepliedCount})
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <MessageSquare className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{mockResponses.length}</p>
                  <p className="text-xs text-muted-foreground">Total avis</p>
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
                  <p className="text-2xl font-bold">{positiveResponses.length}</p>
                  <p className="text-xs text-muted-foreground">Positifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-red-50 p-3">
                  <ThumbsDown className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{negativeResponses.length}</p>
                  <p className="text-xs text-muted-foreground">Négatifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{unrepliedCount}</p>
                  <p className="text-xs text-muted-foreground">Sans réponse</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              Tous les avis
            </TabsTrigger>
            <TabsTrigger value="positive" className="gap-2">
              Positifs ({positiveResponses.length})
            </TabsTrigger>
            <TabsTrigger value="negative" className="gap-2">
              Négatifs ({negativeResponses.length})
            </TabsTrigger>
            <TabsTrigger value="unreplied" className="gap-2">
              Sans réponse ({unrepliedCount})
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
                        Envoyer automatiquement une réponse par email après chaque avis
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
                        Réponse pour les avis positifs (score &ge; {POSITIVE_THRESHOLD}/5)
                      </Label>
                    </div>
                    <Textarea
                      value={autoReplyPositive}
                      onChange={(e) => setAutoReplyPositive(e.target.value)}
                      rows={4}
                      placeholder="Message envoyé aux patients avec un avis positif..."
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-red-600" />
                      <Label className="font-medium">
                        Réponse pour les avis négatifs (score &lt; {POSITIVE_THRESHOLD}/5)
                      </Label>
                    </div>
                    <Textarea
                      value={autoReplyNegative}
                      onChange={(e) => setAutoReplyNegative(e.target.value)}
                      rows={4}
                      placeholder="Message envoyé aux patients avec un avis négatif..."
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

          {/* Liste des avis */}
          {["all", "positive", "negative", "unreplied"].map((tabValue) => (
            <TabsContent key={tabValue} value={tabValue} className="mt-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un avis..."
                      className="pl-9"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  {filteredResponses.map((response) => {
                    const reply = getReply(response.id);
                    const isReplying = replyingTo === response.id;

                    return (
                      <Card key={response.id} className="overflow-hidden">
                        <CardContent className="pt-5 pb-4">
                          {/* Header */}
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
                              {reply && (
                                <Badge variant="outline" className="gap-1">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Répondu
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Scores par question */}
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

                          {/* Réponse existante */}
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

                          {/* Actions */}
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

                          {/* Zone de réponse */}
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

                  {filteredResponses.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground">
                      <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Aucun avis trouvé</p>
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
