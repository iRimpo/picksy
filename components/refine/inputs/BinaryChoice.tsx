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
      {options.map((opt, index) => {
        const isSelected = selected === opt.id;
        return (
          <motion.button
            key={opt.id}
            onClick={() => onSelect(opt.id)}
            initial={{ opacity: 0, y: 14 }}
            animate={{
              borderColor: isSelected ? "#FF6B8A" : "#E8E5E0",
              background: isSelected ? "#FFF0F3" : "#FAFAF9",
              opacity: 1,
              y: 0,
            }}
            whileHover={{ scale: 1.02, background: isSelected ? "#FFE6EC" : "#F5F3F1" }}
            whileTap={{ scale: 0.96 }}
            transition={{
              opacity: { duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 },
              y: { duration: 0.38, ease: [0.16, 1, 0.3, 1], delay: index * 0.08 },
              borderColor: { duration: 0.18 },
              background: { duration: 0.18 },
              scale: { type: "spring", stiffness: 400, damping: 24 },
            }}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 8,
              padding: "20px 12px",
              borderRadius: 16,
              border: `2px solid ${isSelected ? "#FF6B8A" : "#E8E5E0"}`,
              cursor: "pointer",
              position: "relative",
              outline: "none",
            }}
          >
            {isSelected && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 22 }}
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: "#FF6B8A",
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

            <span style={{ fontSize: 32, lineHeight: 1 }}>{opt.icon}</span>

            <span
              className="font-heading"
              style={{
                fontSize: 15,
                fontWeight: 800,
                color: isSelected ? "#FF6B8A" : "#1c1917",
                lineHeight: 1.2,
                textAlign: "center",
              }}
            >
              {opt.label}
            </span>

            {opt.description && (
              <span
                style={{
                  fontSize: 11,
                  color: isSelected ? "#FF6B8A" : "#78716c",
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
