"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";
import { isVagueQuery } from "@/lib/query-decoder";
import { track } from "@/lib/analytics";
import { usePageView } from "@/lib/hooks/use-page-view";

const CATEGORIES = [
  { emoji: "💧", label: "Moisturizer", query: "best moisturizer" },
  { emoji: "✨", label: "Serum", query: "best serum" },
  { emoji: "🧼", label: "Face Wash", query: "best face wash" },
  { emoji: "☀️", label: "Sunscreen", query: "best sunscreen" },
  { emoji: "🌿", label: "Toner", query: "best toner" },
  { emoji: "👁️", label: "Eye Cream", query: "best eye cream" },
];

const BUDGET_OPTIONS = [
  { label: "Under $15", value: "15" },
  { label: "Under $25", value: "25" },
  { label: "Under $40", value: "40" },
  { label: "Any budget", value: "" },
];

const SKIN_TYPES = ["Dry", "Oily", "Combination", "Sensitive", "Normal"];
const CONCERNS = ["Acne", "Dryness", "Redness", "Dark Spots", "Dandruff"];

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

const RECENT_SEARCHES = [
  { query: "best moisturizer for dry skin", time: "2 hours ago" },
  { query: "shampoo at Target under $15", time: "Yesterday" },
  { query: "wireless headphones", time: "3 days ago" },
];

