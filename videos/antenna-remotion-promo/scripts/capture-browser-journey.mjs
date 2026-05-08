import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectDir = path.resolve(__dirname, "..");
const repoRoot = path.resolve(projectDir, "../..");
const framesDir = path.join(projectDir, "tmp", "browser-journey-frames");
const outputPath = path.join(projectDir, "public", "captures", "browser-journey.mp4");
const baseUrl = process.env.ANTENNA_PROMO_BASE_URL || "http://localhost:3001";
const chromePath =
  process.env.CHROME_PATH ||
  "/Users/ekohan/.agent-browser/browsers/chrome-146.0.7680.153/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing";

const width = 1920;
const height = 1080;
const fps = 30;
const duration = 10.4;
const email = "hellp@antenna.fyi";
const code = "123456";

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
        const callback = (params) => {
          listeners.set(
            method,
            (listeners.get(method) || []).filter((item) => item !== callback),
          );
          resolve(params);
        };
        listeners.set(method, [...(listeners.get(method) || []), callback]);
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
    if (result?.value) return true;
    await delay(100);
  }
  return false;
}

async function navigateAndWait(client, url, readyExpression) {
  const loadEvent = client.once("Page.loadEventFired");
  await client.send("Page.navigate", { url });
  await loadEvent;
  if (readyExpression) await waitForExpression(client, readyExpression);
  await hideDevChrome(client);
  await delay(500);
}

async function hideDevChrome(client) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      if (document.getElementById("antenna-promo-capture-style")) return;
      const style = document.createElement("style");
      style.id = "antenna-promo-capture-style";
      style.textContent = "nextjs-portal{display:none!important} *{caret-color:transparent!important}";
      document.head.appendChild(style);
    })()`,
    returnByValue: true,
  });
}

async function clickSelector(client, selector) {
  const { result } = await client.send("Runtime.evaluate", {
    expression: `(() => {
      const el = document.querySelector(${JSON.stringify(selector)});
      if (!el) return null;
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    })()`,
    returnByValue: true,
  });

  if (!result?.value) return false;

  const { x, y } = result.value;
  await client.send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, button: "none" });
  await client.send("Input.dispatchMouseEvent", {
    type: "mousePressed",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  await client.send("Input.dispatchMouseEvent", {
    type: "mouseReleased",
    x,
    y,
    button: "left",
    clickCount: 1,
  });
  return true;
}

async function pressHeroCta(client) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const button = document.querySelector(".hero-gallery-button-primary");
      if (!button) return false;
      button.style.transform = "translateY(1px)";
      button.style.background = "rgba(254, 241, 225, 0.92)";
      button.style.color = "#15100e";
      button.style.boxShadow = "0 0 34px rgba(226, 196, 110, 0.28)";
      return true;
    })()`,
    returnByValue: true,
  });
}

async function focusSelector(client, selector) {
  return client.send("Runtime.evaluate", {
    expression: `document.querySelector(${JSON.stringify(selector)})?.focus()`,
    returnByValue: true,
  });
}

async function insertText(client, text) {
  await client.send("Input.insertText", { text });
}

async function setInputValue(client, selector, value) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const input = document.querySelector(${JSON.stringify(selector)});
      if (!input) return false;
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
      setter?.call(input, ${JSON.stringify(value)});
      input.dispatchEvent(new Event("input", { bubbles: true }));
      return true;
    })()`,
    returnByValue: true,
  });
}

async function injectCodeStep(client) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const main = document.querySelector("main");
      if (!main) return false;
      main.innerHTML = ${JSON.stringify(`
        <div
          style="
            max-width:24rem;
            width:100%;
            padding:2rem;
            background-color:rgba(42,34,24,.85);
            border:1px solid rgba(184,173,158,.22);
            box-sizing:border-box;
          "
        >
          <h1 style="font-family:serif;font-size:1.5rem;line-height:2rem;color:#f2eadf;margin:0 0 .5rem;text-align:center;">Antenna</h1>
          <p style="font-family:monospace;font-size:.75rem;color:#d2c5b6;text-align:center;margin:0 0 2rem;">Enter the code sent to ${email}</p>
          <form style="display:grid;gap:.75rem;margin-bottom:1.25rem;">
            <div>
              <label style="font-family:monospace;font-size:11px;color:#d2c5b6;margin-bottom:.25rem;display:block;">Verification code</label>
              <input
                id="promo-code-input"
                type="text"
                inputmode="numeric"
                value=""
                maxlength="6"
                placeholder="000000"
                style="
                  width:100%;
                  box-sizing:border-box;
                  font-family:monospace;
                  font-size:1.5rem;
                  letter-spacing:.3em;
                  text-align:center;
                  padding:.75rem 1rem;
                  background:transparent;
                  outline:none;
                  border:1px solid rgba(184,173,158,.3);
                  color:#f2eadf;
                "
              />
            </div>
            <button
              id="promo-verify-button"
              type="button"
              style="
                width:100%;
                font-family:monospace;
                font-size:.875rem;
                padding:.625rem 1rem;
                border:1px solid rgba(196,168,98,.5);
                color:#c4a862;
                background-color:rgba(196,168,98,.1);
              "
            >Verify</button>
          </form>
          <div style="display:flex;align-items:center;justify-content:space-between;">
            <button style="font-family:monospace;font-size:.75rem;color:#d2c5b6;background:transparent;border:0;padding:0;">Change email</button>
            <button style="font-family:monospace;font-size:.75rem;color:#c4a862;background:transparent;border:0;padding:0;">Resend code</button>
          </div>
        </div>
      `)};
      document.querySelector("#promo-code-input")?.focus();
      return true;
    })()`,
    returnByValue: true,
  });
}

