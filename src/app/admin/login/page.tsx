'use client';

import { AlertCircle, Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useState, useTransition } from 'react';

import { SITE_CONFIG } from '@/constants/siteConstants';
import { cn } from '@/lib/utils';

/**
 * Admin Login Form Component
 *
 * Inner component that uses useSearchParams - wrapped in Suspense
 */
const LoginForm = (): React.ReactElement => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';
    const oauthError = searchParams.get('error');

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();
    const [isGooglePending, startGoogleTransition] = useTransition();

    const mappedOauthError =
        oauthError === 'AccessDenied'
            ? 'Access denied. This Google account is not authorized for admin access.'
            : oauthError
              ? 'Google sign-in failed. Please try again.'
              : '';
    const activeError = error || mappedOauthError;

    const handleGoogleSignIn = (): void => {
        setError('');
        startGoogleTransition(async () => {
            await signIn('google', { callbackUrl });
        });
    };

    const handleSubmit = async (e: React.FormEvent): Promise<void> => {
        e.preventDefault();
        setError('');

        startTransition(async () => {
            try {
                const result = await signIn('credentials', {
                    email,
                    password,
                    redirect: false,
                });

                if (result?.error) {
                    setError('Invalid email or password');
                } else {
                    router.push(callbackUrl);
                    router.refresh();
                }
            } catch {
                setError('Something went wrong. Please try again.');
            }
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
            <div className="w-full max-w-sm">
                {/* Logo */}
                <div className="mb-8 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-xl font-bold text-primary-foreground">
                        A
                    </div>
                    <h1 className="text-xl font-semibold">{SITE_CONFIG.name}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">Sign in to admin panel</p>
                </div>

                {/* Login Form */}
                <div className="rounded-xl border bg-card p-6 shadow-sm">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* Error Message */}
                        {activeError && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {activeError}
                            </div>
                        )}

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                                disabled={isPending || isGooglePending}
                                placeholder="admin@example.com"
                                className={cn(
                                    'h-10 w-full rounded-lg border bg-background px-3 text-sm',
                                    'placeholder:text-muted-foreground',
                                    'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                    'disabled:opacity-50 disabled:cursor-not-allowed'
                                )}
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label
                                htmlFor="password"
                                className="mb-1.5 block text-sm font-medium"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    id="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
                                    disabled={isPending || isGooglePending}
                                    placeholder="••••••••"
                                    className={cn(
                                        'h-10 w-full rounded-lg border bg-background px-3 pr-10 text-sm',
                                        'placeholder:text-muted-foreground',
                                        'focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary',
                                        'disabled:opacity-50 disabled:cursor-not-allowed'
                                    )}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                    tabIndex={-1}
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isPending || isGooglePending}
                            className={cn(
                                'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg',
                                'bg-primary text-sm font-medium text-primary-foreground',
                                'hover:bg-primary/90 transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <LogIn className="h-4 w-4" />
                                    Sign In
                                </>
                            )}
                        </button>

                        <div className="relative py-1">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={isPending || isGooglePending}
                            className={cn(
                                'inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg border bg-background text-sm font-medium',
                                'hover:bg-muted/60 transition-colors',
                                'disabled:opacity-50 disabled:cursor-not-allowed'
                            )}
                        >
                            {isGooglePending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Redirecting...
                                </>
                            ) : (
                                <>
                                    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                                        <path
                                            fill="#4285F4"
                                            d="M21.81 10.023h-9.18v3.955h5.272c-.227 1.271-.954 2.35-2.043 3.073v2.55h3.3c1.932-1.779 3.051-4.398 3.051-7.509 0-.691-.062-1.355-.18-2.069z"
                                        />
                                        <path
                                            fill="#34A853"
                                            d="M12.63 22c2.769 0 5.093-.918 6.79-2.482l-3.3-2.55c-.918.617-2.092.981-3.49.981-2.682 0-4.954-1.81-5.766-4.243H3.455v2.665A10.247 10.247 0 0012.63 22z"
                                        />
                                        <path
                                            fill="#FBBC05"
                                            d="M6.864 13.706a6.16 6.16 0 01-.323-1.957c0-.68.117-1.341.323-1.957V7.127H3.455A10.247 10.247 0 002.4 11.75c0 1.64.393 3.192 1.055 4.623l3.409-2.667z"
                                        />
                                        <path
                                            fill="#EA4335"
                                            d="M12.63 5.551c1.505 0 2.856.517 3.919 1.534l2.938-2.937C17.72 2.509 15.4 1.5 12.63 1.5a10.247 10.247 0 00-9.175 5.627l3.409 2.665c.812-2.433 3.084-4.241 5.766-4.241z"
                                        />
                                    </svg>
                                    Continue with Google
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer */}
                <p className="mt-6 text-center text-xs text-muted-foreground">
                    Protected admin area. Unauthorized access is prohibited.
                </p>
            </div>
        </div>
    );
};

/**
 * Admin Login Page
 *
 * Credentials-based login for admin access.
 * Wrapped in Suspense to handle useSearchParams() requirement.
 */
const AdminLoginPage = (): React.ReactElement => {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>Loading...</span>
                </div>
            </div>
        }>
            <LoginForm />
        </Suspense>
    );
};

export default AdminLoginPage;
