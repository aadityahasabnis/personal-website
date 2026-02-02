'use client';
import React, { type JSX } from 'react';

import { CheckCircle, Info, Loader2, X, XCircle } from 'lucide-react';
import { toast } from 'sonner';

import { type IApiResponse } from '@/common/utils/apiCall';

import { PORTAL_SUPPORT_EMAIL } from '@/exclusive/constants/general';

export interface ISnackbarDescription {
    successHeading?: string;
    successDescription?: string;
    loadingMessage?: string;
}

interface IToastProps {
    title: string | JSX.Element;
    message: string | JSX.Element;
    titleColor: string;
    iconBackgroundColor: string;
    icon: JSX.Element;
}

const ToastContent = ({ title, message, icon, titleColor, iconBackgroundColor }: IToastProps) => (
    <div className="relative flex gap-3 rounded w-full bg-white select-text">
        <span style={{ backgroundColor: iconBackgroundColor }} className='flex items-center justify-center p-2 h-fit rounded-full'>
            {icon}
        </span>
        <div className="flex flex-col text-base">
            <span style={{ font: '600 0.9rem/1.5rem nunito', letterSpacing: '0.05em', color: titleColor }}>{title}</span>
            {typeof message === 'string' ? <span className="text-neutral-light text-regular" dangerouslySetInnerHTML={{ __html: message }} /> : <span className="text-neutral-light text-regular">{message}</span>}
        </div>
        <X onClick={() => toast.dismiss()} style={{ position: 'absolute', top: -5, right: -5 }} className="size-4.5 cursor-pointer text-neutral-light p-0.5 transition-colors" />
    </div>
);

const handleSnackbar = (result: IApiResponse | null, { successHeading, successDescription, loadingMessage }: ISnackbarDescription) => {
    if (result === null && loadingMessage) return <ToastContent title={<span className="flex items-end gap-1"> Processing <span className="inline-block animate-bounce">.</span> <span className="inline-block animate-bounce delay-200">.</span> <span className="inline-block animate-bounce delay-400">.</span> </span>} message={loadingMessage} icon={<Loader2 className="size-4 text-neutral-medium animate-spin" />} titleColor="#6b7280" iconBackgroundColor="#e5e7eb" />;
    const isError = Boolean(result?.error);
    const isMessage = Boolean(result?.message);

    const toastTitle = isError ? 'Internal Server Error Occurred' : isMessage ? 'Quick Note' : successHeading ?? 'Operation Successful !!';
    const toastMessage = isError ?
        <React.Fragment>
            We&apos;re experiencing a temporary hiccup. <br />
            <a href={`mailto:${PORTAL_SUPPORT_EMAIL}`} style={{ color: 'blue', textDecoration: 'underline', userSelect: 'text' }}>
                Need help?
            </a>
        </React.Fragment> : isMessage ? String(result?.message) : successDescription ?? 'Operation completed successfully.';

    const titleColor = isError ? '#ef4444' : isMessage ? '#d97706' : '#15803d';
    const iconBackgroundColor = isError ? '#fee2e2' : isMessage ? '#fef3c7' : '#d1fae5';

    const toastIcon = isError ? <XCircle className="size-4 text-status-error" /> :
        isMessage ? <Info className="size-4 text-status-amber" /> : <CheckCircle className="size-4 text-status-success" />;

    return <ToastContent title={toastTitle} message={toastMessage} icon={toastIcon} titleColor={titleColor} iconBackgroundColor={iconBackgroundColor} />;
};

const useSnackbar = () => {
    const triggerSnackbar = async (promise: Promise<IApiResponse>, { successHeading = 'Operation Successful!', successDescription = 'Your action is completed successfully.', loadingMessage = 'Processing Request...' }: ISnackbarDescription = {}) => {
        toast.promise(promise, {
            loading: handleSnackbar(null, { loadingMessage }),
            success: (result) => handleSnackbar(result, { successHeading, successDescription, loadingMessage }),
            error: 'Whoops! Something went wrong on our end. Please try again.'
        });
        return promise;
    };

    return { triggerSnackbar };
};

export { useSnackbar };
