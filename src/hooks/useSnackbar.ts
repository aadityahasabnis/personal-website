'use client';

import { toast } from 'sonner';

export interface ISnackbarDescription {
    loadingMessage?: string;
    successMessage: string;
    errorMessage?: string;
}

interface IActionResult {
    success: boolean;
    error?: string;
    message?: string;
}

/**
 * Hook for showing toast notifications with promise handling
 * Adapted from refer-2 useSnackbar
 */
export const useSnackbar = () => {
    /**
     * Trigger a snackbar with loading, success, and error states
     */
    const triggerSnackbar = async <T extends IActionResult>(
        promise: Promise<T>,
        options: ISnackbarDescription
    ): Promise<T> => {
        const {
            loadingMessage = 'Processing...',
            successMessage,
            errorMessage = 'Something went wrong',
        } = options;

        return new Promise((resolve) => {
            toast.promise(promise, {
                loading: loadingMessage,
                success: (result) => {
                    resolve(result);
                    if (!result.success) {
                        throw new Error(result.error ?? errorMessage);
                    }
                    return result.message ?? successMessage;
                },
                error: (err) => {
                    resolve({ success: false, error: err.message } as T);
                    return err.message ?? errorMessage;
                },
            });
        });
    };

    /**
     * Show a success toast
     */
    const showSuccess = (message: string, description?: string) => {
        toast.success(message, { description });
    };

    /**
     * Show an error toast
     */
    const showError = (message: string, description?: string) => {
        toast.error(message, { description });
    };

    /**
     * Show an info toast
     */
    const showInfo = (message: string, description?: string) => {
        toast.info(message, { description });
    };

    /**
     * Show a warning toast
     */
    const showWarning = (message: string, description?: string) => {
        toast.warning(message, { description });
    };

    /**
     * Show a loading toast that can be dismissed
     */
    const showLoading = (message: string) => {
        return toast.loading(message);
    };

    /**
     * Dismiss a specific toast or all toasts
     */
    const dismiss = (toastId?: string | number) => {
        toast.dismiss(toastId);
    };

    return {
        triggerSnackbar,
        showSuccess,
        showError,
        showInfo,
        showWarning,
        showLoading,
        dismiss,
    };
};

export default useSnackbar;
