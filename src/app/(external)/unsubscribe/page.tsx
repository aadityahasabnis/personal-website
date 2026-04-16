'use client';

import { ActionForm, type IFieldConfig } from '@/components/form';
import type { IFormData } from '@/components/form/form';
import PageHeader from '@/components/layout/PageHeader';
import FadeIn from '@/components/motion/FadeIn';
import { siteStorage } from '@/lib/storage';
import { unsubscribe, type ISubscriptionResult } from '@/server/new/public/subscribe';
import { CheckCircle2, Mail, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

interface IUnsubscribeFormData extends IFormData {
    email: string;
}

const normalizeEmail = (value: string): string => value.trim().toLowerCase();

const unsubscribeFields: Array<IFieldConfig<IUnsubscribeFormData>> = [
    {
        fieldtype: 'input',
        name: 'email',
        label: 'Email Address',
        placeholder: 'you@example.com',
        type: 'email',
        inputType: 'email',
        autoComplete: 'email',
        required: true,
        colsize: 'full',
    },
];

const UnsubscribePage = () => {
    const searchParams = useSearchParams();
    const [prefilledEmail, setPrefilledEmail] = useState('');
    const [lastUnsubscribedEmail, setLastUnsubscribedEmail] = useState<string | null>(null);

    useEffect(() => {
        const frameId = window.requestAnimationFrame(() => {
            const queryEmail = normalizeEmail(searchParams.get('email') ?? '');
            const storedSubscribedEmail = normalizeEmail(siteStorage.getSubscribedEmail() ?? '');
            const storedProfileEmail = normalizeEmail(siteStorage.getProfile()?.email ?? '');
            const resolvedEmail = queryEmail || storedSubscribedEmail || storedProfileEmail;

            if (resolvedEmail) {
                setPrefilledEmail(resolvedEmail);
            }
        });

        return () => {
            window.cancelAnimationFrame(frameId);
        };
    }, [searchParams]);

    const formKey = prefilledEmail || 'unsubscribe-form';

    return (
        <main className='relative mx-auto flex w-full max-w-5xl flex-col px-6 py-20 lg:px-8 md:py-24'>
            <PageHeader label='Unsubscribe' title='Manage Your Newsletter Preferences' description='Enter the email you used for the newsletter and we will unsubscribe it immediately.' align='left' />

            <div className='grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px]'>
                <FadeIn direction='up' delay={0.05} duration={0.55} distance={18}>
                    <section className='relative flex flex-col gap-5 rounded-2xl border border-border bg-card p-6 shadow-glow-sm sm:p-8'>
                        <div className='flex items-start gap-3'>
                            <span className='flex size-10 items-center justify-center rounded-xl border border-border bg-background'>
                                <Mail className='size-5 text-primary' />
                            </span>
                            <div className='flex flex-col gap-1'>
                                <h1 className='text-h4 font-semibold text-foreground'>Unsubscribe by Email</h1>
                                <p className='text-regular text-muted-foreground'>This only needs your email address. No account login required.</p>
                            </div>
                        </div>

                        <ActionForm<IUnsubscribeFormData, ISubscriptionResult>
                            key={formKey}
                            action={unsubscribe}
                            initialData={{ email: prefilledEmail }}
                            fields={unsubscribeFields}
                            submitLabel='Unsubscribe'
                            cancelLabel='Clear'
                            className='gap-4 pb-0'
                            navigateBackRequired={false}
                            requireModification={false}
                            transformPayload={(formData) => ({
                                email: normalizeEmail(String(formData.email ?? '')),
                            })}
                            snackbar={{
                                loadingMessage: 'Unsubscribing...',
                                successMessage: 'You have been unsubscribed.',
                                errorMessage: 'Unable to unsubscribe right now. Please try again.',
                            }}
                            onSuccess={({ result }) => {
                                const normalized = normalizeEmail(result.email);
                                const profile = siteStorage.getProfile();
                                if (profile && normalizeEmail(profile.email) === normalized) {
                                    siteStorage.updateProfile({
                                        isSubscribed: false,
                                        subscribedEmail: '',
                                    });
                                }
                                setLastUnsubscribedEmail(normalized);
                            }}
                        />

                        {lastUnsubscribedEmail ? (
                            <div className='flex items-start gap-2 rounded-xl border border-success/30 bg-success/10 p-3'>
                                <CheckCircle2 className='mt-0.5 size-4 text-success' />
                                <p className='text-small text-foreground'>{lastUnsubscribedEmail} has been removed from newsletter updates.</p>
                            </div>
                        ) : null}
                    </section>
                </FadeIn>

                <aside className='flex flex-col gap-4'>
                    <FadeIn direction='up' delay={0.12} duration={0.55} distance={18}>
                        <section className='relative flex flex-col gap-3 rounded-xl border border-border bg-card p-5'>
                            <h2 className='text-h6 font-semibold text-foreground'>Need updates again?</h2>
                            <p className='text-small text-muted-foreground'>You can subscribe anytime from the homepage newsletter section.</p>
                            <Link href='/' className='text-small font-medium text-primary transition-fast hover:text-primary/80'>
                                Back to homepage
                            </Link>
                        </section>
                    </FadeIn>

                    <FadeIn direction='up' delay={0.2} duration={0.55} distance={18}>
                        <section className='relative flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/5 p-5'>
                            <div className='flex items-center gap-2'>
                                <ShieldCheck className='size-4 text-primary' />
                                <h2 className='text-h6 font-semibold text-foreground'>Privacy first</h2>
                            </div>
                            <p className='text-small leading-relaxed text-muted-foreground'>
                                We do not expose subscription status details. Requests are handled safely for both existing and unknown emails.
                            </p>
                        </section>
                    </FadeIn>
                </aside>
            </div>
        </main>
    );
};

export default UnsubscribePage;
