import { NextRequest, NextResponse } from "next/server";
import { decodeQuery } from "@/lib/query-decoder";

export const maxDuration = 60; // Vercel function timeout — 60s

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.0-flash";

// ─── In-memory result cache (avoids burning rate limit on repeated queries) ────
interface CacheEntry { payload: unknown; ts: number }
const analyzeCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

// ─── Electronics Validation ────────────────────────────────────────────────────

async function validateElectronicsQuery(
  query: string
): Promise<{ valid: boolean; message?: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return { valid: true }; // fail-open when no key

  const prompt = `You are a query classifier for an electronics product recommendation app. Determine if the user's query is about consumer electronics or technology products (laptops, headphones, TVs, smartphones, tablets, cameras, speakers, keyboards, mice, monitors, gaming consoles, smartwatches, routers, chargers, etc.). Tech accessories and peripherals also count. Reply with ONLY valid JSON — no markdown, no explanation:
{"is_electronics": true}
or
{"is_electronics": false, "suggestion": "brief suggestion of an electronics query they could try instead"}

User query: "${query}"`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(
      `${GEMINI_API_URL}/models/gemini-2.5-flash-lite:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0, responseMimeType: "application/json" },
        }),
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (!res.ok) return { valid: true }; // fail-open on API error

    const payload = await res.json();
    const text: string = payload?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
    if (!text) return { valid: true };

    const parsed = JSON.parse(text);
    if (parsed.is_electronics === false) {
      const suggestion = parsed.suggestion || "wireless headphones or gaming laptop";
      return {
        valid: false,
        message: `Picksy is built for electronics and tech products. Try something like "${suggestion}" instead.`,
      };
    }
    return { valid: true };
  } catch {
    return { valid: true }; // fail-open on timeout or parse error
  }
}

// ─── Search Result Type ────────────────────────────────────────────────────────

interface SearchResult {
  title: string;
  content: string;
  url: string;
  source: "reddit" | "other";
}

// ─── Tavily Search (Reddit) ────────────────────────────────────────────────────

async function fetchSearchResults(query: string, subreddits: string[]): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  // Append category-specific subreddit names so Tavily surfaces the right communities
  const subredditHint = subreddits.slice(0, 2).join(" ");
  const tavilyQuery = `${query} ${subredditHint} reviews`;

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: tavilyQuery,
        search_depth: "basic",
        include_domains: ["reddit.com"],
        max_results: 20,
      }),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((r: { title?: string; content?: string; url?: string }) => {
      const url = String(r.url || "");
      const source = url.includes("reddit.com") ? "reddit" : "other";
      return {
        title: String(r.title || ""),
        content: String(r.content || "").slice(0, 800),
        url,
        source,
      } as SearchResult;
    });
  } catch (err) {
    console.error("Tavily search failed:", err);
    return [];
  }
}

// ─── Fetch Actual Reddit Thread Content ────────────────────────────────────────

interface ActualComment {
  author: string;
  body: string;
  upvotes: number;
  subreddit: string;
  permalink?: string;
}

function extractTopComments(children: Record<string, unknown>[], subreddit: string, out: ActualComment[], maxDepth = 1, depth = 0) {
  if (depth > maxDepth || out.length >= 15) return;
  for (const child of children) {
    if (out.length >= 15) break;
    const data = child as { author?: string; body?: string; ups?: number; score?: number; subreddit?: string; replies?: { data?: { children?: Record<string, unknown>[] } } | string };
    const body = typeof data.body === "string" ? data.body.trim() : "";
    if (!body || body === "[deleted]" || body === "[removed]" || body.length < 20) continue;
    out.push({
      author: data.author || "[deleted]",
      body: body.slice(0, 600),
      upvotes: data.ups ?? data.score ?? 0,
      subreddit: data.subreddit || subreddit,
    });
    if (data.replies && typeof data.replies === "object" && data.replies.data?.children) {
      extractTopComments(data.replies.data.children as Record<string, unknown>[], subreddit, out, maxDepth, depth + 1);
    }
  }
}

async function fetchActualRedditComments(threadUrls: string[]): Promise<ActualComment[]> {
  const all: ActualComment[] = [];
  await Promise.all(
    threadUrls.slice(0, 3).map(async (url) => {
      try {
        const jsonUrl = url.replace(/\/?$/, ".json") + "?limit=20&sort=top";
        const res = await fetch(jsonUrl, {
          headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
          next: { revalidate: 3600 },
        });
        if (!res.ok) return;
        const data = await res.json();
        if (!Array.isArray(data) || data.length < 2) return;
        const subredditMatch = url.match(/reddit\.com\/r\/([^/]+)/);
        const subreddit = subredditMatch ? subredditMatch[1] : "reddit";
        const children = (data[1]?.data?.children || []).map((c: { data: Record<string, unknown> }) => c.data);
        extractTopComments(children, subreddit, all);
      } catch {
        // fail silently — this is best-effort enrichment
      }
    })
  );
  return all.sort((a, b) => b.upvotes - a.upvotes).slice(0, 15);
}

// ─── TikTok Content via Apify ──────────────────────────────────────────────────

interface TikTokVideo {
  author: string;
  description: string;
  likes: number;
  views: number;
  topComments: string[];
  transcript?: string; // parsed from auto-captions when available
  videoUrl: string;
}

function parseCaptions(raw: string): string {
  return raw
    .replace(/WEBVTT\n?/, "")
    .replace(/NOTE[^\n]*\n/g, "")
    .replace(/\d+:\d+:\d+[.,]\d+\s*-->\s*\d+:\d+:\d+[.,]\d+[^\n]*/g, "")
    .replace(/^\d+$/gm, "")
    .replace(/<[^>]+>/g, "")
    .split("\n").map((s) => s.trim()).filter(Boolean).join(" ")
    .replace(/\s+/g, " ").trim()
    .slice(0, 800);
}

async function fetchTranscript(
  subtitleLinks: Array<{ language?: string; link?: string }>,
  signal: AbortSignal
): Promise<string> {
  const preferred = subtitleLinks.find((s) => s.language?.startsWith("en")) ?? subtitleLinks[0];
  if (!preferred?.link) return "";
  try {
    const res = await fetch(preferred.link, { signal });
    if (!res.ok) return "";
    return parseCaptions(await res.text());
  } catch { return ""; }
}

async function fetchTikTokContent(query: string): Promise<TikTokVideo[]> {
  const apiKey = process.env.APIFY_API_KEY;
  if (!apiKey) return [];

  try {
    const controller = new AbortController();
    // 40s total: ~20s for videos + ~15s for comments
    const timeout = setTimeout(() => controller.abort(), 40000);

    // Step 1: Fetch top videos via search
    const videoRes = await fetch(
      `https://api.apify.com/v2/acts/clockworks~tiktok-scraper/run-sync-get-dataset-items?token=${apiKey}&timeout=20`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          searchQueries: [`${query} review`],
          resultsPerPage: 5,
          shouldDownloadVideos: false,
          shouldDownloadCovers: false,
        }),
        signal: controller.signal,
        cache: "no-store",
      }
    );

    if (!videoRes.ok) { clearTimeout(timeout); return []; }

    const items = await videoRes.json();
    if (!Array.isArray(items)) { clearTimeout(timeout); return []; }

    const videos = items
      .filter((v: Record<string, unknown>) => typeof v.text === "string" && (v.text as string).length > 10)
      .map((v: Record<string, unknown>) => ({
        author: String((v.authorMeta as Record<string, unknown>)?.name || "unknown"),
        description: String(v.text || "").slice(0, 400),
        likes: Number(v.diggCount || 0),
        views: Number(v.playCount || 0),
        webVideoUrl: String(v.webVideoUrl || ""),
        subtitleLinks: Array.isArray(v.subtitleLinks) ? v.subtitleLinks as Array<{ language?: string; link?: string }> : [],
        topComments: [] as string[],
        transcript: "",
      }));

    const topUrls = videos.slice(0, 2).map((v) => v.webVideoUrl).filter(Boolean);

    // Step 2: Fetch viewer comments + transcripts in parallel
    await Promise.all([
      // Comments
      topUrls.length > 0
        ? fetch(
            `https://api.apify.com/v2/acts/clockworks~tiktok-comments-scraper/run-sync-get-dataset-items?token=${apiKey}&timeout=15`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ postURLs: topUrls, maxComments: 8 }),
              signal: controller.signal,
              cache: "no-store",
            }
          )
            .then((r) => r.ok ? r.json() : [])
            .then((allComments) => {
              if (!Array.isArray(allComments)) return;
              for (const c of allComments) {
                const commentText = String(c.text || "").trim();
                if (!commentText || commentText.length < 5) continue;
                const nonAscii = (commentText.match(/[^\x00-\x7F]/g) || []).length;
                if (nonAscii / commentText.length > 0.3) continue;
                const vUrl = String(c.videoWebUrl || c.submittedVideoUrl || "");
                const idx = videos.findIndex((v) => vUrl.includes(v.webVideoUrl.split("/video/")[1] || "NONE"));
                if (idx >= 0 && videos[idx].topComments.length < 4) {
                  videos[idx].topComments.push(commentText.slice(0, 200));
                }
              }
            })
            .catch(() => { /* fail silently */ })
        : Promise.resolve(),

      // Transcripts — fetch subtitle files for top 2 videos
      ...videos.slice(0, 2).map((v, i) =>
        v.subtitleLinks.length > 0
          ? fetchTranscript(v.subtitleLinks, controller.signal)
              .then((t) => { videos[i].transcript = t; })
              .catch(() => { /* fail silently */ })
          : Promise.resolve()
      ),
    ]);

    clearTimeout(timeout);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return videos.map(({ webVideoUrl, subtitleLinks: _sl, ...rest }) => ({
      ...rest,
      videoUrl: webVideoUrl,
    }));
  } catch {
    return []; // fail silently — TikTok is best-effort enrichment
  }
}

