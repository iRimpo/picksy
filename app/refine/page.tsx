"use client";

import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { decodeQuery } from "@/lib/query-decoder";
import AuraCanvas from "@/components/refine/AuraCanvas";

function RefineContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const q = searchParams.get("q") || "";

  useEffect(() => {
    if (!q.trim()) router.replace("/search");
  }, [q, router]);

  const decoded = decodeQuery(q);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "16px 20px",
          background: "linear-gradient(to bottom, rgba(0,0,0,0.5), transparent)",
        }}
      >
        <Link
          href="/search"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            color: "rgba(255,255,255,0.7)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          <ArrowLeft size={16} />
          Back
        </Link>

        <div style={{ textAlign: "center" }}>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", margin: 0 }}>
            Refining
          </p>
          <p
            style={{
              color: "rgba(255,255,255,0.85)",
              fontSize: 14,
              fontWeight: 600,
              fontFamily: "var(--font-serif), 'Instrument Serif', Georgia, serif",
              fontStyle: "italic",
              margin: 0,
              maxWidth: 200,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {q}
          </p>
        </div>

        <div style={{ width: 60 }} />
      </motion.header>

      {/* Full-screen canvas */}
      <div style={{ flex: 1 }}>
        <AuraCanvas decoded={decoded} />
      </div>
    </div>
  );
}

export default function RefinePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100dvh", background: "#0f0f1a" }} />}>
      <RefineContent />
    </Suspense>
  );
}
