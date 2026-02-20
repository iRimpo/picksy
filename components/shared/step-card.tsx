import { type StepCardProps } from "@/lib/types/landing";
import { GradientBadge } from "./gradient-badge";

export function StepCard({
  number,
  icon: Icon,
  title,
  description,
  children,
}: StepCardProps) {
  return (
    <div className="flex flex-col items-center text-center">
      <GradientBadge number={number} />
      <div className="card-elevated p-8 mt-6 w-full">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{
            background:
              "linear-gradient(135deg, rgba(254,44,85,0.08), rgba(0,242,234,0.08))",
          }}
        >
          <Icon size={28} className="text-brand-pink" />
        </div>
        <h3 className="text-xl font-extrabold mb-3 text-gray-900">{title}</h3>
        <p className="text-gray-500 leading-relaxed text-sm mb-5">
          {description}
        </p>
        {children}
      </div>
    </div>
  );
}
