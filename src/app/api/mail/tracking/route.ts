import { prisma } from "@/lib/db";

export async function GET() {
  try {
  const campaignContacts = await prisma.campaignContact.findMany({
    include: {
      contact: true,
      campaign: {
        select: { id: true, name: true, subject: true, createdAt: true },
      },
    },
    orderBy: { sentAt: "desc" },
  });

  const tracking = campaignContacts.map((cc) => ({
    id: cc.id,
    campaignId: cc.campaign.id,
    campaignName: cc.campaign.name,
    contactId: cc.contact.id,
    firstName: cc.contact.firstName,
    lastName: cc.contact.lastName,
    email: cc.contact.email,
    emailSent: cc.emailSent,
    emailOpened: cc.emailOpened,
    sentAt: cc.sentAt,
    openedAt: cc.openedAt,
    contactStatus: cc.contact.status,
  }));

  return Response.json(tracking);
  } catch (e) {
    console.error("Mail tracking API error:", e);
    return Response.json([], { status: 500 });
  }
}
