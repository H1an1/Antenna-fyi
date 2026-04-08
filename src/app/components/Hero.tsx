import Image from "next/image";
import { AsciiHand } from "./AsciiHand";

export function Hero() {
  return (
    <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden bg-[#1a1412]">
      {/* Hands composition */}
      <div className="flex items-center justify-center w-full max-w-6xl px-4 gap-0">
        {/* Oil painting hand */}
        <div className="relative w-1/2 flex justify-end">
          <Image
            src="/hand.jpg"
            alt="Renaissance hand reaching out"
            width={800}
            height={450}
            className="object-contain max-h-[50vh]"
            preload
          />
        </div>

        {/* ASCII hand */}
        <div className="w-1/2 flex justify-start -ml-4 overflow-hidden">
          <AsciiHand />
        </div>
      </div>

      {/* Text overlay */}
      <div className="mt-8 text-center">
        <h1 className="font-serif text-5xl md:text-7xl tracking-tight text-[#e8e0d4]">
          Antenna
        </h1>
        <p className="mt-4 font-mono text-sm md:text-base text-[#b8ad9e] max-w-md mx-auto">
          AI-powered social discovery. Find interesting people nearby.
        </p>
        <a
          href="#download"
          className="mt-8 inline-block px-8 py-3 border border-[#c4a862] text-[#c4a862] font-mono text-sm hover:bg-[#c4a862] hover:text-[#1a1412] transition-colors"
        >
          Get Antenna
        </a>
      </div>
    </section>
  );
}
