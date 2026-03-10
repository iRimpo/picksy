"use client";

import type { QueryParameter } from "@/lib/types/refine";

interface AxisLabelsProps {
  xParam: QueryParameter;
  yParam: QueryParameter;
  orbX: number;
  orbY: number;
}

export default function AxisLabels({ xParam, yParam, orbX, orbY }: AxisLabelsProps) {
  const leftOpacity = 0.55 + (1 - orbX) * 0.45;
  const rightOpacity = 0.55 + orbX * 0.45;
  const topOpacity = 0.55 + (1 - orbY) * 0.45;
  const bottomOpacity = 0.55 + orbY * 0.45;

  const pillBase: React.CSSProperties = {
    background: "rgba(255,255,255,0.15)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    borderRadius: 100,
    padding: "3px 10px",
    fontSize: 13,
    color: "white",
    fontWeight: 500,
    letterSpacing: "0.03em",
    userSelect: "none",
    pointerEvents: "none",
    transition: "opacity 0.3s",
    whiteSpace: "nowrap",
    position: "absolute",
  };

  return (
    <>
      {/* X-axis: left */}
      <span style={{ ...pillBase, left: 12, top: "50%", transform: "translateY(-50%)", opacity: leftOpacity }}>
        {xParam.minLabel}
      </span>

      {/* X-axis: right */}
      <span style={{ ...pillBase, right: 12, top: "50%", transform: "translateY(-50%)", opacity: rightOpacity }}>
        {xParam.maxLabel}
      </span>

      {/* Y-axis: top */}
      <span style={{ ...pillBase, top: 14, left: "50%", transform: "translateX(-50%)", opacity: topOpacity }}>
        {yParam.minLabel}
      </span>

      {/* Y-axis: bottom */}
      <span style={{ ...pillBase, bottom: 14, left: "50%", transform: "translateX(-50%)", opacity: bottomOpacity }}>
        {yParam.maxLabel}
      </span>

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
