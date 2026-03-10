"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { decodeQuery } from "@/lib/query-decoder";
import AuraCanvas from "@/components/refine/AuraCanvas";

function ThinkingDots() {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center", padding: "8px 4px" }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.2, ease: "easeInOut" }}
          style={{ width: 8, height: 8, borderRadius: "50%", background: "#a8a29e" }}
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

  // Chat animation sequence
  // step 0 → user bubble (immediate)
  // step 1 → thinking dots (400ms)
  // step 2 → AI text (1000ms)
  // step 3 → canvas card (1400ms)
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
    <div className="min-h-screen bg-stone-50">
      {/* Header — matches search page */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5 border-b border-stone-100">
        <Link
          href="/search"
          className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors"
        >
          <ArrowLeft size={18} />
          <div
            className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold text-sm"
            style={{ fontFamily: "var(--font-serif), Georgia, serif" }}
          >
            P
          </div>
          <span className="font-bold text-stone-900 text-lg tracking-tight">Picksy</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-4 pt-8 pb-20">
        {/* Step 0: User chat bubble */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}
        >
          <div
            style={{
              background: "#1c1917",
              color: "white",
              borderRadius: "18px 18px 4px 18px",
              padding: "10px 16px",
              fontSize: 15,
              fontWeight: 500,
              maxWidth: "80%",
              lineHeight: 1.5,
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
              color: "#57534e",
              fontSize: 15,
              lineHeight: 1.6,
              marginBottom: 20,
              paddingLeft: 4,
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
    <Suspense fallback={<div className="min-h-screen bg-stone-50" />}>
      <RefineContent />
    </Suspense>
  );
}
