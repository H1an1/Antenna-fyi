"use client";

import { DynamicAsciiHand } from "./DynamicAsciiHand";
import { ScrollReveal } from "./ScrollReveal";

export function Features() {
  return (
    <>
      {/* ── Section 1: WHY ── left hand + right card ── */}
      <ScrollReveal className="relative min-h-screen w-full overflow-hidden flex items-center" style={{ backgroundColor: "transparent" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/lefthand.png"
          alt=""
          className="absolute pointer-events-none hidden md:block"
          style={{
            left: 0,
            top: "50%",
            width: "40%",
            height: "auto",
            transform: "translateY(-50%)",
          }}
        />

        <div className="relative ml-auto w-full md:w-[65%] flex items-center justify-center py-16 md:py-24 px-5 md:px-6 md:pr-10">
          <span
            className="absolute font-serif select-none pointer-events-none"
            style={{
              fontSize: "clamp(8rem, 20vw, 18rem)",
              color: "rgba(196, 168, 98, 0.06)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              zIndex: 0,
              top: "-10%",
              left: "-20%",
            }}
          >
            WHY
          </span>

          <div
            className="relative z-10 border border-[#b8ad9e]/15 p-8 max-w-2xl w-full backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(42, 34, 24, 0.85)",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.5), 0 0 1px rgba(196, 168, 98, 0.2)",
            }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-8 tracking-tight">
              Why Antenna?
            </h2>
            <div className="space-y-6 font-mono text-[12px] md:text-[14px] text-[#b8ad9e] leading-relaxed">
              <p>
                In the age of AI, the most important thing hasn't changed —
                it's still the people around you. No algorithm should ever
                replace the warmth of a real encounter.
              </p>
              <p>
                But what if the AI you already talk to every day could help you
                find those encounters? Your agent knows your context — what you
                care about, what you're curious about, what you need — far
                better than any profile you'd fill out yourself.
              </p>
              <p>
                Antenna lets your AI do what social apps never could: recognize
                who around you is genuinely worth meeting, and tell you why.
                Not through swiping. Not through bios. Through understanding.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Section 2: HOW ── left card + right hand ── */}
      <ScrollReveal className="relative min-h-screen w-full overflow-hidden flex items-center" style={{ backgroundColor: "transparent" }}>
        {/* Right ASCII hand group: wash + dynamic characters — hidden on mobile */}
        <div
          className="absolute pointer-events-none hidden md:block"
          style={{
            top: "calc(5% - 150px)",
            right: "0",
            bottom: "calc(5% + 150px)",
            left: "calc(42% - 260px)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hand-wash.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <DynamicAsciiHand />
        </div>

        <div className="relative mr-auto w-full md:w-[65%] flex items-center justify-center py-16 md:py-24 px-5 md:px-6 md:pl-10 md:-translate-y-[150px]">
          {/* HOW — large background text */}
          <span
            className="absolute font-serif select-none pointer-events-none"
            style={{
              fontSize: "clamp(8rem, 20vw, 18rem)",
              color: "rgba(196, 168, 98, 0.06)",
              lineHeight: 1,
              letterSpacing: "-0.04em",
              zIndex: 0,
              top: "-10%",
              right: "-15%",
            }}
          >
            HOW
          </span>

          <div
            className="relative z-10 border border-[#b8ad9e]/15 p-8 max-w-2xl w-full backdrop-blur-sm"
            style={{
              backgroundColor: "rgba(42, 34, 24, 0.85)",
              boxShadow:
                "0 24px 80px rgba(0, 0, 0, 0.5), 0 0 1px rgba(196, 168, 98, 0.2)",
            }}
          >
            <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-8 tracking-tight">
              How it works
            </h2>
            <div className="space-y-6 font-mono text-[12px] md:text-[14px] text-[#b8ad9e] leading-relaxed">
              <p>
                You don't set up a profile. You don't upload photos.
                You just keep talking to your AI the way you already do.
              </p>
              <p>
                Antenna runs quietly alongside your agent. When someone
                interesting comes within 500 meters, your AI figures out
                why you two might click — shared obsessions, complementary
                skills, the kind of overlap that only emerges from real
                context, not checkboxes.
              </p>
              <p>
                A gentle nudge. A reason. A window that closes in 24 hours.
                Everything disappears after — no chat logs, no follow
                requests, no trace. Just the memory of someone you chose
                to meet.
              </p>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* ── Section 3: Feature grid ── */}
      <ScrollReveal
        className="relative w-full overflow-hidden px-5 md:px-12 pb-[150px] md:pb-[300px]"
        style={{ backgroundColor: "transparent", marginTop: "-100px" }}
      >
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: "◎",
              title: "Every Agent",
              desc: "Works with any AI agent — OpenClaw, Hermes, Claude, or your own. One install.",
            },
            {
              icon: "◈",
              title: "Three Lines",
              desc: "No photo. No bio page. Just three lines: who you are, what you're into, what you're looking for right now.",
            },
            {
              icon: "⏳",
              title: "24h Expiry",
              desc: "Matches, cards, contact info — everything auto-deletes. No history, no archive, no baggage.",
            },
            {
              icon: "◇",
              title: "GPS Blurred",
              desc: "Coordinates fuzzy-hashed to ~150m. Nobody knows exactly where you are. Not even us.",
            },
            {
              icon: "⊘",
              title: "Zero Config",
              desc: "No signup. No app. One command and your agent handles the rest.",
            },
            {
              icon: "↔",
              title: "Mutual Match",
              desc: "Both sides accept? Your agents swap contact info directly. No in-app chat — meet in the real world.",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="border border-[#b8ad9e]/10 p-6 backdrop-blur-sm"
              style={{
                backgroundColor: "rgba(42, 34, 24, 0.6)",
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
