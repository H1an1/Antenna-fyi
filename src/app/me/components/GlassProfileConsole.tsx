"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { SocialLinkIcon } from "@/app/components/SocialLinkIcon";
import { formatProfileUrl, getSocialLinkKind, socialLinkLabels } from "@/lib/social-links";
import { normalizeLinks, type ProfileDraft } from "@/lib/profile";
import type { ArchetypeMatch } from "@/lib/archetype";

type Language = "en" | "zh";
type PanelId = "today" | "identity" | "matches" | "rooms";

const profileConsoleIcons = {
  apiSettings: "/redesign/figma/profile-icon-api-settings.svg",
  publicProfile: "/redesign/figma/profile-icon-public-profile.svg",
  signOut: "/redesign/figma/profile-icon-sign-out.svg",
  refresh: "/redesign/figma/profile-icon-refresh.svg",
  edit: "/redesign/figma/profile-icon-edit.svg",
  location: "/redesign/figma/profile-icon-location.svg",
} as const;

const profileConsoleBackground = "/redesign/figma/profile-console-bg.webp";

const consoleCopy = {
  en: {
    today: "Today",
    agentConnected: "Agent connected",
    nothingNeedsAction: "Nothing needs action right now.",
    completeProfile: "Complete your identity card.",
    todayDetail: "Matches, event tasks, and agent recommendations will appear here as rows.",
    incompleteDetail: "Your agent needs a sharper profile before it can recommend you well.",
    identity: "Identity",
    matches: "Matches",
    rooms: "Rooms",
    noPendingMatches: "No pending matches.",
    noPendingMatchesReason:
      "When your agent finds someone worth accepting, the reason and action will live here.",
    noRoomJoined: "No room joined.",
    noRoomJoinedReason: "Check-ins, approvals, and room reminders will show up as action rows.",
    lookingFor: "Looking for",
    conversation: "Our conversation",
    back: "Back",
    front: "Profile",
    viewAll: "View all",
    fallbackName: "Antenna user",
    fallbackSummary:
      "Tell your agent who you are, what you are looking for, and how you want to connect.",
    fallbackLookingFor: "People who make the room more real.",
    fallbackConversation: "A conversation worth remembering.",
    mythLabel: "Assigned archetype",
    mythPending: "Your archetype awaits.",
    mythPendingBody: "Complete your profile and the system will assign your mythic archetype.",
    active: "Active",
    quiet: "Quiet",
    getYours: "Get yours",
  },
  zh: {
    today: "今天",
    agentConnected: "智能体已连接",
    nothingNeedsAction: "现在没有需要处理的事。",
    completeProfile: "完善你的身份卡。",
    todayDetail: "匹配、活动任务和智能体建议会以列表形式出现在这里。",
    incompleteDetail: "Profile 更清楚，agent 才能更准确地推荐你。",
    identity: "身份",
    matches: "匹配",
    rooms: "房间",
    noPendingMatches: "暂无待处理匹配。",
    noPendingMatchesReason: "当你的 agent 发现值得接受的人，推荐理由和操作会出现在这里。",
    noRoomJoined: "尚未加入房间。",
    noRoomJoinedReason: "签到、审批和房间提醒会以行动列表的形式出现。",
    lookingFor: "正在寻找",
    conversation: "我们的对话",
    back: "返回",
    front: "Profile",
    viewAll: "查看全部",
    fallbackName: "Antenna 用户",
    fallbackSummary: "告诉你的 agent 你是谁、想认识什么人、想要怎样连接。",
    fallbackLookingFor: "让场域更真实的人。",
    fallbackConversation: "值得记住的一次对话。",
    mythLabel: "分配的神话原型",
    mythPending: "你的原型正在等待。",
    mythPendingBody: "填完个人信息后，系统会根据你的 profile 分配专属形象。",
    active: "在线",
    quiet: "安静",
    getYours: "创建你的",
  },
} as const;

