"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import styles from "./RedesignHomepage.module.css";

const shiftCardGroups = [
  {
    id: "browser",
    groupClassName: styles.shiftGroupBrowser,
    groupWidth: "11.375rem",
    groupHeight: "7.4375rem",
    floatStartX: "-0.78rem",
    floatStartY: "-0.54rem",
    floatEndX: "1.04rem",
    floatEndY: "0.72rem",
    floatDuration: "7.6s",
    floatDelay: "-1.2s",
    frontClassName: styles.internetFrontBrowser,
    front: {
      sheetLeft: "-5.69%",
      sheetTop: "-18.91%",
      sheetWidth: "178.38%",
      sheetHeight: "272.61%",
    },
    shatterClassName: styles.internetCardBrowser,
    shatter: {
      sheetLeft: "-3.91%",
      sheetTop: "-9.88%",
      sheetWidth: "169%",
      sheetHeight: "258.02%",
    },
    badge: { sheetLeft: "-41.55%", sheetTop: "-19.72%" },
  },
  {
    id: "search",
    groupClassName: styles.shiftGroupSearch,
    groupWidth: "9.3125rem",
    groupHeight: "9rem",
    floatStartX: "0.66rem",
    floatStartY: "-0.96rem",
    floatEndX: "-1rem",
    floatEndY: "0.66rem",
    floatDuration: "8.4s",
    floatDelay: "-3.1s",
    frontClassName: styles.internetFrontSearch,
    front: {
      sheetLeft: "-163.32%",
      sheetTop: "-25.36%",
      sheetWidth: "273.8%",
      sheetHeight: "297.16%",
    },
    shatterClassName: styles.internetCardSearch,
    shatter: {
      sheetLeft: "-161.02%",
      sheetTop: "-10.57%",
      sheetWidth: "265.68%",
      sheetHeight: "276.23%",
    },
    badge: { sheetLeft: "-171.48%", sheetTop: "-22.18%" },
  },
  {
    id: "calendar",
    groupClassName: styles.shiftGroupCalendar,
    groupWidth: "8.625rem",
    groupHeight: "6.75rem",
    floatStartX: "-0.96rem",
    floatStartY: "0.78rem",
    floatEndX: "0.64rem",
    floatEndY: "-0.72rem",
    floatDuration: "7.9s",
    floatDelay: "-2.4s",
    frontClassName: styles.internetFrontCalendar,
    front: {
      sheetLeft: "-5.29%",
      sheetTop: "-249.07%",
      sheetWidth: "301.44%",
      sheetHeight: "387.04%",
    },
    shatterClassName: styles.internetCardCalendar,
    shatter: {
      sheetLeft: "-6.41%",
      sheetTop: "-247.11%",
      sheetWidth: "297.86%",
      sheetHeight: "381.16%",
    },
    badge: { sheetLeft: "-295.07%", sheetTop: "-128.52%" },
  },
  {
    id: "media",
    groupClassName: styles.shiftGroupMedia,
    groupWidth: "8.25rem",
    groupHeight: "7.3125rem",
    floatStartX: "0.82rem",
    floatStartY: "0.5rem",
    floatEndX: "-0.64rem",
    floatEndY: "-0.92rem",
    floatDuration: "8.8s",
    floatDelay: "-4.3s",
    frontClassName: styles.internetFrontMedia,
    front: {
      sheetLeft: "-106.31%",
      sheetTop: "-226.69%",
      sheetWidth: "304.37%",
      sheetHeight: "352.25%",
    },
    shatterClassName: styles.internetCardMedia,
    shatter: {
      sheetLeft: "-113.74%",
      sheetTop: "-233.62%",
      sheetWidth: "319.08%",
      sheetHeight: "360.34%",
    },
    badge: { sheetLeft: "-41.55%", sheetTop: "-125.7%" },
  },
  {
    id: "profile",
    groupClassName: styles.shiftGroupProfile,
    groupWidth: "8.4118rem",
    groupHeight: "4.6875rem",
    floatStartX: "-0.68rem",
    floatStartY: "-0.42rem",
    floatEndX: "0.86rem",
    floatEndY: "0.78rem",
    floatDuration: "7.2s",
    floatDelay: "-0.7s",
    frontClassName: styles.internetFrontProfile,
    front: {
      sheetLeft: "-197.07%",
      sheetTop: "-226.02%",
      sheetWidth: "306.6%",
      sheetHeight: "509.76%",
    },
    shatterClassName: styles.internetCardProfile,
    shatter: {
      sheetLeft: "-184.3%",
      sheetTop: "-226.74%",
      sheetWidth: "289.61%",
      sheetHeight: "518.85%",
    },
    badge: { sheetLeft: "-41.55%", sheetTop: "-228.52%" },
  },
  {
    id: "map",
    groupClassName: styles.shiftGroupMap,
    groupWidth: "7.1875rem",
    groupHeight: "5.5rem",
    floatStartX: "0.56rem",
    floatStartY: "0.92rem",
    floatEndX: "-0.92rem",
    floatEndY: "-0.42rem",
    floatDuration: "8.1s",
    floatDelay: "-5.1s",
    frontClassName: styles.internetFrontMap,
    front: {
      sheetLeft: "-113.79%",
      sheetTop: "-226.02%",
      sheetWidth: "332.63%",
      sheetHeight: "509.76%",
    },
    shatterClassName: styles.internetCardMap,
    shatter: {
      sheetLeft: "-124.93%",
      sheetTop: "-194.8%",
      sheetWidth: "359.31%",
      sheetHeight: "466.17%",
    },
    badge: { sheetLeft: "-169.01%", sheetTop: "-228.52%" },
  },
  {
    id: "feed",
    groupClassName: styles.shiftGroupFeed,
    groupWidth: "7.25rem",
    groupHeight: "5rem",
    floatStartX: "-0.6rem",
    floatStartY: "0.64rem",
    floatEndX: "0.74rem",
    floatEndY: "-0.82rem",
    floatDuration: "7.7s",
    floatDelay: "-2.9s",
    frontClassName: styles.internetFrontFeed,
    front: {
      sheetLeft: "-11.02%",
      sheetTop: "-210.38%",
      sheetWidth: "329.13%",
      sheetHeight: "482.31%",
    },
    shatterClassName: styles.internetCardFeed,
    shatter: {
      sheetLeft: "-7.46%",
      sheetTop: "-196.99%",
      sheetWidth: "322.37%",
      sheetHeight: "471.43%",
    },
    badge: { sheetLeft: "-169.01%", sheetTop: "-125.7%" },
  },
  {
    id: "inbox",
    groupClassName: styles.shiftGroupInbox,
    groupWidth: "8.25rem",
    groupHeight: "7.5rem",
    floatStartX: "0.88rem",
    floatStartY: "-0.6rem",
    floatEndX: "-0.56rem",
    floatEndY: "0.88rem",
    floatDuration: "8.6s",
    floatDelay: "-1.8s",
    frontClassName: styles.internetFrontInbox,
    front: {
      sheetLeft: "-242.61%",
      sheetTop: "-209.61%",
      sheetWidth: "356.25%",
      sheetHeight: "325.71%",
    },
    shatterClassName: styles.internetCardInbox,
    shatter: {
      sheetLeft: "-221.41%",
      sheetTop: "-233.62%",
      sheetWidth: "327.42%",
      sheetHeight: "360.34%",
    },
    badge: { sheetLeft: "-295.07%", sheetTop: "-22.18%" },
  },
] as const;

