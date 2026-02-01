'use client';

import { motion, type Variants, type HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

// ===== ANIMATION VARIANTS =====

export const FADE_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0 },
};

export const FADE_STAGGER_VARIANTS: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.08,
        },
    },
};

export const SLIDE_UP_VARIANTS: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { 
        opacity: 1, 
        y: 0,
        transition: {
            duration: 0.5,
            ease: [0.25, 0.46, 0.45, 0.94],
        },
    },
};

// ===== FADE IN COMPONENT =====

interface IFadeInProps extends HTMLMotionProps<'div'> {
    /** Animation delay in seconds */
    delay?: number;
    /** Animation duration in seconds */
    duration?: number;
    /** Direction of fade (up, down, left, right) */
    direction?: 'up' | 'down' | 'left' | 'right';
    /** Distance to travel in pixels */
    distance?: number;
    /** Children to animate */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
    /** Whether to only animate once (viewport) */
    once?: boolean;
    /** HTML element to render as */
    as?: 'div' | 'section' | 'article' | 'header' | 'footer' | 'aside' | 'main';
}

/**
 * FadeIn - Reusable fade-in animation wrapper
 * 
 * Used for consistent page content animations across the site.
 * Triggers when element enters viewport.
 */
export const FadeIn = ({
    delay = 0,
    duration = 0.5,
    direction = 'up',
    distance = 16,
    children,
    className,
    once = true,
    as = 'div',
    ...props
}: IFadeInProps) => {
    const getInitialPosition = () => {
        switch (direction) {
            case 'up': return { y: distance };
            case 'down': return { y: -distance };
            case 'left': return { x: distance };
            case 'right': return { x: -distance };
            default: return { y: distance };
        }
    };

    const Component = motion[as];

    return (
        <Component
            initial={{ opacity: 0, ...getInitialPosition() }}
            whileInView={{ opacity: 1, x: 0, y: 0 }}
            viewport={{ once, margin: '-50px' }}
            transition={{
                duration,
                delay,
                ease: [0.25, 0.46, 0.45, 0.94],
            }}
            className={className}
            {...props}
        >
            {children}
        </Component>
    );
};

// ===== FADE IN STAGGER COMPONENT =====

interface IFadeInStaggerProps {
    /** Stagger delay between children in seconds */
    staggerDelay?: number;
    /** Initial delay before stagger starts */
    delay?: number;
    /** Children to animate */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
    /** Whether to only animate once */
    once?: boolean;
    /** HTML element to render as */
    as?: 'div' | 'section' | 'ul' | 'ol';
}

/**
 * FadeInStagger - Container for staggered child animations
 * 
 * Wrap children that should animate in sequence.
 * Each direct child will fade in with a delay.
 */
export const FadeInStagger = ({
    staggerDelay = 0.08,
    delay = 0,
    children,
    className,
    once = true,
    as = 'div',
}: IFadeInStaggerProps) => {
    const Component = motion[as];

    return (
        <Component
            initial="hidden"
            whileInView="visible"
            viewport={{ once, margin: '-50px' }}
            transition={{ delayChildren: delay }}
            variants={{
                hidden: { opacity: 0 },
                visible: {
                    opacity: 1,
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </Component>
    );
};

// ===== STAGGER ITEM COMPONENT =====

interface IStaggerItemProps {
    /** Children to animate */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
    /** HTML element to render as */
    as?: 'div' | 'li' | 'article' | 'span';
}

/**
 * StaggerItem - Child element for FadeInStagger
 * 
 * Use inside FadeInStagger for staggered animations.
 */
export const StaggerItem = ({
    children,
    className,
    as = 'div',
}: IStaggerItemProps) => {
    const Component = motion[as];

    return (
        <Component
            variants={FADE_VARIANTS}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className={className}
        >
            {children}
        </Component>
    );
};

// ===== PAGE TRANSITION COMPONENT =====

interface IPageTransitionProps {
    /** Children to animate */
    children: React.ReactNode;
    /** Additional className */
    className?: string;
}

/**
 * PageTransition - Full page fade-in animation
 * 
 * Wrap page content for consistent enter animation.
 */
export const PageTransition = ({ children, className }: IPageTransitionProps) => {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};
