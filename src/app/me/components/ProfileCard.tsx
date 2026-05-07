"use client";

import Image from "next/image";
import { EngravedPanel } from "@/app/components/EngravedPanel";
import { MapPin, RefreshCw, WandSparkles } from "lucide-react";
import type { ProfileDraft } from "@/lib/profile";
import type { ArchetypeMatch } from "@/lib/archetype";

const profileBackVideoSrc = "/profile-assets/ascii-profile-back.mp4";
const profileOrnamentSrc = "/profile-assets/wing-signal-ornament.png";

interface ProfileCardProps {
  profileDraft: ProfileDraft;
  archetypeMatch: ArchetypeMatch;
  isFlipped: boolean;
  onFlip: (flipped: boolean) => void;
  onEdit: () => void;
  showEditButton: boolean;
  t: {
    flipBack: string;
    flipFront: string;
    editProfile: string;
    defaultUser: string;
    mythArchetypeLabel: string;
    line: (index: number) => string;
  };
  statusPill: string;
  isActive: boolean;
}

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

export function ProfileCard({
  profileDraft,
  archetypeMatch,
  isFlipped,
  onFlip,
  onEdit,
  showEditButton,
  t,
  statusPill,
  isActive,
}: ProfileCardProps) {
  return (
    <div className="profile-card-scene self-start">
      <div className={`profile-card-flipper ${isFlipped ? "is-flipped" : ""}`}>
        {/* Front */}
        <EngravedPanel quiet className="profile-card-face profile-summary-card p-5">
          <div className="profile-card-ornament" aria-hidden="true">
            <Image
              src={profileOrnamentSrc}
              alt=""
              fill
              sizes="(max-width: 768px) 280px, 340px"
              className="object-contain"
            />
          </div>
          <div className="profile-card-chart-bg" aria-hidden="true" />
          <div className="profile-card-titlebar mb-4 flex items-center justify-between gap-2 border-b border-[#d7b866]/14 pb-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
              IDENTITY://PUBLIC
            </p>
            <div className="flex shrink-0 items-center justify-end gap-1.5">
              <button
                onClick={() => onFlip(true)}
                className="profile-card-action-button inline-flex items-center justify-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                aria-label={t.flipBack}
              >
                <RefreshCw size={14} className="shrink-0" />
                <span className="profile-card-action-label">{t.flipBack}</span>
              </button>
              {showEditButton && (
                <button
                  onClick={onEdit}
                  className="profile-card-action-button inline-flex items-center justify-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                  aria-label={t.editProfile}
                >
                  <WandSparkles size={14} className="shrink-0" />
                  <span className="profile-card-action-label">{t.editProfile}</span>
                </button>
              )}
            </div>
          </div>
          <div className="profile-card-identity mb-4 flex items-end justify-between gap-4">
            <div>
              <div className="profile-card-avatar text-4xl leading-none">
                {profileDraft.emoji || "✦"}
              </div>
              <h2 className="profile-card-name mythic-soft-title mt-3 font-serif text-3xl leading-tight">
                {profileDraft.displayName || t.defaultUser}
              </h2>
            </div>
            <span
              className={`profile-card-status mb-1 shrink-0 border bg-black/18 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                isActive
                  ? "border-emerald-300/35 text-emerald-100"
                  : "border-red-300/35 text-red-100"
              }`}
            >
              {statusPill}
            </span>
          </div>

          <div className="profile-card-lines space-y-2.5 border-y border-[#d7b866]/16 py-3">
            {[profileDraft.line1, profileDraft.line2, profileDraft.line3].map((line, index) => (
              <p key={index} className="profile-card-line font-mono text-[#A89888]">
                {line || t.line(index + 1)}
              </p>
            ))}
          </div>

          <div className="profile-card-meta mt-4 space-y-3">
            {profileDraft.city && (
              <p className="profile-card-location flex min-w-0 items-center gap-2 font-mono text-xs text-[#d8cab8]">
                <MapPin size={14} className="shrink-0" />
                <span className="truncate">{profileDraft.city}</span>
              </p>
            )}
            <div className="profile-card-tags flex flex-wrap gap-2">
              {profileDraft.interestTags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="profile-card-tag border border-[#d7b866]/20 bg-[#d7b866]/8 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8]"
                >
                  {tag}
                </span>
              ))}
              {profileDraft.interestTags.length > 3 && (
                <span className="profile-card-tag border border-[#d7b866]/14 bg-black/10 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8]/72">
                  +{profileDraft.interestTags.length - 3}
                </span>
              )}
            </div>
          </div>
        </EngravedPanel>

        {/* Back */}
        <EngravedPanel className="profile-card-face profile-card-back bg-black p-5">
          <video
            className="profile-card-video"
            src={profileBackVideoSrc}
            autoPlay
            loop
            muted
            playsInline
          />
          <div className="profile-card-back-gradient" aria-hidden="true" />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
              <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                MYTH://{archetypeMatch.primary}
              </p>
              <button
                onClick={() => onFlip(false)}
                className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/20 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
              >
                <RefreshCw size={14} />
                {t.flipFront}
              </button>
            </div>
            <div className="space-y-4 pt-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e2c46e]">
                  {t.mythArchetypeLabel}
                </p>
                <h3 className="mythic-soft-title mt-2 font-serif text-4xl leading-none">
                  {archetypeMatch.primary}
                </h3>
              </div>
              <div className="border-t border-[#d7b866]/18 pt-4">
                <p className="font-mono text-xs leading-relaxed text-[#FEF1E1]">
                  {archetypeMatch.reason}
                </p>
              </div>
            </div>
          </div>
        </EngravedPanel>
      </div>
    </div>
  );
}
