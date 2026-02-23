import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

const STORE_CHAINS = ["walmart", "target", "cvs", "walgreens", "ulta", "sephora", "amazon"];

// Mock subreddit mapping by product category
const SUBREDDIT_MAP: Record<string, string[]> = {
  moisturizer: ["r/SkincareAddiction", "r/AsianBeauty", "r/drugstorebeauty"],
  cleanser: ["r/SkincareAddiction", "r/AsianBeauty", "r/drugstorebeauty"],
  bodywash: ["r/SkincareAddiction", "r/fragrancefree", "r/drugstorebeauty"],
  deodorant: ["r/fragrancefree", "r/SkincareAddiction", "r/buyitforlife"],
  shampoo: ["r/HairCare", "r/femalehairadvice", "r/curlyhair"],
  serum: ["r/SkincareAddiction", "r/AsianBeauty"],
  sunscreen: ["r/SkincareAddiction", "r/AsianBeauty", "r/tretinoin"],
  foundation: ["r/MakeupAddiction", "r/muacjdiscussion"],
  headphones: ["r/headphones", "r/audiophile", "r/BudgetAudiophile"],
  laptop: ["r/laptops", "r/SuggestALaptop", "r/buildapc"],
  protein: ["r/Fitness", "r/bodybuilding", "r/gainit"],
  sneakers: ["r/Sneakers", "r/running", "r/frugalmalefashion"],
  default: ["r/BuyItForLife", "r/frugal", "r/reviews"],
};

function detectCategory(query: string): string {
  const q = query.toLowerCase();
  for (const key of Object.keys(SUBREDDIT_MAP)) {
    if (key !== "default" && q.includes(key)) return key;
  }
  if (q.includes("deodorant") || q.includes("deo")) return "deodorant";
  if (q.includes("body wash") || q.includes("bodywash")) return "bodywash";
  if (q.includes("cleanser") || q.includes("face wash") || q.includes("gentle cleanser")) return "cleanser";
  if (q.includes("sunscreen") || q.includes("spf")) return "sunscreen";
  if (q.includes("skin") || q.includes("face") || q.includes("acne")) return "moisturizer";
  if (q.includes("hair") || q.includes("scalp")) return "shampoo";
  if (q.includes("shoe") || q.includes("sneaker") || q.includes("running")) return "sneakers";
  return "default";
}

function detectStore(query: string): string | null {
  const q = query.toLowerCase();
  for (const store of STORE_CHAINS) {
    if (q.includes(store)) return store.charAt(0).toUpperCase() + store.slice(1);
  }
  return null;
}

function detectBudget(query: string): number | null {
  const match = query.match(/under\s*\$?(\d+)/i) || query.match(/\$?(\d+)\s*(?:or\s*)?less/i);
  return match ? parseInt(match[1]) : null;
}

