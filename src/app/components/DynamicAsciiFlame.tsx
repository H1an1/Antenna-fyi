"use client";

import { useEffect, useRef } from "react";

// events-bg.png is 1824 × 943
const IMG_W = 1824;
const IMG_H = 943;

// Generous bbox around the swirling flame — color filter handles the rest.
const FLAME_X = 600;
const FLAME_Y = 20;
const FLAME_W = 900;
const FLAME_H = 750;

const STEP = 7;

// Hand-traced spine of the swirl in image coordinates.
// (rough; tweak these to nudge the flow line.)
const PATH_POINTS: [number, number][] = [
  [912, 380],
  [990, 320],
  [1090, 260],
  [1210, 220],
  [1330, 240],
  [1430, 320],
  [1480, 430],
  [1450, 540],
  [1350, 600],
  [1230, 600],
  [1130, 560],
];

// Width around the path that gets phase assigned (px, image space)
const PATH_RADIUS = 130;

const RAMP = " ·.:;-+=*o#%@";

// Shared image data + precomputed phase map
let sharedPaint: Uint8ClampedArray | null = null;
let phaseMap: Map<number, number> | null = null; // key = iy * IMG_W + ix → phase ∈ [0,1]
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

// Build arc-length-parameterized samples along the polyline path.
function buildPathSamples() {
  let total = 0;
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const [x0, y0] = PATH_POINTS[i];
    const [x1, y1] = PATH_POINTS[i + 1];
    total += Math.hypot(x1 - x0, y1 - y0);
  }
  const samples: { x: number; y: number; t: number }[] = [];
  let acc = 0;
  const TARGET = 600;
  for (let i = 0; i < PATH_POINTS.length - 1; i++) {
    const [x0, y0] = PATH_POINTS[i];
    const [x1, y1] = PATH_POINTS[i + 1];
    const dx = x1 - x0;
    const dy = y1 - y0;
    const len = Math.hypot(dx, dy);
    const steps = Math.max(2, Math.round((TARGET * len) / total));
    for (let s = 0; s < steps; s++) {
      const u = s / steps;
      samples.push({
        x: x0 + dx * u,
        y: y0 + dy * u,
        t: (acc + len * u) / total,
      });
    }
    acc += len;
  }
  samples.push({
    x: PATH_POINTS[PATH_POINTS.length - 1][0],
    y: PATH_POINTS[PATH_POINTS.length - 1][1],
    t: 1,
  });
  return samples;
}

function buildPhaseMap() {
  if (phaseMap) return;
  const samples = buildPathSamples();
  const map = new Map<number, number>();
  const r2 = PATH_RADIUS * PATH_RADIUS;
  for (let iy = FLAME_Y; iy < FLAME_Y + FLAME_H; iy += STEP) {
    for (let ix = FLAME_X; ix < FLAME_X + FLAME_W; ix += STEP) {
      let best = Infinity;
      let bestT = 0;
      for (let i = 0; i < samples.length; i++) {
        const s = samples[i];
        const d = (s.x - ix) * (s.x - ix) + (s.y - iy) * (s.y - iy);
        if (d < best) {
          best = d;
          bestT = s.t;
        }
      }
      if (best < r2) {
        map.set(iy * IMG_W + ix, bestT);
      }
    }
  }
  phaseMap = map;
}

function ensureLoaded(): Promise<void> {
  if (sharedPaint && phaseMap) return Promise.resolve();
  if (!loadingPromise) {
    loadingPromise = loadImageToData("/events-bg.png").then((p) => {
      sharedPaint = p;
      buildPhaseMap();
    });
  }
  return loadingPromise;
}

export function DynamicAsciiFlame() {
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
      const animate = () => {
        if (!sharedPaint || !phaseMap) return;
        const { w: vw, h: vh } = getSize();
        ctx.clearRect(0, 0, vw, vh);

        const t = performance.now() * 0.001;
        const { scale } = imgToContainer(0, 0);
        const fontSize = Math.max(9, Math.round(13 * scale));
        ctx.font = `${fontSize}px Menlo, monospace`;
        ctx.textBaseline = "top";

        // Continuous flow: periodic crests that all advance along the path.
        const FLOW_FREQ = 7;   // number of bright bands along the curve
        const FLOW_SPEED = 0.4; // higher = faster current

        for (let iy = FLAME_Y; iy < FLAME_Y + FLAME_H; iy += STEP) {
          for (let ix = FLAME_X; ix < FLAME_X + FLAME_W; ix += STEP) {
            const idx = (iy * IMG_W + ix) * 4;
            const r0 = sharedPaint[idx];
            const g0 = sharedPaint[idx + 1];
            const b0 = sharedPaint[idx + 2];

            // Bright + warm filter — only the gold flame.
            const lum = (0.299 * r0 + 0.587 * g0 + 0.114 * b0) / 255;
            if (lum < 0.38) continue;
            if (r0 < g0 || g0 < b0) continue;
            if (r0 - b0 < 55) continue;

            const phase = phaseMap.get(iy * IMG_W + ix);
            if (phase === undefined) continue; // off the path corridor

            // Periodic crests sliding along the path → continuous flow.
            const wave =
              0.5 +
              0.5 * Math.cos((phase * FLOW_FREQ - t * FLOW_SPEED) * Math.PI * 2);

            // Always-on base + traveling crests.
            let intensity = lum * 0.4 + 0.35 + wave * 0.45;

            intensity = Math.max(0, Math.min(1, intensity));
            if (intensity < 0.05) continue;

            const rampIdx = Math.max(
              0,
              Math.min(RAMP.length - 1, Math.floor(intensity * (RAMP.length - 1)))
            );
            const ch = RAMP[rampIdx];
            if (ch === " ") continue;

            const sp = imgToContainer(ix, iy);

            const lift = 30 + intensity * 90;
            const r = Math.min(255, r0 + lift);
            const g = Math.min(255, g0 + lift * 0.85);
            const b = Math.min(255, b0 + lift * 0.55);

            ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${
              0.85 + intensity * 0.15
            })`;
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
