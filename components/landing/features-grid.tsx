import { Target, MapPin, Zap, MessageCircle } from "lucide-react";
import { FeatureCard } from "@/components/shared/feature-card";

const features = [
  {
    icon: MessageCircle,
    title: "Real Reddit Consensus",
    description:
      "We scan r/SkincareAddiction, r/HairCare, r/BuyItForLife and more. Real people, unfiltered opinions — no sponsored posts, no brand BS.",
    gradient: "bg-gradient-to-br from-[#FF4500]/10 to-transparent",
  },
  {
    icon: Target,
    title: "One Winner. No Confusion.",
    description:
      "Not a ranked list of 50 options. One clear recommendation with a score (0–100), real pros/cons, and a \"why this won\" explanation.",
    gradient: "bg-gradient-to-br from-brand-pink/10 to-transparent",
  },
  {
    icon: MapPin,
    title: "Store-Specific Results",
    description:
      "Shopping at Walmart, Target, CVS, or Ulta? Tell us where and we'll show what's available near you, at what price, right now.",
    gradient: "bg-gradient-to-br from-brand-cyan/10 to-transparent",
  },
  {
    icon: Zap,
    title: "Under 30 Seconds",
    description:
      "Skip the 20-minute research session. From search to confident decision in under half a minute. Your cart will thank you.",
    gradient: "bg-gradient-to-br from-brand-yellow/10 to-transparent",
  },
];

export function FeaturesGrid() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
      <div className="fade-in-section text-center mb-16">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
          Why Picksy Works 🏆
        </h2>
        <p className="text-lg text-gray-500">
          Reddit has the answers. We just make them easy to find.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 stagger-children">
        {features.map((feature) => (
          <div key={feature.title} className="fade-in-section">
            <FeatureCard {...feature} />
          </div>
        ))}
      </div>
    </section>
  );
}
