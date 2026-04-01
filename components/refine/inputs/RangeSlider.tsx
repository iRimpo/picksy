"use client";

import type { QuestionDefinition } from "@/lib/types/questions";

interface RangeSliderProps {
  question: QuestionDefinition;
  value: number;
  onChange: (value: number) => void;
}

export default function RangeSlider({ question, value, onChange }: RangeSliderProps) {
  const cfg = question.range!;
  const { min, max, step, stops = [], prefix = "", unit = "" } = cfg;

  const pct = ((value - min) / (max - min)) * 100;
  const isAtMax = value >= max;
  const displayVal = isAtMax
    ? `${prefix}${max.toLocaleString()}${unit}+`
    : `${prefix}${value.toLocaleString()}${unit}`;

  return (
    <div style={{ padding: "8px 0 24px" }}>
      {/* Current value bubble */}
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
        <div
          style={{
            background: "rgba(46,204,113,0.2)",
            border: "1.5px solid rgba(46,204,113,0.4)",
            borderRadius: 100,
            padding: "6px 20px",
            fontSize: 22,
            fontWeight: 800,
            color: "white",
            letterSpacing: "-0.01em",
          }}
        >
          {displayVal}
        </div>
      </div>

      {/* Track container */}
      <div style={{ position: "relative", padding: "0 4px" }}>
        {/* Custom track fill */}
        <div
          style={{
            position: "absolute",
            left: 4,
            top: "50%",
            transform: "translateY(-50%)",
            width: `calc(${pct}% - 4px)`,
            height: 6,
            background: "linear-gradient(90deg, #2ECC71, #25A855)",
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
            background: "rgba(255,255,255,0.12)",
            position: "relative",
            zIndex: 2,
          }}
          // Inline CSS for the thumb — Tailwind can't reach pseudo-elements
          className="range-slider-thumb"
        />
      </div>

      {/* Stop labels */}
      {stops.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
          {stops.map((s) => {
            const isActive = value >= s.value;
            return (
              <button
                key={s.value}
                onClick={() => onChange(s.value)}
                style={{
                  fontSize: 10,
                  fontWeight: isActive ? 700 : 400,
                  color: isActive ? "rgba(46,204,113,0.9)" : "rgba(255,255,255,0.3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "2px 0",
                  transition: "color 0.15s",
                }}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
