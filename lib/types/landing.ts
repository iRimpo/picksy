import { type LucideIcon } from "lucide-react";

export interface ProblemCardProps {
  icon: string;
  title: string;
  description: string;
  borderColor: string;
}

export interface StepCardProps {
  number: string;
  icon: LucideIcon;
  title: string;
  description: string;
  children?: React.ReactNode;
}

export interface TranscriptCardProps {
  creator: string;
  followers: string;
  quote: string;
  authenticity: number;
  sentiment: string;
  sentimentEmoji: string;
  label: string;
  labelColor: string;
  warning?: boolean;
}

export interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  gradient: string;
}

export interface StatDisplayProps {
  emoji: string;
  number: string;
  label: string;
}

export interface FloatingEmojiProps {
  emoji: string;
  className?: string;
}

export interface GradientBadgeProps {
  number: string;
}

export interface EmailFormState {
  status: "idle" | "loading" | "success" | "error";
  message: string;
}
