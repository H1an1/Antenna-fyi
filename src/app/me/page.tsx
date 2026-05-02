"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.push("/login");
      } else {
        setUser(data.user);
        loadKeys();
      }
      setLoading(false);
    });
  }, []);

  const loadKeys = async () => {
    const { data } = await supabase.rpc("list_api_keys");
    setKeys(data || []);
  };

  const generateKey = async () => {
    const { data } = await supabase.rpc("generate_api_key", { p_name: "default" });
    if (data?.key) {
      await loadKeys();
    }
  };

  const revokeKey = async (id: number) => {
    await supabase.rpc("revoke_api_key", { p_key_id: id });
    await loadKeys();
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1412" }}>
        <p className="font-mono text-sm text-[#b8ad9e]">Loading...</p>
      </main>
    );
  }

  const activeKeys = keys.filter((k) => !k.revoked);
  const setupPrompt = activeKeys.length > 0
    ? `I have Antenna installed for social discovery. My API key is: ${activeKeys[0].key}\n\nInstall: npm install -g antenna-fyi\nConfig: antenna config --key ${activeKeys[0].key}\n\nYou can now use antenna_scan, antenna_profile, antenna_accept, antenna_discover, and other Antenna tools to help me meet interesting people nearby.`
    : null;

  return (
    <main
      className="min-h-screen px-6 py-12"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <h1 className="font-serif text-2xl text-[#e8e0d4]">Antenna</h1>
          <button
            onClick={handleSignOut}
            className="font-mono text-xs text-[#b8ad9e]/60 hover:text-[#b8ad9e] transition-colors"
          >
            Sign out
          </button>
        </div>

        {/* Welcome */}
        <div className="mb-10">
          <p className="font-mono text-sm text-[#b8ad9e]">
            Welcome, {user?.email}
          </p>
        </div>

        {/* API Keys */}
        <section className="mb-10">
          <h2 className="font-mono text-sm text-[#c4a862] mb-4">API Keys</h2>

          {activeKeys.length === 0 ? (
            <div
              className="p-6 text-center"
              style={{
                backgroundColor: "rgba(42, 34, 24, 0.85)",
                border: "1px solid rgba(184, 173, 158, 0.15)",
              }}
            >
              <p className="font-mono text-sm text-[#b8ad9e] mb-4">
                Generate an API key to connect your AI agent
              </p>
              <button
                onClick={generateKey}
                className="font-mono text-sm px-6 py-2 transition-colors"
                style={{
                  border: "1px solid rgba(196, 168, 98, 0.4)",
                  color: "#c4a862",
                  backgroundColor: "rgba(196, 168, 98, 0.08)",
                }}
              >
                Generate API Key
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {activeKeys.map((k) => (
                <div
                  key={k.id}
                  className="p-4 flex items-center justify-between"
                  style={{
                    backgroundColor: "rgba(42, 34, 24, 0.85)",
                    border: "1px solid rgba(184, 173, 158, 0.1)",
                  }}
                >
                  <div>
                    <p className="font-mono text-sm text-[#e8e0d4]">
                      {k.key.slice(0, 8)}...{k.key.slice(-4)}
                    </p>
                    <p className="font-mono text-[10px] text-[#b8ad9e]/50 mt-1">
                      {k.name} · created {new Date(k.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(k.key, k.key)}
                      className="font-mono text-[10px] px-3 py-1"
                      style={{
                        border: "1px solid rgba(184, 173, 158, 0.2)",
                        color: copied === k.key ? "#c4a862" : "#b8ad9e",
                      }}
                    >
                      {copied === k.key ? "Copied!" : "Copy"}
                    </button>
                    <button
                      onClick={() => revokeKey(k.id)}
                      className="font-mono text-[10px] px-3 py-1 text-red-400/60 hover:text-red-400"
                      style={{ border: "1px solid rgba(220, 38, 38, 0.2)" }}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
              <button
                onClick={generateKey}
                className="font-mono text-xs text-[#b8ad9e]/60 hover:text-[#b8ad9e] transition-colors"
              >
                + Generate another key
              </button>
            </div>
          )}
        </section>

        {/* Setup Prompt */}
        {setupPrompt && (
          <section className="mb-10">
            <h2 className="font-mono text-sm text-[#c4a862] mb-4">Setup your agent</h2>
            <div
              className="p-4 relative"
              style={{
                backgroundColor: "rgba(42, 34, 24, 0.85)",
                border: "1px solid rgba(184, 173, 158, 0.1)",
              }}
            >
              <p className="font-mono text-xs text-[#b8ad9e] mb-3">
                Copy this and send it to your AI agent:
              </p>
              <pre className="font-mono text-xs text-[#e8e0d4] whitespace-pre-wrap leading-relaxed">
                {setupPrompt}
              </pre>
              <button
                onClick={() => copyToClipboard(setupPrompt, "prompt")}
                className="absolute top-4 right-4 font-mono text-[10px] px-3 py-1"
                style={{
                  border: "1px solid rgba(196, 168, 98, 0.3)",
                  color: copied === "prompt" ? "#c4a862" : "#b8ad9e",
                  backgroundColor: "rgba(196, 168, 98, 0.06)",
                }}
              >
                {copied === "prompt" ? "Copied!" : "Copy prompt"}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
