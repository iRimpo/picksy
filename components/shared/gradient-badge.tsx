import { type GradientBadgeProps } from "@/lib/types/landing";

export function GradientBadge({ number }: GradientBadgeProps) {
  return (
    <div
      className="w-14 h-14 rounded-full flex items-center justify-center text-white font-black text-xl shrink-0"
      style={{ background: "linear-gradient(135deg, #FE2C55, #00F2EA)" }}
    >
      {number}
    </div>
  );
}
