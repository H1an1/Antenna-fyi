"use client";

import { createClient } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");
    if (errorParam) {
      setError(errorDesc || errorParam);
      return;
    }

    // Supabase handles code exchange automatically via the client
    // Just wait for session to be established
    const timeout = setTimeout(() => {
      setError("Authentication timed out. Please try again.");
    }, 10000);

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        clearTimeout(timeout);
        router.push("/me");
      }
    });

    // Check if already signed in
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        clearTimeout(timeout);
        router.push("/me");
      }
    });

    return () => {
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, [router, supabase, searchParams]);

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#1a1412" }}
    >
      {error ? (
        <div className="text-center">
          <p className="font-mono text-sm text-red-400 mb-4">{error}</p>
          <a href="/login" className="font-mono text-xs text-[#c4a862] underline">
            Back to login
          </a>
        </div>
      ) : (
        <p className="font-mono text-sm text-[#b8ad9e]">Signing in...</p>
      )}
    </main>
  );
}

export default function AuthCallback() {
  return (
    <Suspense fallback={<main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#1a1412" }}><p className="font-mono text-sm text-[#b8ad9e]">Loading...</p></main>}>
      <CallbackHandler />
    </Suspense>
  );
}
