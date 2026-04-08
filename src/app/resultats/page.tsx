"use client";

import { useState } from "react";
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
  TrendingUp,
  BarChart3,
  MessageSquare,
} from "lucide-react";
import { mockResponses } from "@/lib/mock-data";
import { SURVEY_QUESTIONS, POSITIVE_THRESHOLD } from "@/lib/types";

export default function ResultsPage() {
  const [tab, setTab] = useState("all");

  const positiveResponses = mockResponses.filter((r) => r.isPositive);
  const negativeResponses = mockResponses.filter((r) => !r.isPositive);
  const avgScore =
    mockResponses.length > 0
      ? mockResponses.reduce((sum, r) => sum + r.averageScore, 0) /
        mockResponses.length
      : 0;
  const redirectedCount = mockResponses.filter(
    (r) => r.redirectedToGoogle
  ).length;

  const filteredResponses =
    tab === "positive"
      ? positiveResponses
      : tab === "negative"
        ? negativeResponses
        : mockResponses;

  const questionAverages = SURVEY_QUESTIONS.map((q) => {
    const avg =
      mockResponses.length > 0
        ? mockResponses.reduce((sum, r) => sum + r.answers[q.id - 1], 0) /
          mockResponses.length
        : 0;
    return { ...q, average: avg };
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Résultats</h1>
          <p className="text-muted-foreground mt-1">
            Analysez les réponses au questionnaire de satisfaction
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-amber-50 p-3">
                  <Star className="h-5 w-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{avgScore.toFixed(1)}/5</p>
                  <p className="text-xs text-muted-foreground">Score moyen</p>
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
                  <p className="text-xs text-muted-foreground">Avis positifs</p>
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
                  <p className="text-xs text-muted-foreground">Avis négatifs</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <ExternalLink className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{redirectedCount}</p>
                  <p className="text-xs text-muted-foreground">
                    Redirigés Google
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Score moyen par question
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {questionAverages.map((q) => (
              <div key={q.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground truncate max-w-md">
                    {q.text}
                  </span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {q.average.toFixed(1)}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      q.average >= POSITIVE_THRESHOLD
                        ? "bg-emerald-500"
                        : q.average >= 3
                          ? "bg-amber-500"
                          : "bg-red-500"
                    }`}
                    style={{ width: `${(q.average / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Réponses individuelles
              </CardTitle>
              <Tabs value={tab} onValueChange={setTab}>
                <TabsList>
                  <TabsTrigger value="all">
                    Toutes ({mockResponses.length})
                  </TabsTrigger>
                  <TabsTrigger value="positive">
                    Positives ({positiveResponses.length})
                  </TabsTrigger>
                  <TabsTrigger value="negative">
                    Négatives ({negativeResponses.length})
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredResponses.map((response) => (
                <div
                  key={response.id}
                  className="rounded-lg border p-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-xs font-medium">
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
                          {response.contactEmail} &middot; {response.completedAt}
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
                        <Badge
                          variant="default"
                          className="bg-emerald-500 hover:bg-emerald-600"
                        >
                          Positif
                        </Badge>
                      ) : (
                        <Badge variant="destructive">Négatif</Badge>
                      )}
                      {response.redirectedToGoogle && (
                        <Badge variant="outline" className="gap-1">
                          <ExternalLink className="h-3 w-3" />
                          Google
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-5 gap-2">
                    {SURVEY_QUESTIONS.map((q, i) => (
                      <div
                        key={q.id}
                        className="rounded bg-muted/50 px-2 py-1.5 text-center"
                      >
                        <p className="text-[10px] text-muted-foreground truncate">
                          Q{q.id}
                        </p>
                        <p className="text-sm font-semibold">
                          {response.answers[i]}/5
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
