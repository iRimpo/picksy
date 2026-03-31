"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { DecodedQuery, OrbState, QueryParameter } from "@/lib/types/refine";
import { resolvePreferences, getColorConfig } from "@/lib/query-decoder";
import GlassOrb from "./GlassOrb";
import AxisLabels, { type AxisLabelsHandle } from "./AxisLabels";
import ColorRing from "./ColorRing";
import PreferenceReadout from "./PreferenceReadout";

// ─── Lightened gradient palettes (+30% lightness) ─────────────────────────────

const CATEGORY_PALETTES: Record<string, string[]> = {
  Headphones:   ["#2a2a5a", "#2a4ab8", "#ff7ab8", "#8af0ff"],
  Laptop:       ["#1a3a5a", "#2a6a9a", "#8ad4f0", "#f0e87a"],
  TV:           ["#1a1a3a", "#3a2a6a", "#8a6af0", "#f06a8a"],
  Smartphone:   ["#2a3a5a", "#1a5a8a", "#6af0d8", "#f0a06a"],
  Keyboard:     ["#1a2a4a", "#4a2a6a", "#a06af0", "#f0f06a"],
  Mouse:        ["#2a1a4a", "#4a3a7a", "#c86af0", "#6af0c8"],
  Monitor:      ["#1a2a3a", "#2a4a6a", "#6aaaf0", "#f0c86a"],
  Speaker:      ["#3a1a4a", "#6a2a4a", "#f06ac8", "#6af0f0"],
  Camera:       ["#1a2a2a", "#2a5a4a", "#6af0a0", "#f0c84a"],
  Tablet:       ["#2a2a4a", "#3a4a7a", "#8a9af0", "#f0a88a"],
  General:      ["#5a4a3a", "#7a6a64", "#f09040", "#fdb870"],
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
  const containerRef    = useRef<HTMLDivElement>(null);
  const containerRectRef = useRef<DOMRect | null>(null);
  const spotlightRef    = useRef<HTMLDivElement>(null);
  const crosshairHRef   = useRef<HTMLDivElement>(null);
  const crosshairVRef   = useRef<HTMLDivElement>(null);
  const dragLabelRef    = useRef<HTMLDivElement>(null);
  const axisLabelsRef   = useRef<AxisLabelsHandle>(null);

  // Position / color refs — source of truth during drag, never cause re-renders
  const orbXRef       = useRef(0.5);
  const orbYRef       = useRef(0.5);
  const colorIndexRef = useRef(1);
  const xParamRef     = useRef<QueryParameter | null>(null);
  const yParamRef     = useRef<QueryParameter | null>(null);

  // Keep param refs in sync (decoded is stable between renders)
  xParamRef.current = decoded.parameters.find((p) => p.axis === "x") ?? null;
  yParamRef.current = decoded.parameters.find((p) => p.axis === "y") ?? null;

  const { labels: colorLabels, keys: colorKeys } = getColorConfig(decoded.original);

  // React state — only updated on drag END and discrete interactions
  const [orbState, setOrbState] = useState<OrbState>({
    x: 0.5,
    y: 0.5,
    colorIndex: 1,
    sizeIndex: 1,
  });

  const [showHint, setShowHint] = useState(true);
  const hasInteracted = useRef(false);

  // Cache container rect; refresh on resize (never during drag)
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    containerRectRef.current = el.getBoundingClientRect();
    const ro = new ResizeObserver(() => {
      containerRectRef.current = el.getBoundingClientRect();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setShowHint(false), 3000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const el = spotlightRef.current;
    if (el) {
      const tint = COLOR_TINTS[1];
      el.style.background = `radial-gradient(circle at 50% 50%, ${tint} 0%, transparent 55%)`;
    }
  }, []);

  // ─── Drag handlers — zero React state updates, pure DOM ───────────────────
  const handleDrag = useCallback((x: number, y: number) => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      setShowHint(false);
    }
    orbXRef.current = x;
    orbYRef.current = y;

    // Spotlight
    const el = spotlightRef.current;
    if (el) {
      const tint = COLOR_TINTS[colorIndexRef.current] ?? COLOR_TINTS[1];
      el.style.background = `radial-gradient(circle at ${x * 100}% ${y * 100}%, ${tint} 0%, transparent 55%)`;
    }

    // Axis label opacities
    axisLabelsRef.current?.update(x, y);

    // Crosshair
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    if (hLine) hLine.style.top  = `${y * 100}%`;
    if (vLine) vLine.style.left = `${x * 100}%`;

    // Floating label
    const label = dragLabelRef.current;
    if (label) {
      const xLabel = xParamRef.current?.resolve(x) ?? "";
      const yLabel = yParamRef.current?.resolve(y) ?? "";
      label.textContent = `${xLabel}  ·  ${yLabel}`;
      label.style.left = `${Math.min(x * 100, 75)}%`;
      label.style.top  = `${Math.max(y * 100 - 14, 4)}%`;
    }
    // No setOrbState here — zero React renders during drag
  }, []);

  const handleDragStart = useCallback(() => {
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    const label = dragLabelRef.current;
    if (hLine)  hLine.style.opacity  = "1";
    if (vLine)  vLine.style.opacity  = "1";
    if (label)  label.style.opacity  = "1";
  }, []);

  const handleDragEnd = useCallback(() => {
    // Hide indicators
    const hLine = crosshairHRef.current;
    const vLine = crosshairVRef.current;
    const label = dragLabelRef.current;
    if (hLine)  hLine.style.opacity  = "0";
    if (vLine)  vLine.style.opacity  = "0";
    if (label)  label.style.opacity  = "0";

    // Flush final position to React state once (updates chips + buttons)
    const x = orbXRef.current;
    const y = orbYRef.current;
    setOrbState((prev) => ({ ...prev, x, y }));
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
  }, []);

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
        {/* Spotlight — direct DOM, never React */}
        <div
          ref={spotlightRef}
          style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", pointerEvents: "none" }}
        />

        {/* Crosshair H */}
        <div
          ref={crosshairHRef}
          style={{
            position: "absolute", left: 0, right: 0, top: "50%", height: 1,
            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 80%, transparent)",
            opacity: 0, transition: "opacity 0.25s", pointerEvents: "none", zIndex: 15,
          }}
        />

        {/* Crosshair V */}
        <div
          ref={crosshairVRef}
          style={{
            position: "absolute", top: 0, bottom: 0, left: "50%", width: 1,
            background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.3) 20%, rgba(255,255,255,0.3) 80%, transparent)",
            opacity: 0, transition: "opacity 0.25s", pointerEvents: "none", zIndex: 15,
          }}
        />

        {/* Floating drag label */}
        <div
          ref={dragLabelRef}
          style={{
            position: "absolute", zIndex: 25, pointerEvents: "none",
            background: "rgba(0,0,0,0.55)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
            color: "white", fontSize: 11, fontWeight: 500,
            padding: "4px 10px", borderRadius: 100, whiteSpace: "nowrap",
            opacity: 0, transition: "opacity 0.25s",
            left: "50%", top: "36%",
          }}
        />

        {/* Axis labels — imperative updates, no re-renders */}
        {xParam && yParam && (
          <AxisLabels ref={axisLabelsRef} xParam={xParam} yParam={yParam} />
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
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -110px)",
            color: "rgba(255,255,255,0.5)", fontSize: 13, letterSpacing: "0.04em",
            pointerEvents: "none", textAlign: "center", textShadow: "0 1px 8px rgba(0,0,0,0.5)",
          }}>
            Drag the orb to tune your preferences
          </div>
        )}
      </div>

      {/* Priority row */}
      <ColorRing labels={colorLabels} selected={orbState.colorIndex} onSelect={handleColorSelect} />

      {/* Divider */}
      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "0 16px" }} />

      {/* Preference readout — only re-renders on drag end */}
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
