import type { ProfileDraft } from "@/lib/profile";

/**
 * The 10 Greek myth archetype roles used for profile card matching.
 */
export type ArchetypeRole =
  | "Athena"
  | "Hermes"
  | "Prometheus"
  | "Apollo"
  | "Artemis"
  | "Aphrodite"
  | "Dionysus"
  | "Hades"
  | "Persephone"
  | "Odysseus";

export interface ArchetypeMatch {
  primary: ArchetypeRole;
  secondary: ArchetypeRole | null;
  reason: string;
  reasonZh: string;
}

interface ArchetypeRule {
  role: ArchetypeRole;
  /** Keywords matched against line1, line2, line3, interestTags, and context. */
  keywords: string[];
  /** Short description used when this role is primary (English). */
  reasonTemplate: string;
  /** Short description used when this role is primary (Chinese). */
  reasonTemplateZh: string;
}

const archetypeRules: ArchetypeRule[] = [
  {
    role: "Prometheus",
    keywords: [
      "ai", "agent", "llm", "automation", "founder", "startup", "build", "infra",
      "frontier", "open source", "developer", "hacker", "rebellion", "tools",
      "智能体", "创业", "开发", "自动化", "基础设施",
    ],
    reasonTemplate:
      "A frontier builder bringing new tools into the world — Prometheus carries fire to those who need it.",
    reasonTemplateZh:
      "前沿的建造者，把新工具带到这个世界——普罗米修斯为需要的人盗取火种。",
  },
  {
    role: "Athena",
    keywords: [
      "product", "strategy", "research", "design", "craft", "judgment", "leadership",
      "pm", "product manager", "ux", "user experience", "decision",
      "产品", "策略", "研究", "设计", "用研",
    ],
    reasonTemplate:
      "Strategic creator with clear judgment and craft — Athena builds with wisdom.",
    reasonTemplateZh:
      "有清晰判断力和手艺的策略创造者——雅典娜以智慧建造。",
  },
  {
    role: "Hermes",
    keywords: [
      "network", "connect", "introduction", "community", "social", "commerce",
      "messenger", "routing", "conversation", "bridge",
      "社交", "连接", "社区", "介绍", "网络",
    ],
    reasonTemplate:
      "A connector who turns curiosity into real-world introductions — Hermes carries the signal.",
    reasonTemplateZh:
      "把好奇心变成真实连接的人——赫尔墨斯传递信号。",
  },
  {
    role: "Apollo",
    keywords: [
      "taste", "music", "media", "content", "curator", "clarity", "aesthetic",
      "expression", "signal", "creator", "writing",
      "品味", "内容", "创作", "媒体", "审美",
    ],
    reasonTemplate:
      "Radiant curator of signal and taste — Apollo brings clarity to public expression.",
    reasonTemplateZh:
      "品味与信号的策展人——阿波罗为公共表达带来清晰。",
  },
  {
    role: "Artemis",
    keywords: [
      "independent", "autonomy", "explore", "health", "outdoor", "freelance",
      "scout", "solo", "rare", "boundary", "focus",
      "独立", "探索", "自由职业", "健康",
    ],
    reasonTemplate:
      "An independent scout protecting their focus — Artemis navigates their own path.",
    reasonTemplateZh:
      "独立的探索者，守护自己的节奏——阿尔忎弥斯走自己的路。",
  },
  {
    role: "Aphrodite",
    keywords: [
      "beauty", "brand", "hospitality", "attraction", "relationship", "emotional",
      "charm", "design", "aesthetic", "fashion", "luxury",
      "美", "品牌", "时尚", "关系",
    ],
    reasonTemplate:
      "A social magnet who works through beauty and emotional resonance — Aphrodite draws people in.",
    reasonTemplateZh:
      "通过美和情感共鸣吸引人的社交磁场——阿佛洛狄忛让人欲罢不能。",
  },
  {
    role: "Dionysus",
    keywords: [
      "event", "culture", "nightlife", "ritual", "community", "creative",
      "party", "festival", "art", "chaos", "play",
      "活动", "文化", "夜生活", "派对", "艺术",
    ],
    reasonTemplate:
      "A community catalyst energizing culture and creative ritual — Dionysus hosts the gathering.",
    reasonTemplateZh:
      "激活文化和创意仪式的社区催化剂——狄俄尼索斯主持聚会。",
  },
  {
    role: "Hades",
    keywords: [
      "infrastructure", "finance", "invest", "privacy", "backend", "security",
      "capital", "deep", "system", "architecture", "quiet",
      "投资", "金融", "基础设施", "架构", "后端",
    ],
    reasonTemplate:
      "Quiet power operating deep systems and hidden leverage — Hades builds beneath the surface.",
    reasonTemplateZh:
      "在深层系统和隐藏杠杆中运作的安静力量——哈迪斯在表面之下建造。",
  },
  {
    role: "Persephone",
    keywords: [
      "transform", "dual", "cross", "research", "academic", "bridge", "synthesis",
      "institution", "boundary", "seasonal", "change",
      "跨界", "研究", "学术", "转型",
    ],
    reasonTemplate:
      "A bridge between worlds — Persephone moves between scenes with depth and soft power.",
    reasonTemplateZh:
      "世界之间的桥梁——珀耳塞福涅在不同场景间穿行，带着深度和柔性力量。",
  },
  {
    role: "Odysseus",
    keywords: [
      "founder", "journey", "resilience", "storytelling", "travel", "problem",
      "constraint", "long game", "navigate", "strategy", "startup",
      "创业", "旅行", "航行", "故事",
    ],
    reasonTemplate:
      "A strategic navigator on a long journey — Odysseus solves problems under constraint.",
    reasonTemplateZh:
      "长远旅途上的策略导航者——奥德修斯在约束下解决问题。",
  },
];

