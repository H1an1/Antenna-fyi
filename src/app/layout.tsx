import type { Metadata } from "next";
import { Cormorant_Garamond, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export const metadata: Metadata = {
  title: "Antenna — Discover Interesting People Nearby",
  description:
    "AI-powered social discovery. Your agent finds people worth meeting within 500 meters. Privacy-first, ephemeral, gone in 24 hours.",
  openGraph: {
    title: "Antenna — Discover Interesting People Nearby",
    description: "Your AI agent finds people worth meeting. Privacy-first, ephemeral connections that disappear in 24 hours.",
    url: "https://www.antenna.fyi",
    siteName: "Antenna",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Antenna — AI-Powered Social Discovery",
    description: "Your agent finds interesting people nearby. Gone in 24 hours.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${cormorant.variable} ${jetbrains.variable}`}>
      <body className="bg-[#1a1412] text-[#e8e0d4] antialiased">
        {children}
      </body>
    </html>
  );
}
