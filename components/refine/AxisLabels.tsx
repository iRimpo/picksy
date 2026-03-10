"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";
import type { QueryParameter } from "@/lib/types/refine";

export interface AxisLabelsHandle {
  update: (x: number, y: number) => void;
}

interface AxisLabelsProps {
  xParam: QueryParameter;
  yParam: QueryParameter;
}

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
  whiteSpace: "nowrap",
  position: "absolute",
};

const AxisLabels = forwardRef<AxisLabelsHandle, AxisLabelsProps>(function AxisLabels({ xParam, yParam }, ref) {
  const leftRef  = useRef<HTMLSpanElement>(null);
  const rightRef = useRef<HTMLSpanElement>(null);
  const topRef   = useRef<HTMLSpanElement>(null);
  const botRef   = useRef<HTMLSpanElement>(null);

  useImperativeHandle(ref, () => ({
    update(x: number, y: number) {
      if (leftRef.current)  leftRef.current.style.opacity  = String(0.55 + (1 - x) * 0.45);
      if (rightRef.current) rightRef.current.style.opacity = String(0.55 + x * 0.45);
      if (topRef.current)   topRef.current.style.opacity   = String(0.55 + (1 - y) * 0.45);
      if (botRef.current)   botRef.current.style.opacity   = String(0.55 + y * 0.45);
    },
  }), []);

  return (
    <>
      <span ref={leftRef}  style={{ ...pillBase, left: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.775 }}>{xParam.minLabel}</span>
      <span ref={rightRef} style={{ ...pillBase, right: 12, top: "50%", transform: "translateY(-50%)", opacity: 0.775 }}>{xParam.maxLabel}</span>
      <span ref={topRef}   style={{ ...pillBase, top: 14, left: "50%", transform: "translateX(-50%)", opacity: 0.775 }}>{yParam.minLabel}</span>
      <span ref={botRef}   style={{ ...pillBase, bottom: 14, left: "50%", transform: "translateX(-50%)", opacity: 0.775 }}>{yParam.maxLabel}</span>

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
});

export default AxisLabels;
