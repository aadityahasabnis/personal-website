'use client';

import { useState, useEffect } from 'react';
import { ArrowUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IScrollToTopProps {
    /** Show button after scrolling this many pixels (default: 400) */
    showAfter?: number;
    /** Additional className */
    className?: string;
}

/**
 * ScrollToTop - Smooth scroll to top button
 * 
 * Features:
 * - Appears after scrolling down
 * - Smooth scroll animation
 * - Lavender theme matching site design
 * - Fixed position at bottom-right
 * - Fade in/out animation
 * - Accessible with keyboard
 */
export function ScrollToTop({ showAfter = 400, className }: IScrollToTopProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => {
            if (window.scrollY > showAfter) {
                setIsVisible(true);
            } else {
                setIsVisible(false);
            }
        };

        // Check on mount
        toggleVisibility();

        // Listen to scroll events
        window.addEventListener('scroll', toggleVisibility, { passive: true });

        return () => {
            window.removeEventListener('scroll', toggleVisibility);
        };
    }, [showAfter]);

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth',
        });
    };

    return (
        <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className={cn(
                'fixed bottom-8 right-8 z-50',
                'size-12 rounded-full',
                'flex items-center justify-center',
                'bg-[var(--accent)] text-white',
                'shadow-lg shadow-[var(--glow-color)]',
                'border-2 border-[var(--accent)]',
                'hover:bg-[var(--accent-hover)] hover:border-[var(--accent-hover)]',
                'hover:scale-110 active:scale-95',
                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
                'transition-all duration-300',
                isVisible
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 translate-y-4 pointer-events-none',
                className
            )}
        >
            <ArrowUp className="size-5" />
        </button>
    );
}
