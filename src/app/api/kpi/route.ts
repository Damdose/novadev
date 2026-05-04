import { prisma } from "@/lib/db";
import { type NextRequest } from "next/server";

export async function GET() {
  try {
    const kpis = await prisma.weeklyKpi.findMany({
      orderBy: { weekStart: "desc" },
      take: 52,
    });
    return Response.json(kpis);
  } catch (e) {
    console.error("KPI API error:", e);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { weekStart, messagesWebflow, appelsCentre, rdvDoctolib, messagesDoctolib, traficSite } = body;

    if (!weekStart) {
      return Response.json({ error: "weekStart is required" }, { status: 400 });
    }

    const date = new Date(weekStart);
    date.setUTCHours(0, 0, 0, 0);

    const kpi = await prisma.weeklyKpi.upsert({
      where: { weekStart: date },
      update: {
        messagesWebflow: messagesWebflow ?? 0,
        appelsCentre: appelsCentre ?? 0,
        rdvDoctolib: rdvDoctolib ?? 0,
        messagesDoctolib: messagesDoctolib ?? 0,
        traficSite: traficSite ?? 0,
        updatedAt: new Date(),
      },
      create: {
        weekStart: date,
        messagesWebflow: messagesWebflow ?? 0,
        appelsCentre: appelsCentre ?? 0,
        rdvDoctolib: rdvDoctolib ?? 0,
        messagesDoctolib: messagesDoctolib ?? 0,
        traficSite: traficSite ?? 0,
      },
    });

    return Response.json(kpi);
  } catch (e) {
    console.error("KPI POST error:", e);
    return Response.json({ error: "Erreur lors de la sauvegarde du KPI" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, field, value } = body;

    if (!id || !field) {
      return Response.json({ error: "id and field are required" }, { status: 400 });
    }

    const allowedFields = ["appelsCentre", "rdvDoctolib", "messagesDoctolib", "messagesWebflow", "traficSite"];
    if (!allowedFields.includes(field)) {
      return Response.json({ error: "Invalid field" }, { status: 400 });
    }

    const kpi = await prisma.weeklyKpi.update({
      where: { id },
      data: {
        [field]: parseInt(value) || 0,
        updatedAt: new Date(),
      },
    });

    return Response.json(kpi);
  } catch (e) {
    console.error("KPI PATCH error:", e);
    return Response.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get("id");

    if (!id) {
      return Response.json({ error: "id is required" }, { status: 400 });
    }

    await prisma.weeklyKpi.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (e) {
    console.error("KPI DELETE error:", e);
    return Response.json({ error: "Erreur lors de la suppression du KPI" }, { status: 500 });
  }
}
