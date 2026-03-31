'use client';

import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface IBeamLineProps {
    // Animation delay in seconds (default: 0.4)
    delay?: number;
    // Animation duration in seconds (default: 0.8)
    duration?: number;
    // Transform origin point (default: 'left')
    origin?: 'left' | 'center' | 'right';
    // Additional className
    className?: string;
    // Margin top spacing (default: 'mt-8')
    spacing?: string;
}

export function BeamLine({ delay = 0.4, duration = 0.8, origin = 'left', className, spacing = 'mt-8' }: IBeamLineProps) {
    return (
        <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration, delay }}
            className={cn(spacing, 'h-px bg-linear-to-r from-primary via-primary/50 to-transparent', origin === 'center' && 'mx-auto max-w-xs', className)}
            style={{ transformOrigin: origin }}
            aria-hidden='true'
            role='separator'
        />
    );
}

export type { IBeamLineProps };
