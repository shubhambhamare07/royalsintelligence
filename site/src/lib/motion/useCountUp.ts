import { useState, useEffect, useRef } from 'react';

export function useCountUp(
  targetValue: number,
  duration = 1000,
  decimals = 2,
  trigger = true
): string {
  const [current, setCurrent] = useState<number>(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const hasAnimatedRef = useRef<boolean>(false);

  useEffect(() => {
    // If reduced motion is preferred, jump straight to targetValue
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(targetValue);
      return;
    }

    if (!trigger || hasAnimatedRef.current) {
      setCurrent(targetValue);
      return;
    }

    const startVal = 0;
    const startTime = performance.now();
    startRef.current = startTime;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const nextVal = startVal + (targetValue - startVal) * easedProgress;

      setCurrent(nextVal);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCurrent(targetValue);
        hasAnimatedRef.current = true;
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [targetValue, duration, trigger]);

  return current.toFixed(decimals);
}

