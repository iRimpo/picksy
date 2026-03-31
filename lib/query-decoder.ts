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
    category: "Headphones",
    keywords: ["headphones", "earbuds", "earphones", "headset", "over-ear", "in-ear", "wireless headphones", "noise cancelling", "airpods", "wh-1000"],
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
  {
    category: "Laptop",
    keywords: ["laptop", "notebook", "macbook", "chromebook", "ultrabook", "gaming laptop", "work laptop"],
    subreddits: ["r/laptops", "r/SuggestALaptop", "r/macbook"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $500", maxLabel: "Premium $1500+", axis: "x" },
      { key: "useCase", label: "Use Case", minLabel: "Everyday Use", maxLabel: "Pro Work", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "portability", label: "Portability", minLabel: "Performance", maxLabel: "Ultralight", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $500" : v < 0.67 ? "mid-range $500–$1200" : "premium $1200+",
      useCase: (v) => v < 0.33 ? "everyday browsing and office tasks" : v < 0.67 ? "developer or creative work" : "video editing or 3D rendering",
      priority: (v) => v < 0.33 ? "battery life" : v < 0.67 ? "performance" : "display quality",
      portability: (v) => v === 0 ? "desktop replacement (heavy)" : v === 1 ? "balanced 14–15 inch" : "ultraportable 13 inch",
    },
    colorLabels: ["Battery", "Performance", "Display"],
    colorKeys: ["battery", "performance", "display"],
  },
  {
    category: "TV",
    keywords: ["tv", "television", "oled", "qled", "smart tv", "4k tv", "8k tv"],
    subreddits: ["r/4kTV", "r/hometheater", "r/Televisions"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $500", maxLabel: "Premium $2000+", axis: "x" },
      { key: "size", label: "Screen Size", minLabel: "Small (43\")", maxLabel: "Large (75\"+)", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "useCase", label: "Primary Use", minLabel: "Movies", maxLabel: "Gaming", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $500" : v < 0.67 ? "mid-range $500–$1500" : "premium $1500+",
      size: (v) => v < 0.33 ? "43–50 inch" : v < 0.67 ? "55–65 inch" : "75 inch or larger",
      priority: (v) => v < 0.33 ? "picture quality" : v < 0.67 ? "value" : "gaming features",
      useCase: (v) => v === 0 ? "movies and streaming" : v === 1 ? "mixed use" : "gaming (120Hz, VRR)",
    },
    colorLabels: ["Picture", "Value", "Gaming"],
    colorKeys: ["picture", "value", "gaming"],
  },
  {
    category: "Smartphone",
    keywords: ["smartphone", "phone", "iphone", "android", "galaxy", "pixel", "mobile phone"],
    subreddits: ["r/Android", "r/iphone", "r/smartphones"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $400", maxLabel: "Flagship $900+", axis: "x" },
      { key: "ecosystem", label: "Ecosystem", minLabel: "Android", maxLabel: "iOS", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "size", label: "Form Factor", minLabel: "Compact", maxLabel: "Max / Plus", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $400" : v < 0.67 ? "mid-range $400–$800" : "flagship $800+",
      ecosystem: (v) => v < 0.33 ? "Android preferred" : v < 0.67 ? "no preference" : "iOS / iPhone",
      priority: (v) => v < 0.33 ? "camera quality" : v < 0.67 ? "battery life" : "performance",
      size: (v) => v === 0 ? "compact under 6.2 inch" : v === 1 ? "standard 6.2–6.5 inch" : "large 6.7 inch+",
    },
    colorLabels: ["Camera", "Battery", "Speed"],
    colorKeys: ["camera", "battery", "speed"],
  },
  {
    category: "Keyboard",
    keywords: ["keyboard", "mechanical keyboard", "gaming keyboard", "wireless keyboard"],
    subreddits: ["r/MechanicalKeyboards", "r/buildapc", "r/gaming"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $50", maxLabel: "Premium $150+", axis: "x" },
      { key: "useCase", label: "Use Case", minLabel: "Gaming", maxLabel: "Typing / Office", axis: "y" },
      { key: "switchType", label: "Switch Type", minLabel: "", maxLabel: "", axis: "color" },
      { key: "size", label: "Layout", minLabel: "60%", maxLabel: "Full Size", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $50" : v < 0.67 ? "mid-range $50–$150" : "premium $150+",
      useCase: (v) => v < 0.33 ? "gaming" : v < 0.67 ? "mixed gaming and typing" : "productivity and typing",
      switchType: (v) => v < 0.33 ? "linear (red/speed)" : v < 0.67 ? "tactile (brown/clear)" : "clicky (blue/green)",
      size: (v) => v === 0 ? "60% or 65% compact" : v === 1 ? "tenkeyless (TKL)" : "full size with numpad",
    },
    colorLabels: ["Linear", "Tactile", "Clicky"],
    colorKeys: ["linear", "tactile", "clicky"],
  },
  {
    category: "Mouse",
    keywords: ["mouse", "gaming mouse", "wireless mouse", "trackpad", "trackball"],
    subreddits: ["r/MouseReview", "r/buildapc", "r/gaming"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $30", maxLabel: "Premium $80+", axis: "x" },
      { key: "useCase", label: "Use Case", minLabel: "Gaming", maxLabel: "Productivity", axis: "y" },
      { key: "dpi", label: "Sensor / DPI", minLabel: "", maxLabel: "", axis: "color" },
      { key: "grip", label: "Grip Style", minLabel: "Claw/Fingertip", maxLabel: "Palm", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $30" : v < 0.67 ? "mid-range $30–$80" : "premium $80+",
      useCase: (v) => v < 0.33 ? "competitive gaming" : v < 0.67 ? "casual gaming" : "office / productivity",
      dpi: (v) => v < 0.33 ? "standard sensor (up to 3200 DPI)" : v < 0.67 ? "high precision (up to 16000 DPI)" : "ultra-high DPI 25000+",
      grip: (v) => v === 0 ? "claw or fingertip grip" : v === 1 ? "hybrid grip" : "palm grip",
    },
    colorLabels: ["Standard", "Precision", "Ultra"],
    colorKeys: ["standard", "precision", "ultra"],
  },
  {
    category: "Monitor",
    keywords: ["monitor", "display", "screen", "4k monitor", "gaming monitor", "ultrawide"],
    subreddits: ["r/monitors", "r/buildapc", "r/ultrawidemasterrace"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $200", maxLabel: "Premium $600+", axis: "x" },
      { key: "size", label: "Screen Size", minLabel: "24 inch", maxLabel: "32+ inch", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "useCase", label: "Use Case", minLabel: "Gaming", maxLabel: "Color Work", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $200" : v < 0.67 ? "mid-range $200–$500" : "premium $500+",
      size: (v) => v < 0.33 ? "24 inch" : v < 0.67 ? "27 inch" : "32 inch or ultrawide",
      priority: (v) => v < 0.33 ? "high refresh rate (144Hz+)" : v < 0.67 ? "color accuracy (IPS)" : "resolution (4K)",
      useCase: (v) => v === 0 ? "competitive gaming" : v === 1 ? "mixed use" : "photo/video editing",
    },
    colorLabels: ["Speed", "Accuracy", "Resolution"],
    colorKeys: ["speed", "accuracy", "resolution"],
  },
  {
    category: "Speaker",
    keywords: ["speaker", "bluetooth speaker", "soundbar", "home theater speaker", "bookshelf speaker", "smart speaker"],
    subreddits: ["r/audiophile", "r/SoundSystem", "r/hometheater"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $50", maxLabel: "Premium $300+", axis: "x" },
      { key: "use", label: "Use", minLabel: "Portable", maxLabel: "Home / Desk", axis: "y" },
      { key: "priority", label: "Sound Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "form", label: "Form Factor", minLabel: "Compact", maxLabel: "Large", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $50" : v < 0.67 ? "mid-range $50–$200" : "premium $200+",
      use: (v) => v < 0.33 ? "portable / outdoor" : v < 0.67 ? "desktop / bedroom" : "living room / hi-fi",
      priority: (v) => v < 0.33 ? "bass-heavy" : v < 0.67 ? "balanced sound" : "audiophile accuracy",
      form: (v) => v === 0 ? "compact and portable" : v === 1 ? "medium desktop" : "large bookshelf or soundbar",
    },
    colorLabels: ["Bass", "Balanced", "Audiophile"],
    colorKeys: ["bass", "balanced", "audiophile"],
  },
  {
    category: "Camera",
    keywords: ["camera", "mirrorless camera", "dslr", "point and shoot", "action camera", "gopro", "sony a7"],
    subreddits: ["r/photography", "r/Cameras", "r/mirrorless"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $500", maxLabel: "Pro $2000+", axis: "x" },
      { key: "skill", label: "Skill Level", minLabel: "Beginner", maxLabel: "Professional", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "type", label: "Type", minLabel: "Mirrorless", maxLabel: "Point & Shoot", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $500" : v < 0.67 ? "enthusiast $500–$2000" : "professional $2000+",
      skill: (v) => v < 0.33 ? "beginner (auto modes)" : v < 0.67 ? "intermediate (manual control)" : "advanced / professional",
      priority: (v) => v < 0.33 ? "video quality" : v < 0.67 ? "photo quality" : "portability",
      type: (v) => v === 0 ? "mirrorless (interchangeable lens)" : v === 1 ? "compact with fixed lens" : "action camera",
    },
    colorLabels: ["Video", "Photo", "Portable"],
    colorKeys: ["video", "photo", "portable"],
  },
  {
    category: "Tablet",
    keywords: ["tablet", "ipad", "android tablet", "drawing tablet", "e-reader", "kindle"],
    subreddits: ["r/tablets", "r/ipad", "r/Android"],
    parameters: [
      { key: "budget", label: "Budget", minLabel: "Under $200", maxLabel: "Premium $700+", axis: "x" },
      { key: "use", label: "Primary Use", minLabel: "Media / Reading", maxLabel: "Work / Drawing", axis: "y" },
      { key: "priority", label: "Priority", minLabel: "", maxLabel: "", axis: "color" },
      { key: "size", label: "Size", minLabel: "Compact (8\")", maxLabel: "Large (12\"+)", axis: "size" },
    ],
    resolvers: {
      budget: (v) => v < 0.33 ? "budget under $200" : v < 0.67 ? "mid-range $200–$600" : "premium $600+",
      use: (v) => v < 0.33 ? "media consumption and reading" : v < 0.67 ? "mixed productivity" : "drawing, notes, or professional work",
      priority: (v) => v < 0.33 ? "battery life" : v < 0.67 ? "display quality" : "performance",
      size: (v) => v === 0 ? "compact 8–10 inch" : v === 1 ? "standard 10–11 inch" : "large 12 inch+",
    },
    colorLabels: ["Battery", "Display", "Performance"],
    colorKeys: ["battery", "display", "performance"],
  },
];

const FALLBACK_CONFIG: CategoryConfig = {
  category: "General",
  keywords: [],
  subreddits: ["r/BuyItForLife", "r/gadgets", "r/tech"],
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
  /under\s*\$?\d+/i,
  /\$\d+/i,
  /\b(cheap|budget|affordable|luxury|high[- ]end|premium|flagship)\b/i,
  /\b(sony|bose|apple|samsung|lg|logitech|dell|asus|acer|hp|lenovo|microsoft|google|jabra|sennheiser|beyerdynamic|razer|corsair|steelseries|jbl|anker|nikon|canon|fujifilm)\b/i,
  /\bat\s+(walmart|target|best buy|bestbuy|amazon|newegg|micro center)\b/i,
  /\b(gaming|studio|office|travel|commuting|wireless|wired|bluetooth|usb[- ]c|4k|8k|hdr|oled|amoled|ips|va)\b/i,
  /\b(noise[- ]cancell?ing|anc|passive|active)\b/i,
  /\b(over[- ]ear|in[- ]ear|true wireless|on[- ]ear|earbud)\b/i,
  /\b(14[- ]?inch|15[- ]?inch|16[- ]?inch|13[- ]?inch|m[123]|m4)\b/i,
  /\b(144hz|240hz|120hz|60hz|4k|1080p|1440p|ultrawide|curved)\b/i,
];

// ─── Broad electronics catch-all ───────────────────────────────────────────────

const ELECTRONICS_BROAD_KEYWORDS = [
  "tech", "electronics", "gadget", "device",
  "laptop", "computer", "pc", "desktop",
  "phone", "mobile",
  "tv", "television", "display", "screen",
  "headphones", "earbuds", "speaker", "audio",
  "keyboard", "mouse", "monitor",
  "camera", "tablet", "router", "charger",
  "console", "gaming", "smartwatch", "wearable",
];

// ─── Public API ────────────────────────────────────────────────────────────────

export function isVagueQuery(query: string): boolean {
  const lower = query.toLowerCase().trim();

  // Check specific category match
  const matchedCategory = CATEGORY_CONFIGS.find((c) =>
    c.keywords.some((kw) => lower.includes(kw))
  );

  // Broader electronics catch-all if no specific category matched
  if (!matchedCategory) {
    const isBroadMatch = ELECTRONICS_BROAD_KEYWORDS.some((kw) => lower.includes(kw));
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
