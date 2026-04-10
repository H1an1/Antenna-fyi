"use client";

import { useEffect, useRef, useState, type ReactNode, type CSSProperties } from "react";

export function ScrollReveal({
  children,
  className = "",
  style,
  offset = 60,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  offset?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: visible ? 1 : 0,
        transform: visible
          ? (style?.transform || "translateY(0)")
          : `translateY(${offset}px)`,
        transition: "opacity 0.8s ease-out, transform 0.8s ease-out",
      }}
    >
      {children}
    </div>
  );
}
