import { TranscriptCard } from "@/components/shared/transcript-card";

const transcripts = [
  {
    creator: "@mkbhd",
    followers: "18.2M",
    quote:
      "The noise cancellation is legitimately the best I've ever tested. Sony absolutely nailed the comfort on this revision.",
    authenticity: 97,
    sentimentEmoji: "😊",
    sentiment: "Very Positive",
    label: "Organic Review",
    labelColor: "bg-green-50 text-green-600 border border-green-100",
  },
  {
    creator: "@lttreviews",
    followers: "876K",
    quote:
      "It's good but overhyped at full price. Wait for a sale — there are solid alternatives for $50 less.",
    authenticity: 91,
    sentimentEmoji: "😐",
    sentiment: "Mixed",
    label: "Organic Review",
    labelColor: "bg-green-50 text-green-600 border border-green-100",
  },
  {
    creator: "@techdealstoday",
    followers: "234K",
    quote: "OMG these headphones CHANGED MY LIFE! Use code TECH30 for 30% off!",
    authenticity: 41,
    sentimentEmoji: "🤩",
    sentiment: "Very Positive",
    label: "Sponsored Content",
    labelColor: "bg-yellow-50 text-yellow-700 border border-yellow-200",
    warning: true,
  },
];

export function TranscriptShowcase() {
  return (
    <section className="py-20 md:py-32 px-4 md:px-8 lg:px-16 max-w-7xl mx-auto relative overflow-hidden">
      <div className="blob-cyan -top-40 -left-60" />

      <div className="fade-in-section text-center mb-16 relative z-10">
        <h2 className="text-4xl md:text-5xl font-black mb-4 text-gray-900">
          See What People Actually Said 💬
        </h2>
        <p className="text-lg text-gray-500">
          Real quotes from real reviews — not just star ratings
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children relative z-10">
        {transcripts.map((transcript) => (
          <div key={transcript.creator} className="fade-in-section">
            <TranscriptCard {...transcript} />
          </div>
        ))}
      </div>
    </section>
  );
}
