"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

function formatTime(iso: string) {
  try {
    const d = new Date(iso);
    return d.toLocaleString("zh-CN", {
      month: "short", day: "numeric",
      hour: "2-digit", minute: "2-digit",
      hour12: false,
    });
  } catch { return iso; }
}

export default function EventClient() {
  const params = useParams();
  const code = params.code as string;
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!code) return;
    sb.rpc("get_event", { p_code: code }).then(({ data }) => {
      setEvent(data);
      setLoading(false);
    });
  }, [code]);

  const copyCommand = () => {
    navigator.clipboard.writeText(
      `Join the Antenna event "${event?.name || code}". Run: antenna_event_join with code "${code}". If you don't have Antenna, install it first: npm install -g antenna-fyi`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const gold = "#c4a862";
  const muted = "#b8ad9e";
  const light = "#e8e0d4";

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6 py-12"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-md w-full p-8"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.15)",
        }}
      >
        <h1 className="font-serif text-2xl text-[#e8e0d4] mb-1 text-center">Antenna</h1>
        <p className="font-mono text-[10px] text-[#b8ad9e]/50 mb-6 text-center">Event</p>

        {loading && (
          <p className="font-mono text-sm text-[#b8ad9e] text-center">Loading...</p>
        )}

        {!loading && !event?.found && (
          <p className="font-mono text-sm text-[#c4a862] text-center">Event not found</p>
        )}

        {!loading && event?.found && (
          <div>
            {/* Event name */}
            <h2 className="font-serif text-xl text-[#e8e0d4] mb-3 text-center">{event.name}</h2>

            {/* Description */}
            {event.description && (
              <p className="font-mono text-xs text-[#b8ad9e] mb-4 leading-relaxed">
                {event.description}
              </p>
            )}

            {/* Time */}
            {event.starts_at && (
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs" style={{ color: gold }}>🕐</span>
                <span className="font-mono text-xs" style={{ color: muted }}>
                  {formatTime(event.starts_at)} — {formatTime(event.ends_at)}
                </span>
              </div>
            )}

            {/* Participants */}
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs" style={{ color: gold }}>👥</span>
              <span className="font-mono text-xs" style={{ color: muted }}>
                {event.participants} joined
                {event.pending > 0 && ` · ${event.pending} pending`}
              </span>
            </div>

            {/* Approval badge */}
            {event.requires_approval && (
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs" style={{ color: gold }}>🔒</span>
                <span className="font-mono text-xs" style={{ color: muted }}>
                  Requires approval to join
                </span>
              </div>
            )}

            {/* Screening questions */}
            {event.screening_questions?.length > 0 && (
              <div className="mb-4 p-3" style={{ backgroundColor: "rgba(196, 168, 98, 0.06)", border: "1px solid rgba(196, 168, 98, 0.12)" }}>
                <p className="font-mono text-[10px] uppercase tracking-wider mb-2" style={{ color: gold }}>
                  Screening Questions
                </p>
                {event.screening_questions.map((q: string, i: number) => (
                  <p key={i} className="font-mono text-xs mb-1" style={{ color: muted }}>
                    {i + 1}. {q}
                  </p>
                ))}
              </div>
            )}

            {/* Status */}
            {!event.active && (
              <p className="font-mono text-sm text-[#c4a862] mb-4 text-center">This event has ended</p>
            )}

            {event.active && (
              <>
                <div className="mb-6 mt-4" style={{ borderTop: "1px solid rgba(184, 173, 158, 0.08)", paddingTop: "16px" }}>
                  <p className="font-mono text-xs text-[#b8ad9e] mb-3 text-center">
                    Copy this to your AI agent to join:
                  </p>
                  <button
                    onClick={copyCommand}
                    className="font-mono text-xs px-5 py-2.5 transition-colors w-full"
                    style={{
                      border: "1px solid rgba(184, 173, 158, 0.2)",
                      color: copied ? gold : light,
                      backgroundColor: copied
                        ? "rgba(196, 168, 98, 0.08)"
                        : "rgba(196, 168, 98, 0.04)",
                    }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy join command"}
                  </button>
                </div>

                <div
                  className="pt-4 mt-2 text-center"
                  style={{ borderTop: "1px solid rgba(184, 173, 158, 0.08)" }}
                >
                  <p className="font-mono text-[10px] text-[#b8ad9e]/50 mb-2">
                    Don&apos;t have Antenna yet?
                  </p>
                  <code className="font-mono text-[11px] text-[#c4a862]">
                    npm install -g antenna-fyi
                  </code>
                </div>
              </>
            )}
          </div>
        )}

        {/* noscript for agents */}
        <noscript>
          <div>
            <p>Event: {code}</p>
            <p>Join: antenna_event_join with code &quot;{code}&quot;</p>
            <p>Install: npm install -g antenna-fyi</p>
          </div>
        </noscript>
      </div>
    </main>
  );
}
