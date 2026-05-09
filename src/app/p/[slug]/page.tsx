import { createClient } from "@supabase/supabase-js";
import { parseProfileContext } from "@/lib/profile";
import type { Metadata } from "next";
import { PublicPageClient } from "./PublicPageClient";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

type PublicProfile = {
  found?: boolean;
  emoji?: string;
  display_name?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  matching_context?: string;
};

async function getProfile(slug: string): Promise<PublicProfile | null> {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.rpc("get_profile_by_slug", { p_slug: slug });
    if (error) return null;
    return Array.isArray(data) ? data[0] || null : data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const profile = await getProfile(slug);
  const title = profile?.display_name
    ? `${profile.display_name} - Antenna Profile`
    : "Antenna Profile";

  return {
    title,
    description: profile?.line1 || "A public Antenna profile for agent-native introductions.",
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile || !profile.found) {
    return (
      <main className="antenna-console-shell relative flex min-h-screen flex-col overflow-hidden px-4 py-5 text-[#A89888] md:px-8 md:py-7">
        <div className="console-streaks" aria-hidden="true" />
        <PublicPageClient profile={null} notFound />
      </main>
    );
  }

  const context = parseProfileContext(profile.matching_context);

  const profileData = {
    emoji: profile.emoji || "✦",
    displayName: profile.display_name || "Anonymous",
    line1: profile.line1 || "",
    line2: profile.line2 || "",
    line3: profile.line3 || "",
    context: context.context || "",
    interestTags: context.interestTags || [],
    city: context.city || "",
    isActive: context.isActive !== false,
    links: context.links || [],
    archetypeOverride: context.archetypeOverride || null,
  };

  return (
    <main className="antenna-console-shell relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-5 text-[#A89888] md:px-8 md:py-7">
      <div className="console-streaks" aria-hidden="true" />
      <PublicPageClient profile={profileData} notFound={false} />
    </main>
  );
}
