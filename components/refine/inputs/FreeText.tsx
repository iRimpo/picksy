"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

interface FreeTextProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  placeholder?: string;
}

export default function FreeText({ value, onChange, onSubmit, placeholder }: FreeTextProps) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    // Auto-focus when step appears
    const t = setTimeout(() => ref.current?.focus(), 100);
    return () => clearTimeout(t);
  }, []);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  }

  return (
    <div style={{ padding: "4px 0 16px" }}>
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        style={{
          borderRadius: 16,
          border: "1.5px solid #E8E5E0",
          background: "#FAFAF9",
          overflow: "hidden",
          transition: "border-color 0.15s",
        }}
        onFocus={() => {}}
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder ?? "e.g. needs USB-C, prefer Sony, will use it for gaming at night..."}
          rows={4}
          style={{
            width: "100%",
            background: "transparent",
            border: "none",
            outline: "none",
            resize: "none",
            padding: "14px 16px",
            fontSize: 14,
            color: "#1c1917",
            lineHeight: 1.6,
            fontFamily: "inherit",
          }}
        />
      </motion.div>
      <p style={{ fontSize: 11, color: "#A8A29E", marginTop: 8, textAlign: "right" }}>
        Press Enter to continue, or leave blank to skip
      </p>
    </div>
  );
}
