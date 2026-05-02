"use client";

import { createClient } from "@/lib/supabase";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-sm w-full p-8"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.15)",
        }}
      >
        <h1 className="font-serif text-2xl text-[#e8e0d4] mb-2 text-center">
          Antenna
        </h1>
        <p className="font-mono text-xs text-[#b8ad9e] text-center mb-8">
          Sign in to get your API key
        </p>

        {/* Google */}
        <button
          onClick={handleGoogleLogin}
          className="w-full font-mono text-sm px-4 py-3 mb-4 transition-colors"
          style={{
            border: "1px solid rgba(184, 173, 158, 0.3)",
            color: "#e8e0d4",
            backgroundColor: "rgba(196, 168, 98, 0.08)",
          }}
        >
          Continue with Google
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(184, 173, 158, 0.15)" }} />
          <span className="font-mono text-[10px] text-[#b8ad9e]/50">or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: "rgba(184, 173, 158, 0.15)" }} />
        </div>

        {/* Magic Link */}
        {sent ? (
          <p className="font-mono text-sm text-[#c4a862] text-center">
            ✓ Check your email for the login link
          </p>
        ) : (
          <form onSubmit={handleMagicLink} className="space-y-3">
            <input
              type="email"
              placeholder="email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full font-mono text-sm px-4 py-2 bg-transparent outline-none"
              style={{
                border: "1px solid rgba(184, 173, 158, 0.2)",
                color: "#e8e0d4",
              }}
            />
            <button
              type="submit"
              className="w-full font-mono text-sm px-4 py-2 transition-colors"
              style={{
                border: "1px solid rgba(196, 168, 98, 0.3)",
                color: "#c4a862",
                backgroundColor: "rgba(196, 168, 98, 0.06)",
              }}
            >
              Send magic link
            </button>
          </form>
        )}

        {error && (
          <p className="font-mono text-xs text-red-400 mt-3 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
