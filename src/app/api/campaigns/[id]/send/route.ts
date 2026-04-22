import { NextRequest } from "next/server";
import { prisma, ensureSettings } from "@/lib/db";
import { sendSurveyEmail } from "@/lib/email";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      contacts: {
        where: { emailSent: false },
        include: { contact: true },
      },
    },
  });

  if (!campaign) {
    return Response.json({ error: "Campagne introuvable" }, { status: 404 });
  }

  const settings = await ensureSettings();
  if (!settings) {
    return Response.json({ error: "Paramètres non configurés" }, { status: 500 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3001";

  await prisma.campaign.update({
    where: { id },
    data: { status: "sending" },
  });

  let sentCount = 0;
  const errors: string[] = [];

  for (const cc of campaign.contacts) {
    const surveyUrl = `${baseUrl}/satisfaction?cid=${id}&uid=${cc.contact.id}`;

    try {
      await sendSurveyEmail({
        to: cc.contact.email,
        firstName: cc.contact.firstName,
        subject: campaign.subject,
        body: campaign.body,
        surveyUrl,
        senderName: settings.senderName,
        senderEmail: settings.senderEmail,
      });

      await prisma.campaignContact.update({
        where: { id: cc.id },
        data: { emailSent: true, sentAt: new Date() },
      });

      await prisma.contact.update({
        where: { id: cc.contact.id },
        data: { status: "sent" },
      });

      sentCount++;
    } catch (err) {
      errors.push(`${cc.contact.email}: ${err instanceof Error ? err.message : "erreur"}`);
    }
  }

  await prisma.campaign.update({
    where: { id },
    data: {
      sentCount: { increment: sentCount },
      status: sentCount > 0 ? "sent" : "draft",
    },
  });

  return Response.json({ sentCount, errors });
  } catch (e) {
    console.error("Campaign send error:", e);
    return Response.json({ error: "Erreur lors de l'envoi de la campagne" }, { status: 500 });
  }
}
