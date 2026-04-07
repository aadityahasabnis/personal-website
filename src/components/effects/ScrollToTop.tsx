'use client';

import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

/**
 * ScrollReset - Scrolls to top on route navigation.
 * Next.js App Router should handle this automatically, but this
 * ensures consistent behavior across all navigations.
 */
export const ScrollReset = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const search = searchParams.toString();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'auto' });
    }, [pathname, search]);

    return null;
};

export default ScrollReset;
