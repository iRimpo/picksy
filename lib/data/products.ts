export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  score: number;
  scoreLabel: string;
  sentiment: number;
  mentions: number;
  badge?: string;
  platforms: {
    reddit: { sentiment: number; mentions: number; badge: string; trend: string };
    tiktok: { sentiment: number; mentions: number; badge: string; trend: string };
    youtube: { sentiment: number; mentions: number; badge: string; trend: string };
    instagram: { sentiment: number; mentions: number; badge: string; trend: string };
  };
  pros: { icon: string; title: string; count: number; detail: string }[];
  cons: { icon: string; title: string; count: number; detail: string }[];
  claims: {
    claim: string;
    testedBy: number;
    confirmed: number;
    disputed: number;
    verdict: string;
    verdictColor: string;
    reality: string;
    quotes: { text: string; author: string; positive: boolean }[];
  }[];
  transcripts: {
    creator: string;
    followers: string;
    verified: boolean;
    authenticity: number;
    sponsored: boolean;
    views: string;
    duration: string;
    quotes: string[];
    sentimentScore: number;
    sentimentLabel: string;
    sentimentEmoji: string;
    aspects: { name: string; status: "positive" | "warning" | "negative" }[];
  }[];
  retailers: { name: string; price: number }[];
}

export const products: Product[] = [
  {
    id: "cerave-moisturizing-cream",
    name: "CeraVe Moisturizing Cream",
    brand: "CeraVe",
    category: "Facial Moisturizers",
    price: 16.99,
    score: 88,
    scoreLabel: "Real Deal",
    sentiment: 87,
    mentions: 1247,
    badge: "Best Match",
    platforms: {
      reddit: { sentiment: 92, mentions: 248, badge: "Expert Community", trend: "stable" },
      tiktok: { sentiment: 78, mentions: 1453, badge: "Viral Favorite", trend: "rising" },
      youtube: { sentiment: 95, mentions: 89, badge: "Expert Analysis", trend: "stable" },
      instagram: { sentiment: 81, mentions: 567, badge: "Visual Proof", trend: "stable" },
    },
    pros: [
      { icon: "💧", title: "Super hydrating", count: 342, detail: "Keeps skin moisturized all day without reapplying" },
      { icon: "⏱️", title: "Long-lasting moisture", count: 298, detail: "One application lasts 8+ hours easily" },
      { icon: "💰", title: "Great value for price", count: 276, detail: "$17 for a huge tub that lasts months" },
      { icon: "🧴", title: "Non-greasy texture", count: 215, detail: "Absorbs quickly, doesn't leave residue" },
      { icon: "🔒", title: "Doesn't clog pores", count: 198, detail: "No breakouts, safe for acne-prone skin" },
    ],
    cons: [
      { icon: "🫙", title: "Jar packaging is unhygienic", count: 156, detail: "Dipping fingers in isn't sanitary" },
      { icon: "👃", title: "Slight medicinal smell", count: 89, detail: "Not terrible but not pleasant either" },
      { icon: "⏰", title: "Takes time to fully absorb", count: 76, detail: "Need to wait 5 min before makeup" },
      { icon: "🎨", title: "Boring packaging", count: 45, detail: "Looks clinical, not aesthetic" },
      { icon: "🏪", title: "Often out of stock", count: 38, detail: "Popular enough that it sells out frequently" },
    ],
    claims: [
      {
        claim: "Provides 24-hour hydration",
        testedBy: 47,
        confirmed: 32,
        disputed: 15,
        verdict: "Partially True",
        verdictColor: "yellow",
        reality: "Works for most (68%) but YMMV",
        quotes: [
          { text: "Seriously 24 hours, tested it", author: "@skincarescience", positive: true },
          { text: "Maybe 12-14 hours max for me", author: "@honestbeauty", positive: false },
        ],
      },
      {
        claim: "Non-comedogenic (won't clog pores)",
        testedBy: 89,
        confirmed: 81,
        disputed: 8,
        verdict: "Mostly True",
        verdictColor: "green",
        reality: "Safe for 91% of users",
        quotes: [
          { text: "No breakouts, safe for acne-prone", author: "@clearskinjourney", positive: true },
          { text: "Gave me cystic acne", author: "@sensitiveskin", positive: false },
        ],
      },
      {
        claim: "Suitable for all skin types",
        testedBy: 120,
        confirmed: 98,
        disputed: 22,
        verdict: "True (with caveat)",
        verdictColor: "yellow",
        reality: "Excellent for dry/normal, mixed for oily",
        quotes: [
          { text: "Perfect for my dry skin", author: "@dryskinfix", positive: true },
          { text: "Too heavy for oily skin in summer", author: "@oilyskincare", positive: false },
        ],
      },
    ],
    transcripts: [
      {
        creator: "@skincarebyjess",
        followers: "412K",
        verified: true,
        authenticity: 94,
        sponsored: false,
        views: "2.3M",
        duration: "2:34",
        quotes: [
          "I've been using this for 3 months and my skin has NEVER looked better.",
          "The texture absorbs in 30 seconds with zero residue.",
          "This bottle lasted me 3 months so the value is insane.",
        ],
        sentimentScore: 92,
        sentimentLabel: "Very Positive",
        sentimentEmoji: "😊",
        aspects: [
          { name: "Texture", status: "positive" },
          { name: "Value", status: "positive" },
          { name: "Results", status: "positive" },
        ],
      },
      {
        creator: "@honestbeauty",
        followers: "156K",
        verified: false,
        authenticity: 87,
        sponsored: false,
        views: "890K",
        duration: "1:12",
        quotes: [
          "It's fine? Like it's good but not life-changing.",
          "The glow is real but it's kinda greasy on my oily skin.",
          "If you have dry skin you'll love it. For oily skin, maybe skip.",
        ],
        sentimentScore: 62,
        sentimentLabel: "Mixed",
        sentimentEmoji: "😐",
        aspects: [
          { name: "Texture", status: "warning" },
          { name: "Results", status: "positive" },
          { name: "Skin Type Specific", status: "warning" },
        ],
      },
      {
        creator: "@glowupgirl",
        followers: "892K",
        verified: false,
        authenticity: 48,
        sponsored: true,
        views: "1.8M",
        duration: "0:45",
        quotes: [
          "OMG this is AMAZING! My skin is literally glowing!",
          "Use code GLOW20 for 20% off!",
        ],
        sentimentScore: 95,
        sentimentLabel: "Very Positive",
        sentimentEmoji: "😊",
        aspects: [
          { name: "Results", status: "positive" },
        ],
      },
    ],
    retailers: [
      { name: "Amazon", price: 16.99 },
      { name: "Target", price: 16.99 },
      { name: "Ulta", price: 17.49 },
    ],
  },
  {
    id: "la-roche-posay-toleriane",
    name: "La Roche-Posay Toleriane Double Repair",
    brand: "La Roche-Posay",
    category: "Facial Moisturizers",
    price: 34.99,
    score: 92,
    scoreLabel: "Real Deal",
    sentiment: 91,
    mentions: 876,
    badge: "Premium Pick",
    platforms: {
      reddit: { sentiment: 95, mentions: 312, badge: "Expert Favorite", trend: "stable" },
      tiktok: { sentiment: 85, mentions: 890, badge: "Trending", trend: "rising" },
      youtube: { sentiment: 96, mentions: 123, badge: "Dermatologist Approved", trend: "stable" },
      instagram: { sentiment: 88, mentions: 445, badge: "Aesthetic Pick", trend: "stable" },
    },
    pros: [
      { icon: "🧬", title: "Dermatologist recommended", count: 289, detail: "Top choice among skin experts" },
      { icon: "💧", title: "Repairs skin barrier", count: 256, detail: "Ceramides and niacinamide combo" },
      { icon: "🌿", title: "Fragrance-free", count: 198, detail: "Safe for sensitive skin" },
    ],
    cons: [
      { icon: "💸", title: "Pricier option", count: 167, detail: "Double the price of drugstore alternatives" },
      { icon: "📦", title: "Small tube size", count: 89, detail: "Runs out faster than expected" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 34.99 },
      { name: "Ulta", price: 34.99 },
      { name: "CVS", price: 36.99 },
    ],
  },
  {
    id: "cetaphil-daily-hydrating",
    name: "Cetaphil Daily Hydrating Lotion",
    brand: "Cetaphil",
    category: "Facial Moisturizers",
    price: 14.99,
    score: 85,
    scoreLabel: "Real Deal",
    sentiment: 82,
    mentions: 654,
    badge: "Best Value",
    platforms: {
      reddit: { sentiment: 88, mentions: 187, badge: "Budget Pick", trend: "stable" },
      tiktok: { sentiment: 75, mentions: 623, badge: "Trending", trend: "rising" },
      youtube: { sentiment: 90, mentions: 67, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 78, mentions: 321, badge: "Popular", trend: "stable" },
    },
    pros: [
      { icon: "💰", title: "Best budget option", count: 312, detail: "Effective for under $15" },
      { icon: "🧴", title: "Lightweight formula", count: 234, detail: "Great for layering under makeup" },
    ],
    cons: [
      { icon: "💧", title: "Not hydrating enough for very dry skin", count: 123, detail: "May need additional products" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 14.99 },
      { name: "Target", price: 14.99 },
      { name: "Walgreens", price: 15.49 },
    ],
  },
  {
    id: "neutrogena-hydro-boost",
    name: "Neutrogena Hydro Boost Water Gel",
    brand: "Neutrogena",
    category: "Facial Moisturizers",
    price: 18.99,
    score: 76,
    scoreLabel: "Solid Choice",
    sentiment: 78,
    mentions: 987,
    platforms: {
      reddit: { sentiment: 72, mentions: 156, badge: "Discussed", trend: "declining" },
      tiktok: { sentiment: 80, mentions: 1200, badge: "Viral", trend: "stable" },
      youtube: { sentiment: 82, mentions: 78, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 76, mentions: 489, badge: "Popular", trend: "stable" },
    },
    pros: [
      { icon: "💧", title: "Gel texture feels refreshing", count: 278, detail: "Light and cooling on skin" },
      { icon: "🎨", title: "Great under makeup", count: 234, detail: "Smooth base for foundation" },
    ],
    cons: [
      { icon: "🧪", title: "Contains fragrance", count: 189, detail: "Not ideal for sensitive skin" },
      { icon: "⏱️", title: "Hydration doesn't last all day", count: 145, detail: "Need to reapply by afternoon" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 18.99 },
      { name: "Target", price: 19.49 },
    ],
  },
  {
    id: "aveeno-daily-moisturizing",
    name: "Aveeno Daily Moisturizing Lotion",
    brand: "Aveeno",
    category: "Facial Moisturizers",
    price: 12.99,
    score: 79,
    scoreLabel: "Solid Choice",
    sentiment: 75,
    mentions: 543,
    platforms: {
      reddit: { sentiment: 80, mentions: 134, badge: "Classic Pick", trend: "stable" },
      tiktok: { sentiment: 68, mentions: 567, badge: "Mentioned", trend: "stable" },
      youtube: { sentiment: 85, mentions: 45, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 72, mentions: 234, badge: "Popular", trend: "stable" },
    },
    pros: [
      { icon: "🌾", title: "Oat-based formula", count: 198, detail: "Natural soothing ingredients" },
      { icon: "💰", title: "Very affordable", count: 176, detail: "Great daily moisturizer on a budget" },
    ],
    cons: [
      { icon: "🧴", title: "Can feel heavy", count: 134, detail: "Too thick for oily skin types" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 12.99 },
      { name: "Target", price: 12.99 },
    ],
  },
  {
    id: "first-aid-beauty-ultra-repair",
    name: "First Aid Beauty Ultra Repair Cream",
    brand: "First Aid Beauty",
    category: "Facial Moisturizers",
    price: 38.00,
    score: 81,
    scoreLabel: "Solid Choice",
    sentiment: 80,
    mentions: 432,
    platforms: {
      reddit: { sentiment: 86, mentions: 198, badge: "Cult Favorite", trend: "stable" },
      tiktok: { sentiment: 76, mentions: 456, badge: "Trending", trend: "rising" },
      youtube: { sentiment: 88, mentions: 56, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 82, mentions: 345, badge: "Aesthetic", trend: "stable" },
    },
    pros: [
      { icon: "🧬", title: "Colloidal oatmeal", count: 187, detail: "Soothes irritated skin instantly" },
      { icon: "🌿", title: "Clean ingredients", count: 165, detail: "Free of common irritants" },
    ],
    cons: [
      { icon: "💸", title: "Expensive", count: 156, detail: "Hard to justify the price point" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Sephora", price: 38.00 },
      { name: "Amazon", price: 38.00 },
    ],
  },
  {
    id: "vanicream-daily-facial",
    name: "Vanicream Daily Facial Moisturizer",
    brand: "Vanicream",
    category: "Facial Moisturizers",
    price: 15.99,
    score: 83,
    scoreLabel: "Real Deal",
    sentiment: 84,
    mentions: 389,
    platforms: {
      reddit: { sentiment: 94, mentions: 267, badge: "Reddit Darling", trend: "rising" },
      tiktok: { sentiment: 72, mentions: 345, badge: "Growing", trend: "rising" },
      youtube: { sentiment: 91, mentions: 34, badge: "Dermatologist Pick", trend: "stable" },
      instagram: { sentiment: 78, mentions: 189, badge: "Niche Favorite", trend: "stable" },
    },
    pros: [
      { icon: "🔬", title: "Dermatologist recommended", count: 234, detail: "Top pick for sensitive skin" },
      { icon: "🚫", title: "Free of common irritants", count: 198, detail: "No dyes, fragrance, or preservatives" },
    ],
    cons: [
      { icon: "🎨", title: "Plain packaging", count: 67, detail: "Looks medicinal, not exciting" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 15.99 },
      { name: "Target", price: 15.99 },
    ],
  },
];

export const autocompleteItems = [
  { text: "CeraVe Moisturizing Cream", type: "product" as const },
  { text: "The Ordinary Niacinamide Serum", type: "product" as const },
  { text: "Neutrogena Hydro Boost Water Gel", type: "product" as const },
  { text: "Cetaphil Daily Hydrating Lotion", type: "product" as const },
  { text: "best moisturizer for dry skin", type: "search" as const },
];

export const popularSearches = [
  { emoji: "🔥", label: "Viral Skincare" },
  { emoji: "💰", label: "Best Budget Tech" },
  { emoji: "👟", label: "Gym Shoes <$100" },
  { emoji: "🎧", label: "Headphones" },
  { emoji: "💄", label: "Makeup" },
];

export const recentSearches = [
  { query: "CeraVe Moisturizer", time: "2 hours ago" },
  { query: "Dyson Airwrap", time: "Yesterday" },
  { query: "Sony WH-1000XM5", time: "3 days ago" },
];