export default function SearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [skinType, setSkinType] = useState("");
  const [concern, setConcern] = useState("");
  const [budget, setBudget] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  usePageView("search");

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 60);
    return () => clearTimeout(t);
  }, []);

  const filteredExamples = EXAMPLE_QUERIES.filter(
    (item) => query.length > 0 && item.text.toLowerCase().includes(query.toLowerCase())
  );

  const buildSearchQuery = useCallback(
    (rawQuery: string) => {
      let finalQuery = rawQuery.trim();
      const lower = finalQuery.toLowerCase();
      if (skinType && !lower.includes(`${skinType} skin`)) {
        finalQuery += ` for ${skinType} skin`;
      }
      if (concern && !lower.includes(concern.toLowerCase())) {
        finalQuery += ` for ${concern}`;
      }
      if (budget && !/under\s*\$?\d+/i.test(finalQuery)) {
        finalQuery += ` under $${budget}`;
      }
      return finalQuery.trim();
    },
    [skinType, concern, budget]
  );

  const handleSearch = useCallback(
    (searchQuery: string) => {
      const finalQuery = buildSearchQuery(searchQuery);
      if (!finalQuery) return;
      track("search_submitted", {
        page: "search",
        query: finalQuery,
        properties: {
          raw_query: searchQuery,
          skin_type: skinType || null,
          concern: concern || null,
          budget: budget || null,
        },
      });
      if (isVagueQuery(finalQuery)) {
        track("refine_started", { page: "search", query: finalQuery });
        router.push(`/refine?q=${encodeURIComponent(finalQuery)}`);
      } else {
        router.push(`/results?q=${encodeURIComponent(finalQuery)}`);
      }
    },
    [router, buildSearchQuery, skinType, concern, budget]
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

  const base = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";

  const filterChip = (active: boolean) =>
    `px-3 py-1.5 rounded-full text-xs font-medium border transition-all active:scale-95 cursor-pointer ${
      active
        ? "bg-orange-500 text-white border-orange-500 shadow-sm"
        : "bg-white border-stone-200 text-stone-600 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
    }`;

  return (
    <div className="min-h-screen bg-[#f5f0ea] relative overflow-hidden">
      {/* Warm gradient bloom */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full -z-10 pointer-events-none"
        style={{ background: "rgba(254,215,170,0.22)", filter: "blur(120px)" }}
      />

      {/* Header */}
      <header
        className={`relative z-10 flex items-center px-6 py-5 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}`}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 text-stone-400 hover:text-stone-700 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={16} />
          Home
        </Link>
      </header>

      {/* Main */}
      <main className="relative z-10 flex flex-col items-center px-4 pt-2 pb-24">

        {/* Cursive wordmark */}
        <div
          className={`mb-7 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "40ms" }}
        >
          <span
            className="text-5xl text-[#5c2200]"
            style={{
              fontFamily: "var(--font-serif), Georgia, 'Times New Roman', serif",
              fontStyle: "italic",
              fontWeight: 700,
              letterSpacing: "-0.01em",
            }}
          >
            Picksy
          </span>
        </div>

        {/* Heading */}
        <h1
          className={`text-4xl md:text-5xl font-bold text-stone-900 text-center leading-tight mb-2 max-w-xl ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "100ms" }}
        >
          What are you{" "}
          <em className="not-italic text-stone-400">overthinking</em>{" "}
          today?
        </h1>

        <p
          className={`text-stone-500 text-base mb-8 text-center ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "160ms" }}
        >
          One search. One clear answer.
        </p>

        {/* Search bar */}
        <div
          className={`w-full max-w-[680px] relative ${base} ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}
          style={{ transitionDelay: "220ms" }}
        >
          <div
            className={`flex items-center gap-3 bg-white rounded-full px-5 h-[60px] transition-all duration-300 ${
              isFocused
                ? "shadow-[0_0_0_2px_theme(colors.orange.400)] shadow-orange-100"
                : "shadow-[0_1px_4px_rgba(0,0,0,0.08)] border border-stone-200"
            }`}
          >
            <Search
              size={20}
              className={`shrink-0 transition-colors duration-300 ${isFocused ? "text-orange-500" : "text-stone-400"}`}
            />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch(query)}
              placeholder="Search for a product..."
              className="flex-1 bg-transparent outline-none text-stone-900 placeholder-stone-400 text-base"
              aria-label="Search for products"
            />
            {query.trim() && (
              <button
                onClick={() => handleSearch(query)}
                className="shrink-0 bg-stone-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-stone-700 transition-all flex items-center gap-1.5 group active:scale-95"
              >
                Search
                <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </button>
            )}
          </div>

          {/* Autocomplete dropdown */}
          {showAutocomplete && filteredExamples.length > 0 && (
            <div
              ref={dropdownRef}
              className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-200 rounded-2xl shadow-xl overflow-hidden z-50"
            >
              {filteredExamples.slice(0, 5).map((item) => (
                <button
                  key={item.text}
                  className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-stone-50 transition-colors text-left border-b border-stone-100 last:border-0"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    handleSearch(item.text);
                  }}
                >
                  <Search size={13} className="text-stone-400 shrink-0" />
                  <span className="text-stone-700 text-sm">{item.text}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Skin type chips */}
        <div
          className={`w-full max-w-[680px] mt-3 flex items-center gap-2 flex-wrap ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "260ms" }}
        >
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0">
            Skin:
          </span>
          {SKIN_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => {
                const next = skinType === type.toLowerCase() ? "" : type.toLowerCase();
                setSkinType(next);
                track("filter_applied", {
                  page: "search",
                  properties: { filter_type: "skin_type", value: next || null },
                });
              }}
              className={filterChip(skinType === type.toLowerCase())}
            >
              {type}
            </button>
          ))}
          <span className="text-[11px] font-bold text-stone-400 uppercase tracking-wider shrink-0 ml-2">
            Concern:
          </span>
          {CONCERNS.map((c) => (
            <button
              key={c}
              onClick={() => {
                const next = concern === c.toLowerCase() ? "" : c.toLowerCase();
                setConcern(next);
                track("filter_applied", {
                  page: "search",
                  properties: { filter_type: "concern", value: next || null },
                });
              }}
              className={filterChip(concern === c.toLowerCase())}
            >
              {c}
            </button>
          ))}
        </div>

        {/* Store tip */}
        <p
          className={`text-[11px] text-stone-400 mt-2 w-full max-w-[680px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "280ms" }}
        >
          Tip: Include a store for local prices —{" "}
          <button
            onClick={() => handleSearch("best shampoo at Walmart")}
            className="text-orange-500 font-semibold hover:underline"
          >
            &ldquo;best shampoo at Walmart&rdquo;
          </button>
        </p>

        {/* Popular Categories */}
        <div
          className={`mt-10 w-full max-w-[680px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "320ms" }}
        >
          <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-4 text-center">
            Popular Categories
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {CATEGORIES.map((cat, i) => (
              <button
                key={cat.label}
                onClick={() => {
                  track("category_click", {
                    page: "search",
                    properties: { category: cat.label, query: cat.query },
                  });
                  handleSearch(cat.query);
                }}
                className={`flex flex-col items-center justify-center gap-2.5 py-6 bg-white border border-stone-200 rounded-2xl hover:border-orange-300 hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-95 ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                style={{ transitionDelay: `${320 + i * 40}ms` }}
              >
                <span className="text-3xl leading-none">{cat.emoji}</span>
                <span className="text-sm font-medium text-stone-700">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Budget */}
        <div
          className={`mt-8 w-full max-w-[680px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "560ms" }}
        >
          <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-4 text-center">
            Budget
          </h3>
          <div className="grid grid-cols-4 gap-3">
            {BUDGET_OPTIONS.map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  const next = opt.value === "" ? "" : budget === opt.value ? "" : opt.value;
                  setBudget(next);
                  track("filter_applied", {
                    page: "search",
                    properties: { filter_type: "budget", value: next || null },
                  });
                }}
                className={`py-3 rounded-2xl text-sm font-medium border transition-all active:scale-95 ${
                  (opt.value !== "" && budget === opt.value)
                    ? "bg-orange-500 text-white border-orange-500 shadow-sm"
                    : "bg-white border-stone-200 text-stone-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Recent searches */}
        <div
          className={`mt-10 w-full max-w-[680px] ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
          style={{ transitionDelay: "620ms" }}
        >
          <h3 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-3 px-1">
            Recent Searches
          </h3>
          <div className="space-y-0.5">
            {RECENT_SEARCHES.map((item, i) => (
              <button
                key={item.query}
                onClick={() => handleSearch(item.query)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white hover:shadow-sm transition-all text-left group ${base} ${loaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3"}`}
                style={{ transitionDelay: `${620 + i * 60}ms` }}
              >
                <Clock size={14} className="text-stone-300 shrink-0" />
                <span className="text-stone-500 text-sm flex-1 group-hover:text-stone-800 transition-colors">
                  {item.query}
                </span>
                <span className="text-stone-300 text-xs">{item.time}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer attribution */}
        <p
          className={`mt-12 text-sm text-stone-400 text-center ${base} ${loaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}
          style={{ transitionDelay: "780ms" }}
        >
          ✨ Powered by 12,000+ Reddit discussions &amp; Trustpilot reviews
        </p>
      </main>
    </div>
  );
}
