'use client';

import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

const ThemeToggle = () => {
    const [mounted, setMounted] = useState(false);
    const { resolvedTheme } = useTheme();

    useEffect(() => {
        setMounted(true);
    }, []);

    const isDarkMode = mounted && resolvedTheme === 'dark';
    const toggleLabel = isDarkMode ? 'Switch to light theme' : 'Switch to dark theme';

    if (!mounted) {
        return <span className='inline-block size-8' aria-hidden='true' />;
    }

    return (
        <ThemeTogglerButton
            type='button'
            variant='ghost'
            size='default'
            direction='btt'
            modes={['light', 'dark']}
            className='relative text-violet-700 transition-base dark:text-violet-300 hover:bg-violet-200/70 hover:text-violet-800 dark:hover:bg-violet-800/35 dark:hover:text-violet-200 focus-visible:ring-2 focus-visible:ring-ring'
            aria-label={toggleLabel}
            aria-pressed={isDarkMode}
        />
    );
};

export default ThemeToggle;
