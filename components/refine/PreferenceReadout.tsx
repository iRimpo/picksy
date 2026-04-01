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
    <div style={{ padding: "16px 0 8px" }}>
      {/* Chips row */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 16, justifyContent: "center" }}>
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
                background: "white",
                border: "1px solid #e7e5e4",
                borderRadius: 100,
                padding: "4px 12px",
                fontSize: 12,
                color: "#44403c",
                fontWeight: 500,
                whiteSpace: "nowrap",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
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
            background: "linear-gradient(135deg, #FF6B8A, #2ECC71)",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.01em",
            boxShadow: "0 4px 20px rgba(255,107,138,0.4)",
          }}
        >
          Analyze for {query.split(" ").slice(-1)[0]}
        </motion.button>

        <button
          onClick={onSkip}
          style={{
            background: "none",
            border: "none",
            color: "#78716c",
            fontSize: 13,
            cursor: "pointer",
            padding: "8px 4px",
            textDecoration: "underline",
            textDecorationColor: "#d6d3d1",
          }}
        >
          Skip refinement
        </button>
      </div>
    </div>
  );
}
