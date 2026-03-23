'use client';

import { createContext, type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { DialogHost } from '@/components/dialogs';
import { type IConfirmationDialogConfig, type IDialogConfig, type IFormDialogConfig, type IViewDialogConfig } from '@/components/dialogs/types';
import { type IFormData } from '@/interfaces/actionHelper';

interface IOpenDialogOptions {
    resetOnCloseDelay?: number;
}

export interface IDialogContextValue {
    isOpen: boolean;
    config: IDialogConfig | null;
    openDialog: (config: IDialogConfig) => void;
    openConfirmation: (config: Omit<IConfirmationDialogConfig, 'type'>) => void;
    openForm: <TFormBody extends IFormData>(config: Omit<IFormDialogConfig<TFormBody>, 'type'>) => void;
    openView: (config: Omit<IViewDialogConfig, 'type'>) => void;
    closeDialog: (options?: IOpenDialogOptions) => void;
}

interface IDialogProviderProps {
    children: ReactNode;
}

interface IUseDialogState {
    open: boolean;
    config: IDialogConfig | null;
}

export const DialogContext = createContext<IDialogContextValue | null>(null);

export function DialogProvider({ children }: IDialogProviderProps): ReactNode {
    const [state, setState] = useState<IUseDialogState>({
        open: false,
        config: null,
    });

    const closeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const openDialog = useCallback((config: IDialogConfig) => {
        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
            closeTimeoutRef.current = null;
        }

        setState({ open: true, config });
    }, []);

    const closeDialog = useCallback((options?: IOpenDialogOptions) => {
        const resetDelay = options?.resetOnCloseDelay ?? 150;

        setState((prev) => ({ ...prev, open: false }));

        if (closeTimeoutRef.current) {
            clearTimeout(closeTimeoutRef.current);
        }

        closeTimeoutRef.current = setTimeout(() => {
            setState((prev) => ({ ...prev, config: null }));
            closeTimeoutRef.current = null;
        }, resetDelay);
    }, []);

    useEffect(
        () => () => {
            if (closeTimeoutRef.current) {
                clearTimeout(closeTimeoutRef.current);
            }
        },
        [],
    );

    const openConfirmation = useCallback(
        (config: Omit<IConfirmationDialogConfig, 'type'>) => {
            openDialog({ type: 'confirmation', ...config });
        },
        [openDialog],
    );

    const openForm = useCallback(
        <TFormBody extends IFormData>(config: Omit<IFormDialogConfig<TFormBody>, 'type'>) => {
            openDialog({ type: 'form', ...config } as IFormDialogConfig);
        },
        [openDialog],
    );

    const openView = useCallback(
        (config: Omit<IViewDialogConfig, 'type'>) => {
            openDialog({ type: 'view', ...config });
        },
        [openDialog],
    );

    const value = useMemo<IDialogContextValue>(
        () => ({
            isOpen: state.open,
            config: state.config,
            openDialog,
            openConfirmation,
            openForm,
            openView,
            closeDialog,
        }),
        [state.open, state.config, openDialog, openConfirmation, openForm, openView, closeDialog],
    );

    return (
        <DialogContext.Provider value={value}>
            {children}
            <DialogHost open={state.open} config={state.config} onClose={() => closeDialog()} />
        </DialogContext.Provider>
    );
}
