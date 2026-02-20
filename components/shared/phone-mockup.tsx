import {
  Search,
  Zap,
  Sparkles,
  Play,
  CheckCircle,
} from "lucide-react";

export function PhoneMockup() {
  return (
    <div className="flex-shrink-0 w-[280px] md:w-[320px]">
      <div className="phone-mockup">
        <div className="phone-screen p-4">
          {/* Status bar */}
          <div className="flex justify-between text-xs text-white/50 mb-4">
            <span>9:41</span>
            <span className="flex gap-1 items-center">
              <Zap size={10} /> 87%
            </span>
          </div>
          {/* App header */}
          <div className="flex items-center gap-2 mb-4">
            <span className="gradient-text font-black text-lg">Picksy</span>
            <Sparkles size={16} className="text-brand-yellow" />
          </div>
          {/* Search bar */}
          <div className="bg-white/10 rounded-xl px-3 py-2 flex items-center gap-2 text-sm mb-4">
            <Search size={14} className="text-white/40" />
            <span className="text-white/40">CeraVe moisturizer...</span>
          </div>
          {/* Result card */}
          <div className="bg-white/5 rounded-xl p-3 border border-white/10 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-sm">
                CeraVe Moisturizing Cream
              </span>
            </div>
            <div className="flex items-center gap-2 mb-3">
              <div className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded-full">
                87% Positive
              </div>
              <div className="bg-brand-cyan/20 text-brand-cyan text-xs font-bold px-2 py-0.5 rounded-full">
                142 Reviews
              </div>
            </div>
            {/* Mini transcript */}
            <div className="bg-white/5 rounded-lg p-2 text-xs text-white/70 border border-white/5">
              <div className="flex items-center gap-1 mb-1">
                <Play size={10} className="text-brand-pink" />
                <span className="font-semibold text-white/90">
                  @skincarebyjess
                </span>
              </div>
              &ldquo;My skin has NEVER looked better...&rdquo;
            </div>
          </div>
          {/* Hype badge */}
          <div className="flex items-center justify-center gap-2 bg-gradient-to-r from-brand-pink/20 to-brand-cyan/20 rounded-xl py-2 border border-white/10">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-sm font-bold">87% of creators love this</span>
          </div>
        </div>
      </div>
    </div>
  );
}
