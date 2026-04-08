"use client";

import { useState, useEffect, useRef, useCallback } from "react";

// Adam's hand from "The Creation of Adam" — reaching LEFT with index finger
// extended. Fingertip at far left, forearm/sleeve trailing right.
// Characters: . : | / \ - = ( ) _ ' " ~ ,
// ~30 lines tall, detailed enough to stand beside an oil painting.

const HAND_ART = `
                                                                                          _____
                                                                                    _.--'"     "'-.
                                                                              _.--'"               \\
                                                                        _.--'"                      |
                                                                  _.--'"                            |
                                                            .---'"                                  |
                                                           /                                        |
                                                          /               ___....----"""""""---.     |
                                                         /          _.-'"                      \\    |
                                                        /      _.-'"                            |   |
                                              _________/  _.-'"                                 |   |
                                             /        _.-'                                      |   |
                                            / ___..--'                                          |   |
                                   ________/-'              _....----""""""""---..               |   |
                                  /                   _.--'"                      "-.            |   |
                                 /               _.-'"                               \\           |   |
                        ________/           _.-'"                                     |          |   |
                       /               _.-'"                                          |          |   |
                      /           _.-'"                                               |          |   |
                     /       _.-'"                                                    |          |   |
      __           /    _.-'"                                                         |          |   |
     /  ""--..__  / .-'"                                                              |          |   |
    /           ""*'                                                                  |          |   |
    |            .'                                                                   |          |   |
    \\      _.--'"                                                                     |          |   |
     \\_.-'"    \\                                                                      |          |   |
                \\________                                                             /          |   |
                         ""--..__                                                   ,'           /   |
                                 ""--..___                                       ,'            /    |
                                          ""--..___                           _,'            ,'     |
                                                   ""--..___             _.--'             ,'      /
                                                            ""--..___.-'                ,'       /
                                                                     \\               _'       ,'
                                                                      \\           _-'       ,'
                                                                       \\_______.-'        ,'
                                                                                \\       _'
                                                                                 \\___.--'
`.trim();

interface AsciiHandProps {
  className?: string;
}

export function AsciiHand({ className = "" }: AsciiHandProps) {
  const [visibleChars, setVisibleChars] = useState(0);
  const startTimeRef = useRef<number | null>(null);
  const rafRef = useRef<number>(0);
  const totalChars = HAND_ART.length;

  const CHARS_PER_SECOND = 800;

  const animate = useCallback(
    (timestamp: number) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const elapsed = timestamp - startTimeRef.current;
      const targetChars = Math.min(
        Math.floor((elapsed / 1000) * CHARS_PER_SECOND),
        totalChars
      );

      setVisibleChars(targetChars);

      if (targetChars < totalChars) {
        rafRef.current = requestAnimationFrame(animate);
      }
    },
    [totalChars]
  );

  useEffect(() => {
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [animate]);

  const displayed = HAND_ART.slice(0, visibleChars);

  return (
    <pre
      className={`font-mono text-[#b8ad9e] text-[10px] sm:text-xs md:text-sm leading-none select-none ${className}`}
      aria-hidden="true"
    >
      {displayed}
      {visibleChars < totalChars && (
        <span className="animate-pulse">_</span>
      )}
    </pre>
  );
}
