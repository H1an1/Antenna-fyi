# Antenna HyperFrames Promo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an 18-second HyperFrames Studio preview for the Antenna promo that starts from the real `/me` dashboard, changes only the profile-card content in the video layer, expands into 11 profile-back videos, and resolves into the Antenna wordmark.

**Architecture:** Create a standalone HyperFrames project under `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo`. The live dashboard appears as an authenticated browser screenshot captured from `http://localhost:3001/me`, with a video-only profile card overlay that replaces the visible card content with Antenna copy. The cinematic half uses copied local video assets, deterministic GSAP timelines, and HyperFrames lint/validate/snapshot/preview as the verification path.

**Tech Stack:** HyperFrames CLI v0.5.3, HTML/CSS, GSAP 3.14.2, local MP4/SVG/PNG assets, Node.js scripts for asset preparation and verification.

---

## File Structure

- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/index.html`: main HyperFrames composition.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/DESIGN.md`: visual identity constraints copied from the live dashboard.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/STORYBOARD.md`: beat-by-beat timing and asset map.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/prepare-assets.mjs`: copies logo and all 11 videos from `public/` into project-local `assets/`.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/check-assets.mjs`: verifies the dashboard capture, logo, and 11 video files exist.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/dashboard-live.png`: captured live dashboard screenshot from `http://localhost:3001/me`.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/antenna.svg`: copied wordmark.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-current.mp4`: copied current profile-back video.
- Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-01-hermes.mp4` through `profile-10-odysseus.mp4`: copied archetype videos.
- Generated during validation: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/snapshots/*.png`.

The Next.js app source must not be modified for this promo.

---

### Task 1: Scaffold The HyperFrames Project

**Files:**
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/DESIGN.md`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/STORYBOARD.md`

- [ ] **Step 1: Confirm the local dashboard is reachable**

Run:

```bash
curl -I --max-time 3 http://localhost:3001/me
```

Expected: `HTTP/1.1 200 OK`.

- [ ] **Step 2: Scaffold a blank HyperFrames project**

Run:

```bash
npx hyperframes init videos/antenna-hyperframes-promo --example blank --non-interactive --skip-skills
```

Expected: a new project directory exists at `videos/antenna-hyperframes-promo` with `index.html`.

- [ ] **Step 3: Write the project visual identity**

Replace `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/DESIGN.md` with:

```markdown
# Antenna Promo Visual Identity

## Source Of Truth

The first three scenes use the actual rendered dashboard at `http://localhost:3001/me`.

Do not redesign the dashboard. Do not replace it with the brainstorming companion sketch. The dashboard is the user's personal control console and stays visually separate from the archetype-video universe.

## Palette

- Console black: `#050605`
- Deep panel black: `#11100c`
- Ochre gold: `#d7b866`
- Highlight gold: `#e2c46e`
- Soft parchment: `#fef1e1`
- Muted profile text: `#a89888`
- Secondary text: `#d8cab8`

## Typography

- Serif display: Cormorant Garamond, matching the live dashboard.
- Monospace UI: JetBrains Mono, matching the live dashboard.

## Motion

- Scene 01 starts with restrained product-camera motion.
- Scene 02 focuses the profile card without losing dashboard context.
- Scene 03 uses the existing card flip as the transition into the cinematic layer.
- Scene 04 uses staggered video-tile motion and depth.
- Scene 05 compresses the video field into the Antenna wordmark.

## What Not To Do

- Do not use generic blue or purple tech gradients.
- Do not introduce a new landing-page composition for the dashboard.
- Do not use live iframes inside HyperFrames.
- Do not use static video tiles; each tile needs subtle motion.
- Do not add narration unless the user asks for it.
```

- [ ] **Step 4: Write the storyboard**

Replace `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/STORYBOARD.md` with:

```markdown
# Antenna HyperFrames Promo Storyboard

## Scene 01: Real Dashboard Entrance, 0.0-3.0s

Use `assets/dashboard-live.png`, captured from the authenticated live page at `http://localhost:3001/me`.

Camera: slow push on the real dashboard. Keep the dashboard recognizable.

## Scene 02: Profile Card Focus, 3.0-6.2s

Overlay a video-only profile card patch on top of the captured dashboard card.

