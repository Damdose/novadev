import { isAuthenticated } from "@/lib/google-auth";
import { syncAll, getCachedData } from "@/lib/google-business";

// GET — returns cached data or syncs if none
export async function GET() {
  if (!isAuthenticated()) {
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

// POST — force a fresh sync
export async function POST() {
  if (!isAuthenticated()) {
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
