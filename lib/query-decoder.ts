import type { DecodedQuery, QueryParameter, OrbState, ResolvedPreferences } from "./types/refine";

// ─── Category Configs ──────────────────────────────────────────────────────────

interface CategoryConfig {
  category: string;
  keywords: string[];
  subreddits: string[];
  parameters: Omit<QueryParameter, "resolve">[];
  resolvers: Record<string, (v: number) => string>;
  colorLabels: string[];   // label for each ColorRing segment
  colorKeys: string[];     // the key values emitted when each ring segment is selected
}

const CATEGORY_CONFIGS: CategoryConfig[] = [
  {
    category: "Sunscreen",
    keywords: ["sunscreen", "sunblock", "spf", "sun protection", "uv protection"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty", "r/sunscreen"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily", maxLabel: "Dry", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "spfStrength", label: "SPF Strength", minLabel: "SPF 30", maxLabel: "SPF 50+", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily skin" : v < 0.67 ? "combination skin" : "dry skin",
      priority: (v) => v < 0.33 ? "sensitive/calming" : v < 0.67 ? "brightening" : "anti-aging",
      spfStrength: (v) => v === 0 ? "SPF 30" : v === 1 ? "SPF 50" : "SPF 50+",
    },
    colorLabels: ["Calming", "Brightening", "Anti-Aging"],
    colorKeys: ["calming", "brightening", "anti-aging"],
  },
  {
    category: "Moisturizer",
    keywords: ["moisturizer", "moisturiser", "face cream", "face lotion", "facial cream", "hydration cream"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty", "r/30PlusSkincare"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily", maxLabel: "Dry", axis: "y" },
      { key: "priority", label: "Goal", minLabel: "", maxLabel: "", axis: "color" },
      { key: "texture", label: "Texture", minLabel: "Lightweight", maxLabel: "Rich", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily skin" : v < 0.67 ? "combination skin" : "dry skin",
      priority: (v) => v < 0.33 ? "hydrating" : v < 0.67 ? "anti-aging" : "brightening",
      texture: (v) => v === 0 ? "lightweight gel" : v === 1 ? "medium" : "rich cream",
    },
    colorLabels: ["Hydrating", "Anti-Aging", "Brightening"],
    colorKeys: ["hydrating", "anti-aging", "brightening"],
  },
  {
    category: "Cleanser",
    keywords: ["cleanser", "face wash", "facial cleanser", "foaming wash", "cleansing"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily/Acne", maxLabel: "Dry/Sensitive", axis: "y" },
      { key: "concern", label: "Concern", minLabel: "", maxLabel: "", axis: "color" },
      { key: "texture", label: "Formula", minLabel: "Foam", maxLabel: "Oil/Balm", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily or acne-prone skin" : v < 0.67 ? "combination skin" : "dry or sensitive skin",
      concern: (v) => v < 0.33 ? "acne/breakouts" : v < 0.67 ? "redness/sensitivity" : "dullness/uneven tone",
      texture: (v) => v === 0 ? "foaming" : v === 1 ? "gel" : "oil or balm",
    },
    colorLabels: ["Acne", "Sensitive", "Brightening"],
    colorKeys: ["acne", "sensitive", "brightening"],
  },
  {
    category: "Shampoo",
    keywords: ["shampoo", "hair wash", "scalp wash"],
    subreddits: ["r/HaircareScience", "r/FancyFollicles", "r/curlyhair"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "hairType", label: "Hair Type", minLabel: "Fine", maxLabel: "Thick/Coarse", axis: "y" },
      { key: "concern", label: "Concern", minLabel: "", maxLabel: "", axis: "color" },
      { key: "fragrance", label: "Fragrance", minLabel: "Unscented", maxLabel: "Strong Scent", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "salon quality",
      hairType: (v) => v < 0.33 ? "fine hair" : v < 0.67 ? "medium hair" : "thick or coarse hair",
      concern: (v) => v < 0.33 ? "volumizing" : v < 0.67 ? "dandruff control" : "deep moisture",
      fragrance: (v) => v === 0 ? "fragrance-free" : v === 1 ? "lightly scented" : "strongly scented",
    },
    colorLabels: ["Volumizing", "Dandruff", "Moisturizing"],
    colorKeys: ["volumizing", "dandruff", "moisturizing"],
  },
  {
    category: "Headphones",
    keywords: ["headphones", "earbuds", "earphones", "headset", "over-ear", "in-ear", "wireless headphones"],
    subreddits: ["r/headphones", "r/audiophile", "r/SoundSystem"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Budget", maxLabel: "Premium", axis: "x" },
      { key: "useCase", label: "Use Case", minLabel: "Commuting", maxLabel: "Studio", axis: "y" },
      { key: "priority", label: "Sound Profile", minLabel: "", maxLabel: "", axis: "color" },
      { key: "formFactor", label: "Form Factor", minLabel: "True Wireless", maxLabel: "Over-Ear", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $50" : v < 0.67 ? "mid-range $50–$200" : "premium $200+",
      useCase: (v) => v < 0.33 ? "commuting / everyday" : v < 0.67 ? "work from home" : "studio / critical listening",
      priority: (v) => v < 0.33 ? "bass-heavy" : v < 0.67 ? "balanced" : "audiophile clarity",
      formFactor: (v) => v === 0 ? "true wireless earbuds" : v === 1 ? "on-ear" : "over-ear",
    },
    colorLabels: ["Bass", "Balanced", "Clarity"],
    colorKeys: ["bass", "balanced", "clarity"],
  },
];

const FALLBACK_CONFIG: CategoryConfig = {
  category: "General",
  keywords: [],
  subreddits: ["r/BuyItForLife", "r/frugal", "r/ProductReviews"],
  parameters: [
    { key: "budget", label: "Budget", minLabel: "Budget", maxLabel: "Premium", axis: "x" },
    { key: "quality", label: "Quality vs Value", minLabel: "Best Value", maxLabel: "Top Quality", axis: "y" },
    { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
    { key: "brand", label: "Brand Preference", minLabel: "Any Brand", maxLabel: "Name Brand", axis: "size" },
  ],
  resolvers: {
    budget: (v) => v < 0.33 ? "budget" : v < 0.67 ? "mid-range" : "premium",
    quality: (v) => v < 0.33 ? "best value" : v < 0.67 ? "balanced quality & value" : "top quality",
    priority: (v) => v < 0.33 ? "durability" : v < 0.67 ? "versatility" : "performance",
    brand: (v) => v === 0 ? "any brand" : v === 1 ? "mid-tier brands" : "name brand",
  },
  colorLabels: ["Durability", "Versatility", "Performance"],
  colorKeys: ["durability", "versatility", "performance"],
};

// ─── Specifier patterns (make a query "specific") ──────────────────────────────

const SPECIFIER_PATTERNS = [
  /\bfor\s+(dry|oily|combination|sensitive|normal|acne[- ]prone|mature)\b/i,
  /under\s*\$?\d+/i,
  /\$\d+/i,
  /\b(cheap|budget|affordable|luxury|high[- ]end|drugstore|salon)\b/i,
  /\b(cerave|neutrogena|la roche|aveeno|olay|tarte|fenty|tatcha|drunk elephant|paula|the ordinary|cosrx|innisfree|sony|bose|apple|samsung|jbl|sennheiser|beyerdynamic)\b/i,
  /\bat\s+(walmart|target|cvs|walgreens|ulta|sephora|amazon)\b/i,
  /\b(spf\s*\d+|spf\d+)\b/i,
  /\b(no white cast|no fragrance|fragrance[- ]free|reef[- ]safe|mineral|chemical)\b/i,
];

// ─── Public API ────────────────────────────────────────────────────────────────

export function isVagueQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Must match a known product category
  const matchedCategory = CATEGORY_CONFIGS.find((c) =>
    c.keywords.some((kw) => lower.includes(kw))
  );
  if (!matchedCategory) return false;

  // Count how many specifiers are present
  const specifierCount = SPECIFIER_PATTERNS.filter((p) => p.test(lower)).length;

  // Vague = has a category keyword but fewer than 2 specifiers
  return specifierCount < 2;
}

export function decodeQuery(query: string): DecodedQuery {
  const lower = query.toLowerCase().trim();

  const config =
    CATEGORY_CONFIGS.find((c) => c.keywords.some((kw) => lower.includes(kw))) ||
    FALLBACK_CONFIG;

  const parameters: QueryParameter[] = config.parameters.map((p) => ({
    ...p,
    resolve: config.resolvers[p.key] ?? (() => ""),
  }));

  return {
    original: query,
    category: config.category,
    parameters,
    suggestedSubreddits: config.subreddits,
  };
}

export function getColorConfig(query: string): { labels: string[]; keys: string[] } {
  const lower = query.toLowerCase().trim();
  const config =
    CATEGORY_CONFIGS.find((c) => c.keywords.some((kw) => lower.includes(kw))) ||
    FALLBACK_CONFIG;
  return { labels: config.colorLabels, keys: config.colorKeys };
}

export function resolvePreferences(orbState: OrbState, decoded: DecodedQuery, colorKeys: string[]): ResolvedPreferences {
  const values = decoded.parameters.map((param) => {
    let rawValue: number;

    switch (param.axis) {
      case "x":
        rawValue = orbState.x;
        break;
      case "y":
        // Y: top=0 (first label) → bottom=1 (second label); invert for natural "oily at top"
        rawValue = orbState.y;
        break;
      case "color":
        rawValue = orbState.colorIndex / Math.max(colorKeys.length - 1, 1);
        break;
      case "size":
        rawValue = orbState.sizeIndex / 2;
        break;
      default:
        rawValue = 0.5;
    }

    return {
      parameter: param.key,
      label: param.resolve(rawValue),
      rawValue,
    };
  });

  const summary = values.map((v) => v.label).join(", ");

  return { values, summary };
}
