'use client';

import { CustomInput } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import { useAction } from '@/hooks/useAction';
import { useFormOperations } from '@/hooks/useFormOperations';
import { subscribe, type ISubscribeInput, type ISubscriptionResult } from '@/server/new/public/subscribe';
import { motion } from 'framer-motion';
import { CheckCircle, Loader2, Send } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type NewsletterStatus = 'idle' | 'success' | 'error';

interface INewsletterFormData extends IFormData {
    email?: string;
}

const FEEDBACK_RESET_TIMEOUT_MS = 5000;

const getEmailValue = (value: unknown): string => (typeof value === 'string' ? value : '');

/**
 * Newsletter Section for homepage
 */
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
        }, FEEDBACK_RESET_TIMEOUT_MS);
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
            setMessage('Please enter a valid email address.');
            queueFeedbackReset();
            return;
        }

        try {
            const result = await mutateAsync({ email });

            if (result.success) {
                setStatus('success');
                setMessage(result.message || 'Thanks for subscribing!');
                resetForm();
            } else {
                setStatus('error');
                setMessage(result.error || 'Something went wrong. Please try again.');
            }
        } catch {
            setStatus('error');
            setMessage('Something went wrong. Please try again.');
        }

        queueFeedbackReset();
    };

    const emailValue = getEmailValue(formData.email);
    const isSubmitDisabled = pending || status === 'success';

    return (
        <section className='relative overflow-hidden py-24'>
            <div className='absolute inset-0 bg-linear-to-b from-transparent via-(--accent-subtle)/30 to-transparent pointer-events-none' />

            <div className='relative container-narrow'>
                <div className='relative overflow-hidden p-8 text-center glass-card rounded-3xl md:p-12'>
                    <div className='absolute top-0 right-0 h-64 w-64 translate-x-1/2 -translate-y-1/2 rounded-full bg-(--sphere-1) blur-3xl' />
                    <div className='absolute bottom-0 left-0 h-48 w-48 -translate-x-1/2 translate-y-1/2 rounded-full bg-(--sphere-2) blur-3xl' />

                    <div className='relative z-10'>
                        <span className='block mb-4 text-label font-medium text-(--accent)'>Newsletter</span>
                        <h2 className='mb-4 text-h1 font-semibold text-foreground'>Stay Updated</h2>
                        <p className='mx-auto mb-8 max-w-lg text-body text-muted-foreground'>
                            Get the latest articles, tutorials, and updates delivered straight to your inbox. No spam, unsubscribe anytime.
                        </p>

                        <form onSubmit={handleSubmit} className='mx-auto max-w-md'>
                            <div className='flex flex-col gap-3 sm:flex-row'>
                                <CustomInput<INewsletterFormData>
                                    name='email'
                                    type='email'
                                    value={emailValue}
                                    onChange={handleChange}
                                    placeholder='Enter your email'
                                    required
                                    disabled={isSubmitDisabled}
                                    containerClassName='flex-1'
                                    inputClassName='h-12 rounded-xl border-border bg-background px-4 text-foreground placeholder:text-muted-foreground focus:ring-primary'
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
                                            Subscribed!
                                        </>
                                    ) : (
                                        <>
                                            Subscribe
                                            <Send className='size-4' />
                                        </>
                                    )}
                                </motion.button>
                            </div>

                            {message && (
                                <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`mt-4 text-small ${status === 'success' ? 'text-success' : 'text-destructive'}`}>
                                    {message}
                                </motion.p>
                            )}
                        </form>

                        <p className='mt-6 text-small text-muted-foreground'>Join 500+ subscribers</p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default NewsletterSection;
