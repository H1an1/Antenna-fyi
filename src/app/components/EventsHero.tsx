"use client";

import ScrambledText from "./ScrambledText";
import { InstallBlock } from "./InstallBlock";
import { DynamicAsciiFlame } from "./DynamicAsciiFlame";
import { Prometheus } from "./Prometheus";

// hand-bg.png is 2048 × 1143
const PAINTING_ASPECT = 2048 / 1143;

// Inner gold-edge inset of the painted frame — must match Hero so the
// inner painting lands flush against the gilded border.
const INNER_FRAME_INSET =
  "calc(7% + 10px) calc(5% + 10px) calc(8% + 10px) calc(5% + 10px)";

export function EventsHero() {
  return (
    <section className="relative h-screen w-full overflow-hidden z-[1] bg-[#1a1412]">
      {/* Painting wrapper — same fit-contain logic as the home Hero so the
          gilded frame lines up identically. */}
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        style={{
          width: `min(100vw, calc(100vh * ${PAINTING_ASPECT}))`,
          height: `min(100vh, calc(100vw / ${PAINTING_ASPECT}))`,
          backgroundImage: "url(/hand-bg.png)",
          backgroundSize: "100% 100%",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Inner painting — Prometheus, fitted to the inner gold border.
            DynamicAsciiFlame reads the same image and paints the flame swirl
            in animated ASCII over the cover-fitted background. */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "calc(7% + 10px)",
            right: "calc(5% + 10px)",
            bottom: "calc(8% + 10px)",
            left: "calc(5% + 10px)",
            backgroundImage: "url(/events-bg.png)",
            backgroundSize: "cover",
            backgroundPosition: "center center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <DynamicAsciiFlame />
          <Prometheus />
        </div>

        {/* Scanline + flicker overlay — sits on top of the painting only */}
        <div
          className="absolute pointer-events-none scanline-overlay"
          style={{ inset: 0, clipPath: `inset(${INNER_FRAME_INSET})` }}
        />

        {/* Title — anchored in the left ruins area */}
        <div className="absolute top-[120px] md:top-[140px] left-[calc(7%+100px)] z-10 pointer-events-none text-left">
          <div className="flex items-baseline whitespace-nowrap gap-6">
            <ScrambledText
              className="antenna-scramble"
              radius={70}
              duration={1.1}
              speed={0.55}
              scrambleChars=".:"
            >
              Antenna
            </ScrambledText>
            <ScrambledText
              className="antenna-scramble"
              style={{ fontSize: "48px" }}
              radius={70}
              duration={1.1}
              speed={0.55}
              scrambleChars=".:"
            >
              Event
            </ScrambledText>
          </div>
          <p className="mt-3 font-mono text-sm md:text-base text-[#e8dfcc] drop-shadow leading-relaxed text-right">
            AI-powered social discovery.
            <br />
            Your AI knows who to meet here.
          </p>
        </div>

        {/* Install block — anchored to bottom of the painting */}
        <div className="absolute bottom-[100px] md:bottom-[124px] left-0 right-0 z-10 text-center pointer-events-none px-4 md:px-0">
          <InstallBlock />
        </div>
      </div>
    </section>
  );
}
