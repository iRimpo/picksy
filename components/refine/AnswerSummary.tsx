"use client";

import { motion, AnimatePresence } from "framer-motion";
import type { QuestionAnswer, QuestionDefinition } from "@/lib/types/questions";

interface AnswerSummaryProps {
  answers: QuestionAnswer[];
  questions: QuestionDefinition[];
  query: string;
  onConfirm: () => void;
  onSkip: () => void;
}

function chipLabel(answer: QuestionAnswer, question: QuestionDefinition): string {
  if (answer.rangeValue !== undefined && question.range) {
    const { prefix = "", unit = "", max } = question.range;
    const val = answer.rangeValue;
    return val >= max
      ? `${prefix}${val.toLocaleString()}${unit}+`
      : `${prefix}${val.toLocaleString()}${unit}`;
  }
  if (answer.selectedOptionIds?.length) {
    const labels = question.options
      ?.filter((o) => answer.selectedOptionIds!.includes(o.id))
      .map((o) => o.label) ?? [];
    return labels.join(", ");
  }
  return "";
}

export default function AnswerSummary({ answers, questions, query, onConfirm, onSkip }: AnswerSummaryProps) {
  const chips = answers
    .map((a) => {
      const q = questions.find((q) => q.id === a.questionId);
      if (!q) return null;
      const label = chipLabel(a, q);
      return label ? { label, key: a.questionId } : null;
    })
    .filter((c): c is { label: string; key: string } => c !== null);

  const productWord = query.split(" ").slice(-1)[0];

  return (
    <div style={{ padding: "12px 0 4px" }}>
      {/* Chips */}
      {chips.length > 0 && (
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14, justifyContent: "center" }}>
          <AnimatePresence mode="popLayout">
            {chips.map((chip) => (
              <motion.span
                key={chip.key}
                layout
                initial={{ opacity: 0, scale: 0.8, y: 6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
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
                {chip.label}
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "center" }}>
        <motion.button
          className="font-heading"
          onClick={onConfirm}
          whileTap={{ scale: 0.97 }}
          whileHover={{ scale: 1.03, boxShadow: "0 8px 28px rgba(255,107,138,0.5)" }}
          style={{
            background: "linear-gradient(135deg, #FF6B8A, #2ECC71)",
            color: "white",
            border: "none",
            borderRadius: 100,
            padding: "12px 28px",
            fontSize: 14,
            fontWeight: 800,
            cursor: "pointer",
            letterSpacing: "0.02em",
            boxShadow: "0 4px 20px rgba(255,107,138,0.4)",
          }}
        >
          Find my {productWord} →
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
          Skip
        </button>
      </div>
    </div>
  );
}
