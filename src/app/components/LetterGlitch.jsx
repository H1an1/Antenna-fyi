'use client';

import { useRef, useEffect } from 'react';

const MAX_DPR = 1.5;
const FRAME_INTERVAL = 1000 / 30;
const TRANSITION_STEP_PER_MS = 0.05 / (1000 / 60);

const LetterGlitch = ({
  glitchColors = ['#2b4539', '#61dca3', '#61b3dc'],
  className = '',
  glitchSpeed = 50,
  centerVignette = false,
  outerVignette = true,
  smooth = true,
  characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$&*()-_+=/[]{};:<>.,0123456789'
}) => {
  const canvasRef = useRef(null);
  const glitchColorKey = glitchColors.join('\u0000');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const activeColors = glitchColorKey.split('\u0000');
    const lettersAndSymbols = Array.from(characters);
    const fontSize = 16;
    const charWidth = 10;
    const charHeight = 20;

    let letters = [];
    let columns = 0;
    let width = 0;
    let height = 0;
    let animationFrame = 0;
    let wakeTimeout = 0;
    let resizeTimeout = 0;
    let cancelled = false;
    let isIntersecting = false;
    let isPageVisible = document.visibilityState === 'visible';
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let lastGlitchTime = performance.now();
    let lastFrameTime = 0;

    const getRandomChar = () =>
      lettersAndSymbols[Math.floor(Math.random() * lettersAndSymbols.length)];

    const getRandomColor = () =>
      activeColors[Math.floor(Math.random() * activeColors.length)];

    const hexToRgb = hex => {
      const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
      const expanded = hex.replace(shorthandRegex, (match, r, g, b) => r + r + g + g + b + b);
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(expanded);
      return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          }
        : null;
    };

    const interpolateColor = (start, end, factor) => {
      const r = Math.round(start.r + (end.r - start.r) * factor);
      const g = Math.round(start.g + (end.g - start.g) * factor);
      const b = Math.round(start.b + (end.b - start.b) * factor);
      return `rgb(${r}, ${g}, ${b})`;
    };

    const initializeLetters = (rows, nextColumns) => {
      columns = nextColumns;
      letters = Array.from({ length: columns * rows }, () => ({
        char: getRandomChar(),
        color: getRandomColor(),
        targetColor: getRandomColor(),
        colorProgress: 1
      }));
    };

    const drawLetters = () => {
      if (letters.length === 0) return;
      ctx.clearRect(0, 0, width, height);
      ctx.font = `${fontSize}px monospace`;
      ctx.textBaseline = 'top';

      letters.forEach((letter, index) => {
        const x = (index % columns) * charWidth;
        const y = Math.floor(index / columns) * charHeight;
        ctx.fillStyle = letter.color;
        ctx.fillText(letter.char, x, y);
      });
    };

    const resizeCanvas = (nextWidth, nextHeight) => {
      width = nextWidth;
      height = nextHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const nextColumns = Math.ceil(width / charWidth);
      const rows = Math.ceil(height / charHeight);
      initializeLetters(rows, nextColumns);
      drawLetters();
    };

    const updateLetters = () => {
      const updateCount = Math.max(1, Math.floor(letters.length * 0.05));
      for (let i = 0; i < updateCount; i++) {
        const index = Math.floor(Math.random() * letters.length);
        if (!letters[index]) continue;
        letters[index].char = getRandomChar();
        letters[index].targetColor = getRandomColor();

        if (smooth) {
          letters[index].colorProgress = 0;
        } else {
          letters[index].color = letters[index].targetColor;
          letters[index].colorProgress = 1;
        }
      }
    };

    const handleSmoothTransitions = deltaMs => {
      let hasTransition = false;
      for (const letter of letters) {
        if (letter.colorProgress >= 1) continue;
        letter.colorProgress = Math.min(
          1,
          letter.colorProgress + TRANSITION_STEP_PER_MS * deltaMs
        );
        const startRgb = hexToRgb(letter.color);
        const endRgb = hexToRgb(letter.targetColor);
        if (startRgb && endRgb) {
          letter.color = interpolateColor(startRgb, endRgb, letter.colorProgress);
        }
        if (letter.colorProgress < 1) hasTransition = true;
      }
      return hasTransition;
    };

    const canAnimate = () =>
      !cancelled && !reducedMotion && isIntersecting && isPageVisible;

    const clearScheduledWork = () => {
      if (animationFrame) cancelAnimationFrame(animationFrame);
      if (wakeTimeout) window.clearTimeout(wakeTimeout);
      animationFrame = 0;
      wakeTimeout = 0;
      lastFrameTime = 0;
    };

    const scheduleWake = now => {
      if (!canAnimate() || wakeTimeout) return;
      const delay = Math.max(0, glitchSpeed - (now - lastGlitchTime));
      wakeTimeout = window.setTimeout(() => {
        wakeTimeout = 0;
        if (canAnimate() && !animationFrame) {
          animationFrame = requestAnimationFrame(animate);
        }
      }, delay);
    };

    const animate = timestamp => {
      animationFrame = 0;
      if (!canAnimate()) return;

      if (lastFrameTime && timestamp - lastFrameTime < FRAME_INTERVAL) {
        animationFrame = requestAnimationFrame(animate);
        return;
      }

      const deltaMs = lastFrameTime ? timestamp - lastFrameTime : FRAME_INTERVAL;
      lastFrameTime = timestamp;
      let needsRedraw = false;

      if (timestamp - lastGlitchTime >= glitchSpeed) {
        updateLetters();
        lastGlitchTime = timestamp;
        needsRedraw = true;
      }

      const hasTransition = smooth && handleSmoothTransitions(deltaMs);
      if (hasTransition) needsRedraw = true;
      if (needsRedraw) drawLetters();

      if (hasTransition) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        lastFrameTime = 0;
        scheduleWake(timestamp);
      }
    };

    const resume = () => {
      if (!canAnimate() || animationFrame || wakeTimeout || letters.length === 0) return;
      scheduleWake(performance.now());
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      if (!entry) return;
      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(() => {
        if (cancelled) return;
        clearScheduledWork();
        resizeCanvas(entry.contentRect.width, entry.contentRect.height);
        lastGlitchTime = performance.now();
        resume();
      }, 100);
    });
    resizeObserver.observe(parent);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = Boolean(entry?.isIntersecting);
      if (isIntersecting) resume();
      else clearScheduledWork();
    });
    intersectionObserver.observe(parent);

    const handleVisibilityChange = () => {
      isPageVisible = document.visibilityState === 'visible';
      if (isPageVisible) resume();
      else clearScheduledWork();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = event => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        clearScheduledWork();
        drawLetters();
      } else {
        lastGlitchTime = performance.now();
        resume();
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      cancelled = true;
      clearScheduledWork();
      window.clearTimeout(resizeTimeout);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleMotionChange);
    };
  }, [characters, glitchColorKey, glitchSpeed, smooth]);

  const containerStyle = {
    position: 'relative',
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    overflow: 'hidden'
  };

  const canvasStyle = {
    display: 'block',
    width: '100%',
    height: '100%'
  };

  const outerVignetteStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,0) 60%, rgba(0,0,0,1) 100%)'
  };

  const centerVignetteStyle = {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    pointerEvents: 'none',
    background: 'radial-gradient(circle, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 60%)'
  };

  return (
    <div style={containerStyle} className={className}>
      <canvas ref={canvasRef} style={canvasStyle} />
      {outerVignette && <div style={outerVignetteStyle}></div>}
      {centerVignette && <div style={centerVignetteStyle}></div>}
    </div>
  );
};

export default LetterGlitch;
