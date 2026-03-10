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
  // ── Specific multi-word categories first (avoids substring-match false positives) ──
  {
    category: "DryShampoo",
    keywords: ["dry shampoo"],
    subreddits: ["r/HaircareScience", "r/FancyFollicles"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "hairType", label: "Hair Type", minLabel: "Fine", maxLabel: "Thick/Oily", axis: "y" },
      { key: "hold", label: "Hold Level", minLabel: "", maxLabel: "", axis: "color" },
      { key: "scent", label: "Scent", minLabel: "Unscented", maxLabel: "Fragranced", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      hairType: (v) => v < 0.33 ? "fine or thin hair" : v < 0.67 ? "medium hair" : "thick or oily hair",
      hold: (v) => v < 0.33 ? "light volume boost" : v < 0.67 ? "medium refresh" : "strong hold and texture",
      scent: (v) => v === 0 ? "unscented" : v === 1 ? "lightly scented" : "fragranced",
    },
    colorLabels: ["Volume", "Refresh", "Texture"],
    colorKeys: ["volume", "refresh", "texture"],
  },
  {
    category: "EyeCream",
    keywords: ["eye cream", "under eye cream", "eye gel", "eye serum"],
    subreddits: ["r/SkincareAddiction", "r/30PlusSkincare"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "concern", label: "Concern", minLabel: "Dark Circles", maxLabel: "Wrinkles", axis: "y" },
      { key: "texture", label: "Texture", minLabel: "", maxLabel: "", axis: "color" },
      { key: "sensitivity", label: "Sensitivity", minLabel: "Sensitive", maxLabel: "Active Formula", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      concern: (v) => v < 0.33 ? "dark circles" : v < 0.67 ? "puffiness" : "fine lines and wrinkles",
      texture: (v) => v < 0.33 ? "lightweight gel" : v < 0.67 ? "medium cream" : "rich cream",
      sensitivity: (v) => v === 0 ? "fragrance-free for sensitive skin" : v === 1 ? "standard formula" : "active-rich formula",
    },
    colorLabels: ["Dark Circles", "Puffiness", "Anti-Aging"],
    colorKeys: ["dark-circles", "puffiness", "anti-aging"],
  },
  {
    category: "HairOil",
    keywords: ["hair oil", "hair treatment", "hair serum", "argan oil"],
    subreddits: ["r/HaircareScience", "r/FancyFollicles"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "hairType", label: "Hair Type", minLabel: "Fine", maxLabel: "Thick/Coarse", axis: "y" },
      { key: "goal", label: "Goal", minLabel: "", maxLabel: "", axis: "color" },
      { key: "scent", label: "Scent", minLabel: "Unscented", maxLabel: "Strong Scent", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      hairType: (v) => v < 0.33 ? "fine hair" : v < 0.67 ? "medium hair" : "thick or coarse hair",
      goal: (v) => v < 0.33 ? "shine and smoothness" : v < 0.67 ? "moisture and hydration" : "scalp health and growth",
      scent: (v) => v === 0 ? "fragrance-free" : v === 1 ? "lightly scented" : "strongly scented",
    },
    colorLabels: ["Shine", "Moisture", "Growth"],
    colorKeys: ["shine", "moisture", "growth"],
  },
  {
    category: "BodyWash",
    keywords: ["body wash", "body cleanser", "shower gel", "shower wash"],
    subreddits: ["r/SkincareAddiction", "r/beauty", "r/HaircareScience"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily/Normal", maxLabel: "Dry/Sensitive", axis: "y" },
      { key: "concern", label: "Feel", minLabel: "", maxLabel: "", axis: "color" },
      { key: "formula", label: "Formula", minLabel: "Gel", maxLabel: "Cream/Oil", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily or normal skin" : v < 0.67 ? "combination skin" : "dry or sensitive skin",
      concern: (v) => v < 0.33 ? "sensitive and gentle" : v < 0.67 ? "everyday clean" : "luxurious lather",
      formula: (v) => v === 0 ? "gel formula" : v === 1 ? "cream formula" : "oil or bar",
    },
    colorLabels: ["Sensitive", "Everyday", "Luxurious"],
    colorKeys: ["sensitive", "everyday", "luxurious"],
  },
  {
    category: "BodyLotion",
    keywords: ["body lotion", "body moisturizer", "body cream", "body butter"],
    subreddits: ["r/SkincareAddiction", "r/beauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Normal/Oily", maxLabel: "Very Dry", axis: "y" },
      { key: "scent", label: "Scent", minLabel: "", maxLabel: "", axis: "color" },
      { key: "thickness", label: "Thickness", minLabel: "Light", maxLabel: "Rich", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "normal or oily skin" : v < 0.67 ? "combination skin" : "dry or very dry skin",
      scent: (v) => v < 0.33 ? "fragrance-free" : v < 0.67 ? "lightly scented" : "strongly scented",
      thickness: (v) => v === 0 ? "lightweight lotion" : v === 1 ? "medium cream" : "thick body butter",
    },
    colorLabels: ["Unscented", "Light Scent", "Fragranced"],
    colorKeys: ["unscented", "light-scent", "fragranced"],
  },
  {
    category: "FaceOil",
    keywords: ["face oil", "facial oil", "rosehip oil", "jojoba"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily", maxLabel: "Dry/Mature", axis: "y" },
      { key: "concern", label: "Goal", minLabel: "", maxLabel: "", axis: "color" },
      { key: "absorption", label: "Absorption", minLabel: "Fast", maxLabel: "Rich/Slow", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily or acne-prone skin" : v < 0.67 ? "combination skin" : "dry or mature skin",
      concern: (v) => v < 0.33 ? "glow and brightening" : v < 0.67 ? "anti-aging and firming" : "barrier repair",
      absorption: (v) => v === 0 ? "fast-absorbing" : v === 1 ? "medium absorption" : "rich slow-absorbing",
    },
    colorLabels: ["Glow", "Anti-Aging", "Barrier"],
    colorKeys: ["glow", "anti-aging", "barrier"],
  },
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
    category: "Deodorant",
    keywords: ["deodorant", "antiperspirant", "deo"],
    subreddits: ["r/SkincareAddiction", "r/naturaldivos", "r/ZeroWaste"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "protection", label: "Protection", minLabel: "Light", maxLabel: "Heavy-Duty", axis: "y" },
      { key: "formula", label: "Formula", minLabel: "", maxLabel: "", axis: "color" },
      { key: "scent", label: "Scent", minLabel: "Unscented", maxLabel: "Strong", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      protection: (v) => v < 0.33 ? "light protection" : v < 0.67 ? "moderate protection" : "heavy-duty protection",
      formula: (v) => v < 0.33 ? "natural formula" : v < 0.67 ? "conventional formula" : "clinical strength",
      scent: (v) => v === 0 ? "unscented" : v === 1 ? "lightly scented" : "strongly scented",
    },
    colorLabels: ["Natural", "Standard", "Clinical"],
    colorKeys: ["natural", "standard", "clinical"],
  },
  {
    category: "Conditioner",
    keywords: ["conditioner", "hair conditioner", "deep conditioner"],
    subreddits: ["r/HaircareScience", "r/curlyhair", "r/FancyFollicles"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "hairType", label: "Hair Type", minLabel: "Fine", maxLabel: "Thick/Coarse", axis: "y" },
      { key: "concern", label: "Goal", minLabel: "", maxLabel: "", axis: "color" },
      { key: "treatment", label: "Treatment", minLabel: "Rinse-Out", maxLabel: "Leave-In", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "salon quality",
      hairType: (v) => v < 0.33 ? "fine hair" : v < 0.67 ? "medium hair" : "thick or coarse hair",
      concern: (v) => v < 0.33 ? "volumizing" : v < 0.67 ? "moisturizing" : "repair and strengthening",
      treatment: (v) => v === 0 ? "rinse-out" : v === 1 ? "deep treatment" : "leave-in",
    },
    colorLabels: ["Volumizing", "Moisturizing", "Repairing"],
    colorKeys: ["volumizing", "moisturizing", "repairing"],
  },
  {
    category: "FaceMask",
    keywords: ["face mask", "sheet mask", "clay mask", "facial mask"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily/Acne", maxLabel: "Dry/Sensitive", axis: "y" },
      { key: "concern", label: "Concern", minLabel: "", maxLabel: "", axis: "color" },
      { key: "frequency", label: "Frequency", minLabel: "Weekly", maxLabel: "Daily", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily or acne-prone skin" : v < 0.67 ? "combination skin" : "dry or sensitive skin",
      concern: (v) => v < 0.33 ? "pore-minimizing" : v < 0.67 ? "brightening and glow" : "deep hydration",
      frequency: (v) => v === 0 ? "weekly treatment" : v === 1 ? "2-3x per week" : "daily use",
    },
    colorLabels: ["Pore Care", "Brightening", "Hydrating"],
    colorKeys: ["pore-care", "brightening", "hydrating"],
  },
  {
    category: "Serum",
    keywords: ["serum", "face serum", "vitamin c", "retinol", "hyaluronic acid"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty", "r/30PlusSkincare"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "concern", label: "Concern", minLabel: "Acne/Oily", maxLabel: "Anti-Aging", axis: "y" },
      { key: "potency", label: "Potency", minLabel: "", maxLabel: "", axis: "color" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily", maxLabel: "Dry", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      concern: (v) => v < 0.33 ? "acne-fighting" : v < 0.67 ? "brightening and even tone" : "anti-aging and firming",
      potency: (v) => v < 0.33 ? "gentle and beginner-friendly" : v < 0.67 ? "moderate potency" : "high-potency advanced",
      skinType: (v) => v === 0 ? "oily skin" : v === 1 ? "combination skin" : "dry skin",
    },
    colorLabels: ["Gentle", "Moderate", "Advanced"],
    colorKeys: ["gentle", "moderate", "advanced"],
  },
  {
    category: "Toner",
    keywords: ["toner", "face toner", "astringent", "toning lotion"],
    subreddits: ["r/SkincareAddiction", "r/AsianBeauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "skinType", label: "Skin Type", minLabel: "Oily/Acne", maxLabel: "Dry/Sensitive", axis: "y" },
      { key: "concern", label: "Concern", minLabel: "", maxLabel: "", axis: "color" },
      { key: "alcohol", label: "Formula", minLabel: "Alcohol-Free", maxLabel: "Astringent", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      skinType: (v) => v < 0.33 ? "oily or acne-prone skin" : v < 0.67 ? "combination skin" : "dry or sensitive skin",
      concern: (v) => v < 0.33 ? "oil balancing" : v < 0.67 ? "pore tightening" : "brightening and glow",
      alcohol: (v) => v === 0 ? "alcohol-free" : v === 1 ? "low alcohol" : "astringent formula",
    },
    colorLabels: ["Balancing", "Pore Care", "Brightening"],
    colorKeys: ["balancing", "pore-care", "brightening"],
  },
  {
    category: "LipBalm",
    keywords: ["lip balm", "chapstick", "lip treatment", "lip moisturizer"],
    subreddits: ["r/SkincareAddiction", "r/beauty"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Drugstore", maxLabel: "Luxury", axis: "x" },
      { key: "concern", label: "Concern", minLabel: "Daily Moisture", maxLabel: "Healing", axis: "y" },
      { key: "flavor", label: "Flavor", minLabel: "", maxLabel: "", axis: "color" },
      { key: "spf", label: "SPF", minLabel: "No SPF", maxLabel: "SPF 30+", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "drugstore budget" : v < 0.67 ? "mid-range" : "luxury",
      concern: (v) => v < 0.33 ? "daily moisture" : v < 0.67 ? "intense hydration" : "healing and repair",
      flavor: (v) => v < 0.33 ? "unflavored" : v < 0.67 ? "fruity" : "mint or cooling",
      spf: (v) => v === 0 ? "no SPF" : v === 1 ? "SPF 15" : "SPF 30+",
    },
    colorLabels: ["Unflavored", "Fruity", "Mint"],
    colorKeys: ["unflavored", "fruity", "mint"],
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

// ─── Broad skincare/hygiene catch-all ──────────────────────────────────────────

const HYGIENE_BROAD_KEYWORDS = [
  "skincare", "skin care", "haircare", "hair care",
  "wash", "cleanser", "lotion", "cream", "serum", "oil", "balm",
  "mask", "toner", "moisturizer", "conditioner", "deodorant",
];

// ─── Public API ────────────────────────────────────────────────────────────────

export function isVagueQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Check specific category match
  const matchedCategory = CATEGORY_CONFIGS.find((c) =>
    c.keywords.some((kw) => lower.includes(kw))
  );

  // Broader hygiene/skincare catch-all if no specific category matched
  if (!matchedCategory) {
    const isBroadMatch = HYGIENE_BROAD_KEYWORDS.some((kw) => lower.includes(kw));
    if (!isBroadMatch) return false;
  }

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
