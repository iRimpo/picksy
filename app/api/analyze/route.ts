import { NextRequest, NextResponse } from "next/server";

const STORE_CHAINS = ["walmart", "target", "cvs", "walgreens", "ulta", "sephora", "amazon"];

// Mock subreddit mapping by product category
const SUBREDDIT_MAP: Record<string, string[]> = {
  moisturizer: ["r/SkincareAddiction", "r/AsianBeauty", "r/drugstorebeauty"],
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

    const winner = { ...(MOCK_WINNERS[category] || MOCK_WINNERS.default) } as Record<string, unknown>;
    const alternatives = MOCK_ALTERNATIVES[category] || MOCK_ALTERNATIVES.default;

    // Apply budget filter — if winner is over budget, swap with cheapest alternative
    if (budget && (winner.price as number) > budget) {
      const affordable = (alternatives as Record<string, unknown>[]).find(
        (a) => (a.price as number) <= budget
      );
      if (affordable) {
        (winner as Record<string, unknown>).note = `Best option under $${budget}`;
      }
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
        analysisTimeMs: 2200,
      },
    });
  } catch {
    return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
  }
}
