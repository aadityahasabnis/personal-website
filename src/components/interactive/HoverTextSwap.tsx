'use client';

import { cn } from '@/lib/utils';
import { useState } from 'react';

interface IHoverTextSwapProps {
    primaryText: string;
    secondaryText: string;
    className?: string;
    duration?: number;
}

export const HoverTextSwap = ({ primaryText, secondaryText, className, duration = 0.1 }: IHoverTextSwapProps) => {
    const [isHovered, setIsHovered] = useState(false);
    const displayedText = isHovered ? secondaryText : primaryText;
    const transitionStyle = { transitionDuration: `${duration}s` };

    return (
        <span
            className='relative inline-block align-middle'
            tabIndex={0}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onFocus={() => setIsHovered(true)}
            onBlur={() => setIsHovered(false)}
            aria-label={displayedText}
        >
            <span style={transitionStyle} className={cn('inline-block whitespace-pre opacity-100 transition-opacity ease-linear', isHovered ? 'opacity-0' : 'opacity-100', className, 'font-nunito')}>
                {primaryText}
            </span>

            <span
                aria-hidden={!isHovered}
                style={transitionStyle}
                className={cn(
                    'absolute inset-0 inline-block whitespace-pre opacity-0 transition-opacity ease-linear pointer-events-none',
                    isHovered ? 'opacity-100' : 'opacity-0',
                    className,
                    'font-tiro-devanagari-marathi',
                )}
            >
                {secondaryText}
            </span>
        </span>
    );
};

export const HoverLocalizedName = HoverTextSwap;

export default HoverTextSwap;
