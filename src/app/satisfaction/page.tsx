"use client";

import { useState, useEffect, Suspense, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, Loader2, Check, Star } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

interface SubQuestion {
  id: number;
  text: string;
}

interface Section {
  id: number;
  title: string;
  questions: SubQuestion[];
}

const STAR_LABELS: Record<number, string> = {
  1: "Pas du tout satisfait(e)",
  2: "Peu satisfait(e)",
  3: "Satisfait(e)",
  4: "Tres satisfait(e)",
};

const RECOMMENDATION_OPTIONS = [
  { value: 4, label: "Oui tout a fait" },
  { value: 3, label: "Oui plutot" },
  { value: 2, label: "Non plutot pas" },
  { value: 1, label: "Non pas du tout" },
];

function StarRating({ value, onChange }: { value: number | undefined; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);

  return (
    <div className="flex items-center gap-0.5" onMouseLeave={() => setHovered(0)}>
      {[1, 2, 3, 4].map((star) => {
        const active = hovered > 0 ? star <= hovered : star <= (value ?? 0);
        return (
          <button
            key={star}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHovered(star)}
            className="p-0.5 transition-transform hover:scale-110"
          >
            <Star
              className={`h-7 w-7 transition-colors duration-150 ${
                active
                  ? "fill-amber-400 text-amber-400"
                  : "fill-transparent text-gray-300 hover:text-amber-200"
              }`}
            />
          </button>
        );
      })}
      {(hovered > 0 || (value !== undefined && value > 0)) && (
        <span className="ml-2 text-xs text-gray-500 transition-opacity">
          {STAR_LABELS[hovered || value || 0]}
        </span>
      )}
    </div>
  );
}

function SurveyContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("cid") || "";
  const contactId = searchParams.get("uid") || "";

  const [sections, setSections] = useState<Section[]>([]);
  const [scores, setScores] = useState<Record<number, number>>({});
  const [recommendation, setRecommendation] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const sectionRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => { if (!r.ok) throw new Error("failed"); return r.json(); })
      .then((settings) => {
        try {
          const parsed = JSON.parse(settings.questions);
          if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].questions) {
            setSections([{ id: 1, title: "Votre satisfaction", questions: parsed }]);
          } else {
            setSections(parsed);
          }
        } catch {
          setSections([]);
        }
      })
      .catch(() => setSections([]))
      .finally(() => setLoading(false));
  }, []);

  const totalQuestions = sections.reduce((sum, s) => sum + (s.questions ?? []).length, 0);
  const answeredCount = Object.keys(scores).length;
  const progress = totalQuestions > 0 ? (answeredCount + (recommendation !== null ? 1 : 0)) / (totalQuestions + 1) : 0;
  const allAnswered = answeredCount === totalQuestions && recommendation !== null;

  const setScore = (questionId: number, value: number) => {
    setScores((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const allQuestionIds = sections.flatMap((s) => (s.questions ?? []).map((q) => q.id));
    const scoresArray = allQuestionIds.map((id) => scores[id] ?? 0);

    try {
      const res = await fetch("/api/survey", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, contactId, scores: scoresArray, recommendation, comment }),
      });
      const data = await res.json();
      if (data.isPositive && data.googleUrl) {
        router.push(`/satisfaction/merci?redirect=google`);
      } else {
        router.push("/satisfaction/merci");
      }
    } catch {
      router.push("/satisfaction/merci");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  const sectionComplete = (section: Section) => (section.questions ?? []).every((q) => scores[q.id] !== undefined);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed header */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold shrink-0">N</div>
          <div className="flex-1 min-w-0">
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
              <div className="h-full rounded-full bg-primary transition-all duration-700 ease-out" style={{ width: `${progress * 100}%` }} />
            </div>
          </div>
          <span className="text-xs text-gray-400 font-medium tabular-nums shrink-0">{Math.round(progress * 100)}%</span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Intro */}
        <div className="text-center space-y-2 pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">Questionnaire de satisfaction</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-md mx-auto">
            Votre avis nous aide a ameliorer la qualite de notre accompagnement. Ce questionnaire est anonyme et prend moins de 2 minutes.
          </p>
        </div>

        {/* Step navigation */}
        <div className="flex items-center justify-center gap-1.5 pb-2">
          {sections.map((section, i) => (
            <button
              key={section.id}
              onClick={() => sectionRefs.current[section.id]?.scrollIntoView({ behavior: "smooth", block: "start" })}
              className="group flex items-center gap-1.5"
            >
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                sectionComplete(section)
                  ? "bg-emerald-500 text-white"
                  : (section.questions ?? []).some((q) => scores[q.id] !== undefined)
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "bg-gray-100 text-gray-400"
              }`}>
                {sectionComplete(section) ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < sections.length - 1 && <div className={`w-6 h-px ${sectionComplete(section) ? "bg-emerald-300" : "bg-gray-200"}`} />}
            </button>
          ))}
          <div className="w-6 h-px bg-gray-200" />
          <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
            recommendation !== null
              ? "bg-emerald-500 text-white"
              : "bg-gray-100 text-gray-400"
          }`}>
            {recommendation !== null ? <Check className="h-3.5 w-3.5" /> : sections.length + 1}
          </div>
        </div>

        {/* Sections */}
        {sections.map((section) => (
          <div
            key={section.id}
            ref={(el) => { sectionRefs.current[section.id] = el; }}
            className="scroll-mt-20"
          >
            <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
              sectionComplete(section) ? "border-emerald-200" : "border-gray-200"
            }`}>
              {/* Section header */}
              <div className={`px-5 py-4 border-b flex items-center justify-between ${
                sectionComplete(section) ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50/50"
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                    sectionComplete(section) ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
                  }`}>
                    {sectionComplete(section) ? <Check className="h-3.5 w-3.5" /> : section.id}
                  </div>
                  <h2 className="font-semibold text-sm text-gray-900">{section.title}</h2>
                </div>
                <span className="text-xs text-gray-400">
                  {(section.questions ?? []).filter((q) => scores[q.id] !== undefined).length}/{(section.questions ?? []).length}
                </span>
              </div>

              {/* Questions */}
              <div className="divide-y divide-gray-100">
                {(section.questions ?? []).map((q) => (
                  <div key={q.id} className="px-5 py-4 space-y-2">
                    <p className="text-sm text-gray-700">{q.text}</p>
                    <StarRating value={scores[q.id]} onChange={(v) => setScore(q.id, v)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Recommendation */}
        <div className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${
          recommendation !== null ? "border-emerald-200" : "border-gray-200"
        }`}>
          <div className={`px-5 py-4 border-b ${
            recommendation !== null ? "bg-emerald-50/50 border-emerald-100" : "bg-gray-50/50"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold ${
                recommendation !== null ? "bg-emerald-500 text-white" : "bg-primary/10 text-primary"
              }`}>
                {recommendation !== null ? <Check className="h-3.5 w-3.5" /> : sections.length + 1}
              </div>
              <h2 className="font-semibold text-sm text-gray-900">Recommandation</h2>
            </div>
          </div>
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm text-gray-700">Recommanderiez-vous le Centre Novadev a votre entourage ?</p>
            <div className="flex flex-col gap-2">
              {RECOMMENDATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setRecommendation(opt.value)}
                  className={`flex items-center gap-3 text-sm px-4 py-3 rounded-xl border transition-all duration-150 text-left ${
                    recommendation === opt.value
                      ? "bg-amber-50 border-amber-400 text-amber-800 ring-1 ring-amber-400/30"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className={`h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                    recommendation === opt.value ? "border-amber-400" : "border-gray-300"
                  }`}>
                    {recommendation === opt.value && <div className="h-2 w-2 rounded-full bg-amber-400" />}
                  </div>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Free text */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-4 border-b bg-gray-50/50">
            <h2 className="font-semibold text-sm text-gray-900">Expression libre</h2>
          </div>
          <div className="px-5 py-4 space-y-2">
            <p className="text-sm text-gray-500">Quelles ameliorations souhaiteriez-vous ?</p>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Vos suggestions (facultatif)..."
              rows={3}
              className="resize-none border-gray-200 focus:border-primary/50 text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2 pb-8">
          <Button
            onClick={handleSubmit}
            disabled={!allAnswered || isSubmitting}
            className="w-full gap-2 h-12 text-base rounded-xl shadow-sm"
            size="lg"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                Envoyer mes reponses
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
          {!allAnswered && (
            <p className="text-xs text-center text-gray-400 mt-2">
              Repondez a toutes les questions pour envoyer
            </p>
          )}
        </div>

        <p className="text-[11px] text-center text-gray-400 pb-8">
          Centre Novadev — 15 rue Beudant, 75017 Paris
          <br />
          Vos reponses sont confidentielles et nous aident a ameliorer nos services.
        </p>
      </div>
    </div>
  );
}

export default function SatisfactionPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    }>
      <SurveyContent />
    </Suspense>
  );
}
