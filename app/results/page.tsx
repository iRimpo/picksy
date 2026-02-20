"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Search, ArrowLeft, ChevronDown, ChevronUp, ExternalLink,
  MapPin, CheckCircle, AlertCircle, X, Loader2,
} from "lucide-react";

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

// ─── Score Gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const [mounted, setMounted] = useState(false);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  useEffect(() => { const t = setTimeout(() => setMounted(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="50" cy="50" r="45" fill="none" stroke={color}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            className="gauge-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-black text-stone-900">{score}</span>
          <span className="text-[10px] text-stone-400">/100</span>
        </div>
      </div>
      <span
        className={`mt-2 text-sm font-bold px-3 py-1 rounded-full ${
          score >= 80 ? "bg-green-50 text-green-700" :
          score >= 60 ? "bg-yellow-50 text-yellow-700" : "bg-red-50 text-red-600"
        }`}
      >
        {score >= 80 ? "✅ " : score >= 60 ? "" : "⚠️ "}{label}
      </span>
    </div>
  );
}

// ─── Loading State ─────────────────────────────────────────────────────────────

function LoadingState({ query }: { query: string }) {
  const [step, setStep] = useState(0);
  const [progress, setProgress] = useState(0);

  const steps = [
    "Searching Reddit discussions...",
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
      {/* Reddit logo animation */}
      <div className="w-16 h-16 rounded-full bg-[#FF4500] flex items-center justify-center mb-6 animate-pulse">
        <svg viewBox="0 0 20 20" className="w-9 h-9 fill-white">
          <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
        </svg>
      </div>

      <h2 className="text-xl font-black text-stone-900 mb-2">Analyzing Reddit</h2>
      <p className="text-stone-500 text-sm mb-8 text-center max-w-xs">
        Finding the best <span className="font-semibold text-stone-700">{query}</span> based on what real Redditors say
      </p>

      {/* Progress bar */}
      <div className="w-full max-w-sm mb-4">
        <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-100"
            style={{
              width: `${progress}%`,
              backgroundColor: "#ea580c",
            }}
          />
        </div>
        <div className="flex justify-between mt-1.5">
          <span className="text-xs text-stone-400">{steps[step]}</span>
          <span className="text-xs text-stone-400">{progress}%</span>
        </div>
      </div>

      {/* Step indicators */}
      <div className="flex gap-3 mt-4">
        {steps.map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full transition-all ${
              i <= step ? "bg-orange-600" : "bg-stone-200"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Location Modal ────────────────────────────────────────────────────────────

function LocationModal({
  store,
  onConfirm,
  onSkip,
}: {
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
      () => {
        // Mock: use a default ZIP since we can't reverse-geocode without an API key
        onConfirm("94102");
      },
      () => {
        setError("Location access denied. Please enter your ZIP code.");
        setDetecting(false);
      },
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
        {/* Store badge */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center text-2xl">
            🏪
          </div>
          <div>
            <p className="text-xs text-stone-400 font-medium">Shopping at</p>
            <p className="text-lg font-black text-stone-900">{store}</p>
          </div>
        </div>

        <h3 className="text-xl font-black text-stone-900 mb-1.5">Where are you shopping?</h3>
        <p className="text-sm text-stone-500 mb-6">
          We&apos;ll find {store} locations near you and show prices available there.
        </p>

        {/* Auto-detect */}
        <button
          onClick={handleAutoDetect}
          disabled={detecting}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-orange-500 text-orange-600 font-bold text-sm mb-3 hover:bg-orange-50/60 transition-colors disabled:opacity-60"
        >
          {detecting ? (
            <><Loader2 size={16} className="animate-spin" /> Detecting location...</>
          ) : (
            <><MapPin size={16} /> Use My Location</>
          )}
        </button>

        <div className="flex items-center gap-3 mb-3">
          <div className="flex-1 h-px bg-stone-100" />
          <span className="text-xs text-stone-400">or</span>
          <div className="flex-1 h-px bg-stone-100" />
        </div>

        {/* ZIP input */}
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={zip}
            onChange={(e) => { setZip(e.target.value.replace(/\D/g, "")); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleZipSubmit()}
            placeholder="Enter ZIP code"
            className="flex-1 px-4 py-3 border-2 border-stone-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-colors"
          />
          <button
            onClick={handleZipSubmit}
            className="px-4 py-3 bg-orange-600 hover:bg-orange-700 transition text-white rounded-xl text-sm font-bold"
          >
            Go
          </button>
        </div>

        {error && (
          <p className="text-xs text-red-500 flex items-center gap-1 mb-3">
            <AlertCircle size={12} /> {error}
          </p>
        )}

        <button
          onClick={onSkip}
          className="w-full text-sm text-stone-400 hover:text-stone-600 py-2 transition-colors"
        >
          Skip — show general results instead
        </button>
      </div>
    </div>
  );
}

// ─── Store Selector ────────────────────────────────────────────────────────────

interface StoreLocation { id: string; name: string; address: string; city: string; state: string; distance: number }

function StoreSelector({
  stores,
  onSelect,
}: {
  stores: StoreLocation[];
  onSelect: (store: StoreLocation) => void;
}) {
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

// ─── Sentiment Bar (animated) ─────────────────────────────────────────────────

function SentimentBar({ sentiment, mentions, redditQuote }: { sentiment: number; mentions: number; redditQuote?: string }) {
  const [barWidth, setBarWidth] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setBarWidth(sentiment), 400);
    return () => clearTimeout(t);
  }, [sentiment]);

  return (
    <div className="bg-stone-50 rounded-2xl p-4 border border-stone-100 mb-5">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-4 h-4 rounded-full bg-[#FF4500] flex items-center justify-center">
          <svg viewBox="0 0 20 20" className="w-2.5 h-2.5 fill-white">
            <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
          </svg>
        </div>
        <span className="text-xs font-bold text-stone-700">Reddit Community Verdict</span>
      </div>
      <div className="flex items-center gap-4 mb-2">
        <span className="text-2xl font-black text-green-600">{sentiment}%</span>
        <span className="text-sm text-stone-500">positive sentiment</span>
        <span className="text-sm text-stone-400">•</span>
        <span className="text-sm text-stone-600 font-semibold">{mentions} Redditors recommend this</span>
      </div>
      <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 bar-fill"
          style={{ width: `${barWidth}%` }}
        />
      </div>
      {redditQuote && (
        <p
          className="mt-3 text-xs text-stone-500 italic border-l-2 border-[#FF4500] pl-3"
          style={{ animation: "countUp 0.5s ease-out 0.8s both" }}
        >
          {redditQuote}
        </p>
      )}
    </div>
  );
}

// ─── Winner Card ───────────────────────────────────────────────────────────────

function WinnerCard({ winner, meta }: { winner: Winner; meta: AnalysisMeta }) {
  const [showAllPros, setShowAllPros] = useState(false);
  const [showAllCons, setShowAllCons] = useState(false);
  const [showWhereToBuy, setShowWhereToBuy] = useState(false);
  const displayedPros = showAllPros ? winner.pros : winner.pros.slice(0, 3);
  const displayedCons = showAllCons ? winner.cons : winner.cons.slice(0, 3);
  const isStoreMode = meta.mode === "store-specific";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Reddit analysis tag */}
      <div className="flex items-center justify-center gap-2 mb-6">
        <div className="w-5 h-5 rounded-full bg-[#FF4500] flex items-center justify-center">
          <svg viewBox="0 0 20 20" className="w-3 h-3 fill-white">
            <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
          </svg>
        </div>
        <span className="text-xs text-stone-500">
          Analyzed <span className="font-bold text-stone-700">{winner.postsAnalyzed} Reddit discussions</span> in {meta.subreddits.slice(0, 2).join(", ")}
        </span>
      </div>

      {/* Main winner card */}
      <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 md:p-8 mb-5">
        {/* Trophy header */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-2xl">🏆</span>
          <div>
            <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider">Your Answer</p>
            <p className="text-sm text-stone-500">Reddit&apos;s top pick for your search</p>
          </div>
        </div>

        {/* Product hero */}
        <div className="flex flex-col sm:flex-row gap-6 mb-6">
          {/* Product image */}
          <div className="sm:w-36 shrink-0">
            <div className="w-full aspect-square sm:w-36 sm:h-36 rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center border border-stone-100 text-6xl">
              {winner.emoji}
            </div>
          </div>

          {/* Product info */}
          <div className="flex-1">
            <p className="text-orange-600 text-sm font-bold mb-0.5">{winner.brand}</p>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 mb-1 leading-tight">
              {winner.name}
            </h2>

            {/* Price row */}
            <div className="flex items-baseline gap-3 mb-4">
              {isStoreMode && winner.storePrice ? (
                <>
                  <span className="text-3xl font-black text-stone-900">${winner.storePrice.toFixed(2)}</span>
                  <span className="text-sm text-stone-400">at {winner.storeName}</span>
                  {winner.inStock && (
                    <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                      In Stock
                    </span>
                  )}
                </>
              ) : (
                <span className="text-3xl font-black text-stone-900">${winner.price.toFixed(2)}</span>
              )}
            </div>

            {/* Score + Value score */}
            <div className="flex items-center gap-4 flex-wrap">
              <ScoreGauge score={winner.score} label={winner.scoreLabel} />
              {isStoreMode && winner.valueScore && (
                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 flex items-center justify-center">
                    <div className="text-center">
                      <p className="text-3xl font-black text-orange-500">{winner.valueScore}</p>
                      <p className="text-[10px] text-stone-400">/100</p>
                    </div>
                  </div>
                  <span className="mt-2 text-sm font-bold px-3 py-1 rounded-full bg-orange-50 text-orange-700">
                    💰 Best Bang for Buck
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reddit sentiment bar */}
        <SentimentBar sentiment={winner.sentiment} mentions={winner.mentions} redditQuote={winner.redditQuote} />

        {/* Why it won */}
        <div className="mb-5">
          <h3 className="text-base font-black text-stone-900 mb-2">Why This Won</h3>
          <p className="text-sm text-stone-600 leading-relaxed">{winner.whyItWon}</p>
        </div>

        {/* Pros & Cons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
          {/* Pros */}
          <div className="bg-green-50 rounded-2xl p-4 border border-green-100">
            <h4 className="text-sm font-black text-green-800 mb-3 flex items-center gap-1.5">
              <span>👍</span> Top Pros
            </h4>
            <ul className="space-y-2 stagger-plop">
              {displayedPros.map((pro, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-green-700">
                  <CheckCircle size={14} className="mt-0.5 shrink-0 text-green-500" />
                  <span>{pro}</span>
                </li>
              ))}
            </ul>
            {winner.pros.length > 3 && (
              <button
                onClick={() => setShowAllPros(!showAllPros)}
                className="mt-2 text-xs font-semibold text-green-600 hover:underline flex items-center gap-1"
              >
                {showAllPros ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{winner.pros.length - 3} more</>}
              </button>
            )}
          </div>

          {/* Cons */}
          <div className="bg-yellow-50 rounded-2xl p-4 border border-yellow-100">
            <h4 className="text-sm font-black text-yellow-800 mb-3 flex items-center gap-1.5">
              <span>👎</span> Top Cons
            </h4>
            <ul className="space-y-2 stagger-plop">
              {displayedCons.map((con, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-yellow-700">
                  <AlertCircle size={14} className="mt-0.5 shrink-0 text-yellow-500" />
                  <span>{con}</span>
                </li>
              ))}
            </ul>
            {winner.cons.length > 3 && (
              <button
                onClick={() => setShowAllCons(!showAllCons)}
                className="mt-2 text-xs font-semibold text-yellow-600 hover:underline flex items-center gap-1"
              >
                {showAllCons ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> +{winner.cons.length - 3} more</>}
              </button>
            )}
          </div>
        </div>

        {/* Buy buttons */}
        <div>
          <div className="relative">
            <button
              onClick={() => setShowWhereToBuy(!showWhereToBuy)}
              className="w-full bg-stone-900 hover:bg-stone-800 transition text-white py-4 rounded-2xl font-black text-base flex items-center justify-center gap-2"
            >
              {isStoreMode ? `Buy at ${winner.storeName}` : "Where to Buy"}{" "}
              <ChevronDown size={18} className={`transition-transform ${showWhereToBuy ? "rotate-180" : ""}`} />
            </button>

            {showWhereToBuy && (
              <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-stone-100 rounded-2xl shadow-xl overflow-hidden z-30 anim-plop">
                {winner.buyLinks.map((link) => (
                  <button
                    key={link.store}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-stone-50 transition-colors border-b border-stone-50 last:border-0"
                  >
                    <span className="font-bold text-stone-900 text-sm">{link.store}</span>
                    <span className="flex items-center gap-2 text-sm">
                      <span className="font-black text-stone-900">${link.price.toFixed(2)}</span>
                      <ExternalLink size={13} className="text-stone-400" />
                    </span>
                  </button>
                ))}
                <p className="px-5 py-2 text-[10px] text-stone-300 border-t border-stone-50">
                  Prices may vary. Links are for reference only.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Alternatives Section ──────────────────────────────────────────────────────

function AlternativesSection({ alternatives }: { alternatives: Alternative[] }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="w-full max-w-2xl mx-auto mb-10">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-5 py-4 bg-white rounded-2xl border border-stone-100 hover:border-stone-200 transition-all shadow-sm"
      >
        <div className="text-left">
          <p className="font-bold text-stone-700 text-sm">Other Options</p>
          <p className="text-xs text-stone-400">{alternatives.length} alternative{alternatives.length !== 1 ? "s" : ""} — lower scores</p>
        </div>
        <ChevronDown
          size={18}
          className={`text-stone-400 transition-transform ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-3 stagger-plop">
          {alternatives.map((alt) => (
            <div key={alt.id} className="bg-white rounded-2xl border border-stone-100 p-5 hover:-translate-y-0.5 hover:shadow-md transition-all duration-300">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-stone-50 flex items-center justify-center text-3xl shrink-0">
                  {alt.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div>
                      <p className="text-xs text-stone-400">{alt.brand}</p>
                      <p className="font-bold text-stone-900 text-sm leading-tight">{alt.name}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="font-black text-stone-900">${alt.price.toFixed(2)}</p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          alt.score >= 80 ? "bg-green-50 text-green-600" :
                          alt.score >= 60 ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"
                        }`}
                      >
                        {alt.score}/100
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-stone-500 mb-2">
                    {alt.sentiment}% positive • {alt.mentions} mentions
                  </p>
                  <p className="text-xs text-stone-400 italic">{alt.whyNotWinner}</p>
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

  const [flowState, setFlowState] = useState<FlowState>("loading");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [selectedStore, setSelectedStore] = useState<StoreLocation | null>(null);
  const [searchQuery, setSearchQuery] = useState(query);
  const [storeContext, setStoreContext] = useState(storeParam);

  // Detect store in query
  const STORE_NAMES = ["Walmart", "Target", "CVS", "Walgreens", "Ulta", "Sephora", "Amazon"];
  function detectStoreInQuery(q: string): string | null {
    const lower = q.toLowerCase();
    for (const s of STORE_NAMES) {
      if (lower.includes(s.toLowerCase())) return s;
    }
    return null;
  }

  const detectedStore = detectStoreInQuery(query);

  // Run the analysis
  async function runAnalysis(overrideStore?: string) {
    setFlowState("loading");
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, store: overrideStore || storeParam || null }),
      });
      if (!res.ok) throw new Error("Analysis failed");
      const data: AnalysisResult = await res.json();
      setResult(data);
      setFlowState("result");
    } catch {
      setFlowState("error");
    }
  }

  // Fetch nearby stores
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

  // Initial load logic
  useEffect(() => {
    if (!query) { router.push("/search"); return; }

    // If store already provided via param (e.g. after location confirmed), run analysis
    if (storeParam && zipParam) {
      runAnalysis(storeParam);
      return;
    }

    // If store detected in query but no location yet
    if (detectedStore && !zipParam) {
      setStoreContext(detectedStore);
      setFlowState("location-prompt");
      return;
    }

    // General search
    runAnalysis();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function handleLocationConfirmed(_zip: string) {
    if (!storeContext) return;
    // Fetch stores then show selector
    fetchNearbyStores(storeContext).then(() => {
      setFlowState("store-selection");
    });
  }

  function handleStoreSelected(store: StoreLocation) {
    setSelectedStore(store);
    runAnalysis(storeContext);
  }

  function handleSkipStore() {
    runAnalysis(); // general results
  }

  function handleNewSearch() {
    if (searchQuery.trim() && searchQuery !== query) {
      router.push(`/results?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50/50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/search" className="text-stone-400 hover:text-stone-600 transition-colors shrink-0">
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
              <button onClick={handleNewSearch} className="text-orange-600 text-xs font-bold shrink-0">
                Go
              </button>
            )}
          </div>
        </div>

        {/* Store context banner */}
        {(storeContext || storeParam) && flowState === "result" && (
          <div className="bg-orange-50 border-b border-orange-100 px-4 py-2">
            <div className="max-w-3xl mx-auto flex items-center gap-2 text-xs">
              <MapPin size={12} className="text-orange-500" />
              <span className="text-stone-700">
                Shopping at <span className="font-bold">{selectedStore?.name || storeContext || storeParam}</span>
                {selectedStore && <span className="text-stone-500"> — {selectedStore.address}, {selectedStore.city}</span>}
              </span>
              <button
                onClick={() => { setStoreContext(""); runAnalysis(); }}
                className="ml-auto text-stone-400 hover:text-stone-600"
              >
                <X size={12} />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      {flowState === "location-prompt" && storeContext && (
        <LocationModal
          store={storeContext}
          onConfirm={handleLocationConfirmed}
          onSkip={handleSkipStore}
        />
      )}

      {flowState === "store-selection" && (
        <StoreSelector
          stores={stores}
          onSelect={handleStoreSelected}
        />
      )}

      {/* Main content */}
      <main className="max-w-3xl mx-auto px-4 py-6">
        {flowState === "loading" && <LoadingState query={query} />}

        {flowState === "error" && (
          <ErrorState query={query} onRetry={() => runAnalysis()} />
        )}

        {flowState === "result" && result && (
          <>
            <div key={result.winner.id} className="anim-plop">
              <WinnerCard winner={result.winner as Winner} meta={result.meta} />
            </div>
            <AlternativesSection alternatives={result.alternatives as Alternative[]} />

            {/* Search again */}
            <div className="w-full max-w-2xl mx-auto text-center pb-8">
              <p className="text-sm text-stone-400 mb-3">Not quite right?</p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-stone-200 text-sm font-bold text-stone-600 hover:border-orange-500 hover:text-orange-600 transition-all"
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-stone-50 flex items-center justify-center">
          <Loader2 size={32} className="text-orange-600 animate-spin" />
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
