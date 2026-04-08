"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Star, ExternalLink, Heart } from "lucide-react";
import { Suspense } from "react";

function MerciContent() {
  const searchParams = useSearchParams();
  const shouldRedirect = searchParams.get("redirect") === "google";

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-white flex flex-col">
      <div className="flex items-center justify-center gap-2 py-6">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          N
        </div>
        <span className="text-lg font-semibold tracking-tight">Novadev</span>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center space-y-6">
            <div className="flex justify-center">
              <div className="rounded-full bg-emerald-50 p-4">
                <CheckCircle2 className="h-12 w-12 text-emerald-500" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-bold tracking-tight">
                Merci pour votre retour !
              </h1>
              <p className="text-muted-foreground">
                Vos réponses nous aident à améliorer la qualité de nos services
                pour mieux accompagner les familles.
              </p>
            </div>

            {shouldRedirect ? (
              <div className="space-y-4 pt-2">
                <div className="rounded-lg border bg-amber-50/50 border-amber-200/50 p-4 space-y-2">
                  <div className="flex items-center justify-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-amber-400 text-amber-400"
                      />
                    ))}
                  </div>
                  <p className="text-sm font-medium">
                    Votre expérience a été positive !
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Partagez votre avis sur Google pour aider d&apos;autres
                    parents à découvrir Novadev.
                  </p>
                </div>

                <a
                  href="https://g.page/r/novadev/review"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full gap-2 h-12" size="lg">
                    <Star className="h-4 w-4" />
                    Laisser un avis Google
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </a>

                <p className="text-xs text-muted-foreground">
                  Cela ne prend que 30 secondes et aide beaucoup d&apos;autres familles
                </p>
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Heart className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Nous avons bien noté vos remarques. Notre équipe les
                    examinera avec attention pour améliorer votre prochaine
                    expérience.
                  </p>
                </div>
              </div>
            )}

            <p className="text-[11px] text-muted-foreground pt-4">
              Centre Novadev — 15 rue Beudant, 75017 Paris
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function MerciPage() {
  return (
    <Suspense>
      <MerciContent />
    </Suspense>
  );
}
