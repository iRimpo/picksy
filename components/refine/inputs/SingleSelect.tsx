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
      {options.map((opt, index) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            initial={{ opacity: 0, x: -10 }}
            animate={{
              borderLeftColor: isSelected ? "#FF6B8A" : "transparent",
              background: isSelected ? "#FFF0F3" : "#FAFAF9",
              borderColor: isSelected ? "#FF6B8A" : "#E8E5E0",
              opacity: 1,
              x: 0,
            }}
            whileHover={{
              x: isSelected ? 0 : 3,
              background: isSelected ? "#FFE6EC" : "#F5F3F1",
            }}
            whileTap={{ scale: 0.99 }}
            transition={{
              opacity: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 },
              x: { duration: 0.35, ease: [0.16, 1, 0.3, 1], delay: index * 0.06 },
              borderLeftColor: { duration: 0.18 },
              background: { duration: 0.18 },
              borderColor: { duration: 0.18 },
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 14px",
              borderRadius: 12,
              border: `1.5px solid ${isSelected ? "#FF6B8A" : "#E8E5E0"}`,
              borderLeft: `4px solid ${isSelected ? "#FF6B8A" : "transparent"}`,
              cursor: "pointer",
              textAlign: "left",
              outline: "none",
            }}
          >
            <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{opt.icon}</span>

            <div style={{ flex: 1, minWidth: 0 }}>
              <p
                className="font-heading"
                style={{
                  fontSize: 14,
                  fontWeight: isSelected ? 800 : 600,
                  color: isSelected ? "#FF6B8A" : "#1c1917",
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
                    color: isSelected ? "#FF6B8A" : "#78716c",
                    margin: "2px 0 0",
                    lineHeight: 1.3,
                  }}
                >
                  {opt.description}
                </p>
              )}
            </div>

            <motion.div
              animate={{
                background: isSelected ? "#FF6B8A" : "transparent",
                borderColor: isSelected ? "#FF6B8A" : "#D6D3D1",
                scale: isSelected ? 1 : 0.9,
              }}
              transition={{ type: "spring", stiffness: 400, damping: 22 }}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: `2px solid ${isSelected ? "#FF6B8A" : "#D6D3D1"}`,
                background: isSelected ? "#FF6B8A" : "transparent",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                color: "white",
                fontWeight: 800,
              }}
            >
              {isSelected && "✓"}
            </motion.div>
          </motion.button>
        );
      })}
    </div>
  );
}