async function setSendCodeLoading(client) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const button = document.querySelector('button[type="submit"]');
      if (!button) return false;
      button.textContent = "Sending...";
      button.style.opacity = ".55";
      return true;
    })()`,
    returnByValue: true,
  });
}

async function setVerifyLoading(client) {
  await client.send("Runtime.evaluate", {
    expression: `(() => {
      const button = document.querySelector("#promo-verify-button");
      if (!button) return false;
      button.textContent = "Verifying...";
      button.style.opacity = ".55";
      return true;
    })()`,
    returnByValue: true,
  });
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
    ffmpeg.on("exit", (exitCode) => {
      if (exitCode === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${exitCode}`));
    });
  });
}

await rm(framesDir, { recursive: true, force: true });
await mkdir(framesDir, { recursive: true });
await mkdir(path.dirname(outputPath), { recursive: true });

const userDataDir = path.join(tmpdir(), `antenna-remotion-promo-chrome-${process.pid}`);
const port = 9500 + Math.floor(Math.random() * 400);
const chrome = spawn(
  chromePath,
  [
    "--headless=new",
    `--remote-debugging-port=${port}`,
    `--user-data-dir=${userDataDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-component-update",
    "--disable-default-apps",
    "--disable-sync",
    "--disable-background-timer-throttling",
    "--disable-renderer-backgrounding",
    "--disable-backgrounding-occluded-windows",
    "--metrics-recording-only",
    "--password-store=basic",
    "--use-mock-keychain",
    "--disable-features=Translate",
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
  if (!pageTarget) throw new Error("Chrome did not expose a page target");

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

  await navigateAndWait(client, `${baseUrl}/login`, `!!document.querySelector('input[type="email"]')`);
  await navigateAndWait(
    client,
    `${baseUrl}/promo/antenna-dashboard`,
    `document.readyState === 'complete' && !!document.querySelector('[data-promo-dashboard-root]')`,
  );
  await waitForExpression(client, `Array.from(document.querySelectorAll('img')).every((img) => img.complete)`);
  await navigateAndWait(client, `${baseUrl}/`, `!!document.querySelector('.hero-gallery-button-primary')`);
  await waitForExpression(
    client,
    `Array.from(document.querySelectorAll('video')).every((video) => video.readyState >= 2)`,
    80,
  );

  const frameCount = Math.round(duration * fps);
  const startedAt = Date.now();
  let clickedStart = false;
  let focusedEmail = false;
  let emailIndex = 0;
  let injectedCode = false;
  let codeIndex = 0;
  let verifyClicked = false;
  let dashboardLoaded = false;
  let flippedProfile = false;

  for (let frame = 0; frame < frameCount; frame += 1) {
    const elapsed = frame / fps;

    if (!clickedStart && elapsed >= 1.2) {
      clickedStart = true;
      await pressHeroCta(client);
      await delay(120);
      const loadEvent = client.once("Page.loadEventFired");
      await client.send("Page.navigate", { url: `${baseUrl}/login` });
      await loadEvent;
      await hideDevChrome(client);
      await waitForExpression(client, `!!document.querySelector('input[type="email"]')`);
    }

    if (!focusedEmail && elapsed >= 2.15) {
      focusedEmail = true;
      await hideDevChrome(client);
      await focusSelector(client, 'input[type="email"]');
    }

    if (focusedEmail && emailIndex < email.length) {
      const nextEmailIndex = Math.max(
        0,
        Math.min(email.length, Math.floor((elapsed - 2.2) / 0.055) + 1),
      );
      if (nextEmailIndex > emailIndex) {
        emailIndex = nextEmailIndex;
        await setInputValue(client, 'input[type="email"]', email.slice(0, emailIndex));
      }
    }

    if (!injectedCode && elapsed >= 4.15) {
      injectedCode = true;
      await setSendCodeLoading(client);
      await delay(150);
      await injectCodeStep(client);
    }

    if (injectedCode && codeIndex < code.length) {
      const nextCodeIndex = Math.max(
        0,
        Math.min(code.length, Math.floor((elapsed - 4.65) / 0.09) + 1),
      );
      if (nextCodeIndex > codeIndex) {
        codeIndex = nextCodeIndex;
        await setInputValue(client, "#promo-code-input", code.slice(0, codeIndex));
      }
    }

    if (!verifyClicked && elapsed >= 5.75) {
      verifyClicked = true;
      await clickSelector(client, "#promo-verify-button");
      await setVerifyLoading(client);
    }

    if (!dashboardLoaded && elapsed >= 6.28) {
      dashboardLoaded = true;
      const loadEvent = client.once("Page.loadEventFired");
      await client.send("Page.navigate", { url: `${baseUrl}/promo/antenna-dashboard` });
      await loadEvent;
      await hideDevChrome(client);
      await waitForExpression(
        client,
        `document.readyState === 'complete' && !!document.querySelector('[data-promo-dashboard-root]')`,
      );
      await waitForExpression(client, `Array.from(document.querySelectorAll('img')).every((img) => img.complete)`);
      await delay(300);
    }

    if (!flippedProfile && elapsed >= 8.12) {
      flippedProfile = true;
      await clickSelector(client, '[data-profile-flip-button="back"]');
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
  console.log(`Captured browser journey video: ${outputPath}`);
} finally {
  client?.close();
  chrome.kill();
  await Promise.race([new Promise((resolve) => chrome.once("exit", resolve)), delay(1000)]);
  await rm(userDataDir, { recursive: true, force: true }).catch(() => undefined);
}
