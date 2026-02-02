'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import { type IApiResponse } from '@/common/utils/apiCall';

import { cn } from '@/lib/utils';

import { type DotNestedScalarKeys, type StrongPick } from '../interfaces/genericInterfaces';

export type IOTPStatusState = StrongPick<IApiResponse, 'success' | 'message'> | null;

interface IUseCustomInputOTPProps<TData extends IFormData> {
    name: DotNestedScalarKeys<TData>;
    value: string;
    onChange: IHandleChange;
    onSubmit: (newValue: string) => Promise<IApiResponse>;
    maxLength?: number;
}

const OTPMessage = React.memo(({ isValidating, status }: { isValidating: boolean; status: IOTPStatusState }) => (
    <div className="flex items-center justify-center h-11 border-dashed border-2 w-full transition-all duration-300">
        {isValidating ? (
            <div className="flex items-center gap-3 animate-fade-in">
                <div className="relative">
                    <svg className="animate-spin size-4 text-status-amber" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <div className="absolute inset-0 animate-ping opacity-25 rounded-full size-4 bg-status-amber" />
                </div>
                <span className="text-xs text-status-amber"> Validating OTP</span>
            </div>
        ) : !status
            ? <span className="text-xs tracking-wider text-skeleton"> One-Time Password sent to your email. Please check your inbox. </span>
            : <span className={cn('text-xs font-semibold transition-all duration-500 animate-fade-in', status.success ? 'text-status-success' : 'text-status-error')}> {status.message ?? (status.success ? 'OTP verified successfully' : 'Some error occurred!')} </span>
        }
    </div>
));

const useCustomInputOTP = <TData extends IFormData>({ value, onChange, name, maxLength = 6, onSubmit }: IUseCustomInputOTPProps<TData>) => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const [isValidating, setIsValidating] = useState(false);
    const [isShaking, setIsShaking] = useState(false);
    const [focusedIndex, setFocusedIndex] = useState(0);
    const [status, setStatus] = useState<IOTPStatusState>(null);

    const clearStatus = useCallback(() => setStatus(null), []);
    const triggerShake = useCallback(() => {
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 600);
    }, []);

    const getValueArray = useCallback(() => {
        return Array.from({ length: maxLength }, (_, i) => value?.[i] ?? '');
    }, [value, maxLength]);

    const updateValue = useCallback((arr: Array<string>) => {
        const normalized = Array.from({ length: maxLength }, (_, i) => arr[i] ?? '');
        onChange({ target: { name, value: normalized.join('') } });
    }, [onChange, name, maxLength]);

    const clearValue = useCallback(() => {
        const empty = Array(maxLength).fill('');
        updateValue(empty);
        setFocusedIndex(0);
        setTimeout(() => inputRefs.current[0]?.focus(), 0);
    }, [maxLength, updateValue]);

    const validateOtp = useCallback(async (otp: string) => {
        clearStatus();
        setIsValidating(true);
        const { success, message } = await onSubmit(otp);
        setStatus({ success, message });
        setIsValidating(false);

        if (!success) {
            triggerShake();
            setTimeout(() => clearValue(), 600);
        }
    }, [onSubmit, clearStatus, triggerShake, clearValue]);

    const focusIndex = useCallback((i: number) => {
        const idx = Math.max(0, Math.min(maxLength - 1, i));
        setFocusedIndex(idx);
        inputRefs.current[idx]?.focus();
        inputRefs.current[idx]?.select();
    }, [maxLength]);

    const handleInputChange = useCallback((index: number, raw: string) => {
        const digit = raw?.replace(/\D/g, '')?.charAt(0) ?? '';
        if (!digit) return;

        const newArr = getValueArray();
        newArr[index] = digit;
        updateValue(newArr);
        clearStatus();

        if (index < maxLength - 1) focusIndex(index + 1);
        else if (!newArr.includes('')) setTimeout(async () => validateOtp(newArr.join('')), 150);
    }, [getValueArray, updateValue, clearStatus, maxLength, focusIndex, validateOtp]);

    const handleKeyDown = useCallback((index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'ArrowLeft' && index > 0) { e.preventDefault(); focusIndex(index - 1); return; }
        if (e.key === 'ArrowRight' && index < maxLength - 1) { e.preventDefault(); focusIndex(index + 1); return; }

        const cur = getValueArray();
        if (e.key === 'Backspace') {
            e.preventDefault();
            if (cur[index]) {
                cur[index] = '';
                updateValue(cur);
                clearStatus();
                focusIndex(index);
            } else if (index > 0) {
                cur[index - 1] = '';
                updateValue(cur);
                clearStatus();
                focusIndex(index - 1);
            }
        }
    }, [getValueArray, updateValue, clearStatus, focusIndex, maxLength]);

    const handlePaste = useCallback((startIndex: number, e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text') ?? '';
        const digits = pasted.replace(/\D/g, '').slice(0, maxLength - startIndex);
        if (!digits) return;
        const cur = getValueArray();
        const temp = [...cur];
        clearStatus();
        digits.split('').forEach((digit, i) => {
            setTimeout(() => {
                temp[startIndex + i] = digit;
                updateValue([...temp]);
                inputRefs.current[startIndex + i]?.focus();
            }, i * 80);
        });
        const lastIndex = Math.min(maxLength - 1, startIndex + digits.length - 1);
        setTimeout(() => setFocusedIndex(lastIndex), digits.length * 80);
        setTimeout(async () => {
            if (!temp.includes('')) await validateOtp(temp.join(''));
        }, digits.length * 80 + 150);
    }, [maxLength, getValueArray, updateValue, clearStatus, validateOtp, inputRefs]);

    const handleFocus = useCallback((index: number) => {
        setFocusedIndex(index);
        inputRefs.current[index]?.select();
    }, []);

    // Smooth focus transition
    useEffect(() => {
        const timer = setTimeout(() => inputRefs.current[focusedIndex]?.focus(), 50);
        return () => clearTimeout(timer);
    }, [focusedIndex]);

    const valueArray = useMemo(() => Array(maxLength).fill('').map((_, i) => value?.[i] ?? ''), [value, maxLength]);

    const otpProps = { inputRefs, valueArray, status, isShaking, isValidating, focusedIndex, handleInputChange, handleKeyDown, handlePaste, handleFocus, clearStatus };

    const InputMessageElement = <OTPMessage isValidating={isValidating} status={status} />;

    return { otpProps, InputMessageElement };
};

export default useCustomInputOTP;
