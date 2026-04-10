"use client";

import { useState, useCallback } from "react";

const MANAGERS = ["pnpm", "npm", "yarn", "bun"] as const;

const COMMANDS: Record<(typeof MANAGERS)[number], string> = {
  pnpm: "pnpm add -g antenna-fyi",
  npm: "npm install -g antenna-fyi",
  yarn: "yarn global add antenna-fyi",
  bun: "bun add -g antenna-fyi",
};

export function InstallBlock() {
  const [active, setActive] = useState<(typeof MANAGERS)[number]>("npm");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(COMMANDS[active]);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [active]);

  return (
    <div
      className="inline-block text-left pointer-events-auto"
      style={{
        backgroundColor: "rgba(26, 20, 18, 0.85)",
        border: "1px solid rgba(184, 173, 158, 0.15)",
        borderRadius: "0",
        minWidth: "min(420px, 90vw)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Tabs */}
      <div
        className="flex gap-1 px-4 pt-3 pb-2"
        style={{ borderBottom: "1px solid rgba(184, 173, 158, 0.08)" }}
      >
        {MANAGERS.map((m) => (
          <button
            key={m}
            onClick={() => setActive(m)}
            className="font-mono text-xs px-3 py-1 transition-colors rounded-sm"
            style={{
              color: active === m ? "#c4a862" : "rgba(184, 173, 158, 0.5)",
              backgroundColor:
                active === m ? "rgba(196, 168, 98, 0.08)" : "transparent",
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Command + copy */}
      <div className="flex items-center justify-between gap-4 px-5 py-4">
        <code className="font-mono text-[13px] text-[#e8dfcc] select-all whitespace-nowrap">
          {COMMANDS[active]}
        </code>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded transition-colors"
          style={{
            border: "1px solid rgba(184, 173, 158, 0.2)",
            color: copied ? "#c4a862" : "rgba(184, 173, 158, 0.5)",
          }}
          title="Copy"
        >
          {copied ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
