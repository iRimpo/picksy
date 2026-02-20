import Link from "next/link";
import { ArrowRight, Sparkles, ChevronRight } from "lucide-react";
import { FloatingEmoji } from "@/components/shared/floating-emoji";

// Inline Reddit icon so we don't need a package
function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
    </svg>
  );
}

export function Hero() {
  return (
    <header className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Soft gradient blobs */}
      <div className="blob-pink -top-40 -left-40" />
      <div className="blob-cyan -bottom-40 -right-40" />
      <div className="blob-yellow top-1/3 left-1/2" />

      {/* Floating emojis */}
      <FloatingEmoji emoji="🛍️" className="top-[10%] left-[8%] animate-float" />
      <FloatingEmoji emoji="🤔" className="top-[15%] right-[10%] animate-floatSlow" />
      <FloatingEmoji emoji="✨" className="bottom-[20%] left-[12%] animate-floatDelay" />
      <FloatingEmoji emoji="💡" className="bottom-[25%] right-[8%] animate-floatDelay2" />
      <FloatingEmoji emoji="🎯" className="top-[40%] left-[3%] animate-floatSlow text-2xl md:text-3xl" />
      <FloatingEmoji emoji="💸" className="top-[30%] right-[4%] animate-float text-2xl md:text-3xl" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 py-20 flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
        {/* Left — Copy */}
        <div className="flex-1 text-center lg:text-left">
          {/* Reddit badge */}
          <div className="inline-flex items-center gap-2 bg-[#FF4500]/8 border border-[#FF4500]/15 rounded-full px-4 py-2 mb-6">
            <RedditIcon className="w-4 h-4 text-[#FF4500]" />
            <span className="text-xs font-bold text-[#FF4500]">Powered by Reddit&apos;s Honest Reviews</span>
          </div>

          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black leading-[1.1] mb-6">
            <span className="gradient-text">Stop Overthinking.</span>
            <br />
            <span className="text-gray-900">We&apos;ll Tell You</span>
            <br />
            <span className="text-gray-900">What To Buy.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-500 max-w-lg mb-10 leading-relaxed mx-auto lg:mx-0">
            One search. One clear answer. Picksy reads hundreds of Reddit discussions
            so you get a confident recommendation in under 30 seconds — not 20 minutes of tab-hopping.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
            <Link
              href="/search"
              className="btn-gradient px-10 py-4 rounded-2xl font-bold text-lg flex items-center gap-2"
            >
              Try It Free <ArrowRight size={20} />
            </Link>
            <a
              href="#how-it-works"
              className="px-8 py-4 rounded-2xl font-bold text-lg flex items-center gap-2 border-2 border-gray-200 text-gray-700 hover:border-brand-pink hover:text-brand-pink transition-all"
            >
              See How <Sparkles size={18} />
            </a>
          </div>
          <p className="text-gray-400 text-sm mt-5">
            ✨ Join{" "}
            <span className="text-gray-700 font-semibold">1,247</span>{" "}
            indecisive shoppers who finally made a decision
          </p>
        </div>

        {/* Right — App preview */}
        <div className="w-full max-w-sm lg:max-w-md shrink-0">
          <div className="phone-mockup">
            <div className="phone-screen p-4 bg-white rounded-3xl border border-gray-100 shadow-xl">
              {/* Mini search bar */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 mb-4">
                <svg viewBox="0 0 24 24" className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <span className="text-sm text-gray-400">best moisturizer for dry skin</span>
              </div>

              {/* Reddit scanning animation */}
              <div className="bg-[#FF4500]/5 border border-[#FF4500]/10 rounded-xl p-3 mb-3">
                <div className="flex items-center gap-2 mb-1.5">
                  <RedditIcon className="w-3.5 h-3.5 text-[#FF4500]" />
                  <span className="text-[10px] font-bold text-[#FF4500]">Analyzed 143 Reddit discussions</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full w-full" style={{ background: "linear-gradient(90deg, #FF4500, #FE2C55)" }} />
                </div>
              </div>

              {/* Winner card preview */}
              <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
                <div className="flex items-center gap-1.5 mb-3">
                  <span className="text-base">🏆</span>
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Your Answer</span>
                </div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center text-2xl border border-gray-100">🧴</div>
                  <div>
                    <p className="text-xs text-brand-pink font-bold">CeraVe</p>
                    <p className="text-sm font-black text-gray-900 leading-tight">Moisturizing Cream</p>
                    <p className="text-base font-black text-gray-900">$16.99</p>
                  </div>
                  <div className="ml-auto text-center">
                    <p className="text-xl font-black text-green-600">88</p>
                    <p className="text-[9px] text-gray-400">/100</p>
                    <p className="text-[9px] font-bold text-green-600">Real Deal ✅</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex-1 text-center bg-green-50 rounded-lg py-1.5 border border-green-100">
                    <p className="text-[9px] font-bold text-green-700">92% positive</p>
                  </div>
                  <div className="flex-1 text-center bg-gray-50 rounded-lg py-1.5 border border-gray-100">
                    <p className="text-[9px] font-bold text-gray-600">247 mentions</p>
                  </div>
                </div>
                <div className="space-y-1 mb-3">
                  {["Super hydrating", "Great value", "Non-greasy"].map((pro) => (
                    <div key={pro} className="flex items-center gap-1.5">
                      <span className="text-green-500 text-[10px]">✓</span>
                      <span className="text-[10px] text-gray-600">{pro}</span>
                    </div>
                  ))}
                </div>
                <div className="w-full py-2 rounded-xl text-[10px] font-black text-white text-center" style={{ background: "linear-gradient(135deg, #FE2C55, #00F2EA)" }}>
                  Where to Buy →
                </div>
              </div>

              {/* Alternatives preview */}
              <div className="mt-3 bg-gray-50 rounded-xl px-3 py-2.5 flex items-center justify-between">
                <span className="text-[10px] text-gray-500">Other Options</span>
                <span className="text-[10px] text-gray-400">2 alternatives ▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <ChevronRight size={24} className="text-gray-300 rotate-90" />
      </div>
    </header>
  );
}
