import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      orderBy: { createdAt: "desc" },
    });
    return Response.json(campaigns);
  } catch (e) {
    console.error("Campaigns API error:", e);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.name || !body.subject || !body.body) {
      return Response.json({ error: "name, subject et body sont requis" }, { status: 400 });
    }

    // Get pending contacts
    const pendingContacts = await prisma.contact.findMany({
      where: { status: "pending" },
    });

    const campaign = await prisma.campaign.create({
      data: {
        name: body.name,
        subject: body.subject,
        body: body.body,
        contactCount: pendingContacts.length,
        contacts: {
          create: pendingContacts.map((c) => ({
            contactId: c.id,
          })),
        },
      },
    });

    return Response.json(campaign);
  } catch (e) {
    console.error("Campaigns POST error:", e);
    return Response.json({ error: "Erreur lors de la création de la campagne" }, { status: 500 });
  }
}
