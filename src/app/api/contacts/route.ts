import { NextRequest } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: { importedAt: "desc" },
    });
    return Response.json(contacts);
  } catch (e) {
    console.error("Contacts API error:", e);
    return Response.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Bulk import
    if (Array.isArray(body)) {
      const valid = body.filter((c) => c.firstName && c.lastName && c.email);
      if (valid.length === 0) {
        return Response.json({ error: "Aucun contact valide (firstName, lastName, email requis)" }, { status: 400 });
      }
      const created = await prisma.contact.createMany({
        data: valid.map((c: { firstName: string; lastName: string; email: string; phone?: string }) => ({
          firstName: c.firstName,
          lastName: c.lastName,
          email: c.email,
          phone: c.phone || null,
        })),
      });
      return Response.json({ count: created.count });
    }

    // Single create
    if (!body.firstName || !body.lastName || !body.email) {
      return Response.json({ error: "firstName, lastName et email sont requis" }, { status: 400 });
    }

    const contact = await prisma.contact.create({
      data: {
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone || null,
      },
    });
    return Response.json(contact);
  } catch (e) {
    console.error("Contacts POST error:", e);
    return Response.json({ error: "Erreur lors de la création du contact" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();
    if (!id) {
      return Response.json({ error: "id est requis" }, { status: 400 });
    }
    await prisma.contact.delete({ where: { id } });
    return Response.json({ success: true });
  } catch (e) {
    console.error("Contacts DELETE error:", e);
    return Response.json({ error: "Erreur lors de la suppression du contact" }, { status: 500 });
  }
}
