"use client";

import { useState } from "react";
import { ArrowRight, Mail, X } from "lucide-react";
import { submitEmail } from "@/app/actions";

export function EmailForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");

    const result = await submitEmail(email);

    if (result.success) {
      setStatus("success");
      setEmail("");
    } else {
      setStatus("error");
      setErrorMessage(result.message);
    }
  };

  if (status === "success") {
    return (
      <div className="card-elevated p-8 md:p-12 text-center max-w-xl mx-auto border-green-100">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-extrabold mb-2 text-gray-900">
          You&apos;re on the list!
        </h3>
        <p className="text-gray-500">
          We&apos;ll let you know the moment Picksy is ready. Get ready to never
          overthink a purchase again.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="card-elevated p-8 md:p-12 max-w-xl mx-auto"
    >
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Mail
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setStatus("idle");
              setErrorMessage("");
            }}
            placeholder="your.email@gmail.com"
            aria-label="Email address"
            className={`w-full pl-12 pr-4 py-4 bg-gray-50 border-2 rounded-2xl text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-pink transition-colors ${
              status === "error" ? "border-red-400" : "border-gray-100"
            }`}
          />
        </div>
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-gradient px-8 py-4 rounded-2xl font-bold text-white whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {status === "loading" ? (
            <span className="inline-block w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Get Early Access <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>
      {status === "error" && (
        <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
          <X size={14} /> {errorMessage}
        </p>
      )}
    </form>
  );
}
