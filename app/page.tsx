"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ChevronDown } from "lucide-react";
import { isVagueQuery } from "@/lib/query-decoder";
import { track } from "@/lib/analytics";
import { usePageView } from "@/lib/hooks/use-page-view";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

const CATEGORIES = [
  { emoji: "🎧", label: "Headphones", query: "best wireless headphones" },
  { emoji: "💻", label: "Laptops", query: "best laptop" },
  { emoji: "📺", label: "TVs", query: "best 4K TV" },
  { emoji: "📱", label: "Phones", query: "best smartphone" },
  { emoji: "🖥️", label: "Monitors", query: "best monitor" },
  { emoji: "🖱️", label: "Mice", query: "best wireless mouse" },
  { emoji: "⌨️", label: "Keyboards", query: "best mechanical keyboard" },
  { emoji: "🔊", label: "Speakers", query: "best Bluetooth speaker" },
];

const SUGGESTIONS = [
  "best wireless headphones for commuting...",
  "gaming laptop under $1000...",
  "best 4K TV for small room...",
  "noise cancelling earbuds under $200...",
  "best mechanical keyboard for typing...",
  "ultrawide monitor under $500...",
  "best budget smartphone under $400...",
  "wireless gaming mouse for large hands...",
];

const QUICK_FILLS = [
  { emoji: "🎧", label: "Headphones under $200", query: "best headphones under $200" },
  { emoji: "💻", label: "Laptop for college", query: "best laptop for college students" },
  { emoji: "📺", label: "4K TV for living room", query: "best 4K TV for living room" },
  { emoji: "🎮", label: "Gaming mouse", query: "best gaming mouse under $60" },
];

const WHY_PICKSY = [
  { from: "10 listicle articles", to: "1 clear winner", icon: "🏆" },
  { from: "Paid affiliate reviews", to: "Real Reddit voices", icon: "💬" },
  { from: "Hours of research", to: "60 seconds", icon: "⚡" },
];

const AVATAR_COLORS = ["#FF8FB3", "#4EADFF", "#FFD93D", "#B39DDB", "#2ECC71", "#FFA07A", "#87CEEB"];
const AVATAR_INITIALS = ["A", "J", "M", "R", "K", "S", "T"];

// ─── Result Preview Teaser ────────────────────────────────────────────────────

