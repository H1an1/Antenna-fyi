"use client";

import { useMemo } from "react";
import { createClient } from "@/lib/supabase";

/**
 * Returns a stable Supabase client instance across re-renders.
 * Safe to call in any client component.
 */
export function useSupabase() {
  return useMemo(() => createClient(), []);
}
