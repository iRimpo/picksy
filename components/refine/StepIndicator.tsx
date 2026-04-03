"use client";

import { motion } from "framer-motion";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export default function StepIndicator({ currentStep, totalSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 mb-5">
      {Array.from({ length: totalSteps }).map((_, i) => (
        <motion.div
          key={i}
          animate={{
            width: i === currentStep ? 20 : 8,
            opacity: i <= currentStep ? 1 : 0.3,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
          style={{
            height: 8,
            borderRadius: 100,
            background: i === currentStep
              ? "#2ECC71"
              : i < currentStep
              ? "rgba(255,255,255,0.7)"
              : "rgba(255,255,255,0.25)",
          }}
        />
      ))}
    </div>
  );
}
