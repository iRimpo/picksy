import { CSSProperties } from "react";

export function PicksyMascot({ size = 80, className = "", style }: { size?: number; className?: string; style?: CSSProperties }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={style}
      aria-label="Picksy mascot"
    >
      {/* Dark green outer ring */}
      <circle cx="60" cy="60" r="60" fill="#1B7A3E" />
      {/* Medium green inner disc */}
      <circle cx="60" cy="60" r="52" fill="#229950" />
      <circle cx="60" cy="60" r="47" fill="#25A855" opacity="0.5" />
      {/* Pink face (slightly below center) */}
      <circle cx="60" cy="63" r="36" fill="#FF9EC8" />
      {/* Cheek blushes */}
      <ellipse cx="44" cy="72" rx="8" ry="5" fill="#FF6B8A" opacity="0.4" />
      <ellipse cx="76" cy="72" rx="8" ry="5" fill="#FF6B8A" opacity="0.4" />
      {/* Left closed eye (upward arch = happy) */}
      <path d="M 44 61 Q 51.5 53.5 59 61" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Right closed eye */}
      <path d="M 61 61 Q 68.5 53.5 76 61" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Smile */}
      <path d="M 48 70 Q 60 82 72 70" stroke="#1A1A2E" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Big 4-pointed sparkle star (top-left) */}
      <path d="M 22 16 L 25 23 L 32 26 L 25 29 L 22 36 L 19 29 L 12 26 L 19 23 Z" fill="white" />
      {/* Small sparkle star (top-right area) */}
      <path d="M 90 10 L 92 15 L 97 17 L 92 19 L 90 24 L 88 19 L 83 17 L 88 15 Z" fill="white" opacity="0.9" />
      {/* Tiny dot accent */}
      <circle cx="100" cy="30" r="3" fill="white" opacity="0.6" />
    </svg>
  );
}
