"use client";

import { motion } from "framer-motion";
import type { QuestionDefinition } from "@/lib/types/questions";

interface BinaryChoiceProps {
  question: QuestionDefinition;
  selected: string | null;
  onSelect: (optionId: string) => void;
}

export default function BinaryChoice({ question, selected, onSelect }: BinaryChoiceProps) {
  const options = question.options ?? [];

  return (
    <div style={{ display: "flex", gap: 12, padding: "4px 0 16px" }}>
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            whileTap={{ scale: 0.97 }}
            animate={{
              borderColor: isSelected ? "#2ECC71" : "rgba(255,255,255,0.12)",
              background: isSelected ? "rgba(46,204,113,0.15)" : "rgba(255,255,255,0.06)",
            }}
            transition={{ duration: 0.18 }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "20px 12px",
              borderRadius: 16,
              border: `2px solid ${isSelected ? "#2ECC71" : "rgba(255,255,255,0.12)"}`,
              cursor: "pointer",
              position: "relative",
              outline: "none",
            }}
          >
            {/* Checkmark */}
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#2ECC71",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 800,
                  color: "white",
                }}
              >
                ✓
              </motion.div>
            )}

            {/* Icon */}
            <span style={{ fontSize: 32, lineHeight: 1 }}>{opt.icon}</span>

            {/* Label */}
            <span
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: isSelected ? "white" : "rgba(255,255,255,0.85)",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              {opt.label}
            </span>

            {/* Description */}
            {opt.description && (
              <span
                style={{
                  fontSize: 11,
                  color: isSelected ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.4)",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {opt.description}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
