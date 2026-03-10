"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import type { DecodedQuery, OrbState } from "@/lib/types/refine";
import { resolvePreferences, getColorConfig } from "@/lib/query-decoder";
import GlassOrb from "./GlassOrb";
import AxisLabels from "./AxisLabels";
import ColorRing from "./ColorRing";
import PreferenceReadout from "./PreferenceReadout";

// ─── Gradient color palettes per category ─────────────────────────────────────

const CATEGORY_PALETTES: Record<string, string[]> = {
  Sunscreen:    ["#1e3a5f", "#2d6a4f", "#c77dff", "#e85d04"],
  Moisturizer:  ["#2d6a4f", "#1e3a5f", "#e9c46a", "#e76f51"],
  Cleanser:     ["#023047", "#219ebc", "#e9c46a", "#e76f51"],
  Shampoo:      ["#6d2b6e", "#1a3a5c", "#e9a34a", "#3d6b3e"],
  Headphones:   ["#0d0d1a", "#1a237e", "#f72585", "#4cc9f0"],
  General:      ["#1c1917", "#292524", "#ea580c", "#fb923c"],
};

const COLOR_TINTS = [
  "rgba(74,222,128,0.25)",   // green
  "rgba(251,146,60,0.25)",   // orange
  "rgba(167,139,250,0.25)",  // purple
];

interface AuraCanvasProps {
  decoded: DecodedQuery;
}

export default function AuraCanvas({ decoded }: AuraCanvasProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const { labels: colorLabels, keys: colorKeys } = getColorConfig(decoded.original);

  const [orbState, setOrbState] = useState<OrbState>({
    x: 0.5,
    y: 0.5,
    colorIndex: 1,
    sizeIndex: 1,
  });

  // Hint animation: show ghost path on first mount
  const [showHint, setShowHint] = useState(true);
  const hasInteracted = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  const handleDrag = useCallback((x: number, y: number) => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      setShowHint(false);
    }
    setOrbState((prev) => ({ ...prev, x, y }));
  }, []);

  const handleOrbTap = useCallback(() => {
    setOrbState((prev) => ({ ...prev, sizeIndex: (prev.sizeIndex + 1) % 3 }));
  }, []);

  const handleColorSelect = useCallback((index: number) => {
    setOrbState((prev) => ({ ...prev, colorIndex: index }));
  }, []);

  // Resolve preferences live
  const preferences = resolvePreferences(orbState, decoded, colorKeys);

  const xParam = decoded.parameters.find((p) => p.axis === "x")!;
  const yParam = decoded.parameters.find((p) => p.axis === "y")!;

  // Dynamic gradient based on orb position + colorIndex
  const palette = CATEGORY_PALETTES[decoded.category] ?? CATEGORY_PALETTES.General;
  const tint = COLOR_TINTS[orbState.colorIndex] ?? COLOR_TINTS[1];

  const orbGradient = `radial-gradient(circle at ${orbState.x * 100}% ${orbState.y * 100}%, ${tint} 0%, transparent 55%)`;

  function handleConfirm() {
    const encoded = encodeURIComponent(JSON.stringify(preferences));
    router.push(`/results?q=${encodeURIComponent(decoded.original)}&preferences=${encoded}`);
  }

  function handleSkip() {
    router.push(`/results?q=${encodeURIComponent(decoded.original)}`);
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        touchAction: "none",
        background: `
          radial-gradient(ellipse at 20% 20%, ${palette[0]}cc 0%, transparent 50%),
          radial-gradient(ellipse at 80% 80%, ${palette[1]}cc 0%, transparent 50%),
          radial-gradient(ellipse at 80% 20%, ${palette[2]}55 0%, transparent 45%),
          radial-gradient(ellipse at 20% 80%, ${palette[3]}55 0%, transparent 45%),
          #0f0f1a
        `,
      }}
    >
      {/* Dynamic orb spotlight layer */}
      <motion.div
        animate={{
          background: orbGradient,
        }}
        transition={{ duration: 0.1 }}
        style={{
          position: "absolute",
          inset: 0,
          mixBlendMode: "soft-light",
          pointerEvents: "none",
        }}
      />

      {/* Ambient mesh noise (CSS) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
          opacity: 0.6,
          pointerEvents: "none",
        }}
      />

      {/* Axis labels */}
      {xParam && yParam && (
        <AxisLabels
          xParam={xParam}
          yParam={yParam}
          orbX={orbState.x}
          orbY={orbState.y}
        />
      )}

      {/* Orb */}
      <GlassOrb
        constraintRef={containerRef}
        colorIndex={orbState.colorIndex}
        sizeIndex={orbState.sizeIndex}
        onDrag={handleDrag}
        onTap={handleOrbTap}
      />

      {/* Size hint */}
      {orbState.sizeIndex !== 1 && (
        <div
          style={{
            position: "absolute",
            top: 24,
            right: 24,
            color: "rgba(255,255,255,0.35)",
            fontSize: 10,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            pointerEvents: "none",
          }}
        >
          Tap orb to resize
        </div>
      )}

      {/* Color ring */}
      <ColorRing
        labels={colorLabels}
        selected={orbState.colorIndex}
        onSelect={handleColorSelect}
      />

      {/* First-load hint */}
      {showHint && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -110px)",
            color: "rgba(255,255,255,0.5)",
            fontSize: 13,
            letterSpacing: "0.04em",
            pointerEvents: "none",
            textAlign: "center",
            textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}
        >
          Drag the orb to tune your preferences
        </motion.div>
      )}

      {/* Readout + confirm */}
      <PreferenceReadout
        preferences={preferences}
        query={decoded.original}
        onConfirm={handleConfirm}
        onSkip={handleSkip}
      />
    </motion.div>
  );
}
