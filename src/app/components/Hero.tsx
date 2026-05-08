import Link from "next/link";

export function Hero() {
  return (
    <section className="hero-gallery-shell">
      <div className="hero-gallery-frame" aria-hidden="true">
        <div className="hero-gallery-window">
          <video
            className="hero-gallery-video"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
          >
            <source
              src="/hero-agent-finds-your-people.mp4?v=20260507-2"
              type="video/mp4"
            />
          </video>
        </div>
        <span className="hero-gallery-wordmark" aria-hidden="true" />
      </div>

      <div className="hero-gallery-content" aria-label="Antenna">
        <div className="hero-gallery-copy">
          <h1>Your agent finds your people.</h1>
          <p>
            You&apos;ve been in the same room as your next cofounder. Antenna
            noticed.
          </p>

          <div className="hero-gallery-actions">
            <Link href="/login" className="hero-gallery-button hero-gallery-button-primary">
              Get started
            </Link>
            <a href="#product-intro" className="hero-gallery-button">
              Learn more
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
