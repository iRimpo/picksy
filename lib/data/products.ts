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
    id: "sony-wh1000xm5",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Headphones",
    price: 279.99,
    score: 95,
    scoreLabel: "Best Pick",
    sentiment: 94,
    mentions: 3841,
    badge: "Best Match",
    platforms: {
      reddit: { sentiment: 96, mentions: 1124, badge: "Expert Community", trend: "stable" },
      tiktok: { sentiment: 89, mentions: 2300, badge: "Viral Favorite", trend: "rising" },
      youtube: { sentiment: 97, mentions: 412, badge: "Expert Analysis", trend: "stable" },
      instagram: { sentiment: 91, mentions: 890, badge: "Visual Proof", trend: "stable" },
    },
    pros: [
      { icon: "🔇", title: "Industry-leading ANC", count: 1243, detail: "Best noise cancellation available — blocks out flights, offices, everything" },
      { icon: "🔋", title: "30-hour battery life", count: 987, detail: "All-day listening with fast charge support" },
      { icon: "🎵", title: "Exceptional sound quality", count: 876, detail: "Warm, detailed audio with excellent clarity" },
      { icon: "🪶", title: "Lightweight & comfortable", count: 743, detail: "Redesigned for extended wear without fatigue" },
      { icon: "📞", title: "Crystal-clear call quality", count: 612, detail: "4 beamforming mics for voice pickup" },
    ],
    cons: [
      { icon: "💸", title: "Premium price tag", count: 567, detail: "Expensive compared to solid budget alternatives" },
      { icon: "📦", title: "No IP rating", count: 234, detail: "Not water or sweat resistant" },
      { icon: "🔌", title: "No 3.5mm when powered off", count: 189, detail: "Passive mode requires power" },
    ],
    claims: [
      {
        claim: "Best noise cancellation on the market",
        testedBy: 89,
        confirmed: 82,
        disputed: 7,
        verdict: "Confirmed",
        verdictColor: "green",
        reality: "Consistently rated #1 ANC by reviewers and users",
        quotes: [
          { text: "Nothing touches these on a plane. Absolute silence.", author: "u/frequent_flyer", positive: true },
          { text: "Bose QC45 is comparable and often cheaper", author: "u/audiophile_deals", positive: false },
        ],
      },
      {
        claim: "30 hours of battery life",
        testedBy: 64,
        confirmed: 59,
        disputed: 5,
        verdict: "Confirmed",
        verdictColor: "green",
        reality: "Most users report 28–32 hours real-world use",
        quotes: [
          { text: "Went 4 days without charging at work from home", author: "u/wfh_setup", positive: true },
          { text: "ANC on reduces it a bit but still impressive", author: "u/batterylife_tester", positive: true },
        ],
      },
    ],
    transcripts: [
      {
        creator: "@mkbhd",
        followers: "18.2M",
        verified: true,
        authenticity: 97,
        sponsored: false,
        views: "4.1M",
        duration: "12:47",
        quotes: [
          "The noise cancellation is legitimately the best I've ever tested.",
          "Sony absolutely nailed the comfort on this revision.",
          "If you travel frequently, this is the easy answer.",
        ],
        sentimentScore: 95,
        sentimentLabel: "Very Positive",
        sentimentEmoji: "😊",
        aspects: [
          { name: "ANC", status: "positive" },
          { name: "Comfort", status: "positive" },
          { name: "Sound Quality", status: "positive" },
        ],
      },
      {
        creator: "@rtings_com",
        followers: "312K",
        verified: true,
        authenticity: 99,
        sponsored: false,
        views: "890K",
        duration: "8:23",
        quotes: [
          "Objective measurements confirm best-in-class noise attenuation.",
          "Slight treble emphasis but very balanced overall.",
          "Call quality ranks among the top we've measured.",
        ],
        sentimentScore: 91,
        sentimentLabel: "Very Positive",
        sentimentEmoji: "😊",
        aspects: [
          { name: "ANC", status: "positive" },
          { name: "Sound", status: "positive" },
          { name: "Mic Quality", status: "positive" },
        ],
      },
    ],
    retailers: [
      { name: "Amazon", price: 279.99 },
      { name: "Best Buy", price: 279.99 },
      { name: "Walmart", price: 269.00 },
    ],
  },
  {
    id: "apple-macbook-air-m3",
    name: "MacBook Air M3 (13-inch)",
    brand: "Apple",
    category: "Laptops",
    price: 1099.00,
    score: 93,
    scoreLabel: "Top Pick",
    sentiment: 92,
    mentions: 2756,
    badge: "Premium Pick",
    platforms: {
      reddit: { sentiment: 94, mentions: 987, badge: "Expert Favorite", trend: "stable" },
      tiktok: { sentiment: 88, mentions: 1450, badge: "Trending", trend: "rising" },
      youtube: { sentiment: 96, mentions: 678, badge: "Editor's Choice", trend: "stable" },
      instagram: { sentiment: 90, mentions: 445, badge: "Aesthetic Pick", trend: "stable" },
    },
    pros: [
      { icon: "⚡", title: "M3 chip is insanely fast", count: 987, detail: "Handles everything from browsing to light video editing effortlessly" },
      { icon: "🔋", title: "18-hour battery life", count: 876, detail: "Genuinely all-day — often more" },
      { icon: "🌡️", title: "Fanless — completely silent", count: 743, detail: "No fan means zero noise, ever" },
    ],
    cons: [
      { icon: "💸", title: "Expensive base storage", count: 567, detail: "256GB is tight; upgrading costs a lot" },
      { icon: "🔌", title: "Limited ports", count: 432, detail: "Only 2 USB-C ports on base model" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 1099.00 },
      { name: "Best Buy", price: 1099.00 },
      { name: "Walmart", price: 1079.00 },
    ],
  },
  {
    id: "samsung-galaxy-s25",
    name: "Samsung Galaxy S25",
    brand: "Samsung",
    category: "Smartphones",
    price: 799.99,
    score: 89,
    scoreLabel: "Strong Pick",
    sentiment: 88,
    mentions: 1987,
    badge: "Best Value",
    platforms: {
      reddit: { sentiment: 90, mentions: 754, badge: "Community Favorite", trend: "rising" },
      tiktok: { sentiment: 85, mentions: 2100, badge: "Viral", trend: "stable" },
      youtube: { sentiment: 92, mentions: 543, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 87, mentions: 678, badge: "Popular", trend: "stable" },
    },
    pros: [
      { icon: "📸", title: "Exceptional camera system", count: 876, detail: "200MP main sensor, stunning low-light performance" },
      { icon: "⚡", title: "Snapdragon 8 Elite performance", count: 743, detail: "Fastest Android chip available" },
    ],
    cons: [
      { icon: "🔋", title: "Battery could be bigger", count: 345, detail: "Heavy users may need a mid-day top-up" },
      { icon: "💸", title: "Premium pricing", count: 287, detail: "Base model is pricey; accessories add up" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 799.99 },
      { name: "Best Buy", price: 799.99 },
      { name: "Walmart", price: 779.00 },
    ],
  },
  {
    id: "lg-c4-oled-tv",
    name: "LG C4 OLED TV (55\")",
    brand: "LG",
    category: "TVs",
    price: 1296.99,
    score: 97,
    scoreLabel: "Best Pick",
    sentiment: 96,
    mentions: 1654,
    platforms: {
      reddit: { sentiment: 98, mentions: 743, badge: "Reddit's Choice", trend: "stable" },
      tiktok: { sentiment: 91, mentions: 987, badge: "Trending", trend: "stable" },
      youtube: { sentiment: 97, mentions: 432, badge: "Editor's Pick", trend: "stable" },
      instagram: { sentiment: 93, mentions: 312, badge: "Popular", trend: "stable" },
    },
    pros: [
      { icon: "🖤", title: "Perfect blacks from OLED", count: 987, detail: "Infinite contrast ratio — absolutely stunning" },
      { icon: "🎮", title: "Best gaming TV available", count: 876, detail: "120Hz, VRR, 1ms response time, 4 HDMI 2.1 ports" },
    ],
    cons: [
      { icon: "☀️", title: "Struggles in bright rooms", count: 345, detail: "OLED can't get as bright as QLED competitors" },
      { icon: "🔥", title: "Burn-in risk with static content", count: 234, detail: "Not ideal as a monitor or for static UI" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 1296.99 },
      { name: "Best Buy", price: 1296.99 },
      { name: "Walmart", price: 1249.00 },
    ],
  },
  {
    id: "logitech-mx-master-3s",
    name: "Logitech MX Master 3S",
    brand: "Logitech",
    category: "Mice",
    price: 99.99,
    score: 91,
    scoreLabel: "Best Pick",
    sentiment: 93,
    mentions: 1243,
    platforms: {
      reddit: { sentiment: 95, mentions: 567, badge: "r/MechanicalKeyboards Darling", trend: "stable" },
      tiktok: { sentiment: 87, mentions: 678, badge: "Viral", trend: "rising" },
      youtube: { sentiment: 94, mentions: 234, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 89, mentions: 312, badge: "Setup Favorite", trend: "stable" },
    },
    pros: [
      { icon: "🖱️", title: "Best scroll wheel ever made", count: 743, detail: "MagSpeed electromagnetic scroll is addictive" },
      { icon: "🤚", title: "Supremely ergonomic", count: 634, detail: "Perfect for long work sessions" },
    ],
    cons: [
      { icon: "💸", title: "Expensive for a mouse", count: 312, detail: "Hard to justify if you don't use it 8+ hours daily" },
      { icon: "📏", title: "Too large for small hands", count: 198, detail: "Designed for medium-large right hands only" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 99.99 },
      { name: "Best Buy", price: 99.99 },
      { name: "Target", price: 99.99 },
    ],
  },
  {
    id: "apple-airpods-pro-2",
    name: "Apple AirPods Pro (2nd Gen)",
    brand: "Apple",
    category: "Earbuds",
    price: 179.00,
    score: 90,
    scoreLabel: "Strong Pick",
    sentiment: 91,
    mentions: 2987,
    platforms: {
      reddit: { sentiment: 93, mentions: 1123, badge: "Apple Ecosystem Darling", trend: "stable" },
      tiktok: { sentiment: 88, mentions: 1890, badge: "Trending", trend: "rising" },
      youtube: { sentiment: 95, mentions: 534, badge: "Expert Pick", trend: "stable" },
      instagram: { sentiment: 89, mentions: 765, badge: "Aesthetic", trend: "stable" },
    },
    pros: [
      { icon: "🔇", title: "Excellent ANC for earbuds", count: 987, detail: "Best-in-class for in-ear noise cancellation" },
      { icon: "🍎", title: "Seamless Apple integration", count: 876, detail: "Auto-switch between iPhone, iPad, Mac is magic" },
    ],
    cons: [
      { icon: "🤖", title: "Android experience is limited", count: 543, detail: "Loses many features outside Apple ecosystem" },
      { icon: "💸", title: "Overpriced for non-Apple users", count: 432, detail: "Sony or Jabra offer better value for Android" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 179.00 },
      { name: "Best Buy", price: 179.00 },
      { name: "Target", price: 179.00 },
    ],
  },
  {
    id: "dell-s2722qc-monitor",
    name: "Dell S2722QC 27\" 4K Monitor",
    brand: "Dell",
    category: "Monitors",
    price: 349.99,
    score: 87,
    scoreLabel: "Strong Pick",
    sentiment: 88,
    mentions: 876,
    platforms: {
      reddit: { sentiment: 91, mentions: 345, badge: "Setup Darling", trend: "rising" },
      tiktok: { sentiment: 82, mentions: 456, badge: "Popular", trend: "stable" },
      youtube: { sentiment: 90, mentions: 178, badge: "Reviewed", trend: "stable" },
      instagram: { sentiment: 85, mentions: 234, badge: "Desk Setup Fave", trend: "stable" },
    },
    pros: [
      { icon: "🖥️", title: "Crisp 4K IPS display", count: 543, detail: "Gorgeous panel for work and media" },
      { icon: "🔌", title: "USB-C with 90W power delivery", count: 432, detail: "Single cable to power and connect a MacBook" },
    ],
    cons: [
      { icon: "🎮", title: "Not for gaming (60Hz)", count: 234, detail: "60Hz refresh rate is a dealbreaker for gamers" },
      { icon: "🌑", title: "IPS glow in dark scenes", count: 156, detail: "Typical IPS blooming in corner areas" },
    ],
    claims: [],
    transcripts: [],
    retailers: [
      { name: "Amazon", price: 349.99 },
      { name: "Best Buy", price: 349.99 },
      { name: "Walmart", price: 339.00 },
    ],
  },
];

export const autocompleteItems = [
  { text: "Sony WH-1000XM5 headphones", type: "product" as const },
  { text: "Apple MacBook Air M3", type: "product" as const },
  { text: "Samsung Galaxy S25", type: "product" as const },
  { text: "LG C4 OLED TV 55 inch", type: "product" as const },
  { text: "best wireless headphones for commuting", type: "search" as const },
];

export const popularSearches = [
  { emoji: "🎧", label: "Headphones" },
  { emoji: "💻", label: "Laptops" },
  { emoji: "📺", label: "Best 4K TV" },
  { emoji: "📱", label: "Smartphones" },
  { emoji: "🖥️", label: "Monitors" },
];

export const recentSearches = [
  { query: "Sony WH-1000XM5", time: "2 hours ago" },
  { query: "gaming laptop under $1000", time: "Yesterday" },
  { query: "best 4K TV for small room", time: "3 days ago" },
];
