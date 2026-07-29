import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicRoot = path.join(projectRoot, "public");
const characterSetsPath = path.join(
  publicRoot,
  "redesign/reasons/character-sets.json",
);
const morphRoot = path.join(publicRoot, "redesign/reasons/morphs");

const characterSets = JSON.parse(await readFile(characterSetsPath, "utf8"));
const morphIndex = [];

const defaultDisplay = {
  tokenScale: 1,
  tokenY: 0,
  tokenExpandedScale: 1.08,
  tokenExpandedY: 0,
  portraitScale: 0.94,
  portraitX: 0,
  portraitY: 0,
};

const displayTuning = {
  you: {
    ...defaultDisplay,
    portraitScale: 0.76,
    portraitY: 18,
  },
  cassian: {
    ...defaultDisplay,
    portraitScale: 0.92,
    portraitY: 6,
  },
};

for (const character of characterSets) {
  if (character.status !== "svgnew_layered") {
    console.warn(`Skipping ${character.slug}: ${character.status}`);
    continue;
  }

  const manifest = buildMorphManifest(character);
  const outDir = path.join(morphRoot, character.slug);
  await mkdir(outDir, { recursive: true });
  await writeFile(
    path.join(outDir, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
  );
  morphIndex.push({
    slug: manifest.slug,
    name: manifest.name,
    archetype: manifest.archetype,
    manifest: `/redesign/reasons/morphs/${manifest.slug}/manifest.json`,
    tokenLayerCount: manifest.token.layerCount,
    portraitLayerCount: manifest.portrait.layerCount,
  });
}

await writeFile(
  path.join(morphRoot, "index.json"),
  `${JSON.stringify({ generatedAt: new Date().toISOString(), characters: morphIndex }, null, 2)}\n`,
);

console.log(`Wrote ${morphIndex.length} morph manifests to ${morphRoot}`);

function buildMorphManifest(character) {
  const token = buildAsset(character, "token");
  const portrait = buildAsset(character, "portrait");
  const display = displayTuning[character.slug] ?? defaultDisplay;

  return {
    version: 1,
    strategy: "svgnew-layered-token-to-portrait",
    slug: character.slug,
    name: character.name,
    archetype: character.archetype,
    pair: character.pair ?? null,
    token,
    portrait,
    display,
    animation: {
      durationMs: 920,
      easing: [0.16, 1, 0.3, 1],
      tokenExit: {
        kind: "radial-drift",
        keepShellLayers: 4,
        keepBadgeLayers: 8,
        shellOpacity: 0,
        badgeOpacity: 0.08,
        baseRadius: 28,
        shellRadius: 18,
        yBias: 34,
        shellYBias: 78,
      },
      portraitIntro: {
        kind: "radial-converge",
        detailLayerStart: 5,
        detailRadius: 22,
        baseRadius: 12,
        yBias: 18,
      },
    },
  };
}

function buildAsset(character, kind) {
  const count = character.svgNew[`${kind}LayerCount`];
  const full = character.svgNew[`${kind}Full`];
  const layerDir = character.svgNew[`${kind}Layers`];
  const fullPath = path.join(publicRoot, full.replace(/^\//, ""));
  const rootTag = readSvgRoot(fullPath);

  return {
    png: character[`${kind}Png`],
    fullSvg: full,
    layers: Array.from(
      { length: count },
      (_, index) => `${layerDir}/layer-${String(index).padStart(2, "0")}.svg`,
    ),
    layerCount: count,
    intrinsic: rootTag,
  };
}

function readSvgRoot(filePath) {
  const svg = readFileSyncText(filePath);
  const tag = svg.match(/<svg\b[^>]*>/)?.[0] ?? "";
  const width = tag.match(/\bwidth="([^"]+)"/)?.[1] ?? null;
  const height = tag.match(/\bheight="([^"]+)"/)?.[1] ?? null;
  const viewBox = tag.match(/\bviewBox="([^"]+)"/)?.[1] ?? null;

  return { width, height, viewBox };
}

function readFileSyncText(filePath) {
  return readFileSync(filePath, "utf8");
}
