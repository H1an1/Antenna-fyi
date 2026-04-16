import { EventsHero } from "../components/EventsHero";
import { EventFeatures } from "../components/EventFeatures";
import { EventFAQ } from "../components/EventFAQ";
import { Footer } from "../components/Footer";
import { GlitchBackground } from "../components/GlitchBackground";

export default function Events() {
  return (
    <main className="relative overflow-x-hidden">
      <noscript>
        <article>
          <h1>Antenna Events — AI-Powered Event Networking</h1>
          <p>Create events where everyone&apos;s AI agent handles the networking. GPS check-in, no distance limits, real connections.</p>
          <p>Install: npm install -g antenna-fyi</p>
        </article>
      </noscript>

      <GlitchBackground />
      <EventsHero />
      <EventFeatures />
      <EventFAQ />
      <Footer />
    </main>
  );
}
