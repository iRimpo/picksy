"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
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

// ─── Platform logo SVGs ───────────────────────────────────────────────────────

function RedditLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="10" fill="#FF4500" />
      <circle cx="15.5" cy="4.5" r="1.6" fill="white" />
      <path d="M10 6.5 Q13 5 15.5 4.5" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <circle cx="7.2" cy="9.5" r="1.3" fill="white" />
      <circle cx="12.8" cy="9.5" r="1.3" fill="white" />
      <ellipse cx="7.2" cy="9.5" rx="0.6" ry="0.6" fill="#FF4500" />
      <ellipse cx="12.8" cy="9.5" rx="0.6" ry="0.6" fill="#FF4500" />
      <path d="M7.5 13 Q10 15 12.5 13" stroke="white" strokeWidth="1.1" fill="none" strokeLinecap="round" />
      <ellipse cx="5.5" cy="12" rx="2.1" ry="1.4" fill="rgba(255,255,255,0.15)" />
      <ellipse cx="14.5" cy="12" rx="2.1" ry="1.4" fill="rgba(255,255,255,0.15)" />
    </svg>
  );
}

function TikTokLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#000" />
      <path d="M36 14c-3.3 0-6-2.7-6-6h-5v21c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.5 0 .9.1 1.3.2v-5.3c-.4-.1-.8-.1-1.3-.1-4.9 0-9 4.1-9 9s4.1 9 9 9 9-4.1 9-9V18.2c1.9 1.1 4 1.8 6.3 1.8V14H36z" fill="#69C9D0" />
      <path d="M38 14c-3.3 0-6-2.7-6-6h-5v21c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.5 0 .9.1 1.3.2v-5.3c-.4-.1-.8-.1-1.3-.1-4.9 0-9 4.1-9 9s4.1 9 9 9 9-4.1 9-9V18.2c1.9 1.1 4 1.8 6.3 1.8V14H38z" fill="#EE1D52" />
      <path d="M37 14c-3.3 0-6-2.7-6-6h-5v21c0 2.2-1.8 4-4 4s-4-1.8-4-4 1.8-4 4-4c.5 0 .9.1 1.3.2v-5.3c-.4-.1-.8-.1-1.3-.1-4.9 0-9 4.1-9 9s4.1 9 9 9 9-4.1 9-9V18.2c1.9 1.1 4 1.8 6.3 1.8V14H37z" fill="white" />
    </svg>
  );
}

function YouTubeLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
      <rect width="48" height="48" rx="10" fill="#FF0000" />
      <path d="M38.9 18.3A4.5 4.5 0 0 0 35.7 15C33.1 14 24 14 24 14s-9.1 0-11.7.9a4.5 4.5 0 0 0-3.2 3.3C8.2 20.9 8 24 8 24s.2 3.1 1.1 5.7A4.5 4.5 0 0 0 12.3 33c2.6.9 11.7.9 11.7.9s9.1 0 11.7-.9a4.5 4.5 0 0 0 3.2-3.3C39.8 27.1 40 24 40 24s-.2-3.1-1.1-5.7z" fill="white" />
      <polygon points="21,18 21,30 31,24" fill="#FF0000" />
    </svg>
  );
}

// ─── How Picksy Works pipeline ────────────────────────────────────────────────

