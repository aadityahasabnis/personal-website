'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';

interface ILenisProviderProps {
  children: ReactNode;
}

/**
 * Lenis Smooth Scroll Provider
 * 
 * Provides buttery smooth scrolling across the site.
 * Optimized for responsiveness while maintaining smoothness.
 */
export const LenisProvider = ({ children }: ILenisProviderProps) => {
  const lenisRef = useRef<Lenis | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Skip smooth scroll for users who prefer reduced motion
      return;
    }

    // Initialize Lenis with optimized settings
    const lenis = new Lenis({
      duration: 0.8, // Faster, more responsive (was 1.2)
      easing: (t) => 1 - Math.pow(1 - t, 3), // Cubic ease-out - smoother & lighter
      orientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1, // Default wheel sensitivity
      touchMultiplier: 1.5, // Slightly reduced for better control (was 2)
      infinite: false,
    });

    lenisRef.current = lenis;

    // Optimized animation loop
    const raf = (time: number) => {
      lenis.raf(time);
      rafRef.current = requestAnimationFrame(raf);
    };

    rafRef.current = requestAnimationFrame(raf);

    // Cleanup
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return <>{children}</>;
};

export default LenisProvider;
