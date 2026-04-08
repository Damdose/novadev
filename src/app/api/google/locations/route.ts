import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/google-auth";
import { fetchAccounts, fetchLocations } from "@/lib/google-business";

export async function GET(request: NextRequest) {
  if (!isAuthenticated()) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    const accounts = await fetchAccounts();
    if (accounts.length === 0) {
      return Response.json({ locations: [] });
    }

    const accountName = request.nextUrl.searchParams.get("account") || accounts[0].name;
    const locations = await fetchLocations(accountName);
    return Response.json({ accounts, locations });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}
