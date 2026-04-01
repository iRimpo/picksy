import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

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
  source: "reddit" | "trustpilot" | "other";
}

// ─── Tavily Search (Reddit + Trustpilot) ───────────────────────────────────────

async function fetchSearchResults(query: string): Promise<SearchResult[]> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) return [];

  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query: `${query} reviews recommendations`,
        search_depth: "basic",
        include_domains: ["reddit.com", "trustpilot.com"],
        max_results: 15,
      }),
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = await res.json();
    return (data.results || []).map((r: { title?: string; content?: string; url?: string }) => {
      const url = String(r.url || "");
      const source = url.includes("reddit.com")
        ? "reddit"
        : url.includes("trustpilot.com")
        ? "trustpilot"
        : "other";
      return {
        title: String(r.title || ""),
        content: String(r.content || "").slice(0, 500),
        url,
        source,
      } as SearchResult;
    });
  } catch (err) {
    console.error("Tavily search failed:", err);
    return [];
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
    buyLinks: { store: string; price: number }[];
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

async function analyzeWithGemini(
  query: string,
  results: SearchResult[],
  preferencesSummary?: string
): Promise<AnalysisOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const redditResults = results.filter((r) => r.source === "reddit");
  const trustpilotResults = results.filter((r) => r.source === "trustpilot");

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
        if (r.source === "trustpilot") return "Trustpilot";
        return null;
      })
      .filter(Boolean)
  )) as string[];

  const preferencesBlock = preferencesSummary
    ? `\nUSER PREFERENCES (collected via interactive refinement):\n${preferencesSummary}\n\nUse these preferences to bias your recommendation toward products that match.\n`
    : "";

  const prompt = `You are the recommendation engine for Picksy, a product research tool that analyzes Reddit discussions and Trustpilot reviews.

A user searched for: "${query}"${preferencesBlock}

REDDIT RESULTS (${redditResults.length} found):
${formatResults(redditResults)}

TRUSTPILOT RESULTS (${trustpilotResults.length} found):
${formatResults(trustpilotResults)}

Your job:
1. Identify the most recommended product based on the Reddit and Trustpilot content above.
2. If no results were found, use your training knowledge about this product category.
3. Do NOT bias toward any specific store. Focus on the best product based on community trust and reviews.
4. Return ONLY valid JSON matching this exact structure — no markdown, no explanation, just JSON:

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
    "whyItWon": "2 sentences explaining why this product won based on Reddit and Trustpilot signals.",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "buyLinks": [
      { "store": "Amazon", "price": 199.99 },
      { "store": "Best Buy", "price": 199.99 },
      { "store": "Walmart", "price": 189.97 }
    ],
    "redditQuote": "A short quote capturing the overall Reddit + Trustpilot sentiment"
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
- scoreLabel should be 1–3 words (e.g. "Best Pick", "Strong Pick", "Budget Pick", "Gentle Pick")`.trim();

  try {
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
        cache: "no-store",
      }
    );

    if (!res.ok) throw new Error(`Gemini error: ${res.status}`);

    const payload = await res.json();
    const candidates = payload?.candidates;
    if (!Array.isArray(candidates) || candidates.length === 0) return null;

    const text: string = candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
    if (!text) return null;

    const parsed = JSON.parse(text);
    if (!parsed?.winner?.name || !Array.isArray(parsed?.alternatives)) return null;

    return parsed as AnalysisOutput;
  } catch (err) {
    console.error("Gemini analysis failed:", err);
    return null;
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

// ─── Fallback mock (last resort if Tavily + Gemini both fail) ─────────────────

const FALLBACK: AnalysisOutput = {
  winner: {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    emoji: "🎧",
    price: 279.99,
    score: 95,
    scoreLabel: "Best Pick",
    sentiment: 94,
    mentions: 1247,
    postsAnalyzed: 0,
    whyItWon:
      "Consistently ranked #1 by r/headphones and tech reviewers for its industry-leading noise cancellation and premium sound quality at a competitive price.",
    pros: ["Best-in-class ANC", "30-hour battery", "Exceptional sound quality", "Comfortable for all-day wear"],
    cons: ["Premium price", "No IP water resistance"],
    buyLinks: [
      { store: "Amazon", price: 279.99 },
      { store: "Best Buy", price: 279.99 },
      { store: "Walmart", price: 269.00 },
    ],
    redditQuote: '"Nothing touches these on a plane. Absolute silence — worth every penny."',
  },
  alternatives: [
    {
      id: "bose-qc45",
      name: "Bose QuietComfort 45",
      brand: "Bose",
      emoji: "🎧",
      score: 89,
      price: 229.99,
      mentions: 876,
      sentiment: 90,
      whyNotWinner: "Excellent ANC and comfort but slightly behind Sony in audio quality",
    },
  ],
  subreddits: ["r/headphones", "r/audiophile"],
};

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

    // Enrich Tavily query with preference terms if present
    const searchQuery = preferencesSummary ? `${query} ${preferencesSummary}` : query;

    // 1. Search Reddit + Trustpilot via Tavily
    const results = await fetchSearchResults(searchQuery);

    // 2. Use Gemini to analyze results and generate recommendation
    const analysis = await analyzeWithGemini(query, results, preferencesSummary);

    // 3. Fall back to mock only if everything fails
    const output = analysis || FALLBACK;
    const { winner, alternatives, subreddits } = output;

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
    const trustpilotCount = results.filter((r) => r.source === "trustpilot").length;
    let redditThreadUrls = results
      .filter((r) => r.source === "reddit" && r.url.includes("/comments/"))
      .map((r) => r.url)
      .slice(0, 5);

    // Fallback: search Reddit directly if Tavily didn't return any thread URLs
    if (redditThreadUrls.length === 0) {
      redditThreadUrls = await fetchRedditThreadsFromSearch(query);
    }

    return NextResponse.json({
      winner,
      alternatives,
      meta: {
        query,
        category: "general",
        store: detectedStore,
        budget,
        subreddits,
        postsAnalyzed: results.length,
        redditResults: redditCount,
        trustpilotResults: trustpilotCount,
        redditThreadUrls,
        mode: detectedStore ? "store-specific" : "general",
        llmProvider: analysis ? "gemini" : "mock",
        llmUsed: !!analysis,
        analysisTimeMs: Date.now() - startTime,
      },
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
