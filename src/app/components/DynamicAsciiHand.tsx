"use client";

import { useEffect, useRef } from "react";

// Image/frame constants (match hand-mask-full.png / hand-lum.png layout)
const IMG_W = 2048;
const IMG_H = 1143;
const HAND_X = 1021;
const HAND_Y = 210;
const HAND_W = 915;
const HAND_H = 823;

// Character ramp: sparse → dense (light → shadow)
const RAMP = " ·.:;-+=*o#%@";

// Cheap 2D "noise" built from stacked sines — drifts over time.
function flowNoise(x: number, y: number, t: number) {
  const n =
    Math.sin(x * 0.11 + t * 0.55) +
    Math.sin(y * 0.09 - t * 0.4) +
    Math.sin((x + y) * 0.06 + t * 0.23) +
    Math.sin((x - y) * 0.04 - t * 0.17);
  return n * 0.25 + 0.5; // roughly 0..1
}

// Shared image data cache — loaded once, reused across all instances.
let sharedMask: Uint8ClampedArray | null = null;
let sharedLum: Uint8ClampedArray | null = null;
let sharedPaint: Uint8ClampedArray | null = null;
let loadingPromise: Promise<void> | null = null;

function loadImageToData(src: string) {
  return new Promise<Uint8ClampedArray>((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const oc = document.createElement("canvas");
      oc.width = IMG_W;
      oc.height = IMG_H;
      const octx = oc.getContext("2d")!;
      octx.drawImage(img, 0, 0, IMG_W, IMG_H);
      resolve(octx.getImageData(0, 0, IMG_W, IMG_H).data);
    };
    img.src = src;
  });
}

function ensureLoaded(): Promise<void> {
  if (sharedMask && sharedLum && sharedPaint) return Promise.resolve();
  if (!loadingPromise) {
    loadingPromise = Promise.all([
      loadImageToData("/hand-mask-full.png"),
      loadImageToData("/hand-lum.png"),
      loadImageToData("/hand-clean.jpg"),
    ]).then(([m, l, p]) => {
      sharedMask = m;
      sharedLum = l;
      sharedPaint = p;
    });
  }
  return loadingPromise;
}

export function DynamicAsciiHand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const getSize = () => {
      const rect = parent.getBoundingClientRect();
      return { w: rect.width, h: rect.height };
    };

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const { w, h } = getSize();
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const ro = new ResizeObserver(() => resize());
    ro.observe(parent);
    resize();

    // cover-fit image → container coord mapping
    const imgToContainer = (ix: number, iy: number) => {
      const { w: vw, h: vh } = getSize();
      const imgAR = IMG_W / IMG_H;
      const viewAR = vw / vh;
      let scale: number, ox: number, oy: number;
      if (viewAR > imgAR) {
        scale = vw / IMG_W;
        ox = 0;
        oy = (vh - IMG_H * scale) / 2;
      } else {
        scale = vh / IMG_H;
        ox = (vw - IMG_W * scale) / 2;
        oy = 0;
      }
      return { x: ix * scale + ox, y: iy * scale + oy, scale };
    };

    ensureLoaded().then(() => {
      const STEP = 11;

      const animate = () => {
        if (!sharedMask || !sharedLum || !sharedPaint) return;
        const { w: vw, h: vh } = getSize();
        ctx.clearRect(0, 0, vw, vh);

        const t = performance.now() * 0.00035;
        const { scale } = imgToContainer(0, 0);
        const fontSize = Math.max(9, Math.round(13 * scale));
        ctx.font = `${fontSize}px Menlo, monospace`;
        ctx.textBaseline = "top";

        const scanY = ((t * 140) % (HAND_H + 300)) + HAND_Y - 150;
        const SCAN_HALF = 55;

        for (let iy = HAND_Y; iy < HAND_Y + HAND_H; iy += STEP) {
          for (let ix = HAND_X; ix < HAND_X + HAND_W; ix += STEP) {
            const idx = (iy * IMG_W + ix) * 4;
            const maskVal = sharedMask[idx];
            if (maskVal < 80) continue;

            const L = sharedLum[idx] / 255;
            let intensity = (1 - L) * 0.9 + 0.08;

            const nx = ix * 0.018;
            const ny = iy * 0.018;
            intensity += (flowNoise(nx, ny, t) - 0.5) * 0.45;

            const dy = Math.abs(iy - scanY);
            if (dy < SCAN_HALF) {
              intensity += (1 - dy / SCAN_HALF) * 0.3;
            }

            const seed = ix * 13.7 + iy * 7.3;
            const flick = Math.sin(t * 4 + seed * 0.013) * 0.08;
            intensity += flick;

            const spark = Math.sin(t * 11 + seed * 0.21);
            if (spark > 0.985) intensity = 1.0;

            intensity = Math.max(0, Math.min(1, intensity));
            if (intensity < 0.1) continue;

            const wobble = Math.floor(Math.sin(t * 2.3 + seed * 0.017) * 1.2);
            const rampIdx = Math.max(
              0,
              Math.min(RAMP.length - 1, Math.floor(intensity * (RAMP.length - 1)) + wobble)
            );
            const ch = RAMP[rampIdx];
            if (ch === " ") continue;

            const sp = imgToContainer(ix, iy);

            const wobbleX = Math.sin(t * 1.4 + seed * 0.009) * 18;
            const wobbleY = Math.cos(t * 1.1 + seed * 0.011) * 14;
            let sx = Math.round(IMG_W - 1 - ix + wobbleX);
            let sy = Math.round(iy + wobbleY);
            if (sx < 0) sx = 0;
            else if (sx >= IMG_W) sx = IMG_W - 1;
            if (sy < 0) sy = 0;
            else if (sy >= IMG_H) sy = IMG_H - 1;
            const pIdx = (sy * IMG_W + sx) * 4;
            let r = sharedPaint[pIdx];
            let g = sharedPaint[pIdx + 1];
            let b = sharedPaint[pIdx + 2];

            const lift = 40 + intensity * 90;
            r = Math.min(255, r + lift);
            g = Math.min(255, g + lift * 0.92);
            b = Math.min(255, b + lift * 0.78);

            ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.55 + intensity * 0.45})`;
            ctx.fillText(ch, sp.x, sp.y);
          }
        }

        raf = requestAnimationFrame(animate);
      };
      raf = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
