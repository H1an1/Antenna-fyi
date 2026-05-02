import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import Link from "next/link";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

async function getProfile(slug: string) {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.rpc("get_profile_by_slug", { p_slug: slug });
    if (error) return null;
    return data;
  } catch {
    return null;
  }
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile || !profile.found) {
    notFound();
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-md w-full p-8"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.15)",
        }}
      >
        {/* Profile card */}
        <div className="text-center mb-6">
          <span className="text-4xl">{profile.emoji || "👤"}</span>
          <h1 className="font-serif text-xl text-[#e8e0d4] mt-3">
            {profile.display_name || "Anonymous"}
          </h1>
        </div>

        <div className="space-y-3">
          {profile.line1 && (
            <p className="font-mono text-sm text-[#e8e0d4]">{profile.line1}</p>
          )}
          {profile.line2 && (
            <p className="font-mono text-sm text-[#b8ad9e]">{profile.line2}</p>
          )}
          {profile.line3 && (
            <p className="font-mono text-sm text-[#b8ad9e]/80">{profile.line3}</p>
          )}
        </div>

        {/* CTA */}
        <div
          className="mt-8 pt-6 text-center"
          style={{ borderTop: "1px solid rgba(184, 173, 158, 0.1)" }}
        >
          <p className="font-mono text-xs text-[#b8ad9e]/60 mb-3">
            Want to connect? Get Antenna for your AI agent.
          </p>
          <Link
            href="/"
            className="font-mono text-xs px-4 py-2 inline-block transition-colors"
            style={{
              border: "1px solid rgba(196, 168, 98, 0.3)",
              color: "#c4a862",
              backgroundColor: "rgba(196, 168, 98, 0.06)",
            }}
          >
            Get Antenna →
          </Link>
        </div>
      </div>
    </main>
  );
}
