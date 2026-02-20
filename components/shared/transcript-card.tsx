import { AlertTriangle, Play, Quote } from "lucide-react";
import { type TranscriptCardProps } from "@/lib/types/landing";

export function TranscriptCard({
  creator,
  followers,
  quote,
  authenticity,
  sentiment,
  sentimentEmoji,
  label,
  labelColor,
  warning,
}: TranscriptCardProps) {
  const authColor =
    authenticity >= 80
      ? "text-green-600 border-green-100 bg-green-50"
      : authenticity >= 60
        ? "text-yellow-600 border-yellow-200 bg-yellow-50"
        : "text-red-500 border-red-100 bg-red-50";

  return (
    <div className="card-elevated p-6 relative overflow-hidden">
      {warning && (
        <div className="absolute top-4 right-4">
          <AlertTriangle size={20} className="text-yellow-500" />
        </div>
      )}
      {/* Video thumbnail mockup */}
      <div
        className="w-full h-32 rounded-xl mb-5 flex items-center justify-center relative overflow-hidden"
        style={{
          background:
            "linear-gradient(135deg, rgba(254,44,85,0.06), rgba(0,242,234,0.06))",
        }}
      >
        <div className="w-14 h-14 rounded-full bg-white/80 flex items-center justify-center backdrop-blur-sm shadow-sm">
          <Play size={24} className="text-gray-700 ml-1" />
        </div>
        <div className="absolute bottom-2 left-2 bg-gray-900/70 text-white rounded-md px-2 py-1 text-xs">
          0:47
        </div>
      </div>
      {/* Creator info */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-full shrink-0"
          style={{
            background: "linear-gradient(135deg, #FE2C55, #00F2EA)",
          }}
        />
        <div>
          <p className="font-bold text-sm text-gray-900">{creator}</p>
          <p className="text-gray-400 text-xs">{followers} followers</p>
        </div>
      </div>
      {/* Quote */}
      <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
        <Quote size={16} className="text-gray-300 mb-2" />
        <p className="text-gray-600 text-sm leading-relaxed italic">
          &ldquo;{quote}&rdquo;
        </p>
      </div>
      {/* Metrics */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full border ${authColor}`}
        >
          Authenticity: {authenticity}/100
        </span>
        <span className="text-xs px-3 py-1 rounded-full bg-gray-50 border border-gray-100 text-gray-600">
          {sentimentEmoji} {sentiment}
        </span>
        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${labelColor}`}
        >
          {label}
        </span>
      </div>
    </div>
  );
}
