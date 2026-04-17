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
      {/* Painting wrapper — mobile: fill section (cover). Desktop: fit-contain
          centered so the whole gilded frame is visible. */}
      <div
        className="absolute inset-0 bg-cover bg-center
                   md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2
                   md:w-[min(100vw,calc(100vh*2048/1143))] md:h-[min(100vh,calc(100vw*1143/2048))]
                   md:bg-[length:100%_100%]"
        style={{
          backgroundImage: "url(/hand-bg.png)",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Inner painting — Prometheus, fitted to the inner gold border.
            DynamicAsciiFlame reads the same image and paints the flame swirl
            in animated ASCII over the cover-fitted background. */}
        <div
          className="absolute pointer-events-none bg-cover bg-center
                     top-[calc(7%+10px)] bottom-[calc(8%+10px)] left-0 right-0
                     md:left-[calc(5%+10px)] md:right-[calc(5%+10px)]"
          style={{
            backgroundImage: "url(/events-bg.png)",
            backgroundRepeat: "no-repeat",
          }}
        >
          <DynamicAsciiFlame />
          <Prometheus />
        </div>

        {/* Scanline + flicker overlay — sits on top of the painting only */}
        <div
          className="absolute inset-0 pointer-events-none scanline-overlay
                     md:[clip-path:inset(calc(7%+10px)_calc(5%+10px)_calc(8%+10px)_calc(5%+10px))]"
        />

        {/* Title + subtitle — subtitle sits under title block with home-Hero gap (mt-3) */}
        <div className="absolute top-[80px] md:top-[140px] left-0 right-0 md:left-[calc(7%+100px)] md:right-auto z-10 pointer-events-none text-center md:text-left px-4 md:px-0">
          <div className="flex items-baseline justify-center md:justify-start whitespace-nowrap gap-3 md:gap-6">
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
              style={{ fontSize: "clamp(1.75rem, 4vw, 48px)" }}
              radius={70}
              duration={1.1}
              speed={0.55}
              scrambleChars=".:"
            >
              Event
            </ScrambledText>
          </div>
          <p className="mt-3 font-mono text-sm md:text-base text-[#e8dfcc] drop-shadow leading-relaxed text-center md:text-right">
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
