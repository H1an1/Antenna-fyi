import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { ExternalLink } from "lucide-react";
import { parseProfileContext } from "@/lib/profile";
import type { Metadata } from "next";
import { PublicProfileCard } from "./PublicProfileCard";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const antennaLogoSrc = "/brand/antenna.svg";

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
        <div className="relative z-10 mx-auto w-full max-w-lg">
          <header className="mb-8 flex items-center justify-between">
            <div>
              <Link href="/" className="block w-fit" aria-label="Antenna">
                <Image
                  src={antennaLogoSrc}
                  alt="Antenna"
                  width={188}
                  height={60}
                  priority
                  className="antenna-brand-mark h-12 w-auto max-w-[220px]"
                />
              </Link>
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d8cab8]">
                Public identity card
              </p>
            </div>
          </header>

          <div className="text-center">
            <h1 className="mythic-soft-title font-serif text-3xl leading-tight">
              This profile is not published yet.
            </h1>
            <p className="mt-4 font-mono text-sm leading-relaxed text-[#d8cab8]">
              Save your profile from the dashboard, then refresh this page.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <Link
                href="/me"
                className="inline-flex items-center gap-2 border border-[#d7b866]/42 bg-[#d7b866]/10 px-4 py-2.5 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16"
              >
                Back to dashboard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/10 px-4 py-2.5 font-mono text-xs text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
              >
                Antenna home
              </Link>
            </div>
          </div>
        </div>
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
  };

  return (
    <main className="antenna-console-shell relative flex min-h-screen flex-col items-center overflow-hidden px-4 py-5 text-[#A89888] md:px-8 md:py-7">
      <div className="console-streaks" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="block w-fit" aria-label="Antenna">
              <Image
                src={antennaLogoSrc}
                alt="Antenna"
                width={188}
                height={60}
                priority
                className="antenna-brand-mark h-12 w-auto max-w-[220px]"
              />
            </Link>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#d8cab8]">
              Public identity card
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-[#d7b866]/28 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#d8cab8] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e]"
          >
            Get yours
            <ExternalLink size={13} />
          </Link>
        </header>

        <PublicProfileCard profile={profileData} />
      </div>
    </main>
  );
}
