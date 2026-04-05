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
import { getStoreUrl } from "@/lib/retailers";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

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
  redditThreadUrls?: string[];
  mode: "general" | "store-specific";
  analysisTimeMs: number;
}

interface RedditComment {
  author: string;
  body: string;
  subreddit: string;
  upvotes: number;
  avatarUrl: string | null;
  permalink: string;
}
interface RedditCommentData { author: string; body: string; subreddit: string; upvotes: number }
interface TikTokVideoData { author: string; description: string; likes: number; views: number; topComments: string[] }
interface AnalysisResult { winner: Winner; alternatives: Alternative[]; meta: AnalysisMeta; comments?: RedditCommentData[]; tiktokVideos?: TikTokVideoData[] }

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getPageTitle(category: string, query: string): string {
  const src = (category || query).toLowerCase();
  const map: Record<string, string> = {
    headphones: "Top Headphones", earbuds: "Top Earbuds", earphones: "Top Earphones",
    laptop: "Top Laptops", laptops: "Top Laptops", notebook: "Top Laptops",
    tv: "Top TVs", television: "Top TVs", oled: "Top OLED TVs", qled: "Top QLED TVs",
    smartphone: "Top Smartphones", phone: "Top Smartphones", iphone: "Top iPhones", android: "Top Android Phones",
    monitor: "Top Monitors", display: "Top Displays",
    keyboard: "Top Keyboards",
    mouse: "Top Mice",
    speaker: "Top Speakers", soundbar: "Top Soundbars",
    camera: "Top Cameras",
    tablet: "Top Tablets", ipad: "Top iPads",
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
  const [visibleSteps, setVisibleSteps] = useState(1);

  const STEPS = [
    { icon: "🔍", text: "Scanning Reddit discussions..." },
    { icon: "🧠", text: `Analyzing opinions on "${query.slice(0, 28)}..."` },
    { icon: "⚖️", text: "Weighing community scores..." },
    { icon: "✨", text: "Picking the winner for you..." },
  ];

  useEffect(() => {
    const timers = [1, 2, 3].map((i) =>
      setTimeout(() => setVisibleSteps(i + 1), i * 1400)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 relative overflow-hidden">
      {/* Floating shapes (inherit green bg from page) */}
      <div className="absolute top-12 left-8 w-16 h-16 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute top-1/3 right-6 w-12 h-12 rounded-full bg-white/15 animate-floatSlow pointer-events-none" />
      <div className="absolute bottom-16 left-1/4 w-10 h-10 rounded-full bg-brand-pink/25 animate-floatDelay pointer-events-none" />
      <svg className="absolute top-20 right-1/3 animate-spinSlow opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>

      {/* Mascot with shadow */}
      <div className="mb-6 flex flex-col items-center">
        <PicksyMascot size={88} className="drop-shadow-xl" style={{ animation: "bounce 1.2s infinite" }} />
        <div className="w-14 h-2.5 bg-black/15 rounded-full blur-sm mt-1 animate-pulse" />
      </div>

      <h2 className="text-2xl font-black text-white mb-1 text-center">Finding your pick...</h2>
      <p className="text-white/70 text-sm mb-10 text-center max-w-xs">
        Scanning Reddit + reviews for <span className="text-white font-bold">{query}</span>
      </p>

      {/* Slide-in step messages */}
      <div className="w-full max-w-sm space-y-2.5">
        {STEPS.map((step, i) => (
          <div
            key={i}
            className="flex items-center gap-3 rounded-2xl px-4 py-3 border"
            style={{
              background: i < visibleSteps ? "rgba(255,255,255,0.18)" : "transparent",
              borderColor: i < visibleSteps ? "rgba(255,255,255,0.25)" : "transparent",
              opacity: i < visibleSteps ? 1 : 0,
              transform: i < visibleSteps ? "translateY(0)" : "translateY(12px)",
              transition: "all 0.5s cubic-bezier(0.16,1,0.3,1)",
              backdropFilter: i < visibleSteps ? "blur(8px)" : "none",
            }}
          >
            <span className="text-xl">{step.icon}</span>
            <span className="text-white/90 text-sm font-medium flex-1">{step.text}</span>
            {i < visibleSteps - 1 && <span className="text-brand-yellow font-bold text-sm">✓</span>}
            {i === visibleSteps - 1 && (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Trust line */}
      <div className="flex items-center gap-5 mt-10 text-white/55 text-xs">
        <span className="flex items-center gap-1.5">🛡️ 12,000+ posts analyzed</span>
        <span className="flex items-center gap-1.5">⚡ ~30 seconds</span>
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
          <div className="w-12 h-12 rounded-2xl bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-2xl">🏪</div>
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
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-brand-pink text-brand-pink font-bold text-sm mb-3 hover:bg-brand-pink/5 transition-colors disabled:opacity-60"
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
            className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl text-sm outline-none focus:border-brand-pink transition-colors"
          />
          <button onClick={handleZipSubmit} className="px-4 py-3 btn-gradient rounded-xl text-sm font-bold">Go</button>
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
              className="w-full flex items-center gap-3 p-4 rounded-2xl border border-stone-100 hover:border-brand-pink/40 hover:bg-brand-pink/5 transition-all text-left group"
            >
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center shrink-0 text-lg">📍</div>
              <div className="flex-1">
                <p className="font-bold text-sm text-stone-900 group-hover:text-brand-pink">{store.name}</p>
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

function WinnerCard({ winner, meta, imageUrl, alternatives }: { winner: Winner; meta: AnalysisMeta; imageUrl: string | null; alternatives: Alternative[] }) {
  const [imgError, setImgError] = useState(false);
  const [barsVisible, setBarsVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setBarsVisible(true), 500);
    return () => clearTimeout(t);
  }, []);
  const lowestPrice = winner.buyLinks.length > 0
    ? Math.min(...winner.buyLinks.map((l) => l.price))
    : winner.price;
  const pageTitle = getPageTitle(meta.category, meta.query);

  return (
    <div className="max-w-4xl mx-auto">

      {/* Page title */}
      <h2 className="font-heading font-black text-2xl text-brand-dark mb-4">{pageTitle}</h2>

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
      <h1 className="font-heading font-black text-3xl md:text-4xl text-brand-dark mb-6 leading-tight">{winner.name}</h1>

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
                  i === 0 ? "border-brand-pink shadow-sm" : "border-stone-200 hover:border-stone-300"
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
                <a
                  key={link.store}
                  href={getStoreUrl(link.store, winner.name, winner.brand)}
                  target="_blank"
                  rel="noopener noreferrer"
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
                  className={`relative rounded-xl border p-3 flex items-center gap-2 hover:shadow-md transition-all group ${
                    isBest
                      ? "border-brand-green/30 bg-brand-green/5 hover:border-brand-green/50"
                      : "border-stone-200 bg-white hover:border-stone-300"
                  }`}
                >
                  {isBest && (
                    <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-bold px-2 py-0.5 bg-brand-green text-white rounded-full whitespace-nowrap">
                      Best Price
                    </span>
                  )}
                  <div className="w-7 h-7 rounded-full bg-stone-800 text-white text-[11px] font-bold flex items-center justify-center shrink-0">
                    {link.store[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-stone-600 truncate">{link.store}</p>
                    <p className={`text-sm font-bold leading-tight ${isBest ? "text-brand-green" : "text-stone-900"}`}>
                      ${link.price.toFixed(2)}
                    </p>
                  </div>
                  <ExternalLink size={12} className="text-stone-400 shrink-0 group-hover:text-stone-600 transition-colors" />
                </a>
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
                <span className="w-5 h-5 rounded-full border-2 border-brand-green flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-brand-green" />
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
                <span className="w-5 h-5 rounded-full border-2 border-brand-pink/40 flex items-center justify-center shrink-0">
                  <span className="w-2 h-2 rounded-full bg-brand-pink/40" />
                </span>
                {con}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Stats bar */}
      <div className="bg-brand-green/10 rounded-2xl px-6 py-5 flex flex-wrap gap-6 mb-8">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-brand-green shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.sentiment}%</span>
          <span className="text-sm text-stone-500">positive sentiment</span>
        </div>
        <div className="flex items-center gap-2">
          <Users size={16} className="text-brand-green shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.mentions.toLocaleString()}</span>
          <span className="text-sm text-stone-500">mentions</span>
        </div>
        <div className="flex items-center gap-2">
          <BarChart2 size={16} className="text-brand-green shrink-0" />
          <span className="text-xl font-bold text-stone-900">{winner.postsAnalyzed}+</span>
          <span className="text-sm text-stone-500">posts analyzed</span>
        </div>
      </div>

      {/* How it compares — animated score bars */}
      {alternatives.length > 0 && (
        <div className="mb-8">
          <h4 className="text-[11px] font-bold text-stone-400 uppercase tracking-wider mb-4 flex items-center gap-1.5">
            <BarChart2 size={13} /> How it compares
          </h4>
          <div className="space-y-2.5">
            {/* Winner row */}
            <div className="flex items-center gap-3">
              <div className="w-28 shrink-0">
                <p className="text-xs font-black text-stone-900 truncate leading-tight">{winner.name.split(" ").slice(-2).join(" ")}</p>
                <span className="text-[9px] font-bold text-white bg-brand-green rounded-full px-1.5 py-0.5">Top Pick</span>
              </div>
              <div className="flex-1 h-7 bg-stone-100 rounded-full overflow-hidden relative">
                <div
                  className="h-full rounded-full transition-all ease-out"
                  style={{
                    width: barsVisible ? `${winner.score}%` : "0%",
                    background: "linear-gradient(90deg, #2ECC71, #25A855)",
                    transitionDuration: "1.2s",
                  }}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-black text-stone-700 mix-blend-multiply">{winner.score}</span>
              </div>
            </div>
            {/* Alt rows */}
            {alternatives.slice(0, 3).map((alt) => (
              <div key={alt.id} className="flex items-center gap-3">
                <div className="w-28 shrink-0">
                  <p className="text-xs font-medium text-stone-600 truncate leading-tight">{alt.name.split(" ").slice(-2).join(" ")}</p>
                  <p className="text-[9px] text-stone-400 truncate">{alt.brand}</p>
                </div>
                <div className="flex-1 h-7 bg-stone-100 rounded-full overflow-hidden relative">
                  <div
                    className="h-full rounded-full bg-stone-300 transition-all ease-out"
                    style={{ width: barsVisible ? `${alt.score}%` : "0%", transitionDuration: "1.2s" }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-500">{alt.score}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
        {meta.subreddits.slice(0, 4).map((s) => {
          const bare = s.startsWith("r/") ? s.slice(2) : s;
          return (
            <a
              key={s}
              href={`https://reddit.com/r/${bare}/search?q=${encodeURIComponent(meta.query)}&sort=relevance`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 bg-stone-100 text-stone-600 rounded-full font-medium hover:bg-stone-200 hover:text-stone-800 transition-colors"
            >
              r/{bare}
            </a>
          );
        })}
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

function NotElectronicsState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
      <div className="text-5xl mb-4">🔌</div>
      <h2 className="text-xl font-black text-stone-900 mb-2">Electronics only</h2>
      <p className="text-stone-500 text-sm mb-6 max-w-sm">{message}</p>
      <div className="flex flex-col gap-3 mb-6 text-left w-full max-w-xs">
        <p className="text-xs font-bold text-stone-400 uppercase tracking-wider text-center">Try one of these</p>
        {["best wireless headphones for commuting", "gaming laptop under $1000", "best 4K TV for the living room"].map((q) => (
          <Link
            key={q}
            href={`/results?q=${encodeURIComponent(q)}`}
            className="text-sm text-brand-pink font-medium hover:underline text-center"
          >
            &ldquo;{q}&rdquo;
          </Link>
        ))}
      </div>
      <Link
        href="/"
        className="bg-stone-900 hover:bg-stone-800 transition px-6 py-3 rounded-xl font-bold text-white text-sm"
      >
        Try a new search
      </Link>
    </div>
  );
}

// ─── Reddit Comments Section ──────────────────────────────────────────────────

const COMMENT_CARD_STYLES = [
  "bg-white border-stone-200",
  "bg-[#F0FDF4] border-brand-green/20",
  "bg-[#FFF8F0] border-brand-yellow/25",
  "bg-[#EFF6FF] border-blue-200/50",
];

const AVATAR_BG_COLORS = ["#FF8FB3", "#4EADFF", "#FFD93D", "#B39DDB", "#2ECC71", "#FFA07A", "#87CEEB", "#FFB347"];

function detectSentiment(text: string): "positive" | "negative" | "neutral" {
  const lower = text.toLowerCase();
  const pos = ["great", "amazing", "love", "best", "excellent", "recommend", "worth it", "impressive",
    "fantastic", "perfect", "solid", "awesome", "happy", "incredible", "top notch", "5 star", "outstanding"].filter(w => lower.includes(w)).length;
  const neg = ["bad", "disappointed", "terrible", "not worth", "overpriced", "issues", "problem",
    "broke", "poor", "waste", "avoid", "returned", "sucks", "horrible", "regret", "cheap", "flimsy"].filter(w => lower.includes(w)).length;
  if (pos > neg) return "positive";
  if (neg > pos) return "negative";
  return "neutral";
}

function RedditAvatar({ avatarUrl, author, bg, size = 44 }: { avatarUrl: string | null; author: string; bg?: string; size?: number }) {
  const [imgError, setImgError] = useState(false);
  const initial = author.replace("[deleted]", "?")[0]?.toUpperCase() ?? "?";
  const cls = `rounded-full object-cover shrink-0 border-2 border-white shadow-sm`;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={author}
        className={cls}
        style={{ width: size, height: size }}
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div
      className={`${cls} flex items-center justify-center text-white font-black`}
      style={{ width: size, height: size, background: bg || "#FF4500", fontSize: size * 0.36 }}
    >
      {initial}
    </div>
  );
}

// Single comment card — avatar at top, quote below
function CommentCard({ comment, index, cardOffset = 0 }: { comment: RedditComment; index: number; cardOffset?: number }) {
  const sentiment = detectSentiment(comment.body);
  const bg = AVATAR_BG_COLORS[(index + cardOffset) % AVATAR_BG_COLORS.length];
  const cardStyle = COMMENT_CARD_STYLES[(index + cardOffset) % 4];

  return (
    <a
      href={comment.permalink}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex flex-col rounded-2xl p-4 border hover:shadow-md hover:-translate-y-0.5 transition-all group ${cardStyle}`}
    >
      {/* Avatar row — first thing you see */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <RedditAvatar avatarUrl={comment.avatarUrl} author={comment.author} bg={bg} size={42} />
          <div>
            <p className="text-[13px] font-bold text-stone-800 leading-tight">u/{comment.author}</p>
            <p className="text-[11px] text-stone-400">r/{comment.subreddit}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          {sentiment === "positive" && (
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
              👍 Positive
            </span>
          )}
          {sentiment === "negative" && (
            <span className="text-[10px] font-bold text-rose-500 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
              👎 Critical
            </span>
          )}
          {comment.upvotes > 0 && (
            <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
              ▲ {comment.upvotes >= 1000 ? `${(comment.upvotes / 1000).toFixed(1)}k` : comment.upvotes}
            </span>
          )}
        </div>
      </div>

      {/* Quote */}
      <div className="flex-1">
        <span className="text-2xl font-black text-stone-200 leading-none select-none mr-0.5">&ldquo;</span>
        <p className="inline text-sm text-stone-700 leading-relaxed">{comment.body}</p>
        <span className="text-2xl font-black text-stone-200 leading-none select-none ml-0.5">&rdquo;</span>
      </div>

      {/* View thread link */}
      <p className="text-[10px] text-stone-300 group-hover:text-brand-pink transition-colors mt-3 text-right">
        View thread →
      </p>
    </a>
  );
}

function RedditCommentsSection({ threadUrls, query }: { threadUrls: string[]; query: string }) {
  const [comments, setComments] = useState<RedditComment[]>([]);
  const [parsedThreadUrls, setParsedThreadUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let endpoint: string;
    if (threadUrls.length > 0) {
      endpoint = `/api/reddit-comments?urls=${encodeURIComponent(JSON.stringify(threadUrls))}`;
    } else if (query) {
      endpoint = `/api/reddit-comments?query=${encodeURIComponent(query)}`;
    } else {
      setLoading(false);
      return;
    }
    fetch(endpoint)
      .then((r) => r.json())
      .then((data) => {
        setComments(data.comments || []);
        setParsedThreadUrls(data.threadUrls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [threadUrls, query]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!loading && comments.length === 0) return null;

  const topComments = comments.slice(0, 3);
  const moreComments = comments.slice(3);

  const positiveCount = comments.filter(c => detectSentiment(c.body) === "positive").length;
  const negativeCount = comments.filter(c => detectSentiment(c.body) === "negative").length;

  return (
    <div className="max-w-4xl mx-auto mb-8">
      {/* Section header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2.5">
            {AVATAR_BG_COLORS.slice(0, 5).map((color, i) => (
              <div
                key={i}
                className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-black shadow-sm"
                style={{ background: color }}
              >
                {["A", "J", "M", "R", "K"][i]}
              </div>
            ))}
          </div>
          <div>
            <h3 className="font-heading font-black text-lg text-stone-900">Community says</h3>
            <p className="text-xs text-stone-400">Real opinions from Reddit</p>
          </div>
        </div>
        {/* Sentiment summary + source thread links */}
        {!loading && comments.length > 0 && (
          <div className="flex flex-col items-end gap-1.5">
            <div className="hidden sm:flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-semibold">
                👍 {positiveCount} positive
              </span>
              {negativeCount > 0 && (
                <span className="flex items-center gap-1 text-rose-500 bg-rose-50 border border-rose-100 px-2.5 py-1 rounded-full font-semibold">
                  👎 {negativeCount} critical
                </span>
              )}
            </div>
            {parsedThreadUrls.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-end">
                {parsedThreadUrls.map((url, i) => {
                  const sub = url.match(/reddit\.com\/r\/([^/]+)/)?.[1] ?? "reddit";
                  return (
                    <a
                      key={url}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-stone-400 hover:text-brand-pink transition-colors flex items-center gap-0.5"
                    >
                      r/{sub} #{i + 1} ↗
                    </a>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        /* Skeleton — avatar at top matches new layout */
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 border border-stone-100 animate-pulse">
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-11 h-11 rounded-full bg-stone-200 shrink-0" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 bg-stone-200 rounded w-2/3" />
                  <div className="h-2.5 bg-stone-200 rounded w-1/3" />
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-3 bg-stone-200 rounded w-full" />
                <div className="h-3 bg-stone-200 rounded w-5/6" />
                <div className="h-3 bg-stone-200 rounded w-3/4" />
                <div className="h-3 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Top 3 */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {topComments.map((comment, i) => (
              <CommentCard key={i} comment={comment} index={i} />
            ))}
          </div>

          {/* Expandable rest */}
          {moreComments.length > 0 && (
            <>
              <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-brand-pink hover:text-brand-pink transition-all mb-3"
              >
                <span
                  className="inline-block transition-transform duration-300"
                  style={{ transform: expanded ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  ▾
                </span>
                {expanded ? "Show less" : `Read ${moreComments.length} more reviews`}
                {!expanded && (
                  <span className="flex -space-x-1.5 ml-1">
                    {AVATAR_BG_COLORS.slice(0, Math.min(4, moreComments.length)).map((color, i) => (
                      <div key={i} className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ background: color }} />
                    ))}
                  </span>
                )}
              </button>

              <div
                style={{
                  maxHeight: expanded ? `${moreComments.length * 260}px` : "0px",
                  overflow: "hidden",
                  transition: "max-height 0.65s cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
                  {moreComments.map((comment, i) => (
                    <CommentCard key={i} comment={comment} index={i} cardOffset={3} />
                  ))}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}

// ─── Main Results Content ──────────────────────────────────────────────────────

type FlowState = "loading" | "location-prompt" | "store-selection" | "result" | "error" | "not-electronics";

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
  const [notElectronicsMessage, setNotElectronicsMessage] = useState("");
  const [redditThreadUrls, setRedditThreadUrls] = useState<string[]>([]);
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [storeContext, setStoreContext] = useState(storeParam);
  const [showResults, setShowResults] = useState(false);
  const [resultVisible, setResultVisible] = useState(false);

  const STORE_NAMES = ["Walmart", "Target", "Amazon", "Best Buy", "Newegg", "B&H", "Micro Center"];
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
      if (res.status === 422) {
        const errData = await res.json();
        if (errData.reason === "not_electronics") {
          setNotElectronicsMessage(errData.error || "Picksy is built for electronics and tech products.");
          setFlowState("not-electronics");
          return;
        }
        throw new Error("Analysis failed");
      }
      if (!res.ok) throw new Error("Analysis failed");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setRedditThreadUrls(data.meta.redditThreadUrls || []);
      // Cache comments for the product detail page
      if (data.winner?.id) {
        try {
          sessionStorage.setItem(
            `picksy_comments_${data.winner.id}`,
            JSON.stringify({ reddit: data.comments || [], tiktok: data.tiktokVideos || [] })
          );
        } catch { /* ignore quota errors */ }
      }
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

  // Trigger slide-in animation when results are ready
  useEffect(() => {
    if (flowState === "result") {
      setShowResults(true);
      const t = setTimeout(() => setResultVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [flowState]);

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
    if (!query) { router.push("/"); return; }
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
    <div className="min-h-screen relative overflow-x-hidden" style={{ background: "#2ECC71" }}>
      {/* Floating bg shapes — visible while loading */}
      <div className="absolute top-20 left-6 w-20 h-20 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute top-1/3 right-4 w-14 h-14 rounded-full bg-white/12 animate-floatSlow pointer-events-none" />
      <div className="absolute bottom-1/2 left-1/3 w-8 h-8 rounded-full bg-brand-pink/20 animate-floatDelay2 pointer-events-none" />

      {/* Sticky header — dark */}
      <header className="sticky top-0 z-40 bg-brand-dark/95 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/" className="text-white/60 hover:text-white transition-colors shrink-0">
            <ArrowLeft size={20} />
          </Link>
          <Link href="/" className="flex items-center gap-1.5 shrink-0">
            <PicksyMascot size={32} />
            <span className="font-heading font-black text-base text-white">picksy</span>
          </Link>
          <div className="flex-1 flex items-center gap-2 bg-white/10 border border-white/20 rounded-xl px-3 h-10">
            <Search size={14} className="text-white/50 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleNewSearch()}
              className="flex-1 bg-transparent outline-none text-sm text-white placeholder-white/40 min-w-0"
              placeholder="Search products..."
            />
            {searchQuery && searchQuery !== query && (
              <button onClick={handleNewSearch} className="text-brand-yellow text-xs font-bold shrink-0">Go</button>
            )}
          </div>
        </div>

        {/* Store context banner */}
        {(storeContext || storeParam) && flowState === "result" && (
          <div className="bg-white/5 border-b border-white/10 px-4 py-2">
            <div className="max-w-5xl mx-auto flex items-center gap-2 text-xs">
              <MapPin size={12} className="text-brand-yellow" />
              <span className="text-white/80">
                Shopping at <span className="font-bold text-white">{selectedStore?.name || storeContext || storeParam}</span>
                {selectedStore && <span className="text-white/50"> — {selectedStore.address}, {selectedStore.city}</span>}
              </span>
              <button onClick={() => { setStoreContext(""); runAnalysis(); }} className="ml-auto text-white/40 hover:text-white/70">
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

      {/* Loading / error — on green bg */}
      {!showResults && (
        <main className="max-w-5xl mx-auto px-4 py-8">
          {flowState === "loading" && <LoadingState query={query} />}
          {flowState === "error" && <ErrorState query={query} onRetry={() => runAnalysis()} />}
          {flowState === "not-electronics" && <NotElectronicsState message={notElectronicsMessage} />}
        </main>
      )}

      {/* Results — white sheet slides up from below green */}
      {showResults && result && (
        <div
          className={`bg-white rounded-t-[2.5rem] mt-3 shadow-2xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            resultVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}
          style={{ minHeight: "calc(100vh - 4rem)" }}
        >
          <main className="max-w-5xl mx-auto px-4 py-8">
            <WinnerCard winner={result.winner as Winner} meta={result.meta} imageUrl={productImageUrl} alternatives={result.alternatives as Alternative[]} />
            <RedditCommentsSection threadUrls={redditThreadUrls} query={query} />
            <AlternativesSection alternatives={result.alternatives as Alternative[]} query={query} />

            <div className="max-w-4xl mx-auto text-center pb-8">
              <p className="text-sm text-stone-400 mb-3">Not quite right?</p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-200 text-sm font-semibold text-stone-600 hover:border-brand-pink hover:text-brand-pink transition-all"
              >
                <Search size={14} /> New Search
              </Link>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

// ─── Page Export ───────────────────────────────────────────────────────────────

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-brand-bg flex items-center justify-center">
        <Loader2 size={32} className="text-brand-pink animate-spin" />
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
