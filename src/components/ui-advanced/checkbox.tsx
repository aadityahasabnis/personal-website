import React from 'react';

import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';

interface ICheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
    className?: string;
    checkboxClassName?: string;
    disabled?: boolean;
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Checkbox = ({ className, checkboxClassName, disabled, checked, onCheckedChange, required, ...props }: ICheckboxProps) => {
    return (
        <label className={`relative flex items-center cursor-pointer ${className}`}>
            <input
                type="checkbox"
                checked={checked}
                onChange={(e) => onCheckedChange?.(e.target.checked)}
                disabled={disabled}
                className={cn('sr-only left-36 -bottom-5', checkboxClassName)}
                required={required}
                {...props}
            />
            <div className={cn(
                'size-4 border border-skeleton rounded-sm bg-white flex items-center justify-center',
                'shadow-none transition-all',
                checked ? 'bg-blue-medium border-blue-medium' : '',
                disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
            )}
            >
                {checked ? <Check className="size-4 text-white" /> : null}
            </div>
        </label>
    );
};

Checkbox.displayName = CheckboxPrimitive.Root.displayName;
export { Checkbox };
