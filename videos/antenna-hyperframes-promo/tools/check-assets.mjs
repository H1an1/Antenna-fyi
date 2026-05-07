import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const assetsDir = path.join(projectDir, "assets");

const requiredFiles = [
  "dashboard-interaction.mp4",
  "antenna.svg",
  "profile-current.mp4",
  "profile-01-hermes.mp4",
  "profile-02-athena.mp4",
  "profile-03-prometheus.mp4",
  "profile-04-apollo.mp4",
  "profile-05-artemis.mp4",
  "profile-06-aphrodite.mp4",
  "profile-07-dionysus.mp4",
  "profile-08-hades.mp4",
  "profile-09-persephone.mp4",
  "profile-10-odysseus.mp4",
  "asset-manifest.json",
];

for (const file of requiredFiles) {
  const fullPath = path.join(assetsDir, file);
  const info = await stat(fullPath);
  if (!info.isFile() || info.size === 0) {
    throw new Error(`Required asset is missing or empty: ${fullPath}`);
  }
}

const manifestPath = path.join(assetsDir, "asset-manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
const videoCount = manifest.assets.filter((asset) => asset.file.endsWith(".mp4")).length;

if (videoCount !== 11) {
  throw new Error(`Expected 11 MP4 assets, found ${videoCount}`);
}

console.log("Asset check passed: dashboard interaction video, wordmark, and 11 profile videos are present.");
