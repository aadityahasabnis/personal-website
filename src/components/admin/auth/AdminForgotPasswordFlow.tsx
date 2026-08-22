'use client';

import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { useMemo, useState, type ReactElement } from 'react';

import { AdminAuthShell } from '@/components/admin/auth/AdminAuthShell';
import { ActionForm, type IFieldConfig } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useSnackbar } from '@/hooks';
import type { IFormData } from '@/interfaces/actionHelper';
import { requestPasswordReset, type IRequestPasswordResetResult } from '@/server/new/admin/auth';

interface IForgotPasswordFormData extends IFormData {
    email: string;
}

const FORGOT_PASSWORD_FIELDS: Array<IFieldConfig<IForgotPasswordFormData>> = [
    {
        fieldtype: 'input',
        name: 'email',
        label: 'Admin email',
        type: 'email',
        placeholder: 'admin@example.com',
        autoComplete: 'email',
        required: true,
        colsize: 'full',
        hint: 'We always send reset instructions to the primary admin email for security.',
    },
];

export function AdminForgotPasswordFlow(): ReactElement {
    const { showError, showInfo, showSuccess } = useSnackbar();

    const [requestedEmail, setRequestedEmail] = useState('');

    const requestPasswordResetAction = async (input: IForgotPasswordFormData) => {
        return requestPasswordReset(input);
    };

    const requestedSummary = useMemo(() => {
        if (!requestedEmail) {
            return '';
        }

        const [local, domain] = requestedEmail.split('@');
        if (!local || !domain) {
            return requestedEmail;
        }

        return `${local.slice(0, 2)}***@${domain}`;
    }, [requestedEmail]);

    return (
        <AdminAuthShell
            eyebrow='Account recovery'
            title='Get back in securely.'
            footer={
                <div className='flex items-center justify-between gap-3 border-t border-border pt-4'>
                    <Button type='button' variant='ghost' size='sm' onClick={() => showInfo('Check spam and promotions folders if email delivery is delayed.')}>Need help?</Button>
                    <Button asChild type='button' variant='ghost' size='sm' className='gap-2'>
                        <Link href='/admin/login'>
                            <ArrowLeft className='size-4' />
                            Back to login
                        </Link>
                    </Button>
                </div>
            }
        >
            <div className='flex flex-col gap-7'>
                <header className='flex flex-col gap-2'>
                    <p className='text-label font-semibold uppercase tracking-[0.14em] text-primary'>Reset access</p>
                    <h2 className='text-h1 font-semibold text-foreground'>Forgot your password?</h2>
                    <p className='text-body leading-relaxed text-muted-foreground'>Enter your admin email. If an account exists, we will send a secure reset link.</p>
                </header>

                {requestedEmail ? (
                    <div className='flex items-start gap-3 p-4 text-body text-success bg-success/10 border border-success/25 rounded-xl'>
                        <CheckCircle2 className='mt-0.5 size-4 shrink-0' />
                        <div className='flex flex-col gap-1'>
                            <p className='font-medium'>Reset instructions sent</p>
                            <p className='text-small text-muted-foreground'>We sent a reset email to {requestedSummary || 'your inbox'} if the account is registered.</p>
                        </div>
                    </div>
                ) : null}

                <div className='flex flex-col gap-4'>
                    <ActionForm<IForgotPasswordFormData, IRequestPasswordResetResult>
                        action={requestPasswordResetAction}
                        initialData={{ email: '' }}
                        fields={FORGOT_PASSWORD_FIELDS}
                        submitLabel='Send Reset Link'
                        submittingLabel='Sending...'
                        cancelLabel='Clear'
                        className='gap-4 pb-0'
                        navigateBackRequired={false}
                        onSuccess={({ result, formData }) => {
                            setRequestedEmail(formData.email.trim().toLowerCase());
                            showSuccess('Request accepted', result.message);
                        }}
                        onError={({ message }) => {
                            showError('Unable to process request', message);
                        }}
                    />
                </div>

            </div>
        </AdminAuthShell>
    );
}

export default AdminForgotPasswordFlow;
