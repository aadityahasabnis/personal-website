'use client';
import React, { cloneElement, memo, useCallback, useEffect, useRef, useState } from 'react';

import Link from 'next/link';

import { CaseUpper, Info } from 'lucide-react';

import Tooltip from '@/common/components/ui/tooltip';
import { fieldVariants, type IFieldVariants } from '@/common/constants/maps/maps';
import { type IFormData, type IHandleChange } from '@/common/hooks/useFormOperations';
import { type DotNestedScalarKeys, type StrongOmit } from '@/common/interfaces/genericInterfaces';
import { debounce } from '@/common/utils/debounce';

import { cn } from '@/lib/utils';

export interface ICustomInputProps<TFormBody extends IFormData | undefined> extends StrongOmit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'name'> {
    name: DotNestedScalarKeys<TFormBody>;
    onChange: IHandleChange;
    inputType?: InputType;
    endIcon?: React.ReactElement<{ className?: string }> | false;
    startIcon?: React.ReactElement<{ className?: string }> | false;
    error?: boolean;
    className?: string;
    inputClassName?: string;
    label?: string;
    info?: string;
    validateOnChange?: boolean;
    helperTextInfo?: {
        icon?: React.ElementType;
        text: string;
    };
    errorMessage?: string;
    variant?: IFieldVariants;
    supplementaryLink?: {
        href: string;
        text: string;
        title?: string;
        target?: '_self' | '_blank' | '_parent' | '_top';
        rel?: string;
    };
    maxInt?: number;
    minInt?: number;
}

type InputType = 'number' | 'alphaNum' | 'alpha' | 'decimal' | 'url' | 'linkedin' | 'aadhaar' | 'pan' | 'money';

const validationRegexMap: Record<InputType, { pattern: RegExp; message?: string; formatter?: (value: string) => string }> = {
    number: {
        pattern: /^[0-9]+$/,
        formatter: (value: string) => value.replace(/[^0-9]/g, ''),
        message: 'Only Integer value is allowed'
    },
    alphaNum: {
        pattern: /^[a-zA-Z0-9\s]+$/,
        formatter: (value: string) => value.replace(/[^a-zA-Z0-9\s]/g, ''),
        message: 'Only Integer and alphabet value is allowed'
    },
    alpha: {
        pattern: /^[a-zA-Z\s]+$/
    },
    decimal: {
        pattern: /^\d*\.?\d*$/,
        formatter: (value: string) => {
            // Remove all non-digit and non-dot characters
            const cleaned = value.replace(/[^\d.]/g, '');

            // Handle multiple dots - keep only first dot
            const parts = cleaned.split('.');
            if (parts.length > 2) return parts[0] + '.' + parts.slice(1).join('');

            return cleaned;
        },
        message: 'Please enter a valid number (integer or decimal with one decimal point)'
    },
    url: {
        pattern: /^https?:\/\/[^\s]+$/i,
        formatter: (value: string) => {
            if (value.length < 8) return value; // Less than "https://"
            return value.replace(/\s+/g, '');
        },
        message: 'Invalid URL. Ensure it starts with http:// or https://, with no trailing slashes or spaces'
    },
    linkedin: {
        pattern: /^https:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/,
        message: 'Enter a valid LinkedIn URL: https://linkedin.com/in/<username>',
        formatter: (value: string) => value.trim()
    },
    aadhaar: {
        pattern: /^\d{4}-\d{4}-\d{4}$/,
        formatter: (value: string) => value.replace(/[^\d]/g, '').slice(0, 12).replace(/(\d{4})(?=\d)/g, '$1-'),
        message: 'Invalid Aadhaar. Enter 12 digits in format XXXX-XXXX-XXXX'
    },
    pan: {
        pattern: /^[A-Z]{5}\d{4}[A-Z]$/,
        formatter: (value: string) => value.toUpperCase().slice(0, 10),
        message: 'Invalid PAN. Enter format ABCDE1234F (5 letters, 4 digits, 1 letter)'
    },
    money: {
        pattern: /^[1-9]\d*$/,
        formatter: (value: string) => value.replace(/[^0-9]/g, '').replace(/^0+/, ''),
        message: 'Enter a valid amount (cannot start with zero)'
    }
};

const validateInput = (value: string, validateOnChange: boolean, customErrorMessage?: string, type?: InputType) => {
    if (!type || !validateOnChange || value === '') return { error: false, errorMessage: '' };

    const validator = validationRegexMap[type];
    if (!validator) return { error: false, errorMessage: '' };

    const isValid = validator.pattern.test(value);
    return { error: !isValid, errorMessage: isValid ? '' : (customErrorMessage ?? validator.message) };
};

