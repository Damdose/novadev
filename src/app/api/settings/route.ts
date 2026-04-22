import { NextRequest } from "next/server";
import { prisma, ensureSettings } from "@/lib/db";

export async function GET() {
  try {
    const settings = await ensureSettings();
    return Response.json(settings);
  } catch (e) {
    console.error("Settings API error:", e);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    await ensureSettings();

    const settings = await prisma.settings.update({
      where: { id: "default" },
      data: {
        ...(body.googleUrl !== undefined && { googleUrl: body.googleUrl }),
        ...(body.threshold !== undefined && { threshold: body.threshold }),
        ...(body.positiveTitle !== undefined && { positiveTitle: body.positiveTitle }),
        ...(body.positiveMessage !== undefined && { positiveMessage: body.positiveMessage }),
        ...(body.negativeMessage !== undefined && { negativeMessage: body.negativeMessage }),
        ...(body.buttonText !== undefined && { buttonText: body.buttonText }),
        ...(body.senderName !== undefined && { senderName: body.senderName }),
        ...(body.senderEmail !== undefined && { senderEmail: body.senderEmail }),
        ...(body.questions !== undefined && { questions: JSON.stringify(body.questions) }),
      },
    });

    return Response.json(settings);
  } catch (e) {
    console.error("Settings PUT error:", e);
    return Response.json({ error: "Erreur lors de la mise à jour des paramètres" }, { status: 500 });
  }
}
