export type SocialLinkKind =
  | "github"
  | "x"
  | "instagram"
  | "linkedin"
  | "onlyfans"
  | "tiktok"
  | "youtube"
  | "telegram"
  | "website";

export const socialLinkIcons: Record<SocialLinkKind, string> = {
  github: "/profile-assets/social-icons/github.svg",
  x: "/profile-assets/social-icons/x.svg",
  instagram: "/profile-assets/social-icons/instagram.svg",
  linkedin: "/profile-assets/social-icons/linkedin.svg",
  onlyfans: "/profile-assets/social-icons/onlyfans.svg",
  tiktok: "/profile-assets/social-icons/tiktok.svg",
  youtube: "/profile-assets/social-icons/youtube.svg",
  telegram: "/profile-assets/social-icons/telegram.svg",
  website: "/profile-assets/social-icons/website.svg",
};

export const socialLinkLabels: Record<SocialLinkKind, string> = {
  github: "GitHub",
  x: "X",
  instagram: "Instagram",
  linkedin: "LinkedIn",
  onlyfans: "OnlyFans",
  tiktok: "TikTok",
  youtube: "YouTube",
  telegram: "Telegram",
  website: "Website",
};

export function formatProfileUrl(link: string) {
  const trimmed = link.trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  return `https://${trimmed}`;
}

export function getSocialLinkKind(link: string): SocialLinkKind {
  try {
    const url = new URL(formatProfileUrl(link));
    const host = url.hostname.toLowerCase().replace(/^www\./, "");

    if (host.endsWith("github.com")) return "github";
    if (host === "x.com" || host.endsWith(".x.com") || host.endsWith("twitter.com")) return "x";
    if (host.endsWith("instagram.com")) return "instagram";
    if (host.endsWith("linkedin.com")) return "linkedin";
    if (host.endsWith("onlyfans.com")) return "onlyfans";
    if (host.endsWith("tiktok.com")) return "tiktok";
    if (host.endsWith("youtube.com") || host === "youtu.be") return "youtube";
    if (host === "t.me" || host.endsWith("telegram.me") || host.endsWith("telegram.org")) {
      return "telegram";
    }
  } catch {
    return "website";
  }

  return "website";
}
