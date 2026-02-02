'use client';
import { useEffect } from 'react';

import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'nav_history';
const MAX_HISTORY = 10;

const getHistory = (): Array<string> => {
    if (typeof window === 'undefined') return [];
    try {
        return JSON.parse(sessionStorage.getItem(STORAGE_KEY) ?? '[]') as Array<string>;
    } catch { return []; }
};

export const getPreviousPath = (currentPath?: string): string | undefined => getHistory().findLast(path => path !== currentPath);

export const useNavigationHistory = (): void => {
    const pathname = usePathname();

    useEffect(() => {
        const history = getHistory();
        if (history.at(-1) === pathname) return;
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify([...history, pathname].slice(-MAX_HISTORY)));
    }, [pathname]);
};
