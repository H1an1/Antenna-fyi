"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { X, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";

interface MatchProfile {
  target_id: string;
  name: string;
  slug?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  interest_tags?: string[];
  city?: string;
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

  if (!open || !match) return null;

  const handleAccept = async () => {
    setActing(true);
    await onAccept(match.target_id);
    setActing(false);
    // Bug 3: After accept, transition to share contact UI instead of closing
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

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[#030302]/48 px-4 py-6 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <EngravedPanel className="w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 border-b border-[#d7b866]/16 p-5">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
              {isMutualOrAccepted ? t.matchMutual : t.matchIncoming}
            </p>
            <h2 className="mt-1 font-serif text-2xl text-[#A89888]">
              {match.name}
            </h2>
          </div>
          <div className="flex items-center gap-2">
            {(match.line1 || match.line2 || match.line3) && (
              <button
                onClick={() => setIsFlipped(!isFlipped)}
                className="text-[#d8cab8] transition-colors hover:text-[#e2c46e]"
                aria-label={isFlipped ? t.flipFront : t.flipBack}
              >
                <RefreshCw size={16} />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-[#d8cab8] transition-colors hover:text-[#A89888]"
              aria-label="Close"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Profile card content — styled like PublicProfileCard */}
        <div className="p-5">
          {!isFlipped ? (
            /* Front: main profile info */
            <div className="space-y-4">
              {match.line1 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.line(1)}
                  </p>
                  <p className="mt-1 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                    {match.line1}
                  </p>
                </div>
              )}

              {match.interest_tags && match.interest_tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {match.interest_tags.map((tag) => (
                    <span
                      key={tag}
                      className="border border-[#d7b866]/20 bg-[#d7b866]/8 px-2 py-0.5 font-mono text-[10px] text-[#A89888]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {match.city && (
                <p className="font-mono text-[11px] text-[#d8cab8]">
                  {match.city}
                </p>
              )}
            </div>
          ) : (
            /* Back: looking for + conversation */
            <div className="space-y-4">
              {match.line2 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.line(2)}
                  </p>
                  <p className="mt-1 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                    {match.line2}
                  </p>
                </div>
              )}
              {match.line3 && (
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.line(3)}
                  </p>
                  <p className="mt-1 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                    {match.line3}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-[#d7b866]/16 p-5">
          {isMutualOrAccepted ? (
            <div className="space-y-4">
              {/* Their contact */}
              {match.their_contact && (
                <div className="border border-[#d7b866]/18 bg-[#070807]/48 p-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.matchTheirContact}
                  </p>
                  <p className="mt-1 font-mono text-sm text-[#A89888]">{match.their_contact}</p>
                </div>
              )}

              {/* Share your contact */}
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
        </div>
      </EngravedPanel>
    </div>
  );
}
