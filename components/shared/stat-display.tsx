import { type StatDisplayProps } from "@/lib/types/landing";

export function StatDisplay({ emoji, number, label }: StatDisplayProps) {
  return (
    <div className="text-center">
      <div className="text-4xl mb-3">{emoji}</div>
      <div className="text-3xl md:text-4xl font-black mb-2">{number}</div>
      <div className="text-white/70 text-sm font-medium">{label}</div>
    </div>
  );
}
