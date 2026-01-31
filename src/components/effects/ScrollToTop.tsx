'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * ScrollToTop - Ensures page scrolls to top on navigation
 * 
 * Next.js App Router should handle this automatically, but this
 * component ensures consistent behavior across all navigations.
 */
export const ScrollToTop = () => {
    const pathname = usePathname();

    useEffect(() => {
        // Scroll to top when pathname changes
        window.scrollTo({ top: 0, behavior: 'instant' });
    }, [pathname]);

    return null;
};

export default ScrollToTop;
