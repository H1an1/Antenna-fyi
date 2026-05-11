"use client";

import Image from "next/image";
import Link from "next/link";
import { ExternalLink, KeyRound } from "lucide-react";
import { useEffect, useState } from "react";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import type { ArchetypeMatch } from "@/lib/archetype";
import type { ProfileDraft } from "@/lib/profile";

import { ProfileCard } from "../../me/components/ProfileCard";
import { TodaySection } from "../../me/components/TodaySection";

const antennaLogoSrc = "/brand/antenna.svg";
const mythicFigureSrc = "/profile-assets/ascii-angel-dashboard-crop-tone-transparent.png";

const profileDraft: ProfileDraft = {
  displayName: "Antenna",
  personalDescription:
    "Agent-native signal for rooms, events, and chance encounters. Antenna helps agents understand who should meet before the moment passes.",
  lookingFor: "Builders, researchers, operators, and people working on ambitious things.",
  ourConversation: "Sharp, warm, concrete conversations that become real-world introductions.",
  context:
    "Antenna gives every person an agent-readable identity card, then lets agents scan nearby profiles, event context, and user intent to surface high-signal introductions.",
  showContextPublicly: false,
  interestTags: ["AI agents", "events", "networking", "context", "signal"],
  city: "Live rooms",
  isActive: true,
  links: ["https://antenna.fyi", "", ""],
  profileSlug: "antenna",
  deviceId: "promo:antenna",
  lastGps: null,
};

const promoArchetypeMatch: ArchetypeMatch = {
  primary: "Hermes",
  secondary: null,
  reason: "A connector who turns curiosity into real-world introductions - Hermes carries the signal.",
  reasonZh: "把好奇心变成真实连接的人——赫尔墨斯传递信号。",
};

const t = {
  apiSettings: "API settings",
  publicProfile: "Public profile",
  signOut: "Sign out",
  activeLower: "active",
  todayTitle: "Today",
  todayReadyTitle: "Nothing needs action right now.",
  todayReadyBody: "Matches, event tasks, and agent recommendations will appear here as rows.",
  agentStatus: "AGENT STATUS",
  layer0Connected: "Agent connected",
  layer0NeedsSetup: "Agent not connected",
  pendingMatches: "pending matches",
  eventTodos: "event todos",
  agentConnection: "Agent connection",
  firstTimeTitle: "Connect your agent first.",
  firstTimeBody: "Antenna only becomes useful after your agent has an API key.",
  getYourKey: "Get your key",
  identityTitle: "Identity card",
  profileIncompleteTitle: "Complete your identity card.",
  profileIncompleteBody: "Your agent needs a sharper profile before it can recommend you well.",
  completeProfile: "Complete profile",
  updateGps: "Update GPS",
  editProfile: "Edit",
  flipBack: "Back",
  flipFront: "Front",
  defaultUser: "Antenna user",
  mythArchetypeLabel: "Assigned archetype",
  line: (index: number) =>
    [
      "Personal description",
      "Looking for",
      "Our conversation",
    ][index - 1] || `Line ${index}`,
  matchesHeader: "Matches",
  eventsHeader: "Events",
  viewAll: "View all",
  noPendingMatches: "No pending matches",
  noPendingMatchesReason: "When your agent finds someone worth accepting, the reason and action will live here.",
  noEventTasks: "No event tasks",
  noEventTasksReason: "Check-ins, approvals, and event reminders will show up as action rows.",
};

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

function installPromoControls() {
  const style = document.createElement("style");
  style.textContent = "nextjs-portal{display:none!important}";
  document.head.appendChild(style);

  const flipProfile = () => {
    document.querySelector<HTMLButtonElement>('[data-profile-flip-button="back"]')?.click();
  };
  const resetProfile = () => {
    document.querySelector<HTMLButtonElement>('[data-profile-flip-button="front"]')?.click();
  };

  const win = window as Window & {
    __ANTENNA_PROMO_DASHBOARD__?: {
      flipProfile: () => void;
      resetProfile: () => void;
    };
  };
  win.__ANTENNA_PROMO_DASHBOARD__ = { flipProfile, resetProfile };

  const onMessage = (event: MessageEvent) => {
    if (event.data?.type === "antenna-promo:flip-profile") flipProfile();
    if (event.data?.type === "antenna-promo:reset-profile") resetProfile();
  };

  window.addEventListener("message", onMessage);

  return () => {
    window.removeEventListener("message", onMessage);
    style.remove();
    delete win.__ANTENNA_PROMO_DASHBOARD__;
  };
}

