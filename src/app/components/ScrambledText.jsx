'use client';

import { useEffect, useRef } from 'react';

import './ScrambledText.css';

const ScrambledText = ({
  radius = 100,
  duration = 1.2,
  speed = 0.5,
  scrambleChars = '.:',
  className = '',
  style = {},
  children
}) => {
  const rootRef = useRef(null);

  useEffect(() => {
    const root = rootRef.current;
    const paragraph = root?.querySelector('p');
    if (!root || !paragraph) return;

    let cancelled = false;
    let initialized = false;
    let loadingPromise = null;
    let split = null;
    let gsapInstance = null;
    let chars = [];
    let centers = [];
    let geometryInvalid = true;
    let pointerFrame = 0;
    let pendingPointer = null;
    let isIntersecting = false;
    let reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const recomputeCenters = () => {
      if (!initialized || reducedMotion) return;
      // Page coordinates, so cached centers stay valid while the user scrolls.
      centers = chars.map(char => {
        const rect = char.getBoundingClientRect();
        return {
          x: rect.left + rect.width / 2 + window.scrollX,
          y: rect.top + rect.height / 2 + window.scrollY
        };
      });
      geometryInvalid = false;
    };

    const invalidateGeometry = () => {
      geometryInvalid = true;
      if (initialized && !reducedMotion) recomputeCenters();
    };

    const processPointer = () => {
      pointerFrame = 0;
      if (!initialized || reducedMotion || !pendingPointer) return;
      if (geometryInvalid) recomputeCenters();

      const pointer = pendingPointer;
      pendingPointer = null;
      chars.forEach((char, index) => {
        const center = centers[index];
        if (!center) return;
        const distance = Math.hypot(pointer.x - center.x, pointer.y - center.y);
        if (distance >= radius) return;

        gsapInstance.to(char, {
          overwrite: true,
          duration: duration * (1 - distance / radius),
          scrambleText: {
            text: char.dataset.content || '',
            chars: scrambleChars,
            speed
          },
          ease: 'none'
        });
      });
    };

    const schedulePointer = () => {
      if (!pointerFrame && initialized && !reducedMotion) {
        pointerFrame = requestAnimationFrame(processPointer);
      }
    };

    const initialize = async () => {
      if (initialized || reducedMotion || cancelled) return;
      if (!loadingPromise) {
        loadingPromise = Promise.all([
          import('gsap'),
          import('gsap/SplitText'),
          import('gsap/ScrambleTextPlugin')
        ]);
      }

      const [{ gsap }, { SplitText }, { ScrambleTextPlugin }] = await loadingPromise;
      if (cancelled || reducedMotion || initialized) return;

      gsap.registerPlugin(SplitText, ScrambleTextPlugin);
      gsapInstance = gsap;
      split = SplitText.create(paragraph, {
        type: 'chars',
        charsClass: 'char'
      });
      chars = split.chars;
      chars.forEach(char => {
        gsap.set(char, {
          display: 'inline-block',
          attr: { 'data-content': char.innerHTML }
        });
      });
      initialized = true;
      recomputeCenters();
      schedulePointer();
    };

    const handlePointer = event => {
      if (reducedMotion) return;
      pendingPointer = { x: event.pageX, y: event.pageY };
      void initialize();
      schedulePointer();
    };
    root.addEventListener('pointerenter', handlePointer);
    root.addEventListener('pointermove', handlePointer);

    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isIntersecting = Boolean(entry?.isIntersecting);
      if (isIntersecting && !reducedMotion) void initialize();
    });
    intersectionObserver.observe(root);

    const resizeObserver = new ResizeObserver(() => invalidateGeometry());
    resizeObserver.observe(root);

    const fontSet = document.fonts;
    const handleFontsLoaded = () => invalidateGeometry();
    fontSet?.addEventListener('loadingdone', handleFontsLoaded);
    fontSet?.ready.then(() => {
      if (!cancelled) invalidateGeometry();
    });

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMotionChange = event => {
      reducedMotion = event.matches;
      if (reducedMotion) {
        if (pointerFrame) cancelAnimationFrame(pointerFrame);
        pointerFrame = 0;
        pendingPointer = null;
        if (gsapInstance && chars.length) {
          gsapInstance.killTweensOf(chars);
          chars.forEach(char => {
            char.textContent = char.dataset.content || '';
          });
        }
      } else if (isIntersecting) {
        void initialize();
      }
    };
    motionQuery.addEventListener('change', handleMotionChange);

    return () => {
      cancelled = true;
      if (pointerFrame) cancelAnimationFrame(pointerFrame);
      root.removeEventListener('pointerenter', handlePointer);
      root.removeEventListener('pointermove', handlePointer);
      intersectionObserver.disconnect();
      resizeObserver.disconnect();
      fontSet?.removeEventListener('loadingdone', handleFontsLoaded);
      motionQuery.removeEventListener('change', handleMotionChange);
      if (gsapInstance && chars.length) gsapInstance.killTweensOf(chars);
      if (split) split.revert();
    };
  }, [radius, duration, speed, scrambleChars]);

  return (
    <div ref={rootRef} className={`text-block ${className}`} style={style}>
      <p>{children}</p>
    </div>
  );
};

export default ScrambledText;
