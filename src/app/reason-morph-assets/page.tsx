"use client";

import { motion } from "motion/react";
import { useState } from "react";
import styles from "./reason-morph-assets.module.css";

const smoothEase = [0.16, 1, 0.3, 1] as const;

type MorphAsset = {
  archetype: string;
  display: MorphDisplay;
  name: string;
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

const morphAssets: MorphAsset[] = [
  createMorphAsset("simple2d-you", "You 2D", "Semantic morph", 44, 32, {
    portraitScale: 0.84,
    portraitY: -10,
  }),
  createMorphAsset("serena", "Serena", "Distribution", 30, 48),
  createMorphAsset("you", "You", "Community growth", 63, 69, {
    portraitScale: 0.76,
    portraitY: 18,
  }),
  createMorphAsset("cassian", "Cassian", "Builder craft", 16, 19, {
    portraitScale: 0.92,
    portraitY: 6,
  }),
  createMorphAsset("mira", "Mira", "Host community", 16, 33),
];

export default function ReasonMorphAssetsPage() {
  return (
    <main className={styles.page}>
      <section className={styles.header}>
        <p>Local Morph Assets</p>
        <h1>Token to portrait previews</h1>
      </section>

      <section className={styles.grid} aria-label="Reason morph previews">
        {morphAssets.map((asset) => (
          <MorphCard asset={asset} key={asset.slug} />
        ))}
      </section>
    </main>
  );
}

function MorphCard({ asset }: { asset: MorphAsset }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <button
      aria-expanded={expanded}
      className={styles.card}
      data-expanded={expanded}
      onClick={() => setExpanded((value) => !value)}
      type="button"
    >
      <span className={styles.assetLabel}>
        <b>{asset.name}</b>
        <small>{asset.archetype}</small>
      </span>
      <SvgNewLayeredFigure asset={asset} expanded={expanded} />
      <span className={styles.layerCount}>
        {asset.tokenLayers.length} token layers / {asset.portraitLayers.length}{" "}
        portrait layers
      </span>
    </button>
  );
}

function SvgNewLayeredFigure({
  asset,
  expanded,
}: {
  asset: MorphAsset;
  expanded: boolean;
}) {
  return (
    <div aria-hidden="true" className={styles.morph}>
      <motion.div
        animate={{
          opacity: 1,
          scale: expanded
            ? asset.display.tokenExpandedScale
            : asset.display.tokenScale,
          y: expanded ? asset.display.tokenExpandedY : asset.display.tokenY,
        }}
        className={styles.layerStack}
        data-kind="token"
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
            className={styles.layer}
            decoding="async"
            draggable={false}
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
        className={styles.layerStack}
        data-kind="portrait"
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
            className={styles.layer}
            decoding="async"
            draggable={false}
            initial={portraitLayerIntro(index, asset.portraitLayers.length)}
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

function createMorphAsset(
  slug: string,
  name: string,
  archetype: string,
  tokenLayerCount: number,
  portraitLayerCount: number,
  display?: Partial<MorphDisplay>,
): MorphAsset {
  return {
    archetype,
    display: {
      portraitScale: display?.portraitScale ?? 0.94,
      portraitX: display?.portraitX ?? 0,
      portraitY: display?.portraitY ?? 0,
      tokenExpandedScale: display?.tokenExpandedScale ?? 1.08,
      tokenExpandedY: display?.tokenExpandedY ?? 0,
      tokenScale: display?.tokenScale ?? 1,
      tokenY: display?.tokenY ?? 0,
    },
    name,
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

function tokenLayerExit(index: number, layerCount: number) {
  const angle = (index / layerCount) * Math.PI * 2 - Math.PI / 2;
  const shellLayer = index < 4;
  const radius = shellLayer ? 18 : 28 + (index % 5) * 5;

  return {
    opacity: 0,
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
