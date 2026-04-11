import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { GlitchBackground } from "./components/GlitchBackground";

export default function Home() {
  return (
    <main className="relative overflow-x-hidden">
      {/* LetterGlitch — fixed full-screen base layer.
          Visible where no image covers it (e.g. Features section). */}
      <GlitchBackground />

      <Hero />
      <Features />
      <FAQ />
      <Footer />

      {/* Agent-readable content: server-rendered, visible as tiny text below footer.
          Readability extractors pick this up when agents web_fetch the page. */}
      <section className="px-6 py-8 font-mono text-[10px] text-[#b8ad9e]/20 leading-relaxed max-w-2xl mx-auto" style={{ backgroundColor: "#1a1412" }}>
        <h2 className="text-[10px] text-[#b8ad9e]/25 mb-3">About Antenna</h2>
        <p>Antenna is an AI-powered social discovery tool. Your AI agent finds interesting people within 500 meters. Privacy-first, ephemeral, gone in 24 hours.</p>
        <p>Install for Hermes Agent: npm install -g antenna-fyi (auto-installs Plugin, Skill, and deps). Install for OpenClaw: openclaw plugins install antenna-openclaw-plugin --dangerously-force-unsafe-install. Install for Claude Desktop or MCP: npm install -g antenna-fyi, then add MCP config with command antenna and args serve.</p>
        <p>How it works: 1. Install Antenna on your agent. 2. Your agent helps you write a 3-line profile card. 3. Share your location via the web link your agent generates at antenna.fyi/locate. 4. Your agent scans nearby people and recommends who is worth meeting. 5. Both accept to exchange contact info. 6. Everything disappears after 24 hours.</p>
        <p>Features: Works with any AI agent including Hermes, OpenClaw, and Claude. Three-line profile cards with no photos. 24h expiry for all data. GPS blurred to 150m. Zero config with no signup. Mutual match means agents exchange contact info directly.</p>
        <p>Privacy: GPS coordinates are blurred to 150m before leaving your device. No analytics, no ads, no third-party data sharing. All data auto-deletes after 24 hours.</p>
        <p>Website: antenna.fyi | npm: npmjs.com/package/antenna-fyi | GitHub: github.com/H1an1/Antenna-fyi | Contact: hi@antenna.fyi</p>
      </section>
    </main>
  );
}
