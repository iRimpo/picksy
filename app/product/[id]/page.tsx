"use client";

import { useState, useEffect, useRef, use } from "react";
import Link from "next/link";
import {
  ArrowLeft, Share2, Heart, ChevronDown, ExternalLink,
  Play, CheckCircle, AlertTriangle,
} from "lucide-react";
import { products } from "@/lib/data/products";
import { useAnimateIn } from "@/lib/hooks/use-animate-in";

function ScoreGauge({ score, label }: { score: number; label: string }) {
  const [mounted, setMounted] = useState(false);
  const circumference = 2 * Math.PI * 45;
  const offset = circumference - (score / 100) * circumference;

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const color = score >= 80 ? "#22c55e" : score >= 60 ? "#eab308" : "#ef4444";

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-40 h-40">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#f3f4f6" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={mounted ? offset : circumference}
            className="gauge-circle"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black text-stone-900">{score}</span>
          <span className="text-xs text-stone-400">/100</span>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-1.5">
        {score >= 80 && <CheckCircle size={16} className="text-green-500" />}
        <span className="font-bold text-stone-900">{label}</span>
      </div>
    </div>
  );
}

function ScoreBar({ label, score, detail }: { label: string; score: number; detail: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 200);
    return () => clearTimeout(t);
  }, []);
  const color = score >= 80 ? "from-green-400 to-green-500" : score >= 50 ? "from-yellow-400 to-yellow-500" : "from-red-400 to-red-500";
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="text-sm font-bold text-stone-900">{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} bar-fill`}
          style={{ width: mounted ? `${score}%` : "0%" }}
        />
      </div>
      <p className="text-xs text-stone-400 mt-1">{detail}</p>
    </div>
  );
}

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  useAnimateIn();
  const { id } = use(params);
  const product = products.find((p) => p.id === id) || products[0];
  const [saved, setSaved] = useState(false);
  const [showWhereToBuy, setShowWhereToBuy] = useState(false);
  const [expandedTranscripts, setExpandedTranscripts] = useState<number[]>([]);
  const [showMorePros, setShowMorePros] = useState(false);
  const [showMoreCons, setShowMoreCons] = useState(false);
  const [transcriptFilter, setTranscriptFilter] = useState("all");
  const stickyRef = useRef<HTMLDivElement>(null);

  const toggleTranscript = (i: number) =>
    setExpandedTranscripts((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );

  const filteredTranscripts = product.transcripts.filter((t) => {
    if (transcriptFilter === "positive") return t.sentimentScore >= 70;
    if (transcriptFilter === "negative") return t.sentimentScore < 60;
    if (transcriptFilter === "sponsored") return t.sponsored;
    if (transcriptFilter === "organic") return !t.sponsored;
    return true;
  });

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <Link
            href="/results"
            className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors shrink-0"
          >
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="flex-1 font-bold text-sm text-stone-900 truncate">
            {product.name}
          </h1>
          <button className="text-stone-400 hover:text-stone-600 transition-colors" aria-label="Share">
            <Share2 size={18} />
          </button>
          <button
            onClick={() => setSaved(!saved)}
            className={`transition-colors ${saved ? "text-orange-600" : "text-stone-400 hover:text-stone-600"}`}
            aria-label="Save"
          >
            <Heart size={18} fill={saved ? "#ea580c" : "none"} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Hero section */}
        <section className="flex flex-col md:flex-row gap-8 mb-12">
          {/* Image */}
          <div className="md:w-[40%] shrink-0 anim-left">
            <div className="w-full aspect-square rounded-2xl bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center border border-stone-100">
              <span className="text-8xl">🧴</span>
            </div>
            <div className="flex gap-2 mt-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="w-16 h-16 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center cursor-pointer hover:border-stone-300 transition-colors"
                >
                  <span className="text-2xl">🧴</span>
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 anim-right anim-d1">
            <p className="text-orange-600 text-sm font-semibold mb-1">{product.brand}</p>
            <h2 className="text-3xl font-black text-stone-900 mb-1">{product.name}</h2>
            <p className="text-stone-400 text-sm mb-4">{product.category}</p>
            <p className="text-4xl font-black text-stone-900 mb-6">
              ${product.price.toFixed(2)}
            </p>

            {/* Where to buy */}
            <div className="relative mb-4">
              <button
                onClick={() => setShowWhereToBuy(!showWhereToBuy)}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white transition px-6 py-3.5 rounded-xl font-bold text-white flex items-center justify-center gap-2"
              >
                Where to Buy <ChevronDown size={16} className={`transition-transform ${showWhereToBuy ? "rotate-180" : ""}`} />
              </button>
              {showWhereToBuy && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-stone-100 rounded-xl shadow-lg overflow-hidden z-30">
                  {product.retailers.map((r) => (
                    <button
                      key={r.name}
                      className="w-full flex items-center justify-between px-5 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <span className="font-medium text-stone-900 text-sm">{r.name}</span>
                      <span className="flex items-center gap-2 text-sm">
                        <span className="font-bold text-stone-900">${r.price.toFixed(2)}</span>
                        <ExternalLink size={14} className="text-stone-400" />
                      </span>
                    </button>
                  ))}
                  <p className="px-5 py-2 text-[10px] text-stone-300 border-t border-stone-50">
                    We earn from qualifying purchases
                  </p>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 1: Hype Score */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
          <h3 className="text-2xl font-black text-stone-900 mb-6">Hype vs Reality Score</h3>
          <div className="flex flex-col md:flex-row items-center gap-8">
            <ScoreGauge score={product.score} label={`${product.scoreLabel} ${product.score >= 80 ? "✅" : ""}`} />
            <div className="flex-1 w-full">
              <p className="text-stone-500 text-sm mb-6">
                This product shows sustained quality with consistent positive reviews over time.
              </p>
              <ScoreBar label="Viral Velocity" score={82} detail="Gradual growth ✅" />
              <ScoreBar label="Sentiment Consistency" score={90} detail="Very stable ✅" />
              <ScoreBar label="Paid Promotion %" score={28} detail="Mostly organic ✅" />
              <ScoreBar label="Platform Consensus" score={95} detail="All platforms agree ✅" />
              <ScoreBar label="Review Depth" score={88} detail="Detailed reviews ✅" />
            </div>
          </div>
        </section>

        {/* SECTION 2: Sentiment */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
          <h3 className="text-2xl font-black text-stone-900 mb-2">What People Think</h3>
          <div className="flex items-center gap-3 mb-6">
            <span className="text-3xl font-black text-green-600">{product.sentiment}%</span>
            <span className="text-stone-500">Positive</span>
          </div>
          <div className="w-full h-3 bg-stone-100 rounded-full overflow-hidden mb-8">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
              style={{ width: `${product.sentiment}%` }}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {(["reddit", "tiktok", "youtube", "instagram"] as const).map((platform) => {
              const p = product.platforms[platform];
              const icon = { reddit: "💬", tiktok: "🎵", youtube: "📺", instagram: "📸" }[platform];
              return (
                <div key={platform} className="bg-stone-50 rounded-xl p-4 border border-stone-100">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{icon}</span>
                    <span className="font-bold text-sm text-stone-900 capitalize">{platform}</span>
                  </div>
                  <p className={`text-2xl font-black ${p.sentiment >= 80 ? "text-green-600" : p.sentiment >= 60 ? "text-yellow-600" : "text-red-500"}`}>
                    {p.sentiment}%
                  </p>
                  <p className="text-xs text-stone-400">{p.mentions.toLocaleString()} mentions</p>
                  <span className="inline-block mt-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white border border-stone-100 text-stone-500">
                    {p.badge}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: Transcripts */}
        {product.transcripts.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
            <h3 className="text-2xl font-black text-stone-900 mb-1">
              What Creators Actually Said 🎬
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              We analyzed {product.mentions.toLocaleString()} reviews and extracted these quotes
            </p>
            {/* Filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", "positive", "negative", "sponsored", "organic"].map((f) => (
                <button
                  key={f}
                  onClick={() => setTranscriptFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    transcriptFilter === f
                      ? "bg-orange-50 text-orange-600 border-orange-200"
                      : "bg-stone-50 text-stone-500 border-stone-100 hover:border-stone-200"
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
            <div className="space-y-5">
              {filteredTranscripts.map((t, i) => {
                const authColor =
                  t.authenticity >= 80
                    ? "text-green-600 bg-green-50 border-green-100"
                    : t.authenticity >= 60
                    ? "text-yellow-600 bg-yellow-50 border-yellow-200"
                    : "text-red-500 bg-red-50 border-red-100";
                return (
                  <div key={i} className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                    {/* Video thumbnail */}
                    <div className="w-full h-32 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden bg-stone-50">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                        <Play size={20} className="text-stone-700 ml-0.5" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-stone-900/70 text-white rounded-md px-2 py-0.5 text-xs">
                        {t.duration}
                      </div>
                      <div className="absolute bottom-2 right-2 text-xs text-stone-500 bg-white/80 rounded-md px-2 py-0.5">
                        {t.views} views
                      </div>
                    </div>

                    {/* Creator */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full shrink-0 bg-orange-100" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-stone-900">
                          {t.creator}{" "}
                          {t.verified && <CheckCircle size={12} className="inline text-orange-400" />}
                        </p>
                        <p className="text-stone-400 text-xs">{t.followers} followers</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${authColor}`}>
                          {t.authenticity}/100
                        </span>
                        {t.sponsored && (
                          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                            <AlertTriangle size={10} /> Paid
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quotes */}
                    {t.quotes.slice(0, expandedTranscripts.includes(i) ? undefined : 1).map((q, qi) => (
                      <div key={qi} className="bg-white rounded-lg p-3 mb-2 border border-stone-100">
                        <p className="text-sm text-stone-600 italic">
                          💬 &ldquo;{q}&rdquo;
                        </p>
                      </div>
                    ))}

                    {/* Sentiment + aspects */}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-stone-500">
                        {t.sentimentEmoji} {t.sentimentLabel} ({t.sentimentScore}/100)
                      </span>
                      {t.aspects.map((a) => (
                        <span
                          key={a.name}
                          className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                            a.status === "positive"
                              ? "bg-green-50 text-green-600"
                              : a.status === "warning"
                              ? "bg-yellow-50 text-yellow-600"
                              : "bg-red-50 text-red-500"
                          }`}
                        >
                          {a.status === "positive" ? "✅" : "⚠️"} {a.name}
                        </span>
                      ))}
                    </div>

                    {t.quotes.length > 1 && (
                      <button
                        onClick={() => toggleTranscript(i)}
                        className="mt-3 text-xs font-semibold text-orange-600 hover:underline"
                      >
                        {expandedTranscripts.includes(i)
                          ? "Show Less ▲"
                          : `See Full Transcript ▼`}
                      </button>
                    )}

                    {t.sponsored && (
                      <p className="mt-2 text-[10px] text-yellow-600 bg-yellow-50 rounded-lg px-3 py-1.5 border border-yellow-100">
                        ⚠️ High praise + sponsorship = take with grain of salt
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* SECTION 4: Pros vs Cons */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Pros */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 anim-left">
            <h3 className="text-xl font-black text-stone-900 mb-5 flex items-center gap-2">
              <span className="text-green-500">✅</span> Pros
            </h3>
            <div className="space-y-4">
              {product.pros
                .slice(0, showMorePros ? undefined : 3)
                .map((pro) => (
                  <div key={pro.title} className="flex gap-3">
                    <span className="text-xl shrink-0">{pro.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-stone-900">{pro.title}</p>
                      <p className="text-xs text-stone-400">
                        Mentioned {pro.count} times
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{pro.detail}</p>
                    </div>
                  </div>
                ))}
            </div>
            {product.pros.length > 3 && (
              <button
                onClick={() => setShowMorePros(!showMorePros)}
                className="mt-4 text-xs font-semibold text-orange-600 hover:underline"
              >
                {showMorePros
                  ? "Show less ▲"
                  : `Show ${product.pros.length - 3} more pros ▼`}
              </button>
            )}
          </div>

          {/* Cons */}
          <div className="bg-white rounded-3xl border border-stone-100 shadow-sm p-6 anim-right anim-d1">
            <h3 className="text-xl font-black text-stone-900 mb-5 flex items-center gap-2">
              <span className="text-yellow-500">⚠️</span> Cons
            </h3>
            <div className="space-y-4">
              {product.cons
                .slice(0, showMoreCons ? undefined : 3)
                .map((con) => (
                  <div key={con.title} className="flex gap-3">
                    <span className="text-xl shrink-0">{con.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-stone-900">{con.title}</p>
                      <p className="text-xs text-stone-400">
                        Mentioned {con.count} times
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">{con.detail}</p>
                    </div>
                  </div>
                ))}
            </div>
            {product.cons.length > 3 && (
              <button
                onClick={() => setShowMoreCons(!showMoreCons)}
                className="mt-4 text-xs font-semibold text-orange-600 hover:underline"
              >
                {showMoreCons
                  ? "Show less ▲"
                  : `Show ${product.cons.length - 3} more cons ▼`}
              </button>
            )}
          </div>
        </section>

        {/* SECTION 5: Community Breakdown */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
          <h3 className="text-2xl font-black text-stone-900 mb-6">Who Recommends This?</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 stagger-children">
            {([
              { platform: "Reddit", sub: "r/SkincareAddiction", icon: "💬", comment: "Holy grail for dry skin. Cheap and actually works." },
              { platform: "TikTok", sub: "#SkincareRoutine", icon: "🎵", comment: "Mixed reviews on texture, but most love results." },
              { platform: "YouTube", sub: "Expert Reviews", icon: "📺", comment: "Dr. Dray recommends for barrier repair." },
              { platform: "Instagram", sub: "#Skincare", icon: "📸", comment: "Aesthetic posts showing before/after results." },
            ] as const).map((item) => {
              const p = product.platforms[item.platform.toLowerCase() as keyof typeof product.platforms];
              return (
                <div key={item.platform} className="bg-stone-50 rounded-xl p-4 border border-stone-100 anim-scale hover:-translate-y-1 hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{item.icon}</span>
                    <div>
                      <p className="font-bold text-sm text-stone-900">{item.platform}</p>
                      <p className="text-[10px] text-stone-400">{item.sub}</p>
                    </div>
                  </div>
                  <p className={`text-xl font-black ${p.sentiment >= 80 ? "text-green-600" : "text-yellow-600"}`}>
                    {p.sentiment}% positive
                  </p>
                  <p className="text-xs text-stone-400 mb-2">{p.mentions} mentions</p>
                  <div className="bg-white rounded-lg p-2.5 border border-stone-100">
                    <p className="text-xs text-stone-500 italic">
                      💬 &ldquo;{item.comment}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 6: Claim Verification */}
        {product.claims.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
            <h3 className="text-2xl font-black text-stone-900 mb-1">
              Fact-Checking the Marketing 🔍
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              We verified brand claims against real user experiences
            </p>
            <div className="space-y-5">
              {product.claims.map((claim, i) => (
                <div key={i} className="bg-stone-50 rounded-xl p-5 border border-stone-100">
                  <p className="text-xs text-stone-400 font-semibold uppercase tracking-wider mb-1">
                    Brand Says:
                  </p>
                  <p className="font-bold text-stone-900 mb-4">
                    &ldquo;{claim.claim}&rdquo;
                  </p>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center">
                      <p className="text-xl font-black text-stone-900">{claim.testedBy}</p>
                      <p className="text-[10px] text-stone-400">Tested by</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-green-600">{claim.confirmed}</p>
                      <p className="text-[10px] text-stone-400">Confirmed</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xl font-black text-red-500">{claim.disputed}</p>
                      <p className="text-[10px] text-stone-400">Disputed</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="w-full h-2 bg-stone-200 rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{ width: `${(claim.confirmed / claim.testedBy) * 100}%` }}
                    />
                  </div>
                  {/* Quotes */}
                  <div className="space-y-2 mb-4">
                    {claim.quotes.map((q, qi) => (
                      <div key={qi} className="flex items-start gap-2 text-xs">
                        <span>{q.positive ? "✅" : "⚠️"}</span>
                        <p className="text-stone-500 italic">
                          &ldquo;{q.text}&rdquo; — <span className="font-medium">{q.author}</span>
                        </p>
                      </div>
                    ))}
                  </div>
                  {/* Verdict */}
                  <div className={`rounded-lg px-4 py-2.5 border ${
                    claim.verdictColor === "green"
                      ? "bg-green-50 border-green-100"
                      : "bg-yellow-50 border-yellow-200"
                  }`}>
                    <p className={`text-sm font-bold ${
                      claim.verdictColor === "green" ? "text-green-700" : "text-yellow-700"
                    }`}>
                      Verdict: {claim.verdict}
                    </p>
                    <p className="text-xs text-stone-500 mt-0.5">{claim.reality}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* SECTION 7: Alternatives */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-8 fade-in-section">
          <h3 className="text-2xl font-black text-stone-900 mb-6">You Might Also Like</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {products
              .filter((p) => p.id !== product.id)
              .slice(0, 3)
              .map((alt) => (
                <Link
                  key={alt.id}
                  href={`/product/${alt.id}`}
                  className="shrink-0 w-56 bg-stone-50 rounded-xl p-4 border border-stone-100 hover:border-orange-200 hover:shadow-md transition-all hover:-translate-y-1.5 hover:bg-white"
                >
                  <div className="w-full h-24 rounded-lg bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mb-3">
                    <span className="text-3xl">🧴</span>
                  </div>
                  <p className="font-bold text-sm text-stone-900 mb-0.5 line-clamp-1">{alt.name}</p>
                  <p className="text-xs text-stone-400 mb-2">{alt.brand}</p>
                  <div className="flex items-center justify-between">
                    <span className="font-black text-stone-900">${alt.price.toFixed(2)}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                      alt.score >= 80 ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                    }`}>
                      {alt.score}/100
                    </span>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      {/* SECTION 8: Sticky CTA Footer */}
      <div
        ref={stickyRef}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-t border-stone-100"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-bold text-sm text-stone-900">{product.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-stone-900">${product.price.toFixed(2)}</span>
              <span className="text-stone-300">&bull;</span>
              <span className="flex items-center gap-1 text-green-600 font-semibold">
                {product.score >= 80 && <CheckCircle size={12} />}
                {product.scoreLabel} &bull; {product.score}/100
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setSaved(!saved)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                saved
                  ? "border-orange-500 text-orange-600 bg-orange-50/60"
                  : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              {saved ? "💖 Saved" : "🤍 Save"}
            </button>
            <button
              onClick={() => setShowWhereToBuy(!showWhereToBuy)}
              className="bg-orange-600 hover:bg-orange-700 text-white transition px-6 py-2.5 rounded-xl text-sm font-bold text-white"
            >
              Where to Buy &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
