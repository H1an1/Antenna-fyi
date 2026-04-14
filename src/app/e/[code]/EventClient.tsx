"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://bcudjloikmpcqwcptuyd.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o";

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

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

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-md w-full p-8 text-center"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.15)",
        }}
      >
        <h1 className="font-serif text-2xl text-[#e8e0d4] mb-2">Antenna</h1>
        <p className="font-mono text-[10px] text-[#b8ad9e]/50 mb-6">Event</p>

        {loading && (
          <p className="font-mono text-sm text-[#b8ad9e]">Loading...</p>
        )}

        {!loading && !event?.found && (
          <p className="font-mono text-sm text-[#c4a862]">Event not found</p>
        )}

        {!loading && event?.found && (
          <div>
            <h2 className="font-serif text-xl text-[#e8e0d4] mb-4">{event.name}</h2>

            {!event.active && (
              <p className="font-mono text-sm text-[#c4a862] mb-4">This event has ended</p>
            )}

            {event.active && (
              <>
                <p className="font-mono text-xs text-[#b8ad9e] mb-2">
                  {event.participants} people joined
                </p>

                <div className="mb-6 mt-4">
                  <p className="font-mono text-xs text-[#b8ad9e] mb-3">
                    Copy this to your AI agent to join:
                  </p>
                  <button
                    onClick={copyCommand}
                    className="font-mono text-xs px-5 py-2.5 transition-colors w-full"
                    style={{
                      border: "1px solid rgba(184, 173, 158, 0.2)",
                      color: copied ? "#c4a862" : "#e8e0d4",
                      backgroundColor: copied
                        ? "rgba(196, 168, 98, 0.08)"
                        : "rgba(196, 168, 98, 0.04)",
                    }}
                  >
                    {copied ? "✓ Copied!" : "📋 Copy join command"}
                  </button>
                </div>

                <div
                  className="pt-4 mt-4"
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
      </div>
    </main>
  );
}
