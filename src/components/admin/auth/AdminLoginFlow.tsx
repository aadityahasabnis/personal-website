'use client';

import { CheckCircle2, Loader2, LogIn, RefreshCcw, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition, type ReactElement } from 'react';

import { AdminAuthShell } from '@/components/admin/auth/AdminAuthShell';
import { ActionForm, type IFieldConfig, type ISelectOption } from '@/components/form';
import { Button } from '@/components/ui/button';
import { useAction, useDialog, useSnackbar, useStepper } from '@/hooks';
import type { IFormData } from '@/interfaces/actionHelper';
import { cn } from '@/lib/utils';
import type { IEmailOption, IRequestLoginOtpInput, IRequestLoginOtpResult, IVerifyCredentialsResult, IVerifyLoginOtpResult, OtpTargetEmail } from '@/server/new/admin/auth';
import { requestLoginOtp, verifyCredentials, verifyLoginOtp } from '@/server/new/admin/auth';

interface IAdminLoginFlowProps {
    googleEnabled: boolean;
}

interface ICredentialsFormData extends IFormData {
    email: string;
    password: string;
}

interface IRequestOtpFormData extends IFormData {
    pendingToken: string;
    targetEmail: OtpTargetEmail;
}

interface IVerifyOtpFormData extends IFormData {
    pendingToken: string;
    otp: string;
}

const LOGIN_STEPS = [
    { description: 'Credentials' },
    { description: 'OTP destination' },
    { description: 'Verify OTP' },
] as const;

const getSafeCallbackUrl = (rawCallbackUrl: string | null): string => {
    if (!rawCallbackUrl) {
        return '/admin';
    }

    return rawCallbackUrl.startsWith('/') ? rawCallbackUrl : '/admin';
};

