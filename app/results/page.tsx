"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, ArrowLeft, ExternalLink, MapPin, AlertCircle, X,
  Loader2, Bookmark, Share2, RotateCcw, MessageCircle, FileText,
  TrendingUp, Users, BarChart2, ThumbsUp, ThumbsDown, ChevronDown,
} from "lucide-react";
import { track } from "@/lib/analytics";
import { usePageView } from "@/lib/hooks/use-page-view";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuyLink { store: string; price: number }
interface Winner {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  price: number;
  storePrice?: number;
  storeName?: string;
  inStock?: boolean;
  valueScore?: number;
  score: number;
  scoreLabel: string;
  sentiment: number;
  mentions: number;
  postsAnalyzed: number;
  whyItWon: string;
  pros: string[];
  cons: string[];
  buyLinks: BuyLink[];
  redditQuote?: string;
}
interface Alternative {
  id: string;
  name: string;
  brand: string;
  emoji: string;
  score: number;
  price: number;
  mentions: number;
  sentiment: number;
  whyNotWinner: string;
}
interface AnalysisMeta {
  query: string;
  category: string;
  store: string | null;
  budget: number | null;
  subreddits: string[];
  postsAnalyzed: number;
  mode: "general" | "store-specific";
  analysisTimeMs: number;
}
interface AnalysisResult { winner: Winner; alternatives: Alternative[]; meta: AnalysisMeta }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageTitle(category: string, query: string): string {
  const src = (category || query).toLowerCase();
  const map: Record<string, string> = {
    serum: "Top Serums", serums: "Top Serums",
    moisturizer: "Top Moisturizers", moisturizers: "Top Moisturizers",
    cleanser: "Top Cleansers", "face wash": "Top Face Washes",
    sunscreen: "Top Sunscreens", toner: "Top Toners", toners: "Top Toners",
    shampoo: "Top Shampoos", conditioner: "Top Conditioners",
    "eye cream": "Top Eye Creams", deodorant: "Top Deodorants",
    "lip balm": "Top Lip Balms", "body wash": "Top Body Washes",
    headphones: "Top Headphones",
  };
  for (const [key, title] of Object.entries(map)) {
    if (src.includes(key)) return title;
  }
  const cat = category
    ? category.charAt(0).toUpperCase() + category.slice(1).toLowerCase()
    : null;
  return cat ? `Top ${cat}s` : "Top Picks";
}

