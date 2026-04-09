'use client';

import { NEWSLETTER_SECTION } from '@/constants/homeConstants';
import { useSnackbar } from '@/hooks/form/useSnackbar';
import { useAction } from '@/hooks/server/useAction';
import { siteStorage } from '@/lib/storage';
import { subscribe, type ISubscribeInput, type ISubscriptionResult } from '@/server/new/public/subscribe';
import { CheckCircle, Loader2, Mail } from 'lucide-react';
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
    return (
        <form onSubmit={onSubmit} className={className}>
            <div className='flex items-stretch overflow-hidden bg-background border border-border rounded-xl shadow-sm'>
                <input
                    type='email'
                    value={value}
                    onChange={(event) => onChange(event.target.value)}
                    placeholder={placeholder}
                    required
                    disabled={inputDisabled}
                    aria-label={NEWSLETTER_SECTION.emailLabel}
                    className='flex-1 px-4 py-3 text-body text-foreground bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-60 rounded-l-xl'
                />
                <button
                    type='submit'
                    disabled={submitDisabled}
                    className='flex items-center justify-center gap-2 px-5 text-label font-medium text-primary-foreground bg-primary border-l border-primary transition-base hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60 rounded-r-xl'
                >
                    {pending ? <Loader2 className='size-4 animate-spin' /> : isSubmitted ? <CheckCircle className='size-4' /> : <Mail className='size-4' />}
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
            <section className={`relative ${className ?? ''}`}>
                <div className='relative p-4 bg-card border border-border rounded-xl shadow-sm md:p-5'>
                    <div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between'>
                        <p className='text-small text-muted-foreground'>{NEWSLETTER_SECTION.inlineDescription}</p>

                        <NewsletterSubscribeField
                            value={formData.email}
                            onChange={(email) => {
                                setFormData({ email });
                            }}
                            onSubmit={handleSubmit}
                            inputDisabled={isInputDisabled}
                            submitDisabled={isSubmitDisabled}
                            pending={pending}
                            isSubmitted={isSubmitted}
                            placeholder={NEWSLETTER_SECTION.emailPlaceholder}
                            submitLabel={NEWSLETTER_SECTION.inlineSubmitLabel}
                            subscribedLabel={NEWSLETTER_SECTION.inlineSubscribedLabel}
                            loadingLabel={NEWSLETTER_SECTION.loadingMessage}
                            className='w-full md:w-auto md:min-w-2xl'
                        />
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className={`flex flex-col gap-4 mx-auto px-6 lg:px-8 max-w-5xl ${className}`}>
            <div className='flex flex-col gap-4 overflow-hidden p-6 md:p-10 bg-card border border-border rounded-2xl shadow-sm backdrop-blur-sm'>
                <div className='flex flex-col gap-2 text-center'>
                    <h2 className='text-h1 font-semibold text-foreground'>{NEWSLETTER_SECTION.title}</h2>

                    <p className='hidden md:block mx-auto text-body text-muted-foreground'>{NEWSLETTER_SECTION.description}</p>
                </div>

                <NewsletterSubscribeField
                    value={formData.email}
                    onChange={(email) => {
                        setFormData({ email });
                    }}
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
            </div>
        </section>
    );
};

export default NewsletterSection;
