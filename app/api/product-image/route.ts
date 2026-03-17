import { NextRequest, NextResponse } from "next/server";

// Keywords that indicate an image is NOT a product photo
const SKIP = [
  "avatar", "icon", "logo", "favicon", "profile", "banner",
  "twitter", "facebook", "instagram", "tiktok", "youtube",
  "sprite", "placeholder", "default", "noimage",
];

// Domains known to have clean product images
const PREFER = [
  "amazon", "target", "ulta", "sephora", "walmart", "walgreens",
  "cvs", "iherb", "dermstore", "lookfantastic",
];

function pickBestImage(images: Array<{ url: string }>): string | null {
  const valid = images
    .map((img) => img.url)
    .filter((url) => {
      if (!url || typeof url !== "string") return false;
      const lower = url.toLowerCase();
      if (SKIP.some((k) => lower.includes(k))) return false;
      return true;
    });

  // Prefer retailer/brand images
  const preferred = valid.filter((url) =>
    PREFER.some((domain) => url.toLowerCase().includes(domain))
  );

  return preferred[0] ?? valid[0] ?? null;
}

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ imageUrl: null });

  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return NextResponse.json({ imageUrl: null });

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: q,
        search_depth: "basic",
        include_images: true,
        max_results: 5,
      }),
      next: { revalidate: 3600 }, // cache for 1h — same product always returns same image
    });

    if (!res.ok) return NextResponse.json({ imageUrl: null });

    const data = await res.json();
    const imageUrl = pickBestImage(data.images ?? []);
    return NextResponse.json({ imageUrl });
  } catch {
    return NextResponse.json({ imageUrl: null });
  }
}
