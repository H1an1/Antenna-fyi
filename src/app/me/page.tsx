"use client";

import Image from "next/image";
import Link from "next/link";
import { EngravedPanel } from "@/app/components/EngravedPanel";
import { useSupabase } from "@/lib/useSupabase";
import {
  PROFILE_METADATA_KEY,
  createDefaultProfileDraft,
  createProfileSlug,
  limitProfileConversation,
  limitProfileContext,
  limitProfileDescription,
  limitProfileLookingFor,
  mergeProfileDraft,
  normalizeLinks,
  parseProfileContext,
  sanitizeTags,
  serializeProfileContext,
  type ProfileDraft,
} from "@/lib/profile";
import { matchArchetype } from "@/lib/archetype";
import { ExternalLink, KeyRound } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

import { ProfileCard } from "./components/ProfileCard";
import { ProfileEditor } from "./components/ProfileEditor";
import { ApiKeyModal } from "./components/ApiKeyModal";
import { TodaySection } from "./components/TodaySection";

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
const mythicFigureSrc = "/profile-assets/ascii-angel-dashboard-crop-tone-transparent.png";

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
        "Personal description",
        "Looking for",
        "Our conversation",
      ][index - 1] || `Line ${index}`,
    interestTags: "Interest tags",
    addTagPlaceholder: "Add a tag, then press Enter",
    tagsMax: "8 tags max",
    addInterestTag: "Add interest tag",
    profileBasics: "Basics",
    publicCard: "Public card",
    profileContext: "More information",
    contextBody:
      "Best written by your AI. This gives your agent richer private context for matching.",
    contextPlaceholder:
      "Let your AI write this, or add it manually: background, current work, useful context, private matching notes, and anything your AI should remember.",
    showContextPublicly: "Show this on my public profile",
    contextPublicHint: "People can read this on your public profile. Your agent will also use it for matching.",
    contextAgentOnlyHint:
      "This is agent-only context. It helps your agent match you better and will not be shown to humans.",
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
    setupPromptTitle: "Setup command",
    copy: "Copy",
    copied: "Copied",
    generateKeyFirst: "Generate a key first.",
    setupHint: "Run this in your terminal or tell your agent. Behavior instructions are included in the Antenna skill file automatically.",
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
      `npm install -g antenna-fyi`,
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
    mythArchetypeLabel: "Assigned archetype",
    backPlaceholderTitle: "Your archetype awaits.",
    backPlaceholderBody: "Complete your profile and the system will assign your mythic archetype.",
    emptyStateTitle: "This is your identity card.",
    emptyStateBody: "Tell us who you are, what you're looking for, and how you want to connect.",
    emptyStateCta: "Set up your card",
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
        "个人描述",
        "想认识的人",
        "想要的交流方式",
      ][index - 1] || `第 ${index} 行`,
    interestTags: "兴趣标签",
    addTagPlaceholder: "输入标签后按 Enter",
    tagsMax: "最多 8 个标签",
    addInterestTag: "添加兴趣标签",
    profileBasics: "基础信息",
    publicCard: "公开名片",
    profileContext: "更多信息",
    contextBody: "这部分最好让你的 AI 来写，用来给 agent 更完整的私密匹配上下文。",
    contextPlaceholder: "让 AI 写，或手动补充：背景、当前项目、隐含偏好、匹配线索、希望 AI 记住什么。",
    showContextPublicly: "在公开主页展示这段更多信息",
    contextPublicHint: "其他人可以在你的公开主页看到这段内容，agent 也会用于匹配。",
    contextAgentOnlyHint: "这段内容只用于 agent 匹配，帮助它更准确地理解你，不会展示给人类。",
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
    setupPromptTitle: "安装命令",
    copy: "复制",
    copied: "已复制",
    generateKeyFirst: "先生成一个 key。",
    setupHint: "在终端运行这行命令，或让你的 agent 执行。行为指令已经包含在 Antenna skill 文件里，不需要额外粘贴。",
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
      `npm install -g antenna-fyi`,
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
    mythArchetypeLabel: "分配的神话原型",
    backPlaceholderTitle: "你的原型正在等待。",
    backPlaceholderBody: "填完个人信息后，系统会根据你的 profile 分配专属形象。",
    emptyStateTitle: "这是你的身份卡片。",
    emptyStateBody: "告诉我们你是谁、想认识什么人、想要什么样的交流。",
    emptyStateCta: "开始填写",
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
  const supabase = useSupabase();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [profileDraft, setProfileDraft] = useState<ProfileDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [profileNotice, setProfileNotice] = useState<string | null>(null);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [gpsState, setGpsState] = useState<GpsState>("idle");
  const [tagInput, setTagInput] = useState("");
  const [apiModalOpen, setApiModalOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileCardFlipped, setProfileCardFlipped] = useState(false);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [pendingMatches, setPendingMatches] = useState<Record<string, unknown>[]>([]);
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

  const archetypeMatch = useMemo(() => {
    if (!profileDraft) return { primary: "Hermes" as const, secondary: null, reason: "" };
    return matchArchetype(profileDraft);
  }, [profileDraft]);

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
          archetypeOverride: context.archetypeOverride || draft.archetypeOverride,
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

  // --- Realtime matches subscription ---
  useEffect(() => {
    if (!profileDraft?.deviceId) return;
    const deviceId = profileDraft.deviceId;

    const channel = supabase
      .channel('matches-realtime')
      .on(
        'postgres_changes' as never,
        { event: '*', schema: 'public', table: 'matches' },
        (payload: { new?: Record<string, unknown>; old?: Record<string, unknown>; eventType?: string }) => {
          const row = payload.new || payload.old;
          if (!row) return;
          if (row.device_id_a !== deviceId && row.device_id_b !== deviceId) return;

          setPendingMatches((prev) => {
            const id = row.id as string | number;
            const existing = prev.findIndex((m) => m.id === id);
            if (existing >= 0) {
              const next = [...prev];
              next[existing] = row;
              return next;
            }
            return [...prev, row];
          });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, profileDraft?.deviceId]);

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

  const checkSlugAvailability = useCallback(
    async (slug: string): Promise<boolean> => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, device_id")
        .eq("profile_slug", slug)
        .limit(1)
        .maybeSingle();

      return !data || data.user_id === user?.id;
    },
    [supabase, user?.id],
  );

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
      line1: limitProfileDescription(profileDraft.line1.trim()),
      line2: limitProfileLookingFor(profileDraft.line2.trim()),
      line3: limitProfileConversation(profileDraft.line3.trim()),
      context: limitProfileContext(profileDraft.context.trim()),
      showContextPublicly: false,
      city: profileDraft.city.trim(),
      interestTags: sanitizeTags(profileDraft.interestTags),
      links: normalizeLinks(profileDraft.links).concat(["", "", ""]).slice(0, 3),
      profileSlug: createProfileSlug(profileDraft.profileSlug || profileDraft.displayName, user.id),
      deviceId: profileDraft.deviceId || `user:${user.id}`,
    });

    // Slug uniqueness is handled by the RPC (first save) or DB constraint (updates).

    // Use save_user_profile RPC (SECURITY DEFINER) for initial create/bind,
    // then RLS-based direct updates once user_id is set.
    const { data: existingProfile, error: lookupErr } = await supabase
      .from("profiles")
      .select("device_id")
      .eq("user_id", user.id)
      .limit(1)
      .maybeSingle<{ device_id: string | null }>();

    if (lookupErr) {
      setError(lookupErr.message || t.failedSaveProfile);
      setSaveState("idle");
      return;
    }

    let profileErr: { message: string; code?: string } | null = null;

    if (existingProfile) {
      // Row already bound to this user — direct RLS update
      const { error: updateErr } = await supabase
        .from("profiles")
        .update({
          display_name: cleaned.displayName,
          emoji: cleaned.emoji,
          line1: cleaned.line1,
          line2: cleaned.line2,
          line3: cleaned.line3,
          profile_slug: cleaned.profileSlug,
          matching_context: serializeProfileContext(cleaned),
          visible: true,
        })
        .eq("user_id", user.id);
      profileErr = updateErr;
    } else {
      // First save — use RPC to create/bind row (bypasses RLS)
      const { data: rpcResult, error: rpcErr } = await supabase.rpc("save_user_profile", {
        p_display_name: cleaned.displayName,
        p_emoji: cleaned.emoji,
        p_line1: cleaned.line1,
        p_line2: cleaned.line2,
        p_line3: cleaned.line3,
        p_profile_slug: cleaned.profileSlug,
        p_matching_context: serializeProfileContext(cleaned),
        p_visible: true,
      });
      if (rpcErr) {
        profileErr = rpcErr;
      } else if (rpcResult?.error === "slug_taken") {
        setError(t.slugTaken);
        setSaveState("idle");
        return;
      } else if (rpcResult?.error) {
        profileErr = { message: rpcResult.error };
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

    // Only on success of profiles write, update auth metadata.
    const { data: updateData, error: authErr } = await supabase.auth.updateUser({
      data: {
        display_name: cleaned.displayName,
        full_name: cleaned.displayName,
        user_name: cleaned.displayName,
        [PROFILE_METADATA_KEY]: cleaned,
      },
    });

    if (authErr) {
      // Profile row saved but auth metadata failed — partial success.
      setProfileDraft(cleaned);
      setProfileNotice(t.profileSyncPartial);
      setSaveState("partial");
      return;
    }

    if (updateData.user) setUser(updateData.user);

    setProfileDraft(cleaned);
    setSaveState("saved");
    setProfileEditorOpen(false);
    setTimeout(() => setSaveState("idle"), 1800);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/login");
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
        // Fix GPS privacy: use rounded coordinates (3 decimal places) for BOTH geocode AND DB write.
        const fLat = Math.round(position.coords.latitude * 1000) / 1000;
        const fLng = Math.round(position.coords.longitude * 1000) / 1000;
        const city = await reverseGeocode(fLat, fLng, language);
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

  const gpsActionLabel =
    gpsState === "requesting"
      ? t.requesting
      : gpsState === "saved"
        ? t.updated
        : t.updateGps;
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
      <div className="dashboard-canvas">
        <div
          className="dashboard-figure-mobile"
          style={{ backgroundImage: `url(${mythicFigureSrc})` }}
          aria-hidden="true"
        />
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

        <div className="dashboard-workbench grid gap-6">
          <div className="dashboard-workbench-spacer" aria-hidden="true" />
          <div className="dashboard-panel-column mx-auto w-full max-w-[848px] space-y-6 lg:mx-0 lg:max-w-none">
            <TodaySection
              hasKey={!!primaryKey}
              isProfileComplete={isProfileComplete}
              gpsState={gpsState}
              gpsActionLabel={gpsActionLabel}
              onGenerateKey={() => setApiModalOpen(true)}
              onCompleteProfile={() => setProfileEditorOpen(true)}
              onUpdateGps={updateGps}
              t={t}
            />

            <section>
              <div
                className={`profile-dashboard-grid ${
                  profileEditorOpen ? "profile-dashboard-grid-editing" : ""
                }`}
              >
                <ProfileCard
                  profileDraft={profileDraft}
                  archetypeMatch={archetypeMatch}
                  isFlipped={profileCardFlipped}
                  onFlip={(flipped) => setProfileCardFlipped(flipped)}
                  onEdit={() => {
                    setProfileCardFlipped(false);
                    setProfileEditorOpen(true);
                  }}
                  showEditButton={!profileEditorOpen}
                  t={t}
                  statusPill={profileStatusPill}
                  isActive={profileDraft.isActive}
                />

                {profileEditorOpen ? (
                  <ProfileEditor
                    profileDraft={profileDraft}
                    updateDraft={updateDraft}
                    saveProfile={saveProfile}
                    saveState={saveState}
                    setSlugManuallyEdited={setSlugManuallyEdited}
                    checkSlugAvailability={checkSlugAvailability}
                    t={t}
                    tagInput={tagInput}
                    setTagInput={setTagInput}
                  />
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

        <ApiKeyModal
          open={apiModalOpen}
          onClose={() => setApiModalOpen(false)}
          activeKeys={activeKeys}
          setupPrompt={setupPrompt}
          generateKey={generateKey}
          revokeKey={revokeKey}
          dateLocale={dateLocale}
          t={t}
        />
      </div>
    </main>
  );
}
