import { type FloatingEmojiProps } from "@/lib/types/landing";

export function FloatingEmoji({ emoji, className }: FloatingEmojiProps) {
  return (
    <span
      className={`absolute text-3xl md:text-5xl select-none pointer-events-none ${className}`}
      aria-hidden="true"
    >
      {emoji}
    </span>
  );
}
