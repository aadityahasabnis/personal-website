'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AVATAR_OPTIONS } from '@/lib/storage';
import { cn } from '@/lib/utils';

// =============================================================
// Types
// =============================================================

interface ICommentAvatarPickerProps {
    selectedAvatar: string;
    onSelect: (avatarId: string) => void;
}

// =============================================================
// Component
// =============================================================

export const CommentAvatarPicker = ({ selectedAvatar, onSelect }: ICommentAvatarPickerProps) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        // Guard against sub-pixel rounding
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    }, []);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -160 : 160,
            behavior: 'smooth',
        });
    }, []);

    useEffect(() => {
        const el = scrollRef.current;
        if (!el) return;

        updateScrollState();

        // Keep chevrons in sync with scroll/resize.
        el.addEventListener('scroll', updateScrollState, { passive: true });
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [updateScrollState]);

    return (
        <fieldset className='space-y-2 w-full max-w-full min-w-0 [min-inline-size:0]'>
            <legend className='text-small font-medium text-foreground'>Choose your avatar</legend>

            <div className='relative w-full max-w-full'>
                {/*
                 * The scroll area must be allowed to shrink inside flex/grid parents.
                 * `min-w-0` prevents the avatar row from overflowing its frame.
                 */}
                <div
                    className={cn(
                        'relative overflow-hidden rounded-lg border border-border bg-muted/30 px-3 py-2',
                        // Reserve space for chevrons on desktop only.
                        'sm:px-10',
                    )}
                >
                    {/* Edge fades (more reliable than mask-image across browsers) */}
                    <div aria-hidden className='pointer-events-none absolute inset-y-0 left-0 w-6 sm:w-8 bg-gradient-to-r from-muted/30 to-transparent' />
                    <div aria-hidden className='pointer-events-none absolute inset-y-0 right-0 w-6 sm:w-8 bg-gradient-to-l from-muted/30 to-transparent' />

                    {/* Mobile: wrap into a grid to avoid any horizontal overflow. */}
                    <div className='grid grid-cols-5 gap-1.5 sm:hidden justify-items-center'>
                        {AVATAR_OPTIONS.map((avatar) => {
                            const isSelected = selectedAvatar === avatar.id;
                            return (
                                <button
                                    key={avatar.id}
                                    type='button'
                                    onClick={() => onSelect(avatar.id)}
                                    className={cn(
                                        'group relative flex items-center justify-center w-8 h-8 rounded-full overflow-hidden bg-background',
                                        'border border-border/70 transition-fast',
                                        'hover:border-foreground/20',
                                        isSelected
                                            ? 'shadow-[inset_0_0_0_2px_hsl(var(--primary))]'
                                            : 'shadow-[inset_0_0_0_0px_transparent]',
                                        'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_hsl(var(--primary))]',
                                    )}
                                    aria-label={avatar.label}
                                    aria-pressed={isSelected}
                                    title={avatar.label}
                                >
                                    <Image src={avatar.image} alt={avatar.label} width={32} height={32} className='w-full h-full object-cover' />
                                    {isSelected && (
                                        <span className='absolute inset-0 flex items-center justify-center bg-primary/55'>
                                            <Check className='w-4 h-4 text-primary-foreground' strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop: horizontal scroller with chevrons. */}
                    <div
                        ref={scrollRef}
                        onScroll={updateScrollState}
                        className={cn(
                            'hidden sm:flex w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden scroll-smooth overscroll-x-contain',
                            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                        )}
                    >
                        {AVATAR_OPTIONS.map((avatar) => {
                            const isSelected = selectedAvatar === avatar.id;
                            return (
                                <button
                                    key={avatar.id}
                                    type='button'
                                    onClick={() => onSelect(avatar.id)}
                                    className={cn(
                                        'group relative flex shrink-0 items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-background',
                                        'border border-border/70 transition-fast',
                                        'hover:border-foreground/20',
                                        isSelected
                                            ? 'shadow-[inset_0_0_0_2px_hsl(var(--primary))]'
                                            : 'shadow-[inset_0_0_0_0px_transparent]',
                                        'focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_hsl(var(--primary))]',
                                    )}
                                    aria-label={avatar.label}
                                    aria-pressed={isSelected}
                                    title={avatar.label}
                                >
                                    <Image src={avatar.image} alt={avatar.label} width={40} height={40} className='w-full h-full object-cover' />
                                    {isSelected && (
                                        <span className='absolute inset-0 flex items-center justify-center bg-primary/55'>
                                            <Check className='w-4 h-4 text-primary-foreground' strokeWidth={3} />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <button
                    type='button'
                    onClick={() => scroll('left')}
                    disabled={!canScrollLeft}
                    className={cn(
                        'absolute left-2 top-1/2 -translate-y-1/2',
                        'inline-flex items-center justify-center w-8 h-8 rounded-md border',
                        'bg-background/80 backdrop-blur text-muted-foreground border-border shadow-sm transition-fast',
                        'hover:text-foreground hover:border-foreground/20',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        'hidden sm:inline-flex',
                    )}
                    aria-label='Scroll left'
                >
                    <ChevronLeft className='w-4 h-4' />
                </button>

                <button
                    type='button'
                    onClick={() => scroll('right')}
                    disabled={!canScrollRight}
                    className={cn(
                        'absolute right-2 top-1/2 -translate-y-1/2',
                        'inline-flex items-center justify-center w-8 h-8 rounded-md border',
                        'bg-background/80 backdrop-blur text-muted-foreground border-border shadow-sm transition-fast',
                        'hover:text-foreground hover:border-foreground/20',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                        'hidden sm:inline-flex',
                    )}
                    aria-label='Scroll right'
                >
                    <ChevronRight className='w-4 h-4' />
                </button>
            </div>
        </fieldset>
    );
};
