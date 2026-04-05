"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
      style={{ background: "#2ECC71" }}
    >
      {/* Floating shapes */}
      <div className="absolute top-16 left-8 w-20 h-20 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-14 h-14 rounded-full bg-white/15 animate-floatSlow pointer-events-none" />

      <PicksyMascot size={96} className="mb-6 drop-shadow-xl" />

      <h2 className="font-heading font-black text-xl text-white mb-3">Something went wrong</h2>
      <p className="text-white/70 text-sm mb-8 max-w-xs">
        An unexpected error occurred. This is on us — please try again.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="bg-white text-brand-green font-heading font-black px-6 py-3 rounded-2xl text-sm hover:bg-white/90 transition-colors shadow-lg"
        >
          Try again
        </button>
        <Link
          href="/"
          className="bg-white/20 text-white font-heading font-bold px-6 py-3 rounded-2xl text-sm hover:bg-white/30 transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