interface GlassProfileConsoleProps {
  profileDraft: ProfileDraft;
  archetypeMatch: ArchetypeMatch;
  language: Language;
  onLanguageChange: (language: Language) => void;
  isProfileComplete: boolean;
  isActive: boolean;
  activeKeysCount?: number;
  publicHref?: string | null;
  onApiSettings?: () => void;
  onSignOut?: () => void;
  onEdit?: () => void;
  onUpdateGps?: () => void;
  gpsActionLabel?: string;
  editor?: ReactNode;
  editorOpen?: boolean;
  profileNotice?: string | null;
  error?: string | null;
  mode?: "private" | "public";
}

export function GlassProfileConsole({
  profileDraft,
  archetypeMatch,
  language,
  onLanguageChange,
  isProfileComplete,
  isActive,
  activeKeysCount = 0,
  publicHref,
  onApiSettings,
  onSignOut,
  onEdit,
  onUpdateGps,
  gpsActionLabel,
  editor,
  editorOpen = false,
  profileNotice,
  error,
  mode = "private",
}: GlassProfileConsoleProps) {
  const [selectedPanel, setSelectedPanel] = useState<PanelId>("today");
  const [identityBackVisible, setIdentityBackVisible] = useState(false);
  const copy = consoleCopy[language];

  const visibleLinks = useMemo(() => normalizeLinks(profileDraft.links), [profileDraft.links]);
  const displayArchetype = profileDraft.archetypeOverride
    ? {
        primary: profileDraft.archetypeOverride.name,
        reason:
          language === "zh"
            ? profileDraft.archetypeOverride.reasonZh || profileDraft.archetypeOverride.reason
            : profileDraft.archetypeOverride.reason,
      }
    : { primary: archetypeMatch.primary, reason: language === "zh" ? archetypeMatch.reasonZh || archetypeMatch.reason : archetypeMatch.reason };
  const displayName = profileDraft.displayName.trim() || copy.fallbackName;
  const statusLabel = isActive ? copy.active : copy.quiet;
  const tags = profileDraft.interestTags.slice(0, 3);
  const extraTagCount = Math.max(0, profileDraft.interestTags.length - tags.length);
  const summary = profileDraft.personalDescription.trim() || copy.fallbackSummary;
  const lookingFor = profileDraft.lookingFor.trim() || copy.fallbackLookingFor;
  const conversation = profileDraft.ourConversation.trim() || copy.fallbackConversation;
  const location = profileDraft.city.trim();

  return (
    <div className="glass-profile-page" data-glass-profile-page data-profile-mode={mode}>
      <section className="glass-profile-shell" data-profile-console data-console-language={language}>
        <Image
          alt=""
          className="glass-profile-background"
          height={810}
          priority={mode === "private"}
          src={profileConsoleBackground}
          width={1236}
        />

        <div className="glass-profile-brand">
          <span className="glass-profile-logo" aria-hidden="true">
            <img alt="" src="/redesign/figma/hero-logo-mark.svg" />
            <img alt="" src="/redesign/figma/hero-logo-wordmark.svg" />
          </span>
          <span>PERSONAL AGENT CONTROL CONSOLE</span>
        </div>

        <nav className="glass-profile-nav" aria-label="Profile controls">
          <span className="glass-profile-language" aria-label="Language switch">
            {(["en", "zh"] as const).map((option) => (
              <button
                key={option}
                type="button"
                className="glass-profile-language-option"
                data-active={language === option}
                aria-pressed={language === option}
                onClick={() => onLanguageChange(option)}
              >
                {option === "en" ? "EN" : "中文"}
              </button>
            ))}
          </span>

          {mode === "private" ? (
            <>
              <GlassConsoleButton icon={profileConsoleIcons.apiSettings} onClick={onApiSettings}>
                API settings
                {activeKeysCount > 0 ? <span className="glass-profile-button-count">{activeKeysCount}</span> : null}
              </GlassConsoleButton>
              {publicHref ? (
                <GlassConsoleLink href={publicHref} icon={profileConsoleIcons.publicProfile}>
                  Public profile
                </GlassConsoleLink>
              ) : null}
              <GlassConsoleButton icon={profileConsoleIcons.signOut} onClick={onSignOut}>
                Sign out
              </GlassConsoleButton>
            </>
          ) : (
            <GlassConsoleLink href="/login">{copy.getYours}</GlassConsoleLink>
          )}
        </nav>

        <div className="glass-profile-grid">
          <GlassPanel id="today" className="glass-profile-today-panel" selected={selectedPanel === "today"} onSelect={setSelectedPanel}>
            <div className="glass-profile-panel-header">
              <span>{copy.today}</span>
              <GlassStatus>{copy.agentConnected}</GlassStatus>
            </div>
            <GlassDivider variant="wide" />
            <h3>{isProfileComplete ? copy.nothingNeedsAction : copy.completeProfile}</h3>
            <div className="glass-profile-panel-footer">
              <p>{isProfileComplete ? copy.todayDetail : copy.incompleteDetail}</p>
              {mode === "private" ? (
                <GlassConsoleButton icon={profileConsoleIcons.refresh} onClick={onUpdateGps}>
                  {gpsActionLabel || "Update GPS"}
                </GlassConsoleButton>
              ) : null}
            </div>
          </GlassPanel>

          <GlassPanel id="identity" className="glass-profile-identity-panel" selected={selectedPanel === "identity"} onSelect={setSelectedPanel}>
            <div className="glass-profile-panel-header">
              <span>{copy.identity}</span>
              <span className="glass-profile-button-group">
                <GlassConsoleButton
                  icon={profileConsoleIcons.refresh}
                  onClick={() => setIdentityBackVisible((current) => !current)}
                >
                  {identityBackVisible ? copy.front : copy.back}
                </GlassConsoleButton>
                {mode === "private" && onEdit ? (
                  <GlassConsoleButton icon={profileConsoleIcons.edit} onClick={onEdit}>
                    Edit
                  </GlassConsoleButton>
                ) : null}
              </span>
            </div>
            <GlassDivider />

            {identityBackVisible ? (
              <div className="glass-profile-myth">
                <span>{copy.mythLabel}</span>
                <h3>{isProfileComplete ? displayArchetype.primary : copy.mythPending}</h3>
                <p>{isProfileComplete ? displayArchetype.reason : copy.mythPendingBody}</p>
              </div>
            ) : (
              <>
                <div className="glass-profile-title-row">
                  <h3>{displayName}</h3>
                  <GlassStatus active={isActive}>{statusLabel}</GlassStatus>
                </div>
                <p className="glass-profile-summary">{summary}</p>
                {(tags.length > 0 || extraTagCount > 0) && (
                  <div className="glass-profile-tags">
                    {tags.map((tag) => (
                      <span className="glass-profile-tag" key={tag}>
                        <span aria-hidden="true" className="glass-profile-tag-edge" />
                        <span>{tag}</span>
                      </span>
                    ))}
                    {extraTagCount > 0 ? (
                      <span className="glass-profile-tag">
                        <span aria-hidden="true" className="glass-profile-tag-edge" />
                        <span>+{extraTagCount}</span>
                      </span>
                    ) : null}
                  </div>
                )}
                <GlassDivider />
                <div className="glass-profile-field">
                  <span>{copy.lookingFor}</span>
                  <p>{lookingFor}</p>
                </div>
                <div className="glass-profile-field">
                  <span>{copy.conversation}</span>
                  <p>{conversation}</p>
                </div>
                <GlassDivider />
                <div className="glass-profile-meta">
                  <span className="glass-profile-location">
                    <img alt="" src={profileConsoleIcons.location} />
                    {location || "—"}
                  </span>
                  {visibleLinks.length > 0 ? (
                    <span className="glass-profile-socials">
                      {visibleLinks.slice(0, 3).map((link) => (
                        <GlassSocialLink key={link} link={link} />
                      ))}
                    </span>
                  ) : null}
                </div>
              </>
            )}
          </GlassPanel>

          <div className="glass-profile-side-stack">
            <GlassPanel id="matches" selected={selectedPanel === "matches"} onSelect={setSelectedPanel}>
              <div className="glass-profile-panel-header">
                <span>{copy.matches}</span>
                <GlassConsoleButton>{copy.viewAll}</GlassConsoleButton>
              </div>
              <GlassDivider />
              <h4>{copy.noPendingMatches}</h4>
              <p>{copy.noPendingMatchesReason}</p>
            </GlassPanel>

            <GlassPanel id="rooms" selected={selectedPanel === "rooms"} onSelect={setSelectedPanel}>
              <div className="glass-profile-panel-header">
                <span>{copy.rooms}</span>
                <GlassConsoleButton>{copy.viewAll}</GlassConsoleButton>
              </div>
              <GlassDivider />
              <h4>{copy.noRoomJoined}</h4>
              <p>{copy.noRoomJoinedReason}</p>
            </GlassPanel>
          </div>
        </div>
      </section>

      {(error || profileNotice || editorOpen) && (
        <aside className="glass-profile-workspace">
          {error ? <p className="glass-profile-notice glass-profile-error">{error}</p> : null}
          {profileNotice ? <p className="glass-profile-notice">{profileNotice}</p> : null}
          {editorOpen ? editor : null}
        </aside>
      )}
    </div>
  );
}

