import { Sparkles, Heart, Shield } from "lucide-react";

const metrics = [
  { value: "1,247", label: "on the waitlist" },
  { value: "10,000+", label: "products analyzed" },
  { value: "500K+", label: "reviews scanned" },
];

export function SocialProof() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto text-center relative overflow-hidden">
      <div className="blob-pink -top-40 right-0" />
      <div className="blob-cyan bottom-0 -left-40" />

      <div className="fade-in-section mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
          Join the Movement ✊
        </h2>
        <p className="text-lg text-gray-500">
          Early adopters are already making smarter decisions
        </p>
      </div>

      <div className="fade-in-section grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 relative z-10">
        {metrics.map((metric) => (
          <div key={metric.label} className="card-elevated p-8">
            <div className="text-4xl md:text-5xl font-black gradient-text mb-2">
              {metric.value}
            </div>
            <p className="text-gray-500">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="fade-in-section flex flex-wrap items-center justify-center gap-6 text-gray-400 text-sm relative z-10">
        <span className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-cyan" /> Beta launching soon
        </span>
        <span className="hidden md:inline">&bull;</span>
        <span className="flex items-center gap-2">
          <Heart size={16} className="text-brand-pink" /> Free for early adopters
        </span>
        <span className="hidden md:inline">&bull;</span>
        <span className="flex items-center gap-2">
          <Shield size={16} className="text-brand-yellow" /> No credit card required
        </span>
      </div>
    </section>
  );
}
