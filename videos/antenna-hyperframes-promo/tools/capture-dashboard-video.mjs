import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectDir, "../..");
const framesDir = path.join(projectDir, "tmp", "dashboard-frames");
const outputPath = path.join(projectDir, "assets", "dashboard-interaction.mp4");
const targetUrl = process.env.ANTENNA_PROMO_DASHBOARD_URL || "http://localhost:3001/promo/antenna-dashboard";
const chromePath =
  process.env.CHROME_PATH || "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

const width = 1920;
const height = 1080;
const fps = 24;
const duration = 8.6;
const clickAt = 4.75;

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchJson(url, attempts = 80) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const res = await fetch(url);
      if (res.ok) return await res.json();
      lastError = new Error(`HTTP ${res.status}`);
    } catch (error) {
      lastError = error;
    }
    await delay(100);
  }
  throw lastError || new Error(`Unable to fetch ${url}`);
}

function createCdpClient(webSocketUrl) {
  const ws = new WebSocket(webSocketUrl);
  let nextId = 0;
  const pending = new Map();
  const listeners = new Map();

  ws.addEventListener("message", (message) => {
    const payload = JSON.parse(message.data);
    if (payload.id && pending.has(payload.id)) {
      const { resolve, reject } = pending.get(payload.id);
      pending.delete(payload.id);
      if (payload.error) reject(new Error(payload.error.message || JSON.stringify(payload.error)));
      else resolve(payload.result || {});
      return;
    }

    const callbacks = listeners.get(payload.method) || [];
    for (const callback of callbacks) callback(payload.params || {});
  });

  const open = new Promise((resolve, reject) => {
    ws.addEventListener("open", resolve, { once: true });
    ws.addEventListener("error", reject, { once: true });
  });

  return {
    open,
    send(method, params = {}) {
      const id = ++nextId;
      ws.send(JSON.stringify({ id, method, params }));
      return new Promise((resolve, reject) => {
        pending.set(id, { resolve, reject });
      });
    },
    once(method) {
      return new Promise((resolve) => {
        const callbacks = listeners.get(method) || [];
        const callback = (params) => {
          listeners.set(
            method,
            (listeners.get(method) || []).filter((item) => item !== callback),
          );
          resolve(params);
        };
        callbacks.push(callback);
        listeners.set(method, callbacks);
      });
    },
    close() {
      ws.close();
    },
  };
}

async function waitForExpression(client, expression, attempts = 120) {
  for (let index = 0; index < attempts; index += 1) {
    const { result } = await client.send("Runtime.evaluate", {
      expression,
      returnByValue: true,
    });
    if (result?.value) return;
    await delay(100);
  }
  throw new Error(`Timed out waiting for expression: ${expression}`);
}

async function clickFlipButton(client) {
  const { result } = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector('[data-profile-flip-button="back"]');
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true,
  });

  if (!result?.value) {
    throw new Error("Could not find dashboard profile flip button");
  }

  const { x, y } = result.value;
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await client.send("Input.dispatchMouseEvent", { type: "mousePressed", x, y, button: "left", clickCount: 1 });
  await client.send("Input.dispatchMouseEvent", { type: "mouseReleased", x, y, button: "left", clickCount: 1 });
}

async function runFfmpeg() {
  const args = [
    "-y",
    "-framerate",
    String(fps),
    "-i",
    path.join(framesDir, "frame-%04d.jpg"),
    "-vf",
    "scale=1920:1080:flags=lanczos,format=yuv420p",
    "-c:v",
    "libx264",
    "-preset",
    "medium",
    "-crf",
    "18",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", args, { cwd: repoRoot, stdio: ["ignore", "inherit", "inherit"] });
    ffmpeg.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });
await mkdir(path.dirname(outputPath), { recursive: true });

const userDataDir = path.join(tmpdir(), `antenna-promo-chrome-${process.pid}`);
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--autoplay-policy=no-user-gesture-required",
    `--window-size=${width},${height}`,
    "about:blank",
  ],
  { stdio: ["ignore", "ignore", "inherit"] },
);

let client;

try {
  const targets = await fetchJson(`http://127.0.0.1:${port}/json/list`);
  const pageTarget = targets.find((target) => target.type === "page" && target.webSocketDebuggerUrl);
  if (!pageTarget) {
    throw new Error("Chrome did not expose a page target");
  }

  client = createCdpClient(pageTarget.webSocketDebuggerUrl);
  await client.open;

  await client.send("Page.enable");
  await client.send("Runtime.enable");
  await client.send("Input.setIgnoreInputEvents", { ignore: false });
  await client.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
  });

  const loadEvent = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url: targetUrl });
  await loadEvent;

  await waitForExpression(
    client,
    `document.readyState === 'complete' && !!document.querySelector('[data-promo-dashboard-root]')`,
  );
  await waitForExpression(
    client,
    `Array.from(document.querySelectorAll('img')).every((img) => img.complete)`,
  );
  await delay(800);

  const frameCount = Math.round(duration * fps);
  const startedAt = Date.now();
  let clicked = false;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const elapsed = (Date.now() - startedAt) / 1000;
    if (!clicked && elapsed >= clickAt) {
      await clickFlipButton(client);
      clicked = true;
    }

    const { data } = await client.send("Page.captureScreenshot", {
      format: "jpeg",
      quality: 92,
      fromSurface: true,
      captureBeyondViewport: false,
    });
    await writeFile(path.join(framesDir, `frame-${String(frame + 1).padStart(4, "0")}.jpg`), data, "base64");

    const nextFrameAt = startedAt + ((frame + 1) * 1000) / fps;
    const waitMs = nextFrameAt - Date.now();
    if (waitMs > 0) await delay(waitMs);
  }

  await runFfmpeg();
  console.log(`Captured dashboard interaction video: ${outputPath}`);
} finally {
  client?.close();
  chrome.kill();
  await Promise.race([
    new Promise((resolve) => chrome.once("exit", resolve)),
    delay(1000),
  ]);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
}
