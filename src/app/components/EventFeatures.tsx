"use client";

import { ScrollReveal } from "./ScrollReveal";

export function EventFeatures() {
  return (
    <>
      {/* ── Steps: vertical timeline ── */}
      <ScrollReveal
        className="relative w-full overflow-hidden px-5 md:px-12 py-24"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-16 tracking-tight text-center">
            How it works
          </h2>

          <div className="relative">
            {/* Vertical line */}
            <div
              className="absolute left-[19px] top-0 bottom-0 w-px"
              style={{ backgroundColor: "rgba(196, 168, 98, 0.15)" }}
            />

            {[
              {
                step: "01",
                title: "Create an event",
                desc: "Tell your agent. Get a shareable link. Add a description, cover image, and GPS.",
              },
              {
                step: "02",
                title: "Share the link",
                desc: "Drop it in a group chat, tweet it, print it on a poster. Anyone with an AI agent can join.",
              },
              {
                step: "03",
                title: "Attendees check in",
                desc: "Arrive at the venue. Your agent verifies GPS — within 1km, you\u2019re in. Organizer sees who showed up.",
              },
              {
                step: "04",
                title: "AI does the rest",
                desc: "Your agent scans everyone. No distance limit inside events. It finds who you should meet and tells you why.",
              },
            ].map((s, i) => (
              <div key={s.step} className="relative pl-14 pb-12 last:pb-0">
                {/* Dot */}
                <div
                  className="absolute left-[12px] top-[2px] w-[15px] h-[15px] rounded-full border-2"
                  style={{
                    borderColor: "#c4a862",
                    backgroundColor: i === 3 ? "#c4a862" : "transparent",
                  }}
                />
                <span className="font-mono text-[10px] text-[#c4a862]/50 tracking-[0.2em] uppercase">
                  Step {s.step}
                </span>
                <h3 className="font-serif text-lg text-[#e8e0d4] mt-1 mb-2">
                  {s.title}
                </h3>
                <p className="font-mono text-[12px] text-[#b8ad9e] leading-relaxed max-w-md">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ScrollReveal>

      {/* ── Features: grid ── */}
      <ScrollReveal
        className="relative w-full overflow-hidden px-5 md:px-12 pb-24"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "◎",
              title: "No Distance Limit",
              desc: "Inside an event, everyone can discover everyone. Your AI scans all participants, not just people within 1km.",
            },
            {
              icon: "◈",
              title: "GPS Verified",
              desc: "Check-in requires being within 1km of the venue. No faking attendance. The organizer sees joined vs. checked in.",
            },
            {
              icon: "◇",
              title: "Organizer Tools",
              desc: "Creator gets a special role. End the event early, see participation stats. Attendees see who's the host.",
            },
            {
              icon: "⊘",
              title: "Custom Preview",
              desc: "Upload a cover image for your event. Social sharing shows your custom OG preview instead of a generic card.",
            },
            {
              icon: "↔",
              title: "Nearby Discovery",
              desc: "When someone scans for people nearby, they also see active events within 5km. Free exposure for your event.",
            },
            {
              icon: "▣",
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
              <span className="block text-xl text-[#c4a862] mb-3 font-mono">{f.icon}</span>
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
    </>
  );
}
