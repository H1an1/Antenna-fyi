"use client";

import LetterGlitch from "./LetterGlitch";

export function GlitchBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 0, opacity: 0.14 }}
    >
      <LetterGlitch
        glitchColors={["#3a2e1c", "#2a2218", "#4a3c28"]}
        glitchSpeed={120}
        outerVignette={false}
        smooth={true}
        characters="·.:;-+=*o#%@"
      />
    </div>
  );
}