function HowItWorks() {
  return (
    <div className="w-full max-w-[620px]">
      <p className="text-white/45 text-[10px] font-bold uppercase tracking-[0.18em] text-center mb-4">
        How Picksy works
      </p>

      <div className="rounded-3xl bg-white/10 border border-white/20 backdrop-blur-sm px-5 py-5">
        <div className="flex items-center gap-0">

          {/* ── Source pills ── */}
          <div className="flex flex-col gap-2 flex-shrink-0 w-[126px]">
            {/* Reddit — LIVE */}
            <div className="flex items-center gap-2 bg-[rgba(255,69,0,0.18)] border border-[rgba(255,69,0,0.45)] rounded-2xl px-2.5 py-2">
              <RedditLogo size={20} />
              <span className="font-bold text-[rgba(255,170,130,0.95)] text-[11px] flex-1">Reddit</span>
              <span className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0 shadow-[0_0_6px_rgba(74,222,128,0.7)]" title="Live" />
            </div>
            {/* TikTok — BETA */}
            <div className="flex items-center gap-2 bg-black/40 border border-[rgba(105,201,208,0.45)] rounded-2xl px-2.5 py-2">
              <TikTokLogo size={20} />
              <span className="font-bold text-[rgba(105,201,208,0.95)] text-[11px] flex-1">TikTok</span>
              <span className="text-[8px] font-black text-yellow-300 flex-shrink-0 tracking-wide">BETA</span>
            </div>
            {/* YouTube — SOON */}
            <div className="flex items-center gap-2 bg-white/5 border border-white/12 rounded-2xl px-2.5 py-2 opacity-50">
              <YouTubeLogo size={20} />
              <span className="font-bold text-white/55 text-[11px] flex-1">YouTube</span>
              <span className="text-[8px] font-black text-white/35 flex-shrink-0 tracking-wide">SOON</span>
            </div>
          </div>

          {/* ── Arrow 1 ── */}
          <div className="flex-1 flex flex-col items-center gap-1.5 px-1 min-w-0">
            <span className="text-white/35 text-[9px] font-bold text-center leading-tight whitespace-nowrap">reads posts</span>
            <div className="relative w-full flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/30 to-white/20" />
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                <path d="M0 5 L8 5 M5 1 L9 5 L5 9" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ── Picksy brain ── */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div
              className="w-[68px] h-[68px] rounded-full flex items-center justify-center"
              style={{
                background: "rgba(26,26,46,0.7)",
                border: "2.5px solid rgba(255,255,255,0.22)",
                boxShadow: "0 0 28px rgba(255,255,255,0.1), inset 0 0 12px rgba(255,255,255,0.04)",
              }}
            >
              <PicksyMascot size={44} />
            </div>
            <span className="text-white/50 text-[9px] font-bold text-center">AI weighs signal</span>
          </div>

          {/* ── Arrow 2 ── */}
          <div className="flex-1 flex flex-col items-center gap-1.5 px-1 min-w-0">
            <span className="text-white/35 text-[9px] font-bold text-center leading-tight whitespace-nowrap">~10 secs</span>
            <div className="relative w-full flex items-center">
              <div className="flex-1 h-px bg-gradient-to-r from-white/25 via-white/35 to-transparent" />
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none" className="flex-shrink-0">
                <path d="M0 5 L8 5 M5 1 L9 5 L5 9" stroke="rgba(255,255,255,0.55)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </div>

          {/* ── One Pick ── */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
            <div
              className="w-[68px] h-[68px] rounded-[18px] flex flex-col items-center justify-center gap-1"
              style={{
                background: "rgba(26,26,46,0.85)",
                border: "2.5px solid #FFD93D",
                boxShadow: "0 0 22px rgba(255,217,61,0.25)",
              }}
            >
              <span className="text-2xl leading-none">🏆</span>
              <span className="font-black text-[10px] text-[#FFD93D] leading-tight text-center">One Pick</span>
            </div>
            <span className="text-white/50 text-[9px] font-bold text-center">+ live prices</span>
          </div>

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
      <div className="absolute bottom-40 right-8 w-24 h-24 rounded-full bg-white/8 animate-float pointer-events-none" />
      <svg className="absolute top-20 right-1/3 animate-spinSlow opacity-20 pointer-events-none" width="32" height="32" viewBox="0 0 32 32" fill="none">
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

        {/* ── How Picksy Works pipeline ── */}
        <div
          className={`mt-7 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "180ms" }}
        >
          <HowItWorks />
        </div>

        {/* ── Category pills ── */}
        <div
          className={`mt-8 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "400ms" }}
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
                style={{ transitionDelay: `${400 + i * 25}ms` }}
              >
                <span className="text-sm leading-none">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>


      </main>
    </div>
  );
}
