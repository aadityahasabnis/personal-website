'use client';

import { EmailLottie } from '@/components/lotties/Lotties';
import { NEWSLETTER_SECTION } from '@/constants/homeConstants';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { siteStorage } from '@/lib/storage';
import { cn } from '@/lib/utils';
import { subscribe, type ISubscribeInput, type ISubscriptionResult } from '@/server/new/public/subscribe';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// =============================================================
// Types
// =============================================================

interface INewsletterFormData {
    email: string;
}

type NewsletterVariant = 'landing' | 'inline';

interface INewsletterSectionProps {
    variant?: NewsletterVariant;
    className?: string;
}

interface INewsletterSubscribeFieldProps {
    variant: NewsletterVariant;
    value: string;
    inputDisabled: boolean;
    submitDisabled: boolean;
    pending: boolean;
    isSubmitted: boolean;
    placeholder: string;
    submitLabel: string;
    subscribedLabel: string;
    loadingLabel: string;
    onChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
}

const NewsletterSubscribeField = ({
    variant,
    value,
    inputDisabled,
    submitDisabled,
    pending,
    isSubmitted,
    placeholder,
    submitLabel,
    subscribedLabel,
    loadingLabel,
    onChange,
    onSubmit,
    className,
}: INewsletterSubscribeFieldProps): React.ReactElement => {
    const isInline = variant === 'inline';

    return (
        <form onSubmit={onSubmit} className={cn('w-full', className)}>
            <div
                className={cn(
                    'flex flex-col gap-2 w-full',
                    isInline
                        ? 'sm:flex-row sm:items-stretch sm:gap-0 sm:overflow-hidden sm:bg-background sm:border sm:border-border sm:rounded-lg sm:shadow-sm'
                        : 'md:flex-row md:items-stretch md:gap-0 md:overflow-hidden md:bg-background md:border md:border-border md:rounded-lg md:shadow-sm',
                )}
            >
                <input
                    type='email'
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    required
                    disabled={inputDisabled}
                    aria-label={NEWSLETTER_SECTION.emailLabel}
                    className={cn(
                        'block px-4 py-3 w-full text-body text-foreground bg-background border border-border rounded-lg outline-none transition-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60',
                        isInline
                            ? 'sm:flex-1 sm:bg-transparent sm:border-transparent sm:rounded-none sm:rounded-l-lg sm:focus:border-transparent sm:focus:ring-0'
                            : 'md:flex-1 md:bg-transparent md:border-transparent md:rounded-none md:rounded-l-lg md:focus:border-transparent md:focus:ring-0',
                    )}
                />
                <button
                    type='submit'
                    disabled={submitDisabled}
                    className={cn(
                        'flex items-center justify-center gap-1 px-3.5 py-2 w-full text-small font-medium text-primary-foreground bg-primary border border-primary rounded-lg transition-base hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60',
                        isInline
                            ? 'sm:w-auto sm:shrink-0 sm:border-l sm:border-primary sm:rounded-none sm:rounded-r-lg sm:ring-0'
                            : 'md:w-auto md:shrink-0 md:border-l md:border-primary md:rounded-none md:rounded-r-lg md:ring-0',
                    )}
                >
                    {pending ? <Loader2 className='size-3.5 animate-spin' /> : isSubmitted ? <CheckCircle className='size-3.5' /> : <Mail className='size-3.5' />}
                    <span>{pending ? loadingLabel : isSubmitted ? subscribedLabel : submitLabel}</span>
                </button>
            </div>
        </form>
    );
};

// =============================================================
// NewsletterSection Component
// =============================================================

