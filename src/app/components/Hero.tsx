"use client";

import { useEffect, useState } from "react";
import { DynamicAsciiHand } from "./DynamicAsciiHand";
import ScrambledText from "./ScrambledText";
import { InstallBlock } from "./InstallBlock";

const DISPLACEMENT = 80; // initial offset in px
const SCROLL_RANGE = 400; // scroll px over which hands converge

export function Hero() {
  const [offset, setOffset] = useState(DISPLACEMENT);

  useEffect(() => {
    const onScroll = () => {
      const progress = Math.min(window.scrollY / SCROLL_RANGE, 1);
      setOffset(DISPLACEMENT * (1 - progress));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section
      className="relative h-screen w-full overflow-y-hidden z-[1]"
      style={{
        backgroundColor: "#1a1412",
        backgroundImage: "url(/hand-bg.png)",
        backgroundSize: "cover",
        backgroundPosition: "center center",
        backgroundRepeat: "no-repeat",
      }}
    >
      {/* Oil painting left hand — hidden on mobile, too cramped */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/lefthand.png"
        alt=""
        className="absolute pointer-events-none will-change-transform w-[75%] left-[-50px] md:w-[45%] md:left-[calc(2%+40px)]"
        style={{
          top: "calc(18% + 100px)",
          height: "auto",
          transform: `translateX(${-offset}px)`,
        }}
      />

      {/* Right ASCII hand group: scroll offset wrapper */}
      <div
        className="absolute inset-0 pointer-events-none will-change-transform"
        style={{ transform: `translateX(${offset}px)` }}
      >
        {/* Mobile scale wrapper */}
        <div className="absolute inset-0 scale-[0.55] origin-right md:scale-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/hand-wash.png"
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <DynamicAsciiHand />
        </div>
      </div>

      {/* Scanline + flicker overlay */}
      <div className="absolute inset-0 pointer-events-none scanline-overlay" />

      {/* Title */}
      <div className="absolute top-[60px] md:top-[84px] left-0 right-0 z-10 pointer-events-none text-center">
        <ScrambledText
          className="antenna-scramble"
          radius={70}
          duration={1.1}
          speed={0.55}
          scrambleChars=".:"
        >
          Antenna
        </ScrambledText>
        <p className="mt-3 font-mono text-sm md:text-base text-[#e8dfcc] max-w-md mx-auto drop-shadow leading-relaxed">
          AI-powered social discovery.
          <br />
          Find interesting people nearby.
        </p>
      </div>

      {/* Install block — anchored to bottom */}
      <div className="absolute bottom-[60px] md:bottom-[124px] left-0 right-0 z-10 text-center pointer-events-none px-4 md:px-0">
        <InstallBlock />
      </div>
    </section>
  );
}
