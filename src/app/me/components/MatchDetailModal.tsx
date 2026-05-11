"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { ProfileCard } from "./ProfileCard";
import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { parseMoreInformation, type ProfileDraft } from "@/lib/profile";
import { matchArchetype } from "@/lib/archetype";

interface MatchProfile {
  target_id: string;
  name: string;
  slug?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  matching_context?: string;
  profile_slug?: string;
  their_contact?: string | null;
  you_shared?: string | null;
}

interface MatchDetailModalProps {
  open: boolean;
  onClose: () => void;
  match: MatchProfile | null;
  type: "mutual" | "incoming";
  onAccept: (targetId: string) => Promise<void>;
  onPass: (targetId: string) => Promise<void>;
  onShareContact: (targetId: string, contact: string) => Promise<void>;
  t: {
    matchDetail: string;
    matchAccept: string;
    matchPass: string;
    matchMutual: string;
    matchIncoming: string;
    matchShareContact: string;
    matchContactPlaceholder: string;
    matchContactShared: string;
    matchTheirContact: string;
    line: (index: number) => string;
    flipBack: string;
    flipFront: string;
    defaultUser: string;
    mythArchetypeLabel: string;
  };
}

export function MatchDetailModal({
  open,
  onClose,
  match,
  type,
  onAccept,
  onPass,
  onShareContact,
  t,
}: MatchDetailModalProps) {
  const [contactInput, setContactInput] = useState("");
  const [sharing, setSharing] = useState(false);
  const [acting, setActing] = useState(false);
  const [showShareAfterAccept, setShowShareAfterAccept] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, open]);

  useEffect(() => {
    if (open) {
      setContactInput("");
      setSharing(false);
      setActing(false);
      setShowShareAfterAccept(false);
      setIsFlipped(false);
    }
  }, [open, match?.target_id]);

  // Build ProfileDraft from match data — same pattern as PublicProfileCard
  const moreInfo = useMemo(() => {
    return parseMoreInformation(match?.matching_context || null);
  }, [match?.matching_context]);

  const profileDraft: ProfileDraft = useMemo(() => ({
    displayName: match?.name || "Anonymous",
    personalDescription: match?.line1 || "",
    lookingFor: match?.line2 || "",
    ourConversation: match?.line3 || "",
    context: moreInfo.context || "",
    showContextPublicly: false,
    interestTags: moreInfo.interestTags || [],
    city: moreInfo.city || "",
    isActive: moreInfo.isActive !== false,
    links: ["", "", ""],
    profileSlug: match?.profile_slug || "",
    deviceId: "",
    lastGps: null,
    archetypeOverride: moreInfo.archetypeOverride || null,
  }), [match, moreInfo]);

  const archetypeMatch = useMemo(
    () => matchArchetype(profileDraft),
    [profileDraft],
  );

  if (!open || !match) return null;

  const handleAccept = async () => {
    setActing(true);
    await onAccept(match.target_id);
    setActing(false);
    setShowShareAfterAccept(true);
  };

  const handlePass = async () => {
    setActing(true);
    await onPass(match.target_id);
    setActing(false);
  };

  const handleShare = async () => {
    if (!contactInput.trim()) return;
    setSharing(true);
    await onShareContact(match.target_id, contactInput.trim());
    setSharing(false);
  };

  const isMutualOrAccepted = type === "mutual" || showShareAfterAccept;

  const cardT = {
    flipBack: t.flipBack,
    flipFront: t.flipFront,
    editProfile: "",
    defaultUser: t.defaultUser,
    mythArchetypeLabel: t.mythArchetypeLabel,
    line: t.line,
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#030302]/48 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-md space-y-4">
        {/* Close button */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="rounded-full bg-black/40 p-2 text-[#d8cab8] backdrop-blur transition-colors hover:text-[#A89888]"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>

        {/* Profile card — exactly like public profile page */}
        <ProfileCard
          profileDraft={profileDraft}
          archetypeMatch={archetypeMatch}
          isFlipped={isFlipped}
          onFlip={setIsFlipped}
          onEdit={() => {}}
          showEditButton={false}
          t={cardT}
          statusPill={isMutualOrAccepted ? "mutual" : "incoming"}
          isActive={moreInfo.isActive !== false}
          language="en"
        />

        {/* Actions panel */}
        <EngravedPanel className="p-5">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
            {isMutualOrAccepted ? t.matchMutual : t.matchIncoming}
          </p>

          {isMutualOrAccepted ? (
            <div className="space-y-4">
              {match.their_contact && (
                <div className="border border-[#d7b866]/18 bg-[#070807]/48 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.matchTheirContact}
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#A89888]">{match.their_contact}</p>
                </div>
              )}

              {match.you_shared ? (
                <p className="font-mono text-[11px] text-[#d8cab8]">
                  {t.matchContactShared}: {match.you_shared}
                </p>
              ) : (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={contactInput}
                    onChange={(e) => setContactInput(e.target.value)}
                    placeholder={t.matchContactPlaceholder}
                    className="flex-1 border border-[#d7b866]/24 bg-[#070807]/60 px-3 py-2 font-mono text-xs text-[#A89888] placeholder:text-[#d8cab8]/50 focus:border-[#d7b866]/48 focus:outline-none"
                  />
                  <button
                    onClick={handleShare}
                    disabled={sharing || !contactInput.trim()}
                    className="border border-[#d7b866]/50 bg-[#d7b866]/10 px-3 py-2 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16 disabled:opacity-50"
                  >
                    {t.matchShareContact}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                disabled={acting}
                className="flex-1 border border-[#d7b866]/50 bg-[#d7b866]/10 px-4 py-2.5 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16 disabled:opacity-50"
              >
                {t.matchAccept}
              </button>
              <button
                onClick={handlePass}
                disabled={acting}
                className="flex-1 border border-[#d8cab8]/30 px-4 py-2.5 font-mono text-xs text-[#d8cab8] transition-colors hover:border-[#d8cab8]/50 disabled:opacity-50"
              >
                {t.matchPass}
              </button>
            </div>
          )}
        </EngravedPanel>
      </div>
    </div>
  );
}
