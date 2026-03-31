'use client';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';
import { forwardRef, useCallback, useState } from 'react';

// ===== FORM INPUT =====

interface IFormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
}

export const FormInput = forwardRef<HTMLInputElement, IFormInputProps>(({ label, error, hint, required, className, id, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    return (
        <div className='space-y-2'>
            <label htmlFor={inputId} className='text-sm font-medium'>
                {label} {required && <span className='text-destructive'>*</span>}
            </label>
            <input
                ref={ref}
                id={inputId}
                className={cn(
                    'w-full px-4 py-2 border rounded-lg bg-background',
                    'focus:outline-none focus:ring-2 focus:ring-ring',
                    error && 'border-destructive focus:ring-destructive',
                    props.disabled && 'opacity-50 cursor-not-allowed',
                    className,
                )}
                {...props}
            />
            {hint && !error && <p className='text-xs text-muted-foreground'>{hint}</p>}
            {error && <p className='text-xs text-destructive'>{error}</p>}
        </div>
    );
});
FormInput.displayName = 'FormInput';

// ===== FORM TEXTAREA =====

interface IFormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
    hint?: string;
    required?: boolean;
    showCount?: boolean;
    maxLength?: number;
}

export const FormTextarea = forwardRef<HTMLTextAreaElement, IFormTextareaProps>(({ label, error, hint, required, showCount, maxLength, className, id, value, ...props }, ref) => {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const charCount = typeof value === 'string' ? value.length : 0;
    return (
        <div className='space-y-2'>
            <label htmlFor={inputId} className='text-sm font-medium'>
                {label} {required && <span className='text-destructive'>*</span>}
            </label>
            <textarea
                ref={ref}
                id={inputId}
                value={value}
                className={cn(
                    'w-full px-4 py-2 border rounded-lg bg-background min-h-24',
                    'focus:outline-none focus:ring-2 focus:ring-ring resize-y',
                    error && 'border-destructive focus:ring-destructive',
                    className,
                )}
                maxLength={maxLength}
                {...props}
            />
            <div className='flex justify-between text-xs text-muted-foreground'>
                {hint && !error && <span>{hint}</span>}
                {error && <span className='text-destructive'>{error}</span>}
                {showCount && (
                    <span>
                        {charCount}
                        {maxLength && `/${maxLength}`}
                    </span>
                )}
            </div>
        </div>
    );
});
FormTextarea.displayName = 'FormTextarea';

// ===== FORM SELECT =====

interface IFormSelectOption {
    value: string;
    label: string;
    disabled?: boolean;
}

interface IFormSelectProps {
    label: string;
    options: IFormSelectOption[];
    value: string;
    onChange: (value: string) => void;
    error?: string;
    hint?: string;
    required?: boolean;
    placeholder?: string;
    disabled?: boolean;
    className?: string;
    id?: string;
}

export function FormSelect({ label, options, value, onChange, error, hint, required, placeholder, disabled, className, id }: IFormSelectProps) {
    const inputId = id || label.toLowerCase().replace(/\s+/g, '-');
    const disabledProps = disabled !== undefined ? { disabled } : {};

    return (
        <div className='space-y-2'>
            <label htmlFor={inputId} className='text-sm font-medium'>
                {label} {required && <span className='text-destructive'>*</span>}
            </label>
            <Select value={value} onValueChange={onChange} {...disabledProps}>
                <SelectTrigger id={inputId} className={cn('w-full', error && 'border-destructive focus:ring-destructive', className)}>
                    <SelectValue placeholder={placeholder || `Select ${label.toLowerCase()}`} />
                </SelectTrigger>
                <SelectContent>
                    {options.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value || '_empty'} {...(opt.disabled !== undefined ? { disabled: opt.disabled } : {})}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {hint && !error && <p className='text-xs text-muted-foreground'>{hint}</p>}
            {error && <p className='text-xs text-destructive'>{error}</p>}
        </div>
    );
}

// ===== FORM CHECKBOX =====

interface IFormCheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
    label: string;
}

export const FormCheckbox = forwardRef<HTMLInputElement, IFormCheckboxProps>(({ label, className, ...props }, ref) => (
    <label className={cn('flex items-center gap-2 text-sm cursor-pointer', className)}>
        <input ref={ref} type='checkbox' className='rounded' {...props} />
        {label}
    </label>
));
FormCheckbox.displayName = 'FormCheckbox';

// ===== TAG INPUT =====

interface ITagInputProps {
    label: string;
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export const TagInput = ({ label, tags, onChange, placeholder = 'Add a tag', maxTags }: ITagInputProps) => {
    const [input, setInput] = useState('');

    const addTag = useCallback(() => {
        const trimmed = input.trim().toLowerCase();
        if (trimmed && !tags.includes(trimmed) && (!maxTags || tags.length < maxTags)) {
            onChange([...tags, trimmed]);
            setInput('');
        }
    }, [input, tags, onChange, maxTags]);

    const removeTag = useCallback(
        (tag: string) => {
            onChange(tags.filter((t) => t !== tag));
        },
        [tags, onChange],
    );

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag();
        }
    };

    return (
        <div className='space-y-2'>
            <label className='text-sm font-medium'>{label}</label>
            <div className='flex gap-2'>
                <input
                    type='text'
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className='flex-1 px-4 py-2 border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring'
                />
                <button
                    type='button'
                    onClick={addTag}
                    disabled={!input.trim() || Boolean(maxTags && tags.length >= maxTags)}
                    className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50'
                >
                    Add
                </button>
            </div>
            {tags.length > 0 && (
                <div className='flex flex-wrap gap-2'>
                    {tags.map((tag) => (
                        <span key={tag} className='inline-flex items-center gap-1 px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm'>
                            {tag}
                            <button type='button' onClick={() => removeTag(tag)} className='text-muted-foreground hover:text-foreground'>
                                <X className='h-3 w-3' />
                            </button>
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
};

// ===== FORM SECTION =====

interface IFormSectionProps {
    title: string;
    children: React.ReactNode;
    className?: string;
}

export const FormSection = ({ title, children, className }: IFormSectionProps) => (
    <div className={cn('space-y-6 p-6 border rounded-lg bg-card', className)}>
        <h2 className='text-lg font-semibold'>{title}</h2>
        {children}
    </div>
);

// ===== FORM ACTIONS =====

interface IFormActionsProps {
    cancelHref: string;
    submitLabel: string;
    isPending?: boolean;
    submitIcon?: React.ReactNode;
}

export const FormActions = ({ cancelHref, submitLabel, isPending, submitIcon }: IFormActionsProps) => (
    <div className='flex justify-end gap-4'>
        <a href={cancelHref} className='px-6 py-2 border rounded-lg hover:bg-accent transition-colors'>
            Cancel
        </a>
        <button
            type='submit'
            disabled={isPending}
            className={cn('inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors', isPending && 'opacity-50 cursor-not-allowed')}
        >
            {submitIcon}
            {isPending ? 'Saving...' : submitLabel}
        </button>
    </div>
);

// ===== FORM ERROR =====

export const FormError = ({ message }: { message: string | null }) => {
    if (!message) return null;
    return <div className='p-4 bg-destructive/10 border border-destructive rounded-lg text-destructive text-sm'>{message}</div>;
};
