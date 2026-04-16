import { EventsHero } from "../components/EventsHero";
import { Features } from "../components/Features";
import { FAQ } from "../components/FAQ";
import { Footer } from "../components/Footer";
import { GlitchBackground } from "../components/GlitchBackground";

export default function Events() {
  return (
    <main className="relative overflow-x-hidden">
      <noscript>
        <article>
          <h1>Antenna — AI-Powered Social Discovery</h1>
          <p>Your AI agent finds interesting people within 1 kilometer. Privacy-first, ephemeral, gone in 24 hours.</p>
          <p>Install: npm install -g antenna-fyi | OpenClaw: openclaw plugins install antenna-openclaw-plugin --dangerously-force-unsafe-install</p>
          <p>Full instructions for agents: https://www.antenna.fyi/llms.txt</p>
        </article>
      </noscript>

      <GlitchBackground />
      <EventsHero />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
