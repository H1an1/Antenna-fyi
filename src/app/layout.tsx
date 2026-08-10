import type { Metadata } from "next";
import { Cormorant_Garamond, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal"],
  variable: "--font-cormorant",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
  title: "Antenna — Your agent knows who you should meet",
  description:
    "Antenna helps agents turn context into real-world human connection.",
  openGraph: {
    title: "Antenna — Your agent knows who you should meet",
    description: "Antenna helps agents turn context into real-world human connection.",
    url: "https://www.antenna.fyi",
    siteName: "Antenna",
    type: "website",
    images: [{ url: "https://www.antenna.fyi/og-image.jpg", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Antenna — Your agent knows who you should meet",
    description: "Antenna helps agents turn context into real-world human connection.",
    images: ["https://www.antenna.fyi/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${cormorant.variable} ${jetbrains.variable} ${inter.variable}`}
    >
      <body className="bg-[#1a1412] text-[#e8e0d4] antialiased">
        {children}
      </body>
    </html>
  );
}
