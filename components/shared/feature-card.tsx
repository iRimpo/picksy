import { type FeatureCardProps } from "@/lib/types/landing";

export function FeatureCard({
  icon: Icon,
  title,
  description,
  gradient,
}: FeatureCardProps) {
  return (
    <div className="group card-elevated p-8 relative overflow-hidden">
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${gradient}`}
      />
      <div className="relative z-10">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(254,44,85,0.08), rgba(0,242,234,0.08))",
          }}
        >
          <Icon size={28} className="text-brand-pink" />
        </div>
        <h3 className="text-xl font-extrabold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-sm">{description}</p>
      </div>
    </div>
  );
}
