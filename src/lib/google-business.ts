// Google Business Profile data types and API calls
import { getAccessToken } from "./google-auth";

// --- Types ---

export interface GoogleReview {
  reviewId: string;
  reviewer: {
    displayName: string;
    profilePhotoUrl?: string;
  };
  starRating: "ONE" | "TWO" | "THREE" | "FOUR" | "FIVE";
  comment?: string;
  createTime: string;
  updateTime: string;
  reviewReply?: {
    comment: string;
    updateTime: string;
  };
}

export interface GoogleLocation {
  name: string;
  title: string;
  storefrontAddress?: {
    addressLines: string[];
    locality: string;
    postalCode: string;
  };
  websiteUri?: string;
  phoneNumbers?: {
    primaryPhone?: string;
  };
}

export interface SyncedData {
  lastSyncAt: string;
  location: GoogleLocation | null;
  reviews: GoogleReview[];
  totalReviewCount: number;
  averageRating: number;
}

// --- Rating helpers ---

const STAR_MAP: Record<string, number> = {
  ONE: 1,
  TWO: 2,
  THREE: 3,
  FOUR: 4,
  FIVE: 5,
};

export function starToNumber(rating: string): number {
  return STAR_MAP[rating] || 0;
}

// --- API calls ---

export async function fetchAccounts(): Promise<{ name: string; accountName: string }[]> {
  const token = await getAccessToken();
  const res = await fetch(
    "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.accounts || [];
}

export async function fetchLocations(accountName: string): Promise<GoogleLocation[]> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storefrontAddress,websiteUri,phoneNumbers`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  return data.locations || [];
}

export async function fetchReviews(locationName: string): Promise<{
  reviews: GoogleReview[];
  totalReviewCount: number;
  averageRating: number;
}> {
  const token = await getAccessToken();
  const res = await fetch(
    `https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=50`,
    { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
  );
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);

  return {
    reviews: data.reviews || [],
    totalReviewCount: data.totalReviewCount || 0,
    averageRating: data.averageRating || 0,
  };
}

export async function replyToReview(
  reviewName: string,
  comment: string
): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ comment }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
}

export async function deleteReviewReply(reviewName: string): Promise<void> {
  const token = await getAccessToken();
  const res = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.error?.message || "Erreur suppression réponse");
  }
}

export async function syncAll(): Promise<SyncedData> {
  // 1. Get accounts
  const accounts = await fetchAccounts();
  if (accounts.length === 0) {
    throw new Error("Aucun compte Google Business trouvé");
  }

  // 2. Get locations from first account
  const accountName = accounts[0].name;
  const locations = await fetchLocations(accountName);
  if (locations.length === 0) {
    throw new Error("Aucun établissement trouvé sur ce compte");
  }

  const location = locations[0];

  // 3. Get reviews
  const { reviews, totalReviewCount, averageRating } = await fetchReviews(location.name);

  return {
    lastSyncAt: new Date().toISOString(),
    location,
    reviews,
    totalReviewCount,
    averageRating,
  };
}
