import { ProblemCard } from "@/components/shared/problem-card";

const problems = [
  {
    icon: "🔄",
    title: "Research Rabbit Holes",
    description:
      "Spending 20+ minutes jumping between Reddit, TikTok, YouTube, and Instagram reviews. Opening 15 tabs. Still no answer.",
    borderColor: "border-brand-pink/20",
  },
  {
    icon: "😰",
    title: "Aisle Paralysis",
    description:
      "Standing in Best Buy at 7pm, staring at 23 laptops, scrolling through specs on your phone while the sales rep hovers awkwardly nearby.",
    borderColor: "border-brand-cyan/20",
  },
  {
    icon: "💸",
    title: "Viral Regret",
    description:
      "Bought the hyped gadget. It was mediocre. You can't tell paid tech reviews from honest ones anymore and you're tired of wasting money.",
    borderColor: "border-brand-yellow/20",
  },
];

export function ProblemSection() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto">
      <div className="fade-in-section text-center mb-16">
        <p className="text-brand-pink text-sm font-semibold uppercase tracking-widest mb-4">
          For the Chronically Indecisive
        </p>
        <h2 className="text-4xl md:text-5xl font-black text-gray-900">
          Sound Familiar? 😅
        </h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
        {problems.map((problem) => (
          <div key={problem.title} className="fade-in-section">
            <ProblemCard {...problem} />
          </div>
        ))}
      </div>
    </section>
  );
}
