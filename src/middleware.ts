import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!login|api/auth|api/survey|api/mail/tracking|satisfaction|_next|favicon\\.ico|logo\\.svg|.*\\.png$).*)",
  ],
};