export const NewsletterSection = ({ variant = 'landing', className }: INewsletterSectionProps) => {
    const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);
    const [formData, setFormData] = useState<INewsletterFormData>({ email: '' });
    const { showWarning, triggerActionSnackbar } = useSnackbar();

    const { mutateAsync, pending } = useAction<ISubscriptionResult, [ISubscribeInput]>({
        action: subscribe,
    });

    const normalizedEmail = formData.email.trim().toLowerCase();
    const isSubmitted = Boolean(subscribedEmail && normalizedEmail && subscribedEmail === normalizedEmail);
    const isInputDisabled = pending;
    const isSubmitDisabled = pending || isSubmitted || normalizedEmail.length === 0;

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            const storedSubscribedEmail = siteStorage.getSubscribedEmail();
            const storedProfileEmail = siteStorage.getProfile()?.email ?? '';

            setSubscribedEmail(storedSubscribedEmail);
            setFormData((previous) => {
                if (previous.email.trim().length > 0) {
                    return previous;
                }

                return {
                    email: storedSubscribedEmail ?? storedProfileEmail,
                };
            });
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, []);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (pending) return;

        const email = normalizedEmail;

        if (!email) {
            showWarning(NEWSLETTER_SECTION.feedback.emptyEmail);
            return;
        }

        if (siteStorage.isEmailSubscribed(email)) {
            showWarning(NEWSLETTER_SECTION.feedback.alreadySubscribed);
            return;
        }

        const response = await triggerActionSnackbar(
            mutateAsync({
                email,
            }),
            {
                loadingMessage: NEWSLETTER_SECTION.loadingMessage,
                successMessage: NEWSLETTER_SECTION.successMessage,
                errorMessage: NEWSLETTER_SECTION.feedback.errorFallback,
            },
        );

        if (response.success) {
            const persistedEmail = siteStorage.setSubscription(email) ?? email;
            setSubscribedEmail(persistedEmail);
            setFormData({ email: persistedEmail });
        }
    };
    const isInline = variant === 'inline';

    if (isInline) {
        return (
            <section className={cn('relative w-full', className)}>
                <NewsletterSubscribeField
                    variant='inline'
                    value={formData.email}
                    onChange={(email) => setFormData({ email })}
                    onSubmit={handleSubmit}
                    inputDisabled={isInputDisabled}
                    submitDisabled={isSubmitDisabled}
                    pending={pending}
                    isSubmitted={isSubmitted}
                    placeholder={NEWSLETTER_SECTION.emailPlaceholder}
                    submitLabel={NEWSLETTER_SECTION.inlineSubmitLabel}
                    subscribedLabel={NEWSLETTER_SECTION.inlineSubscribedLabel}
                    loadingLabel={NEWSLETTER_SECTION.loadingMessage}
                />
            </section>
        );
    }

    return (
        <section className={cn('relative mx-auto w-full max-w-5xl px-6 lg:px-8 py-12 md:py-20', className)}>
            <div className='flex flex-col md:flex-row gap-8 p-6 bg-card border border-border rounded-2xl overflow-hidden md:gap-10 md:p-8'>
                <div className='relative flex items-center justify-center md:w-1/4'>
                    <EmailLottie className='size-44 md:size-40 lg:size-56' />
                </div>

                <div className='relative flex flex-1 flex-col gap-4'>
                    <p className='text-label text-muted-foreground'>{NEWSLETTER_SECTION.label}</p>
                    <h2 className='text-h2 text-foreground'>{NEWSLETTER_SECTION.title}</h2>
                    <p className='text-body text-muted-foreground'>{NEWSLETTER_SECTION.description}</p>
                    <NewsletterSubscribeField
                        variant='landing'
                        value={formData.email}
                        onChange={(email) => setFormData({ email })}
                        onSubmit={handleSubmit}
                        inputDisabled={isInputDisabled}
                        submitDisabled={isSubmitDisabled}
                        pending={pending}
                        isSubmitted={isSubmitted}
                        placeholder={NEWSLETTER_SECTION.emailPlaceholder}
                        submitLabel={NEWSLETTER_SECTION.submitLabel}
                        subscribedLabel={NEWSLETTER_SECTION.subscribedLabel}
                        loadingLabel={NEWSLETTER_SECTION.loadingMessage}
                    />

                    {NEWSLETTER_SECTION.disclaimer && (
                        <p className='text-small leading-relaxed text-muted-foreground'>
                            {NEWSLETTER_SECTION.disclaimer.text1}
                            <Link href='/privacy' className='mx-1 text-foreground font-medium decoration-border transition-base hover:text-primary hover:decoration-primary'>
                                {NEWSLETTER_SECTION.disclaimer.privacyLink}
                            </Link>
                            {NEWSLETTER_SECTION.disclaimer.text2}
                            <Link href='/terms' className='mx-1 text-foreground font-medium decoration-border transition-base hover:text-primary hover:decoration-primary'>
                                {NEWSLETTER_SECTION.disclaimer.termsLink}
                            </Link>
                            {NEWSLETTER_SECTION.disclaimer.text3}
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
