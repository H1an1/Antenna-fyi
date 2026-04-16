"use client";

import { useEffect, useRef } from "react";
import { DynamicAsciiHand } from "./DynamicAsciiHand";
import ScrambledText from "./ScrambledText";
import { InstallBlock } from "./InstallBlock";

const DISPLACEMENT = 80; // initial offset in px
const SCROLL_RANGE = 400; // scroll px over which hands converge

// hand-bg.png is 2048 × 1143
const PAINTING_ASPECT = 2048 / 1143;

// Inner gold-edge inset of the painted frame. Tweak to match the gilded inner border.
// Order: top right bottom left.
const INNER_FRAME_INSET =
  "calc(7% + 10px) calc(5% + 10px) calc(8% + 10px) calc(5% + 10px)";

export function Hero() {
  const leftHandRef = useRef<HTMLImageElement>(null);
  const rightHandRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    const apply = () => {
      raf = 0;
      const progress = Math.min(window.scrollY / SCROLL_RANGE, 1);
      const o = DISPLACEMENT * (1 - progress);
      if (leftHandRef.current) {
        leftHandRef.current.style.transform = `translate3d(${-o}px,0,0)`;
      }
      if (rightHandRef.current) {
        rightHandRef.current.style.transform = `translate3d(${o}px,0,0)`;
      }
    };
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(apply);
    };
    apply();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <section className="relative h-screen w-full overflow-hidden z-[1] bg-[#1a1412]">
      {/* Painting wrapper — centered, fit-contain so the whole gilded frame is always visible */}
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
        {/* Hands clipped to the inner gold border. clip-path keeps hand
            coordinates intact so the scroll-reveal still slides them in. */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ clipPath: `inset(${INNER_FRAME_INSET})` }}
        >
          {/* Oil painting left hand — hidden on mobile, too cramped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={leftHandRef}
            src="/lefthand.png"
            alt=""
            className="absolute pointer-events-none will-change-transform w-[55%] left-[-10px] md:w-[45%] md:left-[calc(2%+40px)]"
            style={{
              top: "calc(18% + 110px)",
              height: "auto",
              transform: `translate3d(${-DISPLACEMENT}px,0,0)`,
            }}
          />

          {/* Right ASCII hand group: scroll offset wrapper */}
          <div
            ref={rightHandRef}
            className="absolute inset-0 pointer-events-none will-change-transform"
            style={{ transform: `translate3d(${DISPLACEMENT}px,0,0)` }}
          >
            {/* On mobile: container extends to 180vw wide, shifted left so
                the hand region (~right half of 2048px image) lands on screen.
                On desktop: normal inset-0. */}
            <div className="absolute top-0 bottom-0 w-[350vw] -left-[120vw] -translate-y-[60px] md:w-full md:left-0 md:right-0 md:translate-y-0 scale-[0.35] md:scale-100 origin-center md:origin-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hand-wash.png"
                alt=""
                className="absolute inset-0 w-full h-full object-cover"
              />
              <DynamicAsciiHand />
            </div>
          </div>
        </div>

        {/* Scanline + flicker overlay — sits on top of the painting only */}
        <div className="absolute inset-0 pointer-events-none scanline-overlay" />

        {/* Title */}
        <div className="absolute top-[80px] md:top-[84px] left-0 right-0 z-10 pointer-events-none text-center">
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

        {/* Install block — anchored to bottom of the painting */}
        <div className="absolute bottom-[100px] md:bottom-[124px] left-0 right-0 z-10 text-center pointer-events-none px-4 md:px-0">
          <InstallBlock />
        </div>
      </div>
    </section>
  );
}
