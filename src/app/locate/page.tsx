import { Suspense } from "react";
import LocateClient from "./LocateClient";

export const metadata = {
  title: "Antenna — Share Location",
  description: "Share your GPS location with your AI agent.",
};

export default function LocatePage() {
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
      <LocateClient />
    </Suspense>
  );
}
