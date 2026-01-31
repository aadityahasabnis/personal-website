'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Send, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { submitContact } from '@/server/actions/contact';

interface IContactFormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    type: 'general' | 'collaboration' | 'hiring' | 'feedback';
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const CONTACT_TYPES = [
    { value: 'general', label: 'General' },
    { value: 'collaboration', label: 'Collaboration' },
    { value: 'hiring', label: 'Hiring' },
    { value: 'feedback', label: 'Feedback' },
] as const;

/**
 * ContactForm - Premium contact form with validation and status feedback
 */
const ContactForm = () => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errorMessage, setErrorMessage] = useState<string>('');

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<IContactFormData>({
        defaultValues: {
            type: 'general',
        },
    });

    const onSubmit = async (data: IContactFormData) => {
        setStatus('submitting');
        setErrorMessage('');

        const result = await submitContact(data);

        if (result.success) {
            setStatus('success');
            reset();
        } else {
            setStatus('error');
            setErrorMessage(result.error ?? 'Something went wrong.');
        }
    };

    if (status === 'success') {
        return (
            <div className="p-8 text-center rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)]">
                <CheckCircle className="mx-auto size-12 text-[var(--success)]" />
                <h3 className="mt-4 text-xl font-semibold text-[var(--fg)]">Message Sent!</h3>
                <p className="mt-2 text-[var(--fg-muted)]">
                    Thank you for reaching out. I&apos;ll get back to you as soon as possible.
                </p>
                <button
                    className="mt-6 px-6 py-3 rounded-full border border-[var(--border-color)] text-[var(--fg)] font-medium hover:border-[var(--border-hover)] transition-colors"
                    onClick={() => setStatus('idle')}
                >
                    Send Another Message
                </button>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Error Alert */}
            {status === 'error' && (
                <div className="flex items-center gap-3 rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/10 p-4 text-sm text-[var(--error)]">
                    <AlertCircle className="size-5 shrink-0" />
                    {errorMessage}
                </div>
            )}

            {/* Contact Type */}
            <div className="space-y-3">
                <label className="text-sm font-medium text-[var(--fg)]">
                    What is this regarding?
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {CONTACT_TYPES.map((type) => (
                        <label
                            key={type.value}
                            className={cn(
                                'flex cursor-pointer items-center justify-center rounded-xl border border-[var(--border-color)] p-3 text-sm transition-all',
                                'hover:border-[var(--border-hover)] hover:bg-[var(--surface)]',
                                'has-[:checked]:border-[var(--accent)] has-[:checked]:bg-[var(--accent)]/10 has-[:checked]:text-[var(--accent)]'
                            )}
                        >
                            <input
                                type="radio"
                                value={type.value}
                                {...register('type')}
                                className="sr-only"
                            />
                            {type.label}
                        </label>
                    ))}
                </div>
            </div>

            {/* Name & Email Row */}
            <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-[var(--fg)]">
                        Name <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        className={cn(
                            'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]',
                            'placeholder:text-[var(--fg-subtle)]',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
                            'transition-colors',
                            errors.name && 'border-[var(--error)] focus:ring-[var(--error)]/50 focus:border-[var(--error)]'
                        )}
                        {...register('name', {
                            required: 'Name is required',
                            minLength: {
                                value: 2,
                                message: 'Name must be at least 2 characters',
                            },
                        })}
                    />
                    {errors.name && (
                        <p className="text-xs text-[var(--error)]">
                            {errors.name.message}
                        </p>
                    )}
                </div>

                <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-[var(--fg)]">
                        Email <span className="text-[var(--error)]">*</span>
                    </label>
                    <input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className={cn(
                            'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]',
                            'placeholder:text-[var(--fg-subtle)]',
                            'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
                            'transition-colors',
                            errors.email && 'border-[var(--error)] focus:ring-[var(--error)]/50 focus:border-[var(--error)]'
                        )}
                        {...register('email', {
                            required: 'Email is required',
                            pattern: {
                                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                message: 'Please enter a valid email',
                            },
                        })}
                    />
                    {errors.email && (
                        <p className="text-xs text-[var(--error)]">
                            {errors.email.message}
                        </p>
                    )}
                </div>
            </div>

            {/* Subject */}
            <div className="space-y-2">
                <label htmlFor="subject" className="text-sm font-medium text-[var(--fg)]">
                    Subject <span className="text-[var(--error)]">*</span>
                </label>
                <input
                    id="subject"
                    type="text"
                    placeholder="What is this about?"
                    className={cn(
                        'w-full rounded-xl border border-[var(--border-color)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]',
                        'placeholder:text-[var(--fg-subtle)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
                        'transition-colors',
                        errors.subject && 'border-[var(--error)] focus:ring-[var(--error)]/50 focus:border-[var(--error)]'
                    )}
                    {...register('subject', {
                        required: 'Subject is required',
                        minLength: {
                            value: 5,
                            message: 'Subject must be at least 5 characters',
                        },
                    })}
                />
                {errors.subject && (
                    <p className="text-xs text-[var(--error)]">
                        {errors.subject.message}
                    </p>
                )}
            </div>

            {/* Message */}
            <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-[var(--fg)]">
                    Message <span className="text-[var(--error)]">*</span>
                </label>
                <textarea
                    id="message"
                    rows={6}
                    placeholder="Your message..."
                    className={cn(
                        'w-full resize-none rounded-xl border border-[var(--border-color)] bg-[var(--bg)] px-4 py-3 text-sm text-[var(--fg)]',
                        'placeholder:text-[var(--fg-subtle)]',
                        'focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/50 focus:border-[var(--accent)]',
                        'transition-colors',
                        errors.message && 'border-[var(--error)] focus:ring-[var(--error)]/50 focus:border-[var(--error)]'
                    )}
                    {...register('message', {
                        required: 'Message is required',
                        minLength: {
                            value: 20,
                            message: 'Message must be at least 20 characters',
                        },
                    })}
                />
                {errors.message && (
                    <p className="text-xs text-[var(--error)]">
                        {errors.message.message}
                    </p>
                )}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={status === 'submitting'}
                className={cn(
                    'inline-flex items-center gap-2 px-8 py-3 rounded-full font-medium transition-all',
                    'bg-[var(--fg)] text-[var(--bg)]',
                    'hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed'
                )}
            >
                {status === 'submitting' ? (
                    <>
                        <Loader2 className="size-4 animate-spin" />
                        Sending...
                    </>
                ) : (
                    <>
                        <Send className="size-4" />
                        Send Message
                    </>
                )}
            </button>
        </form>
    );
};

export { ContactForm };
