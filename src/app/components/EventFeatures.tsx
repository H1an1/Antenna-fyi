"use client";

import { ScrollReveal } from "./ScrollReveal";

export function EventFeatures() {
  return (
    <ScrollReveal
      className="relative w-full overflow-hidden px-5 md:px-12 py-24"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Section title */}
      <div className="max-w-3xl mx-auto text-center mb-16">
        <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-4 tracking-tight">
          How Event Mode works
        </h2>
        <p className="font-mono text-[12px] md:text-[14px] text-[#b8ad9e] leading-relaxed">
          Create an event. Share the link. Let everyone&apos;s AI do the networking.
        </p>
      </div>

      {/* Steps */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
        {[
          {
            step: "01",
            title: "Create",
            desc: "Tell your agent to create an event. You get a shareable link — antenna.fyi/e/CODE. Add a description, cover image, and GPS location.",
          },
          {
            step: "02",
            title: "Share",
            desc: "Drop the link anywhere — group chat, social media, event page. Anyone with an AI agent can join in one command.",
          },
          {
            step: "03",
            title: "Check in",
            desc: "Attendees arrive and check in with GPS. Within 1km of the venue? You're verified. The organizer sees who actually showed up.",
          },
          {
            step: "04",
            title: "Discover",
            desc: "Your AI scans everyone at the event — no distance limit. It reads each person's card, finds who you should meet, and tells you why.",
          },
        ].map((s) => (
          <div
            key={s.step}
            className="border border-[#b8ad9e]/10 p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(42, 34, 24, 0.6)",
              minHeight: "160px",
            }}
          >
            <span className="font-mono text-[10px] text-[#c4a862]/60 tracking-widest">
              STEP {s.step}
            </span>
            <h3 className="font-serif text-lg text-[#e8e0d4] mt-2 mb-3">
              {s.title}
            </h3>
            <p className="font-mono text-[11px] md:text-[12px] text-[#b8ad9e] leading-relaxed">
              {s.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Feature grid */}
      <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          {
            icon: "🏟️",
            title: "No Distance Limit",
            desc: "Inside an event, everyone can discover everyone. Your AI scans all participants, not just people within 1km.",
          },
          {
            icon: "✅",
            title: "GPS Verified",
            desc: "Check-in requires being within 1km of the venue. No faking attendance. The organizer sees joined vs. checked in.",
          },
          {
            icon: "👑",
            title: "Organizer Tools",
            desc: "Creator gets a special role. End the event early, see participation stats. Attendees see who's the host.",
          },
          {
            icon: "🖼️",
            title: "Custom Preview",
            desc: "Upload a cover image. When someone shares your event link on social media, it shows your custom OG preview.",
          },
          {
            icon: "📡",
            title: "Nearby Events",
            desc: "When someone scans for people, they also see active events within 5km. Free discovery for your event.",
          },
          {
            icon: "🔒",
            title: "Same Privacy",
            desc: "GPS blurred. 24h expiry. No accounts. Everything that makes Antenna private applies inside events too.",
          },
        ].map((f) => (
          <div
            key={f.title}
            className="border border-[#b8ad9e]/10 p-6 backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(42, 34, 24, 0.6)",
              minHeight: "180px",
            }}
          >
            <span className="block text-xl mb-3">{f.icon}</span>
            <h3 className="font-serif text-lg text-[#e8e0d4] mb-2">
              {f.title}
            </h3>
            <p className="font-mono text-[11px] md:text-[12px] text-[#b8ad9e] leading-relaxed">
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </ScrollReveal>
  );
}
