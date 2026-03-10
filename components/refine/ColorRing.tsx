"use client";

import { motion, AnimatePresence } from "framer-motion";

const SEGMENT_COLORS = [
  "#4ade80",  // green
  "#fb923c",  // orange
  "#a78bfa",  // purple
];

interface ColorRingProps {
  labels: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function ColorRing({ labels, selected, onSelect }: ColorRingProps) {
  return (
    <div
      style={{
        position: "absolute",
        bottom: 100,
        right: 20,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        alignItems: "flex-end",
        zIndex: 25,
      }}
    >
      <span style={{
        color: "rgba(255,255,255,0.4)",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: 2,
      }}>
        Priority
      </span>

      {labels.map((label, i) => {
        const isSelected = selected === i;
        return (
          <motion.button
            key={label}
            onClick={() => onSelect(i)}
            whileTap={{ scale: 0.9 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: 0,
            }}
          >
            <AnimatePresence>
              {isSelected && (
                <motion.span
                  initial={{ opacity: 0, x: 6 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 6 }}
                  style={{
                    color: "white",
                    fontSize: 11,
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.4)",
                  }}
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>

            <motion.div
              animate={{
                scale: isSelected ? 1.25 : 1,
                boxShadow: isSelected
                  ? `0 0 12px ${SEGMENT_COLORS[i]}99, 0 0 4px ${SEGMENT_COLORS[i]}`
                  : "0 2px 6px rgba(0,0,0,0.3)",
              }}
              transition={{ duration: 0.2 }}
              style={{
                width: isSelected ? 20 : 16,
                height: isSelected ? 20 : 16,
                borderRadius: "50%",
                background: SEGMENT_COLORS[i] ?? "#fb923c",
                border: isSelected ? "2px solid rgba(255,255,255,0.8)" : "2px solid rgba(255,255,255,0.2)",
                transition: "width 0.2s, height 0.2s",
              }}
            />
          </motion.button>
        );
      })}
    </div>
  );
}
