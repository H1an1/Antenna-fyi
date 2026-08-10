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
const MAX_DPR = 1.5;
const FRAME_INTERVAL = 1000 / 24;

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

type PathSample = { x: number; y: number; t: number };
type GridPoint = {
  ix: number;
  iy: number;
  r: number;
  g: number;
  b: number;
  lum: number;
  phase: number;
};

type Geometry = {
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
};

// Shared image data + precomputed valid grid points.
let sharedGridPoints: GridPoint[] | null = null;
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
  const samples: PathSample[] = [];
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

function buildGridPoints(paint: Uint8ClampedArray) {
  const samples = buildPathSamples();
  const bucketSize = PATH_RADIUS;
  const buckets = new Map<string, PathSample[]>();

  for (const sample of samples) {
    const key = `${Math.floor(sample.x / bucketSize)},${Math.floor(sample.y / bucketSize)}`;
    const bucket = buckets.get(key);
    if (bucket) bucket.push(sample);
    else buckets.set(key, [sample]);
  }

  const points: GridPoint[] = [];
  const radiusSquared = PATH_RADIUS * PATH_RADIUS;

  for (let iy = FLAME_Y; iy < FLAME_Y + FLAME_H; iy += STEP) {
    for (let ix = FLAME_X; ix < FLAME_X + FLAME_W; ix += STEP) {
      const pixelIndex = (iy * IMG_W + ix) * 4;
      const r = paint[pixelIndex];
      const g = paint[pixelIndex + 1];
      const b = paint[pixelIndex + 2];
      const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

      // Apply the invariant paint filter once rather than on every frame.
      if (lum < 0.38 || r < g || g < b || r - b < 55) continue;

      const bucketX = Math.floor(ix / bucketSize);
      const bucketY = Math.floor(iy / bucketSize);
      let bestDistance = Infinity;
      let bestPhase = 0;

      // Any path sample within PATH_RADIUS must be in this bucket or a neighbor.
      for (let by = bucketY - 1; by <= bucketY + 1; by++) {
        for (let bx = bucketX - 1; bx <= bucketX + 1; bx++) {
          const candidates = buckets.get(`${bx},${by}`);
          if (!candidates) continue;
          for (const sample of candidates) {
            const dx = sample.x - ix;
            const dy = sample.y - iy;
            const distance = dx * dx + dy * dy;
            if (distance < bestDistance) {
              bestDistance = distance;
              bestPhase = sample.t;
            }
          }
        }
      }

      if (bestDistance < radiusSquared) {
        points.push({ ix, iy, r, g, b, lum, phase: bestPhase });
      }
    }
  }

  return points;
}

function ensureLoaded(): Promise<void> {
  if (sharedGridPoints) return Promise.resolve();
  if (!loadingPromise) {
    loadingPromise = loadImageToData("/events-bg.png").then((paint) => {
      sharedGridPoints = buildGridPoints(paint);
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
    let cancelled = false;
    let isIntersecting = false;
    let isPageVisible = document.visibilityState === "visible";
    let reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let lastFrameTime = 0;
    let geometry: Geometry | null = null;

    const drawFrame = (timestamp: number) => {
      if (!sharedGridPoints || !geometry) return;
      const { width, height, scale, offsetX, offsetY } = geometry;
      ctx.clearRect(0, 0, width, height);

      const time = timestamp * 0.001;
      const fontSize = Math.max(9, Math.round(13 * scale));
      ctx.font = `${fontSize}px Menlo, monospace`;
      ctx.textBaseline = "top";

      // Continuous flow: periodic crests that all advance along the path.
      const FLOW_FREQ = 7;
      const FLOW_SPEED = 0.4;

      for (const point of sharedGridPoints) {
        const wave =
          0.5 +
          0.5 * Math.cos((point.phase * FLOW_FREQ - time * FLOW_SPEED) * Math.PI * 2);
        const intensity = Math.max(0, Math.min(1, point.lum * 0.4 + 0.35 + wave * 0.45));
        if (intensity < 0.05) continue;

        const rampIndex = Math.max(
          0,
          Math.min(RAMP.length - 1, Math.floor(intensity * (RAMP.length - 1))),
        );
        const character = RAMP[rampIndex];
        if (character === " ") continue;

        const lift = 30 + intensity * 90;
        const r = Math.min(255, point.r + lift);
        const g = Math.min(255, point.g + lift * 0.85);
        const b = Math.min(255, point.b + lift * 0.55);

        ctx.fillStyle = `rgba(${r | 0},${g | 0},${b | 0},${0.85 + intensity * 0.15})`;
        ctx.fillText(
          character,
          point.ix * scale + offsetX,
          point.iy * scale + offsetY,
        );
      }
    };

    const shouldAnimate = () =>
      !cancelled && !reducedMotion && isIntersecting && isPageVisible;

    const animate = (timestamp: number) => {
      raf = 0;
      if (!shouldAnimate()) return;

      if (lastFrameTime === 0 || timestamp - lastFrameTime >= FRAME_INTERVAL) {
        drawFrame(timestamp);
        lastFrameTime = timestamp;
      }

      raf = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      lastFrameTime = 0;
    };

    const startAnimation = () => {
      if (!raf && shouldAnimate() && sharedGridPoints && geometry) {
        raf = requestAnimationFrame(animate);
      }
    };

    const renderOrResume = () => {
      if (reducedMotion) {
        stopAnimation();
        drawFrame(0);
      } else {
        startAnimation();
      }
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      const width = entry.contentRect.width;
      const height = entry.contentRect.height;
      if (width <= 0 || height <= 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const imageAspect = IMG_W / IMG_H;
      const viewAspect = width / height;
      const scale = viewAspect > imageAspect ? width / IMG_W : height / IMG_H;
      geometry = {
        width,
        height,
        scale,
        offsetX: viewAspect > imageAspect ? 0 : (width - IMG_W * scale) / 2,
        offsetY: viewAspect > imageAspect ? (height - IMG_H * scale) / 2 : 0,
      };

      drawFrame(reducedMotion ? 0 : performance.now());
      startAnimation();
    });
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = Boolean(entry?.isIntersecting);
      if (isIntersecting) startAnimation();
      else stopAnimation();
    });
    intersectionObserver.observe(canvas);

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === "visible";
      if (isPageVisible) startAnimation();
      else stopAnimation();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleMotionChange = (event: MediaQueryListEvent) => {
      reducedMotion = event.matches;
      renderOrResume();
    };
    motionQuery.addEventListener("change", handleMotionChange);

    ensureLoaded().then(() => {
      if (cancelled) return;
      drawFrame(reducedMotion ? 0 : performance.now());
      startAnimation();
    });

    return () => {
      cancelled = true;
      stopAnimation();
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      motionQuery.removeEventListener("change", handleMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
