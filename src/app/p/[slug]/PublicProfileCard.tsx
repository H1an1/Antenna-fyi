"use client";

import { useState, useMemo } from "react";
import { ProfileCard } from "@/app/me/components/ProfileCard";
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

interface PublicProfileT {
  flipBack: string;
  flipFront: string;
  editProfile: string;
  defaultUser: string;
  mythArchetypeLabel: string;
  line: (index: number) => string;
  backPlaceholderTitle?: string;
  backPlaceholderBody?: string;
  emptyStateTitle?: string;
  emptyStateBody?: string;
}

export function PublicProfileCard({ profile, t }: { profile: PublicProfileData; t: PublicProfileT }) {
  const [isFlipped, setIsFlipped] = useState(false);

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

  const archetypeMatch = useMemo(
    () => matchArchetype(profileDraft),
    [profileDraft.personalDescription, profileDraft.lookingFor, profileDraft.ourConversation, profileDraft.context, profileDraft.interestTags],
  );

  return (
    <ProfileCard
      profileDraft={profileDraft}
      archetypeMatch={archetypeMatch}
      isFlipped={isFlipped}
      onFlip={setIsFlipped}
      onEdit={() => {}}
      showEditButton={false}
      t={t}
      statusPill={profile.isActive ? "active" : "quiet"}
      isActive={profile.isActive}
      language="en"
    />
  );
}
