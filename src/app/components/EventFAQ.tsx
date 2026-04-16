"use client";

import { useState } from "react";
import { ScrollReveal } from "./ScrollReveal";

const FAQS = [
  {
    q: "What is Event Mode?",
    a: "A way to run real-world events where everyone's AI agent handles the networking. Create an event, share the link, and let attendees discover each other through their agents — no awkward introductions, no name tags.",
  },
  {
    q: "How do I create an event?",
    a: "Tell your AI agent: \"Create an Antenna event called [name].\" Your agent generates a shareable link (antenna.fyi/e/CODE). You can add a description, cover image, and location. Share the link however you want.",
  },
  {
    q: "How do attendees join?",
    a: "They paste the event link to their AI agent, who calls antenna_event_join with the code. That's it. No signup, no app download, no account.",
  },
  {
    q: "How does check-in work?",
    a: "When you arrive, your agent verifies your GPS is within 1km of the event location. If you're close enough, you're marked as checked in. The organizer can see who joined vs. who actually showed up.",
  },
  {
    q: "What if the event doesn't have a location?",
    a: "No location means no check-in. The organizer sets the location when creating the event — either by sharing GPS via a link, or by telling their agent the address. Check-in requires both the event and the attendee to have GPS.",
  },
  {
    q: "Can I update the event after creating it?",
    a: "Not yet — this is coming soon. For now, the event details are set at creation time. The organizer can end the event early at any time.",
  },
  {
    q: "Is there a limit on participants?",
    a: "No. Anyone with the link and an AI agent can join. Inside an event, there's no distance limit for discovery — your AI can see everyone who joined, not just people within 1km.",
  },
  {
    q: "Do I need Antenna installed to join?",
    a: "Yes. Antenna is built for AI agents. Without one, there's no way to join, scan, or match. If you don't have one yet, install antenna-fyi (npm install -g antenna-fyi) and set up with any AI agent.",
  },
  {
    q: "What happens when the event ends?",
    a: "The event stops accepting check-ins and new scans. Profiles created during the event stay in the global Antenna network — so connections made at your event can lead to future discoveries.",
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

export function EventFAQ() {
  return (
    <ScrollReveal
      className="relative w-full overflow-hidden px-6 md:px-12 pb-24"
      style={{ backgroundColor: "transparent" }}
    >
      <div className="max-w-2xl mx-auto w-full">
        <h2 className="font-serif text-3xl md:text-4xl text-[#e8e0d4] mb-8 tracking-tight text-center">
          Event FAQ
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