const reasons = [
  {
    id: "shipping",
    quote:
      "“You theorize, she ships. Talk before you both forget why.”",
    expanded:
      "You theorize, she ships. You're still explaining why; she's already building the first usable version. Talk before momentum splits into two separate paths.",
    tags: ["Speed gap", "Friction", "Theory/practice"],
    left: "serena",
    right: "you",
    expandedRight: "mira",
  },
  {
    id: "wall",
    quote: "“You're both stuck on the same wall, from different sides.”",
    expanded:
      "You're both stuck on the same wall, from different sides. You're reading the pushback; he found the crack from the product side. Talk before you build around it.",
    tags: ["Parallel struggle", "Cross-section", "Same wall"],
    left: "mira",
    right: "cassian",
  },
  {
    id: "decision",
    quote: "“She just made the decision you're 2 weeks away from.”",
    expanded:
      "She just made the decision you're two weeks away from. You're still weighing risks; she chose, shipped, and learned what broke.",
    tags: ["Fresh data", "Decision window", "Just-in-time"],
    left: "cassian",
    right: "mira",
  },
] as const;

const roomRoleCards = [
  {
    cta: "Get your key",
    image: "/redesign/figma/party-people.png",
    label: "For People",
    text: "Give your agent an identity card.\nWalk into a room. Find the\npeople you would have missed.",
  },
  {
    cta: "Host with Antenna",
    image: "/redesign/figma/party-hosts.png",
    label: "For Hosts",
    text: "Turn your gathering into an\nintelligent room where the right\npeople actually meet.",
  },
] as const;

const verticals = [
  { id: "communities", image: "/redesign/figma/vertical-communities.png", label: "Communities" },
  { id: "hiring", image: "/redesign/figma/vertical-hiring.png", label: "Hiring" },
  { id: "dating", image: "/redesign/figma/vertical-dating.png", label: "Dating" },
  { id: "founder", image: "/redesign/figma/vertical-founder.png", label: "Founder" },
  { id: "collaboration", image: "/redesign/figma/vertical-collaboration.png", label: "Collaboration" },
  { id: "local-discovery", image: "/redesign/figma/vertical-local-discovery.png", label: "Local discovery" },
] as const;

const reasonAssets = {
  serena: {
    portrait: "/redesign/reasons/svgnew/serena-portrait-full.svg",
    token: "/redesign/reasons/svgnew/serena-token-full.svg",
  },
  you: {
    portrait: "/redesign/reasons/svgnew/you-portrait-full.svg",
    token: "/redesign/reasons/svgnew/you-token-full.svg",
  },
  mira: {
    portrait: "/redesign/reasons/svgnew/mira-portrait-full.svg",
    token: "/redesign/reasons/svgnew/mira-token-full.svg",
  },
  cassian: {
    portrait: "/redesign/reasons/svgnew/cassian-portrait-full.svg",
    token: "/redesign/reasons/svgnew/cassian-token-full.svg",
  },
} as const;

const faqs = [
  {
    q: "Do I need an agent to use Antenna?",
    a: "No. If you have one, bring it. If not, create an identity card and Antenna can still make your context readable until your own agent arrives.",
  },
  {
    q: "Is Antenna a dating app or a networking app?",
    a: "No. Dating, hiring, fundraising, friendship, and collaboration are outcomes. The primitive is agent-mediated human relevance.",
  },
  {
    q: "Why start with rooms?",
    a: "Rooms already have density, timing, trust, and shared context. They are the fastest place to prove that agents can notice relevance before people do.",
  },
  {
    q: "How does Antenna work today?",
    a: "Share a profile: create your agent-readable identity, share your Antenna link, and let another person's agent decide whether to accept. Join a room: a host creates a room, people join through a link, and agents scan participants in context.",
  },
  {
    q: "What does a host get?",
    a: "A room where the right people actually meet, with profile context, participant scanning, and recommendations with reasons.",
  },
  {
    q: "What happens to my data?",
    a: "The product is designed around context you choose to expose. The identity card should help agents understand relevance without turning people into public feeds.",
  },
];

const profileConsoleIcons = {
  apiSettings: "/redesign/figma/profile-icon-api-settings.svg",
  publicProfile: "/redesign/figma/profile-icon-public-profile.svg",
  signOut: "/redesign/figma/profile-icon-sign-out.svg",
  refresh: "/redesign/figma/profile-icon-refresh.svg",
  edit: "/redesign/figma/profile-icon-edit.svg",
  location: "/redesign/figma/profile-icon-location.svg",
} as const;

const profileConsoleBackground = "/redesign/figma/profile-console-bg.png";

