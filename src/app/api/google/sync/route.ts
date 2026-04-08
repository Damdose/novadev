import { isAuthenticated } from "@/lib/google-auth";
import { syncAll, getCachedData } from "@/lib/google-business";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    const cached = getCachedData();
    if (cached) {
      return Response.json(cached);
    }
    const data = await syncAll();
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    const data = await syncAll();
    return Response.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}
