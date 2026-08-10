"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Step = "email" | "code";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>("email");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace("/me");
      } else {
        setChecking(false);
      }
    });
  }, [supabase, router]);

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setError(error.message);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });

    if (error) {
      setError(error.message);
    } else {
      setStep("code");
    }
    setLoading(false);
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      setError(error.message);
    } else {
      router.push("/me");
    }
    setLoading(false);
  };

  const handleResend = async () => {
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: true },
    });
    if (error) {
      setError(error.message);
    } else {
      setError(null);
    }
    setLoading(false);
  };

  if (checking) {
    return (
      <main
        className="min-h-screen flex items-center justify-center px-6"
        style={{ backgroundColor: "#1a1412" }}
      >
        <p className="font-mono text-sm text-[#b8ad9e]">Loading...</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-6"
      style={{ backgroundColor: "#1a1412" }}
    >
      <div
        className="max-w-sm w-full p-8"
        style={{
          backgroundColor: "rgba(42, 34, 24, 0.85)",
          border: "1px solid rgba(184, 173, 158, 0.22)",
        }}
      >
        <h1 className="font-serif text-2xl text-[#f2eadf] mb-2 text-center">
          Antenna
        </h1>
        <p className="font-mono text-xs text-[#d2c5b6] text-center mb-8">
          {step === "email"
            ? "Sign in or create an account"
            : `Enter the code sent to ${email}`}
        </p>

        {step === "email" ? (
          <>
            {/* Email input */}
            <form onSubmit={handleSendCode} className="space-y-3 mb-5">
              <div>
                <label className="font-mono text-[11px] text-[#d2c5b6] mb-1 block">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full font-mono text-sm px-4 py-2.5 bg-transparent outline-none max-[1150px]:min-h-11"
                  style={{
                    border: "1px solid rgba(184, 173, 158, 0.3)",
                    color: "#f2eadf",
                  }}
                  placeholder="you@example.com"
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full font-mono text-sm px-4 py-2.5 transition-colors max-[1150px]:min-h-11"
                style={{
                  border: "1px solid rgba(196, 168, 98, 0.5)",
                  color: "#c4a862",
                  backgroundColor: "rgba(196, 168, 98, 0.1)",
                  opacity: loading ? 0.5 : 1,
                }}
              >
                {loading ? "Sending..." : "Send verification code"}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-5">
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(184, 173, 158, 0.15)" }}
              />
              <span className="font-mono text-[10px] text-[#b8ad9e]/50">or</span>
              <div
                className="flex-1 h-px"
                style={{ backgroundColor: "rgba(184, 173, 158, 0.15)" }}
              />
            </div>

            {/* Google */}
            <button
              onClick={handleGoogleLogin}
              className="w-full font-mono text-sm px-4 py-2.5 transition-colors flex items-center justify-center gap-3 max-[1150px]:min-h-11"
              style={{
                border: "1px solid rgba(184, 173, 158, 0.25)",
                color: "#f2eadf",
                backgroundColor: "rgba(42, 34, 24, 0.5)",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </button>
          </>
        ) : (
          <>
            {/* Code input */}
            <form onSubmit={handleVerifyCode} className="space-y-3 mb-5">
              <div>
                <label className="font-mono text-[11px] text-[#d2c5b6] mb-1 block">
                  Verification code
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="w-full font-mono text-2xl tracking-[0.3em] text-center px-4 py-3 bg-transparent outline-none max-[1150px]:min-h-11"
                  style={{
                    border: "1px solid rgba(184, 173, 158, 0.3)",
                    color: "#f2eadf",
                    letterSpacing: "0.3em",
                  }}
                  placeholder="000000"
                  maxLength={6}
                  required
                  autoFocus
                />
              </div>
              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full font-mono text-sm px-4 py-2.5 transition-colors max-[1150px]:min-h-11"
                style={{
                  border: "1px solid rgba(196, 168, 98, 0.5)",
                  color: "#c4a862",
                  backgroundColor: "rgba(196, 168, 98, 0.1)",
                  opacity: loading || code.length < 6 ? 0.5 : 1,
                }}
              >
                {loading ? "Verifying..." : "Verify"}
              </button>
            </form>

            {/* Resend + back */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setStep("email");
                  setCode("");
                  setError(null);
                }}
                className="inline-flex items-center font-mono text-xs text-[#d2c5b6] hover:text-[#f2eadf] transition-colors max-[1150px]:min-h-11 max-[1150px]:py-3"
              >
                ← Change email
              </button>
              <button
                onClick={handleResend}
                disabled={loading}
                className="inline-flex items-center font-mono text-xs text-[#c4a862] hover:text-[#e2c46e] transition-colors disabled:opacity-50 max-[1150px]:min-h-11 max-[1150px]:py-3"
              >
                Resend code
              </button>
            </div>
          </>
        )}

        {error && (
          <p className="font-mono text-xs text-red-400 mt-4 text-center">{error}</p>
        )}
      </div>
    </main>
  );
}
