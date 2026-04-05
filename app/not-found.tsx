import Link from "next/link";
import { PicksyMascot } from "@/components/shared/picksy-mascot";

export default function NotFound() {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 text-center relative overflow-hidden"
      style={{ background: "#2ECC71" }}
    >
      {/* Floating shapes */}
      <div className="absolute top-16 left-8 w-20 h-20 rounded-full bg-white/10 animate-float pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-14 h-14 rounded-full bg-white/15 animate-floatSlow pointer-events-none" />
      <svg className="absolute top-24 right-1/3 animate-spinSlow opacity-20 pointer-events-none" width="24" height="24" viewBox="0 0 32 32" fill="none">
        <path d="M16 2 L18.5 13.5 L30 16 L18.5 18.5 L16 30 L13.5 18.5 L2 16 L13.5 13.5 Z" fill="white" />
      </svg>

      <PicksyMascot size={96} className="mb-6 drop-shadow-xl" />

      <h1 className="font-heading font-black text-5xl text-white mb-2">404</h1>
      <h2 className="font-heading font-black text-xl text-white mb-3">Page not found</h2>
      <p className="text-white/70 text-sm mb-8 max-w-xs">
        This page doesn&rsquo;t exist. But your perfect pick does — let&rsquo;s find it.
      </p>

      <Link
        href="/"
        className="bg-white text-brand-green font-heading font-black px-8 py-3.5 rounded-2xl text-sm hover:bg-white/90 transition-colors shadow-lg"
      >
        Back to Picksy →
      </Link>
    </div>
  );
}
