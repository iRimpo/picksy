"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Search, Clock, AlertCircle, Check, CheckCircle,
  Store, ShieldCheck, Barcode, ChevronDown, Menu, Wand2,
} from "lucide-react";
import { useAnimateIn } from "@/lib/hooks/use-animate-in";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

// ─── Reddit SVG Icon ─────────────────────────────────────────────────────────
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor" aria-hidden>
      <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
    </svg>
  );
}

// ─── FAQ Item — smooth height transition ──────────────────────────────────────
function FaqItem({ question, answer, delay = 0 }: { question: string; answer: string; delay?: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="bg-white rounded-2xl border border-stone-200 overflow-hidden fade-in-section"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center p-6 text-left group"
      >
        <span className="font-bold text-brand-dark group-hover:text-black transition-colors">{question}</span>
        <ChevronDown
          size={18}
          className={`text-stone-400 transition-transform duration-300 shrink-0 ml-4 ${open ? "rotate-180 text-brand-pink" : ""}`}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-500 ease-in-out"
        style={{ maxHeight: open ? "12rem" : "0" }}
      >
        <div className="px-6 pb-6 text-stone-500 text-sm leading-relaxed border-t border-stone-100 pt-4">
          {answer}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Home() {
  useAnimateIn();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoHovered, setLogoHovered] = useState(false);

  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  const heroBase = "transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]";
  const heroIn   = "opacity-100 translate-y-0";
  const heroOut  = "opacity-0 translate-y-6";

  return (
    <div className="font-inter bg-brand-bg text-brand-dark overflow-x-hidden">

      {/* ── Desktop Header ── */}
      <header className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] hidden lg:block w-full max-w-5xl px-6">
        <nav className="h-20 bg-brand-dark/95 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-between px-4 shadow-2xl transition-all duration-500 hover:-translate-y-1">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="relative group"
              onMouseEnter={() => setLogoHovered(true)}
              onMouseLeave={() => setLogoHovered(false)}
            >
              <PicksyMascot
                size={48}
                style={{
                  transform: logoHovered ? "rotate(360deg)" : "rotate(0deg)",
                  transition: "transform 1s ease",
                }}
              />
            </Link>
            <div className="h-8 w-px bg-white/10 mx-2" />
            <div className="flex items-center gap-2">
              <a href="#how-it-works" className="text-stone-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5">
                How it Works
              </a>
              <a href="#about" className="text-stone-400 hover:text-white transition-colors text-sm font-medium px-3 py-2 rounded-lg hover:bg-white/5">
                Solution
              </a>
            </div>
          </div>
          <Link
            href="/search"
            className="btn-gradient px-6 py-3 rounded-full text-sm shadow-glow-pink active:scale-95"
          >
            Try Picksy Free
          </Link>
        </nav>
      </header>

      {/* ── Mobile Header ── */}
      <nav className="lg:hidden fixed top-6 left-6 right-6 z-[100] h-16 bg-brand-dark/90 backdrop-blur-xl border border-white/10 rounded-full flex items-center justify-between px-6 shadow-2xl">
        <PicksyMascot size={36} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="w-10 h-10 rounded-full bg-brand-pink flex items-center justify-center text-white"
        >
          <Menu size={18} />
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed top-24 left-6 right-6 z-[99] bg-brand-dark/95 backdrop-blur-xl border border-white/10 rounded-3xl p-6 shadow-2xl anim-plop">
          <div className="flex flex-col gap-3">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="text-stone-300 hover:text-white py-2 font-medium">
              How it Works
            </a>
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-stone-300 hover:text-white py-2 font-medium">
              Solution
            </a>
            <Link
              href="/search"
              className="btn-gradient px-6 py-3 rounded-full text-center"
            >
              Try Picksy Free
            </Link>
          </div>
        </div>
      )}

      <main>
        {/* ── HERO ── */}
        <section className="min-h-[90vh] flex flex-col justify-center pt-32 pb-12 px-6 lg:pt-40 relative overflow-hidden bg-brand-bg">
          {/* Floating gradient blobs */}
          <div className="blob-pink absolute top-0 left-1/4 -z-10" />
          <div className="blob-yellow absolute top-1/3 right-1/4 -z-10" />

          <div className="max-w-4xl mx-auto text-center z-10 relative">
            {/* Status badge */}
            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-stone-200 shadow-sm mb-8 hover:border-brand-pink/40 transition duration-300 cursor-default ${heroBase} ${heroVisible ? heroIn : heroOut}`}
              style={{ transitionDelay: "0ms" }}
            >
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-pink opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-pink" />
              </span>
              <span className="text-sm font-medium text-stone-600">Now scanning 12,000+ subreddits</span>
            </div>

            {/* Headline */}
            <h1
              className={`font-heading font-black text-6xl md:text-8xl text-brand-dark leading-[0.9] md:leading-[1.0] mb-8 ${heroBase} ${heroVisible ? heroIn : heroOut}`}
              style={{ transitionDelay: "80ms" }}
            >
              Stop overthinking.<br className="hidden md:block" />
              <span className="gradient-text">We&apos;ll tell you</span> what to buy.
            </h1>

            {/* Subhead */}
            <p
              className={`text-lg md:text-xl text-stone-500 max-w-2xl mx-auto mb-10 leading-relaxed ${heroBase} ${heroVisible ? heroIn : heroOut}`}
              style={{ transitionDelay: "160ms" }}
            >
              Picksy analyzes thousands of Reddit discussions to give you{" "}
              <strong className="text-brand-dark">one clear recommendation</strong> in 30 seconds.
              Real reviews, real pricing, zero research-induced stress.
            </p>

            {/* CTAs */}
            <div
              className={`flex flex-col sm:flex-row items-center justify-center gap-4 ${heroBase} ${heroVisible ? heroIn : heroOut}`}
              style={{ transitionDelay: "240ms" }}
            >
              <Link
                href="/search"
                className="btn-gradient px-8 py-4 rounded-full text-base shadow-glow-pink flex items-center gap-2 group"
              >
                What should I buy?
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="bg-white text-brand-dark border border-stone-200 px-8 py-4 rounded-full text-base font-medium hover:border-brand-pink/40 transition flex items-center gap-2">
                <RedditIcon className="w-5 h-5 text-[#FF4500]" />
                Powered by Reddit
              </button>
            </div>
          </div>

          {/* ── Dashboard Mockup ── */}
          <div
            className={`mt-16 md:mt-24 max-w-6xl mx-auto relative w-full ${heroBase} ${heroVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            style={{ transitionDelay: "360ms" }}
          >
            <div className="relative group">
              <div className="rounded-t-2xl md:rounded-t-[2rem] border-t border-x border-stone-200 bg-white/50 backdrop-blur-xl shadow-2xl p-2 md:p-3 transition duration-1000 hover:scale-[1.01]">
                <div className="bg-white rounded-xl overflow-hidden shadow-inner border border-stone-100 relative">

                  {/* Browser bar */}
                  <div className="flex items-center gap-2 px-4 py-3 border-b border-stone-100 bg-stone-50/80">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-green-400/80" />
                    </div>
                    <div className="mx-auto hidden sm:block bg-white border border-stone-200 rounded px-3 text-[10px] text-stone-400 py-1 w-64 text-center font-mono tracking-tight">
                      picksy.ai/search/headphones
                    </div>
                  </div>

                  {/* Dashboard grid */}
                  <div className="grid grid-cols-12 h-[500px] md:h-[600px] w-full bg-white relative">

                    {/* Sidebar */}
                    <div className="hidden md:flex col-span-3 border-r border-stone-100 bg-stone-50/50 flex-col p-6">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-6 px-2">
                        Recent Searches
                      </div>
                      <div className="space-y-3">
                        <div className="p-3 bg-white border border-brand-pink/20 rounded-xl shadow-sm text-xs font-semibold text-brand-dark flex items-center gap-2">
                          <Search size={12} className="text-brand-pink shrink-0" /> Best Espresso Machine
                        </div>
                        <div className="p-3 text-stone-400 text-xs flex items-center gap-2 hover:bg-stone-100 rounded-xl transition cursor-pointer">
                          <Search size={12} className="shrink-0" /> Wireless Earbuds
                        </div>
                        <div className="p-3 text-stone-400 text-xs flex items-center gap-2 hover:bg-stone-100 rounded-xl transition cursor-pointer">
                          <Search size={12} className="shrink-0" /> Gaming Mouse
                        </div>
                      </div>
                    </div>

                    {/* Main interface */}
                    <div className="col-span-12 md:col-span-9 p-6 md:p-8 bg-white bg-grid flex flex-col h-full overflow-hidden">
                      <div className="mb-6 md:mb-8">
                        <h3 className="font-heading font-black text-2xl md:text-3xl text-brand-dark leading-tight">
                          Best Over-Ear Headphones
                        </h3>
                        <p className="text-stone-500 text-sm mt-1">
                          Based on 4,200 comments in r/audiophile, r/gadgets, and r/headphones.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 flex-1 overflow-hidden">
                        {/* Recommendation card */}
                        <div className="bg-white border border-stone-200 rounded-2xl p-5 md:p-6 shadow-sm hover:shadow-md transition group overflow-hidden relative">
                          <div className="absolute top-0 right-0 p-3">
                            <span className="bg-brand-pink/10 text-brand-pink text-[10px] font-bold px-2 py-1 rounded-full">
                              98% REDDIT CONSENSUS
                            </span>
                          </div>
                          <div className="w-full aspect-video bg-stone-100 rounded-xl mb-4 overflow-hidden relative">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src="https://images.pexels.com/photos/28920288/pexels-photo-28920288.jpeg?w=600&h=400&fit=crop"
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                              alt="Sony WH-1000XM5 headphones"
                            />
                          </div>
                          <h4 className="font-heading font-bold text-xl text-brand-dark">
                            Sony WH-1000XM5
                          </h4>
                          <p className="text-xs text-stone-500 mt-2 leading-relaxed">
                            &ldquo;The ANC is unbeatable for the price. After 400 threads, the consensus is clear: buy these if you want silence.&rdquo; — u/audio_geek
                          </p>
                          <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-stone-100 grid grid-cols-2 gap-2">
                            <div className="p-2 bg-stone-50 rounded-xl">
                              <div className="text-[10px] text-stone-400 font-bold uppercase">Amazon</div>
                              <div className="text-sm font-bold text-brand-dark">$348.00</div>
                            </div>
                            <div className="p-2 bg-stone-50 rounded-xl">
                              <div className="text-[10px] text-stone-400 font-bold uppercase">Best Buy</div>
                              <div className="text-sm font-bold text-brand-dark">$349.99</div>
                            </div>
                          </div>
                        </div>

                        {/* AI sentiment sidebar */}
                        <div className="flex flex-col gap-4 md:gap-6">
                          <div className="bg-brand-dark text-white p-5 md:p-6 rounded-2xl shadow-xl flex flex-col justify-between h-36 md:h-40 relative group overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-pink/10 rounded-full blur-2xl transition duration-700 group-hover:bg-brand-pink/20" />
                            <div>
                              <div className="text-[10px] font-bold text-stone-400 tracking-widest flex items-center gap-2">
                                <Wand2 size={12} className="text-brand-pink" /> WHY REDDIT LOVES IT
                              </div>
                              <div className="mt-3 md:mt-4 space-y-2">
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-1.5 h-1.5 bg-brand-green rounded-full shrink-0" />
                                  &ldquo;30hr battery life is real&rdquo;
                                </div>
                                <div className="flex items-center gap-2 text-xs">
                                  <div className="w-1.5 h-1.5 bg-brand-green rounded-full shrink-0" />
                                  &ldquo;Multipoint connection actually works&rdquo;
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 bg-white border border-stone-200 rounded-2xl p-4 md:p-5 shadow-sm">
                            <h4 className="text-xs font-bold text-brand-dark uppercase tracking-wider mb-4">
                              Sentiment Timeline
                            </h4>
                            <div className="space-y-3 md:space-y-4">
                              <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                                <div className="w-[92%] bg-brand-pink h-full rounded-full" />
                              </div>
                              <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase">
                                <span>Negative</span>
                                <span>Positive (92%)</span>
                              </div>
                              <div className="p-3 bg-stone-50 rounded-xl text-[11px] text-stone-600 italic">
                                &ldquo;Rare to see this much agreement in r/headphones. Usually it&apos;s a warzone.&rdquo;
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Floating verification badge */}
                    <div
                      className="absolute bottom-12 right-12 bg-white/95 backdrop-blur-xl shadow-2xl border border-stone-200 p-4 rounded-2xl hidden md:flex items-center gap-4 z-20 max-w-xs"
                      style={{ animation: "float 3s ease-in-out infinite" }}
                    >
                      <div className="w-10 h-10 rounded-full bg-brand-pink/10 border border-brand-pink/20 flex items-center justify-center text-brand-pink shadow-sm shrink-0">
                        <CheckCircle size={20} />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-brand-dark mb-0.5">Decision Verified</div>
                        <div className="text-[10px] text-stone-500 leading-tight">
                          Confirmed in 14 subreddits in the past 24 hours.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PROBLEM SECTION — Bold Green Block ── */}
        <section id="about" className="py-24 px-6 bg-brand-green overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              {/* Left col */}
              <div className="anim-left">
                <span className="text-xs font-black tracking-widest text-white/70 uppercase mb-4 block">
                  The Problem
                </span>
                <h2 className="font-heading font-black text-5xl md:text-6xl text-white leading-tight mb-8">
                  Stop the search<br />
                  before it stops you.
                </h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl shrink-0 flex items-center justify-center text-white">
                      <Clock size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">20 Minutes of Research</h4>
                      <p className="text-white/70 text-sm mt-1">
                        Average time spent jumping between TikTok, Google, and Reddit for a single $30 purchase.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="w-12 h-12 bg-white/20 rounded-2xl shrink-0 flex items-center justify-center text-white">
                      <AlertCircle size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-white">Aisle Paralysis</h4>
                      <p className="text-white/70 text-sm mt-1">
                        The overwhelming anxiety of standing in a store, staring at 12 identical items, afraid to pick the &ldquo;wrong&rdquo; one.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right col */}
              <div className="relative anim-right anim-d2">
                <div className="bg-white/20 rounded-3xl p-8 border border-white/30 relative overflow-hidden">
                  <div className="space-y-4 opacity-30">
                    <div className="h-4 bg-white/40 rounded w-3/4" />
                    <div className="h-4 bg-white/40 rounded w-1/2" />
                    <div className="h-40 bg-white/40 rounded-xl" />
                    <div className="h-4 bg-white/40 rounded w-full" />
                  </div>
                  <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl border border-brand-green/20 p-6 z-10 scale-110">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-8 h-8 bg-brand-green rounded-full flex items-center justify-center text-white shrink-0">
                        <Check size={16} />
                      </div>
                      <span className="font-bold text-brand-dark">Picksy Consensus</span>
                    </div>
                    <p className="text-sm text-stone-600 mb-4">
                      &ldquo;Forget the other 11 options. 84% of Reddit experts recommend the{" "}
                      <strong>Bose QC45</strong> for your specific budget and needs.&rdquo;
                    </p>
                    <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
                      <div className="w-full bg-brand-green h-full" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS — Dark Block ── */}
        <section id="how-it-works" className="py-24 px-6 bg-brand-dark overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16 fade-in-section">
              <span className="text-xs font-black tracking-widest text-brand-pink uppercase mb-2 block">
                How it works
              </span>
              <h2 className="font-heading font-black text-5xl text-white">
                From chaos to clarity in 3 steps.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative stagger-children">
              {/* Step 1 */}
              <div className="relative group fade-in-section">
                <div className="mb-8 font-heading font-black text-6xl text-white/10 group-hover:text-brand-pink/20 transition duration-500">
                  01
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Search your dilemma</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Type in what you&apos;re looking for, no matter how specific. &ldquo;Best frying pan that doesn&apos;t stick but isn&apos;t Teflon.&rdquo;
                </p>
                <div className="bg-white/5 p-4 rounded-2xl border border-white/10 group-hover:border-brand-pink/30 transition-all duration-300">
                  <div className="flex items-center gap-2 text-[10px] text-white/40">
                    <Search size={12} /> Searching reddit...
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="relative group fade-in-section">
                <div className="mb-8 font-heading font-black text-6xl text-white/10 group-hover:text-brand-pink/20 transition duration-500">
                  02
                </div>
                <h3 className="text-xl font-bold text-white mb-4">We scan the threads</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  Our AI reads thousands of comments to filter out the ads, the bots, and the snobs to find the &ldquo;buy it for life&rdquo; consensus.
                </p>
                <div className="flex -space-x-3">
                  {[
                    { bg: "bg-brand-pink", label: "r/tech" },
                    { bg: "bg-brand-green", label: "r/BIFL" },
                    { bg: "bg-brand-blue", label: "r/gear" },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={`w-10 h-10 rounded-full ${s.bg} border-2 border-brand-dark flex items-center justify-center text-white text-[9px] font-bold transition-transform duration-300 hover:-translate-y-1`}
                    >
                      {s.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 3 */}
              <div className="relative group fade-in-section">
                <div className="mb-8 font-heading font-black text-6xl text-white/10 group-hover:text-brand-pink/20 transition duration-500">
                  03
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Get your Pick</h3>
                <p className="text-white/50 text-sm leading-relaxed mb-6">
                  We give you one winner, the runners-up, and real-time pricing at the stores near you. Decision made.
                </p>
                <div className="btn-gradient p-4 rounded-2xl text-center font-black text-xs uppercase tracking-widest">
                  Decision Reached ✓
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FEATURES BENTO ── */}
        <section className="py-24 px-6 bg-brand-bg">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Large feature — Sponsored Bias */}
              <div className="md:col-span-2 bg-white rounded-[2.5rem] p-10 md:p-12 border border-stone-100 shadow-sm flex flex-col justify-between overflow-hidden relative group anim-scale card-hover">
                <div className="relative z-10">
                  <span className="inline-block bg-brand-green/15 text-brand-green text-[10px] font-black px-3 py-1 rounded-full uppercase mb-4">
                    Smart Scanning
                  </span>
                  <h3 className="font-heading font-black text-4xl text-brand-dark mb-4">
                    Detects Sponsored Bias
                  </h3>
                  <p className="text-stone-500 max-w-sm">
                    Reddit can be full of shills. Picksy&apos;s AI detects language patterns of sponsored posts to weigh honest user experiences more heavily.
                  </p>
                </div>
                <div className="mt-8 flex justify-end transform group-hover:translate-x-4 transition duration-700">
                  <div className="bg-stone-50 rounded-2xl p-6 shadow-sm border border-stone-100 w-64">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldCheck size={16} className="text-brand-green glow-icon-green" />
                      <span className="text-[10px] font-bold text-brand-dark uppercase">Verification Score</span>
                    </div>
                    <div className="h-2 bg-stone-100 rounded-full mb-1">
                      <div className="w-full bg-brand-green h-full rounded-full" />
                    </div>
                    <p className="text-[10px] text-stone-400">0/14 Red Flags Detected</p>
                  </div>
                </div>
              </div>

              {/* Store tracking — dark */}
              <div className="bg-brand-dark rounded-[2.5rem] p-10 text-white flex flex-col justify-between anim-scale anim-d2 card-hover">
                <div className="w-12 h-12 bg-brand-pink/20 rounded-2xl flex items-center justify-center text-brand-pink text-2xl mb-8">
                  <Store size={24} className="glow-icon" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-2xl mb-4">Store-Specific Tracking</h3>
                  <p className="text-white/50 text-sm leading-relaxed">
                    Don&apos;t just find the best product—find it in stock. We link directly to Amazon, Best Buy, and Target with instant price comparisons.
                  </p>
                </div>
              </div>

              {/* 30 seconds — yellow */}
              <div className="bg-brand-yellow rounded-[2.5rem] p-10 anim-scale anim-d1 card-hover">
                <h3 className="font-heading font-black text-xl text-brand-dark mb-2">30 Second Answers</h3>
                <p className="text-brand-dark/60 text-sm">
                  Because life is too short to read a 14-page comparison blog post filled with SEO filler.
                </p>
              </div>

              {/* Aisle Paralysis */}
              <div className="bg-white rounded-[2.5rem] p-10 border border-stone-100 shadow-sm md:col-span-2 flex items-center justify-between anim-scale anim-d3 card-hover">
                <div className="max-w-md">
                  <h3 className="font-heading font-black text-xl text-brand-dark mb-2">&ldquo;Aisle Paralysis&rdquo; Mode</h3>
                  <p className="text-stone-500 text-sm">
                    In a store now? Scan a barcode or search the shelf and we&apos;ll pull up the Reddit consensus instantly.
                  </p>
                </div>
                <div className="hidden sm:block transition-transform duration-500 group-hover:rotate-6">
                  <Barcode size={64} className="text-stone-200" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        <section className="py-24 px-6 bg-brand-bg">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading font-black text-4xl text-brand-dark mb-12 text-center fade-in-section">
              Frequently asked doubts.
            </h2>
            <div className="space-y-4">
              <FaqItem
                question="Is this just another AI wrapper?"
                answer="No. While we use AI to process language, our magic is in the Reddit Search API and our custom sentiment engine that filters for 'Buy it For Life' (BIFL) criteria specifically."
                delay={0}
              />
              <FaqItem
                question="Why should I trust Reddit users?"
                answer="Reddit is one of the few places where users don't get paid for reviews. They're brutally honest. We look for upvoted, long-term reviews from users with established 'karma' in relevant subreddits."
                delay={80}
              />
              <FaqItem
                question="Can I use this for expensive purchases?"
                answer="Absolutely. Picksy excels at high-stakes decisions like laptops, coffee machines, or mattresses where the marketing fluff is thickest."
                delay={160}
              />
            </div>
          </div>
        </section>

        {/* ── FINAL CTA — Bold Pink Block ── */}
        <section className="py-24 px-6 bg-brand-pink overflow-hidden">
          <div className="max-w-7xl mx-auto text-center relative">
            <div
              className="absolute inset-0 pointer-events-none"
              style={{ background: "radial-gradient(circle at 50% 0%, rgba(255,255,255,0.15), transparent)" }}
            />
            <div className="relative z-10">
              <h2 className="font-heading font-black text-5xl md:text-7xl text-white mb-8 leading-tight">
                Ready to buy with<br />zero regret?
              </h2>
              <p className="text-white/70 text-lg mb-10 max-w-xl mx-auto">
                Join 15,000+ shoppers who reclaimed their weekends and stopped over-researching.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/search"
                  className="bg-white text-brand-pink px-8 py-4 rounded-full font-black text-lg hover:bg-brand-bg transition transform hover:scale-105 active:scale-95 shadow-xl"
                >
                  Start Your Search
                </Link>
                <button className="bg-white/20 text-white border border-white/30 px-8 py-4 rounded-full font-bold text-lg hover:bg-white/30 transition">
                  Install Extension
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ── FOOTER — Dark ── */}
      <footer className="bg-brand-dark text-white/40 py-12 text-sm">
        <div className="max-w-7xl mx-auto px-6 flex justify-between items-center flex-wrap gap-4">
          <div className="flex items-center gap-2 text-white">
            <div className="w-6 h-6 bg-brand-pink rounded flex items-center justify-center text-white font-heading font-black text-sm">
              P
            </div>
            <span className="font-heading font-black text-lg tracking-tight">Picksy</span>
          </div>
          <p>© 2026 Picksy AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
