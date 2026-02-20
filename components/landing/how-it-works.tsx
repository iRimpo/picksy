import { Search, BarChart2, ShoppingBag } from "lucide-react";
import { StepCard } from "@/components/shared/step-card";

function RedditIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 20 20" className={className} fill="currentColor">
      <path d="M20 10a10 10 0 1 1-20 0 10 10 0 0 1 20 0zm-9.93-1.73c-.3-.03-.58.16-.67.45-.1.3.05.63.35.74.82.3 1.4.95 1.56 1.77a3.2 3.2 0 0 1-3.18 3.77c-.84 0-1.67-.37-2.26-1.02-.55-.6-.8-1.4-.68-2.2.12-.82.7-1.5 1.56-1.92.3-.15.42-.51.27-.82a.6.6 0 0 0-.81-.27c-1.2.59-2 1.6-2.18 2.77-.17 1.12.17 2.26.94 3.1.82.9 1.97 1.39 3.16 1.39 1.19 0 2.29-.48 3.1-1.35a4.4 4.4 0 0 0 1.06-3.34c-.25-1.44-1.2-2.67-2.22-3.07zm-5.48-2.88c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zm8.82 0c-.6 0-1.1.5-1.1 1.1s.5 1.1 1.1 1.1 1.1-.5 1.1-1.1-.5-1.1-1.1-1.1zM10 6.19a2.8 2.8 0 0 0-1.97.8.6.6 0 1 0 .85.85 1.6 1.6 0 0 1 2.24 0 .6.6 0 1 0 .85-.85A2.8 2.8 0 0 0 10 6.19z" />
    </svg>
  );
}

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 md:py-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative overflow-hidden">
      <div className="blob-pink -top-60 -right-60" />

      <div className="fade-in-section text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
          One Search. One Answer. 🎯
        </h2>
        <p className="text-lg text-gray-500">
          No more 15-tab research marathons. Get a clear decision in under 30 seconds.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 stagger-children relative z-10">
        {/* Step 1 */}
        <div className="fade-in-section">
          <StepCard
            number="01"
            icon={Search}
            title="Describe What You Need"
            description='Type naturally: "best moisturizer for dry skin" or "hair oil at Walmart under $15". We understand what you mean.'
          >
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-xl px-4 py-3 flex items-center gap-2 border border-gray-100">
                <Search size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-400 text-xs">best moisturizer for dry skin</span>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 flex items-center gap-2 border border-gray-100">
                <Search size={14} className="text-gray-400 shrink-0" />
                <span className="text-gray-400 text-xs">hair oil at Walmart under $15</span>
              </div>
            </div>
          </StepCard>
        </div>

        {/* Step 2 */}
        <div className="fade-in-section">
          <StepCard
            number="02"
            icon={BarChart2}
            title="We Read Reddit So You Don't"
            description="Our AI scans hundreds of Reddit posts across r/SkincareAddiction, r/HairCare, and more — extracting real opinions, not ads."
          >
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-left">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-[#FF4500] flex items-center justify-center">
                  <RedditIcon className="w-3 h-3 text-white" />
                </div>
                <span className="text-xs font-semibold text-gray-700">Scanning Reddit...</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full w-3/4 rounded-full"
                    style={{ background: "linear-gradient(90deg, #FF4500, #FE2C55)" }}
                  />
                </div>
              </div>
              <p className="text-xs text-gray-400 italic">
                &ldquo;This is the holy grail for dry skin...&rdquo;
              </p>
              <p className="text-[10px] text-gray-300 mt-1">— r/SkincareAddiction · 247 upvotes</p>
            </div>
          </StepCard>
        </div>

        {/* Step 3 */}
        <div className="fade-in-section">
          <StepCard
            number="03"
            icon={ShoppingBag}
            title="Get One Clear Answer"
            description="Not 10 options. Not a comparison table. ONE recommended product with a score, real pros/cons, and where to buy it now."
          >
            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 text-left">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-sm">🏆</span>
                <span className="text-[10px] font-black text-gray-600 uppercase tracking-wider">Your Answer</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-xs font-black text-gray-900">CeraVe Moisturizing Cream</p>
                  <p className="text-[10px] text-brand-pink font-semibold">CeraVe · $16.99</p>
                </div>
                <div className="text-center">
                  <p className="text-lg font-black text-green-600">88</p>
                  <p className="text-[9px] text-gray-400">/100</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                <span className="text-[9px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full border border-green-100">
                  Real Deal ✅
                </span>
                <span className="text-[9px] bg-[#FF4500]/10 text-[#FF4500] px-2 py-0.5 rounded-full">
                  247 Redditors
                </span>
              </div>
            </div>
          </StepCard>
        </div>
      </div>
    </section>
  );
}
