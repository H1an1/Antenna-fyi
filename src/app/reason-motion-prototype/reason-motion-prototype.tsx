"use client";

import {
  AnimatePresence,
  LayoutGroup,
  MotionConfig,
  motion,
} from "motion/react";
import { useState, type ReactNode } from "react";
import styles from "./reason-motion-prototype.module.css";

const spring = {
  type: "spring" as const,
  stiffness: 360,
  damping: 32,
  mass: 0.9,
};

const softSpring = {
  type: "spring" as const,
  stiffness: 240,
  damping: 28,
  mass: 1,
};

const smoothEase = [0.16, 1, 0.3, 1] as const;

const reason =
  "She is building distribution for AI tools. You have been looking for someone who understands community-led growth.";

const people = {
  her: {
    name: "Serena",
    title: "Building distribution for AI tools",
    signal: "AI tool adoption, founder-led distribution, market loops",
    glyph: "Distribution",
    morph: createMorphAsset("serena", 30, 48),
  },
  you: {
    name: "You",
    title: "Looking for community-led growth",
    signal: "Community strategy, trusted launches, room-level context",
    glyph: "Community",
    morph: createMorphAsset("you", 63, 69, {
      portraitScale: 0.76,
      portraitY: 18,
    }),
  },
} as const;

const quietSignals = [
  "You both keep circling the same question: how agents should remember people.",
  "You came here looking for investors; this founder can pressure-test the product.",
];

type MorphAsset = {
  display: MorphDisplay;
  portraitLayers: string[];
  slug: string;
  tokenLayers: string[];
};

type MorphDisplay = {
  portraitScale: number;
  portraitX: number;
  portraitY: number;
  tokenExpandedScale: number;
  tokenExpandedY: number;
  tokenScale: number;
  tokenY: number;
};

function createMorphAsset(
  slug: string,
  tokenLayerCount: number,
  portraitLayerCount: number,
  display?: Partial<MorphDisplay>,
): MorphAsset {
  return {
    display: {
      portraitScale: display?.portraitScale ?? 0.94,
      portraitX: display?.portraitX ?? 0,
      portraitY: display?.portraitY ?? 0,
      tokenExpandedScale: display?.tokenExpandedScale ?? 1.08,
      tokenExpandedY: display?.tokenExpandedY ?? 0,
      tokenScale: display?.tokenScale ?? 1,
      tokenY: display?.tokenY ?? 0,
    },
    slug,
    tokenLayers: Array.from(
      { length: tokenLayerCount },
      (_, index) =>
        `/redesign/reasons/svgnew/${slug}-token-layers/layer-${String(index).padStart(2, "0")}.svg`,
    ),
    portraitLayers: Array.from(
      { length: portraitLayerCount },
      (_, index) =>
        `/redesign/reasons/svgnew/${slug}-portrait-layers/layer-${String(index).padStart(2, "0")}.svg`,
    ),
  };
}

export function ReasonMotionPrototype() {
  const [expanded, setExpanded] = useState(false);

  return (
    <MotionConfig transition={spring}>
      <main className={styles.page}>
        <section className={styles.hero}>
          <p className={styles.eyebrow}>Reasons Feed</p>
          <h1>Antenna notices relevance before people do.</h1>
          <p>Not profiles. Not swipes. Context your agent can reason about.</p>
        </section>

        <LayoutGroup>
          <motion.section className={styles.stageShell} layout>
            <div className={styles.stageHeader}>
              <span>Example signals</span>
              <b>Room context active</b>
            </div>

            <motion.button
              aria-expanded={expanded}
              className={styles.signal}
              data-expanded={expanded}
              layout
              onClick={() => setExpanded((value) => !value)}
              type="button"
            >
              <motion.div
                className={styles.signalSurface}
                data-expanded={expanded}
                layoutId="signal-surface"
              />

              <AnimatePresence initial={false} mode="popLayout">
                {expanded ? (
                  <ExpandedSignal key="expanded" />
                ) : (
                  <CollapsedSignal key="collapsed" />
                )}
              </AnimatePresence>
            </motion.button>

            <motion.div className={styles.quietFeed} layout>
              {quietSignals.map((item) => (
                <motion.div
                  animate={{
                    opacity: expanded ? 0.22 : 0.72,
                    y: expanded ? 8 : 0,
                    scale: expanded ? 0.985 : 1,
                  }}
                  className={styles.quietSignal}
                  key={item}
                  layout
                >
                  <span />
                  <p>{item}</p>
                </motion.div>
              ))}
            </motion.div>
          </motion.section>
        </LayoutGroup>
      </main>
    </MotionConfig>
  );
}