const profileConsoleCopy = {
  en: {
    brandKicker: "PERSONAL AGENT CONTROL CONSOLE",
    actions: {
      apiSettings: "API settings",
      publicProfile: "Public profile",
      signOut: "Sign out",
      updateGps: "Update GPS",
      back: "Back",
      edit: "Edit",
      viewAll: "View all",
    },
    today: {
      title: "Today",
      status: "Agent connected",
      heading: "Nothing needs action right now.",
      detail: "Matches, event tasks, and agent recommendations will appear here as rows.",
    },
    identity: {
      title: "Identity",
      name: "Antenna",
      status: "Active",
      summary:
        "Antenna helps your agent understand the room, surface the people who matter, and turn hidden relevance into real-world connection.",
      tags: ["AI Builder", "Designer", "Startups"],
      lookingForLabel: "Looking for",
      lookingFor: "People who valued real feeling and the real world.",
      conversationLabel: "Our conversation",
      conversation: "Let’s sit together, forget what we were doing, and just be real, be chill.",
      location: "China, Beijing",
    },
    matches: {
      title: "Matches",
      heading: "No pending matches.",
      detail: "When your agent finds someone worth accepting, the reason and action will live here.",
    },
    rooms: {
      title: "Rooms",
      heading: "No room joined.",
      detail: "Check-ins, approvals, and room reminders will show up as action rows.",
    },
  },
  zh: {
    brandKicker: "PERSONAL AGENT CONTROL CONSOLE",
    actions: {
      apiSettings: "API 设置",
      publicProfile: "公开主页",
      signOut: "退出",
      updateGps: "更新定位",
      back: "返回",
      edit: "编辑",
      viewAll: "查看全部",
    },
    today: {
      title: "今天",
      status: "智能体已连接",
      heading: "现在没有需要处理的事。",
      detail: "匹配、活动任务和智能体建议会以列表形式出现在这里。",
    },
    identity: {
      title: "身份",
      name: "Antenna",
      status: "在线",
      summary: "Antenna 帮你的智能体理解场域，浮现真正重要的人，并把隐藏的相关性转化成现实连接。",
      tags: ["AI Builder", "Designer", "Startups"],
      lookingForLabel: "正在寻找",
      lookingFor: "重视真实感受和现实世界的人。",
      conversationLabel: "我们的对话",
      conversation: "坐下来，先忘掉手头的事，真实一点，也松弛一点。",
      location: "中国，北京",
    },
    matches: {
      title: "匹配",
      heading: "暂无待处理匹配。",
      detail: "当你的智能体找到值得接受的人，理由和操作会出现在这里。",
    },
    rooms: {
      title: "房间",
      heading: "尚未加入房间。",
      detail: "签到、审批和房间提醒会以行动列表的形式出现。",
    },
  },
} as const;

