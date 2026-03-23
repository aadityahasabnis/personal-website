'use client';

import Image from 'next/image';

import { AVATAR_OPTIONS } from '@/lib/storage';
import { cn } from '@/lib/utils';

interface ICommentAvatarPickerProps {
    selectedAvatar: string;
    onSelect: (avatarId: string) => void;
}

export const CommentAvatarPicker = ({ selectedAvatar, onSelect }: ICommentAvatarPickerProps) => {
    return (
        <div>
            <label className='block text-small font-medium text-foreground'>Choose avatar</label>
            <div className='mt-2 grid grid-cols-6 gap-2'>
                {AVATAR_OPTIONS.map((avatar) => (
                    <button
                        key={avatar.id}
                        type='button'
                        onClick={() => onSelect(avatar.id)}
                        className={cn(
                            'relative flex items-center justify-center p-0 size-12 bg-card border rounded-full transition-base overflow-hidden',
                            selectedAvatar === avatar.id ? 'border-primary shadow-glow-sm' : 'border-border hover:border-primary/40',
                        )}
                        aria-label={`Select ${avatar.label}`}
                        title={avatar.label}
                    >
                        <Image src={avatar.image} alt={avatar.label} width={48} height={48} className='w-full h-full object-cover' />
                    </button>
                ))}
            </div>
        </div>
    );
};