function CollapsedSignal() {
  return (
    <motion.div
      animate={{ opacity: 1, filter: "blur(0px)" }}
      className={styles.collapsed}
      exit={{
        opacity: 0,
        filter: "blur(8px)",
        transition: { duration: 0.16 },
      }}
      initial={{ opacity: 0, filter: "blur(8px)" }}
      layout
    >
      <motion.div className={styles.compactPeople} layout>
        <CompactToken side="her" />
        <CompactToken side="you" />
      </motion.div>

      <motion.div
        className={styles.compactReason}
        layoutId="reason-panel"
        transition={softSpring}
      >
        <span className={styles.reasonLabel}>Agent reason</span>
        <strong>{reason}</strong>
        <small>Distribution signal + current intent + room timing</small>
      </motion.div>

      <motion.div
        className={styles.compactScore}
        layoutId="relevance-score"
        transition={softSpring}
      >
        <b>92</b>
        <span>relevance</span>
      </motion.div>
    </motion.div>
  );
}

function ExpandedSignal() {
  return (
    <motion.div
      animate="show"
      className={styles.expanded}
      exit="hide"
      initial="hide"
      layout
    >
      <GraphField />

      <PortraitPanel side="her" />
      <PortraitPanel side="you" />

      <motion.div
        className={styles.expandedReason}
        layoutId="reason-panel"
        transition={softSpring}
      >
        <motion.span
          className={styles.reasonLabel}
          variants={fadeUp(0.08, 8)}
        >
          Why this person
        </motion.span>
        <motion.strong variants={fadeUp(0.16, 14)}>{reason}</motion.strong>
        <motion.div className={styles.reasonFooter} variants={fadeUp(0.28, 12)}>
          <span>Same room</span>
          <span>Complementary context</span>
          <span>Useful timing</span>
        </motion.div>
      </motion.div>

      <motion.div className={styles.relevanceCore} variants={scaleIn(0.12)}>
        <motion.span
          className={styles.scoreOrb}
          layoutId="relevance-score"
          transition={softSpring}
        >
          <b>92</b>
          <small>match</small>
        </motion.span>
      </motion.div>

      <motion.div className={styles.signalDetails} variants={fadeUp(0.34, 18)}>
        <Detail label="Her Signal">{people.her.signal}</Detail>
        <Detail label="Your Intent">{people.you.signal}</Detail>
        <Detail label="Antenna Read">
          She understands the distribution problem behind what you are trying
          to build.
        </Detail>
      </motion.div>

      <motion.div className={styles.unlockDock} variants={fadeUp(0.44, 18)}>
        <button
          onClick={(event) => {
            event.stopPropagation();
          }}
          type="button"
        >
          Unlock connection
        </button>
      </motion.div>
    </motion.div>
  );
}

function CompactToken({ side }: { side: keyof typeof people }) {
  const person = people[side];

  return (
    <motion.div
      className={styles.compactToken}
      data-side={side}
      layoutId={`person-${side}`}
      transition={softSpring}
    >
      <motion.div
        className={styles.tokenAssetFrame}
        layoutId={`person-token-${side}`}
        transition={softSpring}
      >
        <SvgNewLayeredFigure asset={person.morph} compact expanded={false} />
      </motion.div>
    </motion.div>
  );
}

function PortraitPanel({ side }: { side: keyof typeof people }) {
  const person = people[side];

  return (
    <motion.div
      className={styles.portraitPanel}
      data-side={side}
      layoutId={`person-${side}`}
      transition={softSpring}
    >
      <motion.div
        animate={{
          clipPath: "inset(0% 0% 0% 0% round 26px)",
          opacity: 1,
        }}
        className={styles.portraitReveal}
        initial={{
          clipPath: "inset(34% 35% 34% 35% round 999px)",
          opacity: 0.86,
        }}
        transition={{ duration: 0.76, ease: smoothEase }}
      >
        <span className={styles.panelGlow} />
        <motion.div
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className={styles.semanticPortraitFrame}
          initial={{ opacity: 1, scale: 0.54, y: 4 }}
          layoutId={`person-token-${side}`}
          transition={{ duration: 0.86, ease: smoothEase }}
        >
          <SvgNewLayeredFigure asset={person.morph} enterFromToken expanded />
        </motion.div>
        <span className={styles.panelGlyph}>{person.glyph}</span>
      </motion.div>

      <motion.div className={styles.personText} variants={fadeUp(0.24, 16)}>
        <b>{person.name}</b>
        <span>{person.title}</span>
      </motion.div>
    </motion.div>
  );
}

