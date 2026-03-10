"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DecodedQuery, OrbState, QueryParameter } from "@/lib/types/refine";
import { resolvePreferences, getColorConfig } from "@/lib/query-decoder";
import GlassOrb from "./GlassOrb";
import AxisLabels from "./AxisLabels";
import ColorRing from "./ColorRing";
import PreferenceReadout from "./PreferenceReadout";

// ─── Lightened gradient palettes (+30% lightness) ─────────────────────────────

const CATEGORY_PALETTES: Record<string, string[]> = {
  Sunscreen:    ["#3a6a9f", "#4a9a7a", "#d9a0ff", "#f08040"],
  Moisturizer:  ["#4a9a7a", "#3a6a9f", "#f5d88a", "#f59e7a"],
  Cleanser:     ["#1e607a", "#3abcdc", "#f5d88a", "#f59e7a"],
  Shampoo:      ["#9a4a9c", "#2a5a8c", "#f5c07a", "#7ab87a"],
  Headphones:   ["#2a2a5a", "#2a4ab8", "#ff7ab8", "#8af0ff"],
  General:      ["#5a4a3a", "#7a6a64", "#f09040", "#fdb870"],
  DryShampoo:   ["#6a6a3a", "#4a4a6a", "#f0f0c8", "#c8c8f0"],
  EyeCream:     ["#4a6a3a", "#3a5a5a", "#f0f0b8", "#b8f0f0"],
  HairOil:      ["#6a5a3a", "#4a6a3a", "#f0e0b8", "#d0f0b8"],
  BodyWash:     ["#3a7a8a", "#2a5a7a", "#a8e4f0", "#f0c87a"],
  BodyLotion:   ["#5a7a5a", "#3a5a7a", "#c8f0d8", "#c8d8f0"],
  FaceOil:      ["#7a5a3a", "#5a3a6a", "#f0d8b8", "#d8b8f0"],
  Deodorant:    ["#5a8a5a", "#3a6a5a", "#c8f0c8", "#f0e8c8"],
  Conditioner:  ["#7a5a8a", "#4a5a8a", "#f0c8f0", "#c8d8f0"],
  FaceMask:     ["#5a3a6a", "#3a4a7a", "#f0b8d8", "#b8c8f0"],
  Serum:        ["#3a5a7a", "#5a3a6a", "#f0d8b8", "#d8b8f0"],
  Toner:        ["#3a6a6a", "#5a5a3a", "#c8f0e8", "#f0e8c8"],
  LipBalm:      ["#8a3a5a", "#5a3a4a", "#f0c8d8", "#f0d8c8"],
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
  const containerRectRef = useRef<DOMRect | null>(null);
  const spotlightRef = useRef<HTMLDivElement>(null);
  const crosshairHRef = useRef<HTMLDivElement>(null);
  const crosshairVRef = useRef<HTMLDivElement>(null);
  const dragLabelRef = useRef<HTMLDivElement>(null);

  // Refs for direct DOM updates (avoid stale closures)
  const orbXRef = useRef(0.5);
  const orbYRef = useRef(0.5);
  const colorIndexRef = useRef(1);
  const xParamRef = useRef<QueryParameter | null>(null);
  const yParamRef = useRef<QueryParameter | null>(null);

  const { labels: colorLabels, keys: colorKeys } = getColorConfig(decoded.original);

  const [orbState, setOrbState] = useState<OrbState>({
    x: 0.5,
    y: 0.5,
    colorIndex: 1,
    sizeIndex: 1,
  });

  const [showHint, setShowHint] = useState(true);
  const hasInteracted = useRef(false);

  // Keep param refs fresh
  xParamRef.current = decoded.parameters.find((p) => p.axis === "x") ?? null;
  yParamRef.current = decoded.parameters.find((p) => p.axis === "y") ?? null;

  // Cache container rect on mount and on resize
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    containerRectRef.current = el.getBoundingClientRect();
    const observer = new ResizeObserver(() => {
      containerRectRef.current = el.getBoundingClientRect();
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  // Set initial spotlight background after mount
  useEffect(() => {
    const el = spotlightRef.current;
    if (el) {
      const tint = COLOR_TINTS[1];
      el.style.background = `radial-gradient(circle at 50% 50%, ${tint} 0%, transparent 55%)`;
    }
  }, []);

  const handleDrag = useCallback((x: number, y: number) => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      setShowHint(false);
    }
    orbXRef.current = x;
    orbYRef.current = y;

    // Bypass React — mutate DOM directly for zero-lag spotlight
    const el = spotlightRef.current;
    if (el) {
      const tint = COLOR_TINTS[colorIndexRef.current] ?? COLOR_TINTS[1];
      el.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${tint} 0%, transparent 55%)`;
    }

    // Crosshair reposition (direct DOM, zero reflow)
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    if (hLine) hLine.style.top = `${y * 100}%`;
    if (vLine) vLine.style.left = `${x * 100}%`;

    // Label reposition + content
    const label = dragLabelRef.current;
    if (label) {
      const xLabel = xParamRef.current?.resolve(x) ?? "";
      const yLabel = yParamRef.current?.resolve(y) ?? "";
      label.textContent = `${xLabel}  ·  ${yLabel}`;
      label.style.left = `${Math.min(x * 100, 75)}%`;
      label.style.top = `${Math.max(y * 100 - 14, 4)}%`;
    }

    setOrbState((prev) => ({ ...prev, x, y }));
  }, []); // stable: only uses refs

  const handleDragStart = useCallback(() => {
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    const label = dragLabelRef.current;
    if (hLine) hLine.style.opacity = "1";
    if (vLine) vLine.style.opacity = "1";
    if (label) label.style.opacity = "1";
  }, []);

  const handleDragEnd = useCallback(() => {
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    const label = dragLabelRef.current;
    if (hLine) hLine.style.opacity = "0";
    if (vLine) vLine.style.opacity = "0";
    if (label) label.style.opacity = "0";
  }, []);

  const handleOrbTap = useCallback(() => {
    setOrbState((prev) => ({ ...prev, sizeIndex: (prev.sizeIndex + 1) % 3 }));
  }, []);

  const handleColorSelect = useCallback((index: number) => {
    colorIndexRef.current = index;
    setOrbState((prev) => ({ ...prev, colorIndex: index }));
    const el = spotlightRef.current;
    if (el) {
      const tint = COLOR_TINTS[index] ?? COLOR_TINTS[1];
      el.style.background = `radial-gradient(circle at ${orbXRef.current * 100}% ${orbYRef.current * 100}%, ${tint} 0%, transparent 55%)`;
    }
  }, []); // stable: only uses refs

  const preferences = resolvePreferences(orbState, decoded, colorKeys);

  const xParam = decoded.parameters.find((p) => p.axis === "x")!;
  const yParam = decoded.parameters.find((p) => p.axis === "y")!;

  const palette = CATEGORY_PALETTES[decoded.category] ?? CATEGORY_PALETTES.General;

  function handleConfirm() {
    const encoded = encodeURIComponent(JSON.stringify(preferences));
    router.push(`/results?q=${encodeURIComponent(decoded.original)}&preferences=${encoded}`);
  }

  function handleSkip() {
    router.push(`/results?q=${encodeURIComponent(decoded.original)}`);
  }

  return (
    <div style={{ borderRadius: 16, overflow: "hidden", background: "#1c1917", boxShadow: "0 4px 24px rgba(0,0,0,0.12)" }}>
      {/* Drag area */}
      <div
        ref={containerRef}
        style={{
          position: "relative",
          width: "100%",
          height: 400,
          overflow: "hidden",
          touchAction: "none",
          background: `
            radial-gradient(ellipse at 20% 20%, ${palette[0]}cc 0%, transparent 50%),
            radial-gradient(ellipse at 80% 80%, ${palette[1]}cc 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, ${palette[2]}55 0%, transparent 45%),
            radial-gradient(ellipse at 20% 80%, ${palette[3]}55 0%, transparent 45%),
            #1c1917
          `,
        }}
      >
        {/* Spotlight layer — mutated directly, never via React state */}
        <div
          ref={spotlightRef}
          style={{
            position: "absolute",
            inset: 0,
            mixBlendMode: "soft-light",
            pointerEvents: "none",
          }}
        />

        {/* Crosshair horizontal line */}
        <div
          ref={crosshairHRef}
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: "50%",
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 80%, transparent)",
            opacity: 0,
            transition: "opacity 0.25s",
            pointerEvents: "none",
            zIndex: 15,
          }}
        />

        {/* Crosshair vertical line */}
        <div
          ref={crosshairVRef}
          style={{
            position: "absolute",
            top: 0,
            bottom: 0,
            left: "50%",
            width: 1,
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 80%, transparent)",
            opacity: 0,
            transition: "opacity 0.25s",
            pointerEvents: "none",
            zIndex: 15,
          }}
        />

        {/* Floating drag label */}
        <div
          ref={dragLabelRef}
          style={{
            position: "absolute",
            zIndex: 25,
            pointerEvents: "none",
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            color: "white",
            fontSize: 11,
            fontWeight: 500,
            padding: "4px 10px",
            borderRadius: 100,
            whiteSpace: "nowrap",
            opacity: 0,
            transition: "opacity 0.25s",
            left: "50%",
            top: "36%",
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
          containerRectRef={containerRectRef}
          colorIndex={orbState.colorIndex}
          sizeIndex={orbState.sizeIndex}
          onDrag={handleDrag}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onTap={handleOrbTap}
        />

        {/* First-load hint */}
        {showHint && (
          <div
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
          </div>
        )}
      </div>

      {/* Priority row — horizontal pills, below drag area */}
      <ColorRing
        labels={colorLabels}
        selected={orbState.colorIndex}
        onSelect={handleColorSelect}
      />

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

      {/* Preference readout — light styling, not overlaid */}
      <div style={{ background: "#fafaf9", padding: "0 16px" }}>
        <PreferenceReadout
          preferences={preferences}
          query={decoded.original}
          onConfirm={handleConfirm}
          onSkip={handleSkip}
        />
      </div>
    </div>
  );
}
