import { mkdir, readFile, rename, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifestPath = path.join(
  projectRoot,
  "public/redesign/reasons/character-sets.json",
);
const svgNewRoot = path.join(projectRoot, "public/redesign/reasons/svgnew");

const API_BASE = process.env.SVG_NEW_API_URL || "https://svg.new";
const API_KEY = process.env.SVG_NEW_API_KEY;

if (!API_KEY) {
  throw new Error("Set SVG_NEW_API_KEY before running vectorization.");
}

const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const args = process.argv.slice(2);
const force = args.includes("--force");
const requestedSlugs = new Set(args.filter((arg) => arg !== "--force"));
const targets = manifest.filter((item) => {
  if (requestedSlugs.size === 0) return item.status !== "svgnew_layered";
  return requestedSlugs.has(item.slug);
});

if (targets.length === 0) {
  console.log("No matching pending character sets.");
  process.exit(0);
}

for (const character of targets) {
  await vectorizeCharacter(character);
}

async function vectorizeCharacter(character) {
  await maybeVectorizeAsset(character, "token", character.tokenPng);
  await maybeVectorizeAsset(character, "portrait", character.portraitPng);
  updateCharacterStatus(character);
  await writeManifest();
}

async function maybeVectorizeAsset(character, kind, publicPath) {
  const countKey = `${kind}LayerCount`;
  if (!force && Number.isInteger(character.svgNew[countKey])) {
    console.log(
      `Skipping ${character.slug} ${kind}: ${character.svgNew[countKey]} layers already recorded.`,
    );
    return;
  }

  const layerCount = await vectorizeAsset(character.slug, kind, publicPath);
  character.svgNew[countKey] = layerCount;
  updateCharacterStatus(character);
  await writeManifest();
}

async function vectorizeAsset(slug, kind, publicPath) {
  const inputPath = path.join(projectRoot, "public", publicPath.replace(/^\//, ""));
  const image = `data:image/png;base64,${(await readFile(inputPath)).toString(
    "base64",
  )}`;

  console.log(`Vectorizing ${slug} ${kind}...`);
  const response = await fetch(`${API_BASE}/api/agent/vectorize`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ image }),
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(`${slug} ${kind}: ${data.error || response.statusText}`);
  }

  const fullPath = path.join(svgNewRoot, `${slug}-${kind}-full.svg`);
  await mkdir(path.dirname(fullPath), { recursive: true });
  await writeFile(fullPath, data.svg);
  const layerCount = await splitSvgIntoLayers(
    data.svg,
    path.join(svgNewRoot, `${slug}-${kind}-layers`),
  );

  console.log(
    `${slug} ${kind}: ${layerCount} layers, credits remaining ${
      data.metadata?.credits_remaining ?? "unknown"
    }`,
  );

  return layerCount;
}

async function splitSvgIntoLayers(svg, outDir) {
  const openTag = svg.match(/<svg\b[^>]*>/)?.[0];
  if (!openTag) throw new Error("SVG missing root tag.");

  const defsEnd = svg.indexOf("</defs>");
  const body = defsEnd === -1 ? svg : svg.slice(defsEnd + "</defs>".length);
  const pathTags = [...body.matchAll(/<path\b[^>]*>/g)].map((match) => match[0]);

  await rm(outDir, { recursive: true, force: true });
  await mkdir(outDir, { recursive: true });

  for (const [index, pathTag] of pathTags.entries()) {
    const layer = `${openTag}\n${pathTag}\n</svg>\n`;
    await writeFile(
      path.join(outDir, `layer-${String(index).padStart(2, "0")}.svg`),
      layer,
    );
  }

  return pathTags.length;
}

function updateCharacterStatus(character) {
  const hasToken = Number.isInteger(character.svgNew.tokenLayerCount);
  const hasPortrait = Number.isInteger(character.svgNew.portraitLayerCount);

  character.status =
    hasToken && hasPortrait
      ? "svgnew_layered"
      : hasToken || hasPortrait
        ? "svgnew_partial"
        : "raster_ready_svgnew_pending";
}

async function writeManifest() {
  const tmpPath = `${manifestPath}.tmp`;
  await writeFile(tmpPath, `${JSON.stringify(manifest, null, 2)}\n`);
  await rename(tmpPath, manifestPath);
}
