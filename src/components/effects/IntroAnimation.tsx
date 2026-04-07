'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface IIntroAnimationProps {
    /** Duration of the intro animation in ms */
    duration?: number;
    /** Delay before animation starts in ms */
    delay?: number;
    /** Logo or text to display during intro */
    children?: React.ReactNode;
    /** Called when intro animation completes */
    onComplete?: () => void;
}

const INTRO_EXIT_BUFFER_MS = 100;

/**
 * Full-screen intro animation that reveals the page content
 * Slides away from bottom to top with a smooth ease-out
 */
export const IntroAnimation = ({ duration = 800, delay = 500, children, onComplete }: IIntroAnimationProps) => {
    const [isVisible, setIsVisible] = useState(true);
    const [isAnimating, setIsAnimating] = useState(false);
    const shouldReduceMotion = useReducedMotion();

    useEffect(() => {
        if (shouldReduceMotion) {
            setIsVisible(false);
            onComplete?.();

            return;
        }

        // Start animation after delay
        const delayTimer = setTimeout(() => {
            setIsAnimating(true);
        }, delay);

        // Hide completely after animation
        const hideTimer = setTimeout(
            () => {
                setIsVisible(false);
                onComplete?.();
            },
            delay + duration + INTRO_EXIT_BUFFER_MS,
        );

        return () => {
            clearTimeout(delayTimer);
            clearTimeout(hideTimer);
        };
    }, [delay, duration, onComplete, shouldReduceMotion]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ y: 0 }}
                    animate={isAnimating ? { y: '-100%' } : { y: 0 }}
                    exit={{ y: '-100%' }}
                    transition={{
                        duration: duration / 1000,
                        ease: [0.76, 0, 0.24, 1], // Custom ease-out
                    }}
                    className='fixed inset-0 z-100 flex items-center justify-center'
                    style={{
                        background: 'var(--bg)',
                    }}
                    aria-hidden='true'
                >
                    {/* Content shown during intro */}
                    <motion.div
                        initial={{ opacity: 1, scale: 1 }}
                        animate={isAnimating ? { opacity: 0, scale: 0.95 } : { opacity: 1, scale: 1 }}
                        transition={{
                            duration: 0.3,
                            ease: 'easeOut',
                        }}
                        className='flex flex-col items-center gap-4'
                    >
                        {children || (
                            <>
                                {/* Default logo/loading indicator */}
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.4 }} className='heading-1 gradient-text'>
                                    AH
                                </motion.div>
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.2, duration: 0.3 }}
                                    className='h-0.5 w-12 bg-linear-to-r from-transparent via-(--accent) to-transparent origin-center'
                                />
                            </>
                        )}
                    </motion.div>

                    {/* Decorative elements */}
                    <div className='absolute inset-0 pointer-events-none'>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.5 }}
                            transition={{ delay: 0.2 }}
                            className='absolute right-1/4 top-1/4 h-64 w-64 rounded-full'
                            style={{
                                background: 'var(--sphere-1)',
                                filter: 'blur(60px)',
                            }}
                        />
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.3 }}
                            transition={{ delay: 0.3 }}
                            className='absolute bottom-1/3 left-1/3 h-48 w-48 rounded-full'
                            style={{
                                background: 'var(--sphere-2)',
                                filter: 'blur(50px)',
                            }}
                        />
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default IntroAnimation;