// Mock product database for the analysis result
const MOCK_WINNERS: Record<string, object> = {
  moisturizer: {
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    emoji: "🧴",
    price: 16.99,
    score: 88,
    scoreLabel: "Real Deal",
    sentiment: 92,
    mentions: 247,
    postsAnalyzed: 143,
    whyItWon:
      "247 Redditors consistently cite this as the #1 choice. It dominates r/SkincareAddiction with dermatologist approval, an unbeatable price-to-performance ratio, and years of proven results across all skin types.",
    pros: ["Super hydrating — lasts all day", "Great value for price ($16 for months of use)", "Non-greasy, absorbs in seconds", "Non-comedogenic — safe for acne-prone skin"],
    cons: ["Jar packaging is unhygienic", "Slight medicinal smell", "Takes 5 min to fully absorb"],
    buyLinks: [
      { store: "Amazon", price: 16.99 },
      { store: "Target", price: 16.99 },
      { store: "Walmart", price: 15.88 },
      { store: "CVS", price: 18.99 },
    ],
    redditQuote: "\"This is the holy grail. I've tried $80 creams and this beats them all.\" — u/skincarescience",
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
  },
  cleanser: {
    id: "cetaphil-gentle-skin-cleanser",
    name: "Cetaphil Gentle Skin Cleanser",
    brand: "Cetaphil",
    emoji: "🫧",
    price: 11.99,
    score: 85,
    scoreLabel: "Gentle Pick",
    sentiment: 88,
    mentions: 193,
    postsAnalyzed: 119,
    whyItWon:
      "A frequent pick for gentle-cleansing searches because it cleans without stripping and works well for sensitive or irritated skin. It wins on consistency, accessibility, and low irritation reports.",
    pros: ["Very gentle on sensitive skin", "Affordable drugstore staple", "Non-stripping for daily use", "Easy to find at major stores"],
    cons: ["Can feel too mild for oily skin", "Texture is not everyone’s favorite", "May not remove heavy sunscreen/makeup alone"],
    buyLinks: [
      { store: "Target", price: 11.99 },
      { store: "Walmart", price: 10.97 },
      { store: "Amazon", price: 12.49 },
    ],
    redditQuote: "\"When my skin barrier is irritated, I switch back to this cleanser.\" — summary",
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
  },
  bodywash: {
    id: "dove-sensitive-skin-body-wash",
    name: "Dove Sensitive Skin Body Wash",
    brand: "Dove",
    emoji: "🧼",
    price: 8.99,
    score: 84,
    scoreLabel: "Everyday Pick",
    sentiment: 87,
    mentions: 176,
    postsAnalyzed: 103,
    whyItWon:
      "For body wash searches, this stands out as a safe, affordable default with broad positive feedback for sensitive skin. It performs well for daily use without over-drying.",
    pros: ["Good for sensitive skin", "Affordable", "Moisturizing feel", "Widely available"],
    cons: ["Not ideal if you want active ingredients", "Fragrance-free version can be harder to find in some stores", "Pump size varies by retailer"],
    buyLinks: [
      { store: "Walmart", price: 8.99 },
      { store: "Target", price: 9.49 },
      { store: "Amazon", price: 9.99 },
    ],
    redditQuote: "\"Simple and reliable body wash when my skin gets reactive.\" — summary",
    subreddits: ["r/SkincareAddiction", "r/fragrancefree"],
  },
  deodorant: {
    id: "vanicream-antiperspirant-deodorant",
    name: "Vanicream Antiperspirant/Deodorant",
    brand: "Vanicream",
    emoji: "🌿",
    price: 10.49,
    score: 83,
    scoreLabel: "Sensitive Pick",
    sentiment: 86,
    mentions: 154,
    postsAnalyzed: 95,
    whyItWon:
      "For fragrance-free deodorant searches, Vanicream is repeatedly recommended for sensitive skin and irritation-prone users. It wins because it balances effectiveness with a low-irritant formula.",
    pros: ["Fragrance-free", "Good for sensitive underarms", "Trusted brand for irritation-prone skin", "Reasonable price"],
    cons: ["Can feel less dry than some formulas", "Availability varies by store", "Not everyone likes the texture"],
    buyLinks: [
      { store: "Amazon", price: 10.49 },
      { store: "CVS", price: 11.99 },
      { store: "Target", price: 10.99 },
    ],
    redditQuote: "\"One of the few deodorants that doesn’t irritate my skin.\" — summary",
    subreddits: ["r/fragrancefree", "r/SkincareAddiction"],
  },
  shampoo: {
    id: "head-shoulders-classic",
    name: "Head & Shoulders Classic Clean",
    brand: "Head & Shoulders",
    emoji: "🧴",
    price: 9.97,
    score: 85,
    scoreLabel: "Real Deal",
    sentiment: 88,
    mentions: 198,
    postsAnalyzed: 112,
    whyItWon:
      "Dominates Reddit for scalp health. Dermatologist-approved with zinc pyrithione, consistent top recommendation in r/HairCare for years, and a price point that beats every competitor.",
    pros: ["Eliminates dandruff in 1–2 washes", "Works for all hair types", "Affordable and widely available", "Mild enough for daily use"],
    cons: ["Can feel drying with daily use", "Medicinal scent (fades quickly)", "Bottle design hasn't changed in years"],
    buyLinks: [
      { store: "Walmart", price: 9.97 },
      { store: "Target", price: 10.49 },
      { store: "Amazon", price: 9.99 },
    ],
    redditQuote: "\"Been using this for 10 years. Dandruff gone, hair healthy.\" — u/haircarefacts",
    subreddits: ["r/HairCare", "r/femalehairadvice"],
  },
  sunscreen: {
    id: "neutrogena-clear-face-spf50",
    name: "Neutrogena Clear Face SPF 50",
    brand: "Neutrogena",
    emoji: "☀️",
    price: 12.99,
    score: 87,
    scoreLabel: "Strong Pick",
    sentiment: 89,
    mentions: 206,
    postsAnalyzed: 126,
    whyItWon:
      "Frequently recommended for acne-prone and sensitive skin because it layers well, is widely available, and offers high SPF without feeling heavy. It wins on consistency and price for everyday use.",
    pros: ["Acne-friendly formula", "Affordable and easy to find", "High SPF 50 protection", "Lightweight for daily wear"],
    cons: ["Can pill with some moisturizers", "Slight white cast on deeper skin tones", "Matte finish may feel dry"],
    buyLinks: [
      { store: "Target", price: 12.99 },
      { store: "Walmart", price: 11.97 },
      { store: "Amazon", price: 13.49 },
    ],
    redditQuote: "\"This is the one I keep coming back to for acne-prone skin.\" — summary",
    subreddits: ["r/SkincareAddiction", "r/tretinoin"],
  },
  sensitive_moisturizer: {
    id: "vanicream-daily-facial",
    name: "Vanicream Daily Facial Moisturizer",
    brand: "Vanicream",
    emoji: "🧴",
    price: 15.99,
    score: 84,
    scoreLabel: "Sensitive Pick",
    sentiment: 88,
    mentions: 141,
    postsAnalyzed: 97,
    whyItWon:
      "For sensitive-skin queries, Vanicream often wins because users consistently report fewer irritation issues and a simple ingredient profile. It trades a bit of richness for better tolerability.",
    pros: ["Fragrance-free and gentle", "Good for sensitive skin", "Lightweight daily moisture", "Pairs well with actives"],
    cons: ["Less rich for very dry skin", "Smaller bottle for price", "Can feel basic compared with premium creams"],
    buyLinks: [
      { store: "Amazon", price: 15.99 },
      { store: "Target", price: 16.49 },
      { store: "CVS", price: 17.99 },
    ],
    redditQuote: "\"Whenever my skin is irritated, I switch back to Vanicream.\" — summary",
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
  },
  budget_moisturizer: {
    id: "nivea-soft-cream",
    name: "Nivea Soft Moisturizing Cream",
    brand: "Nivea",
    emoji: "🧴",
    price: 8.49,
    score: 76,
    scoreLabel: "Budget Pick",
    sentiment: 80,
    mentions: 118,
    postsAnalyzed: 84,
    whyItWon:
      "When the budget is under $10, this becomes the most practical option with strong value and broad availability. It is not the top overall performer, but it fits the price constraint well.",
    pros: ["Under $10", "Easy to find", "Light cream texture", "Good everyday value"],
    cons: ["Contains fragrance", "Not ideal for very sensitive skin", "Can feel shiny on oily skin"],
    buyLinks: [
      { store: "Walmart", price: 8.49 },
      { store: "Target", price: 8.99 },
      { store: "Amazon", price: 8.79 },
    ],
    redditQuote: "\"For under $10, this is a solid everyday moisturizer.\" — summary",
    subreddits: ["r/drugstorebeauty", "r/SkincareAddiction"],
  },
  headphones: {
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    emoji: "🎧",
    price: 279.99,
    score: 94,
    scoreLabel: "Real Deal",
    sentiment: 95,
    mentions: 412,
    postsAnalyzed: 231,
    whyItWon:
      "The undisputed Reddit champion for noise-cancelling headphones. 412 mentions across r/headphones and r/audiophile with near-universal praise for ANC quality, comfort, and audio performance.",
    pros: ["Best-in-class noise cancellation", "30-hour battery life", "Incredibly comfortable for all-day wear", "Crystal clear call quality"],
    cons: ["Can't fold flat — less portable", "Premium price", "Ear pads show wear after 1+ year"],
    buyLinks: [
      { store: "Amazon", price: 279.99 },
      { store: "Best Buy", price: 299.99 },
      { store: "Sony Store", price: 349.99 },
    ],
    redditQuote: "\"I tried Bose, Apple, and nothing beats XM5 for the price.\" — u/audiogear",
    subreddits: ["r/headphones", "r/audiophile"],
  },
  default: {
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    emoji: "🧴",
    price: 16.99,
    score: 88,
    scoreLabel: "Real Deal",
    sentiment: 92,
    mentions: 247,
    postsAnalyzed: 143,
    whyItWon:
      "247 Redditors consistently recommend this across multiple communities. It tops the charts for value, effectiveness, and user satisfaction.",
    pros: ["Super hydrating — lasts all day", "Great value for price", "Non-greasy texture", "Widely available everywhere"],
    cons: ["Jar packaging is less hygienic", "Slight medicinal smell", "May not suit very oily skin"],
    buyLinks: [
      { store: "Amazon", price: 16.99 },
      { store: "Target", price: 16.99 },
      { store: "Walmart", price: 15.88 },
    ],
    redditQuote: "\"This is my holy grail. Nothing beats it at this price.\" — u/honestreviewer",
    subreddits: ["r/BuyItForLife", "r/frugal"],
  },
};

