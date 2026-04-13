'use client';

import { ThemeTogglerButton } from '@/components/animate-ui/components/buttons/theme-toggler';
import { useTheme } from 'next-themes';
import { useSyncExternalStore } from 'react';

const ThemeToggle = () => {
    const { resolvedTheme } = useTheme();
    const mounted = useSyncExternalStore(
        () => () => {
            // No-op subscribe: we only need a stable client/server hydration signal.
        },
        () => true,
        () => false,
    );

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
            className='relative text-foreground transition-base cursor-pointer hover:bg-transparent hover:text-primary dark:text-foreground dark:hover:bg-transparent dark:hover:text-violet-200 focus-visible:ring-2 focus-visible:ring-ring'
            aria-label={toggleLabel}
            aria-pressed={isDarkMode}
        />
    );
};

export default ThemeToggle;
