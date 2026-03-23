'use client';

import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme, setTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';
    const nextTheme = isDarkMode ? 'light' : 'dark';
    const toggleLabel = isDarkMode ? 'Switch to light theme' : 'Switch to dark theme';

    const toggleTheme = () => {
        setTheme(nextTheme);
    };

    return (
        <Button
            type='button'
            variant='ghost'
            size='icon'
            onClick={toggleTheme}
            className='relative border border-transparent text-foreground transition-base hover:bg-card focus-visible:ring-2 focus-visible:ring-ring'
            aria-label={'Toggle color theme'}
            aria-pressed={isDarkMode}
            title={toggleLabel}
        >
            <Sun className='size-4 rotate-0 scale-100 transition-base dark:-rotate-90 dark:scale-0' aria-hidden='true' />
            <Moon className='absolute size-4 rotate-90 scale-0 transition-base dark:rotate-0 dark:scale-100' aria-hidden='true' />
            <span className='sr-only'>{toggleLabel}</span>
        </Button>
    );
};

export default ThemeToggle;