Profile content:

- Name: `Antenna`
- Line 1: `Maps the room through your agent network.`
- Line 2: `Turns profiles, events, and context into live signal.`
- Line 3: `Finds the people worth meeting before the moment passes.`

Camera: move focus toward the profile-card region.

## Scene 03: Cursor Flip, 6.2-8.4s

Move a cursor to the existing flip control, click, and flip the card patch.

Back video: `assets/profile-current.mp4`.

## Scene 04: 11-Video Expansion, 8.4-14.5s

The current profile-back video becomes the lead tile. Ten archetype videos join it.

Video sources:

- `assets/profile-current.mp4`
- `assets/profile-01-hermes.mp4`
- `assets/profile-02-athena.mp4`
- `assets/profile-03-prometheus.mp4`
- `assets/profile-04-apollo.mp4`
- `assets/profile-05-artemis.mp4`
- `assets/profile-06-aphrodite.mp4`
- `assets/profile-07-dionysus.mp4`
- `assets/profile-08-hades.mp4`
- `assets/profile-09-persephone.mp4`
- `assets/profile-10-odysseus.mp4`

Motion: staggered entrance, subtle depth drift, and a slight ongoing scale on each video child.

## Scene 05: Wordmark Merge, 14.5-18.0s

The 11-video field contracts into the Antenna wordmark.

Final mark: `assets/antenna.svg`.

Final tagline: `Signal for the room.`
```

- [ ] **Step 5: Commit the scaffold and planning files**

Run:

```bash
git add videos/antenna-hyperframes-promo/DESIGN.md videos/antenna-hyperframes-promo/STORYBOARD.md
git commit -m "video: scaffold antenna hyperframes promo"
```

Expected: commit succeeds. If `index.html` from the scaffold changed and is still the unedited blank example, leave it unstaged until Task 4 replaces it.

---

### Task 2: Capture The Real Dashboard From The Logged-In Browser

**Files:**
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/dashboard-live.png`

- [ ] **Step 1: Use Browser Use to capture the logged-in `/me` page**

Use the in-app browser runtime, not `npx hyperframes capture`, because the CLI capture does not share the logged-in browser session.

Run this Node REPL cell through the Browser Use workflow:

```js
if (!globalThis.agent) {
  const { setupAtlasRuntime } = await import("/Users/ekohan/.codex/plugins/cache/openai-bundled/browser-use/0.1.0-alpha1/scripts/browser-client.mjs");
  const backend = "iab";
  await setupAtlasRuntime({ globals: globalThis, backend });
}

await agent.browser.nameSession("Antenna promo dashboard capture");

const fs = await import("node:fs/promises");
const outDir = "/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets";
await fs.mkdir(outDir, { recursive: true });

const promoDashboardTab = await agent.browser.tabs.new();
await promoDashboardTab.goto("http://localhost:3001/me");
await promoDashboardTab.playwright.waitForLoadState({ state: "domcontentloaded", timeoutMs: 10000 });

const loadingLocator = promoDashboardTab.playwright.getByText("Loading", { exact: false });
const loadingCount = await loadingLocator.count();
if (loadingCount === 1) {
  await loadingLocator.waitFor({ state: "hidden", timeoutMs: 12000 });
}

const profileName = promoDashboardTab.playwright.getByText("Hami", { exact: true });
const profileNameCount = await profileName.count();
if (profileNameCount !== 1) {
  throw new Error(`Expected the real dashboard profile name to be visible once, found ${profileNameCount}`);
}

const screenshot = await promoDashboardTab.playwright.screenshot({ fullPage: false });
const bytes = Buffer.from(await screenshot.toBase64(), "base64");
await fs.writeFile(`${outDir}/dashboard-live.png`, bytes);

nodeRepl.write(JSON.stringify({
  wrote: `${outDir}/dashboard-live.png`,
  bytes: bytes.length,
  url: await promoDashboardTab.url()
}));
```

Expected: JSON reports `dashboard-live.png` and a positive byte count.

- [ ] **Step 2: Verify the capture is the real dashboard**

Run:

```bash
file videos/antenna-hyperframes-promo/assets/dashboard-live.png
```

Expected: output says `PNG image data`.

