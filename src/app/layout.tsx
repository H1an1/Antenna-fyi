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
    "AI-powered social discovery. Find interesting people within 500 meters. Privacy-first, ephemeral connections.",
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
