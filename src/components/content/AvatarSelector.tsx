'use client';

import { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { AVATAR_OPTIONS } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface IAvatarSelectorProps {
    selectedAvatar: string;
    onSelect: (avatarId: string) => void;
}

/**
 * AvatarSelector - Horizontal scrolling emoji avatar picker
 * 
 * Features:
 * - 12 emoji avatars to choose from
 * - Horizontal scroll with navigation buttons
 * - Smooth scroll behavior
 * - Keyboard accessible
 */
export function AvatarSelector({ selectedAvatar, onSelect }: IAvatarSelectorProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateScrollButtons = () => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
        }
    };

    useEffect(() => {
        updateScrollButtons();
        const ref = scrollRef.current;
        if (ref) {
            ref.addEventListener('scroll', updateScrollButtons);
            return () => ref.removeEventListener('scroll', updateScrollButtons);
        }
    }, []);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 200;
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <div>
            <label className="block text-sm font-medium text-[var(--fg-muted)] mb-2">
                Choose your avatar
            </label>
            <div className="relative">
                {/* Left scroll button */}
                {canScrollLeft && (
                    <button
                        type="button"
                        onClick={() => scroll('left')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-[var(--bg)] border border-[var(--border-color)] flex items-center justify-center shadow-lg hover:bg-[var(--surface)] transition-colors"
                        aria-label="Scroll left"
                    >
                        <ChevronLeft className="size-4" />
                    </button>
                )}

                {/* Avatar grid */}
                <div
                    ref={scrollRef}
                    className="flex gap-2 overflow-x-auto scrollbar-hide py-2 px-1"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {AVATAR_OPTIONS.map((avatar) => (
                        <button
                            key={avatar.id}
                            type="button"
                            onClick={() => onSelect(avatar.id)}
                            className={cn(
                                'flex-shrink-0 size-14 rounded-full flex items-center justify-center text-2xl',
                                'border-2 transition-all hover:scale-110',
                                'focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2',
                                selectedAvatar === avatar.id
                                    ? 'border-[var(--accent)] bg-[var(--accent-subtle)] scale-110'
                                    : 'border-[var(--border-color)] bg-[var(--surface)] hover:border-[var(--accent)]'
                            )}
                            aria-label={`Select ${avatar.label} avatar`}
                            title={avatar.label}
                        >
                            {avatar.emoji}
                        </button>
                    ))}
                </div>

                {/* Right scroll button */}
                {canScrollRight && (
                    <button
                        type="button"
                        onClick={() => scroll('right')}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 size-8 rounded-full bg-[var(--bg)] border border-[var(--border-color)] flex items-center justify-center shadow-lg hover:bg-[var(--surface)] transition-colors"
                        aria-label="Scroll right"
                    >
                        <ChevronRight className="size-4" />
                    </button>
                )}
            </div>
        </div>
    );
}
