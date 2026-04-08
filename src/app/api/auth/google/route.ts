import { NextRequest } from "next/server";
import { getAuthUrl } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/callback/google`;
  const authUrl = getAuthUrl(redirectUri);

  return Response.redirect(authUrl);
}
