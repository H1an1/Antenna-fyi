"use client";

import { ScrollReveal } from "./ScrollReveal";

const FAQS = [
  {
    q: "What is Event Mode?",
    a: "A way to run real-world events where everyone\u2019s AI agent handles the networking. Create an event, share the link, and let attendees discover each other through their agents.",
  },
  {
    q: "How do I create an event?",
    a: "Tell your AI agent: \u201cCreate an Antenna event called [name].\u201d Your agent generates a shareable link (antenna.fyi/e/CODE). Add a description, cover image, and location.",
  },
  {
    q: "How do attendees join?",
    a: "Paste the event link to their AI agent. One command. No signup, no app, no account.",
  },
  {
    q: "How does check-in work?",
    a: "Your agent verifies GPS within 1km of the venue. Close enough = checked in. The organizer sees joined vs. actually present.",
  },
  {
    q: "What if there\u2019s no location?",
    a: "No location means no check-in. The organizer sets GPS when creating the event. Check-in requires both the event and attendee to have GPS.",
  },
  {
    q: "Is there a participant limit?",
    a: "No. Anyone with the link and an AI agent can join. No distance limit for discovery inside events.",
  },
  {
    q: "Do I need Antenna to join?",
    a: "Yes. Antenna is for AI agents. Install with: npm install -g antenna-fyi",
  },
  {
    q: "What happens when it ends?",
    a: "No more check-ins or scans. But profiles stay in the global network \u2014 connections from your event lead to future discoveries.",
  },
];

export function EventFAQ() {
  return (
    <ScrollReveal
      className="relative w-full overflow-hidden px-5 md:px-12 pb-24"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-12 tracking-tight text-center">
          Questions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
          {FAQS.map((faq) => (
            <div key={faq.q}>
              <h3 className="font-mono text-[13px] text-[#c4a862] mb-2">
                {faq.q}
              </h3>
              <p className="font-mono text-[11px] text-[#b8ad9e]/70 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
