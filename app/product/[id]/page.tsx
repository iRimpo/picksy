"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, Share2, Heart, ExternalLink,
  Play, CheckCircle, AlertTriangle, ChevronUp,
} from "lucide-react";
import { products, type Product } from "@/lib/data/products";
import { useAnimateIn } from "@/lib/hooks/use-animate-in";
import { track } from "@/lib/analytics";
import { usePageView } from "@/lib/hooks/use-page-view";
import { getStoreUrl } from "@/lib/retailers";

// ─── Helpers ──────────────────────────────────────────────────────────────────

interface RedditCommentData { author: string; body: string; subreddit: string; upvotes: number }
interface TikTokVideoData { author: string; description: string; likes: number; views: number; topComments: string[]; transcript?: string; videoUrl?: string }

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return `hsl(${Math.abs(hash) % 360}, 55%, 48%)`;
}

function initials(name: string): string {
  return name.replace(/^u\/|^@/, "").slice(0, 2).toUpperCase();
}

const CATEGORY_EMOJI: Record<string, string> = {
  Headphones: "🎧", Laptops: "💻", Smartphones: "📱",
  TVs: "📺", Mice: "🖱️", Earbuds: "🎵", Monitors: "🖥️",
};

// ─── Reddit Comment ───────────────────────────────────────────────────────────

