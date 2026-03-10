import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite";

// ─── Reddit Types ──────────────────────────────────────────────────────────────

interface RedditPost {
  title: string;
  selftext: string;
  subreddit: string;
  score: number;
  num_comments: number;
}

// ─── Reddit Scraping ───────────────────────────────────────────────────────────

async function fetchRedditPosts(query: string): Promise<RedditPost[]> {
  const searches = [query, `best ${query}`];
  const allPosts: RedditPost[] = [];

  for (const q of searches) {
    try {
      const url = `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&sort=relevance&t=year&limit=10&type=link`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Picksy/1.0 (student project)" },
        cache: "no-store",
      });
      if (!res.ok) continue;

      const data = await res.json();
      const posts = (data.data?.children || []).map(
        (child: { data: Record<string, unknown> }) => ({
          title: String(child.data.title || ""),
          selftext: String(child.data.selftext || "").slice(0, 400),
          subreddit: String(child.data.subreddit || ""),
          score: Number(child.data.score) || 0,
          num_comments: Number(child.data.num_comments) || 0,
        })
      );
      allPosts.push(...posts);
    } catch {
      // continue with other search variant
    }
  }

  // Deduplicate by title
  const seen = new Set<string>();
  return allPosts.filter((p) => {
    if (!p.title || seen.has(p.title)) return false;
    seen.add(p.title);
    return true;
  });
}

// ─── Trustpilot placeholder ────────────────────────────────────────────────────
// TODO: When TRUSTPILOT_API_KEY is available, replace this with real brand
// review fetching from the Trustpilot Consumer API (developers.trustpilot.com).
// The Gemini prompt already instructs the model to include Trustpilot-style
// brand trust signals from its training knowledge until then.

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
  posts: RedditPost[]
): Promise<AnalysisOutput | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const postsText =
    posts.length > 0
      ? posts
          .map(
            (p, i) =>
              `[${i + 1}] r/${p.subreddit} (${p.score} upvotes, ${p.num_comments} comments)\nTitle: ${p.title}\n${p.selftext ? `Content: ${p.selftext}` : ""}`
          )
          .join("\n\n")
      : "No Reddit posts fetched — use your training knowledge about this product category.";

  const subredditsSeen = Array.from(new Set(posts.map((p) => `r/${p.subreddit}`).filter(Boolean)));

  const prompt = `You are the recommendation engine for Picksy, a product research tool.

A user searched for: "${query}"

Reddit posts found (${posts.length} posts):
${postsText}

Your job:
1. Identify the most recommended product based on the Reddit posts above (or your training knowledge if no posts).
2. Consider both Reddit community consensus AND general brand trustworthiness (similar to Trustpilot brand signals).
3. Do NOT bias toward any specific store. Focus on the best product regardless of where it's sold.
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
    "postsAnalyzed": ${posts.length},
    "whyItWon": "2 sentences explaining why this product won based on Reddit discussions and community trust.",
    "pros": ["Pro 1", "Pro 2", "Pro 3"],
    "cons": ["Con 1", "Con 2"],
    "buyLinks": [
      { "store": "Amazon", "price": 19.99 },
      { "store": "Target", "price": 20.99 },
      { "store": "Walmart", "price": 18.97 }
    ],
    "redditQuote": "A short quote capturing the overall Reddit + review sentiment"
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
  "subreddits": ${JSON.stringify(subredditsSeen.length > 0 ? subredditsSeen : ["r/BuyItForLife", "r/frugal"])}
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

    const text: string =
      candidates[0]?.content?.parts?.[0]?.text?.trim() || "";
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

// ─── Fallback mock (last resort if both Reddit and Gemini fail) ────────────────

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

    // 1. Fetch real Reddit posts
    const posts = await fetchRedditPosts(query);

    // 2. Use Gemini to analyze posts and generate recommendation
    const analysis = await analyzeWithGemini(query, posts);

    // 3. Fall back to mock only if everything fails
    const output = analysis || FALLBACK;

    const { winner, alternatives, subreddits } = output;

    // 4. If a store was mentioned, find matching buy link price
    if (detectedStore) {
      const storeLink = winner.buyLinks?.find(
        (l) => l.store.toLowerCase() === detectedStore.toLowerCase()
      );
      (winner as Record<string, unknown>).storePrice =
        storeLink?.price || winner.price;
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

    return NextResponse.json({
      winner,
      alternatives,
      meta: {
        query,
        category: "general",
        store: detectedStore,
        budget,
        subreddits,
        postsAnalyzed: posts.length,
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
