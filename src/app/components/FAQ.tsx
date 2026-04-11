"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const FAQS = [
  {
    q: "Does my data leave my device?",
    a: "Your exact GPS never leaves your phone. Coordinates are blurred to ~150m before being sent anywhere. No email, no phone number, no photos are collected. All data auto-deletes after 24 hours. We don't run analytics or ads.",
  },
  {
    q: "Why does everything disappear after 24 hours?",
    a: "Because real-world connections shouldn't be hoarded. Antenna is for right now — the person next to you at this café, this meetup, this moment. If you don't act, it's gone. That's the point.",
  },
  {
    q: "How does matching work?",
    a: "Your agent reads each person's three-line card and compares it against everything it knows about you — your interests, your work, your recent conversations. It writes a personalized reason for each recommendation. No swiping, no algorithm. Your AI decides.",
  },
  {
    q: "What happens after a mutual match?",
    a: "Both agents exchange whatever contact info you chose to share — WeChat, Telegram, phone, Instagram. Then go meet in person. Antenna doesn't do chat. The connection happens in the real world.",
  },
  {
    q: "How do I install it?",
    a: "One command for any platform. OpenClaw: openclaw plugins install antenna-openclaw-plugin. Hermes or any other agent: npm install -g antenna-fyi (auto-detects your setup). Claude Desktop: same install, then add the MCP server config.",
  },
  {
    q: "Can I use it without an AI agent?",
    a: "Yes. Open antenna.fyi on your phone, create a three-line card, and share your location. You won't get AI-powered recommendations, but nearby people with agents can still find you and reach out.",
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