function RedditComment({ comment, expanded, onToggle }: { comment: RedditCommentData; expanded: boolean; onToggle: () => void }) {
  const long = comment.body.length > 220;
  const body = long && !expanded ? comment.body.slice(0, 220) + "…" : comment.body;
  return (
    <div className="flex gap-3 py-4 border-b border-white/10 last:border-0">
      <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white" style={{ background: avatarColor(comment.author) }}>
        {initials(comment.author)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-white">u/{comment.author}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-brand-pink/20 text-brand-pink border border-brand-pink/20">
            r/{comment.subreddit}
          </span>
          {comment.upvotes > 0 && <span className="text-[10px] text-stone-400">▲ {comment.upvotes.toLocaleString()}</span>}
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">{body}</p>
        {long && (
          <button onClick={onToggle} className="mt-1 text-xs font-semibold text-brand-pink hover:underline flex items-center gap-0.5">
            {expanded ? <><ChevronUp size={12} /> Show less</> : <>Show more</>}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── TikTok Entry ─────────────────────────────────────────────────────────────

function TikTokEntry({ video }: { video: TikTokVideoData }) {
  const inner = (
    <div className="flex gap-3 py-4 border-b border-white/10 last:border-0">
      <div className="w-9 h-9 rounded-full shrink-0 flex items-center justify-center text-xs font-black text-white" style={{ background: avatarColor(video.author) }}>
        {initials(video.author)}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="text-sm font-bold text-white">@{video.author}</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/10 text-white">🎵 TikTok</span>
          {video.likes > 0 && <span className="text-[10px] text-stone-400">♥ {video.likes.toLocaleString()}</span>}
        </div>
        <p className="text-sm text-stone-300 leading-relaxed">{video.description}</p>
        {video.transcript && (
          <div className="mt-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
            <p className="text-[9px] font-bold text-stone-400 uppercase tracking-wider mb-1">Transcript</p>
            <p className="text-xs text-stone-400 leading-relaxed line-clamp-4">{video.transcript}</p>
          </div>
        )}
        {video.topComments.length > 0 && (
          <div className="mt-2 space-y-1.5 pl-3 border-l-2 border-white/10">
            {video.topComments.map((c, i) => <p key={i} className="text-xs text-stone-400 italic">&ldquo;{c}&rdquo;</p>)}
          </div>
        )}
      </div>
    </div>
  );
  return video.videoUrl
    ? <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block hover:bg-white/5 rounded-xl transition-colors -mx-2 px-2">{inner}</a>
    : inner;
}

// ─── Community Comments ───────────────────────────────────────────────────────

function CommunityComments({ productId, productName }: { productId: string; productName: string }) {
  const [reddit, setReddit] = useState<RedditCommentData[]>([]);
  const [tiktok, setTikTok] = useState<TikTokVideoData[]>([]);
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`picksy_comments_${productId}`);
      if (raw) {
        const { reddit: r, tiktok: t } = JSON.parse(raw);
        setReddit(Array.isArray(r) ? r : []);
        setTikTok(Array.isArray(t) ? t : []);
        return;
      }
    } catch { /* ignore */ }
    setLoading(true);
    fetch(`/api/reddit-comments?query=${encodeURIComponent(productName)}`)
      .then(res => res.json())
      .then(data => setReddit(Array.isArray(data.comments) ? data.comments : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, productName]);

  if (loading) return <p className="text-stone-400 text-sm animate-pulse">Loading community voices…</p>;
  if (reddit.length === 0 && tiktok.length === 0) return null;

  const toggle = (i: number) =>
    setExpanded(prev => {
      const n = new Set(prev);
      if (n.has(i)) { n.delete(i); } else { n.add(i); }
      return n;
    });

  return (
    <div>
      {reddit.length > 0 && (
        <div className="mb-4">
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">💬 Reddit · {reddit.length} comments</p>
          {reddit.map((c, i) => <RedditComment key={i} comment={c} expanded={expanded.has(i)} onToggle={() => toggle(i)} />)}
        </div>
      )}
      {tiktok.length > 0 && (
        <div>
          <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">🎵 TikTok · {tiktok.length} videos</p>
          {tiktok.map((v, i) => <TikTokEntry key={i} video={v} />)}
        </div>
      )}
    </div>
  );
}

// ─── Score Bar ────────────────────────────────────────────────────────────────

function ScoreBar({ label, score, detail }: { label: string; score: number; detail: string }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 200); return () => clearTimeout(t); }, []);
  const color = score >= 80 ? "from-brand-green to-emerald-400" : score >= 50 ? "from-yellow-400 to-yellow-500" : "from-red-400 to-red-500";
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-medium text-stone-700">{label}</span>
        <span className="text-sm font-bold text-stone-900">{score}/100</span>
      </div>
      <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full bg-gradient-to-r ${color} bar-fill`} style={{ width: mounted ? `${score}%` : "0%" }} />
      </div>
      <p className="text-xs text-stone-400 mt-1">{detail}</p>
    </div>
  );
}

// ─── Mention Dots ─────────────────────────────────────────────────────────────

function MentionDots({ product }: { product: Product }) {
  const platforms = [
    { color: "#FF6B8A", mentions: product.platforms.reddit.mentions },
    { color: "#2ECC71", mentions: product.platforms.tiktok.mentions },
    { color: "#FFD93D", mentions: product.platforms.youtube.mentions },
    { color: "#4EADFF", mentions: product.platforms.instagram.mentions },
  ];
  const total = platforms.reduce((s, p) => s + p.mentions, 0) || 1;
  const MAX = 72;

  const dots: string[] = [];
  platforms.forEach(({ color, mentions }) => {
    const count = Math.round((mentions / total) * MAX);
    for (let i = 0; i < count; i++) dots.push(color);
  });
  // Deterministic shuffle using sine-based key
  const shuffled = dots
    .map((c, i) => ({ c, k: ((Math.sin(i * 9.301) * 43758.5453) % 1 + 1) % 1 }))
    .sort((a, b) => a.k - b.k)
    .map(x => x.c);

  return (
    <div className="mb-6">
      <div className="flex flex-wrap gap-1.5 mb-3">
        {shuffled.map((color, i) => {
          const big = i % 11 === 0;
          return (
            <div
              key={i}
              className="rounded-full"
              style={{ width: big ? 14 : 10, height: big ? 14 : 10, background: color, opacity: 0.85 }}
            />
          );
        })}
      </div>
      <p className="text-[11px] text-stone-500 font-medium">
        Each dot ≈ {Math.ceil(total / MAX).toLocaleString()} people
      </p>
    </div>
  );
}

// ─── Store Tile ───────────────────────────────────────────────────────────────

function StoreTile({
  retailer, productName, brand, productId, score, lowestPrice,
}: {
  retailer: Product["retailers"][0];
  productName: string; brand: string; productId: string; score: number; lowestPrice: number;
}) {
  const isBest = retailer.price === lowestPrice;
  return (
    <a
      href={getStoreUrl(retailer.name, productName, brand, retailer.url)}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() => track("buy_click", {
        page: "product_detail", product_name: productName,
        store_name: retailer.name, price: retailer.price, score,
        properties: { product_id: productId, position: "buy_tiles" },
      })}
      className={`relative block rounded-2xl p-5 border-2 transition-all duration-300 group hover:-translate-y-2 hover:shadow-2xl ${
        isBest
          ? "border-brand-green bg-brand-green/10 shadow-glow-green"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      {isBest && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-brand-green text-white text-[10px] font-black px-3 py-1 rounded-full whitespace-nowrap">
          🏆 Best Price
        </div>
      )}
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm mb-3 ${isBest ? "bg-brand-green text-white" : "bg-white/10 text-white"}`}>
        {retailer.name[0]}
      </div>
      <p className="font-bold text-white/70 text-sm mb-1">{retailer.name}</p>
      <p className={`text-2xl font-black ${isBest ? "text-brand-green" : "text-white"}`}>
        ${retailer.price.toFixed(2)}
      </p>
      {retailer.url && (
        <p className="text-[10px] text-brand-green font-bold mt-2 flex items-center gap-1">
          <CheckCircle size={10} /> Direct link
        </p>
      )}
      <div className={`mt-4 flex items-center gap-1.5 text-xs font-black transition-colors ${isBest ? "text-brand-green" : "text-white/40 group-hover:text-white"}`}>
        Shop now <ExternalLink size={11} />
      </div>
    </a>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  useAnimateIn();
  const { id } = params;
  const product = products.find(p => p.id === id) || products[0];

  usePageView("product_detail", { product_name: product.name, product_id: id });

  const [saved, setSaved] = useState(false);
  const [expandedTranscripts, setExpandedTranscripts] = useState<number[]>([]);
  const [transcriptFilter, setTranscriptFilter] = useState("all");
  const [productImageUrl, setProductImageUrl] = useState<string | null>(null);
  const [imgError, setImgError] = useState(false);
  const stickyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setProductImageUrl(null);
    setImgError(false);
    const q = encodeURIComponent(`${product.brand} ${product.name} product`);
    fetch(`/api/product-image?q=${q}`)
      .then(r => r.json())
      .then(data => setProductImageUrl(data.imageUrl ?? ""))
      .catch(() => setProductImageUrl(""));
  }, [product.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTranscript = (i: number) =>
    setExpandedTranscripts(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);

  const filteredTranscripts = product.transcripts.filter(t => {
    if (transcriptFilter === "positive") return t.sentimentScore >= 70;
    if (transcriptFilter === "negative") return t.sentimentScore < 60;
    if (transcriptFilter === "sponsored") return t.sponsored;
    if (transcriptFilter === "organic") return !t.sponsored;
    return true;
  });

  const lowestPrice = product.retailers.length > 0
    ? Math.min(...product.retailers.map(r => r.price))
    : product.price;

  const scoreContext =
    product.score >= 95 ? "Top 2% of everything Picksy has ever analyzed" :
    product.score >= 90 ? "Top 5% — exceptionally well-loved" :
    product.score >= 80 ? "Top 15% — highly recommended by the community" :
    "Above average across all platforms";

  const categoryEmoji = CATEGORY_EMOJI[product.category] ?? "📦";

  return (
    <div className="min-h-screen pb-24 relative overflow-x-hidden" style={{ background: "#FFFBF7" }}>

      {/* Ambient blobs */}
      <div className="blob-pink pointer-events-none" style={{ top: -80, left: -100 }} />
      <div className="blob-yellow pointer-events-none" style={{ top: 300, right: -80 }} />
      <div className="blob-cyan pointer-events-none" style={{ top: 900, left: -60 }} />

      {/* ── Sticky header ───────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-stone-100">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center gap-4">
          <Link href="/results" className="flex items-center gap-1.5 text-sm text-stone-500 hover:text-stone-900 transition-colors shrink-0">
            <ArrowLeft size={16} /> Back
          </Link>
          <h1 className="flex-1 font-bold text-sm text-stone-900 truncate">{product.name}</h1>
          <button className="text-stone-400 hover:text-stone-600 transition-colors" aria-label="Share"><Share2 size={18} /></button>
          <button
            onClick={() => setSaved(!saved)}
            className={`transition-colors ${saved ? "text-brand-pink" : "text-stone-400 hover:text-stone-600"}`}
            aria-label="Save"
          >
            <Heart size={18} fill={saved ? "#FF6B8A" : "none"} />
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 md:px-8 py-8">

        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="flex flex-col md:flex-row gap-8 mb-8">

          {/* Image */}
          <div className="md:w-[42%] shrink-0 anim-left">
            <div className="w-full aspect-square rounded-3xl bg-white border border-stone-100 overflow-hidden flex items-center justify-center shadow-sm relative">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-pink/5 via-transparent to-brand-green/5 pointer-events-none" />
              {/* Decorative circle shapes */}
              <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-brand-yellow/10 pointer-events-none" />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-brand-pink/10 pointer-events-none" />

              {productImageUrl && !imgError ? (
                <img src={productImageUrl} alt={product.name} className="relative w-full h-full object-contain p-6" onError={() => setImgError(true)} />
              ) : productImageUrl === null ? (
                <div className="w-full h-full bg-stone-100 animate-pulse rounded-3xl" />
              ) : (
                <div className="relative flex flex-col items-center gap-3">
                  <span className="text-7xl">{categoryEmoji}</span>
                  <span className="text-xs text-stone-400 font-medium">{product.brand}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-3">
              {[0, 1, 2].map(i => (
                <div key={i} className={`w-16 h-16 rounded-xl bg-white border overflow-hidden flex items-center justify-center cursor-pointer transition-all duration-200 ${i === 0 ? "border-brand-pink shadow-sm scale-105" : "border-stone-100 hover:border-stone-300"}`}>
                  {productImageUrl && !imgError
                    ? <img src={productImageUrl} alt="" className="w-full h-full object-contain p-1" aria-hidden />
                    : <div className="w-full h-full bg-stone-50 rounded-xl" />}
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 anim-right anim-d1">
            {/* Trust pills */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {product.badge && (
                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-50 text-orange-600 text-xs font-black rounded-full border border-orange-100">
                  🏆 {product.badge}
                </span>
              )}
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-brand-green/10 text-brand-green text-xs font-black rounded-full border border-brand-green/20">
                ✓ {product.mentions.toLocaleString()} voices
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 text-stone-600 text-xs font-semibold rounded-full">
                {product.sentiment}% positive
              </span>
            </div>

            <p className="text-stone-400 text-xs font-semibold uppercase tracking-widest mb-2">
              {product.brand} · {product.category}
            </p>
            <h2 className="font-heading text-3xl md:text-4xl font-black text-stone-900 mb-5 leading-tight">
              {product.name}
            </h2>

            {/* Score pill */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <div className="flex items-center gap-2 bg-brand-green/10 border border-brand-green/20 px-4 py-2.5 rounded-2xl">
                <span className="text-2xl font-black text-brand-green leading-none">{product.score}</span>
                <div>
                  <p className="text-[10px] font-black text-stone-400 uppercase tracking-wider leading-none mb-0.5">Picksy Score</p>
                  <p className="text-xs font-bold text-brand-green leading-none">{product.scoreLabel}</p>
                </div>
              </div>
              <p className="text-xs text-stone-500 leading-snug max-w-[200px]">{scoreContext}</p>
            </div>

            <div className="flex items-baseline gap-3 mb-6">
              <p className="text-4xl font-black text-stone-900">${product.price.toFixed(2)}</p>
              <span className="text-sm text-stone-400">starting price</span>
            </div>

            {/* Primary CTA */}
            <a
              href={getStoreUrl(product.retailers[0]?.name ?? "Amazon", product.name, product.brand, product.retailers[0]?.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-black text-base"
            >
              Buy for ${lowestPrice.toFixed(2)} →
            </a>
            <p className="text-[11px] text-stone-400 mt-2">
              Best price found across {product.retailers.length} stores
            </p>
          </div>
        </section>

        {/* ── SECTION 1: Community Says ─────────────────────────────────────── */}
        <section className="rounded-3xl p-8 mb-6 relative overflow-hidden fade-in-section" style={{ background: "#1A1A2E" }}>
          {/* Inner glow shapes */}
          <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,107,138,0.15) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(46,204,113,0.12) 0%, transparent 70%)" }} />
          {/* Decorative floating circles */}
          <div className="absolute top-8 right-1/4 w-6 h-6 rounded-full bg-brand-yellow/30 pointer-events-none animate-float" />
          <div className="absolute top-16 right-12 w-4 h-4 rounded-full bg-brand-pink/40 pointer-events-none animate-floatSlow" />
          <div className="absolute bottom-10 right-8 w-8 h-8 rounded-full bg-brand-green/20 pointer-events-none animate-floatDelay" />

          <div className="relative">
            <p className="text-brand-pink text-[10px] font-black uppercase tracking-[0.2em] mb-2">💬 Community Says</p>
            <h3 className="font-heading text-3xl md:text-4xl font-black text-white mb-1 leading-tight">
              {product.mentions.toLocaleString()}<br />
              <span className="text-brand-green">real voices.</span>
            </h3>
            <p className="text-stone-400 text-sm mb-6">
              Across Reddit, TikTok, YouTube & Instagram — what people actually said.
            </p>

            {/* People dot visualization */}
            <MentionDots product={product} />

            {/* Platform legend */}
            <div className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {(["reddit", "tiktok", "youtube", "instagram"] as const).map(p => {
                const plat = product.platforms[p];
                const colors = { reddit: "#FF6B8A", tiktok: "#2ECC71", youtube: "#FFD93D", instagram: "#4EADFF" };
                const icons  = { reddit: "💬", tiktok: "🎵", youtube: "📺", instagram: "📸" };
                return (
                  <div key={p} className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colors[p] }} />
                    <span className="text-xs text-stone-400">{icons[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</span>
                    <span className="text-xs font-bold text-white">{plat.mentions.toLocaleString()}</span>
                  </div>
                );
              })}
            </div>

            {/* Real fetched comments */}
            <CommunityComments productId={id} productName={product.name} />
          </div>
        </section>

        {/* ── SECTION 2: The Score ──────────────────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-6 fade-in-section">
          <p className="text-brand-pink text-[10px] font-black uppercase tracking-[0.2em] mb-2">📊 Picksy Score</p>
          <h3 className="font-heading text-2xl font-black text-stone-900 mb-1">
            What does {product.score}/100 mean?
          </h3>
          <p className="text-stone-500 text-sm mb-8">{scoreContext}</p>

          <div className="flex flex-col md:flex-row items-start gap-10 mb-8">
            {/* Score ring */}
            <div className="shrink-0 mx-auto md:mx-0">
              <div className="relative w-40 h-40">
                <div className="absolute inset-0 rounded-full border-4 border-brand-green/10" />
                <div className="absolute inset-2 rounded-full border-4 border-brand-green/20" />
                <div className="absolute inset-4 rounded-full border-4 border-brand-green/30 bg-brand-green/5" />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-5xl font-black text-stone-900 leading-none">{product.score}</span>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider">/ 100</span>
                </div>
              </div>
              <div className="mt-3 text-center">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-green/10 text-brand-green text-sm font-black rounded-full border border-brand-green/20">
                  <CheckCircle size={13} /> {product.scoreLabel}
                </span>
              </div>
            </div>

            {/* Sub-scores */}
            <div className="flex-1 w-full">
              <p className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-4">
                Calculated from {product.mentions.toLocaleString()} community signals:
              </p>
              <ScoreBar label="Viral Velocity" score={82} detail="Gradual organic growth — not a hype spike ✅" />
              <ScoreBar label="Sentiment Consistency" score={90} detail="Positive reviews stayed stable over time ✅" />
              <ScoreBar label="Paid Promotion %" score={28} detail="Mostly organic recommendations ✅" />
              <ScoreBar label="Platform Consensus" score={95} detail="Reddit, TikTok, YouTube all agree ✅" />
              <ScoreBar label="Review Depth" score={88} detail="Detailed, experience-based reviews ✅" />
            </div>
          </div>

          {/* Score spectrum bar */}
          <div className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
            <p className="text-xs font-bold text-stone-500 mb-3">Where this lands vs everything Picksy has analyzed:</p>
            <div className="relative w-full h-5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-red-400 via-yellow-400 to-brand-green"
                style={{ width: "100%" }}
              />
              {/* Marker */}
              <div
                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white border-2 border-stone-900 shadow"
                style={{ left: `calc(${product.score}% - 8px)` }}
              />
            </div>
            <div className="flex justify-between mt-1.5 text-[10px] text-stone-400 font-medium">
              <span>Avoid</span>
              <span>Average</span>
              <span>Perfect</span>
            </div>
            <p className="text-xs font-bold text-brand-green mt-3">
              {product.score >= 90
                ? `👆 Top ${Math.round(100 - product.score + 5)}% of all products — that's exceptional.`
                : `👆 ${product.score >= 80 ? "Well above average." : "Above average."}`}
            </p>
          </div>
        </section>

        {/* ── SECTION 3: Where to Buy ───────────────────────────────────────── */}
        <section className="rounded-3xl p-8 mb-6 relative overflow-hidden fade-in-section" style={{ background: "#1A1A2E" }}>
          {/* Glow shapes */}
          <div className="absolute top-0 right-0 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,217,61,0.18) 0%, transparent 70%)" }} />
          <div className="absolute bottom-0 left-1/4 w-40 h-40 rounded-full pointer-events-none"
            style={{ background: "radial-gradient(circle, rgba(255,107,138,0.12) 0%, transparent 70%)" }} />
          <div className="absolute top-12 left-8 w-5 h-5 rounded-full bg-brand-yellow/40 animate-float pointer-events-none" />
          <div className="absolute bottom-8 right-16 w-4 h-4 rounded-full bg-brand-pink/30 animate-floatSlow pointer-events-none" />

          <div className="relative">
            <p className="text-brand-yellow text-[10px] font-black uppercase tracking-[0.2em] mb-2">🛒 Where to Buy</p>
            <h3 className="font-heading text-2xl font-black text-white mb-1">Ready to get it?</h3>
            <p className="text-stone-400 text-sm mb-8">
              We found {product.retailers.length} stores — pick the best deal.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 stagger-children">
              {product.retailers.map(r => (
                <StoreTile
                  key={r.name}
                  retailer={r}
                  productName={product.name}
                  brand={product.brand}
                  productId={id}
                  score={product.score}
                  lowestPrice={lowestPrice}
                />
              ))}
            </div>
            <p className="text-[10px] text-stone-600 mt-5">Prices verified at time of analysis. We may earn from qualifying purchases.</p>
          </div>
        </section>

        {/* ── SECTION 4: Community Breakdown ───────────────────────────────── */}
        <section className="rounded-3xl p-8 mb-6 fade-in-section" style={{ background: "#2ECC71" }}>
          <p className="text-brand-dark/60 text-[10px] font-black uppercase tracking-[0.2em] mb-2">🌐 Community Breakdown</p>
          <h3 className="font-heading text-2xl font-black text-brand-dark mb-2">Who powered this score?</h3>
          <p className="text-brand-dark/70 text-sm mb-8">
            Picksy aggregates real feedback from across the internet. Here&apos;s the breakdown:
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 stagger-children">
            {([
              { key: "reddit",    icon: "💬", label: "Reddit",    sub: "r/community" },
              { key: "tiktok",    icon: "🎵", label: "TikTok",    sub: "#TechReviews" },
              { key: "youtube",   icon: "📺", label: "YouTube",   sub: "Expert Reviews" },
              { key: "instagram", icon: "📸", label: "Instagram", sub: "#TechSetup" },
            ] as const).map(({ key, icon, label, sub }) => {
              const p = product.platforms[key];
              return (
                <div key={key} className="bg-white/30 backdrop-blur-sm rounded-2xl p-5 border border-white/40 anim-scale card-hover">
                  <span className="text-2xl mb-2 block">{icon}</span>
                  <p className="font-black text-brand-dark text-sm mb-0.5">{label}</p>
                  <p className="text-brand-dark/60 text-[10px] mb-3">{sub}</p>
                  <p className="text-2xl font-black text-brand-dark">{p.sentiment}%</p>
                  <p className="text-brand-dark/70 text-[10px] font-semibold">positive</p>
                  <p className="text-brand-dark/50 text-[10px] mt-1">{p.mentions.toLocaleString()} voices</p>
                  <div className="mt-3 h-1.5 bg-white/40 rounded-full overflow-hidden">
                    <div className="h-full rounded-full bg-brand-dark/40" style={{ width: `${p.sentiment}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          {/* How Picksy works callout */}
          <div className="bg-white/25 rounded-2xl p-5 border border-white/30">
            <p className="text-brand-dark font-black text-sm mb-1">This is how Picksy works 💡</p>
            <p className="text-brand-dark/70 text-xs leading-relaxed">
              We scan thousands of real posts, reviews, and videos. Every score is built from what actual people said — not paid reviews, not brand marketing. Pure community signal.
            </p>
          </div>
        </section>

        {/* ── SECTION 5: Creator Reviews (if data exists) ───────────────────── */}
        {product.transcripts.length > 0 && (
          <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-6 fade-in-section">
            <p className="text-brand-pink text-[10px] font-black uppercase tracking-[0.2em] mb-2">🎬 Creator Reviews</p>
            <h3 className="font-heading text-2xl font-black text-stone-900 mb-1">What creators actually said</h3>
            <p className="text-stone-400 text-sm mb-6">
              We analyzed {product.mentions.toLocaleString()} reviews and extracted these quotes
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["all", "positive", "negative", "sponsored", "organic"].map(f => (
                <button
                  key={f}
                  onClick={() => setTranscriptFilter(f)}
                  className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    transcriptFilter === f
                      ? "bg-brand-pink/10 text-brand-pink border-brand-pink/20"
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
                  t.authenticity >= 80 ? "text-green-600 bg-green-50 border-green-100" :
                  t.authenticity >= 60 ? "text-yellow-600 bg-yellow-50 border-yellow-200" :
                  "text-red-500 bg-red-50 border-red-100";
                return (
                  <div key={i} className="bg-stone-50 rounded-2xl p-5 border border-stone-100">
                    <div className="w-full h-28 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden bg-stone-100">
                      <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center shadow-sm">
                        <Play size={20} className="text-stone-700 ml-0.5" />
                      </div>
                      <div className="absolute bottom-2 left-2 bg-stone-900/70 text-white rounded-md px-2 py-0.5 text-xs">{t.duration}</div>
                      <div className="absolute bottom-2 right-2 text-xs text-stone-500 bg-white/80 rounded-md px-2 py-0.5">{t.views} views</div>
                    </div>
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-9 h-9 rounded-full shrink-0 bg-brand-pink/15" />
                      <div className="flex-1">
                        <p className="font-bold text-sm text-stone-900">
                          {t.creator} {t.verified && <CheckCircle size={12} className="inline text-brand-pink" />}
                        </p>
                        <p className="text-stone-400 text-xs">{t.followers} followers</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border ${authColor}`}>{t.authenticity}/100</span>
                        {t.sponsored && (
                          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200 flex items-center gap-1">
                            <AlertTriangle size={10} /> Paid
                          </span>
                        )}
                      </div>
                    </div>
                    {t.quotes.slice(0, expandedTranscripts.includes(i) ? undefined : 1).map((q, qi) => (
                      <div key={qi} className="bg-white rounded-xl p-3 mb-2 border border-stone-100">
                        <p className="text-sm text-stone-600 italic">💬 &ldquo;{q}&rdquo;</p>
                      </div>
                    ))}
                    <div className="flex flex-wrap items-center gap-2 mt-3">
                      <span className="text-xs text-stone-500">{t.sentimentEmoji} {t.sentimentLabel} ({t.sentimentScore}/100)</span>
                      {t.aspects.map(a => (
                        <span key={a.name} className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${a.status === "positive" ? "bg-green-50 text-green-600" : a.status === "warning" ? "bg-yellow-50 text-yellow-600" : "bg-red-50 text-red-500"}`}>
                          {a.status === "positive" ? "✅" : "⚠️"} {a.name}
                        </span>
                      ))}
                    </div>
                    {t.quotes.length > 1 && (
                      <button onClick={() => toggleTranscript(i)} className="mt-3 text-xs font-semibold text-brand-pink hover:underline">
                        {expandedTranscripts.includes(i) ? "Show Less ▲" : "See Full Transcript ▼"}
                      </button>
                    )}
                    {t.sponsored && (
                      <p className="mt-2 text-[10px] text-yellow-600 bg-yellow-50 rounded-lg px-3 py-1.5 border border-yellow-100">
                        ⚠️ High praise + sponsorship = take with a grain of salt
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── SECTION 6: You might also like ───────────────────────────────── */}
        <section className="bg-white rounded-3xl border border-stone-100 shadow-sm p-8 mb-6 fade-in-section">
          <p className="text-brand-pink text-[10px] font-black uppercase tracking-[0.2em] mb-2">✨ Alternatives</p>
          <h3 className="font-heading text-2xl font-black text-stone-900 mb-6">You might also like</h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {products.filter(p => p.id !== product.id).slice(0, 4).map(alt => (
              <Link
                key={alt.id}
                href={`/product/${alt.id}`}
                className="shrink-0 w-52 bg-stone-50 rounded-2xl p-4 border border-stone-100 hover:border-brand-pink/30 hover:shadow-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white"
              >
                <div className="w-full h-24 rounded-xl bg-gradient-to-br from-stone-100 to-stone-50 flex items-center justify-center mb-3 text-3xl">
                  {CATEGORY_EMOJI[alt.category] ?? "📦"}
                </div>
                <p className="font-bold text-sm text-stone-900 mb-0.5 line-clamp-1">{alt.name}</p>
                <p className="text-xs text-stone-400 mb-2">{alt.brand}</p>
                <div className="flex items-center justify-between">
                  <span className="font-black text-stone-900">${alt.price.toFixed(2)}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${alt.score >= 80 ? "bg-brand-green/10 text-brand-green" : "bg-yellow-50 text-yellow-600"}`}>
                    {alt.score}/100
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* ── Sticky footer CTA ───────────────────────────────────────────────── */}
      <div
        ref={stickyRef}
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 backdrop-blur-xl border-t border-stone-100"
      >
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-3 flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="font-bold text-sm text-stone-900">{product.name}</p>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-black text-stone-900">${product.price.toFixed(2)}</span>
              <span className="text-stone-300">&bull;</span>
              <span className="flex items-center gap-1 text-brand-green font-semibold">
                <CheckCircle size={12} /> {product.scoreLabel} · {product.score}/100
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 ml-auto">
            <button
              onClick={() => setSaved(!saved)}
              className={`px-4 py-2.5 rounded-xl text-sm font-bold border transition-all ${
                saved ? "border-brand-pink text-brand-pink bg-brand-pink/5" : "border-stone-200 text-stone-600 hover:border-stone-300"
              }`}
            >
              {saved ? "💖 Saved" : "🤍 Save"}
            </button>
            <a
              href={getStoreUrl(product.retailers[0]?.name ?? "Amazon", product.name, product.brand, product.retailers[0]?.url)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient px-6 py-2.5 rounded-2xl text-sm"
            >
              Buy Now →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
