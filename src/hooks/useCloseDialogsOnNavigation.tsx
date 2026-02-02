'use client';

import { useEffect, useRef } from 'react';

import { usePathname } from 'next/navigation';

import { useSetAtom } from 'jotai';

import { dialogAtom, documentDrawerAtom } from '../jotai/atoms';

/**
 * Hook to close all dialogs and drawers when browser navigation occurs.
 * This handles the case where user presses back/forward buttons while a dialog is open.
 */
const useCloseDialogsOnNavigation = (): void => {
    const pathname = usePathname();
    const previousPathnameRef = useRef(pathname);

    const setDialogState = useSetAtom(dialogAtom);
    const setDocumentDrawerState = useSetAtom(documentDrawerAtom);

    useEffect(() => {
        // Only close dialogs if the pathname actually changed (not on initial mount)
        if (previousPathnameRef.current !== pathname) {
            setDialogState(undefined);
            setDocumentDrawerState(undefined);
            previousPathnameRef.current = pathname;
        }
    }, [pathname, setDialogState, setDocumentDrawerState]);
};

export { useCloseDialogsOnNavigation };
