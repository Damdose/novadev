import { NextRequest } from "next/server";
import { exchangeCode } from "@/lib/google-auth";

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const error = request.nextUrl.searchParams.get("error");
  const origin = request.nextUrl.origin;

  if (error) {
    return Response.redirect(`${origin}/parametres?google=error&message=${error}`);
  }

  if (!code) {
    return Response.redirect(`${origin}/parametres?google=error&message=no_code`);
  }

  try {
    const redirectUri = `${origin}/api/auth/callback/google`;
    await exchangeCode(code, redirectUri);
    return Response.redirect(`${origin}/parametres?google=success`);
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown_error";
    return Response.redirect(`${origin}/parametres?google=error&message=${encodeURIComponent(message)}`);
  }
}
