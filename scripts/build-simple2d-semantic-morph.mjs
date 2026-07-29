import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import flubber from "flubber";
import svgPathPropertiesPackage from "svg-path-properties";
import svgpath from "svgpath";

const { splitPathString } = flubber;
const { svgPathProperties } = svgPathPropertiesPackage;

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const svgNewRoot = path.join(projectRoot, "public/redesign/reasons/svgnew");
const outPath = path.join(
  projectRoot,
  "public/redesign/reasons/morphs/simple2d-you/semantic-groups.json",
);

const tokenViewBox = { width: 2036, height: 2080 };
const portraitViewBox = { width: 3036, height: 3040 };
const tokenScale = portraitViewBox.height / tokenViewBox.height;
const tokenX = (portraitViewBox.width - tokenViewBox.width * tokenScale) / 2;
const tokenY = 0;

const semanticGroups = [
  {
    id: "shell-system-to-room-context",
    label: "identity token shell becomes room-scale structure",
    tracks: [
      pair(0, 1, "outer ivory medallion retires into robe light", 0, 1, 0),
      pair(1, 0, "whole token figure becomes full portrait figure", 0.02, 1, 1),
      pair(2, 7, "blue context field dissolves before portrait", 0.04, 1, 0),
      pair(3, 9, "soft context cloud dissolves before portrait", 0.06, 0.88, 0),
      pair(11, 3, "token circular trace resolves into portrait reading", 0.08, 0.72, 0.48),
      pair(12, 31, "archival linework retires under portrait linework", 0.1, 0.48, 0.18),
      pair(13, 12, "top identity dot to upper signal", 0.14, 1, 1),
      pair(14, 27, "lower token glint to pendant edge", 0.2, 1, 0.7),
      pair(27, 13, "side token signal to orbit node", 0.16, 1, 1),
    ],
  },
  {
    id: "hair-face-reading",
    label: "avatar face becomes full human portrait",
    tracks: [
      pair(4, 5, "hair silhouette to expanded hair mass", 0.02, 1, 1),
      pair(5, 2, "deep hair linework to portrait hair linework", 0.04, 1, 1),
      pair(6, 4, "compact skin base to portrait face planes", 0.06, 1, 1),
      pair(8, 8, "face warmth to cheek and neck shadow", 0.08, 0.84, 0.88),
      pair(9, 6, "golden face planes to portrait face signal", 0.09, 0.82, 0.72),
      pair(15, 14, "left brow signal to left brow", 0.12, 1, 1),
      pair(16, 16, "left hair edge to left ear contour", 0.13, 1, 1),
      pair(17, 19, "left eye detail to left eye", 0.14, 1, 1),
      pair(18, 15, "right eye detail to right brow", 0.15, 1, 1),
      pair(19, 21, "small bridge mark to nose line", 0.16, 1, 1),
      pair(20, 18, "right bridge mark to facial contour", 0.17, 1, 1),
      pair(21, 17, "right hair edge to right ear contour", 0.18, 1, 1),
      pair(22, 20, "mouth corner to mouth contour", 0.19, 1, 1),
      pair(23, 23, "left expression line to lower mouth", 0.2, 1, 1),
      pair(24, 22, "right expression line to upper mouth", 0.21, 1, 1),
      pair(25, 25, "lower face mark to chin shadow", 0.22, 1, 1),
      pair(26, 24, "neck shadow mark to nose shadow", 0.23, 1, 1),
      pair(43, 31, "soft avatar stroke to portrait ink finish", 0.24, 0.5, 0.28),
    ],
  },
  {
    id: "laurel-pendant-robe",
    label: "classical token relics become portrait regalia",
    tracks: [
      pair(7, 6, "token laurels to portrait laurel and gold signals", 0.1, 1, 1),
      pair(10, 1, "compact robe to full shoulder drape", 0.12, 0.9, 0.95),
      pair(10, 7, "hidden robe layer opens into cloth highlight", 0.18, 0, 1),
      pair(10, 9, "hidden robe layer opens into soft cloth planes", 0.2, 0, 0.86),
      pair(28, 28, "lower dark relic to pendant shadow", 0.2, 1, 1),
      pair(29, 11, "neck shadow to pendant and necklace depth", 0.22, 1, 0.9),
      pair(30, 26, "red trim mark to robe trim", 0.24, 1, 1),
      pair(31, 29, "small trim mark to lower robe crease", 0.25, 1, 1),
      pair(32, 30, "robe accent to right trim end", 0.26, 1, 1),
    ],
  },
  {
    id: "token-only-details-retire",
    label: "extra token fragments resolve out of the portrait",
    tracks: [
      pair(33, 28, "tiny robe relic resolves into pendant shadow", 0.28, 1, 0),
      pair(34, 30, "warm token fleck resolves into robe edge", 0.29, 1, 0),
      pair(35, 27, "pendant duplicate resolves into pendant outline", 0.3, 1, 0),
      pair(36, 29, "small lower line retires into robe fold", 0.31, 1, 0),
      pair(37, 30, "small lower line retires into robe fold", 0.32, 1, 0),
      pair(38, 11, "lower shadow retires into necklace depth", 0.33, 1, 0),
      pair(39, 27, "pendant shadow retires into pendant edge", 0.34, 1, 0),
      pair(40, 27, "pendant highlight retires into pendant edge", 0.35, 1, 0),
      pair(41, 26, "trim duplicate retires into robe trim", 0.36, 1, 0),
      pair(42, 28, "lower glint retires into pendant shadow", 0.37, 1, 0),
    ],
  },
];

const data = {
  version: 1,
  source: "svg-new",
  slug: "simple2d-you",
  viewBox: `0 0 ${portraitViewBox.width} ${portraitViewBox.height}`,
  tokenTransform: {
    scale: tokenScale,
    x: tokenX,
    y: tokenY,
  },
  groups: await Promise.all(semanticGroups.map(resolveGroup)),
};

