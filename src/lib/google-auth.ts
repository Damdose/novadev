// Google OAuth helper — uses cookies for token persistence on Vercel serverless

import { cookies } from "next/headers";

const COOKIE_NAME = "google_tokens";

function getClientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}
function getClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

interface TokenData {
  access_token: string;
  refresh_token: string;
  expires_at: number;
}

async function getStoredTokens(): Promise<TokenData | null> {
  try {
    const cookieStore = await cookies();
    const cookie = cookieStore.get(COOKIE_NAME);
    if (!cookie?.value) return null;
    return JSON.parse(Buffer.from(cookie.value, "base64").toString());
  } catch {
    return null;
  }
}

async function storeTokens(tokens: TokenData) {
  const cookieStore = await cookies();
  const encoded = Buffer.from(JSON.stringify(tokens)).toString("base64");
  cookieStore.set(COOKIE_NAME, encoded, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
}

async function clearStoredTokens() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function getAuthUrl(redirectUri: string) {
  const params = new URLSearchParams({
    client_id: getClientId(),
    redirect_uri: redirectUri,
    response_type: "code",
    scope: SCOPES.join(" "),
    access_type: "offline",
    prompt: "consent",
  });
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
}

export async function exchangeCode(code: string, redirectUri: string) {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: getClientId(),
      client_secret: getClientSecret(),
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  const tokens: TokenData = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await storeTokens(tokens);
  return tokens;
}

async function refreshAccessToken(): Promise<TokenData> {
  const tokens = await getStoredTokens();
  if (!tokens?.refresh_token) throw new Error("No refresh token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: tokens.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  const updated: TokenData = {
    ...tokens,
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  await storeTokens(updated);
  return updated;
}

export async function getAccessToken(): Promise<string> {
  const tokens = await getStoredTokens();
  if (!tokens) throw new Error("Not authenticated with Google");

  if (Date.now() > tokens.expires_at - 60_000) {
    const refreshed = await refreshAccessToken();
    return refreshed.access_token;
  }

  return tokens.access_token;
}

export async function isAuthenticated(): Promise<boolean> {
  const tokens = await getStoredTokens();
  return tokens !== null;
}

export async function clearTokens() {
  await clearStoredTokens();
}
