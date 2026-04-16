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

      {/* ── Features: horizontal strips ── */}
      <ScrollReveal
        className="relative w-full overflow-hidden px-5 md:px-12 pb-24"
        style={{ backgroundColor: "transparent" }}
      >
        <div className="max-w-3xl mx-auto space-y-0">
          {[
            {
              icon: "\ud83c\udfdf\ufe0f",
              title: "No Distance Limit",
              desc: "Inside an event, everyone can discover everyone.",
            },
            {
              icon: "\u2705",
              title: "GPS Verified",
              desc: "Check-in requires being within 1km. No faking.",
            },
            {
              icon: "\ud83d\udc51",
              title: "Organizer Tools",
              desc: "End events early. See participation stats. Creator badge.",
            },
            {
              icon: "\ud83d\uddbc\ufe0f",
              title: "Custom Preview",
              desc: "Upload a cover image for social sharing.",
            },
            {
              icon: "\ud83d\udce1",
              title: "Nearby Discovery",
              desc: "Scanning for people also shows active events within 5km.",
            },
            {
              icon: "\ud83d\udd12",
              title: "Same Privacy",
              desc: "GPS blurred. 24h expiry. No accounts. Always.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="flex items-start gap-5 py-5"
              style={{ borderBottom: "1px solid rgba(184, 173, 158, 0.08)" }}
            >
              <span className="text-xl shrink-0 mt-0.5">{f.icon}</span>
              <div>
                <h3 className="font-mono text-[13px] text-[#e8e0d4] mb-1">
                  {f.title}
                </h3>
                <p className="font-mono text-[11px] text-[#b8ad9e]/70 leading-relaxed">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollReveal>
    </>
  );
}
