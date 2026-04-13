'use client';

import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

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
    const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const selectedIndex = useMemo(() => AVATAR_OPTIONS.findIndex((avatar) => avatar.id === selectedAvatar), [selectedAvatar]);

    const updateScrollState = useCallback(() => {
        const el = scrollRef.current;
        if (!el) return;
        const maxScrollLeft = el.scrollWidth - el.clientWidth;
        // Guard against sub-pixel rounding
        setCanScrollLeft(el.scrollLeft > 1);
        setCanScrollRight(el.scrollLeft < maxScrollLeft - 1);
    }, []);

    const scrollToAvatar = useCallback((index: number, behavior: ScrollBehavior = 'smooth') => {
        const target = itemRefs.current[index];
        if (!target) return;
        target.scrollIntoView({ behavior, inline: 'center', block: 'nearest' });
    }, []);

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -160 : 160,
            behavior: 'smooth',
        });
    }, []);

    const selectAtOffset = useCallback(
        (offset: number) => {
            const nextIndex = Math.min(Math.max(selectedIndex + offset, 0), AVATAR_OPTIONS.length - 1);
            const nextAvatar = AVATAR_OPTIONS[nextIndex];
            if (!nextAvatar) return;
            onSelect(nextAvatar.id);
            scrollToAvatar(nextIndex);
        },
        [onSelect, scrollToAvatar, selectedIndex],
    );

    const handleKeyDown = useCallback(
        (event: React.KeyboardEvent<HTMLDivElement>) => {
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                selectAtOffset(-1);
            }
            if (event.key === 'ArrowRight') {
                event.preventDefault();
                selectAtOffset(1);
            }
        },
        [selectAtOffset],
    );

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

    useEffect(() => {
        if (selectedIndex < 0) return;
        scrollToAvatar(selectedIndex, 'smooth');
    }, [scrollToAvatar, selectedIndex]);

    const avatarButtonBase =
        'relative flex shrink-0 items-center justify-center w-10 h-10 rounded-full overflow-hidden bg-background border border-border/70 transition-fast snap-center hover:border-foreground/20 focus-visible:outline-none focus-visible:shadow-[inset_0_0_0_2px_hsl(var(--primary))]';

    return (
        <fieldset className='w-full max-w-full min-w-0 space-y-2 min-inline-0'>
            <legend className='text-small font-medium text-foreground'>Choose your avatar</legend>

            <div className='relative w-full max-w-full'>
                {/*
                 * The scroll area must be allowed to shrink inside flex/grid parents.
                 * `min-w-0` prevents the avatar row from overflowing its frame.
                 */}
                <div className={cn('relative overflow-hidden px-9 py-2 bg-muted/30 border border-border rounded-lg', 'sm:px-10')}>
                    {/* Edge fades (more reliable than mask-image across browsers) */}
                    <div aria-hidden className='absolute inset-y-0 left-0 w-7 pointer-events-none bg-linear-to-r from-muted/30 to-transparent sm:w-8' />
                    <div aria-hidden className='absolute inset-y-0 right-0 w-7 pointer-events-none bg-linear-to-l from-muted/30 to-transparent sm:w-8' />

                    <div
                        ref={scrollRef}
                        onScroll={updateScrollState}
                        onKeyDown={handleKeyDown}
                        role='radiogroup'
                        aria-label='Avatar options'
                        tabIndex={0}
                        className={cn(
                            'flex w-full min-w-0 gap-2 overflow-x-auto overflow-y-hidden py-1 scroll-smooth overscroll-x-contain snap-x snap-mandatory',
                            '[scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden',
                        )}
                    >
                        {AVATAR_OPTIONS.map((avatar, index) => {
                            const isSelected = selectedAvatar === avatar.id;
                            return (
                                <button
                                    key={avatar.id}
                                    ref={(node) => {
                                        itemRefs.current[index] = node;
                                    }}
                                    type='button'
                                    onClick={() => {
                                        onSelect(avatar.id);
                                        scrollToAvatar(index);
                                    }}
                                    className={cn(avatarButtonBase, isSelected ? 'shadow-[inset_0_0_0_2px_hsl(var(--primary))]' : 'shadow-[inset_0_0_0_0px_transparent]')}
                                    role='radio'
                                    aria-checked={isSelected}
                                    aria-label={avatar.label}
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
                        'absolute top-1/2 left-1 -translate-y-1/2',
                        'inline-flex items-center justify-center w-7 h-7 bg-background/80 border border-border rounded-md',
                        'text-muted-foreground shadow-sm backdrop-blur transition-fast',
                        'hover:text-foreground hover:border-foreground/20',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
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
                        'absolute top-1/2 right-1 -translate-y-1/2',
                        'inline-flex items-center justify-center w-7 h-7 bg-background/80 border border-border rounded-md',
                        'text-muted-foreground shadow-sm backdrop-blur transition-fast',
                        'hover:text-foreground hover:border-foreground/20',
                        'disabled:opacity-40 disabled:cursor-not-allowed',
                    )}
                    aria-label='Scroll right'
                >
                    <ChevronRight className='w-4 h-4' />
                </button>
            </div>
        </fieldset>
    );
};