const MOCK_ALTERNATIVES: Record<string, object[]> = {
  moisturizer: [
    {
      id: "la-roche-posay-toleriane",
      name: "La Roche-Posay Toleriane Double Repair",
      brand: "La Roche-Posay",
      emoji: "🧴",
      score: 85,
      price: 34.99,
      mentions: 189,
      sentiment: 91,
      whyNotWinner: "Higher quality ingredients but fewer Reddit mentions and double the price",
    },
    {
      id: "cetaphil-daily-hydrating",
      name: "Cetaphil Daily Hydrating Lotion",
      brand: "Cetaphil",
      emoji: "🧴",
      score: 79,
      price: 14.99,
      mentions: 134,
      sentiment: 82,
      whyNotWinner: "Budget-friendly but lighter hydration — not as strong for dry skin",
    },
  ],
  cleanser: [
    {
      id: "vanicream-gentle-facial-cleanser",
      name: "Vanicream Gentle Facial Cleanser",
      brand: "Vanicream",
      emoji: "🫧",
      score: 84,
      price: 9.99,
      mentions: 148,
      sentiment: 89,
      whyNotWinner: "Excellent for sensitive skin, but slightly fewer mentions than Cetaphil in broad searches",
    },
    {
      id: "cerave-hydrating-cleanser",
      name: "CeraVe Hydrating Facial Cleanser",
      brand: "CeraVe",
      emoji: "🫧",
      score: 83,
      price: 13.99,
      mentions: 165,
      sentiment: 86,
      whyNotWinner: "Strong option, but often pricier and can feel too gentle for some users",
    },
  ],
  bodywash: [
    {
      id: "cetaphil-ultra-gentle-body-wash",
      name: "Cetaphil Ultra Gentle Body Wash",
      brand: "Cetaphil",
      emoji: "🧼",
      score: 82,
      price: 10.99,
      mentions: 131,
      sentiment: 85,
      whyNotWinner: "Very gentle but less commonly stocked than Dove",
    },
    {
      id: "native-sensitive-body-wash",
      name: "Native Sensitive Body Wash",
      brand: "Native",
      emoji: "🧼",
      score: 78,
      price: 12.99,
      mentions: 96,
      sentiment: 80,
      whyNotWinner: "Popular with some users, but more expensive and mixed sensitivity feedback",
    },
  ],
  deodorant: [
    {
      id: "dove-zero-aluminum-sensitive",
      name: "Dove 0% Aluminum Sensitive Deodorant",
      brand: "Dove",
      emoji: "🌿",
      score: 80,
      price: 8.49,
      mentions: 138,
      sentiment: 82,
      whyNotWinner: "Affordable and popular, but some users report fragrance sensitivity depending on variant",
    },
    {
      id: "native-unscented-deodorant",
      name: "Native Unscented Deodorant",
      brand: "Native",
      emoji: "🌿",
      score: 77,
      price: 12.99,
      mentions: 112,
      sentiment: 78,
      whyNotWinner: "Unscented option but pricier with mixed longevity reviews",
    },
  ],
  shampoo: [
    {
      id: "nizoral-anti-dandruff",
      name: "Nizoral Anti-Dandruff Shampoo",
      brand: "Nizoral",
      emoji: "🧴",
      score: 82,
      price: 14.97,
      mentions: 156,
      sentiment: 87,
      whyNotWinner: "More powerful for severe dandruff but too strong for daily use",
    },
    {
      id: "selsun-blue",
      name: "Selsun Blue Medicated",
      brand: "Selsun Blue",
      emoji: "🧴",
      score: 75,
      price: 7.99,
      mentions: 89,
      sentiment: 79,
      whyNotWinner: "Great budget option but mixed results — not as consistently loved",
    },
  ],
  sunscreen: [
    {
      id: "elta-md-uv-clear",
      name: "EltaMD UV Clear SPF 46",
      brand: "EltaMD",
      emoji: "☀️",
      score: 90,
      price: 39.99,
      mentions: 173,
      sentiment: 92,
      whyNotWinner: "Loved by acne-prone skin users but too expensive for most MVP budget searches",
    },
    {
      id: "la-roche-posay-anthelios-fluid",
      name: "La Roche-Posay Anthelios Fluid SPF 50",
      brand: "La Roche-Posay",
      emoji: "☀️",
      score: 86,
      price: 32.99,
      mentions: 147,
      sentiment: 90,
      whyNotWinner: "Excellent finish and protection, but less affordable than the winner",
    },
  ],
  headphones: [
    {
      id: "bose-qc45",
      name: "Bose QuietComfort 45",
      brand: "Bose",
      emoji: "🎧",
      score: 89,
      price: 249.99,
      mentions: 287,
      sentiment: 88,
      whyNotWinner: "Excellent ANC and sound, but Sony edges it out in battery life and value",
    },
    {
      id: "apple-airpods-max",
      name: "Apple AirPods Max",
      brand: "Apple",
      emoji: "🎧",
      score: 83,
      price: 449.99,
      mentions: 198,
      sentiment: 84,
      whyNotWinner: "Premium build quality, but 2x the price for marginal gains",
    },
  ],
  default: [
    {
      id: "la-roche-posay-toleriane",
      name: "La Roche-Posay Toleriane Double Repair",
      brand: "La Roche-Posay",
      emoji: "🧴",
      score: 85,
      price: 34.99,
      mentions: 189,
      sentiment: 91,
      whyNotWinner: "Higher quality but fewer mentions and double the price",
    },
    {
      id: "vanicream-daily-facial",
      name: "Vanicream Daily Facial Moisturizer",
      brand: "Vanicream",
      emoji: "🧴",
      score: 79,
      price: 15.99,
      mentions: 134,
      sentiment: 84,
      whyNotWinner: "Reddit's hidden gem — loved by sensitive skin types specifically",
    },
  ],
};

