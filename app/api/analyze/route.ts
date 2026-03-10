import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

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
  results: SearchResult[]
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

  const prompt = `You are the recommendation engine for Picksy, a product research tool that analyzes Reddit discussions and Trustpilot reviews.

A user searched for: "${query}"

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
    "emoji": "🧴",
    "price": 19.99,
    "score": 87,
    "scoreLabel": "Strong Pick",
    "sentiment": 89,
    "mentions": 34,
    "postsAnalyzed": ${results.length},
    "whyItWon": "2 sentences explaining why this product won based on Reddit and Trustpilot signals.",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "buyLinks": [
      { "store": "Amazon", "price": 19.99 },
      { "store": "Target", "price": 20.99 },
      { "store": "Walmart", "price": 18.97 }
    ],
    "redditQuote": "A short quote capturing the overall Reddit + Trustpilot sentiment"
  },
  "alternatives": [
    {
      "id": "alt-product-slug",
      "name": "Alternative Product Name",
      "brand": "Brand",
      "emoji": "🧴",
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
  const STORE_CHAINS = ["walmart", "target", "cvs", "walgreens", "ulta", "sephora", "amazon"];
  const q = query.toLowerCase();
  for (const store of STORE_CHAINS) {
    if (q.includes(store)) return store.charAt(0).toUpperCase() + store.slice(1);
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
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    emoji: "🧴",
    price: 16.99,
    score: 88,
    scoreLabel: "Real Deal",
    sentiment: 92,
    mentions: 247,
    postsAnalyzed: 0,
    whyItWon:
      "Consistently recommended across skincare communities for its dermatologist-approved formula and unbeatable price-to-performance ratio.",
    pros: ["Super hydrating", "Non-comedogenic", "Great value", "Widely available"],
    cons: ["Jar packaging is less hygienic", "Slight medicinal scent"],
    buyLinks: [
      { store: "Amazon", price: 16.99 },
      { store: "Target", price: 16.99 },
      { store: "Walmart", price: 15.88 },
    ],
    redditQuote: '"This is the holy grail. I\'ve tried $80 creams and this beats them all."',
  },
  alternatives: [
    {
      id: "la-roche-posay-toleriane",
      name: "La Roche-Posay Toleriane Double Repair",
      brand: "La Roche-Posay",
      emoji: "🧴",
      score: 85,
      price: 34.99,
      mentions: 189,
      sentiment: 91,
      whyNotWinner: "Higher quality ingredients but double the price",
    },
  ],
  subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
};

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const { query, store: storeOverride } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const startTime = Date.now();
    const detectedStore = storeOverride || detectStore(query);
    const budget = detectBudget(query);

    // 1. Search Reddit + Trustpilot via Tavily
    const results = await fetchSearchResults(query);

    // 2. Use Gemini to analyze results and generate recommendation
    const analysis = await analyzeWithGemini(query, results);

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
