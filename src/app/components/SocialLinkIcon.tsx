import Image from "next/image";
import {
  getSocialLinkKind,
  socialLinkIcons,
  socialLinkLabels,
  type SocialLinkKind,
} from "@/lib/social-links";

export function SocialLinkIcon({
  link,
  kind,
  size = 24,
  className = "",
}: {
  link?: string;
  kind?: SocialLinkKind;
  size?: number;
  className?: string;
}) {
  const resolvedKind = kind || getSocialLinkKind(link || "");

  return (
    <span
      className={`social-link-icon relative inline-flex shrink-0 items-center justify-center ${className}`}
      style={{ width: size, height: size }}
      title={socialLinkLabels[resolvedKind]}
      aria-hidden="true"
    >
      <Image
        src={socialLinkIcons[resolvedKind]}
        alt=""
        fill
        sizes={`${size}px`}
        className="object-contain"
      />
    </span>
  );
}