function ResultPreview() {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-white/15 border border-white/25 backdrop-blur-sm hover:bg-white/22 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <span className="text-lg">👀</span>
          <div className="text-left">
            <p className="text-white text-sm font-bold leading-tight">See an example result</p>
            <p className="text-white/45 text-xs">What Picksy gives you after searching</p>
          </div>
        </div>
        <ChevronDown
          size={16}
          className={`text-white/50 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>

      <div
        style={{
          maxHeight: open ? "500px" : "0px",
          overflow: "hidden",
          transition: "max-height 0.5s cubic-bezier(0.16,1,0.3,1)",
        }}
      >
        <div className="mt-2 rounded-2xl bg-white p-5 shadow-2xl">
          {/* Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#f0e6d3] text-[#7c4a1e] text-xs font-semibold rounded-full">
              🏆 Reddit&apos;s Top Pick
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#d8ede9] text-[#2d7a6a] text-xs font-semibold rounded-full">
              94/100 · Exceptional
            </span>
          </div>

          {/* Product */}
          <p className="text-stone-400 text-xs mb-0.5">Sony</p>
          <h3 className="font-black text-stone-900 text-xl mb-3 leading-tight">WH-1000XM5 Headphones</h3>

          {/* Community quote */}
          <div className="bg-[#1A1A2E] rounded-xl p-3.5 mb-3">
            <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-1.5">💬 Community Says</p>
            <p className="text-white/85 text-sm italic leading-relaxed">
              &ldquo;The noise cancellation completely shuts out the world. Best I&apos;ve ever used.&rdquo;
            </p>
            <p className="text-white/30 text-[10px] mt-1.5">r/headphones · ▲ 2.4k upvotes</p>
          </div>

          {/* Store + stats */}
          <div className="flex items-center gap-3">
            <div className="flex-1 bg-brand-green/10 border border-brand-green/30 rounded-xl px-4 py-2.5 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-stone-400 font-semibold">Best price</p>
                <p className="text-stone-900 font-black text-lg leading-tight">$279.99</p>
              </div>
              <span className="text-brand-green text-xs font-black">Buy →</span>
            </div>
            <div className="text-right">
              <p className="text-stone-900 font-bold text-sm">12,400 voices</p>
              <p className="text-brand-green text-xs font-semibold">89% positive</p>
            </div>
          </div>

          <p className="text-stone-300 text-[10px] mt-3 text-center">
            Based on 847+ Reddit threads · No affiliate links · Pure community data
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Home Page ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionVisible, setSuggestionVisible] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaded, setLoaded] = useState(false);

  usePageView("home");

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  // Cycle through animated placeholder suggestions
  useEffect(() => {
    if (isFocused || query) return;
    const interval = setInterval(() => {
      setSuggestionVisible(false);
      setTimeout(() => {
        setSuggestionIndex((i) => (i + 1) % SUGGESTIONS.length);
        setSuggestionVisible(true);
      }, 350);
    }, 3000);
    return () => clearInterval(interval);
  }, [isFocused, query]);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const finalQuery = searchQuery.trim();
      if (!finalQuery) return;
      track("search_submitted", { page: "home", query: finalQuery });
      if (isVagueQuery(finalQuery)) {
        track("refine_started", { page: "home", query: finalQuery });
        router.push(`/refine?q=${encodeURIComponent(finalQuery)}`);
      } else {
        router.push(`/results?q=${encodeURIComponent(finalQuery)}`);
      }
    },
    [router]
  );

  const base = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#2ECC71" }}>

      {/* Decorative floating shapes */}
      <div className="absolute top-16 left-8 w-20 h-20 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute top-32 right-12 w-14 h-14 rounded-full bg-white/15 animate-floatSlow pointer-events-none" />
      <div className="absolute top-1/2 left-4 w-10 h-10 rounded-full bg-brand-yellow/30 animate-floatDelay pointer-events-none" />
      <div className="absolute bottom-40 right-8 w-24 h-24 rounded-full bg-white/8 animate-float pointer-events-none" />
      <div className="absolute bottom-20 left-1/3 w-8 h-8 rounded-full bg-brand-pink/30 animate-floatDelay2 pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-6 h-6 rounded-full bg-white/20 animate-floatSlow pointer-events-none" />
      <svg className="absolute top-20 right-1/3 animate-spinSlow opacity-20 pointer-events-none" width="32" height="32" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>
      <svg className="absolute bottom-32 left-1/4 animate-spinSlow opacity-15 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>
      <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 animate-spinSlow opacity-10 pointer-events-none" width="48" height="48" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>

      {/* Header */}
      <header
        className={`relative z-10 flex items-center justify-between px-6 py-5 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <div className="flex items-center gap-2">
          <PicksyMascot size={28} />
          <span className="font-heading font-black text-white text-base">picksy</span>
        </div>
        <span className="text-white/50 text-xs font-medium">Powered by Reddit & TikTok</span>
      </header>

      <main className="relative z-10 flex flex-col items-center px-4 pt-2 pb-32">

        {/* ── Mascot + headline ── */}
        <div
          className={`flex flex-col items-center mb-7 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "40ms" }}
        >
          <PicksyMascot size={80} className="mb-4 drop-shadow-xl" />

          <h1 className="font-heading font-black text-4xl md:text-5xl text-white text-center leading-[1.1] drop-shadow mb-2">
            Skip the scroll.<br />Picksy decides.
          </h1>

          <p className="text-white/80 text-sm md:text-base font-medium text-center max-w-[360px] leading-snug mt-1">
            Stop digging through Reddit threads, TikTok reviews, and YouTube deep-dives. Picksy reads all of it and gives you one clear answer.
          </p>
          <p className="text-white/50 text-xs mt-2 font-semibold tracking-wide text-center">
            One winner &middot; A community score &middot; A direct buy link
          </p>
        </div>

        {/* ── Search area ── */}
        <div
          className={`w-full max-w-[620px] ${base} ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{ transitionDelay: "120ms" }}
        >
          {/* Label */}
          <p className="text-white font-black text-sm uppercase tracking-[0.15em] text-center mb-3">
            What are you shopping for?
          </p>

          {/* Bar */}
          <div
            className={`flex items-center gap-3 bg-white rounded-full px-5 h-[62px] transition-all duration-300 shadow-2xl ${
              isFocused ? "ring-4 ring-white/40" : ""
            }`}
          >
            <Search
              size={20}
              className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-brand-green" : "text-stone-400"}`}
            />
            <div className="flex-1 relative">
              {!query && !isFocused && (
                <span
                  className="absolute left-0 top-1/2 -translate-y-1/2 text-stone-400 text-base pointer-events-none select-none w-full truncate"
                  style={{
                    opacity: suggestionVisible ? 1 : 0,
                    transform: `translateY(-50%) translateY(${suggestionVisible ? 0 : 6}px)`,
                    transition: "opacity 0.35s ease, transform 0.35s ease",
                  }}
                >
                  {SUGGESTIONS[suggestionIndex]}
                </span>
              )}
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
                placeholder=""
                className="w-full bg-transparent outline-none text-stone-900 text-base relative z-10"
                aria-label="What are you shopping for?"
              />
            </div>
            {query.trim() && (
              <button
                onClick={() => handleSearch(query)}
                className="shrink-0 btn-gradient px-5 py-2 rounded-full text-sm flex items-center gap-1.5 group active:scale-95 font-bold"
              >
                Go
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Hint */}
          <p className="text-white/45 text-xs text-center mt-2.5 font-medium">
            Describe your situation — budget, use case, or just the product name
          </p>

          {/* Quick-fill chips */}
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {QUICK_FILLS.map((fill) => (
              <button
                key={fill.query}
                onClick={() => {
                  setQuery(fill.query);
                  track("quick_fill_click", { page: "home", properties: { label: fill.label } });
                  inputRef.current?.focus();
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-700 text-xs font-semibold shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-95"
              >
                <span className="text-sm">{fill.emoji}</span>
                {fill.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Why Picksy — differentiator strip ── */}
        <div
          className={`mt-9 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <p className="text-white/45 text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-3">
            Why Picksy?
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {WHY_PICKSY.map(({ from, to, icon }) => (
              <div
                key={to}
                className="rounded-2xl bg-white/15 border border-white/20 backdrop-blur-sm px-3 py-4 flex flex-col items-center text-center gap-1.5"
              >
                <span className="text-xl">{icon}</span>
                <p className="text-white/40 text-[10px] font-medium line-through leading-tight">{from}</p>
                <p className="text-white font-black text-xs leading-tight">{to}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Example result preview ── */}
        <div
          className={`mt-5 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "280ms" }}
        >
          <ResultPreview />
        </div>

        {/* ── Category pills ── */}
        <div
          className={`mt-8 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "340ms" }}
        >
          <p className="text-white/45 text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-3">
            Or browse a category
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => {
                  track("category_click", { page: "home", properties: { category: cat.label, query: cat.query } });
                  handleSearch(cat.query);
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/15 hover:bg-white/30 text-white font-semibold text-sm border border-white/20 hover:border-white/40 transition-all active:scale-95 ${base}`}
                style={{ transitionDelay: `${340 + i * 25}ms` }}
              >
                <span className="text-sm leading-none">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Community trust bar ── */}
        <div
          className={`mt-10 flex flex-col items-center gap-3 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "560ms" }}
        >
          <div className="flex -space-x-2.5">
            {AVATAR_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-9 h-9 rounded-full border-2 border-[#2ECC71] flex items-center justify-center text-white text-xs font-black shadow-sm"
                style={{ background: color }}
              >
                {AVATAR_INITIALS[i]}
              </div>
            ))}
          </div>
          <p className="text-white/80 text-sm font-semibold text-center">
            <span className="text-white font-black">15,000+</span> shoppers found their perfect pick
          </p>
          <p className="text-white/50 text-xs text-center">
            ✨ Powered by 12,000+ Reddit discussions & TikTok reviews
          </p>
        </div>

      </main>
    </div>
  );
}
