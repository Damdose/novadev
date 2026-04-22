import { NextRequest } from "next/server";
import { prisma, ensureSettings } from "@/lib/db";

// Submit survey response
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { campaignId, contactId, scores, recommendation, comment } = body as {
      campaignId: string;
      contactId: string;
      scores: number[];
      recommendation: number;
      comment?: string;
    };

    if (!campaignId || !contactId || !scores?.length || !recommendation) {
      return Response.json({ error: "Donnees manquantes" }, { status: 400 });
    }

    const settings = await ensureSettings();
    const threshold = settings?.threshold ?? 3;

    // Calculate average excluding "Non concerne" (0) answers
    const validScores = scores.filter((s) => s > 0);
    const averageScore = validScores.length > 0
      ? validScores.reduce((s, a) => s + a, 0) / validScores.length
      : 0;

    const isPositive = averageScore >= threshold && recommendation >= 3;

    const answersJson = JSON.stringify({ scores, recommendation, comment: comment || "" });

    const response = await prisma.surveyResponse.create({
      data: {
        campaignId,
        contactId,
        answers: answersJson,
        averageScore,
        recommendation,
        comment: comment || "",
        isPositive,
        redirectedToGoogle: isPositive,
      },
    });

    // Update contact status
    await prisma.contact.update({
      where: { id: contactId },
      data: { status: "completed" },
    });

    // Update campaign counts
    await prisma.campaign.update({
      where: { id: campaignId },
      data: {
        completedCount: { increment: 1 },
        ...(isPositive
          ? { positiveCount: { increment: 1 } }
          : { negativeCount: { increment: 1 } }),
      },
    });

    return Response.json({
      id: response.id,
      isPositive,
      averageScore,
      googleUrl: isPositive ? settings?.googleUrl : null,
    });
  } catch (e) {
    console.error("Survey POST error:", e);
    return Response.json({ error: "Erreur lors de l'enregistrement de la réponse" }, { status: 500 });
  }
}

// Get survey responses
export async function GET(request: NextRequest) {
  try {
    const campaignId = request.nextUrl.searchParams.get("campaignId");

    const where = campaignId ? { campaignId } : {};

    const responses = await prisma.surveyResponse.findMany({
      where,
      include: { contact: true },
      orderBy: { completedAt: "desc" },
    });

    return Response.json(
      responses.map((r) => {
        let parsed: { scores?: number[]; recommendation?: number; comment?: string } = {};
        try {
          parsed = JSON.parse(r.answers);
        } catch {
          // legacy format fallback
        }
        return {
          id: r.id,
          campaignId: r.campaignId,
          contactId: r.contactId,
          contactName: `${r.contact.firstName} ${r.contact.lastName}`,
          contactEmail: r.contact.email,
          scores: parsed.scores || [],
          recommendation: r.recommendation,
          comment: r.comment,
          averageScore: r.averageScore,
          isPositive: r.isPositive,
          redirectedToGoogle: r.redirectedToGoogle,
          completedAt: r.completedAt.toISOString().split("T")[0],
        };
      })
    );
  } catch (e) {
    console.error("Survey API error:", e);
    return Response.json([], { status: 500 });
  }
}
