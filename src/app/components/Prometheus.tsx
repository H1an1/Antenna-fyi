"use client";

import { useEffect, useRef } from "react";

// Mirror events-bg's image-space coordinate system
const IMG_W = 1824;
const IMG_H = 943;

// Source asset
const SRC = "/prometheus.png";
const SRC_ASPECT = 378 / 612;

// Where the torch tip sits inside the source PNG (fraction of the PNG)
const TORCH_TIP_FX = 0.22;
const TORCH_TIP_FY = 0.05;

// Width of Prometheus in events-bg image space (px). Tweak to scale.
const PROM_IMG_W = 380;

// Flame-spine origin in events-bg image space — must match PATH_POINTS[0]
// in DynamicAsciiFlame.
const FLAME_START_X = 970;
const FLAME_START_Y = 250;

export function Prometheus() {
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const parent = el.parentElement;
    if (!parent) return;

    const place = () => {
      const rect = parent.getBoundingClientRect();
      const vw = rect.width;
      const vh = rect.height;
      // Same cover-fit math the flame canvas uses.
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

      const pw = PROM_IMG_W * scale;
      const ph = pw / SRC_ASPECT;
      const torchScreenX = FLAME_START_X * scale + ox;
      const torchScreenY = FLAME_START_Y * scale + oy;
      const left = torchScreenX - TORCH_TIP_FX * pw;
      const top = torchScreenY - TORCH_TIP_FY * ph;

      el.style.width = `${pw}px`;
      el.style.height = `${ph}px`;
      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
      el.style.opacity = "1";
    };

    const ro = new ResizeObserver(place);
    ro.observe(parent);
    place();
    return () => ro.disconnect();
  }, []);

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      ref={ref}
      src={SRC}
      alt=""
      className="absolute pointer-events-none select-none"
      style={{ opacity: 0, width: 0, height: 0 }}
    />
  );
}