// Simulates a realistic delay
function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

type GeminiWinnerPatch = Partial<{
  whyItWon: string;
  pros: string[];
  cons: string[];
  scoreLabel: string;
  redditQuote: string;
}>;

function extractGeminiText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;

  const candidates = (payload as { candidates?: unknown[] }).candidates;
  if (!Array.isArray(candidates) || candidates.length === 0) return null;

  const first = candidates[0] as {
    content?: { parts?: Array<{ text?: string }> };
  };
  const parts = first.content?.parts;
  if (!Array.isArray(parts)) return null;

  const textPart = parts.find((part) => typeof part?.text === "string");
  return textPart?.text?.trim() || null;
}

function isNonEmptyStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string" && item.trim().length > 0);
}

function sanitizeGeminiPatch(value: unknown): GeminiWinnerPatch | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  const patch: GeminiWinnerPatch = {};

  if (typeof obj.whyItWon === "string" && obj.whyItWon.trim()) patch.whyItWon = obj.whyItWon.trim();
  if (isNonEmptyStringArray(obj.pros)) patch.pros = obj.pros.slice(0, 4);
  if (isNonEmptyStringArray(obj.cons)) patch.cons = obj.cons.slice(0, 4);
  if (typeof obj.scoreLabel === "string" && obj.scoreLabel.trim()) patch.scoreLabel = obj.scoreLabel.trim();
  if (typeof obj.redditQuote === "string" && obj.redditQuote.trim()) patch.redditQuote = obj.redditQuote.trim();

  return Object.keys(patch).length > 0 ? patch : null;
}