export function AdminLoginFlow({ googleEnabled }: IAdminLoginFlowProps): ReactElement {
    const router = useRouter();
    const searchParams = useSearchParams();

    const { openConfirmation } = useDialog();
    const { showInfo, showSuccess, showWarning, triggerActionSnackbar } = useSnackbar();

    const callbackUrl = useMemo(() => getSafeCallbackUrl(searchParams.get('callbackUrl')), [searchParams]);
    const stepper = useStepper({ totalSteps: LOGIN_STEPS.length });
    const [pendingToken, setPendingToken] = useState('');
    const [emailOptions, setEmailOptions] = useState<IEmailOption[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<OtpTargetEmail>('main');
    const [otpSentTo, setOtpSentTo] = useState('');
    const [isGooglePending, startGoogleTransition] = useTransition();

    const { mutateAsync: resendOtp, pending: isResendingOtp } = useAction<IRequestLoginOtpResult, [IRequestLoginOtpInput]>({
        action: requestLoginOtp,
    });

    const verifyCredentialsAction = async (input: ICredentialsFormData) => {
        return verifyCredentials(input);
    };

    const requestLoginOtpAction = async (input: IRequestOtpFormData) => {
        return requestLoginOtp(input);
    };

    const verifyLoginOtpAction = async (input: IVerifyOtpFormData) => {
        return verifyLoginOtp(input);
    };

    const emailTargetOptions = useMemo<Array<ISelectOption<OtpTargetEmail>>>(() => {
        if (emailOptions.length === 0) {
            return [{ label: 'Primary email', value: 'main' }];
        }

        return emailOptions.map((option) => ({
            label: option.type === 'main' ? 'Primary email' : 'Recovery email',
            value: option.type,
            description: option.maskedEmail,
        }));
    }, [emailOptions]);

    const credentialsFields = useMemo<Array<IFieldConfig<ICredentialsFormData>>>(
        () => [
            {
                fieldtype: 'input',
                name: 'email',
                label: 'Admin email',
                type: 'email',
                placeholder: 'admin@gmail.com',
                autoComplete: 'email',
                required: true,
                colsize: 'full',
                hint: 'Enter the primary email of your admin account.',
            },
            {
                fieldtype: 'input',
                name: 'password',
                label: 'Password',
                type: 'password',
                allowPasswordToggle: true,
                placeholder: 'Enter your password',
                autoComplete: 'current-password',
                required: true,
                colsize: 'full',
                supplementaryLink: {
                    href: '/admin/forgot-password',
                    text: 'Forgot password?',
                    target: '_self',
                },
            },
        ],
        [],
    );

    const otpTargetFields = useMemo<Array<IFieldConfig<IRequestOtpFormData>>>(
        () => [
            {
                fieldtype: 'select',
                name: 'targetEmail',
                label: 'Send verification code to',
                options: emailTargetOptions,
                required: true,
                colsize: 'full',
                hint: 'Pick where we should deliver your one-time login code.',
            },
        ],
        [emailTargetOptions],
    );

    const resetLoginFlow = (): void => {
        stepper.reset();
        setPendingToken('');
        setEmailOptions([]);
        setSelectedTarget('main');
        setOtpSentTo('');
    };

    const askRestartFlow = (): void => {
        if (stepper.currentStep === 0) {
            return;
        }

        openConfirmation({
            title: 'Restart login flow?',
            description: 'This clears your pending OTP session and starts again from credentials.',
            message: 'Use restart if your OTP expired or you want to switch accounts.',
            tone: 'warning',
            confirmLabel: 'Change account',
            cancelLabel: 'Continue',
            onConfirm: () => {
                resetLoginFlow();
                showInfo('Login flow restarted');
            },
        });
    };

    const handleGoogleSignIn = (): void => {
        startGoogleTransition(async () => {
            showInfo('Redirecting to Google sign-in...');
            await signIn('google', { callbackUrl });
        });
    };

    const handleResendOtp = async (): Promise<void> => {
        if (!pendingToken) {
            showWarning('OTP session missing', 'Please verify your credentials again.');
            resetLoginFlow();
            return;
        }

        const response = await triggerActionSnackbar(resendOtp({ pendingToken, targetEmail: selectedTarget }), {
            loadingMessage: 'Sending a fresh verification code...',
            successMessage: 'A new verification code has been sent.',
            errorMessage: 'Failed to resend verification code.',
        });

        if (!response.success) {
            if (response.status === 401) {
                resetLoginFlow();
                showWarning('Session expired', 'Please verify credentials again.');
            }
            return;
        }

        setOtpSentTo(response.data.sentTo);
    };

    return (
        <AdminAuthShell
            eyebrow='Administrator portal'
            title='Welcome back.'
            footer={
                <div className='flex items-center justify-between gap-3 border-t border-border pt-4'>
                    {stepper.currentStep > 0 ? (
                        <Button type='button' variant='ghost' size='sm' onClick={resetLoginFlow} className='gap-2'>
                            <RefreshCcw className='size-4' />
                            Change account
                        </Button>
                    ) : (
                        <span className='text-small text-muted-foreground'>Secure admin access only</span>
                    )}
                    <Button type='button' variant='ghost' size='sm' onClick={() => router.push('/')} className='gap-2'>
                        <LogIn className='size-4' />
                        Back to site
                    </Button>
                </div>
            }
        >
            <div className='flex flex-col gap-7'>
                <header className='flex flex-col gap-5'>
                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between gap-3'>
                            <span className='text-small text-muted-foreground'>
                                Step {stepper.currentStep + 1} of {stepper.totalSteps}
                            </span>
                        </div>
                    </div>

                    <div className='grid grid-cols-3 gap-2'>
                        {LOGIN_STEPS.map((step, index) => {
                            const isCompleted = index < stepper.currentStep;
                            const isActive = index === stepper.currentStep;

                            return (
                                <div key={step.description} className={cn('flex min-w-0 flex-col gap-2 border-t-2 pt-3 transition-base', isActive ? 'border-primary' : isCompleted ? 'border-success' : 'border-border')}>
                                    <span
                                        className={cn(
                                            'relative flex size-8 items-center justify-center text-small font-semibold rounded-full border transition-base',
                                            isCompleted ? 'text-primary-foreground bg-primary border-primary' : undefined,
                                            isActive ? 'text-primary bg-primary/10 border-primary' : undefined,
                                            !isCompleted && !isActive ? 'text-muted-foreground bg-background border-border' : undefined,
                                        )}
                                    >
                                        {isCompleted ? <CheckCircle2 className='size-4' /> : index + 1}
                                    </span>
                                    <div className='flex flex-col gap-0.5'>
                                        <span className='hidden truncate text-label text-muted-foreground sm:block'>{step.description}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </header>

                <div className='flex flex-col gap-5'>
                    {stepper.currentStep === 0 ? (
                        <>
                            <ActionForm<ICredentialsFormData, IVerifyCredentialsResult>
                                action={verifyCredentialsAction}
                                initialData={{ email: '', password: '' }}
                                fields={credentialsFields}
                                submitLabel='Verify Credentials'
                                submittingLabel='Verifying...'
                                cancelLabel='Clear'
                                snackbar={{ loadingMessage: 'Verifying...', successMessage: 'Credentials verified.', errorMessage: 'Invalid credentials.' }}
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                onSuccess={({ result }) => {
                                    setPendingToken(result.pendingToken);
                                    setEmailOptions(result.emailOptions);
                                    setSelectedTarget(result.emailOptions[0]?.type ?? 'main');
                                    stepper.nextStep();
                                }}
                            />

                            {googleEnabled ? (
                                <div className='flex flex-col gap-3'>
                                    <div className='flex items-center gap-2'>
                                        <span className='h-px w-full bg-border' />
                                        <span className='text-small text-muted-foreground'>or</span>
                                        <span className='h-px w-full bg-border' />
                                    </div>
                                    <Button type='button' variant='ghost' onClick={handleGoogleSignIn} disabled={isGooglePending} className='h-10 gap-2'>
                                        {isGooglePending ? <Loader2 className='size-4 animate-spin' /> : <ShieldCheck className='size-4' />}
                                        {isGooglePending ? 'Redirecting...' : 'Continue with Google'}
                                    </Button>
                                </div>
                            ) : null}
                        </>
                    ) : null}

                    {stepper.currentStep === 1 ? (
                        <>
                            <ActionForm<IRequestOtpFormData, IRequestLoginOtpResult>
                                action={requestLoginOtpAction}
                                initialData={{ pendingToken, targetEmail: selectedTarget }}
                                fields={otpTargetFields}
                                submitLabel='Send Verification Code'
                                submittingLabel='Sending...'
                                cancelLabel='Change account'
                                snackbar={{ loadingMessage: 'Sending code...', successMessage: 'Code sent.', errorMessage: 'Could not send the code.' }}
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                requireModification={false}
                                onSecondaryClick={askRestartFlow}
                                onSuccess={({ result, formData }) => {
                                    setSelectedTarget(formData.targetEmail);
                                    setOtpSentTo(result.sentTo);
                                    stepper.nextStep();
                                }}
                                onError={({ response }) => {
                                    if (response?.status === 401) {
                                        resetLoginFlow();
                                        showWarning('Session expired', 'Please verify credentials again.');
                                    }
                                }}
                            />
                        </>
                    ) : null}

                    {stepper.currentStep === 2 ? (
                        <>
                            <div className='flex flex-col gap-2'>
                                <div className='flex items-center justify-between gap-3'>
                                    <p className='text-small text-muted-foreground'>{otpSentTo ? `Sent to ${otpSentTo}` : 'Enter your 6-digit code'}</p>
                                    <div className='flex gap-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            void handleResendOtp();
                                        }}
                                        disabled={isResendingOtp}
                                        className='cursor-pointer gap-2'
                                    >
                                        {isResendingOtp ? <Loader2 className='size-4 animate-spin' /> : <RefreshCcw className='size-4' />}
                                        Resend code
                                    </Button>
                                    <Button type='button' variant='ghost' size='sm' onClick={askRestartFlow} className='cursor-pointer gap-2'>
                                        <RefreshCcw className='size-4' />
                                        Restart
                                    </Button>
                                    </div>
                                </div>
                            </div>

                            <ActionForm<IVerifyOtpFormData, IVerifyLoginOtpResult>
                                action={verifyLoginOtpAction}
                                initialData={{ pendingToken, otp: '' }}
                                fields={[{ fieldtype: 'otp', name: 'otp', label: 'One-time code', required: true, colsize: 'full', hint: 'Paste or enter all 6 digits.' }]}
                                submitLabel='Complete Login'
                                submittingLabel='Checking code...'
                                cancelLabel='Change account'
                                snackbar={{ loadingMessage: 'Checking code...', successMessage: 'Signed in.', errorMessage: 'The code could not be verified.' }}
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                onSecondaryClick={askRestartFlow}
                                onSuccess={({ result }) => {
                                    showSuccess('Welcome back', 'Admin login successful. Redirecting...');
                                    router.push(callbackUrl || result.redirectTo);
                                    router.refresh();
                                }}
                                onError={({ response }) => {
                                    if (response?.status === 401) {
                                        resetLoginFlow();
                                        showWarning('Session expired', 'Please verify credentials again.');
                                    }
                                }}
                            />
                        </>
                    ) : null}
                </div>

            </div>
        </AdminAuthShell>
    );
}

export default AdminLoginFlow;
