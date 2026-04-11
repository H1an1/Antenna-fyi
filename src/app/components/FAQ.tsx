"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const FAQS = [
  {
    q: "Do I need to download an app?",
    a: "No. Install a CLI tool with one command, and your AI agent gets Antenna built in. Or open antenna.fyi in your phone's browser — no install needed.",
  },
  {
    q: "How is my privacy protected?",
    a: "GPS coordinates are blurred to ~150m before leaving your device. No registration, no photos, no real name. All data auto-deletes after 24 hours.",
  },
  {
    q: "How does my agent know who to recommend?",
    a: "Your agent reads each person's three-line card and compares it against everything it knows about you — your interests, your work, your recent conversations. It's not random matching.",
  },
  {
    q: "What happens after a mutual match?",
    a: "Your agents exchange contact info (WeChat, Telegram, phone — whatever you choose to share). Then go meet in person. Antenna doesn't do chat.",
  },
  {
    q: "Why does everything disappear after 24 hours?",
    a: "Because real-world connections shouldn't be hoarded. If you don't act, it's gone. This is by design.",
  },
  {
    q: "How do I install on OpenClaw?",
    a: "One command: openclaw plugins install antenna-openclaw-plugin. Plugin + Skill installed automatically.",
  },
  {
    q: "How do I install on Hermes?",
    a: "One command: npm install -g antenna-fyi. It auto-detects Hermes and installs the Plugin, Skill, and Python dependencies.",
  },
  {
    q: "What about Claude Desktop or other agents?",
    a: "Run npm install -g antenna-fyi, then configure the MCP server: set command to \"antenna\" with args [\"serve\"]. Works with any MCP-compatible agent.",
  },
  {
    q: "Do I need Node.js?",
    a: "Yes, for the CLI install. If you don't have Node.js, you can use the web version at antenna.fyi — your agent generates a link, you open it on your phone, done.",
  },
];

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="border-b border-[#b8ad9e]/10 cursor-pointer"
      onClick={() => setOpen(!open)}
    >
      <div className="flex items-center justify-between py-4 gap-4">
        <h3 className="font-mono text-[13px] text-[#e8e0d4]">{q}</h3>
        <span
          className="text-[#c4a862] text-lg shrink-0 transition-transform duration-200"
          style={{ transform: open ? "rotate(45deg)" : "rotate(0deg)" }}
        >
          +
        </span>
      </div>
      {open && (
        <p className="font-mono text-[12px] text-[#b8ad9e] pb-4 leading-relaxed">
          {a}
        </p>
      )}
    </div>
  );
}

export function FAQ() {
  return (
    <ScrollReveal
      className="relative w-full overflow-hidden px-6 md:px-12 pb-24"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-8 tracking-tight text-center">
          FAQ
        </h2>
        <div>
          {FAQS.map((faq) => (
            <FaqItem key={faq.q} q={faq.q} a={faq.a} />
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
