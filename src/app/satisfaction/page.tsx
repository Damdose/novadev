"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SURVEY_QUESTIONS, POSITIVE_THRESHOLD } from "@/lib/types";
import { Star, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SatisfactionPage() {
  const router = useRouter();
  const [answers, setAnswers] = useState<number[]>(
    new Array(SURVEY_QUESTIONS.length).fill(0)
  );
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const setRating = (questionIndex: number, rating: number) => {
    const newAnswers = [...answers];
    newAnswers[questionIndex] = rating;
    setAnswers(newAnswers);
  };

  const allAnswered = answers.every((a) => a > 0);
  const progress = answers.filter((a) => a > 0).length / SURVEY_QUESTIONS.length;

  const handleSubmit = () => {
    setIsSubmitting(true);
    const avg =
      answers.reduce((sum, a) => sum + a, 0) / answers.length;
    const isPositive = avg >= POSITIVE_THRESHOLD;

    setTimeout(() => {
      if (isPositive) {
        router.push("/satisfaction/merci?redirect=google");
      } else {
        router.push("/satisfaction/merci");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/5 via-white to-white flex flex-col">
      <div className="flex items-center justify-center gap-2 py-6">
        <div className="h-9 w-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
          N
        </div>
        <span className="text-lg font-semibold tracking-tight">Novadev</span>
      </div>

      <div className="flex-1 flex items-start justify-center px-4 pb-12">
        <div className="w-full max-w-lg space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-bold tracking-tight">
              Votre avis compte
            </h1>
            <p className="text-muted-foreground">
              Aidez-nous à améliorer notre accompagnement en répondant à ces {SURVEY_QUESTIONS.length} questions
            </p>
          </div>

          <div className="h-1.5 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <div className="space-y-4">
            {SURVEY_QUESTIONS.map((question, qi) => (
              <Card
                key={question.id}
                className={`transition-all duration-300 ${
                  answers[qi] > 0
                    ? "border-primary/20 bg-primary/[0.02]"
                    : qi === currentQuestion
                      ? "border-primary/40 shadow-sm"
                      : ""
                }`}
              >
                <CardContent className="pt-5 pb-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-semibold shrink-0 mt-0.5">
                        {question.id}
                      </span>
                      <p className="text-sm font-medium leading-relaxed">
                        {question.text}
                      </p>
                    </div>

                    <div className="flex items-center justify-center gap-2 pt-1">
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          onClick={() => {
                            setRating(qi, rating);
                            if (qi < SURVEY_QUESTIONS.length - 1 && answers[qi] === 0) {
                              setCurrentQuestion(qi + 1);
                            }
                          }}
                          className="group relative p-1"
                        >
                          <Star
                            className={`h-8 w-8 transition-all ${
                              rating <= answers[qi]
                                ? "fill-amber-400 text-amber-400 scale-110"
                                : "text-gray-200 hover:text-amber-200 hover:scale-110"
                            }`}
                          />
                        </button>
                      ))}
                    </div>

                    {answers[qi] > 0 && (
                      <div className="flex justify-center">
                        <span className="text-xs text-muted-foreground">
                          {answers[qi] === 1 && "Pas du tout satisfait"}
                          {answers[qi] === 2 && "Peu satisfait"}
                          {answers[qi] === 3 && "Moyennement satisfait"}
                          {answers[qi] === 4 && "Satisfait"}
                          {answers[qi] === 5 && "Très satisfait"}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="w-full gap-2 h-12 text-base"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Envoyer mes réponses
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          <p className="text-[11px] text-center text-muted-foreground">
            Centre Novadev — 15 rue Beudant, 75017 Paris
            <br />
            Vos réponses sont confidentielles et nous aident à améliorer nos services.
          </p>
        </div>
      </div>
    </div>
  );
}