// ─── Gemini Full Analysis ──────────────────────────────────────────────────────

interface AnalysisOutput {
  winner: {
    id: string;
    name: string;
    brand: string;
    emoji: string;
    price: number;
    score: number;
    scoreLabel: string;
    sentiment: number;
    mentions: number;
    postsAnalyzed: number;
    whyItWon: string;
    pros: string[];
    cons: string[];
    buyLinks: { store: string; price: number; url?: string }[];
    redditQuote: string;
  };
  alternatives: {
    id: string;
    name: string;
    brand: string;
    emoji: string;
    score: number;
    price: number;
    mentions: number;
    sentiment: number;
    whyNotWinner: string;
  }[];
  subreddits: string[];
}

// ─── Direct Product Link Fetcher ──────────────────────────────────────────────

async function fetchProductDirectLinks(
  productName: string,
  brand: string
): Promise<{ store: string; url: string; price?: number }[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${brand} ${productName} buy`,
        search_depth: "basic",
        include_domains: ["amazon.com", "bestbuy.com", "walmart.com", "target.com"],
        max_results: 8,
      }),
      cache: "no-store",
    });
    if (!res.ok) return [];

    const data = await res.json();
    const links: { store: string; url: string; price?: number }[] = [];

    for (const r of (data.results || []) as { url?: string; content?: string }[]) {
      const url = String(r.url || "");
      const content = String(r.content || "");
      const priceMatch = content.match(/\$\s*([\d,]+\.?\d*)/);
      const price = priceMatch ? parseFloat(priceMatch[1].replace(/,/g, "")) : undefined;

      if ((url.includes("amazon.com/dp/") || url.includes("amazon.com/gp/product/")) && !links.find(l => l.store === "Amazon")) {
        links.push({ store: "Amazon", url, price });
      } else if (url.match(/bestbuy\.com\/site\/.+\/\d+\.p/) && !links.find(l => l.store === "Best Buy")) {
        links.push({ store: "Best Buy", url, price });
      } else if (url.match(/walmart\.com\/(ip|product)\//) && !links.find(l => l.store === "Walmart")) {
        links.push({ store: "Walmart", url, price });
      } else if (url.includes("target.com/p/") && !links.find(l => l.store === "Target")) {
        links.push({ store: "Target", url, price });
      }

      if (links.length >= 3) break;
    }

    return links;
  } catch {
    return [];
  }
}

// ─── Gemini Analysis ───────────────────────────────────────────────────────────

async function analyzeWithGemini(
  query: string,
  results: SearchResult[],
  preferencesSummary?: string,
  actualComments?: ActualComment[],
  tiktokVideos?: TikTokVideo[],
  budget?: number | null
): Promise<AnalysisOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const redditResults = results.filter((r) => r.source === "reddit");

  const formatResults = (items: SearchResult[]) =>
    items.length > 0
      ? items.map((r, i) => `[${i + 1}] ${r.title}\n${r.content}`).join("\n\n")
      : "None found.";

  const sourcesSeen = Array.from(new Set(
    results
      .map((r) => {
        if (r.source === "reddit") {
          const match = r.url.match(/reddit\.com\/r\/([^/]+)/);
          return match ? `r/${match[1]}` : null;
        }
        return null;
      })
      .filter(Boolean)
  )) as string[];

  const budgetBlock = budget
    ? `\n⚠️ HARD BUDGET LIMIT: $${budget}. You MUST only recommend products priced AT OR BELOW $${budget}. Do NOT recommend anything above this price. If the most popular product exceeds the budget, pick the best one that fits within $${budget} instead. All buyLinks prices must also be at or below $${budget}.\n`
    : "";

  const preferencesBlock = preferencesSummary
    ? `\nUSER PREFERENCES (collected via interactive refinement):\n${preferencesSummary}\n\nUse these preferences to bias your recommendation toward products that match.\n`
    : "";

  const actualCommentsBlock = actualComments && actualComments.length > 0
    ? `\nACTUAL REDDIT COMMENTS (fetched directly from threads — highest signal):\n${actualComments.map((c, i) => `[${i + 1}] u/${c.author} in r/${c.subreddit} (${c.upvotes} upvotes): ${c.body}`).join("\n\n")}\n`
    : "";

  const tiktokBlock = tiktokVideos && tiktokVideos.length > 0
    ? `\nTIKTOK REVIEW CONTENT (creator captions + viewer comments — medium signal):\n${tiktokVideos.map((v, i) => {
        const commentsLine = v.topComments.length > 0
          ? `\n   Viewer comments: ${v.topComments.map((c) => `"${c}"`).join(" | ")}`
          : "";
        return `[${i + 1}] @${v.author} (${v.likes.toLocaleString()} likes, ${v.views.toLocaleString()} views): ${v.description}${commentsLine}`;
      }).join("\n\n")}\n`
    : "";

  const prompt = `You are the recommendation engine for Picksy, a product research tool that analyzes Reddit discussions and TikTok reviews.

A user searched for: "${query}"${budgetBlock}${preferencesBlock}
${actualCommentsBlock}${tiktokBlock}
REDDIT SEARCH SNIPPETS (${redditResults.length} found):
${formatResults(redditResults)}

Your job:
1. Identify the most recommended product. Priority order: ACTUAL REDDIT COMMENTS (highest) → TIKTOK REVIEW CONTENT (medium) → Reddit search snippets (supporting context).
2. If TikTok creators mention a specific product positively with high engagement, factor that into your recommendation.
3. If no results were found, use your training knowledge about this product category.
4. Do NOT bias toward any specific store. Focus on the best product based on community trust and reviews.
5. Return ONLY valid JSON matching this exact structure — no markdown, no explanation, just JSON:

{
  "winner": {
    "id": "product-name-slug",
    "name": "Full Product Name",
    "brand": "Brand Name",
    "emoji": "🎧",
    "price": 199.99,
    "score": 87,
    "scoreLabel": "Strong Pick",
    "sentiment": 89,
    "mentions": 34,
    "postsAnalyzed": ${results.length},
    "whyItWon": "2 sentences explaining why this product won based on Reddit and TikTok signals.",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "buyLinks": [
      { "store": "Amazon", "price": 199.99 },
      { "store": "Best Buy", "price": 199.99 },
      { "store": "Walmart", "price": 189.97 }
    ],
    "redditQuote": "A short quote capturing the overall Reddit sentiment"
  },
  "alternatives": [
    {
      "id": "alt-product-slug",
      "name": "Alternative Product Name",
      "brand": "Brand",
      "emoji": "🎧",
      "score": 74,
      "price": 14.99,
      "mentions": 18,
      "sentiment": 76,
      "whyNotWinner": "Why this is a solid option but not the top pick"
    }
  ],
  "subreddits": ${JSON.stringify(sourcesSeen.length > 0 ? sourcesSeen : ["r/BuyItForLife", "r/frugal"])}
}

Rules:
- score and sentiment are 0–100 integers
- Include 2–3 alternatives
- buyLinks should cover where this product is realistically sold
- emoji should match the product type
- price should be realistic for the product category
- scoreLabel should be 1–3 words (e.g. "Best Pick", "Strong Pick", "Budget Pick", "Gentle Pick")${budget ? `\n- CRITICAL: winner price and ALL buyLinks prices MUST be $${budget} or less — this is a hard constraint` : ""}`.trim();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000); // 25s hard cap

    const res = await fetch(
      `${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            responseMimeType: "application/json",
          },
        }),
        signal: controller.signal,
        cache: "no-store",
      }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      const errBody = await res.text().catch(() => "(unreadable)");
      console.error(`Gemini error ${res.status} for model ${GEMINI_MODEL}:`, errBody.slice(0, 500));
      const err = new Error(`Gemini error: ${res.status}`);
      (err as Error & { status: number }).status = res.status;
      throw err;
    }

    const payload = await res.json();
    const candidates = payload?.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return null;

    const text: string = candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!parsed?.winner?.name || !Array.isArray(parsed?.alternatives)) return null;

    return parsed as AnalysisOutput;
  } catch (err) {
    console.error("Gemini analysis failed:", err instanceof Error ? err.message : err);
    throw err; // re-throw so caller can inspect status
  }
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function detectStore(query: string): string | null {
  const STORE_CHAINS = ["walmart", "target", "amazon", "best buy", "bestbuy", "newegg", "micro center", "b&h"];
  const q = query.toLowerCase();
  for (const store of STORE_CHAINS) {
    if (q.includes(store)) {
      if (store === "best buy" || store === "bestbuy") return "Best Buy";
      if (store === "micro center") return "Micro Center";
      if (store === "b&h") return "B&H";
      return store.charAt(0).toUpperCase() + store.slice(1);
    }
  }
  return null;
}

