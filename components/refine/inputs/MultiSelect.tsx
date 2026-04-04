"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { QuestionDefinition } from "@/lib/types/questions";

interface MultiSelectProps {
  question: QuestionDefinition;
  selected: string[];
  onToggle: (optionId: string) => void;
}

export default function MultiSelect({ question, selected, onToggle }: MultiSelectProps) {
  const options = question.options ?? [];
  const max = question.maxSelections ?? 3;
  const atMax = selected.length >= max;

  return (
    <div style={{ padding: "4px 0 16px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt, index) => {
          const isSelected = selected.includes(opt.id);
          const isDisabled = !isSelected && atMax;

          return (
            <motion.button
              key={opt.id}
              onClick={() => {
                if (!isDisabled || isSelected) onToggle(opt.id);
              }}
              initial={{ opacity: 0, scale: 0.84, y: 8 }}
              animate={{
                opacity: isDisabled ? 0.35 : 1,
                scale: 1,
                y: 0,
                background: isSelected ? "rgba(46,204,113,0.2)" : "rgba(255,255,255,0.07)",
                borderColor: isSelected ? "#2ECC71" : "rgba(255,255,255,0.14)",
              }}
              whileHover={!isDisabled ? { scale: 1.05 } : {}}
              whileTap={!isDisabled ? { scale: 0.94 } : {}}
              transition={{
                scale: { type: "spring", stiffness: 380, damping: 22, delay: index * 0.045 },
                y: { duration: 0.3, ease: [0.16, 1, 0.3, 1], delay: index * 0.045 },
                opacity: { duration: 0.25, delay: index * 0.045 },
                background: { duration: 0.15 },
                borderColor: { duration: 0.15 },
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "9px 14px",
                borderRadius: 100,
                border: `1.5px solid ${isSelected ? "#2ECC71" : "rgba(255,255,255,0.14)"}`,
                cursor: isDisabled ? "not-allowed" : "pointer",
                outline: "none",
              }}
            >
              {opt.icon && (
                <span style={{ fontSize: 14, lineHeight: 1 }}>{opt.icon}</span>
              )}
              <span
                style={{
                  fontSize: 13,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "white" : "rgba(255,255,255,0.7)",
                  whiteSpace: "nowrap",
                }}
              >
                {opt.label}
              </span>
              <AnimatePresence>
                {isSelected && (
                  <motion.span
                    initial={{ scale: 0, width: 0 }}
                    animate={{ scale: 1, width: "auto" }}
                    exit={{ scale: 0, width: 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 22 }}
                    style={{
                      fontSize: 10,
                      fontWeight: 800,
                      color: "#2ECC71",
                      overflow: "hidden",
                    }}
                  >
                    ✓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Max indicator */}
      <motion.p
        animate={{ color: atMax ? "rgba(46,204,113,0.9)" : "rgba(255,255,255,0.3)" }}
        transition={{ duration: 0.2 }}
        style={{
          marginTop: 10,
          fontSize: 11,
          fontWeight: 500,
        }}
      >
        {selected.length}/{max} selected
        {atMax && " — tap a chip to deselect"}
      </motion.p>
    </div>
  );
}
