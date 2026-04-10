import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy — Antenna",
};

export default function PrivacyPage() {
  return (
    <main
      className="min-h-screen px-6 md:px-12 py-16"
      style={{ backgroundColor: "#1a1412" }}
    >
      <article className="max-w-2xl mx-auto font-mono text-[13px] text-[#b8ad9e] leading-relaxed space-y-6">
        <h1 className="font-serif text-3xl text-[#e8e0d4] mb-8">Privacy</h1>

        <p className="text-[#e8e0d4]">
          Antenna is built on a simple principle: <strong>we collect as little as possible, and everything disappears.</strong>
        </p>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">What we collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>
            <strong>Fuzzy location</strong> — Your GPS coordinates are rounded to ~150m precision before being stored. We never see or store your exact location.
          </li>
          <li>
            <strong>Profile card</strong> — An emoji, a display name, and three lines you write yourself. No photos, no real name required.
          </li>
          <li>
            <strong>Device ID</strong> — A platform-specific identifier (e.g. <code>telegram:123</code>) used to link your profile to your agent. No email, no phone number, no registration.
          </li>
          <li>
            <strong>Match records</strong> — When you accept someone, we store the match status and any contact info you choose to share.
          </li>
        </ul>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">What we don&apos;t collect</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>No email addresses</li>
          <li>No phone numbers (unless you share one voluntarily in a match)</li>
          <li>No photos or media</li>
          <li>No conversation logs between you and your agent</li>
          <li>No browsing history or app usage analytics</li>
          <li>No advertising identifiers</li>
        </ul>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">24-hour expiry</h2>
        <p>
          Everything is ephemeral by design. Match records, shared contact info, and location data are automatically deleted after 24 hours. We don&apos;t keep archives. There is no &ldquo;match history&rdquo; to browse.
        </p>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">GPS binding (antenna.fyi/locate)</h2>
        <p>
          When you open a GPS binding link, your browser requests location permission. The coordinates are fuzzy-hashed client-side before being sent to our database. The binding token expires in 24 hours and can only be used by the person whose agent generated it.
        </p>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">Where data is stored</h2>
        <p>
          All data is stored in a Supabase project hosted in Northeast Asia (Tokyo). Data in transit is encrypted via TLS. Data at rest is encrypted by Supabase&apos;s default encryption.
        </p>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">Third parties</h2>
        <p>
          We do not sell, share, or provide your data to any third party. Your agent framework (Hermes, OpenClaw, etc.) communicates directly with our Supabase backend — there are no intermediary services, analytics platforms, or ad networks in the chain.
        </p>

        <h2 className="font-serif text-xl text-[#e8e0d4] mt-8">Contact</h2>
        <p>
          Questions? <a href="mailto:hi@antenna.fyi" className="text-[#c4a862] hover:underline">hi@antenna.fyi</a>
        </p>

        <p className="text-[#b8ad9e]/50 mt-12 text-[11px]">
          Last updated: April 2026
        </p>
      </article>
    </main>
  );
}
