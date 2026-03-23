'use client';

import { type InputHTMLAttributes, type KeyboardEvent, type ReactElement, memo, useState } from 'react';

import { CaseUpper } from 'lucide-react';
import Link from 'next/link';

import type { DotNestedScalarKeys, IFormData, IHandleChange, StrongOmit } from '@/components/form/form';
import { cn } from '@/lib/utils';

import { FieldError, FieldHint, FieldLabel } from './FieldComponents';

export type InputType = 'number' | 'alphaNum' | 'alpha' | 'decimal' | 'url' | 'email';

const formatterMap: Record<InputType, (value: string) => string> = {
    number: (value) => value.replace(/[^0-9]/g, ''),
    alphaNum: (value) => value.replace(/[^a-zA-Z0-9\s]/g, ''),
    alpha: (value) => value.replace(/[^a-zA-Z\s]/g, ''),
    decimal: (value) => {
        const cleaned = value.replace(/[^\d.]/g, '');
        const [first, ...rest] = cleaned.split('.');
        return rest.length > 0 ? `${first}.${rest.join('')}` : cleaned;
    },
    url: (value) => value.replace(/\s+/g, ''),
    email: (value) => value.trim(),
};

export interface ICustomInputProps<TFormBody extends IFormData = IFormData> extends StrongOmit<InputHTMLAttributes<HTMLInputElement>, 'name' | 'onChange' | 'value'> {
    name: DotNestedScalarKeys<TFormBody> | string;
    value?: string | number | undefined;
    onChange: IHandleChange;
    label?: string | undefined;
    info?: string | undefined;
    hint?: string | undefined;
    errorMessage?: string | undefined;
    inputType?: InputType | undefined;
    startIcon?: ReactElement<{ className?: string }> | undefined;
    endIcon?: ReactElement<{ className?: string }> | undefined;
    containerClassName?: string | undefined;
    inputClassName?: string | undefined;
    supplementaryLink?:
        | {
              href: string;
              text: string;
              target?: '_self' | '_blank' | undefined;
          }
        | undefined;
}

const CustomInput = <TFormBody extends IFormData = IFormData>({
    name,
    value,
    onChange,
    label,
    info,
    hint,
    errorMessage,
    inputType,
    startIcon,
    endIcon,
    containerClassName,
    inputClassName,
    supplementaryLink,
    required,
    disabled,
    placeholder,
    onFocus,
    onBlur,
    onKeyDown,
    onKeyUp,
    ...rest
}: ICustomInputProps<TFormBody>) => {
    const [isFocused, setIsFocused] = useState(false);
    const [capsLockActive, setCapsLockActive] = useState(false);

    const handleChange = (nextValue: string) => {
        const formattedValue = inputType ? formatterMap[inputType](nextValue) : nextValue;
        onChange({
            target: {
                name,
                value: formattedValue === '' ? undefined : formattedValue,
            },
        });
    };

    const handleCapsLock = (event: KeyboardEvent<HTMLInputElement>) => {
        const isCapsLockEnabled = event.getModifierState('CapsLock');
        if (capsLockActive !== isCapsLockEnabled) {
            setCapsLockActive(isCapsLockEnabled);
        }
    };

    return (
        <div className={cn('flex flex-col gap-1.5', containerClassName)}>
            {(label || supplementaryLink) && (
                <div className='flex items-center justify-between gap-3'>
                    <FieldLabel label={label} info={info} required={required} />
                    {supplementaryLink ? (
                        <Link prefetch={false} href={supplementaryLink.href} target={supplementaryLink.target ?? '_blank'} className='text-small text-primary transition-fast hover:underline'>
                            {supplementaryLink.text}
                        </Link>
                    ) : null}
                </div>
            )}

            <div className='relative flex items-center'>
                {startIcon ? <span className='absolute inset-y-0 left-3 flex items-center text-muted-foreground'>{startIcon}</span> : null}
                <input
                    {...rest}
                    type={rest.type ?? 'text'}
                    name={name}
                    value={value ?? ''}
                    required={required}
                    disabled={disabled}
                    placeholder={placeholder}
                    onChange={(event) => handleChange(event.target.value)}
                    onFocus={(event) => {
                        setIsFocused(true);
                        onFocus?.(event);
                    }}
                    onBlur={(event) => {
                        setIsFocused(false);
                        onBlur?.(event);
                    }}
                    onKeyDown={(event) => {
                        handleCapsLock(event);
                        onKeyDown?.(event);
                    }}
                    onKeyUp={(event) => {
                        handleCapsLock(event);
                        onKeyUp?.(event);
                    }}
                    className={cn(
                        'flex h-11 w-full items-center rounded-md border border-input bg-background px-3 text-regular text-foreground',
                        'placeholder:text-muted-foreground shadow-none transition-fast',
                        'focus:outline-none focus:ring-2 focus:ring-ring',
                        'disabled:cursor-not-allowed disabled:opacity-50',
                        startIcon ? 'pl-10' : undefined,
                        endIcon || (isFocused && capsLockActive) ? 'pr-10' : undefined,
                        errorMessage ? 'border-destructive focus:ring-destructive' : undefined,
                        inputClassName,
                    )}
                />
                {isFocused && capsLockActive ? <CaseUpper className='absolute inset-y-0 right-3 my-auto size-4 text-warning' aria-label='Caps lock is on' /> : null}
                {!capsLockActive && endIcon ? <span className='absolute inset-y-0 right-3 flex items-center text-muted-foreground'>{endIcon}</span> : null}
            </div>

            <FieldHint text={hint} />
            <FieldError message={errorMessage} />
        </div>
    );
};

CustomInput.displayName = 'CustomInput';

export default memo(CustomInput) as typeof CustomInput;
