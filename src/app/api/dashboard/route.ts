import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const [contactCount, campaigns, responses, kpis, allResponses] =
      await Promise.all([
        prisma.contact.count(),
        prisma.campaign.findMany({ orderBy: { createdAt: "desc" }, take: 5 }),
        prisma.surveyResponse.findMany({
          include: { contact: true },
          orderBy: { completedAt: "desc" },
          take: 5,
        }),
        prisma.weeklyKpi.findMany({
          orderBy: { weekStart: "desc" },
          take: 2,
        }),
        prisma.surveyResponse.findMany(),
      ]);

    const avgScore =
      allResponses.length > 0
        ? allResponses.reduce((s, r) => s + r.averageScore, 0) /
          allResponses.length
        : 0;
    const positiveCount = allResponses.filter((r) => r.isPositive).length;
    const redirectedCount = allResponses.filter(
      (r) => r.redirectedToGoogle
    ).length;

    const latestKpi = kpis[0] ?? null;
    const previousKpi = kpis[1] ?? null;

    return Response.json({
      contactCount,
      avgScore,
      positiveCount,
      totalResponses: allResponses.length,
      redirectedCount,
      campaigns,
      recentResponses: responses.map((r) => ({
        id: r.id,
        contactName: `${r.contact.firstName} ${r.contact.lastName}`,
        contactEmail: r.contact.email,
        averageScore: r.averageScore,
        isPositive: r.isPositive,
        redirectedToGoogle: r.redirectedToGoogle,
        completedAt: r.completedAt.toISOString().split("T")[0],
      })),
      latestKpi: latestKpi
        ? {
            weekStart: latestKpi.weekStart.toISOString(),
            messagesWebflow: latestKpi.messagesWebflow,
            appelsCentre: latestKpi.appelsCentre,
            rdvDoctolib: latestKpi.rdvDoctolib,
            traficSite: latestKpi.traficSite,
          }
        : null,
      previousKpi: previousKpi
        ? {
            messagesWebflow: previousKpi.messagesWebflow,
            appelsCentre: previousKpi.appelsCentre,
            rdvDoctolib: previousKpi.rdvDoctolib,
            traficSite: previousKpi.traficSite,
          }
        : null,
    });
  } catch (e) {
    console.error("Dashboard API error:", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