function GlassPanel({
  id,
  children,
  className,
  selected,
  onSelect,
}: {
  id: PanelId;
  children: ReactNode;
  className?: string;
  selected: boolean;
  onSelect: (id: PanelId) => void;
}) {
  return (
    <section
      className={`glass-profile-panel${className ? ` ${className}` : ""}`}
      data-profile-panel={id}
      data-selected={selected}
      onClick={() => onSelect(id)}
    >
      <span aria-hidden="true" className="glass-profile-panel-glass" />
      <div className="glass-profile-panel-content">{children}</div>
      <span aria-hidden="true" className="glass-profile-panel-inset" />
      <span aria-hidden="true" className="glass-profile-panel-shadow" />
      <span aria-hidden="true" className="glass-profile-panel-stroke" />
    </section>
  );
}

function GlassConsoleButton({
  children,
  icon,
  onClick,
}: {
  children: ReactNode;
  icon?: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      className="glass-profile-button"
      onClick={(event) => {
        event.stopPropagation();
        onClick?.();
      }}
    >
      <span aria-hidden="true" className="glass-profile-button-fill" />
      <span aria-hidden="true" className="glass-profile-button-inset" />
      {icon ? <img alt="" className="glass-profile-button-icon" src={icon} /> : null}
      <span className="glass-profile-button-label">{children}</span>
    </button>
  );
}

