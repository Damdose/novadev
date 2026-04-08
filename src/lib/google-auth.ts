// Google OAuth helper — stores tokens in memory (replace with DB in production)

function getClientId() {
  return process.env.GOOGLE_CLIENT_ID || "";
}
function getClientSecret() {
  return process.env.GOOGLE_CLIENT_SECRET || "";
}

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
];

let tokenStore: {
  access_token: string;
  refresh_token: string;
  expires_at: number;
} | null = null;

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

  tokenStore = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return tokenStore;
}

async function refreshAccessToken() {
  if (!tokenStore?.refresh_token) throw new Error("No refresh token");

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: getClientId(),
      client_secret: getClientSecret(),
      refresh_token: tokenStore.refresh_token,
      grant_type: "refresh_token",
    }),
  });

  const data = await res.json();
  if (data.error) throw new Error(data.error_description || data.error);

  tokenStore = {
    ...tokenStore,
    access_token: data.access_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };

  return tokenStore;
}

export async function getAccessToken(): Promise<string> {
  if (!tokenStore) throw new Error("Not authenticated with Google");

  if (Date.now() > tokenStore.expires_at - 60_000) {
    await refreshAccessToken();
  }

  return tokenStore!.access_token;
}

export function isAuthenticated() {
  return tokenStore !== null;
}

export function clearTokens() {
  tokenStore = null;
}