const Input = <TFormBody extends IFormData | undefined>({ label, info, startIcon, endIcon, inputType, onChange, error, inputClassName, className, helperTextInfo, validateOnChange = true, errorMessage: customErrorMessage, variant = 'default', supplementaryLink, onKeyDown, maxInt, minInt, ...inputProps }: ICustomInputProps<TFormBody>) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [internalError, setInternalError] = useState<{ error: boolean; errorMessage: string | undefined }>({ error: false, errorMessage: '' });
    const [capsLockActive, setCapsLockActive] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    useEffect(() => {
        if (!inputRef.current || (maxInt === undefined && minInt === undefined)) return;
        const numValue = Number(inputProps.value);
        if (isNaN(numValue) || inputProps.value === '' || inputProps.value === undefined) {
            inputRef.current.setCustomValidity('');
            return;
        }
        if (maxInt !== undefined && numValue > maxInt)
            inputRef.current.setCustomValidity(`Value must be at most ${maxInt}`);
        else if (minInt !== undefined && numValue < minInt)
            inputRef.current.setCustomValidity(`Value must be at least ${minInt}`);
        else
            inputRef.current.setCustomValidity('');

    }, [inputProps.value, maxInt, minInt]);
    const isError = error !== undefined ? { error, errorMessage: customErrorMessage ?? '' } : internalError;
    const HelperIcon = helperTextInfo?.icon ? React.createElement(helperTextInfo.icon, { className: 'size-3 shrink-0' }) : null;

    const handleChangeEvent = (e: React.ChangeEvent<HTMLInputElement>) => {
        let inputValue = e.target.value;
        const validator = inputType && validationRegexMap[inputType];
        if (validator?.formatter) inputValue = validator.formatter(inputValue);
        else if (validator?.pattern) inputValue = inputValue.replace(validator.pattern, '');

        // Enforce maxInt/minInt limits when props are provided
        if ((maxInt !== undefined || minInt !== undefined) && inputValue !== '') {
            const numValue = Number(inputValue);
            if (!isNaN(numValue))
                if (maxInt !== undefined && numValue > maxInt) inputValue = String(maxInt);
                else if (minInt !== undefined && numValue < minInt) inputValue = String(minInt);

        }

        if (error === undefined) debounceErrorHandling(validateInput(inputValue, validateOnChange, customErrorMessage, inputType));
        onChange({ ...e, target: { ...e.target, name: inputProps.name, value: inputValue === '' ? undefined : inputValue } });
    };

    const debounceErrorHandling = debounce((errorState: { error: boolean; errorMessage: string | undefined }) => { setInternalError(errorState); }, 300);

    const handleKeyEvent = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        onKeyDown?.(e);
        if (capsLockActive !== e.getModifierState?.('CapsLock')) setCapsLockActive(!!e.getModifierState('CapsLock'));
    }, [capsLockActive, onKeyDown]);

    const inputClassNames = `flex rounded border outline-none w-full text-sm disabled:cursor-not-allowed disabled:opacity-50 h-11 text-neutral-medium placeholder-skeleton bg-white
        ${startIcon ? 'pl-12' : 'pl-3'}
        ${capsLockActive && isFocused && endIcon ? 'pr-16' : capsLockActive ? 'pr-8' : endIcon ? 'pr-12' : 'pr-3'}
        ${inputProps.value && isError?.error ? 'border-status-error border-2' : ''}
        ${inputClassName}
        ${fieldVariants[variant]}
        ${isFocused ? 'border-2 border-neutral-light' : ''}`;

    return (
        <div className={`flex flex-col items-start gap-1 ${className}`}>
            {label ? <div className="flex items-center justify-between gap-3">
                {label ? <label className='flex justify-between items-end text-regular leading-6 text-neutral-light'>{label} {inputProps?.required ? '*' : null}
                    {supplementaryLink ? <Link prefetch={false} className={cn('text-xs text-blue-medium duration-200 hover:underline hover:opacity-100 opacity-40 transition-opacity', isFocused && 'opacity-100')}
                        href={supplementaryLink?.href} title={supplementaryLink?.title} target={supplementaryLink?.target ?? '_blank'} rel={supplementaryLink?.rel}>
                        {supplementaryLink?.text}
                    </Link> : null}
                </label> : null}
                {info ? <Tooltip description={info}><Info className="size-3 text-skeleton mr-1 cursor-pointer" /></Tooltip> : null}
            </div> : null}

            <div className="flex items-center relative cursor-text w-full">
                {startIcon ? <div className="flex items-center gap-2 absolute left-3 inset-y-0">
                    {cloneElement(startIcon, { className: 'size-4 text-neutral-light' })}
                    <span className={cn('border h-[96%]', isFocused && 'border-neutral-light')} />
                </div> : null}

                <input ref={inputRef} className={inputClassNames}
                    {...inputProps}
                    onChange={handleChangeEvent}
                    value={inputProps.value}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyEvent}
                    onKeyUp={handleKeyEvent}
                    placeholder={inputProps?.placeholder ? `${inputProps?.placeholder} ${inputProps?.required && !label ? '*' : ''}` : undefined}
                />

                {(endIcon || (capsLockActive && isFocused)) ? <div className="flex items-center gap-2 absolute right-3 inset-y-0">
                    {capsLockActive && isFocused ? <div className="flex items-center justify-center px-1 py-2 size-5"> <CaseUpper className="size-4 text-status-amber" aria-label="Caps Lock is on" /> </div> : null}

                    {endIcon ? <React.Fragment>
                        <span className={cn('border h-[96%]', isFocused && 'border-neutral-light')} />
                        {cloneElement(endIcon, { className: `${endIcon.props.className} size-4 min-w-fit text-neutral-light` })}
                    </React.Fragment> : null}
                </div> : null}
            </div>

            {helperTextInfo ? <label className='flex items-center gap-1.5 text-xs  text-neutral-light leading-6 tracking-wide'>{HelperIcon}{helperTextInfo.text}</label> : null}
            {isError.error ? <label className='text-xs  text-status-error leading-6 tracking-wide'>{isError?.errorMessage}</label> : null}
        </div>
    );
};

Input.displayName = 'Input';
export default memo(Input) as typeof Input;
