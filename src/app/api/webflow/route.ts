import { type NextRequest } from "next/server";

const WEBFLOW_API = "https://api.webflow.com/v2";

export async function GET(request: NextRequest) {
  const token = process.env.WEBFLOW_API_TOKEN;
  const siteId = process.env.WEBFLOW_SITE_ID;

  if (!token || !siteId) {
    return Response.json(
      { error: "WEBFLOW_API_TOKEN et WEBFLOW_SITE_ID requis dans .env" },
      { status: 401 }
    );
  }

  const { searchParams } = request.nextUrl;
  const weekStart = searchParams.get("weekStart");

  if (!weekStart) {
    return Response.json({ error: "weekStart requis" }, { status: 400 });
  }

  const start = new Date(weekStart);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 7);

  try {
    // 1. List all forms for this site
    const formsRes = await fetch(`${WEBFLOW_API}/sites/${siteId}/forms`, {
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
      },
    });

    if (!formsRes.ok) {
      return Response.json(
        { error: `Webflow API error: ${formsRes.status}` },
        { status: formsRes.status }
      );
    }

    const formsData = await formsRes.json();
    const forms: { id: string }[] = formsData.forms ?? [];

    // 2. Count submissions across all forms for the given week
    let count = 0;

    for (const form of forms) {
      let offset = 0;
      const limit = 100;
      let hasMore = true;

      while (hasMore) {
        const url = new URL(`${WEBFLOW_API}/forms/${form.id}/submissions`);
        url.searchParams.set("limit", String(limit));
        url.searchParams.set("offset", String(offset));

        const res = await fetch(url.toString(), {
          headers: {
            Authorization: `Bearer ${token}`,
            accept: "application/json",
          },
        });

        if (!res.ok) break;

        const data = await res.json();
        const submissions: { dateSubmitted?: string }[] =
          data.formSubmissions ?? [];

        if (submissions.length === 0) {
          hasMore = false;
          break;
        }

        for (const sub of submissions) {
          if (!sub.dateSubmitted) continue;
          const d = new Date(sub.dateSubmitted);
          if (d >= start && d < end) {
            count++;
          }
          // Submissions are newest-first — stop if we're past the window
          if (d < start) {
            hasMore = false;
            break;
          }
        }

        if (hasMore && submissions.length === limit) {
          offset += limit;
        } else {
          hasMore = false;
        }
      }
    }

    return Response.json({ count, weekStart: start.toISOString() });
  } catch (e) {
    console.error("Webflow fetch error:", e);
    return Response.json({ error: "Erreur Webflow" }, { status: 500 });
  }
}
