const features = [
  {
    title: "Agent-Mediated Discovery",
    description:
      "Your AI agent scans for interesting people within 500 meters and explains why you should meet.",
  },
  {
    title: "Ephemeral Connections",
    description:
      "All matches and contact info auto-expire after 24 hours. No history, no baggage.",
  },
  {
    title: "Privacy-First",
    description:
      "GPS blurred to ~150m. No registration. No profile photos. Just three lines about who you are.",
  },
];

export function Features() {
  return (
    <section className="py-24 px-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-[#2a2218] border border-[#b8ad9e]/10 p-8"
          >
            <h3 className="font-serif text-lg text-[#c4a862] mb-4">
              {f.title}
            </h3>
            <p className="font-mono text-sm text-[#b8ad9e] leading-relaxed">
              {f.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
