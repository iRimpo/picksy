"use client";

import { motion } from "framer-motion";
import type { QuestionDefinition } from "@/lib/types/questions";

interface SingleSelectProps {
  question: QuestionDefinition;
  selected: string | null;
  onSelect: (optionId: string) => void;
}

export default function SingleSelect({ question, selected, onSelect }: SingleSelectProps) {
  const options = question.options ?? [];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "4px 0 16px" }}>
      {options.map((opt) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            whileTap={{ scale: 0.99 }}
            animate={{
              borderLeftColor: isSelected ? "#2ECC71" : "transparent",
              background: isSelected ? "rgba(46,204,113,0.12)" : "rgba(255,255,255,0.05)",
              borderColor: isSelected ? "rgba(46,204,113,0.35)" : "rgba(255,255,255,0.1)",
            }}
            transition={{ duration: 0.18 }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1.5px solid ${isSelected ? "rgba(46,204,113,0.35)" : "rgba(255,255,255,0.1)"}`,
              borderLeft: `4px solid ${isSelected ? "#2ECC71" : "transparent"}`,
              cursor: "pointer",
              textAlign: "left",
              outline: "none",
            }}
          >
            {/* Icon */}
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{opt.icon}</span>

            {/* Text */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? 700 : 500,
                  color: isSelected ? "white" : "rgba(255,255,255,0.85)",
                  margin: 0,
                  lineHeight: 1.3,
                }}
              >
                {opt.label}
              </p>
              {opt.description && (
                <p
                  style={{
                    fontSize: 11,
                    color: isSelected ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)",
                    margin: "2px 0 0",
                    lineHeight: 1.3,
                  }}
                >
                  {opt.description}
                </p>
              )}
            </div>

            {/* Selected dot */}
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `2px solid ${isSelected ? "#2ECC71" : "rgba(255,255,255,0.2)"}`,
                background: isSelected ? "#2ECC71" : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: 800,
                transition: "all 0.18s",
              }}
            >
              {isSelected && "✓"}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
