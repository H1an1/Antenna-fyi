import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { Activity, ExternalLink, Link as LinkIcon, MapPin } from "lucide-react";
import { parseProfileContext } from "@/lib/profile";
import type { Metadata } from "next";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const panelClass =
  "signal-panel border border-[#d7b866]/28 bg-[#090907]/84 backdrop-blur-md shadow-[0_22px_90px_rgba(0,0,0,0.38)]";
const insetPanelClass =
  "border border-[#d7b866]/18 bg-[#0e0d0a]/72 shadow-[inset_0_1px_0_rgba(255,245,215,0.04)]";

type PublicProfile = {
  found?: boolean;
  emoji?: string;
  display_name?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  matching_context?: string;
};

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

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

function formatUrl(link: string) {
  if (link.startsWith("http://") || link.startsWith("https://")) return link;
  return `https://${link}`;
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
      <main className="antenna-console-shell relative min-h-screen overflow-hidden px-4 py-5 text-[#A89888] md:px-8 md:py-7">
        <div className="console-streaks" aria-hidden="true" />
        <div className="relative z-10 mx-auto max-w-4xl">
          <header className={`${panelClass} mb-5`}>
            <div className="p-4 md:p-5">
              <Link href="/" className="font-serif text-3xl text-[#A89888]">
                Antenna
              </Link>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#d8cab8]">
                Public identity card
              </p>
            </div>
          </header>

          <section className={`${panelClass} p-6 md:p-8`}>
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                IDENTITY://PENDING
              </p>
              <SignalStrip className="hidden sm:block" />
            </div>
            <h1 className="font-serif text-4xl leading-tight text-[#A89888] md:text-5xl">
              This profile is not published yet.
            </h1>
            <p className="mt-4 max-w-2xl font-mono text-sm leading-relaxed text-[#d8cab8]">
              This public profile link does not have a synced profile row yet. Save the profile
              from the dashboard, then refresh this page.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
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
          </section>
        </div>
      </main>
    );
  }

  const context = parseProfileContext(profile.matching_context);
  const tags = context.interestTags || [];
  const links = context.links || [];
  const isActive = context.isActive !== false;
  const showContextPublicly = context.showContextPublicly === true;
  const profileLines = [profile.line1, profile.line2, profile.line3].filter(Boolean);

  return (
    <main className="antenna-console-shell relative min-h-screen overflow-hidden px-4 py-5 text-[#A89888] md:px-8 md:py-7">
      <div className="console-streaks" aria-hidden="true" />
      <div className="relative z-10 mx-auto max-w-6xl">
        <header className={`${panelClass} mb-5`}>
          <div className="flex flex-col gap-5 p-4 md:flex-row md:items-center md:justify-between md:p-5">
            <div>
              <Link href="/" className="font-serif text-3xl text-[#A89888]">
                Antenna
              </Link>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#d8cab8]">
                Public identity card
              </p>
            </div>
            <Link
              href="/login"
              className="inline-flex w-fit items-center gap-2 border border-[#d7b866]/28 px-3 py-2 font-mono text-[11px] uppercase tracking-[0.12em] text-[#d8cab8] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e]"
            >
              Get your profile
              <ExternalLink size={13} />
            </Link>
          </div>
        </header>

        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
          <article className={`${panelClass} p-5 md:p-6`}>
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                IDENTITY://PUBLIC
              </p>
              <span
                className={`border bg-black/18 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                  isActive
                    ? "border-emerald-300/35 text-emerald-100"
                    : "border-red-300/35 text-red-100"
                }`}
              >
                {isActive ? "active" : "quiet"}
              </span>
            </div>

            <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <div className="text-5xl leading-none">{profile.emoji || "✦"}</div>
                <h1 className="mt-4 font-serif text-4xl leading-tight text-[#A89888] md:text-5xl">
                  {profile.display_name || "Anonymous"}
                </h1>
              </div>
              <SignalStrip className="hidden sm:block" />
            </div>

            <div className="space-y-3 border-y border-[#d7b866]/16 py-4">
              {profileLines.map((line, index) => (
                <p
                  key={index}
                  className={`font-mono text-sm leading-relaxed ${
                    index === 0 ? "text-[#A89888]" : "text-[#d8cab8]"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>

            {((showContextPublicly && context.context) || tags.length > 0) && (
              <div className="mt-5 space-y-5">
                {showContextPublicly && context.context && (
                  <p className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-[#A89888]">
                    {context.context}
                  </p>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="border border-[#d7b866]/20 bg-[#d7b866]/8 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8]"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </article>

          <aside className="space-y-5">
            <section className={`${panelClass} p-5`}>
              <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
                  SIGNAL DETAILS
                </p>
                <SignalStrip className="w-12" />
              </div>

              <div className="space-y-3">
                {context.city && (
                  <p className={`${insetPanelClass} flex items-center gap-2 px-3 py-2 font-mono text-xs text-[#d8cab8]`}>
                    <MapPin size={14} />
                    {context.city}
                  </p>
                )}
                {context.lastGps && (
                  <p className={`${insetPanelClass} flex items-center gap-2 px-3 py-2 font-mono text-xs text-[#d8cab8]`}>
                    <Activity size={14} />
                    Recently updated
                  </p>
                )}
                {!context.city && !context.lastGps && (
                  <p className="font-mono text-xs leading-relaxed text-[#d8cab8]">
                    No location signal shared yet.
                  </p>
                )}
              </div>
            </section>

            {links.length > 0 && (
              <section className={`${panelClass} p-5`}>
                <div className="mb-4 flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
                    LINKS
                  </p>
                  <SignalStrip className="w-12" />
                </div>
                <div className="space-y-2">
                  {links.map((link) => (
                    <a
                      key={link}
                      href={formatUrl(link)}
                      target="_blank"
                      rel="noreferrer"
                      className={`${insetPanelClass} flex items-center justify-between gap-3 px-3 py-2 font-mono text-xs text-[#d8cab8] transition-colors hover:border-[#d7b866]/40 hover:text-[#e2c46e]`}
                    >
                      <span className="min-w-0 truncate">{link}</span>
                      <ExternalLink size={13} />
                    </a>
                  ))}
                </div>
              </section>
            )}

            <section className={`${panelClass} p-5`}>
              <div className="mb-3 flex items-center gap-2 text-[#d8cab8]">
                <LinkIcon size={15} />
                <h2 className="font-mono text-[10px] uppercase tracking-[0.16em]">
                  Photos unlock after match
                </h2>
              </div>
              <p className="font-mono text-xs leading-relaxed text-[#d8cab8]">
                Photos are exchanged only after both people choose to match.
              </p>
            </section>
          </aside>
        </section>
      </div>
    </main>
  );
}
