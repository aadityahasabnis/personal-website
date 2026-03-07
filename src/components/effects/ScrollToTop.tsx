'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollReset - Scrolls to top on route navigation.
 * Next.js App Router should handle this automatically, but this
 * ensures consistent behavior across all navigations.
 */
export const ScrollReset = () => {
    const pathname = usePathname();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
};

export default ScrollReset;
