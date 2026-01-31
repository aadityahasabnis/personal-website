'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { LogIn, Loader2, AlertCircle, Eye, EyeOff } from 'lucide-react';

import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/constants';

/**
 * Admin Login Page
 *
 * Credentials-based login for admin access.
 */
const AdminLoginPage = (): React.ReactElement => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') ?? '/admin';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isPending, startTransition] = useTransition();

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
                        {error && (
                            <div className="flex items-center gap-2 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive">
                                <AlertCircle className="h-4 w-4 shrink-0" />
                                {error}
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
                                disabled={isPending}
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
                                    disabled={isPending}
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
                            disabled={isPending}
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

export default AdminLoginPage;