Open the image using the local image viewer. It must show the real dashboard with the Antenna header, Today panel, profile card, Matches panel, Events panel, and the existing personal profile content.

- [ ] **Step 3: Commit the dashboard capture**

Run:

```bash
git add videos/antenna-hyperframes-promo/assets/dashboard-live.png
git commit -m "video: capture live antenna dashboard"
```

Expected: commit succeeds.

---

### Task 3: Copy And Verify Promo Assets

**Files:**
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/prepare-assets.mjs`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/check-assets.mjs`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/antenna.svg`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-current.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-01-hermes.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-02-athena.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-03-prometheus.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-04-apollo.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-05-artemis.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-06-aphrodite.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-07-dionysus.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-08-hades.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-09-persephone.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/profile-10-odysseus.mp4`
- Create: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/asset-manifest.json`

- [ ] **Step 1: Write the asset preparation script**

Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/prepare-assets.mjs`:

```js
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
```

- [ ] **Step 2: Write the asset verification script**

Create `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/check-assets.mjs`:

```js
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const assetsDir = path.join(projectDir, "assets");

const requiredFiles = [
  "dashboard-live.png",
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

console.log("Asset check passed: dashboard capture, wordmark, and 11 videos are present.");
```

- [ ] **Step 3: Run asset preparation**

Run:

```bash
node videos/antenna-hyperframes-promo/tools/prepare-assets.mjs
```

Expected: `Copied 12 assets into /Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets`.

- [ ] **Step 4: Run asset verification**

Run:

```bash
node videos/antenna-hyperframes-promo/tools/check-assets.mjs
```

Expected: `Asset check passed: dashboard capture, wordmark, and 11 videos are present.`

- [ ] **Step 5: Commit copied assets and scripts**

Run:

```bash
git add videos/antenna-hyperframes-promo/assets videos/antenna-hyperframes-promo/tools
git commit -m "video: prepare antenna promo assets"
```

Expected: commit succeeds.

---

### Task 4: Build The First-Pass Composition

**Files:**
- Modify: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/index.html`
- Test: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/tools/check-assets.mjs`

- [ ] **Step 1: Replace `index.html` with the complete composition**