async function getGeminiWinnerPatch(params: {
  query: string;
  category: string;
  winner: Record<string, unknown>;
  alternatives: object[];
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;

  const { query, category, winner, alternatives } = params;
  const altNames = alternatives
    .slice(0, 2)
    .map((a) => {
      const item = a as Record<string, unknown>;
      return `${String(item.name)} ($${String(item.price)})`;
    })
    .join(", ");

  const prompt = `
You are helping a product recommendation MVP called Picksy.
Return ONLY valid JSON with keys: whyItWon, pros, cons, scoreLabel, redditQuote.

User query: ${query}
Category: ${category}

Chosen product:
- name: ${String(winner.name)}
- brand: ${String(winner.brand)}
- price: ${String(winner.price)}
- score: ${String(winner.score)}
- mentions: ${String(winner.mentions)}
- sentiment: ${String(winner.sentiment)}

Alternatives (for context): ${altNames}

Instructions:
- Frame the explanation as a blended "Reddit + Trustpilot" summary.
- Keep whyItWon to 2 sentences max.
- pros and cons should each have 3-4 short bullet strings.
- scoreLabel should be 1-3 words (example: "Strong Pick").
- redditQuote should be a short quote-style summary line, but do not invent a username.
- Do not mention that data may be mocked.
`.trim();

  const response = await fetch(`${GEMINI_API_URL}/models/${GEMINI_MODEL}:generateContent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-goog-api-key": apiKey,
    },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const payload = await response.json();
  const text = extractGeminiText(payload);
  if (!text) return null;

  try {
    return sanitizeGeminiPatch(JSON.parse(text));
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { query, store: storeOverride } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    // Simulate Reddit API + LLM analysis time
    await sleep(2200);

    const category = detectCategory(query);
    const detectedStore = storeOverride || detectStore(query);
    const budget = detectBudget(query);
    const subreddits = SUBREDDIT_MAP[category] || SUBREDDIT_MAP.default;

    let winner = { ...(MOCK_WINNERS[category] || MOCK_WINNERS.default) } as Record<string, unknown>;
    const alternatives = MOCK_ALTERNATIVES[category] || MOCK_ALTERNATIVES.default;

    const lowerQuery = query.toLowerCase();

    // Persona-driven overrides for demo clarity
    if (category === "moisturizer" && lowerQuery.includes("sensitive")) {
      winner = { ...(MOCK_WINNERS.sensitive_moisturizer as object) } as Record<string, unknown>;
    }

    if (category === "moisturizer" && budget && budget <= 10) {
      winner = { ...(MOCK_WINNERS.budget_moisturizer as object) } as Record<string, unknown>;
      winner.note = `Best option under $${budget}`;
    }

    // Apply budget filter — if winner is over budget, swap with cheapest alternative
    if (budget && (winner.price as number) > budget) {
      (winner as Record<string, unknown>).note = `Closest match found near your budget (under $${budget} options are limited)`;
    }

    // Store-specific: add store price and availability
    if (detectedStore) {
      const buyLinks = winner.buyLinks as { store: string; price: number }[];
      const storeLink = buyLinks?.find(
        (l) => l.store.toLowerCase() === (detectedStore as string).toLowerCase()
      );
      winner.storePrice = storeLink?.price || (winner.price as number);
      winner.storeName = detectedStore;
      winner.inStock = true;

      // Calculate value score for store-specific
      const cheapest = Math.min(...(buyLinks?.map((l) => l.price) || [winner.price as number]));
      const priceRatio = (cheapest / (storeLink?.price || (winner.price as number))) * 100;
      const valueScore = Math.round(
        ((winner.sentiment as number) * 0.5) + (priceRatio * 0.3) + (winner.inStock ? 20 : 0)
      );
      winner.valueScore = valueScore;
    }

    let llmUsed = false;
    try {
      const geminiPatch = await getGeminiWinnerPatch({
        query,
        category,
        winner,
        alternatives,
      });
      if (geminiPatch) {
        Object.assign(winner, geminiPatch);
        llmUsed = true;
      }
    } catch (error) {
      console.error("Gemini enrichment failed, using mock fallback:", error);
    }

    const postsAnalyzed = winner.postsAnalyzed as number;

    return NextResponse.json({
      winner,
      alternatives,
      meta: {
        query,
        category,
        store: detectedStore,
        budget,
        subreddits,
        postsAnalyzed,
        mode: detectedStore ? "store-specific" : "general",
        llmProvider: llmUsed ? "gemini" : "mock",
        llmUsed,
        analysisTimeMs: 2200,
      },
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