export function RedesignHomepage() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [expandedReason, setExpandedReason] = useState<string | null>(null);
  const [openFaq, setOpenFaq] = useState(-1);

  useEffect(() => {
    let cleanup = () => {};

    async function setupGsap() {
      const [{ gsap }, scrollTriggerModule] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      const ScrollTrigger = scrollTriggerModule.ScrollTrigger;
      gsap.registerPlugin(ScrollTrigger);

      const root = rootRef.current;
      if (!root) return;

      const ctx = gsap.context(() => {
        const mm = gsap.matchMedia();
        mm.add(
          {
            desktop: "(min-width: 900px)",
            reduced: "(prefers-reduced-motion: reduce)",
          },
          ({ conditions }) => {
            if (!conditions?.desktop || conditions?.reduced) {
              gsap.set("[data-animate]", { clearProps: "all" });
              return;
            }

            const shiftTimeline = gsap.timeline({
              defaults: { ease: "none" },
              scrollTrigger: {
                trigger: "[data-scene='shift-scroll']",
                start: "top top",
                end: "+=260%",
                scrub: true,
                pin: true,
              },
            });

            const scatterFromCenter = (axis: "x" | "y") => (_index: number, target: Element) => {
              const element = target as HTMLElement;
              const parent = element.parentElement;
              const parentWidth = parent?.clientWidth ?? window.innerWidth;
              const parentHeight = parent?.clientHeight ?? window.innerHeight;

              if (axis === "x") {
                return parentWidth / 2 - (element.offsetLeft + element.offsetWidth / 2);
              }

              return parentHeight / 2 - (element.offsetTop + element.offsetHeight / 2);
            };

            gsap.fromTo(
              "[data-shift-group]",
              { autoAlpha: 1, x: scatterFromCenter("x"), y: scatterFromCenter("y"), scale: 0.62 },
              {
                autoAlpha: 1,
                x: 0,
                y: 0,
                scale: 1,
                duration: 0.38,
                stagger: { amount: 0.08, from: "center" },
                ease: "power3.out",
                scrollTrigger: {
                  trigger: "[data-scene='shift-scroll']",
                  start: "top 50%",
                  once: true,
                },
              },
            );

            shiftTimeline
              .to({}, { duration: 0.32 })
              .fromTo("[data-shift-line='2']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.16 })
              .to("[data-internet-front]", { autoAlpha: 0, duration: 0.16 }, "<")
              .fromTo("[data-internet-shatter]", { autoAlpha: 0, scale: 0.98 }, { autoAlpha: 1, scale: 1, duration: 0.16 }, "<")
              .fromTo("[data-shift-line='3']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.18 })
              .to("[data-internet-shatter]", { opacity: 0.18, scale: 1.04, stagger: 0.01, duration: 0.18 }, ">")
              .to("[data-shift-copy='early']", { autoAlpha: 0, y: -18, duration: 0.16 })
              .to("[data-internet-shatter]", { autoAlpha: 0, scale: 1.02, duration: 0.16 }, "<")
              .fromTo("[data-shift-copy='final']", { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, ">")
              .fromTo("[data-shift-token]", { autoAlpha: 0, scale: 0.46 }, { autoAlpha: 1, scale: 1, stagger: 0.03, duration: 0.22 }, "<0.03");

            const doorVideo = root.querySelector<HTMLVideoElement>("[data-door-video]");
            let doorVideoProgress = 0;
            let doorVideoFrame: number | null = null;
            const renderDoorVideoFrame = () => {
              doorVideoFrame = null;
              if (!doorVideo) return;
              const duration = Number.isFinite(doorVideo.duration) && doorVideo.duration > 0 ? doorVideo.duration : 9.966667;
              doorVideo.pause();
              const targetTime = Math.min(duration - 0.05, duration * doorVideoProgress);
              if (Math.abs(doorVideo.currentTime - targetTime) < 0.012) return;
              try {
                doorVideo.currentTime = targetTime;
              } catch {
                // Safari can reject currentTime before metadata is ready; loadedmetadata resyncs it.
              }
            };
            const scrubDoorVideo = (progress: number) => {
              if (!doorVideo) return;
              doorVideoProgress = Math.min(1, Math.max(0, progress));
              if (doorVideoFrame === null) {
                doorVideoFrame = window.requestAnimationFrame(renderDoorVideoFrame);
              }
            };

            const syncDoorVideo = () => scrubDoorVideo(0);
            doorVideo?.addEventListener("loadedmetadata", syncDoorVideo);
            scrubDoorVideo(0);

            const getDoorPushScale = () => {
              const camera = root.querySelector<HTMLElement>("[data-door-camera-rig]");
              if (!camera) return 7;
              const getCssSize = (element: HTMLElement, property: "width" | "height") => {
                const value = Number.parseFloat(window.getComputedStyle(element)[property]);
                return Number.isFinite(value) ? value : 0;
              };
              const width = getCssSize(camera, "width") || camera.offsetWidth || camera.getBoundingClientRect().width;
              const height = getCssSize(camera, "height") || camera.offsetHeight || camera.getBoundingClientRect().height;
              if (!width || !height) return 7;
              return Math.max(2.8, Math.max(window.innerWidth / width, window.innerHeight / height) * 1.34);
            };

            const doorTransition = gsap.timeline({
              scrollTrigger: {
                trigger: "[data-scene='door-scroll']",
                start: "top top",
                end: "+=230%",
                pin: true,
                anticipatePin: 1,
                scrub: true,
                invalidateOnRefresh: true,
                onUpdate: (self) => scrubDoorVideo(Math.min(1, self.progress / 0.76)),
                onRefresh: (self) => scrubDoorVideo(Math.min(1, self.progress / 0.76)),
              },
            });
            doorTransition
              .fromTo(
                "[data-door-portal]",
                { autoAlpha: 0 },
                { autoAlpha: 1, duration: 0.12, ease: "none" },
                0.02,
              )
              .fromTo(
                "[data-door-portal-bg]",
                { scale: 1.26 },
                { scale: 1.08, duration: 0.5, ease: "power1.out" },
                0.02,
              )
              .to("[data-door-camera-rig]", { scale: getDoorPushScale, duration: 0.86, ease: "power1.inOut" }, 0.04)
              .to("[data-room-step]", { autoAlpha: 0, scale: 0.96, stagger: 0.01, duration: 0.16, ease: "none" }, 0.14)
              .to("[data-door-header]", { autoAlpha: 0, y: -28, duration: 0.18, ease: "none" }, 0.2)
              .to(
                "[data-door-full-world]",
                { autoAlpha: 1, pointerEvents: "auto", duration: 0.08, ease: "none" },
                0.84,
              )
              .set("[data-door-full-content]", { visibility: "visible" }, 0.84)
              .to("[data-door-portal]", { autoAlpha: 0, duration: 0.08, ease: "none" }, 0.84)
              .to("[data-door-camera-rig]", { autoAlpha: 0, duration: 0.16, ease: "power1.out" }, 0.9)
              .to("[data-door-full-content]", { opacity: 1, duration: 0.14, ease: "power1.out" }, 0.96);

            return () => {
              if (doorVideoFrame !== null) window.cancelAnimationFrame(doorVideoFrame);
              doorVideo?.removeEventListener("loadedmetadata", syncDoorVideo);
            };
          },
        );
      }, root);

      cleanup = () => ctx.revert();
    }

    setupGsap();
    return () => cleanup();
  }, []);

  return (
    <main className={styles.page} data-redesign-homepage ref={rootRef}>
      <HeroSection />
      <ShiftScene />
      <IdentitySection />
      <ReasonsFeed expandedReason={expandedReason} onChange={setExpandedReason} />
      <DoorAndRooms />
      <BeyondRooms />
      <FAQSection openFaq={openFaq} onChange={setOpenFaq} />
      <FooterSection />
    </main>
  );
}

function HeroSection() {
  return (
    <section className={styles.hero} data-scene="hero">
      <img
        alt=""
        className={styles.heroImage}
        fetchPriority="high"
        loading="eager"
        src="/hero-greek-gods-original-faithful-uhd-4k.png"
      />
      <header className={styles.nav}>
        <Link aria-label="Antenna home" className={styles.brand} href="/">
          <img
            alt=""
            aria-hidden="true"
            className={styles.brandMark}
            src="/redesign/figma/hero-logo-mark.svg"
          />
          <img
            alt=""
            aria-hidden="true"
            className={styles.brandWordmark}
            src="/redesign/figma/hero-logo-wordmark.svg"
          />
        </Link>
        <div className={styles.navActions}>
          <a className={styles.signIn} href="/login">Sign in</a>
          <button aria-label="Open navigation" className={styles.menuButton} type="button">
            <img alt="" aria-hidden="true" src="/redesign/figma/hero-menu-icon.svg" />
          </button>
        </div>
      </header>
      <div className={styles.heroCopy}>
        <h1>Your agent knows who you should meet.</h1>
        <p>
          Antenna gives every person an agent-readable identity, so agents can
          discover who should meet in the real world.
        </p>
        <div className={styles.ctaRow}>
          <a className={styles.primaryButton} href="/login">Get your key</a>
          <a className={styles.secondaryButton} href="#shift">Learn more</a>
        </div>
      </div>
    </section>
  );
}

function ShiftScene() {
  return (
    <section className={styles.shiftScene} data-scene="shift-scroll" id="shift">
      <div className={styles.shiftStage}>
        <div className={styles.internetLayer}>
          {shiftCardGroups.map((group) => (
            <div
              className={`${styles.shiftCardGroup} ${group.groupClassName}`}
              data-shift-group
              key={group.id}
              style={
                {
                  "--group-width": group.groupWidth,
                  "--group-height": group.groupHeight,
                  "--float-start-x": group.floatStartX,
                  "--float-start-y": group.floatStartY,
                  "--float-end-x": group.floatEndX,
                  "--float-end-y": group.floatEndY,
                  "--float-duration": group.floatDuration,
                  "--float-delay": group.floatDelay,
                } as CSSProperties
              }
            >
              <div className={styles.shiftCardFloat} data-shift-float>
                <span className={styles.shiftStateAnchor} aria-hidden="true">
                  <span
                    className={`${styles.internetFrontCard} ${group.frontClassName}`}
                    data-internet-front
                    style={
                      {
                        "--sheet-left": group.front.sheetLeft,
                        "--sheet-top": group.front.sheetTop,
                        "--sheet-width": group.front.sheetWidth,
                        "--sheet-height": group.front.sheetHeight,
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      decoding="async"
                      loading="lazy"
                      src="/redesign/second-screen/act-1-information-internet-front.png"
                    />
                  </span>
                </span>
                <span className={styles.shiftStateAnchor} aria-hidden="true">
                  <span
                    className={`${styles.internetCard} ${group.shatterClassName}`}
                    data-internet-card
                    data-internet-shatter
                    style={
                      {
                        "--sheet-left": group.shatter.sheetLeft,
                        "--sheet-top": group.shatter.sheetTop,
                        "--sheet-width": group.shatter.sheetWidth,
                        "--sheet-height": group.shatter.sheetHeight,
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      decoding="async"
                      loading="lazy"
                      src="/redesign/second-screen/act-2-individual-card-shatter-sheet.png"
                    />
                  </span>
                </span>
                <span className={styles.shiftBadgeAnchor} aria-hidden="true">
                  <span
                    className={styles.mythToken}
                    data-shift-badge
                    data-shift-token
                    style={
                      {
                        "--sheet-left": group.badge.sheetLeft,
                        "--sheet-top": group.badge.sheetTop,
                      } as CSSProperties
                    }
                  >
                    <img
                      alt=""
                      loading="lazy"
                      src="/redesign/second-screen/act-3-agent-social-graph.png"
                    />
                  </span>
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.shiftText} data-shift-copy="early">
          <p data-animate data-shift-line="1">
            The last internet helped us discover information.
          </p>
          <p data-animate data-shift-line="2">
            The AI era creates a different question:
          </p>
          <strong data-animate data-shift-line="3">
            Who should you actually meet?
          </strong>
        </div>

        <div className={styles.shiftFinalCopy} data-shift-copy="final">
          <p>
            The next social graph,
            <br />
            orchestrated by Agents.
          </p>
          <h2>Antenna helps Agents shape who you should meet next.</h2>
        </div>
      </div>
    </section>
  );
}

function IdentitySection() {
  const [consoleLanguage, setConsoleLanguage] = useState<"en" | "zh">("en");
  const [selectedConsolePanel, setSelectedConsolePanel] = useState("today");
  const [activeConsoleAction, setActiveConsoleAction] = useState<string | null>(null);
  const profileCopy = profileConsoleCopy[consoleLanguage];

  return (
    <section className={styles.identitySection} data-scene="identity-profile">
      <div className={styles.sectionHeader}>
        <h2>A profile for agents, not for scrolling</h2>
        <p>Your profile is not a bio. It is a reading.</p>
      </div>
      <div className={styles.dashboardMock} data-profile-console data-console-language={consoleLanguage}>
        <img alt="" className={styles.consoleBackground} loading="lazy" src={profileConsoleBackground} />
        <div className={`${styles.consoleBrand} ${styles.consolePassiveHover}`}>
          <span className={styles.consoleLogo} aria-hidden="true">
            <img alt="" src="/redesign/figma/hero-logo-mark.svg" />
            <img alt="" src="/redesign/figma/hero-logo-wordmark.svg" />
          </span>
          <span>{profileCopy.brandKicker}</span>
        </div>
        <div className={styles.consoleNav} aria-label="Profile console controls">
          <span className={styles.consoleLanguage} aria-label="Language switch">
            <button
              type="button"
              className={styles.consoleLanguageOption}
              data-active={consoleLanguage === "en"}
              aria-pressed={consoleLanguage === "en"}
              onClick={() => setConsoleLanguage("en")}
            >
              EN
            </button>
            <button
              type="button"
              className={styles.consoleLanguageOption}
              data-active={consoleLanguage === "zh"}
              aria-pressed={consoleLanguage === "zh"}
              onClick={() => setConsoleLanguage("zh")}
            >
              中文
            </button>
          </span>
          <ConsoleButton
            icon={profileConsoleIcons.apiSettings}
            actionKey="api-settings"
            activeAction={activeConsoleAction}
            onAction={setActiveConsoleAction}
          >
            {profileCopy.actions.apiSettings}
          </ConsoleButton>
          <ConsoleButton
            icon={profileConsoleIcons.publicProfile}
            actionKey="public-profile"
            activeAction={activeConsoleAction}
            onAction={setActiveConsoleAction}
          >
            {profileCopy.actions.publicProfile}
          </ConsoleButton>
          <ConsoleButton
            icon={profileConsoleIcons.signOut}
            actionKey="sign-out"
            activeAction={activeConsoleAction}
            onAction={setActiveConsoleAction}
          >
            {profileCopy.actions.signOut}
          </ConsoleButton>
        </div>

        <div className={styles.profileConsoleGrid}>
          <ConsolePanel
            id="today"
            className={styles.todayPanel}
            selected={selectedConsolePanel === "today"}
            onSelect={setSelectedConsolePanel}
          >
            <div className={styles.consolePanelHeader}>
              <span>{profileCopy.today.title}</span>
              <ConsoleStatus>{profileCopy.today.status}</ConsoleStatus>
            </div>
            <ConsoleDivider variant="wide" />
            <h3>{profileCopy.today.heading}</h3>
            <div className={styles.consolePanelFooter}>
              <p>{profileCopy.today.detail}</p>
              <ConsoleButton
                icon={profileConsoleIcons.refresh}
                actionKey="update-gps"
                activeAction={activeConsoleAction}
                onAction={setActiveConsoleAction}
              >
                {profileCopy.actions.updateGps}
              </ConsoleButton>
            </div>
          </ConsolePanel>

          <ConsolePanel
            id="identity"
            className={styles.identityPanel}
            selected={selectedConsolePanel === "identity"}
            onSelect={setSelectedConsolePanel}
          >
            <div className={styles.consolePanelHeader}>
              <span>{profileCopy.identity.title}</span>
              <span className={styles.consoleButtonGroup}>
                <ConsoleButton
                  icon={profileConsoleIcons.refresh}
                  actionKey="back"
                  activeAction={activeConsoleAction}
                  onAction={setActiveConsoleAction}
                >
                  {profileCopy.actions.back}
                </ConsoleButton>
                <ConsoleButton
                  icon={profileConsoleIcons.edit}
                  actionKey="edit"
                  activeAction={activeConsoleAction}
                  onAction={setActiveConsoleAction}
                >
                  {profileCopy.actions.edit}
                </ConsoleButton>
              </span>
            </div>
            <ConsoleDivider />
            <div className={styles.identityTitleRow}>
              <h3>{profileCopy.identity.name}</h3>
              <ConsoleStatus>{profileCopy.identity.status}</ConsoleStatus>
            </div>
            <p className={styles.identitySummary}>
              {profileCopy.identity.summary}
            </p>
            <div className={styles.consoleTags}>
              {profileCopy.identity.tags.map((tag) => (
                <span className={styles.consoleTag} key={tag}>
                  <span aria-hidden="true" className={styles.consoleTagEdge} />
                  <span>{tag}</span>
                </span>
              ))}
            </div>
            <ConsoleDivider />
            <div className={styles.consoleField}>
              <span>{profileCopy.identity.lookingForLabel}</span>
              <p>{profileCopy.identity.lookingFor}</p>
            </div>
            <div className={styles.consoleField}>
              <span>{profileCopy.identity.conversationLabel}</span>
              <p>{profileCopy.identity.conversation}</p>
            </div>
            <ConsoleDivider />
            <div className={styles.identityMeta}>
              <span className={`${styles.consoleLocation} ${styles.consolePassiveHover}`}>
                <img alt="" src={profileConsoleIcons.location} />
                {profileCopy.identity.location}
              </span>
              <span className={styles.consoleSocials}>
                <ConsoleSocialGlyph type="github" />
                <ConsoleSocialGlyph type="x" />
              </span>
            </div>
          </ConsolePanel>

          <div className={styles.profileSideStack}>
            <ConsolePanel
              id="matches"
              selected={selectedConsolePanel === "matches"}
              onSelect={setSelectedConsolePanel}
            >
              <div className={styles.consolePanelHeader}>
                <span>{profileCopy.matches.title}</span>
                <ConsoleButton
                  actionKey="matches-view-all"
                  activeAction={activeConsoleAction}
                  onAction={setActiveConsoleAction}
                >
                  {profileCopy.actions.viewAll}
                </ConsoleButton>
              </div>
              <ConsoleDivider />
              <h4>{profileCopy.matches.heading}</h4>
              <p>{profileCopy.matches.detail}</p>
            </ConsolePanel>

            <ConsolePanel
              id="rooms"
              selected={selectedConsolePanel === "rooms"}
              onSelect={setSelectedConsolePanel}
            >
              <div className={styles.consolePanelHeader}>
                <span>{profileCopy.rooms.title}</span>
                <ConsoleButton
                  actionKey="rooms-view-all"
                  activeAction={activeConsoleAction}
                  onAction={setActiveConsoleAction}
                >
                  {profileCopy.actions.viewAll}
                </ConsoleButton>
              </div>
              <ConsoleDivider />
              <h4>{profileCopy.rooms.heading}</h4>
              <p>{profileCopy.rooms.detail}</p>
            </ConsolePanel>
          </div>
        </div>
      </div>
    </section>
  );
}

function ConsolePanel({
  id,
  children,
  className,
  selected,
  onSelect,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <section
      className={`${styles.consolePanel}${className ? ` ${className}` : ""}`}
      data-profile-panel={id}
      data-selected={selected}
      onClick={() => onSelect(id)}
    >
      <span aria-hidden="true" className={styles.consolePanelGlass} />
      <div className={styles.consolePanelContent}>
        {children}
      </div>
      <span aria-hidden="true" className={styles.consolePanelInset} />
      <span aria-hidden="true" className={styles.consolePanelShadow} />
      <span aria-hidden="true" className={styles.consolePanelStroke} />
    </section>
  );
}

function ConsoleButton({
  children,
  icon,
  actionKey,
  activeAction,
  onAction,
}: {
  children: string;
  icon?: string;
  actionKey?: string;
  activeAction?: string | null;
  onAction?: (action: string) => void;
}) {
  return (
    <button
      type="button"
      className={styles.consoleButton}
      data-active={activeAction === (actionKey ?? children)}
      onClick={(event) => {
        event.stopPropagation();
        onAction?.(actionKey ?? children);
      }}
    >
      <span aria-hidden="true" className={styles.consoleButtonFill} />
      {icon ? <img alt="" className={styles.consoleButtonIcon} src={icon} /> : null}
      <span className={styles.consoleButtonLabel}>
        <span>{children}</span>
      </span>
      <span aria-hidden="true" className={styles.consoleButtonInset} />
    </button>
  );
}

function ConsoleDivider({ variant = "card" }: { variant?: "card" | "wide" }) {
  return (
    <span
      aria-hidden="true"
      className={`${styles.consoleDivider}${variant === "wide" ? ` ${styles.consoleDividerWide}` : ""}`}
    />
  );
}

function ConsoleSocialGlyph({ type }: { type: "github" | "x" }) {
  if (type === "github") {
    return (
      <span className={styles.consoleSocialIcon} data-social-icon="github">
        <span className={styles.consoleSocialFrame}>
          <svg className={styles.consoleSocialSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 25.2 25.2">
            <foreignObject height="45.2" width="45.2" x="-10" y="-10">
              <div
                style={{
                  backdropFilter: "blur(5px)",
                  WebkitBackdropFilter: "blur(5px)",
                  clipPath: "url(#profile_github_blur_clip)",
                  height: "100%",
                  width: "100%",
                }}
              />
            </foreignObject>
            <g data-figma-bg-blur-radius="10">
              <rect fill="#F3EFE7" fillOpacity="0.3" height="24.6" rx="12.3" width="24.6" x="0.3" y="0.3" />
              <rect height="24.6" rx="12.3" stroke="url(#profile_github_stroke)" strokeWidth="0.6" width="24.6" x="0.3" y="0.3" />
              <path d="M12.6 5.80043C16.4675 5.80043 19.6 8.7827 19.6 12.4647C19.599 15.328 17.6805 17.8718 14.8315 18.7872C14.4815 18.8539 14.35 18.6454 14.35 18.4707C14.35 18.2455 14.359 17.5291 14.359 16.638C14.359 16.0135 14.1405 15.6136 13.8865 15.4051C15.444 15.2385 17.0805 14.672 17.0805 12.1148C17.0805 11.3818 16.809 10.7901 16.363 10.3241C16.433 10.1574 16.678 9.47436 16.293 8.55802C16.293 8.55802 15.7065 8.37475 14.368 9.24111C13.808 9.09116 13.213 9.01642 12.618 9.01642C12.023 9.01642 11.428 9.09116 10.868 9.24111C9.5295 8.38332 8.943 8.55802 8.943 8.55802C8.558 9.47436 8.803 10.1574 8.873 10.3241C8.427 10.7906 8.1555 11.3903 8.1555 12.1148C8.1555 14.6639 9.783 15.239 11.3405 15.4056C11.139 15.5722 10.9555 15.864 10.894 16.2967C10.4915 16.4719 9.485 16.7551 8.8555 15.7469C8.724 15.547 8.3305 15.0557 7.7795 15.0638C7.193 15.0724 7.5435 15.3803 7.788 15.5051C8.0855 15.6631 8.4265 16.2548 8.5055 16.4466C8.6455 16.8213 9.1005 17.5382 10.859 17.2297C10.859 17.7881 10.868 18.3126 10.868 18.4707C10.868 18.6459 10.7365 18.8453 10.3865 18.7872C7.527 17.8809 5.5985 15.3337 5.6 12.4642C5.6 8.78222 8.7325 5.80043 12.6 5.80043Z" fill="#1C2A1D" />
            </g>
            <defs>
              <clipPath id="profile_github_blur_clip" transform="translate(10 10)">
                <rect height="24.6" rx="12.3" width="24.6" x="0.3" y="0.3" />
              </clipPath>
              <linearGradient gradientUnits="userSpaceOnUse" id="profile_github_stroke" x1="0.6" x2="29.8394" y1="0.799951" y2="35.4">
                <stop stopColor="white" stopOpacity="0.6" />
                <stop offset="1" stopColor="#B88F4F" stopOpacity="0.2" />
              </linearGradient>
            </defs>
          </svg>
        </span>
      </span>
    );
  }

  return (
    <span className={styles.consoleSocialIcon} data-social-icon="x">
      <span className={styles.consoleSocialFrame}>
        <svg className={styles.consoleSocialSvg} fill="none" preserveAspectRatio="none" viewBox="0 0 25.2 25.2">
          <foreignObject height="45.2" width="45.2" x="-10" y="-10">
            <div
              style={{
                backdropFilter: "blur(5px)",
                WebkitBackdropFilter: "blur(5px)",
                clipPath: "url(#profile_x_blur_clip)",
                height: "100%",
                width: "100%",
              }}
            />
          </foreignObject>
          <g data-figma-bg-blur-radius="10">
            <path d="M12.6 0.300195C19.3931 0.300195 24.8998 5.8069 24.8998 12.6C24.8998 19.3931 19.3931 24.8998 12.6 24.8998C5.8069 24.8998 0.300195 19.3931 0.300195 12.6C0.300195 5.8069 5.8069 0.300195 12.6 0.300195Z" fill="#F3EFE7" fillOpacity="0.3" />
            <path d="M12.6 0.300195C19.3931 0.300195 24.8998 5.8069 24.8998 12.6C24.8998 19.3931 19.3931 24.8998 12.6 24.8998C5.8069 24.8998 0.300195 19.3931 0.300195 12.6C0.300195 5.8069 5.8069 0.300195 12.6 0.300195Z" stroke="url(#profile_x_stroke)" strokeWidth="0.6" />
            <path d="M13.7415 11.6811L18.209 6.6H17.1505L13.2712 11.0118L10.1731 6.6H6.6L11.2849 13.2715L6.6 18.6H7.65849L11.7547 13.9408L15.0264 18.6H18.6L13.7415 11.6811ZM12.2915 13.3302L11.817 12.666L8.04009 7.38H9.66604L12.7142 11.646L13.1887 12.3102L17.1509 17.8555H15.525L12.292 13.3306L12.2915 13.3302Z" fill="#1C2A1D" />
          </g>
          <defs>
            <clipPath id="profile_x_blur_clip" transform="translate(10 10)">
              <path d="M12.6 0.300195C19.3931 0.300195 24.8998 5.8069 24.8998 12.6C24.8998 19.3931 19.3931 24.8998 12.6 24.8998C5.8069 24.8998 0.300195 19.3931 0.300195 12.6C0.300195 5.8069 5.8069 0.300195 12.6 0.300195Z" />
            </clipPath>
            <linearGradient gradientUnits="userSpaceOnUse" id="profile_x_stroke" x1="0.6" x2="29.8394" y1="0.799951" y2="35.4">
              <stop stopColor="white" stopOpacity="0.6" />
              <stop offset="1" stopColor="#B88F4F" stopOpacity="0.2" />
            </linearGradient>
          </defs>
        </svg>
      </span>
    </span>
  );
}

function ConsoleStatus({ children }: { children: string }) {
  return (
    <span className={`${styles.consoleStatus} ${styles.consolePassiveHover}`}>
      <span aria-hidden="true" className={styles.consoleStatusDot}>●</span>
      <span className={styles.consoleStatusLabel}>{children}</span>
    </span>
  );
}

function ReasonsFeed({
  expandedReason,
  onChange,
}: {
  expandedReason: string | null;
  onChange: (id: string | null) => void;
}) {
  return (
    <section className={styles.reasonsSection} data-scene="reasons-feed">
      <img alt="" className={styles.reasonsBackground} loading="lazy" src="/redesign/figma/reasons-field-bg.png" />
      <div className={styles.reasonsVeil} />
      <div className={styles.reasonsHeader}>
        <h2>Antenna notices relevance before people do.</h2>
        <p>Antenna works wherever an agent can read context: a profile, a room, or a shared link.</p>
      </div>
      <div className={styles.feedStack}>
        {reasons.map((reason) => {
          const expanded = expandedReason === reason.id;
          const rightSlug = expanded && "expandedRight" in reason ? reason.expandedRight : reason.right;
          return (
            <button
              aria-expanded={expanded}
              className={expanded ? `${styles.reasonCard} ${styles.reasonCardExpanded}` : styles.reasonCard}
              key={reason.id}
              onClick={() => onChange(expanded ? null : reason.id)}
              type="button"
            >
              <ReasonPerson slug={reason.left} variant={expanded ? "portrait" : "token"} />
              <div className={styles.reasonText}>
                <p>{expanded ? reason.expanded : reason.quote}</p>
                <div>
                  {reason.tags.map((tag) => (
                    <span data-reason-badge key={tag}>{tag}</span>
                  ))}
                </div>
              </div>
              <ReasonPerson slug={rightSlug} variant={expanded ? "portrait" : "token"} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ReasonPerson({
  slug,
  variant,
}: {
  slug: "serena" | "you" | "mira" | "cassian";
  variant: "portrait" | "token";
}) {
  const assets = reasonAssets[slug];

  return (
    <span className={styles.reasonPerson} data-reason-person data-reason-slug={slug} data-reason-variant={variant}>
      <span className={`${styles.reasonPersonLayer} ${styles.reasonPersonToken}`} data-reason-motion-node="token">
        <img alt="" decoding="async" loading="lazy" src={assets.token} />
      </span>
      <span className={`${styles.reasonPersonLayer} ${styles.reasonPersonPortrait}`} data-reason-motion-node="portrait">
        <img alt="" decoding="async" loading="lazy" src={assets.portrait} />
      </span>
    </span>
  );
}

function DoorAndRooms() {
  return (
    <section className={styles.doorSection} data-scene="door-scroll">
      <div className={`${styles.peopleHosts} ${styles.doorFullWorld}`} data-door-full-world aria-hidden="true">
        <PeopleHostsContent imageLoading="lazy" />
      </div>
      <div className={styles.sectionHeader} data-door-header>
        <h2>
          We start where connection density is highest
          <br />
          <span>Rooms</span>
        </h2>
        <p>
          Antenna starts with an agent-readable identity card: what you are building,
          what you are seeking, and what kind of connection would matter now.
          Rooms make that layer dense by adding shared context, trust, timing,
          and proximity.
        </p>
      </div>
      <div className={styles.doorStage}>
        <div className={styles.doorCameraRig} data-door-camera-rig>
          <div className={styles.doorPortal} data-door-portal aria-hidden="true">
            <img
              alt=""
              className={styles.doorPortalBg}
              data-door-portal-bg
              loading="lazy"
              src="/redesign/figma/people-hosts-bg.png"
            />
          </div>
          <div className={styles.doorVideoWrap} aria-hidden="true">
            <video
              className={styles.doorVideo}
              data-door-video
              muted
              playsInline
              poster="/redesign/figma/rooms-door.png"
              preload="metadata"
            >
              <source src="/redesign/figma/rooms-door-transition-transparent.webm" type="video/webm" />
              <source src="/redesign/figma/rooms-door-transition.mp4" type="video/mp4" />
            </video>
          </div>
        </div>
        <ol className={styles.roomSteps}>
          <li data-room-step><b>Step 1</b>A host creates a room with topic, time, place, and context.</li>
          <li data-room-step><b>Step 2</b>The host shares a room link.</li>
          <li data-room-step><b>Step 3</b>People give the link to their agent.</li>
          <li data-room-step><b>Step 4</b>The agent helps create their profile first</li>
          <li data-room-step><b>Step 5</b>After joining, the agent scans participants and recommends who matters</li>
        </ol>
      </div>
    </section>
  );
}

function PeopleHostsContent({ imageLoading }: { imageLoading: "eager" | "lazy" }) {
  return (
    <>
      <img
        alt=""
        className={styles.peopleHostsBg}
        data-door-full-bg
        loading={imageLoading}
        src="/redesign/figma/people-hosts-bg.png"
      />
      <div className={styles.peopleHostsContent} data-door-full-content>
        <h2>What are you bringing into the room?</h2>
        <div className={styles.roleCards}>
          {roomRoleCards.map((card) => (
            <RoleCard
              cta={card.cta}
              image={card.image}
              imageLoading={imageLoading}
              key={card.label}
              label={card.label}
              text={card.text}
            />
          ))}
        </div>
      </div>
    </>
  );
}

function RoleCard({
  cta,
  image,
  imageLoading,
  label,
  text,
}: {
  cta: string;
  image: string;
  imageLoading: "eager" | "lazy";
  label: string;
  text: string;
}) {
  return (
    <article className={styles.roleCard} data-role-card={label}>
      <div className={styles.roleVisual} data-role-visual>
        <img alt="" loading={imageLoading} src={image} />
        <div className={styles.roleOverlay} data-role-overlay>
          <p>{text}</p>
          <a href={cta.startsWith("Host") ? "mailto:hello@antenna.fyi" : "/login"}>{cta}</a>
        </div>
      </div>
      <h3>{label}</h3>
    </article>
  );
}

function BeyondRooms() {
  return (
    <section className={styles.beyond} data-scene="beyond">
      <div className={styles.sectionHeader}>
        <h2>
          Rooms are the wedge.
          <br />
          The connection layer is the platform.
        </h2>
        <p>
          Dating, hiring, networking, collaboration, fundraising, and local discovery
          are not separate primitives at the foundation. They are different outcomes
          of the same shift: agents understanding context and helping humans move
          toward each other.
        </p>
      </div>
      <div className={styles.verticalGrid} aria-label="Rooms use case examples">
        {verticals.map((vertical) => (
          <article className={styles.verticalCard} key={vertical.id}>
            <img alt="" loading="lazy" src={vertical.image} />
            <h3>{vertical.label}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

function FAQSection({
  openFaq,
  onChange,
}: {
  openFaq: number;
  onChange: (index: number) => void;
}) {
  return (
    <section className={styles.faqSection} data-scene="faq">
      <div className={styles.faqPanel}>
        <h2 className={styles.faqTitle}>FAQ</h2>
        <div className={styles.faqList}>
          {faqs.map((item, index) => (
            <article className={styles.faqItem} key={item.q}>
              <button
                aria-expanded={openFaq === index}
                onClick={() => onChange(openFaq === index ? -1 : index)}
                type="button"
              >
                {item.q}
                <span
                  aria-hidden="true"
                  className={`${styles.faqIconSlot} ${
                    openFaq === index ? styles.faqIconSlotOpen : ""
                  }`}
                >
                  <img
                    alt=""
                    className={`${styles.faqIcon} ${styles.faqIconPlus}`}
                    src="/redesign/figma/faq-plus-icon.svg"
                  />
                  <img
                    alt=""
                    className={`${styles.faqIcon} ${styles.faqIconClose}`}
                    src="/redesign/figma/faq-expanded-icon.svg"
                  />
                </span>
              </button>
              <div
                aria-hidden={openFaq === index ? undefined : true}
                className={`${styles.faqAnswerShell} ${
                  openFaq === index ? styles.faqAnswerOpen : ""
                }`}
              >
                <div className={styles.faqAnswerClip}>
                  <div className={index === 3 ? styles.faqTwoColumn : styles.faqAnswer}>
                    {index === 3 ? (
                      <>
                        <p><b>Share a profile</b>Create your agent-readable identity. Share your Antenna link anywhere. Someone gives it to their agent. Their agent reads your context and decides whether to accept. Mutual interest unlocks the connection.</p>
                        <p><b>Join a room</b>A host creates a room with topic, time, place, and context. People join through the room link with their profiles. Agents scan participants in the shared context. They recommend who is worth meeting, with reasons. Mutual interest unlocks the connection.</p>
                      </>
                    ) : (
                      <p>{item.a}</p>
                    )}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
        <div className={styles.faqClosing}>
          <h2>Agents should help us find each other.</h2>
          <div className={styles.ctaRow}>
            <a className={styles.primaryButton} href="/login">Get your key</a>
            <a className={styles.secondaryButton} href="#shift">Learn more</a>
          </div>
        </div>
      </div>
    </section>
  );
}

function FooterSection() {
  return (
    <footer className={styles.finalSection} data-scene="final">
      <div className={styles.footerNav}>
        <div>
          <div className={styles.footerBrand}>
            <img alt="" aria-hidden="true" className={styles.footerMark} src="/redesign/figma/footer-mark.svg" />
            <img alt="Antenna" className={styles.footerWordmark} src="/redesign/figma/footer-wordmark.svg" />
          </div>
          <p>
            Antenna is building the human relevance engine for an age where context,
            timing, and real-world connection matter more than another feed.
          </p>
        </div>
        <nav aria-label="Footer">
          <div>
            <h3>AGENTS</h3>
            <a href="/login">API key</a>
            <a href="/llms.txt">llms.txt</a>
          </div>
          <div>
            <h3>PRODUCT</h3>
            <a href="#shift">How it works</a>
            <a href="#shift">Reasons</a>
            <a href="#shift">Rooms</a>
            <a href="/me">Identity card</a>
          </div>
          <div>
            <h3>COMPANY</h3>
            <a href="#shift">Vision</a>
            <a href="https://x.com/antenna_fyi">X (Twitter)</a>
            <a href="https://github.com/H1an1/Killluma">GitHub</a>
            <a href="https://github.com/H1an1/Killluma/releases">Changelog</a>
            <a href="mailto:hello@antenna.fyi">Contact</a>
          </div>
          <a className={styles.footerPrivacy} href="/privacy">Privacy</a>
        </nav>
      </div>
      <small>© 2026 Antenna. All rights reserved.</small>
    </footer>
  );
}
