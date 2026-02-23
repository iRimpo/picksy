"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

const EXAMPLE_QUERIES = [
  { text: "best moisturizer for dry sensitive skin" },
  { text: "best sunscreen for acne-prone skin" },
  { text: "gentle cleanser for oily skin under $15" },
  { text: "best shampoo for dandruff at Target" },
  { text: "body wash for sensitive skin" },
  { text: "fragrance-free moisturizer at Walmart" },
  { text: "best lip balm for very dry lips" },
  { text: "deodorant for sensitive skin" },
];


const POPULAR_SEARCHES = [
  { emoji: "🧴", label: "Moisturizer for dry skin" },
  { emoji: "☀️", label: "Sunscreen for acne-prone skin" },
  { emoji: "🫧", label: "Gentle cleanser <$15" },
  { emoji: "🧴", label: "Dandruff shampoo" },
  { emoji: "🧼", label: "Sensitive skin body wash" },
  { emoji: "🌿", label: "Fragrance-free deodorant" },
];


const RECENT_SEARCHES = [
  { query: "best moisturizer for dry skin", time: "2 hours ago" },
  { query: "shampoo at Target under $15", time: "Yesterday" },
  { query: "wireless headphones", time: "3 days ago" },
];

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
    </svg>
  );
}

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Staggered entrance
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filteredExamples = EXAMPLE_QUERIES.filter(
    (item) => query.length > 0 && item.text.toLowerCase().includes(query.toLowerCase())
  );

  const handleSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.trim()) {
        router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
      }
    },
    [router]
  );

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setShowAutocomplete(value.length > 0);
    }, 150);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowAutocomplete(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300);
  }, []);

  // Shared animation base
  const base = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

  return (
    <div className="min-h-screen bg-stone-50 relative overflow-hidden">
      {/* Subtle gradient blob */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full -z-10 pointer-events-none"
        style={{ background: "rgba(254,215,170,0.15)", filter: "blur(100px)" }}
      />

      {/* Header */}
      <header
        className={`relative z-10 flex items-center justify-between px-6 py-5 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <Link href="/" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft size={18} />
          <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}>
            P
          </div>
          <span className="font-bold text-stone-900 text-lg tracking-tight">Picksy</span>
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-12 md:pt-20 pb-20">

        {/* Reddit badge */}
        <div
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm mb-8 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "60ms" }}
        >
          <RedditIcon className="w-4 h-4 text-[#FF4500]" />
          <span className="text-sm font-medium text-stone-600">Powered by Reddit + Trustpilot reviews</span>
        </div>

        <h1
          className={`font-serif text-5xl md:text-6xl text-stone-900 text-center leading-tight mb-4 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}
          style={{ fontFamily: "var(--font-serif), Georgia, serif", transitionDelay: "120ms" }}
        >
          What are you <span className="italic text-stone-500">overthinking</span> today?
        </h1>

        <p
          className={`text-stone-500 text-lg mb-10 text-center max-w-md ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "180ms" }}
        >
          One search. One clear answer. No more 15-tab research marathons.
        </p>

        {/* Search bar */}
        <div
          className={`w-full max-w-[640px] relative ${base} ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{ transitionDelay: "240ms" }}
        >
          <div
            className={`flex items-center gap-3 bg-white border-2 rounded-full px-5 h-16 transition-all duration-300 shadow-sm ${
              isFocused
                ? "border-orange-500 shadow-orange-100 shadow-lg"
                : "border-stone-200"
            }`}
          >
            <Search size={20} className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-orange-500" : "text-stone-400"}`} />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Try: best moisturizer for dry skin under $20"
              className="flex-1 bg-transparent outline-none text-stone-900 placeholder-stone-400 text-base"
              aria-label="Search for products"
            />
            <button
              onClick={() => handleSearch(query)}
              disabled={!query.trim()}
              className="shrink-0 bg-stone-900 text-white px-5 py-2.5 rounded-full text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-stone-800 transition-all flex items-center gap-1.5 group active:scale-95"
            >
              Search
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Autocomplete */}
          {showAutocomplete && filteredExamples.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50 anim-plop"
            >
              {filteredExamples.slice(0, 5).map((item) => (
                <button
                  key={item.text}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors text-left border-b border-stone-50 last:border-0"
                  onMouseDown={(e) => { e.preventDefault(); handleSearch(item.text); }}
                >
                  <Search size={13} className="text-stone-400 shrink-0" />
                  <span className="text-stone-700 text-sm">{item.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Store tip */}
        <p
          className={`text-xs text-stone-400 mt-3 text-center ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "300ms" }}
        >
          Tip: Include a store name for local prices —{" "}
          <button
            onClick={() => handleSearch("best shampoo at Walmart")}
            className="text-orange-600 font-semibold hover:underline"
          >
            &ldquo;best shampoo at Walmart&rdquo;
          </button>
        </p>

        {/* Popular searches */}
        <div
          className={`mt-10 w-full max-w-[640px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "360ms" }}
        >
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-1">
            Popular right now
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {POPULAR_SEARCHES.map((item, i) => (
              <button
                key={item.label}
                onClick={() => handleSearch(item.label)}
                className={`flex items-center gap-1.5 px-4 py-2.5 bg-white border border-stone-200 rounded-full text-sm text-stone-600 font-medium transition-all hover:border-orange-300 hover:text-orange-700 hover:bg-orange-50 hover:-translate-y-0.5 active:scale-95 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
                style={{ transitionDelay: `${360 + i * 50}ms` }}
              >
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent searches */}
        <div
          className={`mt-10 w-full max-w-[640px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "660ms" }}
        >
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3 px-1">
            Recent searches
          </h3>
          <div className="space-y-1">
            {RECENT_SEARCHES.map((item, i) => (
              <button
                key={item.query}
                onClick={() => handleSearch(item.query)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:border hover:border-stone-200 hover:shadow-sm transition-all text-left group ${base} ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                style={{ transitionDelay: `${660 + i * 60}ms` }}
              >
                <Clock size={14} className="text-stone-300 shrink-0" />
                <span className="text-stone-600 text-sm flex-1 group-hover:text-stone-900 transition-colors">
                  {item.query}
                </span>
                <span className="text-stone-300 text-xs">{item.time}</span>
              </button>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
