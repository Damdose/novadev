import { isAuthenticated } from "@/lib/google-auth";
import { fetchAccounts } from "@/lib/google-business";

export async function GET() {
  if (!isAuthenticated()) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    const accounts = await fetchAccounts();
    return Response.json({ accounts });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}
