"use client";
import { GlassProfileConsole } from "@/app/me/components/GlassProfileConsole";
import { matchArchetype } from "@/lib/archetype";
import type { ProfileDraft } from "@/lib/profile";

interface PublicProfileData {
  displayName: string;
  personalDescription: string;
  lookingFor: string;
  ourConversation: string;
  context: string;
  interestTags: string[];
  city: string;
  isActive: boolean;
  links: string[];
  archetypeOverride?: { name: string; reason: string } | null;
}

type Language = "en" | "zh";

export function PublicProfileCard({
  profile,
  language,
  onLanguageChange,
}: {
  profile: PublicProfileData;
  language: Language;
  onLanguageChange: (language: Language) => void;
}) {
  const profileDraft: ProfileDraft = {
    displayName: profile.displayName,
    personalDescription: profile.personalDescription,
    lookingFor: profile.lookingFor,
    ourConversation: profile.ourConversation,
    context: profile.context,
    showContextPublicly: false,
    interestTags: profile.interestTags,
    city: profile.city,
    isActive: profile.isActive,
    links: [...profile.links, "", "", ""].slice(0, 3),
    profileSlug: "",
    deviceId: "",
    lastGps: null,
    archetypeOverride: profile.archetypeOverride || null,
  };

  const archetypeMatch = matchArchetype(profileDraft);

  const isProfileComplete = Boolean(
    profileDraft.personalDescription.trim() &&
      profileDraft.lookingFor.trim() &&
      profileDraft.ourConversation.trim()
  );

  return (
    <GlassProfileConsole
      profileDraft={profileDraft}
      archetypeMatch={archetypeMatch}
      language={language}
      onLanguageChange={onLanguageChange}
      isProfileComplete={isProfileComplete}
      isActive={profile.isActive}
      mode="public"
    />
  );
}