Replace `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/index.html` with:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Antenna HyperFrames Promo</title>
    <script src="https://cdn.jsdelivr.net/npm/gsap@3.14.2/dist/gsap.min.js"></script>
    <style>
      html,
      body {
        width: 100%;
        height: 100%;
        margin: 0;
        overflow: hidden;
        background: #050605;
      }

      [data-composition-id="antenna-promo"] {
        position: relative;
        width: 1920px;
        height: 1080px;
        overflow: hidden;
        color: #a89888;
        background:
          radial-gradient(circle at 14% 8%, rgba(226, 196, 110, 0.08), transparent 420px),
          linear-gradient(180deg, #050605 0%, #11100c 46%, #070806 100%);
        font-family: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, monospace;
      }

      .scene {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
      }

      .dashboard-wrap {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #050605;
      }

      .dashboard-capture {
        display: block;
        width: auto;
        height: 100%;
        max-width: 100%;
        object-fit: contain;
        filter: saturate(1.06) contrast(1.04) brightness(0.92);
      }

      .dashboard-shade {
        position: absolute;
        inset: 0;
        pointer-events: none;
        background:
          radial-gradient(circle at 50% 52%, transparent 0%, transparent 42%, rgba(0, 0, 0, 0.38) 80%),
          linear-gradient(90deg, rgba(0, 0, 0, 0.24), transparent 26%, transparent 74%, rgba(0, 0, 0, 0.24));
      }

      .profile-focus {
        position: absolute;
        left: 620px;
        top: 392px;
        width: 420px;
        height: 630px;
        perspective: 1600px;
        transform-style: preserve-3d;
      }

      .profile-flipper {
        position: absolute;
        inset: 0;
        display: grid;
        transform-style: preserve-3d;
      }

      .profile-face {
        grid-area: 1 / 1;
        position: relative;
        overflow: hidden;
        box-sizing: border-box;
        border: 1px solid rgba(215, 184, 102, 0.34);
        background:
          linear-gradient(180deg, rgba(232, 222, 204, 0.035), transparent 42%),
          radial-gradient(circle at 20% 0%, rgba(215, 184, 102, 0.1), transparent 300px),
          linear-gradient(180deg, rgba(14, 13, 10, 0.92), rgba(7, 7, 5, 0.86));
        box-shadow:
          inset 0 0 0 1px rgba(232, 222, 204, 0.025),
          inset 0 0 34px rgba(215, 184, 102, 0.035),
          0 24px 80px rgba(0, 0, 0, 0.34);
        backface-visibility: hidden;
      }

      .profile-front {
        padding: 34px 32px;
      }

      .profile-back {
        padding: 0;
      }

      .profile-video {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .profile-back-copy {
        position: absolute;
        inset-inline: 24px;
        bottom: 24px;
        z-index: 2;
        padding-top: 20px;
        border-top: 1px solid rgba(215, 184, 102, 0.22);
        color: #fef1e1;
        font-size: 18px;
        line-height: 1.55;
        background: linear-gradient(180deg, transparent, rgba(0, 0, 0, 0.42));
      }

      .kicker {
        display: block;
        color: #e2c46e;
        font-size: 16px;
        line-height: 1.2;
        letter-spacing: 0.18em;
        text-transform: uppercase;
      }

      .profile-title {
        margin: 58px 0 24px;
        color: #fef1e1;
        font-family: "Cormorant Garamond", Georgia, serif;
        font-size: 64px;
        font-weight: 500;
        line-height: 0.95;
        text-shadow: 1px 1px 2px rgba(83, 72, 45, 0.7);
      }

      .profile-lines {
        display: flex;
        flex-direction: column;
        gap: 18px;
        border-top: 1px solid rgba(215, 184, 102, 0.18);
        border-bottom: 1px solid rgba(215, 184, 102, 0.18);
        padding: 22px 0;
      }

      .profile-lines p {
        margin: 0;
        color: #d8cab8;
        font-size: 22px;
        line-height: 1.42;
      }

      .card-button {
        position: absolute;
        top: 32px;
        right: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        width: 54px;
        height: 54px;
        border: 1px solid rgba(215, 184, 102, 0.28);
        color: #a89888;
        background: rgba(0, 0, 0, 0.18);
      }

      .card-button::before,
      .card-button::after {
        content: "";
        position: absolute;
        border: 2px solid #a89888;
        border-left-color: transparent;
        border-bottom-color: transparent;
        width: 20px;
        height: 20px;
      }

      .card-button::before {
        border-radius: 50%;
      }

      .card-button::after {
        width: 7px;
        height: 7px;
        border-width: 0 2px 2px 0;
        margin-left: 18px;
      }

      .cursor {
        position: absolute;
        left: 950px;
        top: 446px;
        width: 32px;
        height: 32px;
        opacity: 0;
        z-index: 5;
      }

      .cursor::before {
        content: "";
        position: absolute;
        left: 4px;
        top: 0;
        width: 20px;
        height: 20px;
        border-right: 4px solid #fef1e1;
        border-bottom: 4px solid #fef1e1;
        box-shadow: 0 0 18px rgba(254, 241, 225, 0.4);
      }

      .video-field {
        position: absolute;
        inset: 0;
        display: flex;
        align-items: center;
        justify-content: center;
        visibility: hidden;
        opacity: 0;
      }

      .video-grid {
        display: grid;
        grid-template-columns: repeat(6, 170px);
        grid-auto-rows: 255px;
        gap: 18px;
        align-items: center;
        justify-content: center;
      }

      .video-tile {
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(215, 184, 102, 0.28);
        background: #050605;
        box-shadow: 0 26px 80px rgba(0, 0, 0, 0.42);
      }

      .video-tile.lead {
        grid-column: span 2;
        grid-row: span 2;
      }

      .video-tile video {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
        opacity: 0.9;
      }

      .video-label {
        position: absolute;
        left: 10px;
        bottom: 10px;
        padding: 4px 7px;
        color: #e2c46e;
        background: rgba(0, 0, 0, 0.58);
        font-size: 14px;
        letter-spacing: 0.12em;
      }

      .final-lockup {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 34px;
        visibility: hidden;
        opacity: 0;
      }

      .final-wordmark {
        display: block;
        width: 580px;
        max-width: 70%;
        filter: drop-shadow(0 0 14px rgba(215, 184, 102, 0.18));
      }

      .tagline {
        margin: 0;
        color: #d8cab8;
        font-size: 24px;
        letter-spacing: 0.14em;
        text-transform: uppercase;
      }
    </style>
  </head>
  <body>
    <div
      id="antenna-promo"
      data-composition-id="antenna-promo"
      data-start="0"
      data-duration="18"
      data-width="1920"
      data-height="1080"
    >
      <div class="scene">
        <div class="dashboard-wrap">
          <img
            id="dashboard-capture"
            class="dashboard-capture"
            src="assets/dashboard-live.png"
            alt=""
            data-start="0"
            data-duration="14.5"
            data-track-index="1"
          />
          <div class="dashboard-shade" aria-hidden="true"></div>
        </div>

        <div class="profile-focus">
          <div class="profile-flipper">
            <div class="profile-face profile-front">
              <span class="kicker">Identity://Public</span>
              <div class="card-button" aria-hidden="true"></div>
              <h1 class="profile-title">Antenna</h1>
              <div class="profile-lines">
                <p>Maps the room through your agent network.</p>
                <p>Turns profiles, events, and context into live signal.</p>
                <p>Finds the people worth meeting before the moment passes.</p>
              </div>
            </div>

            <div class="profile-face profile-back">
              <video
                id="card-current-video"
                class="profile-video"
                src="assets/profile-current.mp4"
                data-start="6.2"
                data-duration="2.3"
                data-track-index="10"
                muted
                playsinline
              ></video>
              <div class="profile-back-copy">
                Antenna turns the room into signal.
              </div>
            </div>
          </div>
        </div>

        <div class="cursor" aria-hidden="true"></div>

        <div class="video-field">
          <div class="video-grid">
            <div class="video-tile lead">
              <video id="tile-current" src="assets/profile-current.mp4" data-start="8.4" data-duration="9.6" data-track-index="11" muted playsinline></video>
              <span class="video-label">CURRENT</span>
            </div>
            <div class="video-tile">
              <video id="tile-01" src="assets/profile-01-hermes.mp4" data-start="8.4" data-duration="9.6" data-track-index="12" muted playsinline></video>
              <span class="video-label">01</span>
            </div>
            <div class="video-tile">
              <video id="tile-02" src="assets/profile-02-athena.mp4" data-start="8.4" data-duration="9.6" data-track-index="13" muted playsinline></video>
              <span class="video-label">02</span>
            </div>
            <div class="video-tile">
              <video id="tile-03" src="assets/profile-03-prometheus.mp4" data-start="8.4" data-duration="9.6" data-track-index="14" muted playsinline></video>
              <span class="video-label">03</span>
            </div>
            <div class="video-tile">
              <video id="tile-04" src="assets/profile-04-apollo.mp4" data-start="8.4" data-duration="9.6" data-track-index="15" muted playsinline></video>
              <span class="video-label">04</span>
            </div>
            <div class="video-tile">
              <video id="tile-05" src="assets/profile-05-artemis.mp4" data-start="8.4" data-duration="9.6" data-track-index="16" muted playsinline></video>
              <span class="video-label">05</span>
            </div>
            <div class="video-tile">
              <video id="tile-06" src="assets/profile-06-aphrodite.mp4" data-start="8.4" data-duration="9.6" data-track-index="17" muted playsinline></video>
              <span class="video-label">06</span>
            </div>
            <div class="video-tile">
              <video id="tile-07" src="assets/profile-07-dionysus.mp4" data-start="8.4" data-duration="9.6" data-track-index="18" muted playsinline></video>
              <span class="video-label">07</span>
            </div>
            <div class="video-tile">
              <video id="tile-08" src="assets/profile-08-hades.mp4" data-start="8.4" data-duration="9.6" data-track-index="19" muted playsinline></video>
              <span class="video-label">08</span>
            </div>
            <div class="video-tile">
              <video id="tile-09" src="assets/profile-09-persephone.mp4" data-start="8.4" data-duration="9.6" data-track-index="20" muted playsinline></video>
              <span class="video-label">09</span>
            </div>
            <div class="video-tile">
              <video id="tile-10" src="assets/profile-10-odysseus.mp4" data-start="8.4" data-duration="9.6" data-track-index="21" muted playsinline></video>
              <span class="video-label">10</span>
            </div>
          </div>
        </div>

        <div class="final-lockup">
          <img
            id="final-wordmark"
            class="final-wordmark"
            src="assets/antenna.svg"
            alt="Antenna"
            data-start="14.5"
            data-duration="3.5"
            data-track-index="30"
          />
          <p class="tagline">Signal for the room.</p>
        </div>
      </div>

      <script>
        window.__timelines = window.__timelines || {};

        const tl = gsap.timeline({ paused: true });

        gsap.set(".profile-focus", { opacity: 0, transformPerspective: 1600 });
        gsap.set(".profile-flipper", { rotationY: 0, transformPerspective: 1600 });
        gsap.set(".profile-back", { rotationY: 180 });
        gsap.set(".video-field", { visibility: "hidden", opacity: 0 });
        gsap.set(".video-tile", { opacity: 0, y: 90, scale: 0.62 });
        gsap.set(".final-lockup", { visibility: "hidden", opacity: 0, scale: 0.92 });

        tl.fromTo(".dashboard-wrap", { scale: 1, y: 0 }, { scale: 1.08, y: -24, duration: 6.2, ease: "power1.inOut" }, 0);

        tl.fromTo(".profile-focus", { opacity: 0, scale: 0.94, y: 18 }, { opacity: 1, scale: 1, y: 0, duration: 0.8, ease: "power3.out" }, 2.2);
        tl.fromTo(".profile-title", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 3.0);
        tl.fromTo(".profile-lines p", { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.38, stagger: 0.16, ease: "power3.out" }, 3.45);

        tl.fromTo(".cursor", { opacity: 0, x: 180, y: 110 }, { opacity: 1, x: 0, y: 0, duration: 0.5, ease: "power2.out" }, 5.95);
        tl.to(".cursor", { scale: 0.78, duration: 0.12, ease: "power2.in" }, 6.45);
        tl.to(".cursor", { scale: 1, duration: 0.16, ease: "power2.out" }, 6.57);
        tl.to(".profile-flipper", { rotationY: 180, duration: 0.72, ease: "power3.inOut" }, 6.62);
        tl.to(".cursor", { opacity: 0, duration: 0.26, ease: "power2.out" }, 7.12);

        tl.fromTo(".profile-back-copy", { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.48, ease: "power3.out" }, 7.28);

        tl.to(".profile-focus", { scale: 1.55, x: -130, y: -70, duration: 0.55, ease: "power2.inOut" }, 8.02);
        tl.to(".profile-focus", { opacity: 0, duration: 0.22, ease: "power2.in" }, 8.26);
        tl.set(".profile-focus", { visibility: "hidden" }, 8.5);

        tl.set(".video-field", { visibility: "visible" }, 8.34);
        tl.to(".video-field", { opacity: 1, duration: 0.2, ease: "none" }, 8.34);
        tl.fromTo(".video-tile", { opacity: 0, y: 90, scale: 0.62 }, { opacity: 1, y: 0, scale: 1, duration: 0.78, stagger: 0.055, ease: "power3.out" }, 8.4);
        tl.to(".video-tile video", { scale: 1.055, duration: 6.0, ease: "none" }, 8.5);
        tl.fromTo(".video-grid", { y: 18 }, { y: -18, duration: 6.1, ease: "sine.inOut" }, 8.4);

        tl.to(".dashboard-wrap", { opacity: 0.18, duration: 0.8, ease: "power2.out" }, 8.6);

        tl.to(".video-grid", { scale: 0.48, y: 0, opacity: 0, duration: 0.92, ease: "power3.in" }, 14.5);
        tl.set(".video-field", { visibility: "hidden", opacity: 0 }, 15.42);
        tl.set(".final-lockup", { visibility: "visible" }, 14.9);
        tl.fromTo(".final-lockup", { opacity: 0, scale: 0.92 }, { opacity: 1, scale: 1, duration: 0.76, ease: "power3.out" }, 15.05);
        tl.fromTo(".tagline", { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.48, ease: "power3.out" }, 15.75);

        window.__timelines["antenna-promo"] = tl;
      </script>
    </div>
  </body>
</html>
```

- [ ] **Step 2: Verify assets before linting**

Run:

```bash
node videos/antenna-hyperframes-promo/tools/check-assets.mjs
```

Expected: `Asset check passed: dashboard capture, wordmark, and 11 videos are present.`

- [ ] **Step 3: Lint the composition**

Run:

```bash
npx hyperframes lint videos/antenna-hyperframes-promo
```

Expected: no errors. Fix every lint error before continuing.

- [ ] **Step 4: Commit the first-pass composition**

Run:

```bash
git add videos/antenna-hyperframes-promo/index.html
git commit -m "video: compose antenna promo timeline"
```

Expected: commit succeeds.

---

### Task 5: Validate Runtime And Snapshot The Hero Frames

**Files:**
- Modify: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/index.html` only if validation reveals a real bug.
- Generated: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/snapshots/*.png`

- [ ] **Step 1: Run runtime validation**

Run:

```bash
npx hyperframes validate videos/antenna-hyperframes-promo --timeout 8000
```

Expected: no console errors, missing assets, or failed network requests.

- [ ] **Step 2: Run layout inspection**

Run:

```bash
npx hyperframes inspect videos/antenna-hyperframes-promo --at 2.0,4.8,7.4,11.8,16.4
```

Expected: no errors. If it reports text spilling or children escaping containers, fix `index.html`, rerun lint, rerun validate, and rerun inspect.

- [ ] **Step 3: Capture key snapshots**

Run:

```bash
npx hyperframes snapshot videos/antenna-hyperframes-promo --at 2.0,4.8,7.4,11.8,16.4
```

Expected: five PNG files are created in `videos/antenna-hyperframes-promo/snapshots/`.

- [ ] **Step 4: Visually review each snapshot**

Open each snapshot:

```bash
ls videos/antenna-hyperframes-promo/snapshots
```

Expected visual checks:

- `2.0s`: the live dashboard is visible and recognizable as the actual personal console.
- `4.8s`: the Antenna profile-card overlay is readable and covers the original card content.
- `7.4s`: the flip is on or near the video-backed card face.
- `11.8s`: 11 videos are visible as a cinematic array.
- `16.4s`: the Antenna wordmark and `Signal for the room.` tagline are readable.

- [ ] **Step 5: Commit validation fixes if any were required**

If `index.html` changed during validation, run:

```bash
git add videos/antenna-hyperframes-promo/index.html
git commit -m "video: polish antenna promo snapshots"
```

Expected: commit succeeds. If no file changed, skip the commit.

---

### Task 6: Start HyperFrames Studio Preview

**Files:**
- No source changes expected.

- [ ] **Step 1: Start the Studio preview**

Run:

```bash
cd videos/antenna-hyperframes-promo
npx hyperframes preview --port 3017
```

Expected: preview server starts and serves the project.

- [ ] **Step 2: Open the user-facing Studio URL**

Open:

```text
http://localhost:3017/#project/antenna-hyperframes-promo
```

Expected: HyperFrames Studio loads the Antenna promo and can scrub through the 18-second timeline.

- [ ] **Step 3: Final handoff**

Report this preview URL first:

```text
http://localhost:3017/#project/antenna-hyperframes-promo
```

Also report:

- The composition source path: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/index.html`
- The dashboard capture path: `/Users/ekohan/Documents/Antenna-fyi/videos/antenna-hyperframes-promo/assets/dashboard-live.png`
- That MP4 rendering has not been run because the user has not requested export yet.

---

## Self-Review Checklist

- Spec coverage: Tasks cover real dashboard capture, profile content replacement, card flip, 11-video expansion, wordmark merge, HyperFrames validation, snapshots, and Studio handoff.
- Source-page safety: No task modifies the real Next.js `/me` page.
- Authenticated capture: Task 2 explicitly uses the logged-in in-app browser because HyperFrames CLI capture does not share the session.
- Asset count: Task 3 verifies exactly 11 MP4 files.
- HyperFrames rules: `index.html` registers `window.__timelines["antenna-promo"]`, uses finite animation, no iframe, muted `playsinline` video elements, and no async timeline construction.
- Handoff: Task 6 stops at Studio preview and does not render MP4.
