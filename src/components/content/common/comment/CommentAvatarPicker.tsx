'use client';

import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import Image from 'next/image';
import { useCallback, useRef } from 'react';

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

    const scroll = useCallback((direction: 'left' | 'right') => {
        if (!scrollRef.current) return;
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -160 : 160,
            behavior: 'smooth',
        });
    }, []);

    return (
        <fieldset className='space-y-2'>
            <legend className='text-small font-medium text-foreground'>Choose your avatar</legend>

            <div className='relative flex items-center gap-2'>
                <button
                    type='button'
                    onClick={() => scroll('left')}
                    className='flex shrink-0 items-center justify-center w-7 h-7 text-muted-foreground bg-muted border border-border rounded-md transition-fast hover:text-foreground hover:border-foreground/20'
                    aria-label='Scroll left'
                >
                    <ChevronLeft className='w-4 h-4' />
                </button>

                <div
                    ref={scrollRef}
                    className='flex flex-1 gap-2 overflow-x-auto py-1 scroll-smooth [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden'
                >
                    {AVATAR_OPTIONS.map((avatar) => {
                        const isSelected = selectedAvatar === avatar.id;
                        return (
                            <button
                                key={avatar.id}
                                type='button'
                                onClick={() => onSelect(avatar.id)}
                                className={cn(
                                    'relative flex shrink-0 items-center justify-center w-10 h-10 rounded-full overflow-hidden ring-2 ring-offset-1 ring-offset-card transition-fast',
                                    isSelected ? 'ring-primary' : 'ring-transparent hover:ring-muted-foreground/50',
                                )}
                                aria-label={avatar.label}
                                aria-pressed={isSelected}
                                title={avatar.label}
                            >
                                <Image src={avatar.image} alt={avatar.label} width={40} height={40} className='w-full h-full object-cover' />
                                {isSelected && (
                                    <span className='absolute inset-0 flex items-center justify-center bg-primary/60'>
                                        <Check className='w-4 h-4 text-white' strokeWidth={3} />
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </div>

                <button
                    type='button'
                    onClick={() => scroll('right')}
                    className='flex shrink-0 items-center justify-center w-7 h-7 text-muted-foreground bg-muted border border-border rounded-md transition-fast hover:text-foreground hover:border-foreground/20'
                    aria-label='Scroll right'
                >
                    <ChevronRight className='w-4 h-4' />
                </button>
            </div>
        </fieldset>
    );
};
