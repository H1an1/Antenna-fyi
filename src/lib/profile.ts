import { pinyin } from "pinyin-pro";

export const PROFILE_METADATA_KEY = "antenna_profile";
export const PROFILE_CONTEXT_VERSION = 1;
export const PROFILE_MORE_INFORMATION_MAX_LENGTH = 1000;
/** @deprecated Use PROFILE_MORE_INFORMATION_MAX_LENGTH */
export const PROFILE_CONTEXT_MAX_LENGTH = PROFILE_MORE_INFORMATION_MAX_LENGTH;
export const PROFILE_DESCRIPTION_MAX_LENGTH = 220;
export const PROFILE_LOOKING_FOR_MAX_LENGTH = 140;
export const PROFILE_CONVERSATION_MAX_LENGTH = 160;
export const PROFILE_LINE_MAX_LENGTH = PROFILE_DESCRIPTION_MAX_LENGTH;

export type ProfileDraft = {
  displayName: string;
  personalDescription: string;
  lookingFor: string;
  ourConversation: string;
  context: string;
  showContextPublicly: boolean;
  interestTags: string[];
  city: string;
  isActive: boolean;
  links: string[];
  profileSlug: string;
  deviceId: string;
  lastGps: string | null;
  archetypeOverride?: { name: string; reason: string; reasonZh?: string } | null;
};

export type MoreInformation = {
  version: number;
  context: string;
  showContextPublicly: boolean;
  interestTags: string[];
  city: string;
  isActive: boolean;
  links: string[];
  lastGps: string | null;
  archetypeOverride?: { name: string; reason: string; reasonZh?: string } | null;
};

function getSlugSource(value: string) {
  try {
    return pinyin(value, { toneType: "none", nonZh: "consecutive" });
  } catch {
    return value;
  }
}

export function normalizeProfileSlug(value: string) {
  return getSlugSource(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

export function limitMoreInformation(value: string) {
  return value.slice(0, PROFILE_MORE_INFORMATION_MAX_LENGTH);
}

/** @deprecated Use limitMoreInformation */
export const limitProfileContext = limitMoreInformation;

export function limitProfileLine(value: string) {
  return value.slice(0, PROFILE_LINE_MAX_LENGTH);
}

export function limitProfileDescription(value: string) {
  return value.slice(0, PROFILE_DESCRIPTION_MAX_LENGTH);
}

export function limitProfileLookingFor(value: string) {
  return value.slice(0, PROFILE_LOOKING_FOR_MAX_LENGTH);
}

export function limitProfileConversation(value: string) {
  return value.slice(0, PROFILE_CONVERSATION_MAX_LENGTH);
}

export function createProfileSlug(name: string, fallback: string) {
  const slug = normalizeProfileSlug(name);

  return slug || `user-${fallback.slice(0, 8)}`;
}

export function sanitizeTags(tags: string[]) {
  const seen = new Set<string>();
  return tags
    .map((tag) => tag.trim())
    .filter(Boolean)
    .filter((tag) => {
      const key = tag.toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 5);
}

export function normalizeLinks(links: string[]) {
  return links.map((link) => link.trim()).filter(Boolean).slice(0, 3);
}

export function createDefaultProfileDraft(name: string, email: string, userId: string): ProfileDraft {
  const displayName = name || email.split("@")[0] || "Antenna user";

  return {
    displayName,
    personalDescription: "",
    lookingFor: "",
    ourConversation: "",
    context: "",
    showContextPublicly: false,
    interestTags: [],
    city: "",
    isActive: true,
    links: ["", "", ""],
    profileSlug: createProfileSlug(displayName, userId),
    deviceId: `user:${userId}`,
    lastGps: null,
    archetypeOverride: null,
  };
}

export function draftToMoreInformation(draft: ProfileDraft): MoreInformation {
  return {
    version: PROFILE_CONTEXT_VERSION,
    context: draft.context,
    showContextPublicly: false,
    interestTags: sanitizeTags(draft.interestTags),
    city: draft.city,
    isActive: draft.isActive,
    links: normalizeLinks(draft.links),
    lastGps: draft.lastGps,
    archetypeOverride: draft.archetypeOverride || null,
  };
}

export function serializeMoreInformation(draft: ProfileDraft) {
  return JSON.stringify(draftToMoreInformation(draft));
}

/** @deprecated Use serializeMoreInformation */
export const serializeProfileContext = serializeMoreInformation;

export function parseMoreInformation(value: unknown): Partial<MoreInformation> {
  if (typeof value !== "string" || !value.trim()) return {};

  try {
    const parsed = JSON.parse(value) as Partial<MoreInformation> & {
      about?: unknown;
      currentFocus?: unknown;
      targetPeople?: unknown;
    };
    const legacyContext = [parsed.currentFocus, parsed.targetPeople, parsed.about]
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join("\n\n");

    return {
      version: parsed.version || PROFILE_CONTEXT_VERSION,
      context: parsed.context || legacyContext,
      showContextPublicly: parsed.showContextPublicly === true,
      interestTags: Array.isArray(parsed.interestTags) ? sanitizeTags(parsed.interestTags) : [],
      city: parsed.city || "",
      isActive: typeof parsed.isActive === "boolean" ? parsed.isActive : true,
      links: Array.isArray(parsed.links) ? normalizeLinks(parsed.links) : [],
      lastGps: parsed.lastGps || null,
      archetypeOverride: parsed.archetypeOverride || null,
    };
  } catch {
    return {
      context: value,
      showContextPublicly: false,
    };
  }
}

export function mergeProfileDraft(base: ProfileDraft, patch: Partial<ProfileDraft>): ProfileDraft {
  const next = { ...base, ...patch } as ProfileDraft & {
    about?: unknown;
    currentFocus?: unknown;
    matchReason?: unknown;
    targetPeople?: unknown;
  };
  if (!next.context) {
    const legacyContext = [next.currentFocus, next.targetPeople, next.about]
      .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      .join("\n\n");
    next.context = legacyContext;
  }
  next.context = limitProfileContext(next.context || "");
  next.personalDescription = limitProfileDescription(next.personalDescription || "");
  next.lookingFor = limitProfileLookingFor(next.lookingFor || "");
  next.ourConversation = limitProfileConversation(next.ourConversation || "");

  delete next.about;
  delete next.currentFocus;
  delete next.matchReason;
  delete next.targetPeople;

  return {
    ...next,
    showContextPublicly: false,
    interestTags: sanitizeTags(patch.interestTags || base.interestTags),
    links: normalizeLinks(patch.links || base.links).concat(["", "", ""]).slice(0, 3),
    profileSlug:
      patch.profileSlug !== undefined
        ? normalizeProfileSlug(patch.profileSlug)
        : base.profileSlug || createProfileSlug(patch.displayName || base.displayName, base.deviceId),
  };
}

/** @deprecated Use parseMoreInformation */
export const parseProfileContext = parseMoreInformation;
/** @deprecated Use draftToMoreInformation */
export const draftToProfileContext = draftToMoreInformation;
/** @deprecated Use MoreInformation */
export type ProfileContext = MoreInformation;
