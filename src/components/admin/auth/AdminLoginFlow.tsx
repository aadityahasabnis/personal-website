'use client';

import { AlertCircle, CheckCircle2, Loader2, LogIn, RefreshCcw, ShieldCheck } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useMemo, useState, useTransition, type ReactElement } from 'react';

import { ActionForm, type IFieldConfig, type ISelectOption } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { SITE_CONFIG } from '@/constants/siteConstants';
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
    { title: 'Credentials', description: 'Verify your admin account' },
    { title: 'Delivery', description: 'Choose the OTP destination' },
    { title: 'Verification', description: 'Enter your one-time code' },
] as const;

const getOAuthErrorMessage = (oauthError: string | null): string => {
    if (oauthError === 'AccessDenied') {
        return 'Access denied. This Google account is not authorized for admin access.';
    }

    if (oauthError) {
        return 'Google sign-in failed. Please try again.';
    }

    return '';
};

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
    const { showError, showInfo, showSuccess, showWarning, triggerActionSnackbar } = useSnackbar();

    const callbackUrl = useMemo(() => getSafeCallbackUrl(searchParams.get('callbackUrl')), [searchParams]);
    const mappedOAuthError = useMemo(() => getOAuthErrorMessage(searchParams.get('error')), [searchParams]);

    const stepper = useStepper({ totalSteps: LOGIN_STEPS.length });
    const [pendingToken, setPendingToken] = useState('');
    const [adminName, setAdminName] = useState('');
    const [emailOptions, setEmailOptions] = useState<IEmailOption[]>([]);
    const [selectedTarget, setSelectedTarget] = useState<OtpTargetEmail>('main');
    const [otpSentTo, setOtpSentTo] = useState('');
    const [inlineError, setInlineError] = useState('');
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

    const activeError = inlineError || (stepper.currentStep === 0 ? mappedOAuthError : '');
    const currentStepMeta = LOGIN_STEPS[stepper.currentStep] ?? LOGIN_STEPS[0];

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
                placeholder: 'admin@example.com',
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

    const otpVerificationFields = useMemo<Array<IFieldConfig<IVerifyOtpFormData>>>(
        () => [
            {
                fieldtype: 'input',
                name: 'otp',
                label: 'One-time code',
                inputType: 'number',
                placeholder: 'Enter 6-digit code',
                required: true,
                colsize: 'full',
                hint: otpSentTo ? `Code sent to ${otpSentTo}` : 'Use the 6-digit code from your email inbox.',
            },
        ],
        [otpSentTo],
    );

    const resetLoginFlow = (): void => {
        stepper.reset();
        setPendingToken('');
        setAdminName('');
        setEmailOptions([]);
        setSelectedTarget('main');
        setOtpSentTo('');
        setInlineError('');
    };

    const askRestartFlow = (): void => {
        if (stepper.currentStep === 0) {
            setInlineError('');
            return;
        }

        openConfirmation({
            title: 'Restart login flow?',
            description: 'This clears your pending OTP session and starts again from credentials.',
            message: 'Use restart if your OTP expired or you want to switch accounts.',
            tone: 'warning',
            confirmLabel: 'Restart',
            cancelLabel: 'Continue',
            onConfirm: () => {
                resetLoginFlow();
                showInfo('Login flow restarted');
            },
        });
    };

    const handleGoogleSignIn = (): void => {
        setInlineError('');
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
            setInlineError(response.error);

            if (response.status === 401) {
                resetLoginFlow();
                showWarning('Session expired', 'Please verify credentials again.');
            }
            return;
        }

        setInlineError('');
        setOtpSentTo(response.data.sentTo);
    };

    return (
        <div className='relative flex min-h-screen items-center justify-center px-4 py-8 bg-muted/30'>
            <section className='relative flex w-full max-w-xl flex-col gap-6 p-6 text-foreground bg-card border border-border rounded-2xl shadow-glow-sm sm:p-8' aria-label='Admin login'>
                <header className='flex flex-col gap-4'>
                    <div className='flex items-center justify-between gap-3'>
                        <div className='flex items-center gap-3'>
                            <span className='relative flex size-12 items-center justify-center text-title font-semibold text-primary-foreground bg-primary rounded-xl shadow-glow-sm'>
                                {SITE_CONFIG.name.charAt(0)}
                            </span>
                            <div className='flex flex-col gap-0.5'>
                                <h1 className='text-title font-semibold text-foreground'>{SITE_CONFIG.name}</h1>
                                <p className='text-small text-muted-foreground'>Professional admin authentication</p>
                            </div>
                        </div>
                        <Button type='button' size='sm' variant='ghost' onClick={askRestartFlow} className='gap-2'>
                            <RefreshCcw className='size-4' />
                            Restart
                        </Button>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <div className='flex items-center justify-between gap-3'>
                            <span className='text-label font-medium text-foreground'>{currentStepMeta.title}</span>
                            <span className='text-small text-muted-foreground'>
                                Step {stepper.currentStep + 1} of {stepper.totalSteps}
                            </span>
                        </div>
                        <Progress value={stepper.progress} className='h-1.5' />
                        <p className='text-small text-muted-foreground'>{currentStepMeta.description}</p>
                    </div>

                    <div className='flex items-center gap-2'>
                        {LOGIN_STEPS.map((step, index) => {
                            const isCompleted = index < stepper.currentStep;
                            const isActive = index === stepper.currentStep;

                            return (
                                <div key={step.title} className='flex flex-1 items-center gap-2'>
                                    <span
                                        className={cn(
                                            'relative flex size-7 items-center justify-center text-small font-medium rounded-full border transition-base',
                                            isCompleted ? 'text-primary-foreground bg-primary border-primary' : undefined,
                                            isActive ? 'text-primary bg-primary/10 border-primary' : undefined,
                                            !isCompleted && !isActive ? 'text-muted-foreground bg-background border-border' : undefined,
                                        )}
                                    >
                                        {isCompleted ? <CheckCircle2 className='size-4' /> : index + 1}
                                    </span>
                                    {index < LOGIN_STEPS.length - 1 ? <span className={cn('h-px w-full bg-border', isCompleted ? 'bg-primary/40' : undefined)} /> : null}
                                </div>
                            );
                        })}
                    </div>
                </header>

                {activeError ? (
                    <div className='flex items-center gap-2 p-3 text-regular text-destructive bg-destructive/10 border border-destructive/25 rounded-lg'>
                        <AlertCircle className='size-4 shrink-0' />
                        <span>{activeError}</span>
                    </div>
                ) : null}

                <div className='flex flex-col gap-4 p-4 bg-background/50 border border-border rounded-xl sm:p-5'>
                    {stepper.currentStep === 0 ? (
                        <>
                            <ActionForm<ICredentialsFormData, IVerifyCredentialsResult>
                                action={verifyCredentialsAction}
                                initialData={{ email: '', password: '' }}
                                fields={credentialsFields}
                                submitLabel='Verify Credentials'
                                cancelLabel='Clear'
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                onSuccess={({ result }) => {
                                    setInlineError('');
                                    setPendingToken(result.pendingToken);
                                    setEmailOptions(result.emailOptions);
                                    setAdminName(result.adminName);
                                    setSelectedTarget(result.emailOptions[0]?.type ?? 'main');
                                    stepper.nextStep();
                                    showSuccess('Credentials verified', 'Choose where you want the OTP code delivered.');
                                }}
                                onError={({ message }) => {
                                    setInlineError(message);
                                    showError('Credential verification failed', message);
                                }}
                            />

                            {googleEnabled ? (
                                <div className='flex flex-col gap-3'>
                                    <div className='flex items-center gap-2'>
                                        <span className='h-px w-full bg-border' />
                                        <span className='text-small text-muted-foreground'>or</span>
                                        <span className='h-px w-full bg-border' />
                                    </div>
                                    <Button type='button' variant='outline' onClick={handleGoogleSignIn} disabled={isGooglePending} className='h-10 gap-2'>
                                        {isGooglePending ? <Loader2 className='size-4 animate-spin' /> : <ShieldCheck className='size-4' />}
                                        {isGooglePending ? 'Redirecting...' : 'Continue with Google'}
                                    </Button>
                                </div>
                            ) : null}
                        </>
                    ) : null}

                    {stepper.currentStep === 1 ? (
                        <>
                            <div className='flex items-start gap-2'>
                                <ShieldCheck className='mt-0.5 size-4 text-primary shrink-0' />
                                <p className='text-regular text-muted-foreground'>{adminName ? `Hi ${adminName},` : 'Next step:'} choose your preferred delivery target for the login OTP.</p>
                            </div>
                            <ActionForm<IRequestOtpFormData, IRequestLoginOtpResult>
                                action={requestLoginOtpAction}
                                initialData={{ pendingToken, targetEmail: selectedTarget }}
                                fields={otpTargetFields}
                                submitLabel='Send Verification Code'
                                cancelLabel='Restart'
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                requireModification={false}
                                onSecondaryClick={askRestartFlow}
                                onSuccess={({ result, formData }) => {
                                    setInlineError('');
                                    setSelectedTarget(formData.targetEmail);
                                    setOtpSentTo(result.sentTo);
                                    stepper.nextStep();
                                    showSuccess('Verification code sent', `Check ${result.sentTo}.`);
                                }}
                                onError={({ message, response }) => {
                                    setInlineError(message);
                                    showError('Failed to send verification code', message);

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
                                <p className='text-regular text-muted-foreground'>
                                    Enter your OTP to finish sign-in.
                                    {otpSentTo ? ` We sent it to ${otpSentTo}.` : ''}
                                </p>
                                <div className='flex gap-2'>
                                    <Button
                                        type='button'
                                        variant='outline'
                                        size='sm'
                                        onClick={() => {
                                            void handleResendOtp();
                                        }}
                                        disabled={isResendingOtp}
                                        className='gap-2'
                                    >
                                        {isResendingOtp ? <Loader2 className='size-4 animate-spin' /> : <RefreshCcw className='size-4' />}
                                        Resend code
                                    </Button>
                                    <Button type='button' variant='ghost' size='sm' onClick={askRestartFlow} className='gap-2'>
                                        <RefreshCcw className='size-4' />
                                        Restart
                                    </Button>
                                </div>
                            </div>

                            <ActionForm<IVerifyOtpFormData, IVerifyLoginOtpResult>
                                action={verifyLoginOtpAction}
                                initialData={{ pendingToken, otp: '' }}
                                fields={otpVerificationFields}
                                submitLabel='Complete Login'
                                cancelLabel='Restart'
                                className='gap-4 pb-0'
                                navigateBackRequired={false}
                                onSecondaryClick={askRestartFlow}
                                onSuccess={({ result }) => {
                                    setInlineError('');
                                    showSuccess('Welcome back', 'Admin login successful. Redirecting...');
                                    router.push(callbackUrl || result.redirectTo);
                                    router.refresh();
                                }}
                                onError={({ message, response }) => {
                                    setInlineError(message);
                                    showError('OTP verification failed', message);

                                    if (response?.status === 401) {
                                        resetLoginFlow();
                                        showWarning('Session expired', 'Please verify credentials again.');
                                    }
                                }}
                            />
                        </>
                    ) : null}
                </div>

                <footer className='flex items-center justify-between gap-3'>
                    {stepper.currentStep > 0 ? (
                        <Button type='button' variant='ghost' size='sm' onClick={resetLoginFlow} className='gap-2'>
                            <RefreshCcw className='size-4' />
                            Start over
                        </Button>
                    ) : (
                        <span className='text-small text-muted-foreground'>Secure admin access only</span>
                    )}
                    <Button type='button' variant='ghost' size='sm' onClick={() => router.push('/')} className='gap-2'>
                        <LogIn className='size-4' />
                        Back to site
                    </Button>
                </footer>
            </section>
        </div>
    );
}

export default AdminLoginFlow;
