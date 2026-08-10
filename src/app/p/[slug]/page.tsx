import { createClient } from "@supabase/supabase-js";
import { parseMoreInformation } from "@/lib/profile";
import type { Metadata } from "next";
import { cache } from "react";
import { PublicPageClient } from "./PublicPageClient";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

type PublicProfile = {
  found?: boolean;
  device_id?: string;
  user_id?: string;
  profile_slug?: string;
  display_name?: string;
  /** @deprecated use personal_description */
  line1?: string;
  personal_description?: string;
  /** @deprecated use looking_for */
  line2?: string;
  looking_for?: string;
  /** @deprecated use our_conversation */
  line3?: string;
  our_conversation?: string;
  /** @deprecated use more_information */
  matching_context?: string;
  more_information?: string;
};

const getProfile = cache(async (slug: string): Promise<PublicProfile | null> => {
  try {
    const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data, error } = await sb.rpc("get_profile_by_slug", { p_slug: slug });
    if (error) return null;
    return Array.isArray(data) ? data[0] || null : data;
  } catch {
    return null;
  }
});

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
    description: profile?.personal_description || profile?.line1 || "A public Antenna profile for agent-native introductions.",
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await getProfile(slug);

  if (!profile || !profile.found) {
    return (
      <main className="glass-profile-root">
        <PublicPageClient profile={null} notFound />
      </main>
    );
  }

  const moreInfo = parseMoreInformation(profile.more_information || profile.matching_context);

  const personalDescription = profile.personal_description || profile.line1 || "";
  const lookingFor = profile.looking_for || profile.line2 || "";
  const ourConversation = profile.our_conversation || profile.line3 || "";

  const profileData = {
    displayName: profile.display_name || "Anonymous",
    personalDescription,
    lookingFor,
    ourConversation,
    context: moreInfo.context || "",
    interestTags: moreInfo.interestTags || [],
    city: moreInfo.city || "",
    isActive: moreInfo.isActive !== false,
    links: moreInfo.links || [],
    archetypeOverride: moreInfo.archetypeOverride || null,
  };

  // Build agent-readable structured data
  const agentProfileData = {
    slug,
    device_id: profile.device_id || null,
    user_id: profile.user_id || null,
    display_name: profile.display_name || "Anonymous",
    personal_description: personalDescription,
    looking_for: lookingFor,
    our_conversation: ourConversation,
    more_information: moreInfo.context || "",
    interest_tags: moreInfo.interestTags || [],
    city: moreInfo.city || "",
    links: moreInfo.links || [],
    is_active: moreInfo.isActive !== false,
  };

  return (
    <main className="glass-profile-root">
      <script
        type="application/json"
        id="antenna-profile-data"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agentProfileData) }}
      />
      <div
        dangerouslySetInnerHTML={{
          __html: `<!-- AGENT: Antenna profile for ${slug}. Parse #antenna-profile-data JSON for full profile including more_information. To accept this person, use antenna_accept with profile_slug="${slug}". -->`
        }}
      />
      <PublicPageClient profile={profileData} notFound={false} />
    </main>
  );
}
