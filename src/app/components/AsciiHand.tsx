"use client";

import { useEffect, useRef, useCallback } from "react";
import { HAND_CHARS } from "./hand-chars";

// Each character becomes a physics particle
interface Particle {
  // Base position (image coords)
  cx: number;
  cy: number;
  // Current offset from base
  ox: number;
  oy: number;
  // Velocity
  vx: number;
  vy: number;
  // Character and color
  c: string;
  b: number;
}

const IMG_W = 2048;
const IMG_H = 1143;

// Frame boundaries
const FRAME_LEFT = 115;
const FRAME_TOP = 88;
const FRAME_RIGHT = IMG_W - 115;
const FRAME_BOTTOM = IMG_H - 92;

function imgToScreen(imgX: number, imgY: number, vw: number, vh: number) {
  const imgAspect = IMG_W / IMG_H;
  const viewAspect = vw / vh;
  let scale: number, offsetX: number, offsetY: number;
  if (viewAspect > imgAspect) {
    scale = vw / IMG_W;
    offsetX = 0;
    offsetY = (vh - IMG_H * scale) / 2;
  } else {
    scale = vh / IMG_H;
    offsetX = (vw - IMG_W * scale) / 2;
    offsetY = 0;
  }
  return { x: imgX * scale + offsetX, y: imgY * scale + offsetY, scale };
}

export function AsciiHand() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, prevX: -9999, prevY: -9999, speed: 0 });
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const inited = useRef(false);

  // Init particles once
  if (!inited.current) {
    particlesRef.current = HAND_CHARS.map((ch) => ({
      cx: ch.x,
      cy: ch.y,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      c: ch.c,
      b: ch.b,
    }));
    inited.current = true;
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const m = mouseRef.current;
    const dx = e.clientX - m.prevX;
    const dy = e.clientY - m.prevY;
    m.speed = Math.sqrt(dx * dx + dy * dy);
    m.prevX = m.x;
    m.prevY = m.y;
    m.x = e.clientX;
    m.y = e.clientY;
  }, []);

  const handleClick = useCallback((e: MouseEvent) => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const mx = e.clientX;
    const my = e.clientY;
    const { scale } = imgToScreen(0, 0, vw, vh);
    const shockRadius = 120;
    const shockStrength = 8;

    for (const p of particlesRef.current) {
      const { x: sx, y: sy } = imgToScreen(p.cx, p.cy, vw, vh);
      const dx = sx - mx;
      const dy = sy - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < shockRadius && dist > 0) {
        const falloff = 1 - dist / shockRadius;
        const force = shockStrength * falloff * falloff;
        const angle = Math.atan2(dy, dx);
        p.vx += Math.cos(angle) * force * scale * 80;
        p.vy += Math.sin(angle) * force * scale * 80;
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio;
      canvas.height = window.innerHeight * window.devicePixelRatio;
      ctx.setTransform(window.devicePixelRatio, 0, 0, window.devicePixelRatio, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);

    // Physics constants
    const PROXIMITY = 100;       // hover push radius
    const PUSH_FORCE = 2.5;      // hover push strength
    const SPRING = 0.04;         // spring back stiffness
    const DAMPING = 0.88;        // velocity damping (friction)
    const SPEED_TRIGGER = 3;     // min mouse speed for inertia push

    const animate = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      ctx.clearRect(0, 0, vw, vh);

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      const mspeed = mouseRef.current.speed;

      const { scale } = imgToScreen(0, 0, vw, vh);
      const fontSize = Math.max(8, Math.round(12 * scale));
      ctx.font = `${fontSize}px Menlo, monospace`;
      ctx.textBaseline = "top";

      // Frame clip
      const ftl = imgToScreen(FRAME_LEFT, FRAME_TOP, vw, vh);
      const fbr = imgToScreen(FRAME_RIGHT, FRAME_BOTTOM, vw, vh);
      ctx.save();
      ctx.beginPath();
      ctx.rect(ftl.x, ftl.y, fbr.x - ftl.x, fbr.y - ftl.y);
      ctx.clip();

      for (const p of particlesRef.current) {
        const { x: baseX, y: baseY } = imgToScreen(p.cx, p.cy, vw, vh);

        // Mouse proximity push
        const dx = (baseX + p.ox) - mx;
        const dy = (baseY + p.oy) - my;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < PROXIMITY && dist > 0) {
          const falloff = 1 - dist / PROXIMITY;
          const pushAmount = PUSH_FORCE * falloff;
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * pushAmount;
          p.vy += Math.sin(angle) * pushAmount;

          // Extra inertia push when mouse is fast
          if (mspeed > SPEED_TRIGGER) {
            const inertia = Math.min(mspeed * 0.15, 6) * falloff;
            p.vx += Math.cos(angle) * inertia;
            p.vy += Math.sin(angle) * inertia;
          }
        }

        // Spring back to origin
        p.vx -= p.ox * SPRING;
        p.vy -= p.oy * SPRING;

        // Damping
        p.vx *= DAMPING;
        p.vy *= DAMPING;

        // Update position
        p.ox += p.vx;
        p.oy += p.vy;

        // Draw
        const drawX = baseX + p.ox;
        const drawY = baseY + p.oy;
        const b = p.b;
        ctx.fillStyle = `rgb(${b},${Math.round(b * 0.96)},${Math.round(b * 0.91)})`;
        ctx.fillText(p.c, drawX, drawY);
      }

      ctx.restore();
      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [handleMouseMove, handleClick]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
    />
  );
}
