import { Hero } from "./components/Hero";
import { Features } from "./components/Features";
import { FAQ } from "./components/FAQ";
import { Footer } from "./components/Footer";
import { GlitchBackground } from "./components/GlitchBackground";

export default function Home() {
  return (
    <main className="relative">
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