function detectBudget(query: string): number | null {
  const match =
    query.match(/under\s*\$?(\d+)/i) || query.match(/\$?(\d+)\s*(?:or\s*)?less/i);
  return match ? parseInt(match[1]) : null;
}


// ─── Reddit Search Fallback ────────────────────────────────────────────────────

async function fetchRedditThreadsFromSearch(query: string): Promise<string[]> {
  try {
    const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&type=link&sort=relevance&limit=5`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Picksy/1.0 (electronics recommendation app)" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const children: { data?: { permalink?: string } }[] = data?.data?.children || [];
    return children
      .map((c) => (c.data?.permalink ? `https://www.reddit.com${c.data.permalink}` : null))
      .filter((u): u is string => !!u);
  } catch {
    return [];
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, store: storeOverride, preferences } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Cache check — skip expensive API calls for repeated queries
    const cacheKey = `${query}::${storeOverride || ""}::${preferences?.summary || ""}`;
    const cached = analyzeCache.get(cacheKey);
    if (cached && Date.now() - cached.ts < CACHE_TTL_MS) {
      return NextResponse.json(cached.payload);
    }

    // 0. Validate that the query is electronics-related
    const validation = await validateElectronicsQuery(query);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.message, reason: "not_electronics" },
        { status: 422 }
      );
    }

    const startTime = Date.now();
    const detectedStore = storeOverride || detectStore(query);
    const budget = detectBudget(query);

    const preferencesSummary: string | undefined =
      preferences && typeof preferences === "object" && typeof preferences.summary === "string"
        ? preferences.summary
        : undefined;

    // Decode query to get category-specific subreddits
    const decoded = decodeQuery(query);
    const categorySubreddits = decoded.suggestedSubreddits;

    // Enrich Tavily query with preference terms if present
    const searchQuery = preferencesSummary ? `${query} ${preferencesSummary}` : query;

    // 1. Search Reddit via Tavily (with category-specific subreddits)
    const results = await fetchSearchResults(searchQuery, categorySubreddits);

    // 2. Fetch Reddit thread content + TikTok reviews in parallel
    const threadUrls = results
      .filter((r) => r.source === "reddit" && r.url.includes("/comments/"))
      .map((r) => r.url)
      .slice(0, 3);
    const [directComments, tiktokVideos] = await Promise.all([
      fetchActualRedditComments(threadUrls),
      fetchTikTokContent(query),
    ]);

    // Fall back to Tavily snippets when direct Reddit fetch returns empty
    // (Vercel IPs are often blocked by Reddit's unauthenticated API)
    const actualComments: ActualComment[] = directComments.length > 0
      ? directComments
      : results
          .filter((r) => r.source === "reddit" && r.content.length > 60)
          .slice(0, 8)
          .map((r) => {
            const sub = r.url.match(/reddit\.com\/r\/([^/]+)/)?.[1] ?? "reddit";
            // author left empty so UI shows subreddit as source, not a fake username
            return { author: "", body: r.content.slice(0, 400), upvotes: 0, subreddit: sub, permalink: r.url };
          });

    // 3. Gemini analysis + direct product link fetching run in parallel
    let analysis: AnalysisOutput | null = null;
    let geminiStatus = 0;
    // We speculatively fetch product links for the query — Tavily returns the
    // right product pages even without knowing the exact winner name yet
    const [geminiResult, speculativeLinks] = await Promise.allSettled([
      analyzeWithGemini(query, results, preferencesSummary, actualComments, tiktokVideos, budget),
      fetchProductDirectLinks(query, ""),
    ]);

    if (geminiResult.status === "fulfilled") {
      analysis = geminiResult.value;
    } else {
      geminiStatus = (geminiResult.reason as Error & { status?: number }).status ?? 0;
    }

    const directLinks = speculativeLinks.status === "fulfilled" ? speculativeLinks.value : [];

    // Retry with training knowledge only — skip if rate-limited (429)
    if (!analysis && geminiStatus !== 429) {
      try {
        analysis = await analyzeWithGemini(query, [], preferencesSummary, [], [], budget);
      } catch { /* fall through to hard fail */ }
    }

    if (!analysis) {
      if (geminiStatus === 429) {
        return NextResponse.json(
          { error: "rate_limited", message: "Picksy is getting a lot of searches right now. Wait a few seconds and try again." },
          { status: 429 }
        );
      }
      console.error("[analyze] failed for query:", query, "| gemini status:", geminiStatus);
      return NextResponse.json({ error: "Unable to generate a recommendation right now. Please try again." }, { status: 500 });
    }

    const { winner, alternatives, subreddits } = analysis;

    // Merge direct product URLs into buyLinks when available
    if (directLinks.length > 0) {
      winner.buyLinks = winner.buyLinks.map((link) => {
        const match = directLinks.find(
          (d) => d.store.toLowerCase() === link.store.toLowerCase()
        );
        return match ? { ...link, url: match.url, price: match.price ?? link.price } : link;
      });
      // Add any stores found by Tavily that Gemini didn't include
      for (const d of directLinks) {
        if (!winner.buyLinks.find((l) => l.store.toLowerCase() === d.store.toLowerCase())) {
          winner.buyLinks.push({ store: d.store, price: d.price ?? winner.price, url: d.url });
        }
      }
    }

    // 4. If a store was mentioned, find matching buy link price
    if (detectedStore) {
      const storeLink = winner.buyLinks?.find(
        (l) => l.store.toLowerCase() === detectedStore.toLowerCase()
      );
      (winner as Record<string, unknown>).storePrice = storeLink?.price || winner.price;
      (winner as Record<string, unknown>).storeName = detectedStore;
      (winner as Record<string, unknown>).inStock = true;

      if (storeLink) {
        const cheapest = Math.min(...winner.buyLinks.map((l) => l.price));
        const priceRatio = (cheapest / storeLink.price) * 100;
        (winner as Record<string, unknown>).valueScore = Math.round(
          winner.sentiment * 0.5 + priceRatio * 0.3 + 20
        );
      }
    }

    const redditCount = results.filter((r) => r.source === "reddit").length;
    let redditThreadUrls = results
      .filter((r) => r.source === "reddit" && r.url.includes("/comments/"))
      .map((r) => r.url)
      .slice(0, 5);

    // Fallback: search Reddit directly if Tavily didn't return any thread URLs
    if (redditThreadUrls.length === 0) {
      redditThreadUrls = await fetchRedditThreadsFromSearch(query);
    }

    const responsePayload = {
      winner,
      alternatives,
      comments: actualComments,
      tiktokVideos,
      meta: {
        query,
        category: "general",
        store: detectedStore,
        budget,
        subreddits,
        postsAnalyzed: results.length,
        redditResults: redditCount,
        tiktokResults: tiktokVideos.length,
        redditThreadUrls,
        mode: detectedStore ? "store-specific" : "general",
        llmProvider: "gemini",
        llmUsed: true,
        analysisTimeMs: Date.now() - startTime,
      },
    };

    // Cache for 10 minutes so repeat searches skip the API calls
    analyzeCache.set(cacheKey, { payload: responsePayload, ts: Date.now() });

    return NextResponse.json(responsePayload);
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
