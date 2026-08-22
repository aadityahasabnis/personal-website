'use client';

import { AlertCircle, ArrowLeft, Loader2, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, type ReactElement } from 'react';

import { AdminAuthShell } from '@/components/admin/auth/AdminAuthShell';
import { ActionForm, type IFieldConfig } from '@/components/form';
import { Button } from '@/components/ui/button';
import { SITE_CONFIG } from '@/constants/siteConstants';
import { useActionQuery, useSnackbar } from '@/hooks';
import type { IFormData } from '@/interfaces/actionHelper';
import { resetPassword, verifyResetToken, type IResetPasswordResult, type IVerifyResetTokenInput, type IVerifyResetTokenResult } from '@/server/new/admin/auth';

interface IResetPasswordFormData extends IFormData {
    token: string;
    newPassword: string;
    confirmPassword: string;
}

export function AdminResetPasswordFlow(): ReactElement {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { showError, showSuccess } = useSnackbar();

    const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);

    const verifyResetTokenQuery = useActionQuery<IVerifyResetTokenResult, IVerifyResetTokenResult, [IVerifyResetTokenInput]>({
        queryKey: ['admin', 'auth', 'verify-reset-token', token],
        action: verifyResetToken,
        args: [{ token }],
        enabled: token.length > 0,
        retry: false,
        staleTime: 0,
    });

    const isTokenMissing = token.length === 0;
    const isTokenLoading = token.length > 0 && verifyResetTokenQuery.isLoading;
    const isTokenErrored = verifyResetTokenQuery.isError;
    const isTokenValid = verifyResetTokenQuery.data?.valid === true;

    const resetPasswordAction = async (input: IResetPasswordFormData) => {
        return resetPassword(input);
    };

    const resetFields = useMemo<Array<IFieldConfig<IResetPasswordFormData>>>(
        () => [
            {
                fieldtype: 'input',
                name: 'newPassword',
                label: 'New password',
                type: 'password',
                allowPasswordToggle: true,
                autoComplete: 'new-password',
                placeholder: 'Enter your new password',
                required: true,
                colsize: 'full',
                hint: 'Minimum 8 characters with uppercase, lowercase, and one number.',
            },
            {
                fieldtype: 'input',
                name: 'confirmPassword',
                label: 'Confirm password',
                type: 'password',
                allowPasswordToggle: true,
                autoComplete: 'new-password',
                placeholder: 'Re-enter your new password',
                required: true,
                colsize: 'full',
            },
        ],
        [],
    );

    if (isTokenMissing) {
        return (
            <AdminAuthShell eyebrow='Password recovery' title='Your reset link is incomplete.'>
                <div className='flex flex-col gap-5'>
                    <div className='flex items-start gap-3 p-4 text-regular text-destructive bg-destructive/10 border border-destructive/25 rounded-lg'>
                        <AlertCircle className='mt-0.5 size-5 shrink-0' />
                        <div className='flex flex-col gap-1'>
                            <h1 className='text-title font-semibold text-foreground'>Reset link is incomplete</h1>
                            <p className='text-small text-muted-foreground'>A reset token is required in the URL. Request a fresh password reset link and try again.</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-3'>
                        <Button asChild type='button' variant='outline'>
                            <Link href='/admin/forgot-password'>Request new link</Link>
                        </Button>
                        <Button asChild type='button' variant='ghost' className='gap-2'>
                            <Link href='/admin/login'>
                                <ArrowLeft className='size-4' />
                                Back to login
                            </Link>
                        </Button>
                    </div>
                </div>
            </AdminAuthShell>
        );
    }

    if (isTokenLoading) {
        return (
            <AdminAuthShell eyebrow='Password recovery' title='Checking your reset link.'>
                <div className='flex items-center gap-3 p-4 text-body text-muted-foreground bg-muted/40 border border-border rounded-xl'>
                    <Loader2 className='size-5 animate-spin text-primary' />
                    <p>Verifying your reset link...</p>
                </div>
            </AdminAuthShell>
        );
    }

    if (isTokenErrored) {
        return (
            <AdminAuthShell eyebrow='Password recovery' title='We could not verify this link.'>
                <div className='flex flex-col gap-5'>
                    <div className='flex items-start gap-3 p-4 text-regular text-warning bg-warning/10 border border-warning/25 rounded-lg'>
                        <ShieldAlert className='mt-0.5 size-5 shrink-0' />
                        <div className='flex flex-col gap-1'>
                            <h1 className='text-title font-semibold text-foreground'>We could not verify this reset link</h1>
                            <p className='text-small text-muted-foreground'>{verifyResetTokenQuery.error?.message ?? 'Please retry or request a new reset email.'}</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-3'>
                        <Button type='button' variant='outline' onClick={() => void verifyResetTokenQuery.refetch()}>
                            Try again
                        </Button>
                        <Button asChild type='button' variant='ghost' className='gap-2'>
                            <Link href='/admin/forgot-password'>Request new link</Link>
                        </Button>
                    </div>
                </div>
            </AdminAuthShell>
        );
    }

    if (!isTokenValid) {
        return (
            <AdminAuthShell eyebrow='Password recovery' title='This link has expired.'>
                <div className='flex flex-col gap-5'>
                    <div className='flex items-start gap-3 p-4 text-regular text-warning bg-warning/10 border border-warning/25 rounded-lg'>
                        <ShieldAlert className='mt-0.5 size-5 shrink-0' />
                        <div className='flex flex-col gap-1'>
                            <h1 className='text-title font-semibold text-foreground'>This reset link is invalid or expired</h1>
                            <p className='text-small text-muted-foreground'>For security, reset links are single-use and expire quickly. Request a fresh link to continue.</p>
                        </div>
                    </div>
                    <div className='flex items-center justify-between gap-3'>
                        <Button asChild type='button' variant='outline'>
                            <Link href='/admin/forgot-password'>Request new link</Link>
                        </Button>
                        <Button asChild type='button' variant='ghost' className='gap-2'>
                            <Link href='/admin/login'>
                                <ArrowLeft className='size-4' />
                                Back to login
                            </Link>
                        </Button>
                    </div>
                </div>
            </AdminAuthShell>
        );
    }

    return (
        <AdminAuthShell eyebrow='Password recovery' title='Create a new password.'>
            <div className='flex flex-col gap-7'>
                <header className='flex flex-col gap-2'>
                    <h1 className='text-title font-semibold text-foreground'>Set a new password</h1>
                    <p className='text-regular text-muted-foreground'>
                        {verifyResetTokenQuery.data?.email ? `Resetting password for ${verifyResetTokenQuery.data.email}.` : 'Create a strong new password for your admin account.'}
                    </p>
                    <p className='text-small text-muted-foreground'>{SITE_CONFIG.name} admin security</p>
                </header>

                <div className='flex flex-col gap-4'>
                    <ActionForm<IResetPasswordFormData, IResetPasswordResult>
                        action={resetPasswordAction}
                        initialData={{ token, newPassword: '', confirmPassword: '' }}
                        fields={resetFields}
                        submitLabel='Update Password'
                        submittingLabel='Updating...'
                        cancelLabel='Clear'
                        className='gap-4 pb-0'
                        navigateBackRequired={false}
                        onSuccess={({ result }) => {
                            showSuccess('Password updated', result.message);
                            router.push('/admin');
                            router.refresh();
                        }}
                        onError={({ message }) => {
                            showError('Unable to reset password', message);
                        }}
                    />
                </div>

            </div>
        </AdminAuthShell>
    );
}

export default AdminResetPasswordFlow;
