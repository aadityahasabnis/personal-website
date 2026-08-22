'use client';

import { type ClipboardEvent, type KeyboardEvent, type ReactElement, memo, useRef } from 'react';

import type { IHandleChange } from '@/components/form/form';
import { cn } from '@/lib/utils';

import { FieldError, FieldHint, FieldLabel } from './FieldComponents';

interface ICustomOtpInputProps {
    name: string;
    value?: string | undefined;
    onChange: IHandleChange;
    label?: string | undefined;
    hint?: string | undefined;
    errorMessage?: string | undefined;
    required?: boolean | undefined;
    disabled?: boolean | undefined;
}

const OTP_LENGTH = 6;

const normalizeOtp = (value: string): string => value.replace(/\D/g, '').slice(0, OTP_LENGTH);

const CustomOtpInput = ({ name, value = '', onChange, label, hint, errorMessage, required, disabled }: ICustomOtpInputProps): ReactElement => {
    const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
    const digits = normalizeOtp(value).padEnd(OTP_LENGTH, ' ').split('');

    const updateValue = (nextValue: string, focusIndex?: number): void => {
        const normalized = normalizeOtp(nextValue);
        onChange({ target: { name, value: normalized } });

        if (focusIndex !== undefined && focusIndex < OTP_LENGTH - 1) {
            inputRefs.current[focusIndex + 1]?.focus();
        }

        if (normalized.length === OTP_LENGTH) {
            window.setTimeout(() => inputRefs.current[OTP_LENGTH - 1]?.form?.requestSubmit(), 0);
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>): void => {
        event.preventDefault();
        updateValue(event.clipboardData.getData('text'));
        inputRefs.current[OTP_LENGTH - 1]?.focus();
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number): void => {
        if (event.key === 'Backspace' && !digits[index].trim() && index > 0) {
            const nextValue = digits.map((digit) => (digit === ' ' ? '' : digit)).join('').slice(0, index - 1);
            updateValue(nextValue);
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === 'ArrowLeft' && index > 0) inputRefs.current[index - 1]?.focus();
        if (event.key === 'ArrowRight' && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    };

    return (
        <div className='flex flex-col gap-2'>
            <FieldLabel label={label} required={required} />
            <div className='flex items-center gap-2 sm:gap-3' role='group' aria-label={label ?? 'One-time code'}>
                {digits.map((digit, index) => (
                    <input
                        key={`${name}-${index}`}
                        ref={(element) => {
                            inputRefs.current[index] = element;
                        }}
                        type='text'
                        inputMode='numeric'
                        autoComplete={index === 0 ? 'one-time-code' : 'off'}
                        maxLength={1}
                        value={digit.trim()}
                        disabled={disabled}
                        required={required && index === 0}
                        aria-label={`Digit ${index + 1}`}
                        onChange={(event) => {
                            const nextDigits = digits.map((currentDigit, digitIndex) => (digitIndex === index ? normalizeOtp(event.target.value).slice(-1) : currentDigit.trim())).join('');
                            updateValue(nextDigits, index);
                        }}
                        onPaste={handlePaste}
                        onKeyDown={(event) => handleKeyDown(event, index)}
                        className={cn(
                            'flex h-14 min-w-0 flex-1 rounded-lg border border-input bg-background text-center text-h3 font-semibold text-foreground shadow-none transition-fast',
                            'placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring',
                            'disabled:cursor-not-allowed disabled:opacity-50',
                            errorMessage ? 'border-destructive focus:ring-destructive' : undefined,
                        )}
                    />
                ))}
            </div>
            <FieldHint text={hint} />
            <FieldError message={errorMessage} />
        </div>
    );
};

CustomOtpInput.displayName = 'CustomOtpInput';

export default memo(CustomOtpInput) as typeof CustomOtpInput;
