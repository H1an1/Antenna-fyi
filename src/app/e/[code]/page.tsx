import { Suspense } from "react";
import { createClient } from "@supabase/supabase-js";
import EventClient from "./EventClient";

const sb = createClient(
  "https://bcudjloikmpcqwcptuyd.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjdWRqbG9pa21wY3F3Y3B0dXlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0MTg1NDgsImV4cCI6MjA4OTk5NDU0OH0.FaoC3QfpfHP1npNGjRchJAoAp2PdZtQe_WhP-t-GN1o"
);

async function getEvent(code: string) {
  const { data } = await sb.rpc("get_event", { p_code: code });
  return data;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const event = await getEvent(code);

  const title = event?.name
    ? `${event.name} — Antenna Event`
    : "Antenna — Event";
  const description =
    event?.description ||
    "Join an Antenna event and discover interesting people.";
  const ogImage = event?.og_image || "/og-image.jpg";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [ogImage],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

export default function EventPage() {
  return (
    <Suspense
      fallback={
        <main
          className="min-h-screen flex items-center justify-center"
          style={{ backgroundColor: "#1a1412" }}
        >
          <p className="font-mono text-sm text-[#b8ad9e]">Loading...</p>
        </main>
      }
    >
      <EventClient />
    </Suspense>
  );
}
