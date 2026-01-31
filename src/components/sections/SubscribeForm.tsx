'use client';

import { useState, useTransition } from 'react';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { subscribe } from '@/server/actions/subscribe';

interface ISubscribeFormProps {
    variant?: 'default' | 'compact' | 'inline';
    className?: string;
    showName?: boolean;
    title?: string;
    description?: string;
}

type FormStatus = 'idle' | 'loading' | 'success' | 'error';

/**
 * Newsletter Subscribe Form Component
 *
 * Variants:
 * - default: Full form with title, description, name field
 * - compact: Just email and button, smaller
 * - inline: Single line email + button
 */
const SubscribeForm = ({
    variant = 'default',
    className,
    showName = false,
    title = 'Stay updated',
    description = 'Get notified when I publish new articles and notes.',
}: ISubscribeFormProps): React.ReactElement => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [message, setMessage] = useState('');
    const [isPending, startTransition] = useTransition();

    const handleSubmit = async (formData: FormData): Promise<void> => {
        startTransition(async () => {
            setStatus('loading');

            const result = await subscribe(formData);

            if (result.success) {
                setStatus('success');
                setMessage(result.message ?? 'Thanks for subscribing!');
            } else {
                setStatus('error');
                setMessage(result.error ?? 'Something went wrong');
            }
        });
    };

    // Success state
    if (status === 'success') {
        return (
            <div
                className={cn(
                    'rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-800 dark:bg-green-950',
                    className
                )}
            >
                <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                        {message}
                    </p>
                </div>
            </div>
        );
    }

    // Inline variant
    if (variant === 'inline') {
        return (
            <form action={handleSubmit} className={cn('flex gap-2', className)}>
                <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="email"
                        name="email"
                        placeholder="you@example.com"
                        required
                        disabled={isPending}
                        className={cn(
                            'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        'inline-flex h-10 items-center justify-center gap-2 rounded-lg',
                        'bg-primary px-4 text-sm font-medium text-primary-foreground',
                        'hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        'Subscribe'
                    )}
                </button>
                {status === 'error' && (
                    <p className="text-sm text-destructive">{message}</p>
                )}
            </form>
        );
    }

    // Compact variant
    if (variant === 'compact') {
        return (
            <form
                action={handleSubmit}
                className={cn('space-y-3', className)}
            >
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <input
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        required
                        disabled={isPending}
                        className={cn(
                            'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm',
                            'placeholder:text-muted-foreground',
                            'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                            'disabled:opacity-50 disabled:cursor-not-allowed'
                        )}
                    />
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg',
                        'bg-primary text-sm font-medium text-primary-foreground',
                        'hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Subscribing...
                        </>
                    ) : (
                        'Subscribe'
                    )}
                </button>
                {status === 'error' && (
                    <div className="flex items-center gap-2 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        {message}
                    </div>
                )}
            </form>
        );
    }

    // Default variant - full form
    return (
        <div
            className={cn(
                'rounded-xl border bg-card p-6',
                className
            )}
        >
            <div className="mb-4">
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>

            <form action={handleSubmit} className="space-y-4">
                {showName && (
                    <div>
                        <label
                            htmlFor="subscribe-name"
                            className="mb-1.5 block text-sm font-medium"
                        >
                            Name{' '}
                            <span className="text-muted-foreground">(optional)</span>
                        </label>
                        <input
                            type="text"
                            id="subscribe-name"
                            name="name"
                            placeholder="Your name"
                            disabled={isPending}
                            className={cn(
                                'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                                'placeholder:text-muted-foreground',
                                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        />
                    </div>
                )}

                <div>
                    <label
                        htmlFor="subscribe-email"
                        className="mb-1.5 block text-sm font-medium"
                    >
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <input
                            type="email"
                            id="subscribe-email"
                            name="email"
                            placeholder="you@example.com"
                            required
                            disabled={isPending}
                            className={cn(
                                'h-10 w-full rounded-lg border bg-background pl-9 pr-3 text-sm',
                                'placeholder:text-muted-foreground',
                                'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        />
                    </div>
                </div>

                {status === 'error' && (
                    <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isPending}
                    className={cn(
                        'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg',
                        'bg-primary text-sm font-medium text-primary-foreground',
                        'hover:bg-primary/90 transition-colors',
                        'disabled:opacity-50 disabled:cursor-not-allowed'
                    )}
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Subscribing...
                        </>
                    ) : (
                        <>
                            <Mail className="h-4 w-4" />
                            Subscribe to newsletter
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                    No spam. Unsubscribe anytime.
                </p>
            </form>
        </div>
    );
};

export default SubscribeForm;
