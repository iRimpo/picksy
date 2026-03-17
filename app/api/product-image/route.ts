import { NextRequest, NextResponse } from "next/server";

// ─── Image picker ─────────────────────────────────────────────────────────────

const SKIP = [
  "avatar", "icon", "logo", "favicon", "profile", "banner",
  "twitter", "facebook", "instagram", "tiktok", "youtube",
  "sprite", "placeholder", "default", "noimage", "blank",
  "tracking", "pixel", "badge", "button", "arrow", "star",
];

// CDNs that reliably allow cross-origin embedding
const PREFER_CDN = [
  "m.media-amazon.com",
  "i5.walmartimages.com",
  "target.scene7.com",
  "media.ulta.com",
  "media.sephora.com",
  "images.dermstore.com",
  "images.lookfantastic.com",
  "cloudfront.net",
];

function pickBestImage(urls: string[]): string | null {
  const valid = urls.filter((url) => {
    if (!url || typeof url !== "string") return false;
    const lower = url.toLowerCase();
    if (SKIP.some((k) => lower.includes(k))) return false;
    // Must look like an image URL
    if (!/\.(jpg|jpeg|png|webp|avif)/i.test(lower) && !lower.includes("image") && !lower.includes("photo") && !lower.includes("media")) return false;
    return true;
  });

  const preferred = valid.filter((url) =>
    PREFER_CDN.some((cdn) => url.includes(cdn))
  );

  return preferred[0] ?? valid[0] ?? null;
}

// ─── Strategy 1: Google Custom Search Images ─────────────────────────────────
// Best quality — requires GOOGLE_CSE_API_KEY + GOOGLE_CSE_CX env vars.
// Setup: https://programmablesearchengine.google.com → "Search entire web" → get CX ID
//        Google Cloud Console → enable "Custom Search API" → create API key
async function fetchViaGoogleCSE(query: string): Promise<string | null> {
  const apiKey = process.env.GOOGLE_CSE_API_KEY;
  const cx = process.env.GOOGLE_CSE_CX;
  if (!apiKey || !cx) return null;

  try {
    const params = new URLSearchParams({
      key: apiKey,
      cx,
      q: `${query} product`,
      searchType: "image",
      num: "5",
      imgType: "photo",
      imgSize: "large",
      safe: "active",
    });
    const res = await fetch(
      `https://customsearch.googleapis.com/customsearch/v1?${params}`,
      { next: { revalidate: 86400 } } // cache 24h
    );
    if (!res.ok) return null;
    const data = await res.json();
    const urls = (data.items ?? []).map((item: { link: string }) => item.link);
    return pickBestImage(urls);
  } catch {
    return null;
  }
}

// ─── Strategy 2: Tavily with retailer domains ─────────────────────────────────
// Uses your existing Tavily key. Targets retailer sites for cleaner product photos.
async function fetchViaTavily(query: string): Promise<string | null> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return null;

  // Try two passes: retailer-specific first, then open web
  const passes = [
    {
      query: `${query}`,
      include_domains: ["amazon.com", "walmart.com", "target.com", "sephora.com", "ulta.com", "walgreens.com", "cvs.com"],
    },
    {
      query: `${query} product photo`,
      include_domains: [] as string[],
    },
  ];

  for (const pass of passes) {
    try {
      const body: Record<string, unknown> = {
        api_key: apiKey,
        query: pass.query,
        search_depth: "basic",
        include_images: true,
        max_results: 5,
      };
      if (pass.include_domains.length > 0) {
        body.include_domains = pass.include_domains;
      }

      const res = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) continue;

      const data = await res.json();
      const imageUrls: string[] = (data.images ?? []).map(
        (img: { url?: string } | string) =>
          typeof img === "string" ? img : img?.url ?? ""
      );

      const picked = pickBestImage(imageUrls);
      if (picked) return picked;
    } catch {
      continue;
    }
  }

  return null;
}

// ─── Strategy 3: Bing Image Search ───────────────────────────────────────────
// Optional — set BING_SEARCH_API_KEY (Azure free tier: 1,000 calls/month)
// Azure portal → Cognitive Services → Bing Search v7 → create free tier resource
async function fetchViaBing(query: string): Promise<string | null> {
  const apiKey = process.env.BING_SEARCH_API_KEY;
  if (!apiKey) return null;

  try {
    const params = new URLSearchParams({
      q: `${query} product`,
      count: "5",
      imageType: "Photo",
      size: "Large",
      safeSearch: "Moderate",
    });
    const res = await fetch(
      `https://api.bing.microsoft.com/v7.0/images/search?${params}`,
      {
        headers: { "Ocp-Apim-Subscription-Key": apiKey },
        next: { revalidate: 86400 },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const urls = (data.value ?? []).map(
      (item: { contentUrl: string }) => item.contentUrl
    );
    return pickBestImage(urls);
  } catch {
    return null;
  }
}

// ─── Route handler ────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q");
  if (!q) return NextResponse.json({ imageUrl: null });

  // Try each strategy in order until one succeeds
  const imageUrl =
    (await fetchViaGoogleCSE(q)) ??
    (await fetchViaBing(q)) ??
    (await fetchViaTavily(q));

  return NextResponse.json({ imageUrl: imageUrl ?? null });
}
