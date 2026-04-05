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

const HOW_IT_WORKS = [
  { icon: "🔍", text: "Scans Reddit & TikTok" },
  { icon: "🧠", text: "Weighs real opinions" },
  { icon: "✅", text: "One clear pick" },
];

const AVATAR_COLORS = ["#FF8FB3", "#4EADFF", "#FFD93D", "#B39DDB", "#2ECC71", "#FFA07A", "#87CEEB"];
const AVATAR_INITIALS = ["A", "J", "M", "R", "K", "S", "T"];

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

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-4 pb-32">

        {/* Mascot + wordmark + tagline */}
        <div
          className={`flex flex-col items-center mb-8 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "40ms" }}
        >
          <PicksyMascot size={96} className="mb-3 drop-shadow-xl" />
          <span className="font-heading font-black text-4xl text-white tracking-tight drop-shadow">
            picksy
          </span>
          <p className="text-white font-black text-base mt-2 text-center leading-snug">
            Reddit & TikTok pick the winner.
          </p>
          <p className="text-white/70 text-sm mt-0.5 font-medium text-center">
            You get one clear answer.
          </p>
        </div>

        {/* Search bar */}
        <div
          className={`w-full max-w-[620px] relative ${base} ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{ transitionDelay: "120ms" }}
        >
          <div
            className={`flex items-center gap-3 bg-white rounded-full px-5 h-[62px] transition-all duration-300 shadow-2xl ${
              isFocused ? "ring-4 ring-white/40" : ""
            }`}
          >
            <Search
              size={20}
              className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-brand-green" : "text-stone-400"}`}
            />
            {/* Animated placeholder overlay */}
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
                aria-label="Search for electronics"
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
        </div>

        {/* How it works — 3-step strip */}
        <div
          className={`mt-5 flex items-center gap-1 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "180ms" }}
        >
          {HOW_IT_WORKS.map((step, i) => (
            <div key={step.text} className="flex items-center gap-1">
              <div className="flex items-center gap-1.5 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-3.5 py-1.5">
                <span className="text-sm leading-none">{step.icon}</span>
                <span className="text-white text-xs font-semibold whitespace-nowrap">{step.text}</span>
              </div>
              {i < HOW_IT_WORKS.length - 1 && (
                <span className="text-white/30 text-xs mx-0.5">→</span>
              )}
            </div>
          ))}
        </div>

        {/* Category pills */}
        <div
          className={`mt-8 w-full max-w-[620px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "260ms" }}
        >
          <p className="text-white/60 text-xs font-bold uppercase tracking-widest text-center mb-3">
            Popular categories
          </p>
          <div className="flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => {
                  track("category_click", { page: "home", properties: { category: cat.label, query: cat.query } });
                  handleSearch(cat.query);
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/20 hover:bg-white/35 text-white font-semibold text-sm border border-white/20 hover:border-white/40 transition-all active:scale-95 ${base}`}
                style={{ transitionDelay: `${260 + i * 30}ms` }}
              >
                <span className="text-base leading-none">{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Community trust bar */}
        <div
          className={`mt-12 flex flex-col items-center gap-3 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "540ms" }}
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
