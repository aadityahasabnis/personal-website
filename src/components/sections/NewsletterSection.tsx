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
    name: string;
    email: string;
}

type NewsletterVariant = 'landing' | 'inline';

interface INewsletterSectionProps {
    variant?: NewsletterVariant;
    className?: string;
}

interface INewsletterSubscribeFieldProps {
    variant: NewsletterVariant;
    nameValue: string;
    emailValue: string;
    inputDisabled: boolean;
    submitDisabled: boolean;
    pending: boolean;
    isSubmitted: boolean;
    namePlaceholder: string;
    emailPlaceholder: string;
    nameLabel: string;
    emailLabel: string;
    submitLabel: string;
    subscribedLabel: string;
    loadingLabel: string;
    onNameChange: (value: string) => void;
    onEmailChange: (value: string) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    className?: string;
}

const NewsletterSubscribeField = ({
    variant,
    nameValue,
    emailValue,
    inputDisabled,
    submitDisabled,
    pending,
    isSubmitted,
    namePlaceholder,
    emailPlaceholder,
    nameLabel,
    emailLabel,
    submitLabel,
    subscribedLabel,
    loadingLabel,
    onNameChange,
    onEmailChange,
    onSubmit,
    className,
}: INewsletterSubscribeFieldProps): React.ReactElement => {
    const isInline = variant === 'inline';

    return (
        <form onSubmit={onSubmit} className={cn('w-full', className)}>
            <div
                className={cn(
                    'flex flex-col w-full gap-2',
                    isInline
                        ? 'sm:flex-row sm:items-stretch sm:gap-0 sm:overflow-hidden sm:bg-background sm:border sm:border-border sm:rounded-lg sm:shadow-sm'
                        : 'md:flex-row md:items-stretch md:gap-0 md:overflow-hidden md:bg-background md:border md:border-border md:rounded-lg md:shadow-sm',
                )}
            >
                <input
                    type='text'
                    name='name'
                    value={nameValue}
                    onChange={(event) => onNameChange(event.target.value)}
                    placeholder={namePlaceholder}
                    autoComplete='name'
                    required
                    maxLength={80}
                    disabled={inputDisabled}
                    aria-label={nameLabel}
                    className={cn(
                        'block w-full px-4 py-3 text-body text-foreground bg-background border border-border rounded-lg outline-none transition-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60',
                        isInline
                            ? 'sm:flex-[0.85] sm:bg-transparent sm:border-transparent sm:border-r sm:border-r-border sm:rounded-none sm:rounded-l-lg sm:focus:border-transparent sm:focus:ring-0'
                            : 'md:flex-[0.85] md:bg-transparent md:border-transparent md:border-r md:border-r-border md:rounded-none md:rounded-l-lg md:focus:border-transparent md:focus:ring-0',
                    )}
                />
                <input
                    type='email'
                    name='email'
                    value={emailValue}
                    onChange={(event) => onEmailChange(event.target.value)}
                    placeholder={emailPlaceholder}
                    autoComplete='email'
                    inputMode='email'
                    required
                    disabled={inputDisabled}
                    aria-label={emailLabel}
                    className={cn(
                        'block w-full px-4 py-3 text-body text-foreground bg-background border border-border rounded-lg outline-none transition-base placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:cursor-not-allowed disabled:opacity-60',
                        isInline
                            ? 'sm:flex-[1.45] sm:bg-transparent sm:border-transparent sm:rounded-none sm:focus:border-transparent sm:focus:ring-0'
                            : 'md:flex-[1.45] md:bg-transparent md:border-transparent md:rounded-none md:focus:border-transparent md:focus:ring-0',
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
    const [formData, setFormData] = useState<INewsletterFormData>({ name: '', email: '' });
    const { showWarning, triggerActionSnackbar } = useSnackbar();

    const { mutateAsync, pending } = useAction<ISubscriptionResult, [ISubscribeInput]>({
        action: subscribe,
    });

    const normalizedName = formData.name.trim().replace(/\s+/g, ' ');
    const normalizedEmail = formData.email.trim().toLowerCase();
    const isSubmitted = Boolean(subscribedEmail && normalizedEmail && subscribedEmail === normalizedEmail);
    const isInputDisabled = pending;
    const isSubmitDisabled = pending || isSubmitted || normalizedName.length === 0 || normalizedEmail.length === 0;

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            const storedSubscribedEmail = siteStorage.getSubscribedEmail();
            const storedProfile = siteStorage.getProfile();
            const storedCommentAuthor = siteStorage.getCommentAuthor();
            const storedProfileEmail = storedProfile?.email ?? '';
            const storedName = storedProfile?.name?.trim() || storedCommentAuthor?.name?.trim() || '';

            setSubscribedEmail(storedSubscribedEmail);
            setFormData((previous) => {
                return {
                    name: previous.name.trim().length > 0 ? previous.name : storedName,
                    email: previous.email.trim().length > 0 ? previous.email : (storedSubscribedEmail ?? storedProfileEmail),
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

        if (!normalizedName) {
            showWarning(NEWSLETTER_SECTION.feedback.emptyName);
            return;
        }

        const email = normalizedEmail;

        if (!email) {
            showWarning(NEWSLETTER_SECTION.feedback.emptyEmail);
            return;
        }

        if (siteStorage.isEmailSubscribed(email)) {
            showWarning(NEWSLETTER_SECTION.feedback.alreadySubscribed);
            return;
        }

        const subscriberName = normalizedName;

        const response = await triggerActionSnackbar(
            mutateAsync({
                email,
                name: subscriberName,
            }),
            {
                loadingMessage: NEWSLETTER_SECTION.loadingMessage,
                successMessage: NEWSLETTER_SECTION.successMessage,
                errorMessage: NEWSLETTER_SECTION.feedback.errorFallback,
            },
        );

        if (response.success) {
            const persistedEmail = siteStorage.setSubscription(email, subscriberName) ?? email;
            setSubscribedEmail(persistedEmail);
            setFormData({ name: subscriberName, email: persistedEmail });
        }
    };
    const isInline = variant === 'inline';

    if (isInline) {
        return (
            <section className={cn('relative w-full', className)}>
                <NewsletterSubscribeField
                    variant='inline'
                    nameValue={formData.name}
                    emailValue={formData.email}
                    onNameChange={(name) => setFormData((previous) => ({ ...previous, name }))}
                    onEmailChange={(email) => setFormData((previous) => ({ ...previous, email }))}
                    onSubmit={handleSubmit}
                    inputDisabled={isInputDisabled}
                    submitDisabled={isSubmitDisabled}
                    pending={pending}
                    isSubmitted={isSubmitted}
                    namePlaceholder={NEWSLETTER_SECTION.namePlaceholder}
                    emailPlaceholder={NEWSLETTER_SECTION.emailPlaceholder}
                    nameLabel={NEWSLETTER_SECTION.nameLabel}
                    emailLabel={NEWSLETTER_SECTION.emailLabel}
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
                        nameValue={formData.name}
                        emailValue={formData.email}
                        onNameChange={(name) => setFormData((previous) => ({ ...previous, name }))}
                        onEmailChange={(email) => setFormData((previous) => ({ ...previous, email }))}
                        onSubmit={handleSubmit}
                        inputDisabled={isInputDisabled}
                        submitDisabled={isSubmitDisabled}
                        pending={pending}
                        isSubmitted={isSubmitted}
                        namePlaceholder={NEWSLETTER_SECTION.namePlaceholder}
                        emailPlaceholder={NEWSLETTER_SECTION.emailPlaceholder}
                        nameLabel={NEWSLETTER_SECTION.nameLabel}
                        emailLabel={NEWSLETTER_SECTION.emailLabel}
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
