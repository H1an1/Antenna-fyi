"use client";

import { EngravedPanel } from "@/app/components/EngravedPanel";
import { useCallback, useEffect, useState } from "react";
import { MatchDetailModal } from "./MatchDetailModal";
import type { SupabaseClient } from "@supabase/supabase-js";

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

interface MatchProfile {
  target_id: string;
  name: string;
  emoji?: string;
  line1?: string;
  line2?: string;
  line3?: string;
  their_contact?: string | null;
  you_shared?: string | null;
}

interface MatchesData {
  mutual_matches: MatchProfile[];
  incoming_accepts: MatchProfile[];
}

interface MatchesSectionProps {
  deviceId: string;
  supabase: SupabaseClient;
  pendingMatchCount: number;
  t: {
    matchesHeader: string;
    viewAll: string;
    noPendingMatches: string;
    noPendingMatchesReason: string;
    matchDetail: string;
    matchAccept: string;
    matchPass: string;
    matchMutual: string;
    matchIncoming: string;
    matchShareContact: string;
    matchContactPlaceholder: string;
    matchContactShared: string;
    matchTheirContact: string;
    matchLoading: string;
  };
}

export function MatchesSection({ deviceId, supabase, pendingMatchCount, t }: MatchesSectionProps) {
  const [matches, setMatches] = useState<MatchesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<MatchProfile | null>(null);
  const [selectedType, setSelectedType] = useState<"mutual" | "incoming">("incoming");

  const fetchMatches = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc("get_my_matches_with_profiles", {
        p_device_id: deviceId,
      });
      if (error) {
        console.error("Failed to fetch matches:", error);
        return;
      }
      setMatches(data as MatchesData);
    } catch (err) {
      console.error("Failed to fetch matches:", err);
    } finally {
      setLoading(false);
    }
  }, [supabase, deviceId]);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches, pendingMatchCount]);

  const handleAccept = async (targetId: string) => {
    await supabase.rpc("upsert_match", {
      p_device_id_a: deviceId,
      p_device_id_b: targetId,
      p_status: "accepted",
      p_contact_info: null,
    });
    setSelectedMatch(null);
    await fetchMatches();
  };

  const handlePass = async (targetId: string) => {
    await supabase.rpc("pass_user", {
      p_device_id: deviceId,
      p_passed_device_id: targetId,
    });
    setSelectedMatch(null);
    await fetchMatches();
  };

  const handleShareContact = async (targetId: string, contact: string) => {
    await supabase.rpc("upsert_match", {
      p_device_id_a: deviceId,
      p_device_id_b: targetId,
      p_status: "accepted",
      p_contact_info: contact,
    });
    await fetchMatches();
  };

  const allMatches = matches
    ? [
        ...matches.mutual_matches.map((m) => ({ ...m, _type: "mutual" as const })),
        ...matches.incoming_accepts.map((m) => ({ ...m, _type: "incoming" as const })),
      ]
    : [];

  const hasMatches = allMatches.length > 0;

  return (
    <>
      <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
        <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
          <div className="flex items-center gap-3">
            <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
              {t.matchesHeader}
            </p>
            <SignalStrip />
          </div>
          {hasMatches && (
            <span className="font-mono text-xs text-[#d8cab8]">
              {allMatches.length}
            </span>
          )}
        </div>
        <div className="dashboard-side-body pt-2">
          {loading ? (
            <p className="font-mono text-[0.875rem] text-[#A89888]">{t.matchLoading}</p>
          ) : !hasMatches ? (
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
          ) : (
            <div className="space-y-0">
              {allMatches.map((match) => (
                <div
                  key={match.target_id}
                  className="flex items-center justify-between gap-3 border-b border-[#d7b866]/12 py-3 last:border-b-0"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    {match.emoji && <span className="text-base">{match.emoji}</span>}
                    <span className="font-mono text-sm text-[#A89888] truncate">{match.name}</span>
                    {match._type === "mutual" && (
                      <span className="font-mono text-[10px] text-[#e2c46e]/70">✓</span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      setSelectedMatch(match);
                      setSelectedType(match._type);
                    }}
                    className="shrink-0 border border-[#d7b866]/30 px-3 py-1.5 font-mono text-[11px] text-[#d8cab8] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e]"
                  >
                    {t.matchDetail}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </EngravedPanel>

      <MatchDetailModal
        open={!!selectedMatch}
        onClose={() => setSelectedMatch(null)}
        match={selectedMatch}
        type={selectedType}
        onAccept={handleAccept}
        onPass={handlePass}
        onShareContact={handleShareContact}
        t={t}
      />
    </>
  );
}
