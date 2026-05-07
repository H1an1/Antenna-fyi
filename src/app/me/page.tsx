"use client";

import Image from "next/image";
import Link from "next/link";
import { EngravedPanel } from "@/app/components/EngravedPanel";
import { createClient } from "@/lib/supabase";
import {
  PROFILE_CONTEXT_MAX_LENGTH,
  PROFILE_LINE_MAX_LENGTH,
  PROFILE_METADATA_KEY,
  createDefaultProfileDraft,
  createProfileSlug,
  limitProfileContext,
  limitProfileLine,
  mergeProfileDraft,
  normalizeProfileSlug,
  normalizeLinks,
  parseProfileContext,
  sanitizeTags,
  serializeProfileContext,
  type ProfileDraft,
} from "@/lib/profile";
import {
  Bell,
  Check,
  Copy,
  ExternalLink,
  KeyRound,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  UserRound,
  WandSparkles,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

interface ApiKey {
  id: number;
  key: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  revoked: boolean;
}

interface ProfileRow {
  device_id: string | null;
  profile_slug: string | null;
  display_name: string | null;
  emoji: string | null;
  line1: string | null;
  line2: string | null;
  line3: string | null;
  matching_context: string | null;
}

type SaveState = "idle" | "saving" | "saved" | "partial";
type GpsState = "idle" | "requesting" | "saved" | "error";
type Language = "en" | "zh";

const mutedText = "text-[#ded2c1]";
const languageStorageKey = "antenna.dashboard.language";
const antennaLogoSrc = "/brand/antenna.svg";
const profileBackVideoSrc = "/profile-assets/ascii-profile-back.mp4";
const mythicFigureSrc = "/profile-assets/ascii-angel-dashboard-crop-tone-transparent.png";
const profileOrnamentSrc = "/profile-assets/wing-signal-ornament.png";

const dashboardCopy = {
  en: {
    apiSettings: "API settings",
    publicProfile: "Public profile",
    signOut: "Sign out",
    dashboard: "Dashboard",
    heroTitle: "Your Antenna dashboard.",
    profile: "Profile",
    apiKeys: "API keys",
    tags: "Tags",
    active: "Active",
    quiet: "Quiet",
    activeLower: "active",
    quietLower: "quiet",
    activeKeys: (count: number) => `${count} active`,
    tagsSet: (count: number) => `${count}/8 set`,
    stepProfileTitle: "Profile card",
    stepProfileBody: "Keep the public lines clear.",
    stepAgentTitle: "Agent connection",
    stepAgentReady: "Your agent key is ready.",
    stepAgentEmpty: "Generate a key to connect an agent.",
    stepLocationTitle: "Location",
    noGps: "No browser GPS update yet.",
    openApiSettings: "Open API settings",
    saveProfile: "Save profile",
    saving: "Saving...",
    saved: "Saved",
    savedLocally: "Saved locally",
    requesting: "Requesting...",
    updated: "Updated",
    updateGps: "Update GPS",
    public: "Public",
    defaultUser: "Antenna user",
    emoji: "Emoji",
    displayName: "Display name",
    publicSlug: "Handle / slug",
    publicSlugHint: "Auto-filled from display name. It stays editable and must be unique.",
    line: (index: number) =>
      [
        "Line 1: who are you?",
        "Line 2: what are you working on?",
        "Line 3: what people or directions interest you?",
      ][index - 1] || `Line ${index}`,
    interestTags: "Interest tags",
    addTagPlaceholder: "Add a tag, then press Enter",
    tagsMax: "8 tags max",
    addInterestTag: "Add interest tag",
    profileBasics: "Basics",
    publicCard: "Public card",
    profileContext: "More information",
    contextBody: "Best written by your AI. Ask it to summarize the context that helps people understand and match with you.",
    contextPlaceholder:
      "Let your AI write this, or add it manually: background, current work, who you want to meet, useful conversation hooks, and anything your AI should remember.",
    showContextPublicly: "Show this on my public profile",
    contextPublicHint: "People can read this on your public profile. Your agent will also use it for matching.",
    contextAgentOnlyHint: "Only your agent can use this for matching. It will not appear on your public profile.",
    contextPending: "More information pending",
    agentCanWriteContext: "Best written by your AI. You can also add it manually.",
    signalDetails: "Signal details",
    status: "Status",
    agentStatus: "AGENT STATUS",
    city: "Country / region",
    cityPlaceholder: "United States",
    link: (index: number) => `Link ${index}`,
    events: "Events",
    matches: "Matches",
    private: "Private",
    agentConnection: "Agent connection",
    keys: "Keys",
    generateKey: "Generate key",
    noActiveKeys: "No active API keys yet.",
    created: "created",
    revoke: "Revoke",
    setupPromptTitle: "Setup prompt",
    copy: "Copy",
    copied: "Copied",
    generateKeyFirst: "Generate a key first.",
    closeApiSettings: "Close API settings",
    failedLoadKeys: "Failed to load API keys.",
    failedGenerateKey: "Failed to generate key.",
    failedRevokeKey: "Failed to revoke key.",
    revokeConfirm: "Revoke this key? Any agent using it will stop working.",
    failedSaveProfile: "Failed to save profile.",
    slugTaken: "This handle is already taken.",
    profileSyncRetry:
      "Profile is editable here. Public profile sync will retry when the profile row is available.",
    profileSyncPartial: "Saved to your account. Public profile sync could not complete yet.",
    geolocationUnavailable: "Geolocation is not available in this browser.",
    gpsPartial: "GPS saved to this account, but the live location write did not complete.",
    locationDenied: "Location permission was not granted.",
    setupPrompt: (name: string, key: string) =>
      [
        `I use Antenna as ${name}.`,
        `My API key is: ${key}`,
        "",
        "Install: npm install -g antenna-fyi",
        `Config: antenna config --key ${key}`,
        "",
        "Keep my Antenna profile current, update GPS when I am at events, scan for high-signal people nearby, and explain every match with one concrete reason.",
      ].join("\n"),
    layer0Connected: "Agent connected",
    layer0NeedsSetup: "Agent not connected",
    todayTitle: "Today",
    todayReadyTitle: "Nothing needs action right now.",
    todayReadyBody: "Matches, event tasks, and agent recommendations will appear here as rows.",
    firstTimeTitle: "Connect your agent first.",
    firstTimeBody: "Antenna only becomes useful after your agent has an API key.",
    getYourKey: "Get your key",
    copyAgentPrompt: "Copy agent prompt",
    profileIncompleteTitle: "Complete your identity card.",
    profileIncompleteBody: "Your agent needs a sharper profile before it can recommend you well.",
    completeProfile: "Complete profile",
    pendingMatches: "pending matches",
    eventTodos: "event todos",
    lastScan: "last scan",
    noScanYet: "No scan yet",
    identityTitle: "Identity card",
    identityBody: "This is what your agent carries into conversations and events.",
    editProfile: "Edit",
    flipBack: "Back",
    flipFront: "Front",
    mythRole: "Hermes",
    mythName: "Hermes",
    mythArchetypeLabel: "Assigned archetype",
    mythReasonOne:
      "A builder-researcher drawn to ambitious people and sharp, warm conversations, this profile echoes Hermes: a messenger who turns curiosity into real-world introductions.",
    mythReasonTwo: "",
    illustrationTitle: "Hermes carries the signal.",
    illustrationBody: "Temporary visual slot for the Greek mythology role that will later be matched from profile content.",
    matchesHeader: "Matches",
    eventsHeader: "Events",
    noPendingMatches: "No pending matches",
    noPendingMatchesReason: "When your agent finds someone worth accepting, the reason and action will live here.",
    noEventTasks: "No event tasks",
    noEventTasksReason: "Check-ins, approvals, and event reminders will show up as action rows.",
    viewAll: "View all",
  },
  zh: {
    apiSettings: "API 设置",
    publicProfile: "公开主页",
    signOut: "退出登录",
    dashboard: "控制台",
    heroTitle: "你的 Antenna 控制台。",
    profile: "主页",
    apiKeys: "API Key",
    tags: "标签",
    active: "活跃",
    quiet: "安静",
    activeLower: "活跃",
    quietLower: "安静",
    activeKeys: (count: number) => `${count} 个可用`,
    tagsSet: (count: number) => `${count}/8 个`,
    stepProfileTitle: "个人名片",
    stepProfileBody: "把公开介绍写清楚。",
    stepAgentTitle: "连接 Agent",
    stepAgentReady: "你的 agent key 已经准备好了。",
    stepAgentEmpty: "生成 key 后连接 agent。",
    stepLocationTitle: "位置",
    noGps: "还没有浏览器 GPS 更新。",
    openApiSettings: "打开 API 设置",
    saveProfile: "保存主页",
    saving: "保存中...",
    saved: "已保存",
    savedLocally: "已保存到账号",
    requesting: "请求中...",
    updated: "已更新",
    updateGps: "更新 GPS",
    public: "公开",
    defaultUser: "Antenna 用户",
    emoji: "Emoji",
    displayName: "显示名称",
    publicSlug: "Handle / slug",
    publicSlugHint: "会根据显示名称自动生成拼音，也可以手动修改；保存时需要唯一。",
    line: (index: number) =>
      [
        "第一行：你是谁？",
        "第二行：你在做什么？",
        "第三行：你对什么人或方向感兴趣？",
      ][index - 1] || `第 ${index} 行`,
    interestTags: "兴趣标签",
    addTagPlaceholder: "输入标签后按 Enter",
    tagsMax: "最多 8 个标签",
    addInterestTag: "添加兴趣标签",
    profileBasics: "基础信息",
    publicCard: "公开名片",
    profileContext: "更多信息",
    contextBody: "这部分最好让你的 AI 来写。让它总结别人理解你、匹配你时最有用的上下文。",
    contextPlaceholder: "让 AI 写，或手动补充：背景、当前项目、想认识的人、适合聊的话题、希望 AI 记住什么。",
    showContextPublicly: "在公开主页展示这段更多信息",
    contextPublicHint: "其他人可以在你的公开主页看到这段内容，agent 也会用于匹配。",
    contextAgentOnlyHint: "这段内容只用于 agent 匹配，不会出现在公开主页。",
    contextPending: "更多信息待填写",
    agentCanWriteContext: "这部分最好让 AI 帮你写；你也可以手动补充。",
    signalDetails: "信号细节",
    status: "状态",
    agentStatus: "AGENT 状态",
    city: "国家/地区",
    cityPlaceholder: "中国",
    link: (index: number) => `链接 ${index}`,
    events: "活动",
    matches: "匹配",
    private: "私密",
    agentConnection: "连接 Agent",
    keys: "密钥",
    generateKey: "生成 Key",
    noActiveKeys: "还没有可用的 API key。",
    created: "创建于",
    revoke: "撤销",
    setupPromptTitle: "给 Agent 的提示词",
    copy: "复制",
    copied: "已复制",
    generateKeyFirst: "先生成一个 key。",
    closeApiSettings: "关闭 API 设置",
    failedLoadKeys: "API keys 加载失败。",
    failedGenerateKey: "Key 生成失败。",
    failedRevokeKey: "Key 撤销失败。",
    revokeConfirm: "确定撤销这个 key 吗？正在使用它的 agent 会停止工作。",
    failedSaveProfile: "主页保存失败。",
    slugTaken: "这个 handle 已经被占用。",
    profileSyncRetry: "这里可以编辑主页。公开主页的数据行可用后会自动重试同步。",
    profileSyncPartial: "已保存到账号，但公开主页暂时没有同步完成。",
    geolocationUnavailable: "当前浏览器不支持定位。",
    gpsPartial: "GPS 已保存到账号，但实时位置写入没有完成。",
    locationDenied: "没有获得位置权限。",
    setupPrompt: (name: string, key: string) =>
      [
        `我用 Antenna，身份是 ${name}。`,
        `我的 API key 是：${key}`,
        "",
        "安装：npm install -g antenna-fyi",
        `配置：antenna config --key ${key}`,
        "",
        "请帮我维护 Antenna profile；在活动现场更新 GPS；扫描附近高信号的人；每次推荐匹配时都给出一个具体理由。",
      ].join("\n"),
    layer0Connected: "Agent 已连接",
    layer0NeedsSetup: "Agent 未连接",
    todayTitle: "今天",
    todayReadyTitle: "现在没有需要处理的事。",
    todayReadyBody: "Match、活动待办和 agent 推荐会以列表行出现在这里。",
    firstTimeTitle: "先连接你的 agent。",
    firstTimeBody: "Antenna 真正可用，是从 agent 拿到 API key 开始的。",
    getYourKey: "获取 Key",
    copyAgentPrompt: "复制 Agent Prompt",
    profileIncompleteTitle: "完善你的身份卡。",
    profileIncompleteBody: "Profile 更清楚，agent 才能更准确地推荐你。",
    completeProfile: "完善 Profile",
    pendingMatches: "待处理匹配",
    eventTodos: "活动待办",
    lastScan: "上次扫描",
    noScanYet: "还没有扫描",
    identityTitle: "身份卡",
    identityBody: "这是你的 agent 在对话和活动现场带出去的名片。",
    editProfile: "编辑",
    flipBack: "背面",
    flipFront: "正面",
    mythRole: "赫尔墨斯",
    mythName: "赫尔墨斯",
    mythArchetypeLabel: "分配的神话原型",
    mythReasonOne:
      "这张 profile 兼具建造与研究的气质，关注有野心的人，也偏好清晰温暖的对话，因此呼应赫尔墨斯：把好奇心转化为真实世界介绍的信使。",
    mythReasonTwo: "",
    illustrationTitle: "赫尔墨斯正在传递信号。",
    illustrationBody: "这里先作为希腊神话角色的视觉位，之后会根据 profile 内容自动匹配角色。",
    matchesHeader: "匹配",
    eventsHeader: "活动",
    noPendingMatches: "没有待处理匹配",
    noPendingMatchesReason: "当你的 agent 发现值得接受的人，推荐理由和操作会出现在这里。",
    noEventTasks: "没有活动待办",
    noEventTasksReason: "签到、审批和活动提醒会以可操作列表出现在这里。",
    viewAll: "查看全部",
  },
} satisfies Record<Language, Record<string, unknown>>;

async function reverseGeocode(lat: number, lng: number, language: Language): Promise<string> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&zoom=12&addressdetails=1`,
      { headers: { "Accept-Language": language === "zh" ? "zh-CN,en" : "en" } },
    );
    const data = await res.json();
    const address = data.address || {};
    const city =
      address.country ||
      address.state ||
      address.city ||
      address.town ||
      address.village ||
      address.county ||
      "";

    return city;
  } catch {
    return "";
  }
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
      {children}
    </label>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
  helper,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxLength?: number;
  helper?: string;
}) {
  const showCount = typeof maxLength === "number" && maxLength > 10;

  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
          {label}
        </label>
        {showCount && (
          <span className="shrink-0 font-mono text-[10px] text-[#d8cab8]/62">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        className="w-full border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888] outline-none transition-colors placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70"
      />
      {helper && <p className="mt-1.5 font-mono text-[10px] leading-relaxed text-[#d8cab8]/72">{helper}</p>}
    </div>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 3,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  maxLength?: number;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between gap-3">
        <label className="block font-mono text-[10px] uppercase tracking-[0.14em] text-[#d8cab8]">
          {label}
        </label>
        {maxLength && (
          <span className="shrink-0 font-mono text-[10px] text-[#d8cab8]/62">
            {value.length}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={maxLength}
        className="w-full resize-none border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm leading-relaxed text-[#A89888] outline-none transition-colors placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70"
      />
    </div>
  );
}

function SignalStrip({ className = "" }: { className?: string }) {
  return (
    <div className={`signal-rule w-16 ${className}`} aria-hidden="true">
      <span className="sr-only">signal divider</span>
    </div>
  );
}

function isDuplicateSlugError(error: { code?: string; message?: string; details?: string } | null) {
  const message = `${error?.message || ""} ${error?.details || ""}`.toLowerCase();
  return error?.code === "23505" || (message.includes("profile_slug") && message.includes("duplicate"));
}

export default function DashboardPage() {
  const [supabase] = useState(() => createClient());
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [tagInput, setTagInput] = useState("");
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileCardFlipped, setProfileCardFlipped] = useState(true);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [language, setLanguage] = useState<Language>(() => {
    if (typeof window === "undefined") return "en";
    const storedLanguage = window.localStorage.getItem(languageStorageKey);
    return storedLanguage === "zh" ? "zh" : "en";
  });
  const router = useRouter();
  const t = dashboardCopy[language];

  const activeKeys = useMemo(() => keys.filter((key) => !key.revoked), [keys]);
  const primaryKey = activeKeys[0] || null;
  const publicHref = profileDraft?.profileSlug ? `/p/${profileDraft.profileSlug}` : null;

  const setupPrompt = useMemo(() => {
    if (!primaryKey || !profileDraft) return null;

    return t.setupPrompt(profileDraft.displayName, primaryKey.key);
  }, [primaryKey, profileDraft, t]);

  const changeLanguage = (nextLanguage: Language) => {
    setLanguage(nextLanguage);
    window.localStorage.setItem(languageStorageKey, nextLanguage);
  };

  const loadKeys = useCallback(async () => {
    const { data, error: rpcErr } = await supabase.rpc("list_api_keys");
    if (rpcErr) {
      setError(t.failedLoadKeys);
      return;
    }
    setKeys(data || []);
  }, [supabase, t.failedLoadKeys]);

  const loadProfile = useCallback(
    async (currentUser: User) => {
      const metadata = currentUser.user_metadata || {};
      const metadataName =
        metadata.display_name ||
        metadata.full_name ||
        metadata.user_name ||
        currentUser.email?.split("@")[0] ||
        "";
      let draft = createDefaultProfileDraft(metadataName, currentUser.email || "", currentUser.id);
      const metadataProfile = metadata[PROFILE_METADATA_KEY] as Partial<ProfileDraft> | undefined;

      if (metadataProfile) {
        draft = mergeProfileDraft(draft, {
          ...metadataProfile,
          links: Array.isArray(metadataProfile.links) ? metadataProfile.links : draft.links,
          interestTags: Array.isArray(metadataProfile.interestTags)
            ? metadataProfile.interestTags
            : draft.interestTags,
        });
      }

      const { data, error: profileErr } = await supabase
        .from("profiles")
        .select("device_id, profile_slug, display_name, emoji, line1, line2, line3, matching_context")
        .eq("user_id", currentUser.id)
        .limit(1)
        .maybeSingle<ProfileRow>();

      if (profileErr) {
        setProfileNotice(t.profileSyncRetry);
      }

      if (data) {
        const context = parseProfileContext(data.matching_context);
        draft = mergeProfileDraft(draft, {
          deviceId: data.device_id || draft.deviceId,
          profileSlug: data.profile_slug || draft.profileSlug,
          displayName: data.display_name || draft.displayName,
          emoji: data.emoji || draft.emoji,
          line1: data.line1 || draft.line1,
          line2: data.line2 || draft.line2,
          line3: data.line3 || draft.line3,
          context: context.context || draft.context,
          showContextPublicly:
            typeof context.showContextPublicly === "boolean"
              ? context.showContextPublicly
              : draft.showContextPublicly,
          interestTags: context.interestTags?.length ? context.interestTags : draft.interestTags,
          city: context.city || draft.city,
          isActive: typeof context.isActive === "boolean" ? context.isActive : draft.isActive,
          links: context.links?.length ? context.links : draft.links,
          lastGps: context.lastGps || draft.lastGps,
        });
      }

      setProfileDraft(draft);
      setSlugManuallyEdited(false);
    },
    [supabase, t.profileSyncRetry],
  );

  useEffect(() => {
    let alive = true;

    supabase.auth.getUser().then(async ({ data }) => {
      if (!alive) return;
      if (!data.user) {
        router.replace("/login");
        return;
      }
      setUser(data.user);
      await Promise.all([loadKeys(), loadProfile(data.user)]);
      if (alive) setLoading(false);
    });

    return () => {
      alive = false;
    };
  }, [loadKeys, loadProfile, router, supabase]);

  const updateDraft = (patch: Partial<ProfileDraft>) => {
    setProfileDraft((current) => {
      if (!current) return current;
      const next = mergeProfileDraft(current, patch);
      if (patch.displayName && !patch.profileSlug && !slugManuallyEdited) {
        return {
          ...next,
          profileSlug: createProfileSlug(patch.displayName, user?.id || current.deviceId),
        };
      }
      return next;
    });
  };

  const copyToClipboard = async (text: string, id: string) => {
    if (!navigator.clipboard) return;
    await navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 1800);
  };

  const generateKey = async () => {
    setError(null);
    const { data, error: rpcErr } = await supabase.rpc("generate_api_key", { p_name: "default" });
    if (rpcErr || data?.error) {
      setError(rpcErr?.message || data?.error || t.failedGenerateKey);
      return;
    }
    await loadKeys();
  };

  const revokeKey = async (id: number) => {
    if (!confirm(t.revokeConfirm)) return;
    setError(null);
    const { error: rpcErr } = await supabase.rpc("revoke_api_key", { p_key_id: id });
    if (rpcErr) {
      setError(t.failedRevokeKey);
      return;
    }
    await loadKeys();
  };

  const saveProfile = async () => {
    if (!user || !profileDraft) return;

    setError(null);
    setProfileNotice(null);
    setSaveState("saving");

    const cleaned = mergeProfileDraft(profileDraft, {
      emoji: profileDraft.emoji.trim() || "✦",
      displayName: profileDraft.displayName.trim() || t.defaultUser,
      line1: limitProfileLine(profileDraft.line1.trim()),
      line2: limitProfileLine(profileDraft.line2.trim()),
      line3: limitProfileLine(profileDraft.line3.trim()),
      context: limitProfileContext(profileDraft.context.trim()),
      showContextPublicly: profileDraft.showContextPublicly,
      city: profileDraft.city.trim(),
      interestTags: sanitizeTags(profileDraft.interestTags),
      links: normalizeLinks(profileDraft.links).concat(["", "", ""]).slice(0, 3),
      profileSlug: createProfileSlug(profileDraft.profileSlug || profileDraft.displayName, user.id),
      deviceId: profileDraft.deviceId || `user:${user.id}`,
    });

    const { data: slugOwner, error: slugLookupErr } = await supabase
      .from("profiles")
      .select("user_id, device_id")
      .eq("profile_slug", cleaned.profileSlug)
      .limit(1)
      .maybeSingle<{ user_id: string | null; device_id: string | null }>();

    if (slugLookupErr) {
      setError(slugLookupErr.message || t.failedSaveProfile);
      setSaveState("idle");
      return;
    }

    if (
      slugOwner &&
      slugOwner.user_id !== user.id &&
      (!slugOwner.device_id || slugOwner.device_id !== cleaned.deviceId)
    ) {
      setError(t.slugTaken);
      setSaveState("idle");
      return;
    }

    const { data: updateData, error: authErr } = await supabase.auth.updateUser({
      data: {
        display_name: cleaned.displayName,
        full_name: cleaned.displayName,
        user_name: cleaned.displayName,
        [PROFILE_METADATA_KEY]: cleaned,
      },
    });

    if (authErr) {
      setError(authErr.message || t.failedSaveProfile);
      setSaveState("idle");
      return;
    }

    if (updateData.user) setUser(updateData.user);

    const profilePayload = {
      device_id: cleaned.deviceId,
      user_id: user.id,
      profile_slug: cleaned.profileSlug,
      display_name: cleaned.displayName,
      emoji: cleaned.emoji,
      line1: cleaned.line1,
      line2: cleaned.line2,
      line3: cleaned.line3,
      matching_context: serializeProfileContext(cleaned),
      visible: true,
    };

    const { data: existingProfile, error: lookupErr } = await supabase
      .from("profiles")
      .select("device_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<{ device_id: string | null }>();

    let profileErr = lookupErr;
    if (!profileErr) {
      if (existingProfile) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update(profilePayload)
          .eq("user_id", user.id);
        profileErr = updateErr;
      } else {
        const { error: insertErr } = await supabase.from("profiles").insert(profilePayload);
        profileErr = insertErr;
      }
    }

    if (profileErr) {
      if (isDuplicateSlugError(profileErr)) {
        setError(t.slugTaken);
        setSaveState("idle");
        return;
      }

      setProfileDraft(cleaned);
      setProfileNotice(t.profileSyncPartial);
      setSaveState("partial");
      return;
    }

    setProfileDraft(cleaned);
    setSaveState("saved");
    setTimeout(() => setSaveState("idle"), 1800);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
  };

  const addTag = () => {
    if (!profileDraft) return;
    const nextTags = sanitizeTags([...profileDraft.interestTags, tagInput]);
    updateDraft({ interestTags: nextTags });
    setTagInput("");
  };

  const updateGps = () => {
    if (!profileDraft || !user) return;
    if (!navigator.geolocation) {
      setGpsState("error");
      setProfileNotice(t.geolocationUnavailable);
      return;
    }

    setGpsState("requesting");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const fLat = Math.round(position.coords.latitude * 1000) / 1000;
        const fLng = Math.round(position.coords.longitude * 1000) / 1000;
        const city = await reverseGeocode(position.coords.latitude, position.coords.longitude, language);
        const nextDraft = mergeProfileDraft(profileDraft, {
          city: city || profileDraft.city,
          lastGps: `${fLat.toFixed(3)}, ${fLng.toFixed(3)} · ${new Date().toLocaleTimeString()}`,
        });

        setProfileDraft(nextDraft);
        await supabase.auth.updateUser({
          data: { [PROFILE_METADATA_KEY]: nextDraft },
        });

        const { error: locationErr } = await supabase.rpc("upsert_profile_location", {
          p_device_id: nextDraft.deviceId || `user:${user.id}`,
          p_lng: fLng,
          p_lat: fLat,
        });

        await supabase.rpc("insert_location_event", {
          p_device_id: nextDraft.deviceId || `user:${user.id}`,
          p_lat: fLat,
          p_lng: fLng,
        });

        if (locationErr) {
          setGpsState("error");
          setProfileNotice(t.gpsPartial);
          return;
        }

        setGpsState("saved");
        setTimeout(() => setGpsState("idle"), 2000);
      },
      () => {
        setGpsState("error");
        setProfileNotice(t.locationDenied);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  if (loading) {
    return (
      <main className="antenna-console-shell antenna-console-loading relative flex min-h-screen items-center justify-start overflow-hidden px-[7vw]">
        <EngravedPanel className="relative z-10 px-5 py-4">
          <p className="font-mono text-sm tracking-[0.16em] text-[#d8cab8]">Loading...</p>
        </EngravedPanel>
      </main>
    );
  }

  if (!user || !profileDraft) return null;

  const saveProfileLabel =
    saveState === "saving"
      ? t.saving
      : saveState === "saved"
        ? t.saved
        : saveState === "partial"
          ? t.savedLocally
          : t.saveProfile;
  const gpsActionLabel =
    gpsState === "requesting"
      ? t.requesting
      : gpsState === "saved"
        ? t.updated
        : t.updateGps;
  const profileStatusLabel = profileDraft.isActive ? t.active : t.quiet;
  const profileStatusPill = profileDraft.isActive ? t.activeLower : t.quietLower;
  const dateLocale = language === "zh" ? "zh-CN" : "en-US";
  const isProfileComplete = Boolean(
    profileDraft.line1.trim() &&
      profileDraft.line2.trim() &&
      profileDraft.line3.trim() &&
      profileDraft.interestTags.length > 0,
  );

  return (
    <main className="antenna-console-shell relative min-h-screen overflow-hidden px-4 py-6 text-[#A89888] md:px-8 md:py-9">
      <div className="console-streaks" aria-hidden="true" />
      <div
        className="dashboard-figure-mobile"
        style={{ backgroundImage: `url(${mythicFigureSrc})` }}
        aria-hidden="true"
      />
      <div className="relative z-10 mx-auto max-w-[1680px]">
        <header className="mb-6">
          <div className="flex flex-col gap-5 px-1 py-2 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0">
              <Link href="/" className="block w-fit" aria-label="Antenna">
                <Image
                  src={antennaLogoSrc}
                  alt="Antenna"
                  width={188}
                  height={60}
                  priority
                  className="antenna-brand-mark h-12 w-auto max-w-[220px]"
                />
              </Link>
              <p className={`mt-2 font-mono text-[10px] uppercase tracking-[0.18em] ${mutedText}`}>
                Personal agent control console
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 lg:justify-end">
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
              <button
                onClick={() => setApiModalOpen(true)}
                className="inline-flex items-center gap-2 border border-[#d7b866]/42 bg-[#d7b866]/10 px-3 py-2 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16"
              >
                <KeyRound size={14} />
                {t.apiSettings}
                <span className="border-l border-[#d7b866]/28 pl-2">{activeKeys.length}</span>
              </button>
              {publicHref && (
                <Link
                  href={publicHref}
                  className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-xs text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                >
                  <ExternalLink size={14} />
                  {t.publicProfile}
                </Link>
              )}
              <button
                onClick={handleSignOut}
                className="border border-[#d7b866]/20 bg-black/10 px-3 py-2 font-mono text-xs text-[#d8cab8] transition-colors hover:text-[#A89888]"
              >
                {t.signOut}
              </button>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-5 border border-red-400/35 bg-red-500/12 px-4 py-3">
            <p className="font-mono text-xs text-red-200">{error}</p>
          </div>
        )}

        {profileNotice && (
          <div className="mb-5 border border-[#d7b866]/40 bg-[#d7b866]/10 px-4 py-3">
            <p className="font-mono text-xs text-[#e0c879]">{profileNotice}</p>
          </div>
        )}

        <div className="dashboard-workbench grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(720px,848px)]">
          <div className="hidden lg:block" aria-hidden="true" />
          <div className="mx-auto w-full max-w-[848px] space-y-6 lg:mx-0 lg:max-w-none">
        <EngravedPanel as="section" className="p-5 backdrop-blur-md md:p-6">
          {!primaryKey ? (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.agentConnection}
                  </p>
                  <SignalStrip />
                </div>
                <h1 className="mt-2 font-serif text-3xl leading-tight text-[#A89888] md:text-4xl">
                  {t.firstTimeTitle}
                </h1>
                <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-[#d8cab8]">
                  {t.firstTimeBody}
                </p>
              </div>
              <button
                onClick={generateKey}
                className="inline-flex items-center justify-center gap-2 border border-[#d7b866]/48 bg-[#d7b866]/12 px-5 py-3 font-mono text-sm text-[#e2c46e] transition-colors hover:bg-[#d7b866]/18"
              >
                <KeyRound size={16} />
                {t.getYourKey}
              </button>
            </div>
          ) : !isProfileComplete ? (
            <div className="grid gap-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                    {t.identityTitle}
                  </p>
                  <SignalStrip />
                </div>
                <h1 className="mt-2 font-serif text-3xl leading-tight text-[#A89888] md:text-4xl">
                  {t.profileIncompleteTitle}
                </h1>
                <p className="mt-2 max-w-2xl font-mono text-sm leading-relaxed text-[#d8cab8]">
                  {t.profileIncompleteBody}
                </p>
              </div>
              <button
                onClick={() => setProfileEditorOpen(true)}
                className="inline-flex items-center justify-center gap-2 border border-[#d7b866]/48 bg-[#d7b866]/12 px-5 py-3 font-mono text-sm text-[#e2c46e] transition-colors hover:bg-[#d7b866]/18"
              >
                <UserRound size={16} />
                {t.completeProfile}
              </button>
            </div>
          ) : (
            <div>
              <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="profile-card-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                      {t.todayTitle}
                    </p>
                    <SignalStrip />
                  </div>
                  <h1 className="mythic-soft-title mt-1 font-serif text-3xl leading-tight md:text-4xl">
                    {t.todayReadyTitle}
                  </h1>
                </div>
                <div className="flex flex-wrap items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#d8cab8]">
                  <span>{t.agentStatus}</span>
                  <span
                    className={`inline-flex items-center gap-1 border px-2.5 py-1 text-[10px] ${
                      primaryKey
                        ? "border-emerald-300/35 bg-emerald-400/7 text-emerald-100"
                        : "border-[#d7b866]/42 bg-[#d7b866]/8 text-[#e2c46e]"
                    }`}
                  >
                    <span className={primaryKey ? "text-emerald-200" : "text-[#e2c46e]"}>●</span>
                    {primaryKey ? t.layer0Connected : t.layer0NeedsSetup}
                  </span>
                </div>
              </div>
              <EngravedPanel quiet className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-[#e2c46e]">
                    <Bell size={16} />
                  </span>
                  <div>
                    <p className="font-mono text-sm text-[#A89888]">{t.todayReadyTitle}</p>
                    <p className="mt-1 font-mono text-xs leading-relaxed text-[#d8cab8]">
                      {t.todayReadyBody}
                    </p>
                  </div>
                </div>
                <button
                  onClick={updateGps}
                  disabled={gpsState === "requesting"}
                  className="inline-flex w-fit shrink-0 items-center gap-1.5 border border-[#d7b866]/24 px-2.5 py-1.5 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/50 hover:text-[#e2c46e] disabled:opacity-50"
                >
                  <RefreshCw size={14} className={gpsState === "requesting" ? "animate-spin" : ""} />
                  {gpsActionLabel}
                </button>
              </EngravedPanel>
            </div>
          )}
        </EngravedPanel>

        <section>
          <div
            className={`profile-dashboard-grid ${
              profileEditorOpen ? "profile-dashboard-grid-editing" : ""
            }`}
          >
            <div className="profile-card-scene self-start">
              <div className={`profile-card-flipper ${profileCardFlipped ? "is-flipped" : ""}`}>
                <EngravedPanel quiet className="profile-card-face profile-summary-card p-5">
                  <div className="profile-card-ornament" aria-hidden="true">
                    <Image
                      src={profileOrnamentSrc}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 280px, 340px"
                      className="object-contain"
                    />
                  </div>
                  <div className="profile-card-chart-bg" aria-hidden="true" />
                  <div className="profile-card-titlebar mb-4 flex items-center justify-between gap-2 border-b border-[#d7b866]/14 pb-2.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                      IDENTITY://PUBLIC
                    </p>
                    <div className="flex shrink-0 items-center justify-end gap-1.5">
                      <button
                        onClick={() => setProfileCardFlipped(true)}
                        className="profile-card-action-button inline-flex items-center justify-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                        aria-label={t.flipBack}
                      >
                        <RefreshCw size={14} className="shrink-0" />
                        <span className="profile-card-action-label">{t.flipBack}</span>
                      </button>
                      {!profileEditorOpen && (
                        <button
                          onClick={() => {
                            setProfileCardFlipped(false);
                            setProfileEditorOpen(true);
                          }}
                          className="profile-card-action-button inline-flex items-center justify-center gap-2 border border-[#d7b866]/24 bg-black/10 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                          aria-label={t.editProfile}
                        >
                          <WandSparkles size={14} className="shrink-0" />
                          <span className="profile-card-action-label">{t.editProfile}</span>
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="profile-card-identity mb-4 flex items-end justify-between gap-4">
                    <div>
                      <div className="profile-card-avatar text-4xl leading-none">{profileDraft.emoji || "✦"}</div>
                      <h2 className="profile-card-name mythic-soft-title mt-3 font-serif text-3xl leading-tight">
                        {profileDraft.displayName || t.defaultUser}
                      </h2>
                    </div>
                    <span
                      className={`profile-card-status mb-1 shrink-0 border bg-black/18 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.12em] ${
                        profileDraft.isActive
                          ? "border-emerald-300/35 text-emerald-100"
                          : "border-red-300/35 text-red-100"
                      }`}
                    >
                      {profileStatusPill}
                    </span>
                  </div>

                  <div className="profile-card-lines space-y-2.5 border-y border-[#d7b866]/16 py-3">
                    {[profileDraft.line1, profileDraft.line2, profileDraft.line3].map((line, index) => (
                      <p
                        key={index}
                        className="profile-card-line font-mono text-[#A89888]"
                      >
                        {line || t.line(index + 1)}
                      </p>
                    ))}
                  </div>

                  <div className="profile-card-meta mt-4 space-y-3">
                    {profileDraft.city && (
                      <p className="profile-card-location flex min-w-0 items-center gap-2 font-mono text-xs text-[#d8cab8]">
                        <MapPin size={14} className="shrink-0" />
                        <span className="truncate">{profileDraft.city}</span>
                      </p>
                    )}
                    <div className="profile-card-tags flex flex-wrap gap-2">
                      {profileDraft.interestTags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="profile-card-tag border border-[#d7b866]/20 bg-[#d7b866]/8 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8]"
                        >
                          {tag}
                        </span>
                      ))}
                      {profileDraft.interestTags.length > 3 && (
                        <span className="profile-card-tag border border-[#d7b866]/14 bg-black/10 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8]/72">
                          +{profileDraft.interestTags.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </EngravedPanel>

                <EngravedPanel className="profile-card-face profile-card-back bg-black p-5">
                  <video
                    className="profile-card-video"
                    src={profileBackVideoSrc}
                    autoPlay
                    loop
                    muted
                    playsInline
                  />
                  <div className="profile-card-back-gradient" aria-hidden="true" />
                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="flex items-center justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                      <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                        MYTH://{t.mythRole}
                      </p>
                      <button
                        onClick={() => setProfileCardFlipped(false)}
                        className="inline-flex items-center gap-2 border border-[#d7b866]/24 bg-black/20 px-3 py-2 font-mono text-[11px] text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                      >
                        <RefreshCw size={14} />
                        {t.flipFront}
                      </button>
                    </div>
                    <div className="space-y-4 pt-6">
                      <div>
                        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#e2c46e]">
                          {t.mythArchetypeLabel}
                        </p>
                        <h3 className="mythic-soft-title mt-2 font-serif text-4xl leading-none">
                          {t.mythName}
                        </h3>
                      </div>
                      <div className="border-t border-[#d7b866]/18 pt-4">
                        <p className="font-mono text-xs leading-relaxed text-[#FEF1E1]">
                          {t.mythReasonOne}
                        </p>
                      </div>
                    </div>
                  </div>
                </EngravedPanel>
              </div>
            </div>

            {profileEditorOpen ? (
              <div className="space-y-5">
                <EngravedPanel quiet className="space-y-4 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
                    {t.publicCard}
                  </p>
                  <div className="grid gap-4 md:grid-cols-[80px_1fr_1fr]">
                    <TextInput
                      label={t.emoji}
                      value={profileDraft.emoji}
                      onChange={(value) => updateDraft({ emoji: value.slice(0, 2) })}
                      maxLength={2}
                    />
                    <TextInput
                      label={t.displayName}
                      value={profileDraft.displayName}
                      onChange={(value) => updateDraft({ displayName: value })}
                    />
                    <TextInput
                      label={t.publicSlug}
                      value={profileDraft.profileSlug}
                      onChange={(value) => {
                        setSlugManuallyEdited(true);
                        updateDraft({ profileSlug: normalizeProfileSlug(value) });
                      }}
                      helper={t.publicSlugHint}
                    />
                  </div>
                  <div className="space-y-4 border-t border-[#d7b866]/12 pt-4">
                    <TextInput
                      label={t.line(1)}
                      value={profileDraft.line1}
                      onChange={(value) => updateDraft({ line1: limitProfileLine(value) })}
                      maxLength={PROFILE_LINE_MAX_LENGTH}
                    />
                    <TextInput
                      label={t.line(2)}
                      value={profileDraft.line2}
                      onChange={(value) => updateDraft({ line2: limitProfileLine(value) })}
                      maxLength={PROFILE_LINE_MAX_LENGTH}
                    />
                    <TextInput
                      label={t.line(3)}
                      value={profileDraft.line3}
                      onChange={(value) => updateDraft({ line3: limitProfileLine(value) })}
                      maxLength={PROFILE_LINE_MAX_LENGTH}
                    />
                  </div>

                  <div>
                    <FieldLabel>{t.interestTags}</FieldLabel>
                    <div className="mb-2 flex flex-wrap gap-2">
                      {profileDraft.interestTags.map((tag) => (
                        <button
                          key={tag}
                          onClick={() =>
                            updateDraft({
                              interestTags: profileDraft.interestTags.filter((item) => item !== tag),
                            })
                          }
                          className="inline-flex items-center gap-1 border border-[#d7b866]/20 bg-[#d7b866]/8 px-2.5 py-1 font-mono text-[10px] text-[#d8cab8] transition-colors hover:border-red-300/45 hover:text-red-200"
                        >
                          {tag}
                          <X size={12} />
                        </button>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input
                        value={tagInput}
                        onChange={(event) => setTagInput(event.target.value)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === ",") {
                            event.preventDefault();
                            addTag();
                          }
                        }}
                        disabled={profileDraft.interestTags.length >= 8}
                        placeholder={
                          profileDraft.interestTags.length >= 8
                            ? t.tagsMax
                            : t.addTagPlaceholder
                        }
                        className="min-w-0 flex-1 border border-[#d7b866]/24 bg-[#070807]/70 px-3 py-2.5 font-mono text-sm text-[#A89888] outline-none placeholder:text-[#d8cab8]/48 focus:border-[#e2c46e]/70 disabled:opacity-50"
                      />
                      <button
                        onClick={addTag}
                        disabled={!tagInput.trim() || profileDraft.interestTags.length >= 8}
                        className="inline-flex items-center justify-center border border-[#d7b866]/40 px-3 text-[#e2c46e] transition-colors hover:bg-[#d7b866]/12 disabled:opacity-40"
                        aria-label={t.addInterestTag}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </EngravedPanel>

                <EngravedPanel quiet className="space-y-4 p-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
                    {t.signalDetails}
                  </p>
                  <div className="grid gap-4 md:grid-cols-[1fr_180px]">
                    <TextInput
                      label={t.city}
                      value={profileDraft.city}
                      onChange={(value) => updateDraft({ city: value })}
                      placeholder={t.cityPlaceholder}
                    />
                    <div>
                      <FieldLabel>{t.status}</FieldLabel>
                      <button
                        onClick={() => updateDraft({ isActive: !profileDraft.isActive })}
                        className={`h-[42px] w-full border px-3 font-mono text-xs transition-colors ${
                          profileDraft.isActive
                            ? "border-emerald-300/35 text-emerald-200 hover:bg-emerald-400/8"
                            : "border-red-300/35 text-red-200 hover:bg-red-400/8"
                        }`}
                      >
                        {profileStatusLabel}
                      </button>
                    </div>
                  </div>
                  <div className="grid gap-4 md:grid-cols-3">
                    {[0, 1, 2].map((index) => (
                      <TextInput
                        key={index}
                        label={t.link(index + 1)}
                        value={profileDraft.links[index] || ""}
                        onChange={(value) => {
                          const links = [...profileDraft.links];
                          links[index] = value;
                          updateDraft({ links });
                        }}
                        placeholder="https://..."
                      />
                    ))}
                  </div>
                </EngravedPanel>

                <EngravedPanel quiet className="space-y-4 p-4">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[#e2c46e]">
                      {t.profileContext}
                    </p>
                    <p className="mt-1 font-mono text-[11px] leading-relaxed text-[#d8cab8]">
                      {t.contextBody}
                    </p>
                  </div>
                  <TextArea
                    label={t.profileContext}
                    value={profileDraft.context}
                    onChange={(value) => updateDraft({ context: limitProfileContext(value) })}
                    placeholder={t.contextPlaceholder}
                    rows={6}
                    maxLength={PROFILE_CONTEXT_MAX_LENGTH}
                  />
                  <label className="flex cursor-pointer items-start gap-3 border border-[#d7b866]/18 bg-black/10 p-3 transition-colors hover:border-[#d7b866]/34">
                    <input
                      type="checkbox"
                      checked={profileDraft.showContextPublicly}
                      onChange={(event) =>
                        updateDraft({ showContextPublicly: event.target.checked })
                      }
                      className="mt-0.5 h-4 w-4 shrink-0 accent-[#d7b866]"
                    />
                    <span className="min-w-0">
                      <span className="block font-mono text-xs text-[#A89888]">
                        {t.showContextPublicly}
                      </span>
                      <span className="mt-1 block font-mono text-[11px] leading-relaxed text-[#d8cab8]">
                        {profileDraft.showContextPublicly
                          ? t.contextPublicHint
                          : t.contextAgentOnlyHint}
                      </span>
                    </span>
                  </label>
                </EngravedPanel>

                <div className="flex justify-end border-t border-[#d7b866]/16 pt-5">
                  <button
                    onClick={saveProfile}
                    disabled={saveState === "saving"}
                    className="inline-flex w-fit items-center gap-2 border border-[#d7b866]/44 bg-[#d7b866]/10 px-4 py-2.5 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16 disabled:opacity-50"
                  >
                    {saveState === "saved" ? <Check size={15} /> : <Save size={15} />}
                    {saveProfileLabel}
                  </button>
                </div>
              </div>
            ) : (
              <div className="dashboard-side-stack flex h-full min-h-0 flex-col gap-4">
                <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
                  <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                    <div className="flex items-center gap-3">
                      <p className="dashboard-side-kicker font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                        {t.matchesHeader}
                      </p>
                      <SignalStrip />
                    </div>
                    <button className="font-mono text-xs text-[#d8cab8] transition-colors hover:text-[#e2c46e]">
                      {t.viewAll}
                    </button>
                  </div>
                  <div className="dashboard-side-body pt-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="dashboard-side-empty-title mythic-soft-title font-serif text-xl leading-tight">
                          {t.noPendingMatches}
                        </p>
                        <SignalStrip className="hidden sm:flex" />
                      </div>
                      <p className="dashboard-side-empty-copy mt-2 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                        {t.noPendingMatchesReason}
                      </p>
                    </div>
                  </div>
                </EngravedPanel>

                <EngravedPanel quiet className="dashboard-side-card flex-1 p-5">
                  <div className="dashboard-side-header mb-4 flex items-start justify-between gap-3 border-b border-[#d7b866]/14 pb-3">
                    <div className="flex items-center gap-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                        {t.eventsHeader}
                      </p>
                      <SignalStrip />
                    </div>
                    <button className="font-mono text-xs text-[#d8cab8] transition-colors hover:text-[#e2c46e]">
                      {t.viewAll}
                    </button>
                  </div>
                  <div className="dashboard-side-body pt-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-3">
                        <p className="dashboard-side-empty-title mythic-soft-title font-serif text-xl leading-tight">
                          {t.noEventTasks}
                        </p>
                        <SignalStrip className="hidden sm:flex" />
                      </div>
                      <p className="dashboard-side-empty-copy mt-2 font-mono text-[0.875rem] leading-[1.7] text-[#A89888]">
                        {t.noEventTasksReason}
                      </p>
                    </div>
                  </div>
                </EngravedPanel>
              </div>
            )}
          </div>
        </section>
          </div>
        </div>

        {apiModalOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/70 px-4 py-10 backdrop-blur-sm">
            <EngravedPanel className="w-full max-w-2xl shadow-2xl">
              <div className="flex items-start justify-between gap-4 border-b border-[#d7b866]/16 p-5">
                <div>
                  <div className="flex items-center gap-3">
                    <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#e2c46e]">
                      {t.agentConnection}
                    </p>
                    <SignalStrip />
                  </div>
                  <h2 className="mt-1 font-serif text-2xl text-[#A89888]">{t.apiSettings}</h2>
                </div>
                <button
                  onClick={() => setApiModalOpen(false)}
                  className="text-[#d8cab8] transition-colors hover:text-[#A89888]"
                  aria-label={t.closeApiSettings}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-5 p-5">
                <EngravedPanel as="section" quiet className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-mono text-sm text-[#A89888]">{t.keys}</h3>
                    <button
                      onClick={generateKey}
                      className="inline-flex items-center gap-2 border border-[#d7b866]/40 bg-[#d7b866]/10 px-3 py-2 font-mono text-xs text-[#e2c46e] transition-colors hover:bg-[#d7b866]/16"
                    >
                      <Plus size={14} />
                      {t.generateKey}
                    </button>
                  </div>

                  {activeKeys.length === 0 ? (
                    <div className="border border-dashed border-[#d7b866]/24 bg-[#070807]/44 p-4">
                      <p className="font-mono text-sm text-[#A89888]">{t.noActiveKeys}</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeKeys.map((key) => (
                        <div key={key.id} className="border border-[#d7b866]/18 bg-[#070807]/48 p-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <p className="break-all font-mono text-sm text-[#A89888]">
                                {key.key.slice(0, 10)}...{key.key.slice(-4)}
                              </p>
                              <p className="mt-1 font-mono text-[10px] text-[#d8cab8]">
                                {key.name} · {t.created}{" "}
                                {new Date(key.created_at).toLocaleDateString(dateLocale)}
                              </p>
                            </div>
                            <button
                              onClick={() => copyToClipboard(key.key, key.key)}
                              className="text-[#d8cab8] transition-colors hover:text-[#e2c46e]"
                              aria-label={t.copy}
                            >
                              {copied === key.key ? <Check size={16} /> : <Copy size={16} />}
                            </button>
                          </div>
                          <button
                            onClick={() => revokeKey(key.id)}
                            className="mt-3 font-mono text-[11px] text-red-200 transition-colors hover:text-red-100"
                          >
                            {t.revoke}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </EngravedPanel>

                <EngravedPanel as="section" quiet className="p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="font-mono text-sm text-[#A89888]">{t.setupPromptTitle}</h3>
                    {setupPrompt && (
                      <button
                        onClick={() => copyToClipboard(setupPrompt, "setup")}
                        className="inline-flex items-center gap-2 border border-[#d7b866]/24 px-3 py-2 font-mono text-xs text-[#A89888] transition-colors hover:border-[#d7b866]/48 hover:text-[#e2c46e]"
                      >
                        {copied === "setup" ? <Check size={14} /> : <Copy size={14} />}
                        {copied === "setup" ? t.copied : t.copy}
                      </button>
                    )}
                  </div>
                  {setupPrompt ? (
                    <pre className="max-h-48 overflow-auto border border-[#d7b866]/18 bg-[#070807]/70 p-3 font-mono text-[11px] leading-relaxed text-[#d8cab8]">
                      {setupPrompt}
                    </pre>
                  ) : (
                    <p className="font-mono text-sm leading-relaxed text-[#d8cab8]">
                      {t.generateKeyFirst}
                    </p>
                  )}
                </EngravedPanel>
              </div>
            </EngravedPanel>
          </div>
        )}
      </div>
    </main>
  );
}
