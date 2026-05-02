"use client";

import { createClient } from "@/lib/supabase";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN") {
        router.push("/me");
      }
    });
  }, [router, supabase]);

  return (
    <main
      className="min-h-screen flex items-center justify-center"
      style={{ backgroundColor: "#1a1412" }}
    >
      <p className="font-mono text-sm text-[#b8ad9e]">Signing in...</p>
    </main>
  );
}
