import { TranscriptCard } from "@/components/shared/transcript-card";

const transcripts = [
  {
    creator: "@skincarebyjess",
    followers: "412K",
    quote:
      "I've been using this for 3 months and my skin has NEVER looked better. The texture absorbs in 30 seconds with zero residue.",
    authenticity: 94,
    sentimentEmoji: "😊",
    sentiment: "Very Positive",
    label: "Organic Review",
    labelColor: "bg-green-50 text-green-600 border border-green-100",
  },
  {
    creator: "@honestreviews",
    followers: "156K",
    quote:
      "It's overhyped. Does nothing my $10 drugstore version doesn't do. Save your money.",
    authenticity: 91,
    sentimentEmoji: "😞",
    sentiment: "Negative",
    label: "Organic Review",
    labelColor: "bg-green-50 text-green-600 border border-green-100",
  },
  {
    creator: "@glowupgirl",
    followers: "892K",
    quote: "OMG this is AMAZING! Use code GLOW20 for 20% off!",
    authenticity: 48,
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
