'use client';

import { CustomInput } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import { NEWSLETTER_SECTION } from '@/constants/homeConstants';
import { useFormOperations } from '@/hooks/form/useFormOperations';
import { useAction } from '@/hooks/server/useAction';
import { subscribe, type ISubscribeInput, type ISubscriptionResult } from '@/server/new/public/subscribe';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NewsletterStatus = 'idle' | 'success' | 'error';

interface INewsletterFormData extends IFormData {
    email?: string;
}

const getEmailValue = (value: unknown): string => (typeof value === 'string' ? value : '');

export const NewsletterSection = () => {
    const [status, setStatus] = useState<NewsletterStatus>('idle');
    const [message, setMessage] = useState('');
    const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { formData, handleChange, resetForm } = useFormOperations<INewsletterFormData>({
        email: '',
    });

    const { mutateAsync, pending } = useAction<ISubscriptionResult, [ISubscribeInput]>({
        action: subscribe,
    });

    const clearFeedbackTimer = () => {
        if (!feedbackTimerRef.current) return;

        clearTimeout(feedbackTimerRef.current);
        feedbackTimerRef.current = null;
    };

    const queueFeedbackReset = () => {
        clearFeedbackTimer();
        feedbackTimerRef.current = setTimeout(() => {
            setStatus('idle');
            setMessage('');
        }, NEWSLETTER_SECTION.feedbackResetTimeoutMs);
    };

    useEffect(
        () => () => {
            clearFeedbackTimer();
        },
        [],
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (pending) return;

        const email = getEmailValue(formData.email).trim();
        if (!email) {
            setStatus('error');
            setMessage(NEWSLETTER_SECTION.feedback.emptyEmail);
            queueFeedbackReset();
            return;
        }

        try {
            const result = await mutateAsync({ email });

            if (result.success) {
                setStatus('success');
                setMessage(result.message || NEWSLETTER_SECTION.feedback.successFallback);
                resetForm();
            } else {
                setStatus('error');
                setMessage(result.error || NEWSLETTER_SECTION.feedback.errorFallback);
            }
        } catch {
            setStatus('error');
            setMessage(NEWSLETTER_SECTION.feedback.errorFallback);
        }

        queueFeedbackReset();
    };

    const emailValue = getEmailValue(formData.email);
    const isSubmitDisabled = pending || status === 'success';

    return (
        <section className='relative overflow-hidden py-24'>
            <div className='absolute inset-0 pointer-events-none bg-linear-to-b from-transparent via-violet-300/20 to-transparent dark:via-violet-700/10' />

            <div className='relative container-narrow'>
                <div className='relative overflow-hidden p-8 text-center rounded-3xl glass-card md:p-12'>
                    <div className='absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sphere-1) blur-3xl' />
                    <div className='absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--sphere-2) blur-3xl' />

                    <div className='relative z-10'>
                        <span className='mb-4 block text-label font-medium uppercase tracking-widest text-primary'>{NEWSLETTER_SECTION.label}</span>
                        <h2 className='mb-4 text-h1 font-semibold text-foreground'>{NEWSLETTER_SECTION.title}</h2>
                        <p className='mx-auto mb-8 max-w-lg text-body text-muted-foreground'>{NEWSLETTER_SECTION.description}</p>

                        <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
                            <div className='flex flex-col gap-3 sm:flex-row'>
                                <CustomInput<INewsletterFormData>
                                    name='email'
                                    type='email'
                                    value={emailValue}
                                    onChange={handleChange}
                                    placeholder={NEWSLETTER_SECTION.emailPlaceholder}
                                    required
                                    disabled={isSubmitDisabled}
                                    containerClassName='flex-1'
                                    inputClassName='px-4 h-12 text-foreground placeholder:text-muted-foreground bg-background border-border rounded-xl focus:ring-primary'
                                />
                                <motion.button
                                    type='submit'
                                    disabled={isSubmitDisabled}
                                    whileHover={{ scale: !isSubmitDisabled ? 1.02 : 1 }}
                                    whileTap={{ scale: !isSubmitDisabled ? 0.98 : 1 }}
                                    className='inline-flex items-center justify-center gap-2 whitespace-nowrap px-5 py-3 text-label font-medium btn-primary disabled:opacity-50'
                                >
                                    {pending ? (
                                        <Loader2 className='size-5 animate-spin' />
                                    ) : status === 'success' ? (
                                        <>
                                            <CheckCircle className='size-5' />
                                            {NEWSLETTER_SECTION.subscribedLabel}
                                        </>
                                    ) : (
                                        <>
                                            {NEWSLETTER_SECTION.submitLabel}
                                            <Send className='size-4' />
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {message && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`mt-4 text-small ${status === 'success' ? 'text-success' : 'text-destructive'}`}
                                    aria-live='polite'
                                >
                                    {message}
                                </motion.p>
                            )}
                        </form>

                        <p className='mt-6 text-small text-muted-foreground'>{NEWSLETTER_SECTION.subscribersLabel}</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
