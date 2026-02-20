import { type ProblemCardProps } from "@/lib/types/landing";

export function ProblemCard({
  icon,
  title,
  description,
  borderColor,
}: ProblemCardProps) {
  return (
    <div
      className={`card-elevated p-8 border-2 ${borderColor} cursor-default`}
    >
      <div className="text-5xl mb-5">{icon}</div>
      <h3 className="text-xl font-extrabold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
}
