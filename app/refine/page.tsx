"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeQuery } from "@/lib/query-decoder";
import AuraCanvas from "@/components/refine/AuraCanvas";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 4px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "rgba(255,255,255,0.5)" }}
        />
      ))}
    </div>
  );
}

function RefineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  useEffect(() => {
    if (!q.trim()) router.replace("/search");
  }, [q, router]);

  const decoded = decodeQuery(q);

  const [step, setStep] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 400),
      setTimeout(() => setStep(2), 1000),
      setTimeout(() => setStep(3), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#2ECC71" }}>
      {/* Floating decorative shapes */}
      <div className="absolute top-10 left-6 w-16 h-16 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute top-28 right-8 w-12 h-12 rounded-full bg-white/15 animate-floatSlow pointer-events-none" />
      <div className="absolute bottom-32 left-8 w-20 h-20 rounded-full bg-white/8 animate-floatDelay pointer-events-none" />
      <div className="absolute bottom-20 right-1/4 w-8 h-8 rounded-full bg-brand-pink/30 animate-floatDelay2 pointer-events-none" />
      <svg className="absolute top-16 right-1/3 animate-spinSlow opacity-20 pointer-events-none" width="28" height="28" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>
      <svg className="absolute bottom-40 left-1/3 animate-spinSlow opacity-15 pointer-events-none" width="20" height="20" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <Link
          href="/search"
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft size={18} />
          <PicksyMascot size={32} />
          <span className="font-heading font-black text-white text-lg">picksy</span>
        </Link>
        {/* Query pill */}
        <div className="bg-brand-dark/80 backdrop-blur-sm text-white text-sm font-semibold px-4 py-2 rounded-2xl max-w-[220px] truncate shadow-lg">
          {q}
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-4 pb-20 relative z-10">
        {/* Step 0: User chat bubble */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}
        >
          <div
            style={{
              background: "#1A1A2E",
              color: "white",
              borderRadius: "18px 18px 4px 18px",
              padding: "10px 16px",
              fontSize: 15,
              fontWeight: 500,
              maxWidth: "80%",
              lineHeight: 1.5,
              boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
            }}
          >
            {q}
          </div>
        </motion.div>

        {/* Step 1: Thinking dots */}
        <AnimatePresence>
          {step === 1 && (
            <motion.div
              key="thinking"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ paddingLeft: 4, marginBottom: 8 }}
            >
              <ThinkingDots />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 2+: AI response text */}
        {step >= 2 && (
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 16,
              lineHeight: 1.6,
              marginBottom: 20,
              paddingLeft: 4,
              fontWeight: 500,
            }}
          >
            I found a few quick questions that&rsquo;ll sharpen your results:
          </motion.p>
        )}

        {/* Step 3: Canvas card */}
        {step >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            <AuraCanvas decoded={decoded} />
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default function RefinePage() {
  return (
    <Suspense fallback={<div className="min-h-screen" style={{ background: "#2ECC71" }} />}>
      <RefineContent />
    </Suspense>
  );
}
