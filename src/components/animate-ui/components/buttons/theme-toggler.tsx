'use client';

import type { VariantProps } from 'class-variance-authority';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import * as React from 'react';

import { buttonVariants } from '@/components/animate-ui/components/buttons/icon';
import {
    ThemeToggler as ThemeTogglerPrimitive,
    type Resolved,
    type ThemeSelection,
    type ThemeTogglerProps as ThemeTogglerPrimitiveProps,
} from '@/components/animate-ui/primitives/effects/theme-toggler';
import { cn } from '@/lib/utils';

const getIcon = (effective: ThemeSelection, resolved: Resolved, modes: ThemeSelection[]) => {
    const iconProps = {
        className: 'size-4',
        strokeWidth: 2.2,
        'aria-hidden': true,
    } as const;
    const theme = modes.includes('system') ? effective : resolved;
    return theme === 'system' ? <Monitor {...iconProps} /> : theme === 'dark' ? <Moon {...iconProps} /> : <Sun {...iconProps} />;
};

const getNextTheme = (effective: ThemeSelection, modes: ThemeSelection[]): ThemeSelection => {
    const i = modes.indexOf(effective);
    if (i === -1) return modes[0];
    return modes[(i + 1) % modes.length];
};

type ThemeTogglerButtonProps = React.ComponentProps<'button'> &
    VariantProps<typeof buttonVariants> & {
        modes?: ThemeSelection[];
        onImmediateChange?: ThemeTogglerPrimitiveProps['onImmediateChange'];
        direction?: ThemeTogglerPrimitiveProps['direction'];
    };

function ThemeTogglerButton({
    variant = 'default',
    size = 'default',
    modes = ['light', 'dark', 'system'],
    direction = 'ltr',
    onImmediateChange,
    onClick,
    className,
    ...props
}: ThemeTogglerButtonProps) {
    const { theme, resolvedTheme, setTheme } = useTheme();

    const renderButton = ({ effective, resolved, toggleTheme }: { effective: ThemeSelection; resolved: Resolved; toggleTheme: (theme: ThemeSelection) => void }) => (
        <button
            data-slot='theme-toggler-button'
            className={cn(buttonVariants({ variant, size, className }))}
            onClick={(e) => {
                onClick?.(e);
                toggleTheme(getNextTheme(effective, modes));
            }}
            {...props}
        >
            {getIcon(effective, resolved, modes)}
        </button>
    );

    if (onImmediateChange) {
        return (
            <ThemeTogglerPrimitive theme={theme as ThemeSelection} resolvedTheme={resolvedTheme as Resolved} setTheme={setTheme} direction={direction} onImmediateChange={onImmediateChange}>
                {renderButton}
            </ThemeTogglerPrimitive>
        );
    }

    return (
        <ThemeTogglerPrimitive theme={theme as ThemeSelection} resolvedTheme={resolvedTheme as Resolved} setTheme={setTheme} direction={direction}>
            {renderButton}
        </ThemeTogglerPrimitive>
    );
}

export { ThemeTogglerButton, type ThemeTogglerButtonProps };
