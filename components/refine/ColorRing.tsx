"use client";

const SEGMENT_COLORS = [
  "#4ade80",  // green
  "#fb923c",  // orange
  "#a78bfa",  // purple
];

interface ColorRingProps {
  labels: string[];
  selected: number;
  onSelect: (index: number) => void;
}

export default function ColorRing({ labels, selected, onSelect }: ColorRingProps) {
  return (
    <div style={{ padding: "12px 16px 4px" }}>
      <span style={{
        display: "block",
        color: "rgba(255,255,255,0.45)",
        fontSize: 10,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        fontWeight: 600,
        marginBottom: 8,
      }}>
        Priority
      </span>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {labels.map((label, i) => {
          const isSelected = selected === i;
          const color = SEGMENT_COLORS[i] ?? SEGMENT_COLORS[0];
          return (
            <button
              key={label}
              onClick={() => onSelect(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 7,
                minWidth: 80,
                padding: "7px 14px",
                borderRadius: 100,
                border: isSelected ? `1.5px solid ${color}` : "1.5px solid rgba(255,255,255,0.15)",
                background: isSelected ? `${color}28` : "rgba(255,255,255,0.06)",
                cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              <div style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: color,
                flexShrink: 0,
                boxShadow: isSelected ? `0 0 6px ${color}` : "none",
                transition: "box-shadow 0.2s",
              }} />
              <span style={{
                fontSize: 13,
                fontWeight: isSelected ? 600 : 400,
                color: isSelected ? "white" : "rgba(255,255,255,0.6)",
                whiteSpace: "nowrap",
              }}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
