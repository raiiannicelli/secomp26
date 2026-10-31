import { useState, useEffect } from 'react';

/**
 * Cross-browser resilient useIsMobile hook.
 * Safely handles iOS Safari, Android, desktop, and SSR without throwing matchMedia exceptions.
 */
export function useIsMobile(breakpoint: number = 640): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window !== 'undefined' && typeof window.innerWidth === 'number') {
      return window.innerWidth < breakpoint;
    }
    return false;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    try {
      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);

      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        setIsMobile(e.matches);
      };

      setIsMobile(mediaQuery.matches);

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange as any);
      } else if (typeof (mediaQuery as any).addListener === 'function') {
        (mediaQuery as any).addListener(handleChange);
      }

      return () => {
        try {
          if (typeof mediaQuery.removeEventListener === 'function') {
            mediaQuery.removeEventListener('change', handleChange as any);
          } else if (typeof (mediaQuery as any).removeListener === 'function') {
            (mediaQuery as any).removeListener(handleChange);
          }
        } catch {}
      };
    } catch {
      // Fallback on window resize if matchMedia is unavailable
      const handleResize = () => {
        setIsMobile(window.innerWidth < breakpoint);
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [breakpoint]);

  return isMobile;
}
