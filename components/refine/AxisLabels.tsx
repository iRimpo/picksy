"use client";

import { motion } from "framer-motion";
import type { QueryParameter } from "@/lib/types/refine";

interface AxisLabelsProps {
  xParam: QueryParameter;
  yParam: QueryParameter;
  orbX: number;
  orbY: number;
}

export default function AxisLabels({ xParam, yParam, orbX, orbY }: AxisLabelsProps) {
  // Brightness based on orb proximity to that edge
  const leftOpacity = 0.4 + (1 - orbX) * 0.5;
  const rightOpacity = 0.4 + orbX * 0.5;
  const topOpacity = 0.4 + (1 - orbY) * 0.5;
  const bottomOpacity = 0.4 + orbY * 0.5;

  const labelBase: React.CSSProperties = {
    position: "absolute",
    color: "white",
    fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
    fontSize: "clamp(11px, 1.4vw, 14px)",
    fontStyle: "italic",
    letterSpacing: "0.04em",
    userSelect: "none",
    pointerEvents: "none",
    textShadow: "0 1px 8px rgba(0,0,0,0.4)",
  };

  return (
    <>
      {/* X-axis: left */}
      <motion.span
        animate={{ opacity: leftOpacity }}
        transition={{ duration: 0.3 }}
        style={{ ...labelBase, left: 20, top: "50%", transform: "translateY(-50%) rotate(-90deg)", transformOrigin: "center" }}
      >
        {xParam.minLabel}
      </motion.span>

      {/* X-axis: right */}
      <motion.span
        animate={{ opacity: rightOpacity }}
        transition={{ duration: 0.3 }}
        style={{ ...labelBase, right: 20, top: "50%", transform: "translateY(-50%) rotate(90deg)", transformOrigin: "center" }}
      >
        {xParam.maxLabel}
      </motion.span>

      {/* Y-axis: top */}
      <motion.span
        animate={{ opacity: topOpacity }}
        transition={{ duration: 0.3 }}
        style={{ ...labelBase, top: 28, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}
      >
        {yParam.minLabel}
      </motion.span>

      {/* Y-axis: bottom */}
      <motion.span
        animate={{ opacity: bottomOpacity }}
        transition={{ duration: 0.3 }}
        style={{ ...labelBase, bottom: 28, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}
      >
        {yParam.maxLabel}
      </motion.span>

      {/* Axis lines (subtle) */}
      <div style={{
        position: "absolute", top: "50%", left: "5%", right: "5%", height: 1,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", left: "50%", top: "5%", bottom: "5%", width: 1,
        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.08), transparent)",
        pointerEvents: "none",
      }} />
    </>
  );
}
