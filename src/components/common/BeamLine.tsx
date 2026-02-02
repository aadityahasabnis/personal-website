'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface IBeamLineProps {
  /** Animation delay in seconds (default: 0.4) */
  delay?: number;
  /** Animation duration in seconds (default: 0.8) */
  duration?: number;
  /** Transform origin point (default: 'left') */
  origin?: 'left' | 'center' | 'right';
  /** Additional className */
  className?: string;
  /** Margin top spacing (default: 'mt-8') */
  spacing?: string;
}

/**
 * BeamLine - Animated gradient separator line
 * 
 * A decorative gradient line that animates from left to right (or from center).
 * Used consistently across headers, sections, and content dividers.
 * 
 * Features:
 * - Smooth scale animation using Framer Motion
 * - Consistent lavender gradient (accent color)
 * - Configurable animation timing
 * - Configurable transform origin
 * - Responsive and accessible
 * 
 * @example
 * ```tsx
 * // Default (left-to-right)
 * <BeamLine />
 * 
 * // Center origin with custom delay
 * <BeamLine origin="center" delay={0.6} />
 * 
 * // Custom spacing
 * <BeamLine spacing="mt-12" />
 * ```
 */
export function BeamLine({
  delay = 0.4,
  duration = 0.8,
  origin = 'left',
  className,
  spacing = 'mt-8',
}: IBeamLineProps) {
  return (
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration, delay }}
      className={cn(
        spacing,
        'h-px bg-gradient-to-r from-[var(--accent)] via-[var(--accent)]/50 to-transparent',
        origin === 'center' && 'mx-auto max-w-xs',
        className
      )}
      style={{ transformOrigin: origin }}
      aria-hidden="true"
      role="separator"
    />
  );
}

export type { IBeamLineProps };
