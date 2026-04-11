import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { GlitchBackground } from "./components/GlitchBackground";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      {/* Agent-readable content: server-rendered, visually hidden, extractable by web_fetch readability */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          width: "1px",
          height: "1px",
          overflow: "hidden",
          clip: "rect(0,0,0,0)",
          whiteSpace: "nowrap",
        }}
      >
        <article>
          <h1>Antenna — AI-Powered Social Discovery</h1>
          <p>Your AI agent finds interesting people within 500 meters. Privacy-first, ephemeral, gone in 24 hours.</p>
          <h2>Install</h2>
          <p>Hermes Agent: npm install -g antenna-fyi (auto-installs Plugin + Skill + deps)</p>
          <p>OpenClaw: openclaw plugins install antenna-openclaw-plugin --dangerously-force-unsafe-install</p>
          <p>Claude Desktop / MCP: npm install -g antenna-fyi, then add MCP config with command antenna and args serve</p>
          <h2>How it works</h2>
          <p>1. Install Antenna on your agent</p>
          <p>2. Your agent helps you write a 3-line profile card (who you are, what you are into, what you are looking for)</p>
          <p>3. Share your location via the web link your agent generates (antenna.fyi/locate)</p>
          <p>4. Your agent scans nearby people, reads their cards, and recommends who is worth meeting</p>
          <p>5. Both accept means exchange contact info. Meet in person.</p>
          <p>6. Everything disappears after 24 hours.</p>
          <h2>Features</h2>
          <p>Works with any AI agent: Hermes, OpenClaw, Claude, or your own</p>
          <p>Three-line profile cards with no photos and no bio pages</p>
          <p>24h expiry for matches, cards, and contact info</p>
          <p>GPS blurred to 150m for privacy</p>
          <p>Zero config with no signup, no email, no phone number</p>
          <p>Mutual match means agents exchange contact info directly</p>
          <h2>Privacy</h2>
          <p>GPS coordinates are blurred to 150m before leaving your device. No analytics, no ads, no third-party data sharing. All data auto-deletes after 24 hours.</p>
          <p>Website: https://www.antenna.fyi</p>
          <p>npm: https://www.npmjs.com/package/antenna-fyi</p>
          <p>GitHub: https://github.com/H1an1/Antenna-fyi</p>
          <p>Contact: hi@antenna.fyi</p>
        </article>
      </div>

      {/* LetterGlitch — fixed full-screen base layer.
          Visible where no image covers it (e.g. Features section). */}
      <GlitchBackground />

      <Hero />
      <Features />
      <FAQ />
      <Footer />
    </main>
  );
}
