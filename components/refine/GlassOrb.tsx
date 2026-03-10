"use client";

import { motion, type PanInfo } from "framer-motion";

const SIZE_PX = [80, 96, 116] as const;

const ORB_COLORS = [
  "rgba(134,239,172,0.35)",  // green – calming
  "rgba(251,146,60,0.35)",   // orange – brightening / general
  "rgba(167,139,250,0.35)",  // purple – anti-aging / performance
];

interface GlassOrbProps {
  constraintRef: React.RefObject<HTMLDivElement | null>;
  containerRectRef: React.RefObject<DOMRect | null>;
  colorIndex: number;
  sizeIndex: number;
  onDrag: (x: number, y: number) => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  onTap: () => void;
}

export default function GlassOrb({ constraintRef, containerRectRef, colorIndex, sizeIndex, onDrag, onDragStart, onDragEnd, onTap }: GlassOrbProps) {
  const size = SIZE_PX[sizeIndex];
  const color = ORB_COLORS[colorIndex] ?? ORB_COLORS[0];

  function handleDrag(_: PointerEvent | MouseEvent | TouchEvent, info: PanInfo) {
    const rect = containerRectRef.current;
    if (!rect) return;
    const x = Math.max(0, Math.min(1, (info.point.x - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (info.point.y - rect.top) / rect.height));
    onDrag(x, y);
  }

  return (
    <motion.div
      drag
      dragConstraints={constraintRef}
      dragElastic={0.05}
      dragMomentum={false}
      onDrag={handleDrag}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTap={onTap}
      whileDrag={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      style={{
        width: size,
        height: size,
        transition: "width 0.25s ease-out, height 0.25s ease-out",
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
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.2), inset 0 1px 1px rgba(255,255,255,0.5), 0 0 0 1px rgba(255,255,255,0.1)`,
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
    </motion.div>
  );
}