await mkdir(path.dirname(outPath), { recursive: true });
await writeFile(outPath, `${JSON.stringify(data)}\n`);
console.log(`Wrote ${outPath}`);

function pair(
  fromLayer,
  toLayer,
  label,
  delay,
  fromOpacity = 1,
  toOpacity = 1,
) {
  return {
    id: `token-${fromLayer}-to-portrait-${toLayer}`,
    label,
    delay,
    from: { kind: "token", layer: fromLayer },
    fromOpacity,
    to: { kind: "portrait", layer: toLayer },
    toOpacity,
  };
}

async function resolveTrack(track) {
  const from = await readLayer(track.from.kind, track.from.layer);
  const to = await readLayer(track.to.kind, track.to.layer);

  const fromParts = splitLayer(from);
  const toParts = splitLayer(to);

  if (fromParts.length <= 1 && toParts.length <= 1) {
    return [
      {
        id: track.id,
        label: track.label,
        delay: track.delay,
        from,
        fromOpacity: track.fromOpacity,
        to,
        toOpacity: track.toOpacity,
      },
    ];
  }

  return matchSubpaths(track, fromParts, toParts);
}

async function resolveGroup(group) {
  const trackSets = await Promise.all(group.tracks.map(resolveTrack));

  return {
    ...group,
    tracks: trackSets.flat(),
  };
}

function matchSubpaths(track, fromParts, toParts) {
  const usableFrom = fromParts.filter((part) => part.area > 8);
  const usableTo = toParts.filter((part) => part.area > 8);

  if (usableFrom.length === 0 || usableTo.length === 0) {
    return [];
  }

  const tracks = [];
  const usedFrom = new Set();
  const toByArea = [...usableTo].sort((a, b) => b.area - a.area);

  for (const toPart of toByArea) {
    const fromPart = nearestPart(toPart, usableFrom, usedFrom);
    if (!fromPart) continue;
    usedFrom.add(fromPart.partIndex);
    tracks.push(makeSubpathTrack(track, fromPart, toPart));
  }

  if ((track.fromOpacity ?? 1) > (track.toOpacity ?? 1)) {
    for (const fromPart of usableFrom) {
      if (usedFrom.has(fromPart.partIndex)) continue;
      const toPart = nearestPart(fromPart, usableTo);
      if (!toPart) continue;
      tracks.push(makeSubpathTrack(track, fromPart, toPart, true));
    }
  }

  return tracks;
}

function makeSubpathTrack(track, fromPart, toPart, retiring = false) {
  return {
    id: `${track.id}-${fromPart.partIndex}-${toPart.partIndex}${retiring ? "-retire" : ""}`,
    label: `${track.label} subpath ${fromPart.partIndex}->${toPart.partIndex}`,
    delay: track.delay,
    from: {
      ...fromPart.layer,
      d: fromPart.d,
      subpath: fromPart.partIndex,
    },
    fromOpacity: track.fromOpacity,
    to: {
      ...toPart.layer,
      d: toPart.d,
      subpath: toPart.partIndex,
    },
    toOpacity: retiring ? 0 : track.toOpacity,
  };
}

function nearestPart(anchor, candidates, used = new Set()) {
  const available = candidates.filter((part) => !used.has(part.partIndex));
  const pool = available.length > 0 ? available : candidates;

  return pool.reduce((best, part) => {
    const distance =
      Math.hypot(part.cx - anchor.cx, part.cy - anchor.cy) +
      Math.abs(Math.log((part.area + 1) / (anchor.area + 1))) * 120;

    if (!best || distance < best.distance) {
      return { distance, part };
    }

    return best;
  }, null)?.part;
}

function splitLayer(layer) {
  return splitPathString(layer.d)
    .map((d, partIndex) => {
      const bounds = pathBounds(d);
      return {
        ...bounds,
        d,
        layer,
        partIndex,
      };
    })
    .filter((part) => Number.isFinite(part.area));
}

function pathBounds(d) {
  const props = new svgPathProperties(d);
  const length = props.getTotalLength();
  const steps = Math.max(24, Math.min(360, Math.ceil(length / 12)));
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (let index = 0; index <= steps; index += 1) {
    const point = props.getPointAtLength((index / steps) * length);
    if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) continue;
    minX = Math.min(minX, point.x);
    minY = Math.min(minY, point.y);
    maxX = Math.max(maxX, point.x);
    maxY = Math.max(maxY, point.y);
  }

  const width = Math.max(0, maxX - minX);
  const height = Math.max(0, maxY - minY);

  return {
    area: width * height,
    cx: minX + width / 2,
    cy: minY + height / 2,
    height,
    width,
  };
}

async function readLayer(kind, layer) {
  const file = path.join(
    svgNewRoot,
    `simple2d-you-${kind}-layers/layer-${String(layer).padStart(2, "0")}.svg`,
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
  const strokeWidth = Number(attribute(pathTag, "stroke-width") ?? "0.6");
  const opacity = Number(
    attribute(pathTag, "fill-opacity") ??
      attribute(pathTag, "opacity") ??
      "1",
  );

  return {
    kind,
    layer,
    d: kind === "token" ? transformTokenPath(d) : d,
    fill,
    opacity,
    stroke,
    strokeOpacity: strokeOpacity ? Number(strokeOpacity) : null,
    strokeWidth,
  };
}

function transformTokenPath(d) {
  return svgpath(d)
    .scale(tokenScale)
    .translate(tokenX, tokenY)
    .round(2)
    .toString();
}

function attribute(tag, name) {
  return tag.match(new RegExp(`\\b${name}="([^"]*)"`))?.[1] ?? null;
}
