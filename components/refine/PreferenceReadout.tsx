"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { ResolvedPreferences } from "@/lib/types/refine";

interface PreferenceReadoutProps {
  preferences: ResolvedPreferences;
  query: string;
  onConfirm: () => void;
  onSkip: () => void;
}

export default function PreferenceReadout({ preferences, query, onConfirm, onSkip }: PreferenceReadoutProps) {
  return (
    <motion.div
      initial={{ y: 60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        padding: "16px 20px 24px",
        background: "linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 70%, transparent 100%)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
      }}
    >
      {/* Chips row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, justifyContent: "center" }}>
        <AnimatePresence mode="popLayout">
          {preferences.values.map((pv) => (
            <motion.span
              key={`${pv.parameter}-${pv.label}`}
              layout
              initial={{ opacity: 0, scale: 0.8, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -6 }}
              transition={{ duration: 0.2 }}
              style={{
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.2)",
                borderRadius: 100,
                padding: "4px 12px",
                fontSize: 12,
                color: "rgba(255,255,255,0.85)",
                fontWeight: 500,
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                whiteSpace: "nowrap",
              }}
            >
              {pv.label}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
        <motion.button
          onClick={onConfirm}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.02 }}
          style={{
            background: "#ea580c",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            boxShadow: "0 4px 20px rgba(234,88,12,0.4)",
          }}
        >
          Analyze for {query.split(" ").slice(-1)[0]}
        </motion.button>

        <button
          onClick={onSkip}
          style={{
            background: "none",
            border: "none",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            cursor: "pointer",
            padding: "8px 4px",
            textDecoration: "underline",
            textDecorationColor: "rgba(255,255,255,0.25)",
          }}
        >
          Skip refinement
        </button>
      </div>
    </motion.div>
  );
}
