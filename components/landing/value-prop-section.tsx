import { CheckCircle, X } from "lucide-react";

const otherApps = ["Count hashtags", "Surface level", "Miss the details", "Can't detect sarcasm"];
const picksyFeatures = ["Cross-platform analysis", "Deep sentiment AI", "Capture nuance", "Detect authenticity"];
const manual = ["Watch 50 videos", "Takes 2 hours", "Still confused", "Exhausted"];

export function ValuePropSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-8">
        <div className="fade-in-section text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white">
            We Actually Read Every Review 🎬
          </h2>
          <p className="text-xl text-white/90 max-w-2xl mx-auto">
            Unlike other apps that just count mentions, we analyze what people{" "}
            <em>actually say</em> across Reddit, TikTok, YouTube &amp; Instagram
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 stagger-children">
          {/* Other Apps */}
          <div className="fade-in-section bg-black/20 backdrop-blur-sm rounded-[20px] p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">😑</div>
              <h3 className="text-xl font-extrabold text-white">Other Apps</h3>
            </div>
            <ul className="space-y-4">
              {otherApps.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Picksy */}
          <div className="fade-in-section bg-white/10 backdrop-blur-sm rounded-[20px] p-8 border-2 border-white/30 scale-105 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">🎯</div>
              <h3 className="text-xl font-extrabold text-white">Picksy</h3>
              <span className="inline-block mt-1 text-xs font-bold bg-white/20 px-3 py-1 rounded-full text-white">
                RECOMMENDED
              </span>
            </div>
            <ul className="space-y-4">
              {picksyFeatures.map((item) => (
                <li key={item} className="flex items-center gap-3 font-semibold text-white">
                  <CheckCircle size={18} className="text-green-300 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* You Manually */}
          <div className="fade-in-section bg-black/20 backdrop-blur-sm rounded-[20px] p-8 border border-white/10">
            <div className="text-center mb-6">
              <div className="text-3xl mb-2">😰</div>
              <h3 className="text-xl font-extrabold text-white">You Manually</h3>
            </div>
            <ul className="space-y-4">
              {manual.map((item) => (
                <li key={item} className="flex items-center gap-3 text-white/70">
                  <X size={18} className="text-red-400 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
