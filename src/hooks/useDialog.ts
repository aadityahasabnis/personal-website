'use client';

import { useState, useCallback } from 'react';

interface IDialogState<TData = unknown> {
    open: boolean;
    data?: TData;
    id?: string;
}

/**
 * Hook for managing dialog state
 * Adapted from refer-2 useDialog
 */
export const useDialog = <TData = unknown>(defaultId?: string) => {
    const [state, setState] = useState<IDialogState<TData>>({
        open: false,
        id: defaultId,
    });

    const openDialog = useCallback((data?: TData, id?: string) => {
        setState({ open: true, data, id: id ?? defaultId });
    }, [defaultId]);

    const closeDialog = useCallback(() => {
        setState((prev) => ({ ...prev, open: false }));
    }, []);

    const toggleDialog = useCallback(() => {
        setState((prev) => ({ ...prev, open: !prev.open }));
    }, []);

    const setDialogData = useCallback((data: TData) => {
        setState((prev) => ({ ...prev, data }));
    }, []);

    return {
        isOpen: state.open,
        data: state.data,
        id: state.id,
        openDialog,
        closeDialog,
        toggleDialog,
        setDialogData,
    };
};

export default useDialog;