function SvgNewLayeredFigure({
  asset,
  compact = false,
  enterFromToken = false,
  expanded,
}: {
  asset: MorphAsset;
  compact?: boolean;
  enterFromToken?: boolean;
  expanded: boolean;
}) {
  return (
    <div
      aria-hidden="true"
      className={styles.svgNewMorph}
      data-compact={compact}
      data-expanded={expanded}
    >
      <motion.div
        animate={{
          opacity: 1,
          scale: expanded
            ? asset.display.tokenExpandedScale
            : asset.display.tokenScale,
          y: expanded ? asset.display.tokenExpandedY : asset.display.tokenY,
        }}
        className={styles.svgNewStack}
        data-kind="token"
        initial={enterFromToken ? { opacity: 1, scale: 1 } : false}
        transition={{ duration: 0.88, ease: smoothEase }}
      >
        {asset.tokenLayers.map((src, index) => (
          <motion.img
            alt=""
            animate={
              expanded
                ? tokenLayerExit(index, asset.tokenLayers.length)
                : { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 }
            }
            className={styles.svgNewLayer}
            decoding="async"
            draggable={false}
            initial={
              enterFromToken
                ? { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 }
                : false
            }
            key={src}
            src={src}
            transition={{
              duration: 0.94,
              ease: smoothEase,
              delay: expanded ? index * 0.004 : 0,
            }}
          />
        ))}
      </motion.div>

      <motion.div
        animate={{
          opacity: expanded ? 1 : 0,
          scale: expanded ? asset.display.portraitScale : 0.68,
          x: expanded ? asset.display.portraitX : 0,
          y: expanded ? asset.display.portraitY : 26,
        }}
        className={styles.svgNewStack}
        data-kind="portrait"
        initial={enterFromToken ? { opacity: 0, scale: 0.68, y: 26 } : false}
        transition={{
          duration: 0.9,
          ease: smoothEase,
          delay: expanded ? 0.1 : 0,
        }}
      >
        {asset.portraitLayers.map((src, index) => (
          <motion.img
            alt=""
            animate={
              expanded
                ? { opacity: 1, rotate: 0, scale: 1, x: 0, y: 0 }
                : portraitLayerIntro(index, asset.portraitLayers.length)
            }
            className={styles.svgNewLayer}
            decoding="async"
            draggable={false}
            initial={
              enterFromToken
                ? portraitLayerIntro(index, asset.portraitLayers.length)
                : false
            }
            key={src}
            src={src}
            transition={{
              duration: 0.86,
              ease: smoothEase,
              delay: expanded ? 0.12 + index * 0.003 : 0,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}

function tokenLayerExit(index: number, layerCount: number) {
  const angle = (index / layerCount) * Math.PI * 2 - Math.PI / 2;
  const shellLayer = index < 4;
  const badgeLayer = index < 8;
  const radius = shellLayer ? 18 : 28 + (index % 5) * 5;

  return {
    opacity: shellLayer ? 0 : badgeLayer ? 0.08 : 0,
    rotate: shellLayer ? 0 : (index % 2 === 0 ? -1 : 1) * (1 + (index % 3)),
    scale: shellLayer ? 1.22 : 1.04 + (index % 4) * 0.018,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius + (shellLayer ? 78 : 34),
  };
}

function portraitLayerIntro(index: number, layerCount: number) {
  const angle = (index / layerCount) * Math.PI * 2 - Math.PI / 2;
  const detailLayer = index > 4;
  const radius = detailLayer ? 22 : 12;

  return {
    opacity: 0,
    rotate: (index % 2 === 0 ? -1 : 1) * 0.8,
    scale: 0.9,
    x: Math.cos(angle) * radius,
    y: Math.sin(angle) * radius + 18,
  };
}

function GraphField() {
  return (
    <motion.div className={styles.graphField} variants={fadeIn(0.08)}>
      <svg aria-hidden="true" viewBox="0 0 900 480">
        <motion.path
          d="M139 161 C245 112 339 107 451 214 C548 307 643 332 764 205"
          fill="none"
          pathLength={1}
          stroke="currentColor"
          strokeWidth="1"
          variants={drawPath(0.16)}
        />
        <motion.path
          d="M157 315 C285 247 374 278 450 214 C540 139 629 116 744 286"
          fill="none"
          pathLength={1}
          stroke="currentColor"
          strokeWidth="1"
          variants={drawPath(0.26)}
        />
        {[139, 274, 451, 618, 764].map((x, index) => (
          <motion.circle
            animate={{ opacity: 1, scale: 1 }}
            cx={x}
            cy={[161, 262, 214, 284, 205][index]}
            fill="currentColor"
            initial={{ opacity: 0, scale: 0.2 }}
            key={x}
            r={index === 2 ? 4 : 2.5}
            transition={{ ...spring, delay: 0.2 + index * 0.05 }}
          />
        ))}
      </svg>
    </motion.div>
  );
}

function Detail({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className={styles.detail}>
      <b>{label}</b>
      <span>{children}</span>
    </div>
  );
}

function fadeIn(delay = 0) {
  return {
    hide: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { duration: 0.5, delay, ease: smoothEase },
    },
  };
}

function fadeUp(delay = 0, y = 16) {
  return {
    hide: { opacity: 0, y, filter: "blur(8px)" },
    show: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.58, delay, ease: smoothEase },
    },
  };
}

function scaleIn(delay = 0) {
  return {
    hide: { opacity: 0, scale: 0.66, filter: "blur(10px)" },
    show: {
      opacity: 1,
      scale: 1,
      filter: "blur(0px)",
      transition: { ...spring, delay },
    },
  };
}

function drawPath(delay = 0) {
  return {
    hide: { opacity: 0, pathLength: 0 },
    show: {
      opacity: 1,
      pathLength: 1,
      transition: { duration: 0.9, delay, ease: smoothEase },
    },
  };
}
