import { NextRequest } from "next/server";
import { isAuthenticated } from "@/lib/google-auth";
import { getCachedData, syncAll, replyToReview, deleteReviewReply } from "@/lib/google-business";

export async function GET() {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    let data = getCachedData();
    if (!data) {
      data = await syncAll();
    }

    return Response.json({
      reviews: data.reviews,
      totalReviewCount: data.totalReviewCount,
      averageRating: data.averageRating,
      locationName: data.location?.title || "",
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAuthenticated())) {
    return Response.json({ error: "Non connecté à Google" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { reviewName, comment, action } = body;

    if (!reviewName) {
      return Response.json({ error: "reviewName requis" }, { status: 400 });
    }

    if (action === "delete") {
      await deleteReviewReply(reviewName);
      return Response.json({ success: true, message: "Réponse supprimée" });
    }

    if (!comment) {
      return Response.json({ error: "comment requis" }, { status: 400 });
    }

    await replyToReview(reviewName, comment);
    await syncAll();

    return Response.json({ success: true, message: "Réponse envoyée" });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erreur inconnue";
    return Response.json({ error: message }, { status: 500 });
  }
}
