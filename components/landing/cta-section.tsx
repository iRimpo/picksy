import Link from "next/link";
import { ArrowRight, Smartphone, Monitor, Users } from "lucide-react";
import { EmailForm } from "@/components/shared/email-form";

export function CtaSection() {
  return (
    <section id="waitlist" className="relative py-20 md:py-32 overflow-hidden bg-gray-50">
      <div className="blob-pink -top-40 -left-40" />
      <div className="blob-cyan -bottom-40 -right-40" />

      <div className="relative z-10 max-w-3xl mx-auto px-4 md:px-8 text-center">
        <div className="fade-in-section mb-8">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
            <span className="gradient-text">Ready to Stop Overthinking?</span>
          </h2>
          <p className="text-lg text-gray-500 mb-8">
            Try it free now — no sign up required. Get your first recommendation in under 30 seconds.
          </p>

          {/* Primary CTA */}
          <Link
            href="/search"
            className="inline-flex items-center gap-2 btn-gradient px-10 py-4 rounded-2xl font-bold text-lg text-white mb-4"
          >
            Try It Free <ArrowRight size={20} />
          </Link>
        </div>

        <div className="fade-in-section mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-sm text-gray-400">or join the waitlist for updates</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>
          <EmailForm />
        </div>

        <div className="fade-in-section">
          <p className="text-gray-400 text-sm mb-6">
            ✨ Free to use &bull; No credit card required &bull; No sign-up needed
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 text-gray-300 text-xs">
            <span className="flex items-center gap-1">
              <Smartphone size={14} /> Mobile-first
            </span>
            <span className="flex items-center gap-1">
              <Monitor size={14} /> Works on desktop too
            </span>
            <span className="flex items-center gap-1">
              <Users size={14} /> 1,247 already use it
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
