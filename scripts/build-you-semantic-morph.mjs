import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svgpath from "svgpath";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svgNewRoot = path.join(projectRoot, "public/redesign/reasons/svgnew");
const outPath = path.join(
  projectRoot,
  "public/redesign/reasons/morphs/you/semantic-groups.json",
);

const tokenScale = 2204 / 1776;
const tokenY = -80;

const semanticGroups = [
  {
    id: "identity-shell-to-robe",
    label: "identity medallion shell to robe structure",
    tracks: [
      pair("token", 0, "portrait", 0, "outer shell to robe base", 0),
      pair("token", 1, "portrait", 2, "soft shell to robe highlight", 0.03),
      pair("token", 2, "portrait", 1, "inner medallion to collar shadow", 0.05),
    ],
  },
  {
    id: "laurel-to-shoulders",
    label: "laurel and green token marks to shoulder/collar shape",
    tracks: [
      pair("token", 4, "portrait", 1, "left laurel to collar mass", 0.06),
      pair("token", 5, "portrait", 10, "right laurel to shoulder shadow", 0.08),
      pair("token", 8, "portrait", 3, "green token edge to left drape", 0.1),
      pair("token", 16, "portrait", 2, "small green signal to robe highlight", 0.12),
    ],
  },
  {
    id: "face-hair-core",
    label: "token avatar linework to portrait face and hair",
    tracks: [
      pair("token", 62, "portrait", 68, "avatar linework to full portrait linework", 0.02),
      pair("token", 3, "portrait", 5, "dark hair mask to portrait hair", 0.04),
      pair("token", 12, "portrait", 12, "face shadow to hair detail", 0.08),
      pair("token", 20, "portrait", 14, "tiny dark detail to facial contour", 0.12),
    ],
  },
  {
    id: "warm-skin-to-expression",
    label: "warm token figure fragments to skin and expression",
    tracks: [
      pair("token", 6, "portrait", 7, "gold figure to skin light", 0.1),
      pair("token", 9, "portrait", 9, "brown contour to facial warmth", 0.13),
      pair("token", 10, "portrait", 6, "orange figure detail to cheek/neck", 0.16),
      pair("token", 15, "portrait", 4, "small warm signal to face shadow", 0.19),
      pair("token", 17, "portrait", 8, "brown accent to expression line", 0.22),
    ],
  },
  {
    id: "signals-to-orbit",
    label: "medallion signals to portrait orbit and gold highlights",
    tracks: [
      pair("token", 11, "portrait", 13, "gold arc to portrait halo signal", 0.18),
      pair("token", 13, "portrait", 15, "gold trace to orbit node", 0.2),
      pair("token", 14, "portrait", 16, "inner signal to orbit detail", 0.22),
      pair("token", 19, "portrait", 11, "small gold mark to upper highlight", 0.24),
    ],
  },
];

const data = {
  version: 1,
  source: "svg-new",
  slug: "you",
  viewBox: "0 0 2204 2996",
  tokenTransform: {
    scale: tokenScale,
    x: 0,
    y: tokenY,
  },
  groups: await Promise.all(
    semanticGroups.map(async (group) => ({
      ...group,
      tracks: await Promise.all(group.tracks.map(resolveTrack)),
    })),
  ),
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(data)}\n`);
console.log(`Wrote ${outPath}`);

function pair(fromKind, fromLayer, toKind, toLayer, label, delay) {
  return {
    id: `${fromKind}-${fromLayer}-to-${toKind}-${toLayer}`,
    label,
    from: { kind: fromKind, layer: fromLayer },
    to: { kind: toKind, layer: toLayer },
    delay,
  };
}

async function resolveTrack(track) {
  const from = await readLayer(track.from.kind, track.from.layer);
  const to = await readLayer(track.to.kind, track.to.layer);

  return {
    id: track.id,
    label: track.label,
    delay: track.delay,
    from,
    to,
  };
}

async function readLayer(kind, layer) {
  const file = path.join(
    svgNewRoot,
    `you-${kind}-layers/layer-${String(layer).padStart(2, "0")}.svg`,
  );
  const svg = await readFile(file, "utf8");
  const pathTag = svg.match(/<path\b[^>]*>/)?.[0];
  if (!pathTag) {
    throw new Error(`No path found in ${file}`);
  }

  const d = attribute(pathTag, "d");
  const fill = attribute(pathTag, "fill") ?? "#112116";
  const stroke = attribute(pathTag, "stroke") ?? fill;
  const strokeOpacity = attribute(pathTag, "stroke-opacity");
  const strokeWidth = Number(attribute(pathTag, "stroke-width") ?? "0.8");

  return {
    kind,
    layer,
    d: kind === "token" ? transformTokenPath(d) : d,
    fill,
    stroke,
    strokeOpacity: strokeOpacity ? Number(strokeOpacity) : null,
    strokeWidth,
  };
}

function transformTokenPath(d) {
  return svgpath(d).scale(tokenScale).translate(0, tokenY).round(2).toString();
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
}