export default function AntennaPromoDashboardPage() {
  const [profileCardFlipped, setProfileCardFlipped] = useState(false);

  useEffect(() => installPromoControls(), []);

  return (
    <main
      data-promo-dashboard-root
      className="antenna-console-shell antenna-promo-dashboard relative min-h-screen overflow-hidden px-4 py-6 text-[#A89888] md:px-8 md:py-9"
    >
      <div className="console-streaks" aria-hidden="true" />
      <div className="dashboard-canvas">
        <div
          className="dashboard-figure-mobile"
          style={{ backgroundImage: `url(${mythicFigureSrc})` }}
          aria-hidden="true"
        />
        <header className="mb-6">
          <div className="flex flex-col gap-5 px-1 py-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
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
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-[#ded2c1]">
                Personal agent control console
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
              <div className="inline-flex border border-[#d7b866]/22 bg-black/18 font-mono text-xs">
                <button className="bg-[#d7b866]/14 px-3 py-2 text-[#e2c46e]">EN</button>
                <button className="px-3 py-2 text-[#d8cab8]">中文</button>
              </div>
              <button className="inline-flex items-center gap-2 border border-[#d7b866]/42 bg-[#d7b866]/10 px-3 py-2 font-mono text-xs text-[#e2c46e]">
                <KeyRound size={14} />
                {t.apiSettings}
                <span className="border-l border-[#d7b866]/28 pl-2">1</span>
              </button>
              <Link
                href="/p/antenna"
                className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-xs text-[#A89888]"
              >
                <ExternalLink size={14} />
                {t.publicProfile}
              </Link>
              <button className="border border-[#d7b866]/20 bg-black/10 px-3 py-2 font-mono text-xs text-[#d8cab8]">
                {t.signOut}
              </button>
            </div>
          </div>
        </header>

        <div className="dashboard-workbench grid gap-6">
          <div className="dashboard-workbench-spacer" aria-hidden="true" />
          <div className="dashboard-panel-column mx-auto w-full max-w-[848px] space-y-6 lg:mx-0 lg:max-w-none">
            <TodaySection
              hasKey
              agentConnected
              isProfileComplete
              gpsState="idle"
              gpsActionLabel={t.updateGps}
              matchCount={0}
              eventTodoCount={0}
              onGenerateKey={() => undefined}
              onCompleteProfile={() => undefined}
              onUpdateGps={() => undefined}
              t={t}
            />

            <section>
              <div className="profile-dashboard-grid">
                <ProfileCard
                  profileDraft={profileDraft}
                  archetypeMatch={promoArchetypeMatch}
                  isFlipped={profileCardFlipped}
                  onFlip={(flipped) => setProfileCardFlipped(flipped)}
                  onEdit={() => setProfileCardFlipped(false)}
                  showEditButton
                  t={t}
                  statusPill={t.activeLower}
                  isActive={profileDraft.isActive}
                  language="en"
                />

                <div className="dashboard-side-stack flex h-full min-h-0 flex-col gap-4">
                  <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
                    <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                      <div className="flex items-center gap-3">
                        <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                          {t.matchesHeader}
                        </p>
                        <SignalStrip />
                      </div>
                      <button className="font-mono text-xs text-[#d8cab8]">{t.viewAll}</button>
                    </div>
                    <div className="dashboard-side-body pt-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="dashboard-side-empty-title mythic-soft-title font-serif text-xl leading-tight">
                            {t.noPendingMatches}
                          </p>
                          <SignalStrip className="hidden sm:flex" />
                        </div>
                        <p className="dashboard-side-empty-copy mt-2 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                          {t.noPendingMatchesReason}
                        </p>
                      </div>
                    </div>
                  </EngravedPanel>

                  <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
                    <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                      <div className="flex items-center gap-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                          {t.eventsHeader}
                        </p>
                        <SignalStrip />
                      </div>
                      <button className="font-mono text-xs text-[#d8cab8]">{t.viewAll}</button>
                    </div>
                    <div className="dashboard-side-body pt-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-3">
                          <p className="dashboard-side-empty-title mythic-soft-title font-serif text-xl leading-tight">
                            {t.noEventTasks}
                          </p>
                          <SignalStrip className="hidden sm:flex" />
                        </div>
                        <p className="dashboard-side-empty-copy mt-2 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                          {t.noEventTasksReason}
                        </p>
                      </div>
                    </div>
                  </EngravedPanel>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