function getScoreBadgeLabel(score: number, scoreLabel: string): string {
  if (scoreLabel) return scoreLabel;
  if (score >= 90) return "Reddit's Choice";
  if (score >= 80) return "Highly Rated";
  if (score >= 70) return "Well Reviewed";
  return "Community Pick";
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ query }: { query: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Searching Reddit and Trustpilot reviews...",
    "Analyzing 143 posts...",
    "Extracting product mentions...",
    "Calculating scores...",
  ];
  const stepsLength = steps.length;

  useEffect(() => {
    const progressTimer = setInterval(() => {
      setProgress((p) => Math.min(p + 2, 95));
    }, 50);
    const stepTimer = setInterval(() => {
      setStep((s) => Math.min(s + 1, stepsLength - 1));
    }, 600);
    return () => { clearInterval(progressTimer); clearInterval(stepTimer); };
  }, [stepsLength]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-16 h-16 rounded-full bg-[#FF4500] flex items-center justify-center mb-6 animate-pulse">
        <svg viewBox="0 0 20 20" className="w-9 h-9 fill-white">
          <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
        </svg>
      </div>
      <h2 className="text-xl font-black text-stone-900 mb-2">Analyzing Reddit + Trustpilot</h2>
      <p className="text-stone-500 text-sm mb-8 text-center max-w-xs">
        Finding the best <span className="font-semibold text-stone-700">{query}</span> based on Reddit discussions and Trustpilot reviews
      </p>
      <div className="w-full max-w-sm mb-4">
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%`, backgroundColor: "#ea580c" }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-stone-400">{steps[step]}</span>
          <span className="text-xs text-stone-400">{progress}%</span>
        </div>
      </div>
      <div className="flex gap-3 mt-4">
        {steps.map((_, i) => (
          <div key={i} className={`w-2 h-2 rounded-full transition-all ${i <= step ? "bg-orange-600" : "bg-stone-200"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── Location Modal ────────────────────────────────────────────────────────────

function LocationModal({ store, onConfirm, onSkip }: {
  store: string;
  onConfirm: (zip: string) => void;
  onSkip: () => void;
}) {
  const [zip, setZip] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState("");

  const handleAutoDetect = () => {
    setDetecting(true);
    setError("");
    if (!navigator.geolocation) {
      setError("Geolocation not supported. Please enter your ZIP code.");
      setDetecting(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => { onConfirm("94102"); },
      () => { setError("Location access denied. Please enter your ZIP code."); setDetecting(false); },
      { timeout: 8000 }
    );
  };

  const handleZipSubmit = () => {
    if (zip.length !== 5 || !/^\d+$/.test(zip)) {
      setError("Please enter a valid 5-digit ZIP code.");
      return;
    }
    onConfirm(zip);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl animate-scaleIn">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">🏪</div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Shopping at</p>
            <p className="text-lg font-black text-stone-900">{store}</p>
          </div>
        </div>
        <h3 className="text-xl font-black text-stone-900 mb-1.5">Where are you shopping?</h3>
        <p className="text-sm text-stone-500 mb-6">We&apos;ll find {store} locations near you and show prices available there.</p>
        <button
          onClick={handleAutoDetect}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-orange-500 text-orange-600 font-bold text-sm mb-3 hover:bg-orange-50/60 transition-colors disabled:opacity-60"
        >
          {detecting ? <><Loader2 size={16} className="animate-spin" /> Detecting location...</> : <><MapPin size={16} /> Use My Location</>}
        </button>
        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>
        <div className="flex gap-2 mb-3">
          <input
            type="text" inputMode="numeric" maxLength={5} value={zip}
            onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
            placeholder="Enter ZIP code"
            className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-colors"
          />
          <button onClick={handleZipSubmit} className="px-4 py-3 bg-orange-600 hover:bg-orange-700 transition text-white rounded-xl text-sm font-bold">Go</button>
        </div>
        {error && <p className="text-xs text-red-500 flex items-center gap-1 mb-3"><AlertCircle size={12} /> {error}</p>}
        <button onClick={onSkip} className="w-full text-sm text-stone-400 hover:text-stone-600 py-2 transition-colors">
          Skip — show general results instead
        </button>
      </div>
    </div>
  );
}

// ─── Store Selector ────────────────────────────────────────────────────────────

interface StoreLocation { id: string; name: string; address: string; city: string; state: string; distance: number }

function StoreSelector({ stores, onSelect }: { stores: StoreLocation[]; onSelect: (store: StoreLocation) => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 shadow-2xl">
        <h3 className="text-lg font-black text-stone-900 mb-1">Choose a store</h3>
        <p className="text-sm text-stone-500 mb-5">Sorted by distance from you</p>
        <div className="space-y-2">
          {stores.map((store) => (
            <button
              key={store.id}
              onClick={() => onSelect(store)}
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-stone-100 hover:border-orange-500 hover:bg-orange-50/60 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center shrink-0 text-lg">📍</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-stone-900 group-hover:text-orange-600">{store.name}</p>
                <p className="text-xs text-stone-400">{store.address}, {store.city}</p>
              </div>
              <span className="text-xs text-stone-400 shrink-0">{store.distance} mi</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Winner Card ───────────────────────────────────────────────────────────────

function WinnerCard({ winner, meta, imageUrl }: { winner: Winner; meta: AnalysisMeta; imageUrl: string | null }) {
  const [imgError, setImgError] = useState(false);
  const lowestPrice = winner.buyLinks.length > 0
    ? Math.min(...winner.buyLinks.map((l) => l.price))
    : winner.price;
  const pageTitle = getPageTitle(meta.category, meta.query);

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page title */}
      <h2 className="text-2xl font-bold text-stone-900 mb-4">{pageTitle}</h2>

      {/* Badges + actions row */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f0e6d3] text-[#7c4a1e] text-xs font-semibold rounded-full">
            🏆 Reddit&apos;s Top Pick
          </span>
          <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#d8ede9] text-[#2d7a6a] text-xs font-semibold rounded-full">
            {winner.score}/100 · {getScoreBadgeLabel(winner.score, winner.scoreLabel)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button className="text-stone-400 hover:text-stone-700 transition-colors" aria-label="Save"><Bookmark size={18} /></button>
          <button className="text-stone-400 hover:text-stone-700 transition-colors" aria-label="Share"><Share2 size={18} /></button>
          <button className="text-stone-400 hover:text-stone-700 transition-colors" aria-label="Refresh"><RotateCcw size={18} /></button>
        </div>
      </div>

      {/* Brand + product name */}
      <p className="text-stone-400 text-sm mb-1">{winner.brand}</p>
      <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mb-6 leading-tight">{winner.name}</h1>

      {/* Two-column: image left, info right */}
      <div className="grid grid-cols-1 md:grid-cols-[380px_1fr] gap-8 mb-10">

        {/* Left: image + thumbnails */}
        <div>
          <div className="w-full aspect-square rounded-2xl bg-white border border-stone-100 overflow-hidden flex items-center justify-center">
            {imageUrl && !imgError ? (
              <img
                src={imageUrl}
                alt={winner.name}
                className="w-full h-full object-contain p-4"
                onError={() => setImgError(true)}
              />
            ) : imageUrl === null ? (
              /* Pulse skeleton while image is loading */
              <div className="w-full h-full bg-stone-100 animate-pulse rounded-2xl" />
            ) : (
              <span className="text-8xl">{winner.emoji}</span>
            )}
          </div>
          <div className="flex gap-2 mt-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-[72px] h-[72px] rounded-xl bg-white border overflow-hidden flex items-center justify-center cursor-pointer transition-colors ${
                  i === 0 ? "border-orange-400 shadow-sm" : "border-stone-200 hover:border-stone-300"
                }`}
              >
                {imageUrl && !imgError ? (
                  <img src={imageUrl} alt="" className="w-full h-full object-contain p-1" aria-hidden />
                ) : (
                  <span className="text-2xl">{winner.emoji}</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: price, stores, why it won */}
        <div className="flex flex-col">

          {/* Price */}
          <p className="text-4xl font-bold text-stone-900 mb-4">
            ${(winner.storePrice ?? winner.price).toFixed(2)}
          </p>

          {/* Store cards */}
          <p className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            🛒 Where to Buy
          </p>
          <div className="grid grid-cols-3 gap-2 mb-6">
            {winner.buyLinks.slice(0, 3).map((link) => {
              const isBest = link.price === lowestPrice;
              return (
                <button
                  key={link.store}
                  onClick={() =>
                    track("buy_click", {
                      page: "results",
                      query: meta.query,
                      product_name: winner.name,
                      store_name: link.store,
                      price: link.price,
                      score: winner.score,
                      properties: { position: "top_pick" },
                    })
                  }
                  className={`relative rounded-xl border p-3 flex items-center gap-2 hover:shadow-md transition-all text-left group ${
                    isBest
                      ? "border-teal-200 bg-teal-50/60 hover:border-teal-300"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 bg-teal-500 text-white rounded-full whitespace-nowrap">
                      Best Price
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {link.store[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-600 truncate">{link.store}</p>
                    <p className={`text-sm font-bold leading-tight ${isBest ? "text-teal-600" : "text-stone-900"}`}>
                      ${link.price.toFixed(2)}
                    </p>
                  </div>
                  <ExternalLink size={12} className="text-stone-400 shrink-0 group-hover:text-stone-600 transition-colors" />
                </button>
              );
            })}
          </div>

          {/* Why This Won */}
          <div className="mb-5">
            <h3 className="text-base font-semibold text-stone-900 mb-2 flex items-center gap-1.5">
              ✨ Why This Won
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">{winner.whyItWon}</p>
          </div>

          <p className="text-xs text-stone-400 flex items-center gap-1.5 mt-auto">
            <FileText size={12} className="shrink-0" />
            Based on {winner.postsAnalyzed}+ Reddit discussions and verified review sources.
          </p>
        </div>
      </div>

      {/* Pros & Cons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mb-8">
        <div>
          <h4 className="text-base font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <ThumbsUp size={15} className="text-stone-400" /> Pros
          </h4>
          <ul className="space-y-3">
            {winner.pros.map((pro, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-stone-700">
                <span className="w-5 h-5 rounded-full border-2 border-teal-400 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-teal-400" />
                </span>
                {pro}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-base font-semibold text-stone-800 mb-4 flex items-center gap-2">
            <ThumbsDown size={15} className="text-stone-400" /> Cons
          </h4>
          <ul className="space-y-3">
            {winner.cons.map((con, i) => (
              <li key={i} className="flex items-center gap-2.5 text-sm text-stone-700">
                <span className="w-5 h-5 rounded-full border-2 border-orange-300 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-orange-300" />
                </span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-[#e8f4f1] rounded-2xl px-6 py-5 flex flex-wrap gap-6 mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-teal-600 shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.sentiment}%</span>
          <span className="text-sm text-stone-500">positive sentiment</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-teal-600 shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.mentions.toLocaleString()}</span>
          <span className="text-sm text-stone-500">mentions</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-teal-600 shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.postsAnalyzed}+</span>
          <span className="text-sm text-stone-500">posts analyzed</span>
        </div>
      </div>

      {/* Top Quotes */}
      {winner.redditQuote && (
        <div className="mb-8">
          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <MessageCircle size={13} /> Top Quotes
          </h4>
          <div className="space-y-3">
            <blockquote className="border-l-2 border-stone-300 pl-4 text-sm text-stone-600 italic leading-relaxed">
              {winner.redditQuote}
            </blockquote>
          </div>
        </div>
      )}

      {/* Data Sources */}
      <div className="flex items-center gap-2 flex-wrap text-xs text-stone-400 mb-1">
        <span className="flex items-center gap-1 shrink-0">
          <span className="w-3.5 h-3.5 rounded-full border border-stone-300 inline-flex items-center justify-center text-[8px]">○</span>
          Data Sources:
        </span>
        {meta.subreddits.slice(0, 4).map((s) => (
          <span key={s} className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full font-medium">
            r/{s}
          </span>
        ))}
        <span className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full font-medium">Trustpilot</span>
        <span className="text-stone-400">· {winner.postsAnalyzed}+ posts analyzed</span>
      </div>
    </div>
  );
}

// ─── Alternatives Section ──────────────────────────────────────────────────────

function AlternativesSection({ alternatives, query }: { alternatives: Alternative[]; query: string }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="max-w-4xl mx-auto mt-4 mb-12">
      <button
        onClick={() => {
          if (!expanded) {
            track("alternatives_expanded", {
              page: "results",
              query,
              properties: { count: alternatives.length },
            });
          }
          setExpanded(!expanded);
        }}
        className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-stone-200 hover:border-stone-300 transition-all shadow-sm"
      >
        <div className="text-left">
          <p className="font-semibold text-stone-800 text-sm">Other Options</p>
          <p className="text-xs text-stone-400">{alternatives.length} alternative{alternatives.length !== 1 ? "s" : ""}</p>
        </div>
        <ChevronDown size={18} className={`text-stone-400 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3">
          {alternatives.map((alt) => (
            <div key={alt.id} className="bg-white rounded-2xl border border-stone-200 p-5">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center text-3xl shrink-0">
                  {alt.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-stone-400 mb-0.5">{alt.brand}</p>
                  <p className="font-semibold text-stone-900 text-sm leading-tight">{alt.name}</p>
                  <p className="text-xs text-stone-500 mt-1">{alt.sentiment}% positive · {alt.mentions} mentions</p>
                  <p className="text-xs text-stone-400 italic mt-1">{alt.whyNotWinner}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-stone-900">${alt.price.toFixed(2)}</p>
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                    alt.score >= 80 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                  }`}>
                    {alt.score}/100
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Error State ───────────────────────────────────────────────────────────────

function ErrorState({ query, onRetry }: { query: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-xl font-black text-stone-900 mb-2">Couldn&apos;t find results</h2>
      <p className="text-stone-500 text-sm mb-6 max-w-xs">
        We couldn&apos;t find Reddit discussions for &ldquo;{query}&rdquo;. Try rephrasing or being more specific.
      </p>
      <button onClick={onRetry} className="bg-stone-900 hover:bg-stone-800 transition px-6 py-3 rounded-xl font-bold text-white text-sm">
        Try Again
      </button>
    </div>
  );
}

// ─── Main Results Content ──────────────────────────────────────────────────────

type FlowState = "loading" | "location-prompt" | "store-selection" | "result" | "error";

function ResultsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const storeParam = searchParams.get("store") || "";
  const zipParam = searchParams.get("zip") || "";
  const preferencesParam = searchParams.get("preferences") || "";

  usePageView("results", { query });

  const [flowState, setFlowState] = useState<FlowState>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [storeContext, setStoreContext] = useState(storeParam);

  const STORE_NAMES = ["Walmart", "Target", "CVS", "Walgreens", "Ulta", "Sephora", "Amazon"];
  function detectStoreInQuery(q: string): string | null {
    const lower = q.toLowerCase();
    for (const s of STORE_NAMES) {
      if (lower.includes(s.toLowerCase())) return s;
    }
    return null;
  }

  const detectedStore = detectStoreInQuery(query);

  async function runAnalysis(overrideStore?: string) {
    setFlowState("loading");
    try {
      const preferences = preferencesParam
        ? JSON.parse(decodeURIComponent(preferencesParam))
        : null;
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query,
          store: overrideStore || storeParam || null,
          ...(preferences ? { preferences } : {}),
        }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setFlowState("result");
      track("search_result_viewed", {
        page: "results",
        query,
        product_name: data.winner.name,
        score: data.winner.score,
        properties: {
          brand: data.winner.brand,
          price: data.winner.price,
          sentiment: data.winner.sentiment,
          alternatives_count: data.alternatives.length,
          analysis_time_ms: data.meta.analysisTimeMs,
        },
      });
    } catch {
      setFlowState("error");
    }
  }

  async function fetchNearbyStores(chain: string) {
    try {
      const res = await fetch("/api/stores/nearby", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ store_chain: chain }),
      });
      const data = await res.json();
      setStores(data.stores || []);
    } catch {
      setStores([]);
    }
  }

  // Fetch product image once we have a winner
  useEffect(() => {
    if (!result?.winner) return;
    setProductImageUrl(null); // reset / show skeleton
    const q = encodeURIComponent(`${result.winner.brand} ${result.winner.name} product`);
    fetch(`/api/product-image?q=${q}`)
      .then((r) => r.json())
      .then((data) => setProductImageUrl(data.imageUrl ?? ""))
      .catch(() => setProductImageUrl(""));
  }, [result?.winner?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!query) { router.push("/search"); return; }
    if (storeParam && zipParam) { runAnalysis(storeParam); return; }
    if (detectedStore && !zipParam) {
      setStoreContext(detectedStore);
      setFlowState("location-prompt");
      return;
    }
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleLocationConfirmed(_zip: string) {
    if (!storeContext) return;
    fetchNearbyStores(storeContext).then(() => setFlowState("store-selection"));
  }

  function handleStoreSelected(store: StoreLocation) {
    setSelectedStore(store);
    runAnalysis(storeContext);
  }

  function handleSkipStore() { runAnalysis(); }

  function handleNewSearch() {
    if (searchQuery.trim() && searchQuery !== query) {
      router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-[#f5f0ea]">

      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/search" className="text-stone-400 hover:text-stone-700 transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="text-stone-900 font-bold text-lg tracking-tight shrink-0">
            Picksy
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-stone-50 border border-stone-200 rounded-xl px-3 h-10">
            <Search size={14} className="text-stone-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewSearch()}
              className="flex-1 bg-transparent outline-none text-sm text-stone-900 placeholder-stone-400 min-w-0"
              placeholder="Search products..."
            />
            {searchQuery && searchQuery !== query && (
              <button onClick={handleNewSearch} className="text-orange-600 text-xs font-bold shrink-0">Go</button>
            )}
          </div>
        </div>

        {/* Store context banner */}
        {(storeContext || storeParam) && flowState === "result" && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2">
            <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
              <MapPin size={12} className="text-orange-500" />
              <span className="text-stone-700">
                Shopping at <span className="font-bold">{selectedStore?.name || storeContext || storeParam}</span>
                {selectedStore && <span className="text-stone-500"> — {selectedStore.address}, {selectedStore.city}</span>}
              </span>
              <button onClick={() => { setStoreContext(""); runAnalysis(); }} className="ml-auto text-stone-400 hover:text-stone-600">
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      {flowState === "location-prompt" && storeContext && (
        <LocationModal store={storeContext} onConfirm={handleLocationConfirmed} onSkip={handleSkipStore} />
      )}
      {flowState === "store-selection" && (
        <StoreSelector stores={stores} onSelect={handleStoreSelected} />
      )}

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        {flowState === "loading" && <LoadingState query={query} />}
        {flowState === "error" && <ErrorState query={query} onRetry={() => runAnalysis()} />}

        {flowState === "result" && result && (
          <>
            <WinnerCard winner={result.winner as Winner} meta={result.meta} imageUrl={productImageUrl} />
            <AlternativesSection alternatives={result.alternatives as Alternative[]} query={query} />

            <div className="max-w-4xl mx-auto text-center pb-8">
              <p className="text-sm text-stone-400 mb-3">Not quite right?</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-600 hover:border-orange-400 hover:text-orange-600 transition-all"
              >
                <Search size={14} /> New Search
              </Link>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#f5f0ea] flex items-center justify-center">
        <Loader2 size={32} className="text-orange-600 animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
