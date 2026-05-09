"use client";

import Image from "next/image";
import { EngravedPanel } from "@/app/components/EngravedPanel";
import { SocialLinkIcon } from "@/app/components/SocialLinkIcon";
import { MapPin, RefreshCw, WandSparkles } from "lucide-react";
import { normalizeLinks, type ProfileDraft } from "@/lib/profile";
import type { ArchetypeMatch } from "@/lib/archetype";
import { formatProfileUrl, getSocialLinkKind, socialLinkLabels } from "@/lib/social-links";

const profileBackVideoSrc = "/profile-assets/ascii-profile-back.mp4";
const profileOrnamentSrc = "/profile-assets/wing-signal-ornament.png";

const DEFAULT_LINE1 =
  "Builder, researcher, or curious operator. Interested in people working on ambitious things.";

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
    backPlaceholderTitle?: string;
    backPlaceholderBody?: string;
  };
  statusPill: string;
  isActive: boolean;
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
  const visibleLinks = normalizeLinks(profileDraft.links);

  const isProfileDefault =
    !profileDraft.line1 ||
    profileDraft.line1 === DEFAULT_LINE1 ||
    profileDraft.displayName === t.defaultUser;

  // Use archetype override from profile context if set, otherwise use computed match
  const displayArchetype = profileDraft.archetypeOverride
    ? { primary: profileDraft.archetypeOverride.name, reason: profileDraft.archetypeOverride.reason }
    : { primary: archetypeMatch.primary, reason: archetypeMatch.reason };

  return (
    <div className="profile-card-scene self-start">
      <div className={`profile-card-flipper ${isFlipped ? "is-flipped" : ""}`}>
        {/* Front */}
        <EngravedPanel quiet className="profile-card-face profile-summary-card p-5">
          <div className="profile-card-chart-bg" aria-hidden="true" />
          <div className="profile-card-front-content">
            <div className="profile-card-ornament" aria-hidden="true">
              <Image
                src={profileOrnamentSrc}
                alt=""
                fill
                sizes="(max-width: 768px) 260px, 306px"
                className="object-contain"
              />
            </div>
            <div className="profile-card-titlebar flex items-center justify-between gap-2 border-b border-[#d7b866]/14">
              <p className="profile-card-kicker font-mono uppercase text-[#e2c46e]">
                IDENTITY://PUBLIC
              </p>
              <div className="flex shrink-0 items-center justify-end gap-2">
                <button
                  onClick={() => onFlip(true)}
                  data-profile-flip-button="back"
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

            <div className="profile-card-identity flex items-end justify-between gap-4">
              <div className="min-w-0">
                <h2 className="profile-card-name mythic-soft-title font-serif">
                  {profileDraft.displayName || t.defaultUser}
                </h2>
              </div>
              <span
                className={`profile-card-status shrink-0 border bg-black/18 font-mono uppercase ${
                  isActive
                    ? "border-emerald-300/35 text-emerald-100"
                    : "border-red-300/35 text-red-100"
                }`}
              >
                {statusPill}
              </span>
            </div>

            <div className="profile-card-description-wrap">
              <p className="profile-card-description font-mono text-[#A89888]">
                {profileDraft.line1 || t.line(1)}
              </p>

              {profileDraft.interestTags.length > 0 && (
                <div className="profile-card-tags flex flex-wrap">
                  {profileDraft.interestTags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="profile-card-tag border border-[#d7b866]/20 bg-[#d7b866]/8 font-mono text-[#d8cab8]"
                    >
                      {tag}
                    </span>
                  ))}
                  {profileDraft.interestTags.length > 3 && (
                    <span className="profile-card-tag border border-[#d7b866]/14 bg-black/10 font-mono text-[#d8cab8]/72">
                      +{profileDraft.interestTags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>

            <div className="profile-card-rule" aria-hidden="true" />

            <div className="profile-card-details">
              <div className="profile-card-detail">
                <p className="profile-card-detail-label font-mono uppercase text-[#e2c46e]">
                  {t.line(2)}
                </p>
                <p className="profile-card-detail-copy font-mono text-[#A89888]">
                  {profileDraft.line2 || t.line(2)}
                </p>
              </div>
              <div className="profile-card-detail">
                <p className="profile-card-detail-label font-mono uppercase text-[#e2c46e]">
                  {t.line(3)}
                </p>
                <p className="profile-card-detail-copy font-mono text-[#A89888]">
                  {profileDraft.line3 || t.line(3)}
                </p>
              </div>
            </div>

            {(profileDraft.city || visibleLinks.length > 0) && (
              <div className="profile-card-footer mt-auto flex items-center justify-between gap-3 border-t border-[#d7b866]/16">
                {profileDraft.city ? (
                  <p className="profile-card-location flex min-w-0 items-center font-mono text-[#A89888]">
                    <MapPin size={14} className="shrink-0" />
                    <span className="truncate">{profileDraft.city}</span>
                  </p>
                ) : (
                  <span aria-hidden="true" />
                )}
                {visibleLinks.length > 0 && (
                  <div className="profile-card-links flex shrink-0 items-center">
                    {visibleLinks.map((link) => {
                      const kind = getSocialLinkKind(link);
                      return (
                        <a
                          key={link}
                          href={formatProfileUrl(link)}
                          target="_blank"
                          rel="noreferrer"
                          aria-label={socialLinkLabels[kind]}
                          className="transition-opacity hover:opacity-80"
                        >
                          <SocialLinkIcon link={link} size={24} />
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </EngravedPanel>

        {/* Back */}
        <EngravedPanel className="profile-card-face profile-card-back bg-black p-5">
          {isProfileDefault ? (
            <div className="profile-card-back-gradient" aria-hidden="true" />
          ) : (
            <>
              <video
                className="profile-card-video"
                src={profileBackVideoSrc}
                autoPlay
                loop
                muted
                playsInline
              />
              <div className="profile-card-back-gradient" aria-hidden="true" />
            </>
          )}
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div className="flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
              <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                {isProfileDefault ? "MYTH://PENDING" : `MYTH://${displayArchetype.primary}`}
              </p>
              <button
                onClick={() => onFlip(false)}
                data-profile-flip-button="front"
                className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/20 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
              >
                <RefreshCw size={14} />
                {t.flipFront}
              </button>
            </div>
            {isProfileDefault ? (
              <div className="flex flex-1 flex-col items-center justify-center space-y-4 py-8 text-center">
                <p className="mythic-soft-title font-serif text-2xl leading-tight">
                  {t.backPlaceholderTitle || "Your archetype awaits."}
                </p>
                <p className="max-w-[28ch] font-mono text-xs leading-relaxed text-[#A89888]">
                  {t.backPlaceholderBody || "Complete your profile and the system will assign your mythic archetype."}
                </p>
              </div>
            ) : (
              <div className="space-y-4 pt-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e2c46e]">
                    {t.mythArchetypeLabel}
                  </p>
                  <h3 className="mythic-soft-title mt-2 font-serif text-4xl leading-none">
                    {displayArchetype.primary}
                  </h3>
                </div>
                <div className="border-t border-[#d7b866]/18 pt-4">
                  <p className="font-mono text-xs leading-relaxed text-[#FEF1E1]">
                    {displayArchetype.reason}
                  </p>
                </div>
              </div>
            )}
          </div>
        </EngravedPanel>
      </div>
    </div>
  );
}
