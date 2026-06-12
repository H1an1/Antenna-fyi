"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PublicProfileCard } from "./PublicProfileCard";

const antennaLogoSrc = "/brand/antenna.svg";
const languageStorageKey = "antenna.dashboard.language";

type Language = "en" | "zh";

const copy = {
  en: {
    subtitle: "Public identity card",
    getYours: "Get yours",
    notPublished: "This profile is not published yet.",
    notPublishedBody: "Save your profile from the dashboard, then refresh this page.",
    backToDashboard: "Back to dashboard",
    antennaHome: "Antenna home",
    flipBack: "Back",
    flipFront: "Front",
    editProfile: "Edit",
    defaultUser: "Antenna user",
    mythArchetypeLabel: "Assigned archetype",
    line: (index: number) =>
      ["Personal description", "Looking for", "Our conversation"][index - 1] || `Line ${index}`,
    backPlaceholderTitle: "Your archetype awaits.",
    backPlaceholderBody: "Complete your profile and the system will assign your mythic archetype.",
    emptyStateTitle: "This is your identity card.",
    emptyStateBody: "Tell us who you are, what you're looking for, and how you want to connect.",
  },
  zh: {
    subtitle: "公开身份卡片",
    getYours: "创建你的",
    notPublished: "这个主页还没有发布。",
    notPublishedBody: "从控制台保存你的主页，然后刷新这个页面。",
    backToDashboard: "回到控制台",
    antennaHome: "Antenna 首页",
    flipBack: "背面",
    flipFront: "正面",
    editProfile: "编辑",
    defaultUser: "Antenna 用户",
    mythArchetypeLabel: "分配的神话原型",
    line: (index: number) =>
      ["个人描述", "想认识的人", "想要的交流方式"][index - 1] || `第 ${index} 行`,
    backPlaceholderTitle: "你的原型正在等待。",
    backPlaceholderBody: "填完个人信息后，系统会根据你的 profile 分配专属形象。",
    emptyStateTitle: "这是你的身份卡片。",
    emptyStateBody: "告诉我们你是谁、想认识什么人、想要什么样的交流。",
  },
};

interface PublicProfileData {
  displayName: string;
  personalDescription: string;
  lookingFor: string;
  ourConversation: string;
  context: string;
  interestTags: string[];
  city: string;
  isActive: boolean;
  links: string[];
  archetypeOverride?: { name: string; reason: string } | null;
}

export function PublicPageClient({
  profile,
  notFound,
}: {
  profile: PublicProfileData | null;
  notFound: boolean;
}) {
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const stored = window.localStorage.getItem(languageStorageKey);
      return stored === "zh" ? "zh" : "en";
    } catch {
      return "en";
    }
  });

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    try { window.localStorage.setItem(languageStorageKey, next); } catch {}
  };

  const t = copy[language];

  const langSwitcher = (
    <div className="inline-flex border border-[#d7b866]/22 bg-black/18 font-mono text-xs">
      {(["en", "zh"] as const).map((option) => (
        <button
          key={option}
          onClick={() => changeLanguage(option)}
          className={`px-3 py-2 transition-colors ${
            language === option
              ? "bg-[#d7b866]/14 text-[#e2c46e]"
              : "text-[#d8cab8] hover:text-[#A89888]"
          }`}
        >
          {option === "en" ? "EN" : "中文"}
        </button>
      ))}
    </div>
  );

  if (notFound || !profile) {
    return (
      <div className="relative z-10 mx-auto w-full max-w-lg px-4 py-8 text-[#1c2a1d]">
        <header className="mb-8 flex items-center justify-between">
          <div>
            <Link href="/" className="block w-fit" aria-label="Antenna">
              <Image
                src={antennaLogoSrc}
                alt="Antenna"
                width={188}
                height={60}
                priority
                className="h-12 w-auto max-w-[220px]"
              />
            </Link>
            <p className="mt-2 font-serif text-[10px] uppercase tracking-[0.02em] text-[#1c2a1d]/70">
              {t.subtitle}
            </p>
          </div>
          {langSwitcher}
        </header>

        <div className="text-center">
          <h1 className="mythic-soft-title font-serif text-3xl leading-tight">
            {t.notPublished}
          </h1>
          <p className="mt-4 font-serif text-sm leading-relaxed text-[#1c2a1d]/72">
            {t.notPublishedBody}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/me"
              className="inline-flex items-center gap-2 rounded-full bg-[#1c2a1d] px-4 py-2.5 font-sans text-xs text-[#f3efe7] transition-colors hover:bg-[#2d3d2e]"
            >
              {t.backToDashboard}
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#ece9e6] px-4 py-2.5 font-sans text-xs text-[#1c2a1d] transition-colors hover:bg-[#e3ded7]"
            >
              {t.antennaHome}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PublicProfileCard profile={profile} language={language} onLanguageChange={changeLanguage} />
  );
}
