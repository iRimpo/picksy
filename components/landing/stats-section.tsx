import { StatDisplay } from "@/components/shared/stat-display";

const stats = [
  {
    emoji: "⏱️",
    number: "20 min → 30 sec",
    label: "Average research time saved",
  },
  {
    emoji: "🎯",
    number: "87% confidence",
    label: "Users feel good about purchases",
  },
  {
    emoji: "💰",
    number: "Zero regrets",
    label: "No more impulse returns",
  },
];

export function StatsSection() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      <div className="absolute inset-0 gradient-bg" />
      <div className="relative z-10 max-w-5xl mx-auto px-4 md:px-8 text-center">
        <div className="fade-in-section">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 text-white">
            Made for Overthinkers 🧠
          </h2>
          <p className="text-xl text-white/90 mb-16">
            We get it. Making decisions is hard. We make it easy.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
          {stats.map((stat) => (
            <div key={stat.label} className="fade-in-section">
              <StatDisplay {...stat} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
