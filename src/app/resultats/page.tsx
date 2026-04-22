"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Star,
  ThumbsUp,
  ThumbsDown,
  ExternalLink,
  BarChart3,
  MessageSquare,
  Loader2,
  Eye,
  Monitor,
  Smartphone,
  RotateCcw,
} from "lucide-react";

interface Section {
  id: number;
  title: string;
  questions: { id: number; text: string }[];
}

interface SurveyResponse {
  id: string;
  campaignId: string;
  contactId: string;
  contactName: string;
  contactEmail: string;
  scores: number[];
  recommendation: number;
  comment: string;
  averageScore: number;
  isPositive: boolean;
  redirectedToGoogle: boolean;
  completedAt: string;
}

const RECOMMENDATION_MAP: Record<number, string> = {
  4: "Oui tout a fait",
  3: "Oui plutot",
  2: "Non plutot pas",
  1: "Non pas du tout",
};

export default function ResultsPage() {
  const [responses, setResponses] = useState<SurveyResponse[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [responseTab, setResponseTab] = useState("all");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");
  const [iframeKey, setIframeKey] = useState(0);

  useEffect(() => {
    Promise.all([
      fetch("/api/survey").then((r) => r.ok ? r.json() : []),
      fetch("/api/settings").then((r) => r.ok ? r.json() : {}),
    ]).then(([responsesData, settingsData]) => {
      setResponses(responsesData);
      try {
        setSections(JSON.parse((settingsData as { questions?: string }).questions ?? "[]"));
      } catch {
        setSections([]);
      }
    })
    .catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  const positiveResponses = responses.filter((r) => r.isPositive);
  const negativeResponses = responses.filter((r) => !r.isPositive);
  const avgScore = responses.length > 0
    ? responses.reduce((sum, r) => sum + r.averageScore, 0) / responses.length
    : 0;
  const redirectedCount = responses.filter((r) => r.redirectedToGoogle).length;

  const filteredResponses =
    responseTab === "positive" ? positiveResponses
    : responseTab === "negative" ? negativeResponses
    : responses;

  // Build flat question list for averages
  const allQuestions = sections.flatMap((s) => s.questions ?? []);

  const questionAverages = allQuestions.map((q, idx) => {
    const validScores = responses
      .map((r) => r.scores[idx])
      .filter((s) => s !== undefined && s > 0);
    const avg = validScores.length > 0
      ? validScores.reduce((sum, s) => sum + s, 0) / validScores.length
      : 0;
    return { ...q, average: avg };
  });

  // Group averages by section
  let questionIdx = 0;
  const sectionAverages = sections.map((section) => {
    const qAvgs = (section.questions ?? []).map(() => {
      const avg = questionAverages[questionIdx];
      questionIdx++;
      return avg;
    });
    return { ...section, questionAverages: qAvgs };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Satisfaction</h1>
          <p className="text-muted-foreground mt-1">Previsualisez le questionnaire et analysez les reponses</p>
        </div>

        <Tabs defaultValue="resultats" className="space-y-6">
          <TabsList>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="h-3.5 w-3.5" />
              Previsualisation
            </TabsTrigger>
            <TabsTrigger value="resultats" className="gap-2">
              <BarChart3 className="h-3.5 w-3.5" />
              Resultats ({responses.length})
            </TabsTrigger>
          </TabsList>

          {/* ── Preview tab ── */}
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Questionnaire de satisfaction
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center rounded-lg border p-0.5">
                      <button
                        onClick={() => setPreviewDevice("desktop")}
                        className={`rounded-md p-1.5 transition-colors ${previewDevice === "desktop" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Monitor className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setPreviewDevice("mobile")}
                        className={`rounded-md p-1.5 transition-colors ${previewDevice === "mobile" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}
                      >
                        <Smartphone className="h-4 w-4" />
                      </button>
                    </div>
                    <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setIframeKey((k) => k + 1)}>
                      <RotateCcw className="h-3.5 w-3.5" />
                      Recharger
                    </Button>
                    <a href="/satisfaction" target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm" className="gap-1.5">
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ouvrir
                      </Button>
                    </a>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`mx-auto transition-all duration-300 ${previewDevice === "mobile" ? "max-w-[375px]" : "max-w-full"}`}>
                  <div className={`relative rounded-xl border-2 bg-white overflow-hidden ${previewDevice === "mobile" ? "border-gray-300 shadow-lg" : "border-gray-200"}`}>
                    {/* Browser chrome */}
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border-b">
                      <div className="flex gap-1.5">
                        <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                        <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                      </div>
                      <div className="flex-1 mx-2">
                        <div className="bg-white rounded-md px-3 py-1 text-xs text-muted-foreground border text-center truncate">
                          /satisfaction?cid=preview&uid=preview
                        </div>
                      </div>
                    </div>
                    <iframe
                      key={iframeKey}
                      src="/satisfaction?cid=preview&uid=preview"
                      className={`w-full border-0 ${previewDevice === "mobile" ? "h-[667px]" : "h-[700px]"}`}
                      title="Previsualisation du questionnaire"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── Results tab ── */}
          <TabsContent value="resultats" className="space-y-6">
            {/* Stats cards */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-amber-50 p-3"><Star className="h-5 w-5 text-amber-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{avgScore.toFixed(1)}/4</p>
                      <p className="text-xs text-muted-foreground">Score moyen</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-emerald-50 p-3"><ThumbsUp className="h-5 w-5 text-emerald-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{positiveResponses.length}</p>
                      <p className="text-xs text-muted-foreground">Avis positifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-red-50 p-3"><ThumbsDown className="h-5 w-5 text-red-600" /></div>
                    <div>
                      <p className="text-2xl font-bold">{negativeResponses.length}</p>
                      <p className="text-xs text-muted-foreground">Avis negatifs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-primary/10 p-3"><ExternalLink className="h-5 w-5 text-primary" /></div>
                    <div>
                      <p className="text-2xl font-bold">{redirectedCount}</p>
                      <p className="text-xs text-muted-foreground">Rediriges Google</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Score by section */}
            {sectionAverages.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Score moyen par critere
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {sectionAverages.map((section) => (
                    <div key={section.id} className="space-y-3">
                      <h3 className="text-sm font-semibold flex items-center gap-2">
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold">{section.id}</span>
                        {section.title}
                      </h3>
                      {section.questionAverages.map((q) => (
                        <div key={q.id} className="space-y-1.5 pl-7">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground truncate max-w-md">{q.text}</span>
                            <span className="font-semibold">{q.average.toFixed(1)}/4</span>
                          </div>
                          <div className="h-2 rounded-full bg-muted overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                q.average >= 3 ? "bg-emerald-500" : q.average >= 2 ? "bg-amber-500" : "bg-red-500"
                              }`}
                              style={{ width: `${(q.average / 4) * 100}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Individual responses */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Reponses individuelles
                  </CardTitle>
                  <Tabs value={responseTab} onValueChange={setResponseTab}>
                    <TabsList>
                      <TabsTrigger value="all">Toutes ({responses.length})</TabsTrigger>
                      <TabsTrigger value="positive">Positives ({positiveResponses.length})</TabsTrigger>
                      <TabsTrigger value="negative">Negatives ({negativeResponses.length})</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {filteredResponses.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">Aucune reponse</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredResponses.map((response) => (
                      <div key={response.id} className="rounded-lg border p-4 hover:bg-muted/30 transition-colors space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
                              {response.contactName.split(" ").map((n) => n[0]).join("")}
                            </div>
                            <div>
                              <p className="text-sm font-medium">{response.contactName}</p>
                              <p className="text-xs text-muted-foreground">{response.contactEmail} &middot; {response.completedAt}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 bg-muted rounded-full px-2.5 py-1">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-semibold">{response.averageScore.toFixed(1)}/4</span>
                            </div>
                            {response.isPositive ? (
                              <Badge variant="default" className="bg-emerald-500 hover:bg-emerald-600">Positif</Badge>
                            ) : (
                              <Badge variant="destructive">Negatif</Badge>
                            )}
                            {response.redirectedToGoogle && (
                              <Badge variant="outline" className="gap-1">
                                <ExternalLink className="h-3 w-3" />
                                Google
                              </Badge>
                            )}
                          </div>
                        </div>

                        {response.recommendation > 0 && (
                          <div className="text-xs text-muted-foreground pl-12">
                            Recommandation : <span className="font-medium text-foreground">{RECOMMENDATION_MAP[response.recommendation]}</span>
                          </div>
                        )}

                        {response.comment && (
                          <div className="ml-12 rounded-lg bg-muted/50 p-3 text-sm text-muted-foreground italic">
                            &laquo; {response.comment} &raquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}
