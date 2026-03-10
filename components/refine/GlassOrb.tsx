"use client";

import { useRef } from "react";
import { motion, type PanInfo } from "framer-motion";

const SIZE_PX = [72, 88, 108] as const;

// Colors for each colorIndex (matches ColorRing segments)
const ORB_COLORS = [
  "rgba(134,239,172,0.35)",  // green – calming
  "rgba(251,146,60,0.35)",   // orange – brightening / general
  "rgba(167,139,250,0.35)",  // purple – anti-aging / performance
];

interface GlassOrbProps {
  constraintRef: React.RefObject<HTMLDivElement | null>;
  colorIndex: number;
  sizeIndex: number;
  onDrag: (x: number, y: number) => void;
  onTap: () => void;
}

export default function GlassOrb({ constraintRef, colorIndex, sizeIndex, onDrag, onTap }: GlassOrbProps) {
  const orbRef = useRef<HTMLDivElement>(null);
  const size = SIZE_PX[sizeIndex];
  const color = ORB_COLORS[colorIndex] ?? ORB_COLORS[0];

  function handleDrag(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const container = constraintRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const orbEl = orbRef.current;
    if (!orbEl) return;
    const orbRect = orbEl.getBoundingClientRect();

    const cx = orbRect.left + orbRect.width / 2 - rect.left;
    const cy = orbRect.top + orbRect.height / 2 - rect.top;

    const x = Math.max(0, Math.min(1, cx / rect.width));
    const y = Math.max(0, Math.min(1, cy / rect.height));
    onDrag(x, y);

    void info; // suppress unused warning
  }

  return (
    <motion.div
      ref={orbRef}
      drag
      dragConstraints={constraintRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDrag={handleDrag}
      onTap={onTap}
      whileDrag={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      animate={{ width: size, height: size }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      style={{
        borderRadius: "50%",
        cursor: "grab",
        touchAction: "none",
        position: "absolute",
        top: "50%",
        left: "50%",
        x: "-50%",
        y: "-50%",
        zIndex: 20,
        background: `radial-gradient(circle at 35% 35%, rgba(255,255,255,0.45), ${color} 60%, rgba(255,255,255,0.05))`,
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        border: "1.5px solid rgba(255,255,255,0.4)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.18), inset 0 1px 1px rgba(255,255,255,0.5), 0 0 0 1px rgba(255,255,255,0.1)`,
      }}
    >
      {/* Center dot */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%,-50%)",
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: "rgba(255,255,255,0.8)",
          boxShadow: "0 0 8px rgba(255,255,255,0.6)",
        }}
      />
      {/* Size hint ring */}
      <motion.div
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: -4,
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.2)",
          pointerEvents: "none",
        }}
      />
    </motion.div>
  );
}
