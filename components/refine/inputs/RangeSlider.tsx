"use client";

import { motion } from "framer-motion";
import type { QuestionDefinition } from "@/lib/types/questions";

interface RangeSliderProps {
  question: QuestionDefinition;
  value: number;
  onChange: (value: number) => void;
  budgetStrict?: boolean;
  onBudgetStrictChange?: (strict: boolean) => void;
}

export default function RangeSlider({ question, value, onChange, budgetStrict = true, onBudgetStrictChange }: RangeSliderProps) {
  const cfg = question.range!;
  const { min, max, step, stops = [], prefix = "", unit = "" } = cfg;
  const isBudget = question.preferenceKey === "budget";

  const pct = ((value - min) / (max - min)) * 100;
  const isAtMax = value >= max;
  const displayVal = isAtMax
    ? `${prefix}${max.toLocaleString()}${unit}+`
    : `${prefix}${value.toLocaleString()}${unit}`;

  return (
    <div style={{ padding: "8px 0 16px" }}>
      {/* Current value bubble */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <motion.div
          key={displayVal}
          initial={{ scale: 1.1, opacity: 0.7 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 28 }}
          className="font-heading"
          style={{
            background: "#FFF0F3",
            border: "1.5px solid #FF6B8A",
            borderRadius: 100,
            padding: "6px 20px",
            fontSize: 22,
            fontWeight: 900,
            color: "#FF6B8A",
            letterSpacing: "-0.01em",
          }}
        >
          {displayVal}
        </motion.div>
      </div>

      {/* Track */}
      <div style={{ position: "relative", padding: "0 4px" }}>
        <div
          style={{
            position: "absolute",
            left: 4,
            top: "50%",
            transform: "translateY(-50%)",
            width: `calc(${pct}% - 4px)`,
            height: 6,
            background: "linear-gradient(90deg, #FF6B8A, #FF9BAD)",
            borderRadius: 100,
            pointerEvents: "none",
            zIndex: 1,
            transition: "width 0.05s",
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          style={{
            width: "100%",
            height: 6,
            borderRadius: 100,
            outline: "none",
            cursor: "pointer",
            appearance: "none",
            background: "#F0EDEA",
            position: "relative",
            zIndex: 2,
          }}
          className="range-slider-thumb"
        />
      </div>

      {/* Stop labels */}
      {stops.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          {stops.map((s) => {
            const isActive = value >= s.value;
            return (
              <motion.button
                key={s.value}
                onClick={() => onChange(s.value)}
                animate={{ color: isActive ? "#FF6B8A" : "#A8A29E" }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                }}
              >
                {s.label}
              </motion.button>
            );
          })}
        </div>
      )}

      {/* Strict / Flexible toggle — only shown for budget questions */}
      {isBudget && onBudgetStrictChange && (
        <div style={{ marginTop: 16 }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: "#78716c", marginBottom: 8, textAlign: "center" }}>
            How strict is this budget?
          </p>
          <div style={{ display: "flex", gap: 8 }}>
            <motion.button
              onClick={() => onBudgetStrictChange(true)}
              animate={{
                background: budgetStrict ? "#FFF0F3" : "#FAFAF9",
                borderColor: budgetStrict ? "#FF6B8A" : "#E8E5E0",
              }}
              whileHover={{ background: budgetStrict ? "#FFE6EC" : "#F5F3F1" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${budgetStrict ? "#FF6B8A" : "#E8E5E0"}`,
                cursor: "pointer",
                outline: "none",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 3 }}>🔒</div>
              <p className="font-heading" style={{ fontSize: 12, fontWeight: 800, color: budgetStrict ? "#FF6B8A" : "#44403c", margin: 0 }}>
                Strict
              </p>
              <p style={{ fontSize: 10, color: budgetStrict ? "#FF6B8A" : "#78716c", margin: "2px 0 0" }}>
                Must stay under {displayVal}
              </p>
            </motion.button>

            <motion.button
              onClick={() => onBudgetStrictChange(false)}
              animate={{
                background: !budgetStrict ? "#F0FDF4" : "#FAFAF9",
                borderColor: !budgetStrict ? "#2ECC71" : "#E8E5E0",
              }}
              whileHover={{ background: !budgetStrict ? "#DCFCE7" : "#F5F3F1" }}
              whileTap={{ scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 12,
                border: `1.5px solid ${!budgetStrict ? "#2ECC71" : "#E8E5E0"}`,
                cursor: "pointer",
                outline: "none",
                textAlign: "center",
              }}
            >
              <div style={{ fontSize: 16, marginBottom: 3 }}>🤙</div>
              <p className="font-heading" style={{ fontSize: 12, fontWeight: 800, color: !budgetStrict ? "#2ECC71" : "#44403c", margin: 0 }}>
                Flexible
              </p>
              <p style={{ fontSize: 10, color: !budgetStrict ? "#2ECC71" : "#78716c", margin: "2px 0 0" }}>
                Around {displayVal} is fine
              </p>
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
