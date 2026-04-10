"use client";

import { useEffect, useRef, useCallback } from "react";

export function RippleCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ripples = useRef<Array<{ x: number; y: number; time: number; strength: number }>>([]);
  const rafRef = useRef<number>(0);
  const lastMouse = useRef({ x: 0, y: 0, time: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Only add ripple if mouse moved enough distance
    const dx = x - lastMouse.current.x;
    const dy = y - lastMouse.current.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > 30) {
      ripples.current.push({
        x,
        y,
        time: performance.now(),
        strength: Math.min(dist * 0.3, 15),
      });
      lastMouse.current = { x, y, time: performance.now() };

      // Keep max 8 ripples
      if (ripples.current.length > 8) {
        ripples.current.shift();
      }
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Match canvas size to display size
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();
    window.addEventListener("resize", resize);

    canvas.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      const now = performance.now();
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;

      ctx.clearRect(0, 0, w, h);

      // Draw ripple rings
      ripples.current = ripples.current.filter((r) => {
        const age = (now - r.time) / 1000;
        if (age > 2) return false; // Remove after 2 seconds

        const radius = age * 150; // Expand speed
        const opacity = Math.max(0, 1 - age / 2) * 0.15;
        const lineWidth = Math.max(0.5, 3 - age * 1.5);

        // Draw concentric rings
        for (let i = 0; i < 3; i++) {
          const r2 = radius - i * 12;
          if (r2 > 0) {
            ctx.beginPath();
            ctx.arc(r.x, r.y, r2, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(200, 195, 185, ${opacity * (1 - i * 0.3)})`;
            ctx.lineWidth = lineWidth;
            ctx.stroke();
          }
        }

        return true;
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(rafRef.current);
      canvas.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", resize);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto cursor-crosshair"
      style={{ mixBlendMode: "screen" }}
    />
  );
}