/**
 * Rule-based archetype matching from profile signals.
 *
 * Takes the profile's visible text (lines, tags, context) and scores each archetype
 * by keyword overlap. Returns the top match and an optional secondary.
 *
 * TODO: Replace with LLM-based matching for richer, context-aware results.
 */
const archetypeAssets: Record<ArchetypeRole, { dashboard: string; profileBack: string }> = {
  Hermes: { dashboard: "/profile-archetypes/dashboard/01-Hermes-赫尔墨斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/01-Hermes-赫尔墨斯.mp4" },
  Athena: { dashboard: "/profile-archetypes/dashboard/02-Athena-雅典娜-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/02-Athena-雅典娜.mp4" },
  Prometheus: { dashboard: "/profile-archetypes/dashboard/03-Prometheus-普罗米修斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/03-Prometheus-普罗米修斯.mp4" },
  Apollo: { dashboard: "/profile-archetypes/dashboard/04-Apollo-阿波罗-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/04-Apollo-阿波罗.mp4" },
  Artemis: { dashboard: "/profile-archetypes/dashboard/05-Artemis-阿尔忒弥斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/05-Artemis-阿尔忒弥斯.mp4" },
  Aphrodite: { dashboard: "/profile-archetypes/dashboard/06-Aphrodite-阿佛洛狄忒-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/06-Aphrodite-阿佛洛狄忒.mp4" },
  Dionysus: { dashboard: "/profile-archetypes/dashboard/07-Dionysus-狄俄尼索斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/07-Dionysus-狄俄尼索斯.mp4" },
  Hades: { dashboard: "/profile-archetypes/dashboard/08-Hades-哈迪斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/08-Hades-哈迪斯.mp4" },
  Persephone: { dashboard: "/profile-archetypes/dashboard/09-Persephone-珀耳塞福涅-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/09-Persephone-珀耳塞福涅.mp4" },
  Odysseus: { dashboard: "/profile-archetypes/dashboard/10-Odysseus-奥德修斯-dashboard-tone-1.3.png", profileBack: "/profile-archetypes/profile-back/10-Odysseus-奥德修斯.mp4" },
};

export function getArchetypeAssets(role: ArchetypeRole) {
  return archetypeAssets[role] || archetypeAssets.Prometheus;
}

export function matchArchetype(profile: Pick<ProfileDraft, "line1" | "line2" | "line3" | "interestTags" | "context">): ArchetypeMatch {
  const corpus = [
    profile.line1,
    profile.line2,
    profile.line3,
    profile.context,
    ...profile.interestTags,
  ]
    .join(" ")
    .toLowerCase();

  const scores: { role: ArchetypeRole; score: number; rule: ArchetypeRule }[] = archetypeRules.map(
    (rule) => {
      const score = rule.keywords.reduce((sum, kw) => {
        return sum + (corpus.includes(kw.toLowerCase()) ? 1 : 0);
      }, 0);
      return { role: rule.role, score, rule };
    },
  );

  scores.sort((a, b) => b.score - a.score);

  const primary = scores[0];
  const secondary = scores[1] && scores[1].score > 0 ? scores[1] : null;

  return {
    primary: primary.role,
    secondary: secondary?.role ?? null,
    reason: primary.rule.reasonTemplate,
    reasonZh: primary.rule.reasonTemplateZh,
  };
}
