import { isAuthenticated } from "@/lib/google-auth";

export async function GET() {
  return Response.json({ authenticated: isAuthenticated() });
}
