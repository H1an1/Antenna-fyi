import { copyFile, mkdir, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectDir, "../..");
const assetsDir = path.join(projectDir, "assets");

const assets = [
  {
    role: "wordmark",
    source: "public/brand/antenna.svg",
    dest: "antenna.svg",
  },
  {
    role: "current-profile-back",
    source: "public/profile-assets/ascii-profile-back.mp4",
    dest: "profile-current.mp4",
  },
  {
    role: "archetype-01-hermes",
    source: "public/profile-archetypes/profile-back/01-Hermes-赫尔墨斯.mp4",
    dest: "profile-01-hermes.mp4",
  },
  {
    role: "archetype-02-athena",
    source: "public/profile-archetypes/profile-back/02-Athena-雅典娜.mp4",
    dest: "profile-02-athena.mp4",
  },
  {
    role: "archetype-03-prometheus",
    source: "public/profile-archetypes/profile-back/03-Prometheus-普罗米修斯.mp4",
    dest: "profile-03-prometheus.mp4",
  },
  {
    role: "archetype-04-apollo",
    source: "public/profile-archetypes/profile-back/04-Apollo-阿波罗.mp4",
    dest: "profile-04-apollo.mp4",
  },
  {
    role: "archetype-05-artemis",
    source: "public/profile-archetypes/profile-back/05-Artemis-阿尔忒弥斯.mp4",
    dest: "profile-05-artemis.mp4",
  },
  {
    role: "archetype-06-aphrodite",
    source: "public/profile-archetypes/profile-back/06-Aphrodite-阿佛洛狄忒.mp4",
    dest: "profile-06-aphrodite.mp4",
  },
  {
    role: "archetype-07-dionysus",
    source: "public/profile-archetypes/profile-back/07-Dionysus-狄俄尼索斯.mp4",
    dest: "profile-07-dionysus.mp4",
  },
  {
    role: "archetype-08-hades",
    source: "public/profile-archetypes/profile-back/08-Hades-哈迪斯.mp4",
    dest: "profile-08-hades.mp4",
  },
  {
    role: "archetype-09-persephone",
    source: "public/profile-archetypes/profile-back/09-Persephone-珀耳塞福涅.mp4",
    dest: "profile-09-persephone.mp4",
  },
  {
    role: "archetype-10-odysseus",
    source: "public/profile-archetypes/profile-back/10-Odysseus-奥德修斯.mp4",
    dest: "profile-10-odysseus.mp4",
  },
];

await mkdir(assetsDir, { recursive: true });

const manifest = [];

for (const asset of assets) {
  const sourcePath = path.join(repoRoot, asset.source);
  const destPath = path.join(assetsDir, asset.dest);
  const sourceInfo = await stat(sourcePath);
  if (!sourceInfo.isFile() || sourceInfo.size === 0) {
    throw new Error(`Source asset is missing or empty: ${sourcePath}`);
  }
  await copyFile(sourcePath, destPath);
  const destInfo = await stat(destPath);
  manifest.push({
    role: asset.role,
    source: asset.source,
    file: `assets/${asset.dest}`,
    bytes: destInfo.size,
  });
}

await writeFile(
  path.join(assetsDir, "asset-manifest.json"),
  `${JSON.stringify({ assets: manifest }, null, 2)}\n`,
);

console.log(`Copied ${manifest.length} assets into ${assetsDir}`);