function GlassConsoleLink({
  children,
  href,
  icon,
}: {
  children: ReactNode;
  href: string;
  icon?: string;
}) {
  return (
    <Link
      className="glass-profile-button glass-profile-link-button"
      href={href}
      onClick={(event) => event.stopPropagation()}
    >
      <span aria-hidden="true" className="glass-profile-button-fill" />
      <span aria-hidden="true" className="glass-profile-button-inset" />
      {icon ? <img alt="" className="glass-profile-button-icon" src={icon} /> : null}
      <span className="glass-profile-button-label">{children}</span>
    </Link>
  );
}

function GlassStatus({ children, active = true }: { children: ReactNode; active?: boolean }) {
  return (
    <span className="glass-profile-status" data-active={active}>
      <span className="glass-profile-status-dot">●</span>
      <span>{children}</span>
    </span>
  );
}

function GlassDivider({ variant }: { variant?: "wide" }) {
  return <span aria-hidden="true" className={`glass-profile-divider${variant === "wide" ? " glass-profile-divider-wide" : ""}`} />;
}

function GlassSocialLink({ link }: { link: string }) {
  const kind = getSocialLinkKind(link);

  return (
    <a
      aria-label={socialLinkLabels[kind]}
      className="glass-profile-social-lens"
      href={formatProfileUrl(link)}
      rel="noreferrer"
      target="_blank"
      onClick={(event) => event.stopPropagation()}
    >
      <span aria-hidden="true" className="glass-profile-social-glass" />
      <SocialLinkIcon link={link} size={20} className="glass-profile-social-icon" />
    </a>
  );
}
